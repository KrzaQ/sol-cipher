/**
 * URL-safe encoding for Golden Sun passwords.
 *
 * The password alphabet includes 8 characters that are unsafe in URL fragments:
 *   # % + = & $ ! ?
 *
 * We substitute them 1:1 with characters that are NOT in the alphabet
 * (visually-ambiguous letters/digits the game deliberately excludes, plus
 * two unreserved URI characters). This keeps the URL the same length as the
 * password and is unambiguous in both directions.
 */

const PW_TO_URL: Record<string, string> = {
  '#': '0', '%': '1', '+': 'I', '=': 'O',
  '&': 'l', '$': 'o', '!': '-', '?': '_',
};

const URL_TO_PW: Record<string, string> = Object.fromEntries(
  Object.entries(PW_TO_URL).map(([k, v]) => [v, k]),
);

const PW_RE = /[#%+=&$!?]/g;
const URL_RE = /[01IOlo\-_]/g;

export function passwordToUrl(pw: string): string {
  return pw.replace(PW_RE, (ch) => PW_TO_URL[ch]!);
}

export function urlToPassword(url: string): string {
  return url.replace(URL_RE, (ch) => URL_TO_PW[ch]!);
}
