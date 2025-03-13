export function formatString(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match, index: number) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}
