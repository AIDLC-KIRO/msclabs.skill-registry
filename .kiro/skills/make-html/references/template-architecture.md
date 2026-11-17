# Template Architecture

How the bundled scaffold (`assets/html-template/`) is wired, and exactly what you must fill on each page. Read this before generating (SKILL.md step 6).

## Contents
1. File layout
2. Shared chrome: `app.js` NAV + collapsible menu
3. Content embedding: `build-embed.js` → `docs-data.js`
4. The three "fill me" patterns
5. Per-page data contracts
6. Adapting the template when it does not fit

---

## 1. File layout

```
<site>/
├── index.html               executive dashboard
├── codebase.html            CCA narrative
├── domains.html             BRE overview (domain summary, hotspots, topology)
├── domain-detail.html       per-domain deep dive (hash-routed: #domain=<slug>)
├── modernization.html       MRA scores / findings / pathways
├── roadmap.html             phased roadmap + tech-debt register
├── reference.html           full document browser over content/
├── knowledge-graph.html     D3 interactive graph
├── methodology.html         assessment methodology
├── application-reference.html, aws-architecture-diagram.html
├── build-embed.js           embeds content/*.md|sql|json into docs-data.js
├── assets/
│   ├── css/styles.css       all styling (Tailwind CDN + this)
│   ├── css/fonts.css        VENDORED @font-face → ../fonts/*.woff2 (no Google Fonts call)
│   ├── css/highlight-github-dark.min.css   VENDORED hljs theme (reference.html)
│   ├── fonts/*.woff2        VENDORED Inter / Noto Sans Thai / JetBrains Mono (+ SHA256SUMS)
│   ├── js/vendor/*.min.js   VENDORED Tailwind / Mermaid / marked / hljs / D3 (+ SHA256SUMS)
│   ├── js/app.js            sidebar NAV, top bar, language toggle, collapsible menu
│   ├── js/kg-data.js        knowledge-graph data (nodes/links/details/…)
│   ├── js/kg-graph.js       knowledge-graph D3 renderer (do not edit for data)
│   └── data/docs-data.js    GENERATED: window.__DOCS__ = { "<path>": "<markdown>" }
│   └── img/                 OPTIONAL: reviewed images the site displays
└── content/
    ├── codebase/            mirror of the CCA source (ATXDocumentation)
    ├── bre/                 mirror of the BRE source (business-rules-extraction)
    └── interfaces/          OPTIONAL: interface specs normalized to Markdown
```

**Images live in `assets/img/`, not in `content/`.** They are binary, so the embedder skips them — they ship as real files and load over `file://` normally. Reference them **root-relatively** (`assets/img/topology.png`) from a page or from Markdown. The trap: the doc browser renders Markdown inside a page at the site root, so a doc-relative link such as `./topology.png` resolves to `<site>/topology.png` and yields a broken image with a console error, even though the same link worked fine in the original repo. When mirroring ATX docs that contain image links, rewrite the paths and copy the files across.

> **`content/bre/` and `content/codebase/` ship empty.** The scaffold carries no demo documentation, so nothing from a previous engagement can leak into a customer deliverable — and `assets/data/docs-data.js` is only a header stub. Both are filled by mirroring the ATX sources in and running `build-embed.js`. Until you do, the document browser and domain deep-dive will legitimately show "not found".
>
> When **refreshing** an existing site, `rm -rf content/codebase content/bre` before re-copying: a plain `cp -R` merges, so docs from a previous run would survive into the new deliverable.

**`content/interfaces/` is a third tree, created only when the project supplied interface specs** (OpenAPI/Swagger, a Postman collection, a Word or PDF interface document). It is deliberately not folded into `content/codebase/`: that tree is a file-for-file ATX mirror whose integrity is checked with `diff -rq`, and dropping generated documents into it would break that check and make provenance unreadable — a customer needs to see at a glance which statements came from an ATX report and which from a spec they handed over. `build-embed.js` picks the folder up automatically when it exists (keys `interfaces/…`); create it with `scripts/normalize_interfaces.py` rather than by hand.

Every page loads the **local** Tailwind runtime (`assets/js/vendor/tailwindcss-*.min.js`) and Mermaid, then the local `assets/css/fonts.css`, then `assets/css/styles.css`, then `assets/js/app.js`, then (for doc pages) `assets/data/docs-data.js`. Pages read embedded Markdown from `window.__DOCS__` first and fall back to `fetch()` — that is why the site works over `file://` once `docs-data.js` is regenerated.

