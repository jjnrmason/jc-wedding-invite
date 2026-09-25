// Builds the published invite into docs/index.html.
//
// The real page (src/index.html + src/images) is inlined into a single HTML
// document and encrypted with AES-256-GCM using a key derived from the invite
// code. The published page only contains a small "enter your code" screen plus
// the encrypted blob, so nobody can read the invite (or see the photos) without
// the code — even though the GitHub repo and Pages site are public.
//
// Guests get a link like https://<user>.github.io/<repo>/#<code>. The part after
// "#" never leaves their browser, and it unlocks the page automatically.
//
// Usage:  node build.mjs            (uses/creates the code in .invite-code)
//         INVITE_CODE=... node build.mjs

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { extname, join } from 'node:path';

const SITE_URL = 'https://jjnrmason.github.io/jc-wedding-invite/';
const ITERATIONS = 600_000;
const CODE_FILE = '.invite-code';

const normalise = (code) => code.toLowerCase().replace(/[^a-z0-9]/g, '');

function getCode() {
  if (process.env.INVITE_CODE) return process.env.INVITE_CODE.trim();
  if (existsSync(CODE_FILE)) return readFileSync(CODE_FILE, 'utf8').trim();
  // No ambiguous characters (0/o, 1/l/i) so the code is easy to read out or type.
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const raw = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  const code = raw.match(/.{4}/g).join('-');
  writeFileSync(CODE_FILE, code + '\n');
  console.log(`Generated a new invite code in ${CODE_FILE}`);
  return code;
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const dataUri = (path) => `data:${MIME[extname(path).toLowerCase()]};base64,${readFileSync(path).toString('base64')}`;

function inlineImages(html) {
  return html.replace(/src="(images\/[^"]+)"/g, (_, rel) => `src="${dataUri(join('src', rel))}"`);
}

async function encrypt(plaintext, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(normalise(code)), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt'],
  );
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plaintext));
  const b64 = (buf) => Buffer.from(buf).toString('base64');
  return { salt: b64(salt), iv: b64(iv), data: b64(cipher), iterations: ITERATIONS };
}

const code = getCode();
const page = inlineImages(readFileSync('src/index.html', 'utf8'));
const payload = await encrypt(page, code);

const gate = readFileSync('gate.html', 'utf8')
  .replace('__MONOGRAM__', () => dataUri('src/images/monogram.png'))
  .replace('__PAYLOAD__', () => JSON.stringify(payload));

mkdirSync('docs', { recursive: true });
writeFileSync('docs/index.html', gate);
writeFileSync('docs/.nojekyll', '');

console.log(`Built docs/index.html (${(gate.length / 1024 / 1024).toFixed(1)} MB)`);
console.log(`Invite code: ${code}`);
console.log(`Guest link:  ${SITE_URL}#${normalise(code)}`);
