// Adds a content fingerprint (?v=...) to the page's own scripts and stylesheet, so a browser that
// has the new index.html never runs it with an old cached app.js (GitHub Pages caches for 10 min).
// Run after changing any of them: node tests/stamp.cjs   (or --check to only report)
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const FILES = ["styles.css", "world-110m.js", "firebase-config.js", "app.js"];
const page = path.join(ROOT, "index.html");
let html = fs.readFileSync(page, "utf8"), stale = [];
for (const f of FILES) {
  const v = crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, f))).digest("hex").slice(0, 10);
  const re = new RegExp(`((?:src|href)=")${f.replace(".", "\\.")}(?:\\?v=[0-9a-f]+)?(")`);
  if (!re.test(html)) throw new Error(`${f} is not referenced in index.html`);
  const next = html.replace(re, `$1${f}?v=${v}$2`);
  if (next !== html) stale.push(f);
  html = next;
}
if (process.argv.includes("--check")) {
  if (stale.length) { console.error("Out-of-date fingerprints in index.html for: " + stale.join(", ") + ". Run node tests/stamp.cjs"); process.exit(1); }
} else {
  fs.writeFileSync(page, html);
  console.log(stale.length ? "Updated: " + stale.join(", ") : "All fingerprints current");
}
