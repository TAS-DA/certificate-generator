/**
 * Token parsing utility for dynamic certificate sentences.
 * Replaces {{TokenName}} with values from record.
 * Never returns undefined, null, or NaN string representations.
 */
export function replaceTokens(
  template: string,
  record: Record<string, any>
): string {
  if (!template) return '';

  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    const value = record[trimmedKey];

    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }

    return String(value);
  });
}

/**
 * Extracts all unique {{TokenName}} keys from a template string.
 */
export function extractTokens(template: string): string[] {
  if (!template) return [];
  const matches = template.match(/\{\{(.*?)\}\}/g);
  if (!matches) return [];

  const set = new Set<string>();
  for (const match of matches) {
    const key = match.replace(/\{\{|\}\}/g, '').trim();
    if (key) set.add(key);
  }

  return Array.from(set);
}
