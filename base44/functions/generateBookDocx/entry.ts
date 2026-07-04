import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Helper: generate DOCX XML from chapters + metadata
function buildDocxXml(chapters, metadata, settings) {
  const fontSize = (settings.fontSize || 11) * 2; // half-points
  const lineSpacing = Math.round((settings.lineSpacing || 1.5) * 240); // twips
  const marginSides = Math.round((settings.margins?.sides || 0.75) * 1440);
  const marginTop = Math.round((settings.margins?.top || 1) * 1440);
  const marginBottom = Math.round((settings.margins?.bottom || 0.7) * 1440);

  const paragraphProps = `
    <w:pPr>
      <w:jc w:val="both"/>
      <w:spacing w:line="${lineSpacing}" w:lineRule="auto" w:before="0" w:after="120"/>
      <w:ind w:firstLine="720"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Garamond" w:hAnsi="Garamond" w:cs="Garamond"/>
      <w:sz w:val="${fontSize}"/>
      <w:szCs w:val="${fontSize}"/>
      <w:lang w:val="es-ES"/>
    </w:rPr>`;

  const headingProps = `
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="720" w:after="360" w:line="240" w:lineRule="auto"/>
    </w:pPr>
    <w:rPr>
      <w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/>
      <w:sz w:val="${fontSize + 8}"/>
      <w:szCs w:val="${fontSize + 8}"/>
      <w:b/>
    </w:rPr>`;

  const escape = (str) => (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  let body = '';

  // Title page
  body += `<w:p>${headingProps}<w:r><w:t>${escape(metadata.title || 'Sin título')}</w:t></w:r></w:p>`;
  if (metadata.author) {
    body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="240" w:after="240"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fontSize + 2}"/><w:i/></w:rPr><w:t>${escape(metadata.author)}</w:t></w:r></w:p>`;
  }

  // Metadata block
  if (settings.showMetadata !== false && (metadata.fandom || metadata.pairings || metadata.summary)) {
    body += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    if (metadata.fandom) body += `<w:p>${paragraphProps}<w:r><w:t>Fandom: ${escape(metadata.fandom)}</w:t></w:r></w:p>`;
    if (metadata.pairings) body += `<w:p>${paragraphProps}<w:r><w:t>Parejas: ${escape(metadata.pairings)}</w:t></w:r></w:p>`;
    if (metadata.warnings) body += `<w:p>${paragraphProps}<w:r><w:t>Advertencias: ${escape(metadata.warnings)}</w:t></w:r></w:p>`;
    if (metadata.summary) {
      body += `<w:p>${paragraphProps}<w:r><w:t xml:space="preserve">Resumen: ${escape(metadata.summary)}</w:t></w:r></w:p>`;
    }
    if (metadata.original_link) body += `<w:p>${paragraphProps}<w:r><w:t>Enlace: ${escape(metadata.original_link)}</w:t></w:r></w:p>`;
  }

  // Chapters
  for (const ch of chapters) {
    body += `<w:p><w:r><w:br w:type="page"/></w:r></w:p>`;
    const chTitle = `Capítulo ${ch.number}${ch.title ? ': ' + ch.title : ''}`;
    body += `<w:p>${headingProps}<w:r><w:t>${escape(chTitle)}</w:t></w:r></w:p>`;

    // Author notes before (if any)
    if (ch.notes) {
      body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fontSize - 2}"/><w:i/></w:rPr><w:t>Nota del autor</w:t></w:r></w:p>`;
      for (const noteLine of ch.notes.split('\n').filter(l => l.trim())) {
        body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="60"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Garamond" w:hAnsi="Garamond"/><w:sz w:val="${fontSize - 2}"/><w:i/></w:rPr><w:t xml:space="preserve">${escape(noteLine)}</w:t></w:r></w:p>`;
      }
      body += `<w:p><w:pPr><w:spacing w:after="240"/></w:pPr><w:r><w:t></w:t></w:r></w:p>`;
    }

    // Chapter content
    const paragraphs = ch.content.split('\n\n').filter(p => p.trim());
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      // Scene break
      if (/^[*✦~—\-]{1,5}$/.test(trimmed)) {
        body += `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="120"/></w:pPr><w:r><w:t>* * *</w:t></w:r></w:p>`;
        continue;
      }
      const lines = trimmed.split('\n').join(' ');
      body += `<w:p>${paragraphProps}<w:r><w:t xml:space="preserve">${escape(lines)}</w:t></w:r></w:p>`;
    }
  }

  const marginXml = `<w:pgMar w:top="${marginTop}" w:right="${marginSides}" w:bottom="${marginBottom}" w:left="${marginSides}" w:header="708" w:footer="708" w:gutter="0"/>`;
  const pageSize = settings.pageSize === 'a4'
    ? `<w:pgSz w:w="11906" w:h="16838"/>`
    : `<w:pgSz w:w="12240" w:h="15840"/>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${body}
    <w:sectPr>
      ${pageSize}
      ${marginXml}
    </w:sectPr>
  </w:body>
</w:document>`;
}

