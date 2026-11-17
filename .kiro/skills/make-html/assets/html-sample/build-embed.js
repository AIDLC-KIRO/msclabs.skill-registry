#!/usr/bin/env node
/* ============================================================
   {{APP_NAME}} ATX doc-site — content embedder
   Generates a JS bundle so the dynamic pages (domain-detail,
   reference) work over file:// where fetch() is blocked.
   Application source code is intentionally NOT embedded.
   Run:  node build-embed.js
   ============================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT = path.join(ROOT, "content");
const OUT = path.join(ROOT, "assets", "data");

fs.mkdirSync(OUT, { recursive: true });

/* Binary formats that sometimes land in a source folder (a spec as .docx, a diagram
   as .png, a data export as .xlsx). Reading them as UTF-8 yields mojibake the Markdown
   viewer cannot render and that bloats the bundle, so skip them and say so — a loud skip
   tells you to convert the file, a silent one leaves a broken entry in the doc browser. */
const BINARY_EXT = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "odt", "ods",
  "png", "jpg", "jpeg", "gif", "bmp", "webp", "ico", "svgz", "tif", "tiff",
  "zip", "gz", "tar", "tgz", "bz2", "7z", "rar",
  "woff", "woff2", "ttf", "otf", "eot",
  "mp3", "mp4", "mov", "avi", "wav", "webm",
  "db", "sqlite", "sqlite3", "dmp", "bak", "class", "jar", "so", "dylib", "exe",
]);

const skipped = [];

/* Recursively collect files under `dir`, returning { relKey: text } where
   relKey is POSIX-style and relative to `baseForKey`. */
function collect(dir, baseForKey, filterExt) {
  const out = {};
  if (!fs.existsSync(dir)) return out;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      /* Dotfiles and dot-directories are never site content. Two reasons this matters:
         content/ is filled by copying a source tree wholesale, so a mirrored folder can
         easily carry .gitignore, .DS_Store — or an entire .git/ object store, which would
         otherwise be embedded as thousands of "documents" and shipped to the customer. And
         the scaffold's own content/bre/.gitkeep and content/codebase/.gitkeep exist only to
         keep those empty directories alive through git and packaging; they are plumbing,
         not documents. */
      if (entry.name.startsWith(".")) continue;
      if (entry.isDirectory()) { walk(full); continue; }
      const ext = entry.name.split(".").pop().toLowerCase();
      if (filterExt && !filterExt.includes(ext)) continue;
      const rel = path.relative(baseForKey, full).split(path.sep).join("/");
      if (BINARY_EXT.has(ext)) { skipped.push(`${rel} (binary .${ext})`); continue; }
      const buf = fs.readFileSync(full);
      /* Safety net for binary formats not listed above: a NUL byte never appears in the
         UTF-8 text this site renders. */
      if (buf.includes(0)) { skipped.push(`${rel} (contains NUL bytes)`); continue; }
      out[rel] = buf.toString("utf8");
    }
  };
  walk(dir);
  return out;
}

/* Serialize as an external JS file assigning a global. Using an object literal
   (JSON.stringify) + escaping the two line-separator code points that are legal
   in JSON but historically illegal in JS source. External file => no </script>
   escaping needed. */
function writeBundle(file, globalName, obj) {
  let js = "window." + globalName + "=" + JSON.stringify(obj) + ";";
  js = js.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  const dest = path.join(OUT, file);
  fs.writeFileSync(dest, js, "utf8");
  const kb = (Buffer.byteLength(js) / 1024).toFixed(0);
  console.log(`  ${file}: ${Object.keys(obj).length} keys, ${kb} KB`);
}

console.log("Embedding content bundles…");

/* 1) DOCS — everything the Reference browser and Domain deep-dive render.
      Covers markdown, the SQL schema, and JSON artifacts under bre/ + codebase/, plus
      interfaces/ when interface specs were normalized into Markdown for this project.
      The three trees stay separate so provenance is visible: bre/ and codebase/ mirror
      the ATX reports, interfaces/ holds documents generated from supplied specs. */
const docs = Object.assign(
  {},
  collect(path.join(CONTENT, "bre"), CONTENT),         // keys: bre/...
  collect(path.join(CONTENT, "codebase"), CONTENT),    // keys: codebase/...
  collect(path.join(CONTENT, "interfaces"), CONTENT)   // keys: interfaces/...
);
writeBundle("docs-data.js", "__DOCS__", docs);

if (skipped.length) {
  console.log(`  skipped ${skipped.length} non-text file(s) — convert them to Markdown if the site needs them:`);
  for (const item of skipped) console.log(`    - ${item}`);
}

/* NOTE: The application source tree is intentionally NOT embedded or exposed
   in this documentation site. Only the assessment documentation (business
   rules extraction + codebase analysis) under content/bre and content/codebase
   is bundled. */

console.log("Done.");
