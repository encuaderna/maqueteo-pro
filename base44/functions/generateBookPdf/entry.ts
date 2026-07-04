import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { chapters, metadata, settings } = await req.json();

    if (!chapters || chapters.length === 0) {
      return Response.json({ error: 'No chapters provided' }, { status: 400 });
    }

    const pageSize = settings.pageSize || 'letter';
    const pageW = pageSize === 'a4' ? 210 : 215.9;
    const pageH = pageSize === 'a4' ? 297 : 279.4;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: pageSize === 'a4' ? 'a4' : 'letter',
    });

    const fontSize = settings.fontSize || 11;
    const lineSpacing = settings.lineSpacing || 1.5;
    const marginTop = (settings.margins?.top || 1) * 25.4;
    const marginBottom = (settings.margins?.bottom || 0.7) * 25.4;
    const marginSides = (settings.margins?.sides || 0.75) * 25.4;
    const indent = (settings.indent || 0.3) * 25.4;
    const paperColor = settings.paperColor || 'white';

    const textWidth = pageW - 2 * marginSides;
    const lineH = fontSize * 0.3528 * lineSpacing;
    let currentPage = 0;
    let y = marginTop;

    function applyPaperBg() {
      if (paperColor === 'cream') {
        doc.setFillColor(253, 245, 230);
        doc.rect(0, 0, pageW, pageH, 'F');
      }
    }

    function newPage() {
      doc.addPage();
      currentPage++;
      y = marginTop;
      applyPaperBg();
    }

    function ensureOddPage() {
      if (currentPage % 2 === 0) {
        newPage(); // add blank even page
      }
    }

    function addHeader(pageNum) {
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const isRight = pageNum % 2 !== 0;
      const headerText = isRight
        ? (metadata.title || '').toUpperCase()
        : (metadata.author || '').toUpperCase();
      const headerX = isRight ? pageW - marginSides : marginSides;
      doc.text(headerText, isRight ? headerX : marginSides, marginTop - 5, {
        align: isRight ? 'right' : 'left',
      });
    }

    function addPageNumber(pageNum) {
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(String(pageNum), pageW / 2, pageH - marginBottom / 2, { align: 'center' });
    }

    function writeText(text, options = {}) {
      const {
        font = 'times',
        style = 'normal',
        size = fontSize,
        align = 'justify',
        firstIndent = 0,
        color = [30, 30, 30],
        maxWidth = textWidth,
        centered = false,
      } = options;

      doc.setFont(font, style);
      doc.setFontSize(size);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(text, maxWidth - firstIndent);
      const lh = size * 0.3528 * lineSpacing;

      for (let i = 0; i < lines.length; i++) {
        if (y + lh > pageH - marginBottom) {
          newPage();
          const pageNum = currentPage + 1;
          addHeader(pageNum);
          addPageNumber(pageNum);
        }
        const xPos = centered
          ? pageW / 2
          : marginSides + (i === 0 ? firstIndent : 0);
        doc.text(lines[i], xPos, y, {
          align: centered ? 'center' : 'left',
          maxWidth: maxWidth - (i === 0 ? firstIndent : 0),
        });
        y += lh;
      }
    }

    function writeParagraphs(text, isChapterStart = false) {
      if (!text) return;
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].replace(/\s+/g, ' ').trim();

        // Scene separator
        if (para === '***' || para === '---' || para === '* * *') {
          y += lineH;
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text('✦  ✦  ✦', pageW / 2, y, { align: 'center' });
          y += lineH * 1.5;
          continue;
        }

        // Drop cap for chapter start
        if (isChapterStart && i === 0 && settings.showDropCap && para.length > 1) {
          doc.setFont('times', 'bold');
          doc.setFontSize(fontSize * 2.5);
          doc.setTextColor(30, 30, 30);
          const firstChar = para[0];
          doc.text(firstChar, marginSides, y + 2);
          const charW = doc.getTextWidth(firstChar) + 1.5;

          doc.setFont('times', 'normal');
          doc.setFontSize(fontSize);
          const restFirst = para.slice(1);
          const firstLines = doc.splitTextToSize(restFirst, textWidth - charW);
          const dropCapLines = Math.min(2, firstLines.length);

          for (let li = 0; li < dropCapLines; li++) {
            doc.text(firstLines[li], marginSides + charW, y);
            y += lineH;
          }
          for (let li = dropCapLines; li < firstLines.length; li++) {
            doc.text(firstLines[li], marginSides, y);
            y += lineH;
          }
          continue;
        }

        const indentVal = (i === 0 && isChapterStart) ? 0 : indent;
        writeText(para, { firstIndent: indentVal });
      }
    }

    // Apply background to first page
    applyPaperBg();

    // === 1. Courtesy page (blank) ===
    // First page is already added

    // === 2. Half title ===
    newPage();
    y = pageH * 0.4;
    writeText(metadata.title || 'Sin título', {
      size: fontSize + 6,
      centered: true,
      style: 'normal',
    });

    // === 3. Blank verso ===
    newPage();

    // === 4. Full title page ===
    newPage();
    y = pageH * 0.3;
    writeText(metadata.title || 'Sin título', {
      size: fontSize + 8,
      centered: true,
      style: 'normal',
    });
    y += 8;
    // Decorative line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(pageW / 2 - 15, y, pageW / 2 + 15, y);
    y += 8;
    writeText(metadata.author || 'Autor desconocido', {
      size: fontSize + 2,
      centered: true,
      style: 'italic',
      color: [100, 100, 100],
    });
    if (metadata.year) {
      y += 4;
      writeText(metadata.year, {
        size: fontSize - 1,
        centered: true,
        color: [150, 150, 150],
      });
    }

    // === 5. Interior title (metadata) ===
    if (settings.showMetadata) {
      newPage(); // blank verso
      ensureOddPage();
      newPage();
      y = marginTop + 20;

      const addMetaField = (label, value) => {
        if (!value) return;
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(label.toUpperCase(), marginSides, y);
        y += 4;
        writeText(value, { size: fontSize - 1.5, color: [60, 60, 60] });
        y += 4;
      };

      addMetaField('Fandom', metadata.fandom);
      addMetaField('Parejas', metadata.pairings);
      addMetaField('Resumen', metadata.summary);
      addMetaField('Advertencias', metadata.warnings);
      if (metadata.original_link) {
        addMetaField('Publicación original', metadata.original_link);
      }
    }

    // === 6. Table of Contents ===
    if (settings.showToc && chapters.length > 1) {
      ensureOddPage();
      newPage();
      y = marginTop + 15;
      writeText('ÍNDICE', {
        size: fontSize + 2,
        centered: true,
        color: [100, 100, 100],
        style: 'normal',
      });
      y += 10;

      for (const ch of chapters) {
        const label = `Capítulo ${ch.number}`;
        const title = ch.title ? `   ${ch.title}` : '';
        writeText(label + title, { size: fontSize - 0.5, color: [60, 60, 60] });
        y += 2;
      }
    }

    // === 7. Chapters ===
    for (const chapter of chapters) {
      ensureOddPage();
      newPage();

      // Chapter heading
      y = marginTop + 30;
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`CAPÍTULO ${chapter.number}`, pageW / 2, y, { align: 'center' });
      y += 6;

      if (chapter.title) {
        writeText(chapter.title, {
          size: fontSize + 3,
          centered: true,
          style: 'italic',
          color: [60, 60, 60],
        });
        y += 4;
      }

      // Decorative line under chapter heading
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(pageW / 2 - 12, y, pageW / 2 + 12, y);
      y += 10;

      // Chapter body
      writeParagraphs(chapter.content, true);

      // Author notes at end of chapter
      if (chapter.notes) {
        y += lineH * 2;
        if (settings.authorNotesStyle === 'A') {
          // Style A: Subtle
          doc.setDrawColor(200, 200, 200);
          doc.setLineDashPattern([1, 1], 0);
          doc.line(marginSides + 12, y, pageW - marginSides - 12, y);
          doc.setLineDashPattern([], 0);
          y += 6;
          writeText(chapter.notes, {
            size: fontSize - 1.5,
            style: 'italic',
            centered: true,
            color: [100, 100, 100],
            maxWidth: textWidth - 24,
          });
          y += 4;
          doc.setLineDashPattern([1, 1], 0);
          doc.line(marginSides + 12, y, pageW - marginSides - 12, y);
          doc.setLineDashPattern([], 0);
        } else {
          // Style B: Boxed
          const boxX = marginSides;
          const boxStartY = y;
          const savedY = y;
          y += 6;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          doc.text('Nota del autor:', boxX + 6, y);
          y += 5;

          writeText(chapter.notes, {
            size: fontSize - 2,
            color: [80, 80, 80],
            maxWidth: textWidth - 12,
          });

          y += 4;
          doc.setFillColor(240, 240, 240);
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.3);
          doc.line(boxX, boxStartY, pageW - marginSides, boxStartY);
          doc.line(boxX, y, pageW - marginSides, y);
        }
      }
    }

    // === 8. Final courtesy page ===
    if (currentPage % 2 === 0) newPage();
    newPage();

    // Pad to multiple of 4 pages for booklet printing
    while ((currentPage + 1) % 4 !== 0) {
      newPage();
    }

    // Add page numbers to body pages (skip front matter)
    const frontMatterPages = settings.showMetadata ? 7 : 5;
    const totalPages = doc.getNumberOfPages();

    for (let p = frontMatterPages + 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('times', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(String(p - frontMatterPages), pageW / 2, pageH - (marginBottom / 2), { align: 'center' });
    }

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${(metadata.title || 'libro').replace(/[^a-zA-Z0-9áéíóúñ\s]/g, '')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});