// Typography utilities for novel formatting

export const DEFAULT_SETTINGS = {
  fontSize: 11,
  margins: { top: 1, bottom: 0.7, sides: 0.75 },
  lineSpacing: 1.5,
  indent: 0.3,
  showToc: true,
  showMetadata: true,
  showDropCap: true,
  dropCap: {
    font: 'Garamond', // 'Garamond', 'Georgia', 'serif'
    sizeMultiplier: 3, // 2, 3, 4 — multiplier over body font
    linesHigh: 2, // how many lines the cap spans visually
  },
  authorNotesStyle: 'A', // 'A' = subtle, 'B' = boxed
  sceneSeparator: 'fleuron', // 'fleuron', 'ornament', 'stars', 'line', 'custom'
  customSeparatorUrl: null,
  pageSize: 'letter', // 'letter' or 'a4'
  paperColor: 'white', // 'white' or 'cream'
};

// Convert straight quotes to curly quotes
export function fixQuotes(text) {
  // Double quotes
  text = text.replace(/"(\S)/g, '\u201C$1'); // opening "
  text = text.replace(/(\S)"/g, '$1\u201D'); // closing "
  text = text.replace(/"/g, '\u201D'); // remaining closing
  // Single quotes / apostrophes
  text = text.replace(/'(\S)/g, '\u2018$1'); // opening '
  text = text.replace(/(\S)'/g, '$1\u2019'); // closing / apostrophe
  text = text.replace(/'/g, '\u2019'); // remaining
  return text;
}

// Convert dashes to em dashes
export function fixDashes(text) {
  // Double hyphen to em dash
  text = text.replace(/--/g, '\u2014');
  // Spaced en dash to em dash
  text = text.replace(/ – /g, ' \u2014 ');
  return text;
}

// Clean up whitespace
export function cleanWhitespace(text) {
  // Remove double spaces
  text = text.replace(/ {2,}/g, ' ');
  // Remove more than 2 consecutive newlines
  text = text.replace(/\n{3,}/g, '\n\n');
  // Trim lines
  text = text.split('\n').map(l => l.trim()).join('\n');
  return text;
}

// Remove AO3-specific artifacts from pasted text
export function removeAO3Artifacts(text) {
  const lines = text.split('\n');
  const filtered = lines.filter(line => {
    const t = line.trim();
    if (!t) return true; // keep blank lines for paragraph structure

    // Navigation / UI links
    if (/^(←|→|‹|›|«|»)\s*(Previous|Next|Anterior|Siguiente)/i.test(t)) return false;
    if (/^(Previous Chapter|Next Chapter|Capítulo anterior|Siguiente capítulo)/i.test(t)) return false;
    if (/^\[?(Previous|Next)\]?\s*Chapter/i.test(t)) return false;

    // AO3 chapter header labels
    if (/^Chapter Text$/i.test(t)) return false;
    if (/^Texto del capítulo$/i.test(t)) return false;

    // AO3 action/stats lines
    if (/^(Kudos|Bookmarks?|Comments?|Hits|Words?|Chapters?|Series|Collections?):\s*\d/i.test(t)) return false;
    if (/^\d+\s+(Kudos|Bookmarks?|Comments?|Hits)/i.test(t)) return false;
    if (/^(↑\s*Top|↓\s*Comments?|Leave a Comment|Post Comment)/i.test(t)) return false;

    // AO3 tag/metadata lines at top of chapters
    if (/^(Rating|Category|Fandom|Relationship|Character|Additional Tags?|Language|Published|Updated|Words|Chapters|Comments|Kudos|Bookmarks|Hits):\s+/i.test(t)) return false;

    // AO3 end-of-chapter navigation
    if (/^←\s*\d+|^\d+\s*→/.test(t)) return false;

    // Common copy-paste UI artifacts
    if (/^Share$/i.test(t)) return false;
    if (/^Reblog$/i.test(t)) return false;
    if (/^\[locked\]|\[orphan\]|\[deleted\]/i.test(t)) return false;

    return true;
  });

  // Collapse 3+ consecutive blank lines to 2
  let result = filtered.join('\n');
  result = result.replace(/\n{3,}/g, '\n\n');
  return result;
}

// Harry Potter canon term corrections
const HP_CORRECTIONS = [
  // Characters & proper names
  [/\bwalpurga\b/gi, 'Walburga'],
  [/\bgodrick\b/gi, 'Godric'],
  [/\bgodric\b/gi, 'Godric'],
  [/\bmerlin\b/gi, 'Merlin'],
  [/\bdumbledore\b/gi, 'Dumbledore'],
  [/\bseverus snape\b/gi, 'Severus Snape'],
  [/\bmcgonagall\b/gi, 'McGonagall'],

  // Houses
  [/\bgryffindor\b/gi, 'Gryffindor'],
  [/\bslytherin\b/gi, 'Slytherin'],
  [/\bravenclaw\b/gi, 'Ravenclaw'],
  [/\bhufflepuff\b/gi, 'Hufflepuff'],

  // Creatures & beings
  [/\banimagus\b/gi, 'Animagus'],
  [/\bmuggle\b/gi, 'Muggle'],
  [/\bsquib\b/gi, 'Squib'],
  [/\bdementor\b/gi, 'Dementor'],
  [/\bveela\b/gi, 'Veela'],
  [/\bacromantula\b/gi, 'Acromantula'],
  [/\bboggart\b/gi, 'Boggart'],

  // Groups & factions
  [/\bdeath eaters\b/gi, 'Death Eaters'],
  [/\bmarauders\b/gi, 'Marauders'],
  [/\border of the phoenix\b/gi, 'Order of the Phoenix'],
  [/\bdumbledore's army\b/gi, "Dumbledore's Army"],

  // Blood status terms (hyphenation first, then capitalization)
  [/\bmuggle-born\b/gi, 'Muggle-born'],
  [/\bmuggle born\b/gi, 'Muggle-born'],
  [/\bmuggleborn\b/gi, 'Muggle-born'],
  [/\bmudblood\b/gi, 'Mudblood'],
  [/\bhalf[-\s]blood\b/gi, 'half-blood'],
  [/\bhalfblood\b/gi, 'half-blood'],
  [/\bpure[-\s]blood\b/gi, 'pure-blood'],
  [/\bpureblood\b/gi, 'pure-blood'],
  [/\bhalf[-\s]breed\b/gi, 'half-breed'],
  [/\bhalfbreed\b/gi, 'half-breed'],
  [/\bhouse[-\s]elf\b/gi, 'house-elf'],
  [/\bblood traitor\b/gi, 'Blood Traitor'],
  [/\bdark lord\b/gi, 'Dark Lord'],

  // Places
  [/\bhogwarts\b/gi, 'Hogwarts'],
  [/\bdiagon alley\b/gi, 'Diagon Alley'],
  [/\bazkaban\b/gi, 'Azkaban'],
  [/\bforbidden forest\b/gi, 'Forbidden Forest'],
  [/\bchamber of secrets\b/gi, 'Chamber of Secrets'],
  [/\bministry of magic\b/gi, 'Ministry of Magic'],

  // Objects & artifacts
  [/\belder wand\b/gi, 'Elder Wand'],
  [/\bmarauder's map\b/gi, "Marauder's Map"],
  [/\bmarauder's\b/gi, "Marauder's"],
  [/\bgolden snitch\b/gi, 'Golden Snitch'],
  [/\bsorting hat\b/gi, 'Sorting Hat'],
  [/\bhorcrux\b/gi, 'Horcrux'],
  [/\bpensieve\b/gi, 'Pensieve'],

  // Spells & magic
  [/\bexpelliarmus\b/gi, 'Expelliarmus'],
  [/\bstupefy\b/gi, 'Stupefy'],
  [/\bexpecto patronum\b/gi, 'Expecto Patronum'],
  [/\bpatronus\b/gi, 'Patronus'],

  // Quidditch
  [/\bquaffle\b/gi, 'Quaffle'],
  [/\bbludger\b/gi, 'Bludger'],
];

export function fixHarryPotterTerms(text) {
  for (const [pattern, replacement] of HP_CORRECTIONS) {
    text = text.replace(pattern, replacement);
  }
  return text;
}

// Apply all typography fixes
export function applyTypography(text) {
  text = removeAO3Artifacts(text);
  text = cleanWhitespace(text);
  text = fixQuotes(text);
  text = fixDashes(text);
  text = fixHarryPotterTerms(text);
  return text;
}

// Parse text into chapters
export function parseChapters(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split('\n');
  const chapters = [];
  let currentChapter = null;
  let currentContent = [];
  let currentNotes = [];
  let inNotes = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect chapter headings
    const chapterMatch = trimmed.match(/^(?:Chapter|Capítulo|Cap[ií]tulo|CHAPTER|CAPÍTULO)\s*(\d+|[IVXLCDM]+)\s*[:\-.]?\s*(.*)?$/i);
    
    if (chapterMatch) {
      // Save previous chapter
      if (currentChapter || currentContent.length > 0) {
        chapters.push({
          number: currentChapter?.number || chapters.length + 1,
          title: currentChapter?.title || '',
          content: applyTypography(currentContent.join('\n').trim()),
          notes: applyTypography(currentNotes.join('\n').trim()),
        });
      }
      currentChapter = {
        number: chapters.length + 1,
        title: chapterMatch[2]?.trim() || '',
      };
      currentContent = [];
      currentNotes = [];
      inNotes = false;
      continue;
    }

    // Detect author notes
    const notesMatch = trimmed.match(/^(?:Nota(?:s)?\s+del?\s+autor(?:a)?|Author'?s?\s+Note(?:s)?|N\/A|Notas?:)\s*$/i);
    if (notesMatch) {
      inNotes = true;
      continue;
    }

    if (inNotes) {
      currentNotes.push(line);
    } else {
      currentContent.push(line);
    }
  }

  // Save last chapter
  if (currentChapter || currentContent.length > 0) {
    chapters.push({
      number: currentChapter?.number || chapters.length + 1,
      title: currentChapter?.title || '',
      content: applyTypography(currentContent.join('\n').trim()),
      notes: applyTypography(currentNotes.join('\n').trim()),
    });
  }

  // If no chapters detected, treat entire text as one chapter
  if (chapters.length === 0 && rawText.trim()) {
    chapters.push({
      number: 1,
      title: '',
      content: applyTypography(rawText.trim()),
      notes: '',
    });
  }

  return chapters;
}

// Count words in text
export function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Scene separator SVGs
export const SCENE_SEPARATORS = {
  fleuron: `<svg viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" width="60" height="18"><path d="M50 5 C55 0, 65 0, 70 5 C75 10, 70 15, 65 15 C60 15, 55 10, 50 15 C45 10, 40 15, 35 15 C30 15, 25 10, 30 5 C35 0, 45 0, 50 5Z" fill="currentColor" opacity="0.6"/></svg>`,
  ornament: `<svg viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg" width="80" height="14"><line x1="0" y1="10" x2="40" y2="10" stroke="currentColor" stroke-width="0.5"/><circle cx="50" cy="10" r="3" fill="currentColor" opacity="0.5"/><circle cx="60" cy="10" r="2" fill="currentColor" opacity="0.5"/><circle cx="70" cy="10" r="3" fill="currentColor" opacity="0.5"/><line x1="80" y1="10" x2="120" y2="10" stroke="currentColor" stroke-width="0.5"/></svg>`,
  stars: `<svg viewBox="0 0 100 20" xmlns="http://www.w3.org/2000/svg" width="60" height="12"><text x="20" y="15" font-size="10" fill="currentColor" opacity="0.4">✦</text><text x="42" y="15" font-size="14" fill="currentColor" opacity="0.5">✦</text><text x="68" y="15" font-size="10" fill="currentColor" opacity="0.4">✦</text></svg>`,
  line: `<svg viewBox="0 0 100 10" xmlns="http://www.w3.org/2000/svg" width="60" height="6"><line x1="20" y1="5" x2="80" y2="5" stroke="currentColor" stroke-width="0.8" opacity="0.4"/></svg>`,
};

// Get page dimensions in points (1 inch = 72 points)
export function getPageDimensions(pageSize) {
  if (pageSize === 'a4') {
    return { width: 595.28, height: 841.89 }; // A4
  }
  return { width: 612, height: 792 }; // Letter
}