**Nothing is fetched at open time.** Fonts, the highlight.js theme, and all five JavaScript libraries (Tailwind, Mermaid, marked, highlight.js, D3) are vendored under `assets/`, so the page renders fully offline — the failure that used to strike a reader with no CDN route (right fonts, collapsed Tailwind layout) cannot happen. The fonts and the minified libraries are pinned by `SHA256SUMS` manifests the compliance suite recomputes. Regenerate everything with `python3 scripts/vendor_web_assets.py`; `--check` fails if any page has drifted back to a CDN. Tailwind is vendored as its CDN runtime, so it still reads the inline `tailwind.config` and generates CSS in the browser exactly as before — utility classes in the HTML are authored the same way, they just no longer need the network.

Which of the three families actually renders where is worth knowing before you change a weight: `styles.css` sets `body` to an Apple-first stack (`"SF Pro TH", -apple-system, …`) with `Inter` as a late fallback, so on macOS the body text uses the system font and the vendored Inter carries Windows and Linux. `Noto Sans Thai` and `JetBrains Mono` reach the page through Tailwind's `font-sans` / `font-mono` utilities, which the pages use in about twenty places. None of the three is dead weight, but none is the sole source of body type either.

---

## 2. Shared chrome: `app.js` NAV + collapsible menu

`assets/js/app.js` holds a single `NAV` array of sidebar groups. Each group: `{ title:{en,th}, links:[ { href, icon, en, th, sub? } ] }`. `sub:true` renders an indented sub-link (a page anchor). `buildSidebar()` renders each group as a **collapsible** block:

- A header `<button data-navtoggle="navgrp:<slug>">` with a rotating caret.
- The links live in `<nav class="nav-group-items">`.
- State persists in `localStorage` under the `navgrp:<slug>` key; the group containing the current page stays open.
- Wiring lives in `buildChrome()` (`[data-navtoggle]` click handlers) and the CSS classes `.nav-group`, `.nav-section-btn`, `.nav-caret`, `.nav-group-items` (+ `.nav-group.collapsed`) are in `styles.css`.

If you start from this template the collapsible menu is already present — keep it. If you ever regenerate `app.js` from an older copy, re-apply this mechanism.

**NAV / TREE hygiene — validate every `doc:` path, don't trust the shipped list.** Every `href="reference.html#doc=<path>"` (in `app.js` NAV) and every `doc:` in the `reference.html` TREE must resolve to a file under `content/`. The scaffold's lists were authored against an *example* BRE run and reference several files a given run may not emit — confirmed offenders include `bre/service-candidates.md`, `bre/method-dependency-matrix.md`, `bre/graph.json`, `bre/method-call-graph.json`, `bre/service-relationship-graph.json`, and some `bre/diagrams/*` files. So don't rely on "the shipped value is standard ATX output": after mirroring, **validate every path and delete or repoint the ones that don't exist**, e.g.

```bash
grep -rhoE '(#doc=|doc:")[^"'"'"' ]+\.(md|sql|json)' assets/js/app.js reference.html \
  | sed -E 's/.*(#doc=|doc:")//' | sort -u \
  | while read d; do [ -f "content/$d" ] || echo "DEAD: $d"; done
```

Repoint a dead link to the closest real doc (e.g. `service-candidates.md` → `bre/domain-decomposition-overview/bounded-contexts.md`) rather than shipping a 404.

**`app.js` itself carries placeholders that gate *every* page.** Because the sidebar/top bar are shared, `assets/js/app.js` holds `{{APP_NAME}}` (×2), `{{BRAND_INITIAL}}`, `{{READINESS_SCORE}}`, `{{READINESS_STATUS_EN}}`, `{{READINESS_STATUS_TH}}`, and the readiness-badge colour. Fill these first — if you don't, raw `{{…}}` shows on **every** page, including ones you intended to leave as scaffold. Set the bottom readiness badge (text + colour) to match the MRA overall rating.

---

## 3. Content embedding: `build-embed.js` → `docs-data.js`

`build-embed.js` walks `content/bre/`, `content/codebase/` and `content/interfaces/` (whichever exist) and writes `assets/data/docs-data.js` as `window.__DOCS__ = { "<relative path under content/>": "<file text>" }`. It embeds text: `.md`, `.sql`, `.json`, `.html`. Run it from the site root **after** populating `content/`:

```bash
cd <site> && node build-embed.js
```

Expect output like `docs-data.js: <N> keys, <size> KB`. The reference doc-browser, the domain deep-dive facets, and any embedded Markdown all depend on this. Re-run it whenever `content/` changes.

