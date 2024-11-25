export function _parseJobDescription(text: string, url: string | undefined): Record<string, string> {
  const sections = text.split('\n\n');
  const result: Record<string, string> = {};

  sections.forEach(section => {
    const [key, ...valueLines] = section.split(':\n');
    if (key && valueLines.length) {
      result[key.trim()] = valueLines.join('\n').trim();
    }
  });
  // console.log("URL:", url);
  if (url) {
    result["Job URL"] = url;
  }
  return result;
}