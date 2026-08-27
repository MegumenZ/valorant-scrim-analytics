/**
 * Utilitas terjemahan catatan taktis coach untuk Co-Owner / Analyst internasional
 */
const TACTICAL_TERMS_MAP: Array<[RegExp, string]> = [
  [/\brotasi\b/gi, "rotation"],
  [/\bkalah\b/gi, "loss"],
  [/\bmenang\b/gi, "win"],
  [/\bsering\b/gi, "frequently"],
  [/\bterlalu\b/gi, "too"],
  [/\blambat\b/gi, "slow"],
  [/\bcepat\b/gi, "fast"],
  [/\bkecolongan\b/gi, "caught off guard"],
  [/\bkurang\b/gi, "lacking"],
  [/\bbagus\b/gi, "good"],
  [/\bdisiplin\b/gi, "discipline"],
  [/\bposisi\b/gi, "positioning"],
  [/\bbanyak\b/gi, "many"],
  [/\bblunder\b/gi, "blunder(s)"],
  [/\bwaktu\b/gi, "time"],
  [/\bhabis\b/gi, "expired"],
  [/\beksekusi\b/gi, "execution"],
  [/\bkomunikasi\b/gi, "communication/calling"],
  [/\blatihan\b/gi, "practice drill"],
  [/\bperbaiki\b/gi, "improve"],
  [/\bpertahankan\b/gi, "maintain"],
  [/\bmusuh\b/gi, "enemy"],
  [/\blawan\b/gi, "opponent"],
  [/\bduel\b/gi, "duels"],
  [/\bjarak\b/gi, "spacing distance"],
  [/\bcelah\b/gi, "flaws / gaps"],
  [/\bkekuatan\b/gi, "strengths"],
  [/\bkelemahan\b/gi, "weaknesses"],
  [/\bsangat\b/gi, "very"],
  [/\brapi\b/gi, "clean / structured"],
  [/\bketat\b/gi, "tight"],
  [/\bmeledak\b/gi, "detonated"],
  [/\bjinakkan\b/gi, "defuse"],
  [/\bpasang\b/gi, "plant"],
  [/\btahan\b/gi, "hold"],
  [/\bpadat\b/gi, "tight"],
  [/\bterisolasi\b/gi, "isolated"],
  [/\bmati\b/gi, "died"],
  [/\bkedua\b/gi, "both"],
  [/\bbabak\b/gi, "half"],
  [/\bawal\b/gi, "early"],
  [/\bakhir\b/gi, "late"],
  [/\bulti\b/gi, "ultimate"],
  [/\bulti-nya\b/gi, "their ultimate"],
  [/\butilitas\b/gi, "utility"],
  [/\bbuang\b/gi, "waste"],
  [/\bjangan\b/gi, "do not"],
  [/\bsaat\b/gi, "during"],
  [/\bketika\b/gi, "when"],
  [/\bhemat\b/gi, "save/eco"],
  [/\bserang\b/gi, "attack/push"],
  [/\bbertahan\b/gi, "defend/anchor"],
];

export function translateCoachNotes(text: string): string {
  if (!text || !text.trim()) return "";
  let translated = text;
  for (const [pattern, replacement] of TACTICAL_TERMS_MAP) {
    translated = translated.replace(pattern, (match) => {
      // Preserve uppercase if original starts with uppercase
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }
  return translated;
}