// Minimal ZIP builder (DOCX is a ZIP)
function uint8(str) {
  return new TextEncoder().encode(str);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function buildZip(files) {
  // files: [{name, data: Uint8Array}]
  const localHeaders = [];
  const centralDir = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = uint8(file.name);
    const crc = crc32(file.data);
    const size = file.data.length;
    const modTime = 0x0000;
    const modDate = 0x0000;

    // Local file header
    const lh = new Uint8Array(30 + nameBytes.length);
    const lhView = new DataView(lh.buffer);
    lhView.setUint32(0, 0x04034b50, true); // sig
    lhView.setUint16(4, 20, true); // version needed
    lhView.setUint16(6, 0, true); // flags
    lhView.setUint16(8, 0, true); // compression (stored)
    lhView.setUint16(10, modTime, true);
    lhView.setUint16(12, modDate, true);
    lhView.setUint32(14, crc, true);
    lhView.setUint32(18, size, true);
    lhView.setUint32(22, size, true);
    lhView.setUint16(26, nameBytes.length, true);
    lhView.setUint16(28, 0, true);
    lh.set(nameBytes, 30);

    localHeaders.push({ lh, data: file.data, nameBytes, crc, size, offset });
    offset += lh.length + size;

    // Central directory entry
    const cd = new Uint8Array(46 + nameBytes.length);
    const cdView = new DataView(cd.buffer);
    cdView.setUint32(0, 0x02014b50, true);
    cdView.setUint16(4, 20, true);
    cdView.setUint16(6, 20, true);
    cdView.setUint16(8, 0, true);
    cdView.setUint16(10, 0, true);
    cdView.setUint16(12, modTime, true);
    cdView.setUint16(14, modDate, true);
    cdView.setUint32(16, crc, true);
    cdView.setUint32(20, size, true);
    cdView.setUint32(24, size, true);
    cdView.setUint16(28, nameBytes.length, true);
    cdView.setUint16(30, 0, true);
    cdView.setUint16(32, 0, true);
    cdView.setUint16(34, 0, true);
    cdView.setUint16(36, 0, true);
    cdView.setUint32(38, 0, true);
    cdView.setUint32(42, localHeaders[localHeaders.length - 1].offset, true);
    cd.set(nameBytes, 46);
    centralDir.push(cd);
  }

  const cdOffset = offset;
  const cdSize = centralDir.reduce((s, c) => s + c.length, 0);

  // End of central directory
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, files.length, true);
  eocdView.setUint16(10, files.length, true);
  eocdView.setUint32(12, cdSize, true);
  eocdView.setUint32(16, cdOffset, true);
  eocdView.setUint16(20, 0, true);

  const parts = [];
  for (const { lh, data } of localHeaders) {
    parts.push(lh, data);
  }
  for (const cd of centralDir) parts.push(cd);
  parts.push(eocd);

  const total = parts.reduce((s, p) => s + p.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { result.set(p, pos); pos += p.length; }
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapters, metadata, settings } = await req.json();

    const documentXml = buildDocxXml(chapters || [], metadata || {}, settings || {});

    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

    const wordRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    const files = [
      { name: '[Content_Types].xml', data: uint8(contentTypesXml) },
      { name: '_rels/.rels', data: uint8(relsXml) },
      { name: 'word/_rels/document.xml.rels', data: uint8(wordRelsXml) },
      { name: 'word/document.xml', data: uint8(documentXml) },
    ];

    const docxBytes = buildZip(files);
    const filename = encodeURIComponent((metadata?.title || 'libro').replace(/[^a-z0-9áéíóúñ\s]/gi, ''));

    return new Response(docxBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}.docx"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});