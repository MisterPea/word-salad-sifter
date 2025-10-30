export function _parseJobDescription(text: string, url: string | undefined): Record<string, string> {

  const sections = text.split(/\n(?=\n*\*\*.*?:)/).filter(Boolean);

  const result: Record<string, string> = {};

  sections.forEach(section => {
    const [key, ...valueLines] = section.split('\n');
    // remove markdown notation
    const k = key.replace("**", '').replace(":**", '');
    const v = valueLines.map((line) => line.replaceAll("**", ''));
    if (k && valueLines.length) {
      result[k.trim()] = v.join('\n').trim();
    }
  });

  if (url) {
    result["Job URL"] = url;
  }
  return result;
}