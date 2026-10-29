export function countryCodeToFlag(cca2: string): string {
  const code = cca2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) {
    return "";
  }

  return String.fromCodePoint(
    ...Array.from(code, letter => 127397 + letter.charCodeAt(0)),
  );
}
