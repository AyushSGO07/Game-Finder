/**
 * Utility to sanitize and clean raw Steam store descriptions into safe, human-readable paragraphs.
 * Removes raw HTML tags, embedded promo videos, Steam BBCode wrappers (e.g. bb_paragraph, bb_img_ctn),
 * CDN URLs, and correctly decodes HTML character entities.
 */

const HTML_ENTITY_MAP: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&trade;': '™',
  '&reg;': '®',
  '&copy;': '©',
  '&bull;': '•',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&rdquo;': '"',
  '&ldquo;': '"',
};

function decodeHtmlEntities(str: string): string {
  // Named entities
  let decoded = str.replace(
    /&(quot|apos|#39|amp|lt|gt|nbsp|trade|reg|copy|bull|hellip|ndash|mdash|rsquo|lsquo|rdquo|ldquo);/gi,
    (match) => HTML_ENTITY_MAP[match.toLowerCase()] ?? match
  );

  // Decimal character entities: &#123;
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    try {
      const code = parseInt(dec, 10);
      return String.fromCharCode(code);
    } catch {
      return '';
    }
  });

  // Hex character entities: &#x1f;
  decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
    try {
      const code = parseInt(hex, 16);
      return String.fromCharCode(code);
    } catch {
      return '';
    }
  });

  return decoded;
}

/**
 * Cleans a raw description containing HTML/BBCode/CDN sources and returns an array of readable paragraphs.
 */
export function cleanGameDescription(raw: string | undefined | null): string[] {
  if (!raw || typeof raw !== 'string') {
    return [];
  }

  let text = raw.trim();
  if (!text) {
    return [];
  }

  // 1. Remove embedded multimedia elements and dangerous tags with their contents
  text = text.replace(/<(video|audio|script|style|iframe|noscript)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // 2. Remove Steam specific bb_img_ctn wrappers and images
  text = text.replace(/<span[^>]*class=["'][^"']*bb_img_ctn[^"']*["'][^>]*>[\s\S]*?<\/span>/gi, '');
  text = text.replace(/<img[^>]*>/gi, '');
  text = text.replace(/<source[^>]*>/gi, '');

  // 3. Remove standalone Steam CDN video or asset URLs
  text = text.replace(
    /https?:\/\/(?:cdn\.akamai\.steamstatic\.com|shared\.(?:akamai|fastly)\.steamstatic\.com|video\.(?:akamai|fastly)\.steamstatic\.com|clan\.(?:akamai|fastly)\.steamstatic\.com)[^\s"'<>]+/gi,
    ''
  );

  // 4. Convert break tags to single newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // 5. Convert block closings to paragraph delimiters
  text = text.replace(/<\/(p|div|h[1-6]|li|ul|ol|table|tr|blockquote|section|article)>/gi, '\n\n');
  text = text.replace(/<li[^>]*>/gi, '• ');

  // 6. Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 7. Decode HTML character entities
  text = decodeHtmlEntities(text);

  // 8. Normalize whitespace, remove orphan lines and Steam layout residue
  const rawParagraphs = text.split(/\n+/);
  const cleanParagraphs: string[] = [];

  for (const p of rawParagraphs) {
    const trimmed = p.trim().replace(/\s+/g, ' ');
    if (!trimmed) continue;

    // Filter out residual raw URLs or Steam wrapper identifiers
    if (/^https?:\/\/\S+$/i.test(trimmed)) continue;
    if (/^(bb_paragraph|bb_tag|bb_img_ctn|bb_video)$/i.test(trimmed)) continue;

    cleanParagraphs.push(trimmed);
  }

  return cleanParagraphs;
}
