import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function uint8(str) {
  return new TextEncoder().encode(str);
}

function crc32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
  const localHeaders = [];
  const centralDir = [];
  let offset = 0;
  for (const file of files) {
    const nameBytes = uint8(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;
    const lh = new Uint8Array(30 + nameBytes.length);
    const lhv = new DataView(lh.buffer);
    lhv.setUint32(0, 0x04034b50, true);
    lhv.setUint16(4, 20, true);
    lhv.setUint16(6, 0, true);
    lhv.setUint16(8, 0, true);
    lhv.setUint16(10, 0, true);
    lhv.setUint16(12, 0, true);
    lhv.setUint32(14, crc, true);
    lhv.setUint32(18, size, true);
    lhv.setUint32(22, size, true);
    lhv.setUint16(26, nameBytes.length, true);
    lhv.setUint16(28, 0, true);
    lh.set(nameBytes, 30);
    localHeaders.push({ lh, data: file.data, nameBytes, crc, size, offset });
    offset += lh.length + size;
    const cd = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cd.buffer);
    cdv.setUint32(0, 0x02014b50, true);
    cdv.setUint16(4, 20, true); cdv.setUint16(6, 20, true);
    cdv.setUint16(8, 0, true); cdv.setUint16(10, 0, true);
    cdv.setUint16(12, 0, true); cdv.setUint16(14, 0, true);
    cdv.setUint32(16, crc, true);
    cdv.setUint32(20, size, true); cdv.setUint32(24, size, true);
    cdv.setUint16(28, nameBytes.length, true);
    cdv.setUint16(30, 0, true); cdv.setUint16(32, 0, true);
    cdv.setUint16(34, 0, true); cdv.setUint16(36, 0, true);
    cdv.setUint32(38, 0, true);
    cdv.setUint32(42, localHeaders[localHeaders.length - 1].offset, true);
    cd.set(nameBytes, 46);
    centralDir.push(cd);
  }
  const cdOffset = offset;
  const cdSize = centralDir.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const eocdv = new DataView(eocd.buffer);
  eocdv.setUint32(0, 0x06054b50, true);
  eocdv.setUint16(4, 0, true); eocdv.setUint16(6, 0, true);
  eocdv.setUint16(8, files.length, true); eocdv.setUint16(10, files.length, true);
  eocdv.setUint32(12, cdSize, true); eocdv.setUint32(16, cdOffset, true);
  eocdv.setUint16(20, 0, true);
  const parts = [];
  for (const { lh, data } of localHeaders) parts.push(lh, data);
  for (const cd of centralDir) parts.push(cd);
  parts.push(eocd);
  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { result.set(p, pos); pos += p.length; }
  return result;
}

