const EMOJI_3D_CDN =
  "https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets";

export function emojiToCodepoint(emoji: string): string {
  const codePoints: string[] = [];

  for (const symbol of emoji.trim()) {
    const codePoint = symbol.codePointAt(0);
    if (codePoint === undefined) continue;
    if (codePoint === 0xfe0f) continue;
    codePoints.push(codePoint.toString(16).toLowerCase());
  }

  return codePoints.join("-");
}

export function getEmoji3dUrl(emoji: string): string | null {
  const code = emojiToCodepoint(emoji);
  if (!code) return null;
  return `${EMOJI_3D_CDN}/${code}_3d.png`;
}
