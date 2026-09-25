/**
 * Lightweight JSON syntax highlighter and compact formatter for live payload panels
 * Inlines short arrays (e.g. 3x3 matrix sticker rows) while keeping long arrays multiline.
 * Compliance: RULES.md § 1 (SRP) & § 6 (<300 lines)
 */

export function formatCompactJson(value: unknown): string {
  const raw = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  // Compact 1D arrays of primitives: strings, numbers, booleans, null
  return raw.replace(
    /\[\s*\n\s*((?:(?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|null)\s*,\s*\n\s*)*(?:"[^"]*"|-?\d+(?:\.\d+)?|true|false|null))\s*\n\s*\]/g,
    (match, inner) => {
      const compact = inner
        .split(/,\s*\n\s*/)
        .map((s: string) => s.trim())
        .join(', ');
      // Inlines short arrays like ["yellow", "yellow", "yellow"]
      if (compact.length <= 48) {
        return `[${compact}]`;
      }
      return match;
    },
  );
}

export function highlightJson(value: unknown): string {
  const json = formatCompactJson(value);
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    },
  );
}
