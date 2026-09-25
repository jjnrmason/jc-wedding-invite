# J & C Wedding Invite

The wedding party invite for Joshua & Charlotte, hosted on GitHub Pages from `docs/`.

## How the invite-only access works

The repo and Pages site are public, so the published page is **encrypted**. `docs/index.html`
holds a small "enter your invite code" screen and the encrypted invite. The text and photos
are only readable once the right code is entered (AES-256-GCM, key from PBKDF2).

Guests get a link with the code after the `#`:

```
https://jjnrmason.github.io/jc-wedding-invite/#<code>
```

The part after `#` is never sent to GitHub. It unlocks the page automatically, gets removed from
the address bar, and is remembered on that device. Anyone without the link just sees the code screen.

## Editing

The unencrypted source lives in `src/` (git-ignored so it never gets published):

- `src/index.html` – the invite page
- `src/images/` – web-optimised images (the script lettering was taken from the design PDF)

Preview it with `python3 -m http.server -d src` and open http://localhost:8000.

## Publishing a change

```bash
node build.mjs
git add docs && git commit -m "Update invite" && git push
```

`build.mjs` reads the invite code from `.invite-code` (git-ignored; it creates one the first time)
or from the `INVITE_CODE` environment variable, and prints the guest link.
If you change the code, the old link stops working.

> **Back up `src/`, `Assets/` and `.invite-code` somewhere private.** They are deliberately not in git.
