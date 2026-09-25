# J & C Wedding Invite

The wedding party invite for Joshua & Charlotte, live at **https://joshuaandcharlotte.com**.

It's a plain static page hosted on GitHub Pages from the `docs/` folder on `main`. The domain is
registered with Cloudflare, and its DNS points at GitHub Pages.

- `docs/index.html` – the invite page
- `docs/images/` – web-optimised images (the script lettering was taken from the design PDF)
- `docs/CNAME` – tells GitHub Pages to serve the site on joshuaandcharlotte.com

The page has a `noindex` tag so search engines leave it out, but anyone with the address can view it.

## Editing

Preview locally:

```bash
python3 -m http.server 8000 -d docs
```

Then open http://localhost:8000. To publish, commit and push. GitHub Pages updates about a minute later.