**Non-text files are skipped, loudly.** A binary that lands in a content folder — an interface spec still in `.docx`, a diagram `.png`, a data export `.xlsx` — cannot be rendered by the Markdown viewer and would bloat the bundle with mojibake, so the embedder skips it by extension (and catches mis-named binaries by looking for NUL bytes) and lists each skip:

```
  skipped 2 non-text file(s) — convert them to Markdown if the site needs them:
    - codebase/spec-handout.pdf (binary .pdf)
    - interfaces/weird.md (contains NUL bytes)
```

Treat that list as a work item, not noise: each line is a document the site is currently missing. Convert it (see SKILL.md's supporting-inputs table) and re-run. A skip is far better than a silent broken entry in the doc browser, which is what happened before this check existed.

---

## 4. The three "fill me" patterns

The template ships inert so it renders cleanly before data is added. Three patterns mark where data goes. If you miss one, that section renders **empty or zero** (no error) — so grep for all three before declaring done.

### 4a. `{{PLACEHOLDER}}` tokens
Plain text or attribute placeholders, e.g. `{{DOMAINS_KPI_TABLES}}`, `{{DOMAINS_LIST_JSON}}`. Replace with the real value. Find them: `grep -rn '{{[^}]*}}' <site> --include='*.html' --include='*.js'`. Tokens that remain **inside comments** (shape docs) are harmless; tokens in live markup/JS are not.

### 4b. Commented-out data arrays
The real data ships inside a block comment with an empty active value:

```js
const F = /*[ { …real findings… } ]*/ [];      // renders NOTHING until activated
const debt = /*[ { …real rows… } ]*/ [];
```

**Activate** by removing the `/*` … `*/ []`/`{}` wrapper so the data becomes live: `const F = [ { … } ];`. Find them: `grep -rEn '\*/ *\[\] *;|\*/ *\{\} *;' <site>` and `grep -rn 'const [A-Za-z_]* *= */\*' <site>`. Also watch for **inline** commented values: `score:/*1.10*/ 0, pct:/*27.5%*/ 0` → replace with real numbers `score:1.09, pct:27.25`.

### 4c. `PLACEHOLDER["…"]` Mermaid stubs
A diagram wrapped as a single node label:

```
<pre class="mermaid">
graph TB
    PLACEHOLDER["graph TB
    subgraph …
    A --> B"]
</pre>
```

Mermaid parses the whole graph as one node label and throws **"Syntax error in text"**. **Unwrap** it — the real diagram is the text inside the quotes; the outer `graph TB\n    PLACEHOLDER["` and trailing `"]` must go. Because inner node labels also contain `"]` (e.g. `subgraph EDGE["Edge"]`), the reliable close anchor is the `"]` immediately before `</pre>`. Find them: `grep -rn 'PLACEHOLDER\["' <site>/*.html`. After unwrapping, author/adjust the diagram to the real project.

---

## 5. Per-page data contracts

Each page has a `<script>` with data arrays/objects to fill. The names below are from the shipped scaffold; confirm by reading the page.

### index.html
- `domains` — array of `{ en, th, slug, size, tables, features, rules, color }` for the domain grid. `slug` is the **full** domain slug.
- `FULL` — map `slug → full-slug` used to build `domain-detail.html#domain=<slug>` links (identity map is fine).
- Static spots to reconcile: the "N Business Domains" KPI + heading, the readiness gauge (`data-p`, `--ring-c` color, badge label), the 5 category score bars (`data-w`, gradient, number), the findings summary line, and the Top-5 gaps cards. Make every number equal the MRA report.

### domains.html
- `domains` — richer `{ n, slug, en, th, size, tables, features, rules, color, db, oEn, oTh, entities[], files[] }`.
- `FULL` — slug map (as above).
- `order` — extraction phases `{ p, en, th, rEn, rTh }` from BRE execution-order.
- `matrix` — domain→data-source rows for the topology table.
- KPI tokens (domains / tables / features / rules), intro prose, coupling-hotspot cards, integration cards, DB-connection rows, and several Mermaid diagrams (context map, connections, coupling seams, cyclic dependency, deployment).

### domain-detail.html
- `DOMAINS` — `{ slug, en, th, cx, t, f, r, c, db }`. **`slug` MUST be the full slug** that matches the content directory name (`patient-appointment`, not `pa`) and the `#domain=` hash. The default boot slug must be a real one.
- `FACETS` — the per-domain document set loaded from `content/bre/detailed-domain-bre/domain-<slug>/*.md` plus the target service spec from `content/bre/domain-decomposition-overview/service-<slug>.md`. These files must exist (they come from mirroring the BRE source).

### modernization.html
- `SCORES` — `[{ code, en, th, score, pct }]` for INF/APP/DATA/SEC/OPS. `pct = score/4*100`. **Fill real numbers** (they ship as `score:/*x*/ 0`).
- `F` — findings array (commented out; activate). Each `{ cat, id, s, crit, en, th, gEn, gTh, rEn, rTh }`.
- `P` — AWS pathways array (commented out; activate). Each `{ name, th, status, pr, ef, svc[], en, tha }`.
- Static spots: hero score+badge, classification tier box + finding counts, overall ring color, the score-sum math line, and the target-architecture Mermaid (a `PLACEHOLDER[…]` stub — unwrap and align to the real bounded contexts).

### roadmap.html
- `debt` — tech-debt register rows `{ s, en, th, loc }` (commented out; activate).
- Phase/timeline content — align to the MRA pathways and BRE extraction order.

### reference.html
- `domains` — `[ "domain-<slug>", en, th ]` (note the `domain-` prefix — it feeds `bre/detailed-domain-bre/<that>/…`).
- `services` — `[ "<slug>", en, th ]` → `bre/domain-decomposition-overview/service-<slug>.md`.
- `TREE` — the document-browser outline. The shipped `TREE` may include only the `codebase/` groups; **add the BRE groups** (Getting Started, Domain Decomposition, Target Service Specs using `domainSubgroups`/`services`, Detailed Domain BRE, Cross-Cutting, Reference Catalogs, BRE Diagrams, Database) so the whole `content/bre/` set is browsable. Every `doc:` path must exist under `content/`.
- If you created `content/interfaces/`, **append a group for it** — embedded documents that no `TREE` entry points at are invisible, which is the quiet way a supplied spec ends up missing from the deliverable. Follow the existing group shape and point at the generated filenames:
  ```js
  { g:{ en:"Interface Specs", th:"สเปกอินเทอร์เฟซ" },
    items: [
      {en:"Overview",th:"ภาพรวม",doc:"interfaces/00-index.md"},
      {en:"REST API (OpenAPI)",th:"REST API (OpenAPI)",doc:"interfaces/swagger-openapi.md"},
      {en:"Postman Collection",th:"Postman Collection",doc:"interfaces/postman-postman.md"},
    ]},
  ```
  `normalize_interfaces.py` prints the exact filenames it wrote; use those rather than guessing, since the stem comes from the source file's name.

### knowledge-graph.html / kg-data.js
`assets/js/kg-data.js` exports (all consumed by `kg-graph.js`):
- `categories` — keyed by category (`application|domain|shared|database|external|infra`); **every node's `cat` must be a key here** or the renderer throws.
- `nodes` — `{ id, cat, size }`.
- `links` — `{ source, target, type, label? }`; **every `source`/`target` must be an existing node id** (D3 throws otherwise). `type` ∈ `contains|uses|sync|shareddb|external|owns|impl`.
- `details` — per-node drilldown `{ cat, role?, complexity?, independence?, priority?, phase?, desc, kpis?, methods?[], tables?[], entry?[], inbound?[], outbound?[], blockers?[] }` (all optional, guarded).
- `dbDetail` — `{ <dbId>: { ctx, owners, note } }`.
- `externalDetail` — `{ <extId>: { desc, risk } }`.
- `migrationPlan` — **used without guards**, so populate fully: `{ phases:[{title,items:[{o,nm,mt}]}], infra:[…], blockers:[{sev,b,svc,cost,blast}], cycle:{pair,desc,res} }`. An empty `{}` here crashes the migration panel.

---

## 6. Adapting the template when it does not fit

The scaffold was authored around an example project. Do not force the target's reality into the example's shape — **adapt the template** (SKILL.md and the user both expect this). Common adaptations:

- **Domain count.** The example may show 6 domains; your BRE may have 5. Set `domains`/`DOMAINS` to the real set and fix every "N bounded contexts / N Business Domains" string (index hero KPI, headings, exec summary, target-architecture diagram) so the whole site agrees with the BRE manifest.
- **Database topology.** The example ships a multi-database server matrix. If the target has a single shared database, replace the 9-column matrix with a single-DB view and tell the coupling-seam story honestly (shared DB = the seam). Rebuild the related Mermaid diagrams accordingly.
- **MRA rating band.** The template hero may hard-code "Not Ready"; the report may say "Needs Work". Trust the report — update badge text, ring color, and the classification narrative to match, and keep the per-category "Not Ready" tags where the report assigns them.
- **Missing docs.** If a NAV/TREE link targets a doc your BRE run did not emit, repoint it to the closest real doc rather than shipping a 404.

When you adapt, keep both languages in sync and keep numbers consistent across pages. The whole site should tell one coherent, report-accurate story.