const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function buildDocx(chapters, metadata, settings) {
  const fs = (settings.fontSize || 11) * 2; // half-points for Word
  const ls = Math.round((settings.lineSpacing || 1.5) * 240); // twips
  const mSides = Math.round((settings.margins?.sides || 0.75) * 1440);
  const mTop = Math.round((settings.margins?.top || 1) * 1440);
  const mBottom = Math.round((settings.margins?.bottom || 0.7) * 1440);
  const indent = Math.round((settings.indent || 0.3) * 1440);
  const isCream = settings.paperColor === 'cream';
  const isA4 = settings.pageSize === 'a4';

  // Paragraph styles
  const bodyRpr = `<w:rFonts w:ascii="Garamond" w:hAnsi="Garamond" w:cs="Garamond"/><w:sz w:val="${fs}"/><w:szCs w:val="${fs}"/><w:lang w:val="es-ES"/>`;
  const bodyPpr = (firstLine = indent, jc = 'both', spaceBefore = 0, spaceAfter = 0) =>
    `<w:pPr><w:jc w:val="${jc}"/><w:spacing w:line="${ls}" w:lineRule="auto" w:before="${spaceBefore}" w:after="${spaceAfter}"/>${firstLine > 0 ? `<w:ind w:firstLine="${firstLine}"/>` : ''}</w:pPr>`;

  const p = (ppr, rpr, text, extraRpr = '') =>
    `<w:p>${ppr}<w:r><w:rPr>${rpr}${extraRpr}</w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;

  const pageBreak = () => `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;

  // Cream background shading for section (applied via document background — not per-paragraph in OOXML, but we set document background)
  // For cream paper we set document background color via settings
  const bgColor = isCream ? 'FDF5E6' : 'FFFFFF';

  // Running header paragraphs (alternate odd/even via Word header sections)
  // We use odd/even headers defined in styles
  const headerOdd = `<w:p><w:pPr><w:jc w:val="right"/><w:pStyle w:val="Header"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:t>${esc((metadata.title || '').toUpperCase())}</w:t></w:r></w:p>`;
  const headerEven = `<w:p><w:pPr><w:jc w:val="left"/><w:pStyle w:val="Header"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:t>${esc((metadata.author || '').toUpperCase())}</w:t></w:r></w:p>`;
  const footerCenter = `<w:p><w:pPr><w:jc w:val="center"/><w:pStyle w:val="Footer"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`;

  let body = '';

  // ── SECTION 1: Courtesy page (blank) ──
  body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;

  // ── SECTION 2: Half title ──
  body += pageBreak();
  body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="2880" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs + 6}"/><w:szCs w:val="${fs + 6}"/></w:rPr><w:t>${esc(metadata.title || 'Sin título')}</w:t></w:r></w:p>`;

  // ── SECTION 3: Blank verso ──
  body += pageBreak();
  body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;

  // ── SECTION 4: Full title page ──
  body += pageBreak();
  // Centered vertically with spacing
  body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="2160" w:after="240" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs + 12}"/><w:szCs w:val="${fs + 12}"/></w:rPr><w:t>${esc(metadata.title || 'Sin título')}</w:t></w:r></w:p>`;
  // Decorative separator line (paragraph border)
  body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
  if (metadata.author) {
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs + 2}"/><w:i/><w:color w:val="666666"/></w:rPr><w:t>${esc(metadata.author)}</w:t></w:r></w:p>`;
  }
  if (metadata.year) {
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="0"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 2}"/><w:color w:val="999999"/></w:rPr><w:t>${esc(metadata.year)}</w:t></w:r></w:p>`;
  }

  // ── SECTION 5: Interior title / AO3 Metadata ──
  if (settings.showMetadata !== false && (metadata.fandom || metadata.pairings || metadata.summary || metadata.warnings || metadata.original_link)) {
    body += pageBreak(); // blank verso
    body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
    body += pageBreak(); // metadata recto
    const metaLabel = (label) =>
      `<w:p><w:pPr><w:spacing w:before="180" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/><w:caps/></w:rPr><w:t>${esc(label)}</w:t></w:r></w:p>`;
    const metaValue = (val) =>
      `<w:p><w:pPr><w:spacing w:before="0" w:after="60"/></w:pPr><w:r><w:rPr>${bodyRpr}<w:color w:val="444444"/></w:rPr><w:t xml:space="preserve">${esc(val)}</w:t></w:r></w:p>`;
    if (metadata.fandom) { body += metaLabel('Fandom'); body += metaValue(metadata.fandom); }
    if (metadata.pairings) { body += metaLabel('Parejas'); body += metaValue(metadata.pairings); }
    if (metadata.warnings) { body += metaLabel('Advertencias'); body += metaValue(metadata.warnings); }
    if (metadata.summary) { body += metaLabel('Resumen'); body += metaValue(metadata.summary); }
    if (metadata.original_link) { body += metaLabel('Publicación original'); body += metaValue(metadata.original_link); }
  }

  // ── SECTION 6a: Table of Contents ──
  if (settings.showToc !== false && chapters.length > 1) {
    body += pageBreak();
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="720" w:after="480"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs}"/><w:color w:val="888888"/><w:caps/></w:rPr><w:t>Índice</w:t></w:r></w:p>`;
    for (const ch of chapters) {
      const label = `Capítulo ${ch.number}${ch.title ? `   ${ch.title}` : ''}`;
      body += `<w:p><w:pPr><w:spacing w:before="60" w:after="60"/></w:pPr><w:r><w:rPr>${bodyRpr}<w:color w:val="444444"/></w:rPr><w:t xml:space="preserve">${esc(label)}</w:t></w:r></w:p>`;
    }
  }

  // ── SECTION 6b: Chapters (content) ──
  for (const ch of chapters) {
    body += pageBreak();

    // Chapter label (small caps style)
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="1440" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 2}"/><w:color w:val="999999"/><w:caps/></w:rPr><w:t>Capítulo ${ch.number}</w:t></w:r></w:p>`;

    // Chapter title
    if (ch.title) {
      body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="120"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs + 4}"/><w:i/><w:color w:val="444444"/></w:rPr><w:t>${esc(ch.title)}</w:t></w:r></w:p>`;
    }

    // Thin decorative rule under heading
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="360"/><w:pBdr><w:bottom w:val="single" w:sz="2" w:space="1" w:color="DDDDDD"/></w:pBdr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;

    // Chapter body paragraphs
    const paragraphs = (ch.content || '').split(/\n\n+/).filter(para => para.trim());
    for (let i = 0; i < paragraphs.length; i++) {
      const trimmed = paragraphs[i].replace(/\s+/g, ' ').trim();
      if (!trimmed) continue;

      // Scene separator
      if (/^(\*{1,3}|---|\* \* \*|✦\s*✦\s*✦|—)$/.test(trimmed)) {
        body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:color w:val="AAAAAA"/></w:rPr><w:t>✦  ✦  ✦</w:t></w:r></w:p>`;
        continue;
      }

      // Drop cap for first paragraph of chapter (simulate with larger first letter)
      if (i === 0 && settings.showDropCap && trimmed.length > 1) {
        const dcMult = settings.dropCap?.sizeMultiplier || 3;
        const dcFont = settings.dropCap?.font || 'Garamond';
        const first = trimmed[0];
        const rest = trimmed.slice(1);
        body += `<w:p>${bodyPpr(0)}<w:r><w:rPr><w:rFonts w:ascii="${esc(dcFont)}" w:hAnsi="${esc(dcFont)}"/><w:sz w:val="${Math.round(fs * dcMult)}"/><w:szCs w:val="${Math.round(fs * dcMult)}"/></w:rPr><w:t xml:space="preserve">${esc(first)}</w:t></w:r><w:r><w:rPr>${bodyRpr}</w:rPr><w:t xml:space="preserve">${esc(rest)}</w:t></w:r></w:p>`;
        continue;
      }

      // Normal body paragraph (no indent on first paragraph of chapter)
      const firstLine = i === 0 ? 0 : indent;
      body += `<w:p>${bodyPpr(firstLine)}<w:r><w:rPr>${bodyRpr}</w:rPr><w:t xml:space="preserve">${esc(trimmed)}</w:t></w:r></w:p>`;
    }

    // Author notes at end of chapter
    if (ch.notes && ch.notes.trim()) {
      body += `<w:p><w:pPr><w:spacing w:before="480" w:after="120"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;

      if (settings.authorNotesStyle === 'B') {
        // Style B: boxed
        body += `<w:p><w:pPr><w:spacing w:before="120" w:after="60"/><w:pBdr><w:top w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 2}"/><w:b/><w:color w:val="444444"/></w:rPr><w:t>Nota del autor:</w:t></w:r></w:p>`;
        for (const noteLine of ch.notes.split('\n').filter(l => l.trim())) {
          body += `<w:p><w:pPr><w:spacing w:before="0" w:after="60"/><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F5F5F5"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 2}"/><w:color w:val="555555"/></w:rPr><w:t xml:space="preserve">${esc(noteLine)}</w:t></w:r></w:p>`;
        }
      } else {
        // Style A: subtle — centered italic with dotted border
        body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/><w:pBdr><w:top w:val="dotted" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
        for (const noteLine of ch.notes.split('\n').filter(l => l.trim())) {
          body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 2}"/><w:i/><w:color w:val="888888"/></w:rPr><w:t xml:space="preserve">${esc(noteLine)}</w:t></w:r></w:p>`;
        }
        body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/><w:pBdr><w:bottom w:val="dotted" w:sz="4" w:space="1" w:color="CCCCCC"/></w:pBdr></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
      }
    }
  }

  // ── Final courtesy page ──
  body += pageBreak();
  body += `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;

  const pgSz = isA4
    ? `<w:pgSz w:w="11906" w:h="16838"/>`
    : `<w:pgSz w:w="12240" w:h="15840"/>`;

  const sectPr = `
    <w:sectPr>
      ${pgSz}
      <w:pgMar w:top="${mTop}" w:right="${mSides}" w:bottom="${mBottom}" w:left="${mSides}" w:header="708" w:footer="708" w:gutter="0"/>
      <w:titlePg/>
      <w:headerReference w:type="odd" r:id="rId2"/>
      <w:headerReference w:type="even" r:id="rId3"/>
      <w:footerReference w:type="default" r:id="rId4"/>
    </w:sectPr>`;

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:background w:color="${bgColor}"/>
  <w:body>
    ${body}
    ${sectPr}
  </w:body>
</w:document>`;

  const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:evenAndOddHeaders/>
  <w:displayBackgroundShape/>
