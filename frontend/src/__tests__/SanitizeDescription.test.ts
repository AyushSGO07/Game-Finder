import { describe, it, expect } from 'vitest';
import { cleanGameDescription } from '../lib/sanitizeDescription';

describe('cleanGameDescription Sanitizer Utility', () => {
  it('handles null, undefined, and empty string gracefully', () => {
    expect(cleanGameDescription(null)).toEqual([]);
    expect(cleanGameDescription(undefined)).toEqual([]);
    expect(cleanGameDescription('')).toEqual([]);
    expect(cleanGameDescription('   ')).toEqual([]);
  });

  it('removes raw Steam tags like <p class="bb_paragraph"> and <span class="bb_img_ctn">', () => {
    const raw = `
      <p class="bb_paragraph">Journey through the Lands Between.</p>
      <span class="bb_img_ctn"><img src="https://cdn.akamai.steamstatic.com/banner.jpg" /></span>
      <p class="bb_paragraph">Defeat demigods and claim the Elden Ring.</p>
    `;
    const paragraphs = cleanGameDescription(raw);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toBe('Journey through the Lands Between.');
    expect(paragraphs[1]).toBe('Defeat demigods and claim the Elden Ring.');
    expect(paragraphs.some((p) => p.includes('bb_paragraph'))).toBe(false);
    expect(paragraphs.some((p) => p.includes('bb_img_ctn'))).toBe(false);
  });

  it('removes embedded video, source, and script elements', () => {
    const raw = `
      <p>Intro text</p>
      <video autoplay loop muted>
        <source src="https://video.akamai.steamstatic.com/trailer.mp4" type="video/mp4">
      </video>
      <script>alert("unsafe")</script>
      <p>Outro text</p>
    `;
    const paragraphs = cleanGameDescription(raw);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toBe('Intro text');
    expect(paragraphs[1]).toBe('Outro text');
    expect(paragraphs.some((p) => p.includes('video'))).toBe(false);
    expect(paragraphs.some((p) => p.includes('alert'))).toBe(false);
  });

  it('strips standalone Steam CDN URLs and residues', () => {
    const raw = `
      Explore endless dungeons.
      https://cdn.akamai.steamstatic.com/steam/apps/123/banner.jpg
      Level up your characters.
    `;
    const paragraphs = cleanGameDescription(raw);
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toBe('Explore endless dungeons.');
    expect(paragraphs[1]).toBe('Level up your characters.');
  });

  it('decodes HTML entities including quotes, ampersands, and apostrophes', () => {
    const raw = '&quot;It&#39;s a masterclass&quot; &amp; a benchmark &mdash; GameSpot &trade;';
    const paragraphs = cleanGameDescription(raw);
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toBe('"It\'s a masterclass" & a benchmark — GameSpot ™');
  });

  it('formats list items with bullet points and preserves line breaks', () => {
    const raw = `
      <p>Key Features:</p>
      <ul>
        <li>Vast open world</li>
        <li>Deep tactical combat</li>
        <li>Multiplayer cooperation</li>
      </ul>
    `;
    const paragraphs = cleanGameDescription(raw);
    expect(paragraphs[0]).toBe('Key Features:');
    expect(paragraphs.some((p) => p.includes('• Vast open world'))).toBe(true);
  });
});
