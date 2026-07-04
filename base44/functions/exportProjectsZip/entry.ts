import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Minimal ZIP builder (no external deps needed — stores files uncompressed)
function toBytes(str) {
  return new TextEncoder().encode(str);
}

function u32le(n) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n, true);
  return b;
}
function u16le(n) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n, true);
  return b;
}

function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of data) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function buildZip(files) {
  // files: [{name: string, data: Uint8Array}]
  const localHeaders = [];
  const centralDirs = [];
  let offset = 0;

  for (const { name, data } of files) {
    const nameBytes = toBytes(name);
    const crc = crc32(data);
    const localHeader = new Uint8Array([
      0x50, 0x4b, 0x03, 0x04, // sig
      0x14, 0x00,             // version
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression (stored)
      0x00, 0x00, 0x00, 0x00, // mod time/date
      ...u32le(crc),
      ...u32le(data.length),
      ...u32le(data.length),
      ...u16le(nameBytes.length),
      0x00, 0x00,             // extra len
      ...nameBytes,
    ]);

    const centralDir = new Uint8Array([
      0x50, 0x4b, 0x01, 0x02, // sig
      0x14, 0x00,             // version made
      0x14, 0x00,             // version needed
      0x00, 0x00,             // flags
      0x00, 0x00,             // compression
      0x00, 0x00, 0x00, 0x00, // mod time/date
      ...u32le(crc),
      ...u32le(data.length),
      ...u32le(data.length),
      ...u16le(nameBytes.length),
      0x00, 0x00,             // extra len
      0x00, 0x00,             // comment len
      0x00, 0x00,             // disk start
      0x00, 0x00,             // internal attr
      0x00, 0x00, 0x00, 0x00, // external attr
      ...u32le(offset),
      ...nameBytes,
    ]);

    localHeaders.push(localHeader, data);
    centralDirs.push(centralDir);
    offset += localHeader.length + data.length;
  }

  const centralOffset = offset;
  const centralSize = centralDirs.reduce((s, b) => s + b.length, 0);
  const eocd = new Uint8Array([
    0x50, 0x4b, 0x05, 0x06,
    0x00, 0x00, 0x00, 0x00,
    ...u16le(files.length),
    ...u16le(files.length),
    ...u32le(centralSize),
    ...u32le(centralOffset),
    0x00, 0x00,
  ]);

  const all = [...localHeaders, ...centralDirs, eocd];
  const total = all.reduce((s, b) => s + b.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const b of all) { out.set(b, pos); pos += b.length; }
  return out;
}

// ─── Reuse PDF/DOCX generation logic via internal function invocation ───────

async function generateOnePdf(base44, project) {
  const s = project.settings || {};
  const { _text, ...cleanSettings } = s;
  const text = _text || "";

  // Parse chapters from text (same logic as frontend)
  const chapterRegex = /(?:^|\n)((?:Cap[íi]tulo|Chapter|Cap\.?)\s+\d+[^\n]*)/gi;
  const chapters = [];
  let lastIndex = 0;
  let match;
  const matches = [...text.matchAll(chapterRegex)];
  if (matches.length === 0) {
    chapters.push({ number: 1, title: project.title || "Capítulo 1", content: text, notes: "" });
  } else {
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const nextStart = matches[i + 1]?.index ?? text.length;
      const body = text.slice(m.index + m[0].length, nextStart).trim();
      chapters.push({ number: i + 1, title: m[1].trim(), content: body, notes: "" });
    }
  }

  const metadata = {
    title: project.title || "Sin título",
    author: project.author || "",
    year: project.year || "",
    fandom: project.fandom || "",
    pairings: project.pairings || "",
    summary: project.summary || "",
    original_link: project.original_link || "",
    warnings: project.warnings || "",
  };

  const res = await base44.functions.invoke("generateBookPdf", { chapters, metadata, settings: cleanSettings });
  return res;
}

async function generateOneDocx(base44, project) {
  const s = project.settings || {};
  const { _text, ...cleanSettings } = s;
  const text = _text || "";

  const chapterRegex = /(?:^|\n)((?:Cap[íi]tulo|Chapter|Cap\.?)\s+\d+[^\n]*)/gi;
  const chapters = [];
  const matches = [...text.matchAll(chapterRegex)];
  if (matches.length === 0) {
    chapters.push({ number: 1, title: project.title || "Capítulo 1", content: text, notes: "" });
  } else {
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const nextStart = matches[i + 1]?.index ?? text.length;
      const body = text.slice(m.index + m[0].length, nextStart).trim();
      chapters.push({ number: i + 1, title: m[1].trim(), content: body, notes: "" });
    }
  }

  const metadata = {
    title: project.title || "Sin título",
    author: project.author || "",
    year: project.year || "",
    fandom: project.fandom || "",
    pairings: project.pairings || "",
    summary: project.summary || "",
    original_link: project.original_link || "",
    warnings: project.warnings || "",
  };

  const res = await base44.functions.invoke("generateBookDocx", { chapters, metadata, settings: cleanSettings });
  return res;
}

function sanitizeFilename(name) {
  return (name || "proyecto").replace(/[^a-zA-Z0-9_\-\.áéíóúÁÉÍÓÚñÑüÜ ]/g, "_").trim().slice(0, 60);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { projectIds, format } = await req.json();
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return Response.json({ error: "No project IDs provided" }, { status: 400 });
    }
    if (!["pdf", "docx"].includes(format)) {
      return Response.json({ error: "format must be 'pdf' or 'docx'" }, { status: 400 });
    }

    // Fetch only projects that belong to the authenticated user (prevents IDOR)
    const allProjects = await base44.asServiceRole.entities.FormattingProject.filter({
      id: { $in: projectIds },
      created_by_id: user.id,
    });

    const files = [];
    for (const project of allProjects) {
      const safeName = sanitizeFilename(project.title);
      let fileData;
      if (format === "pdf") {
        const res = await generateOnePdf(base44, project);
        // res is a Response — read its body as ArrayBuffer
        const buf = await res.arrayBuffer();
        fileData = new Uint8Array(buf);
        files.push({ name: `${safeName}.pdf`, data: fileData });
      } else {
        const res = await generateOneDocx(base44, project);
        const buf = await res.arrayBuffer();
        fileData = new Uint8Array(buf);
        files.push({ name: `${safeName}.docx`, data: fileData });
      }
    }

    const zip = buildZip(files);

    return new Response(zip, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="proyectos.zip"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});