</w:settings>`;

  const headerOddXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:t>${esc((metadata.title || '').toUpperCase())}</w:t></w:r></w:p>
</w:hdr>`;

  const headerEvenXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:t>${esc((metadata.author || '').toUpperCase())}</w:t></w:r></w:p>
</w:hdr>`;

  const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fs - 4}"/><w:color w:val="999999"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>
</w:ftr>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/header2.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header2.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;

  return buildZip([
    { name: '[Content_Types].xml', data: uint8(contentTypesXml) },
    { name: '_rels/.rels', data: uint8(relsXml) },
    { name: 'word/_rels/document.xml.rels', data: uint8(wordRelsXml) },
    { name: 'word/document.xml', data: uint8(documentXml) },
    { name: 'word/settings.xml', data: uint8(settingsXml) },
    { name: 'word/header1.xml', data: uint8(headerOddXml) },
    { name: 'word/header2.xml', data: uint8(headerEvenXml) },
    { name: 'word/footer1.xml', data: uint8(footerXml) },
  ]);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapters, metadata, settings } = await req.json();
    const docxBytes = buildDocx(chapters || [], metadata || {}, settings || {});
    const filename = (metadata?.title || 'libro').replace(/[^a-z0-9áéíóúñ\s]/gi, '').trim() || 'libro';

    return new Response(docxBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}.docx`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});