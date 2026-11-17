# Source Mapping — ATX reports → site

Exactly where each ATX report's content goes and which page/variable/number it feeds. Read during SKILL.md steps 4–6. The reports are the source of truth; the site must match them.

## Contents
1. CCA → `content/codebase/`
2. BRE → `content/bre/` (+ which files feed which page)
3. The BRE domain manifest (authoritative domain data)
4. MRA → modernization + roadmap (field → number)
5. Reconciliation rules (numbers must match the report)
6. codekb (aidlc-reverse-engineering) → deep-dive sections
7. Supporting inputs → `content/interfaces/` + schema + data exports

---

## 1. CCA (comprehensive-codebase-analysis) → `content/codebase/`

Source: usually `ATXDocumentation/`. This is a near **file-for-file mirror** — copy the whole tree into `content/codebase/` and it feeds `codebase.html` and the `codebase/` half of the `reference.html` document browser.

```bash
cp -R ATXDocumentation/. <site>/content/codebase/
```

Verify identity afterwards: `diff -rq ATXDocumentation <site>/content/codebase` (ignore `.DS_Store`). Typical CCA structure (all Markdown):

```
project-overview.md, README.md, technical-debt-report.md
architecture/{system-overview,components,dependencies,patterns}.md
behavior/{business-logic,workflows,decision-logic,error-handling}.md
reference/{program-structure,modules,interfaces,data-models,api-reference}.md
analysis/{code-metrics,complexity-analysis,dependency-analysis,security-patterns,tech-debt}.md
specialized/{database-patterns,external-integration,realtime-events…}.md
technical-debt/{summary,outdated-components,maintenance-burden,remediation-plan}.md
diagrams/{architecture,structural,behavioral}/*.md
migration/{component-order,test-specifications,validation-criteria}.md
```

The `reference.html` TREE's codebase groups (Getting Started, Architecture, Behavior, Code Reference, Code Analysis, Specialized, Technical Debt, Migration, Diagrams) point at these paths. Filenames vary slightly between ATX runs (e.g. `diagrams/behavioral/sequence-diagrams.md` vs `sequences.md`) — make the TREE `doc:` paths match what actually copied in.

---

## 2. BRE (business-rules-extraction) → `content/bre/`

Source: usually `business-rules-extraction/`. Also a **file-for-file mirror**:

```bash
mkdir -p <site>/content/bre && cp -R business-rules-extraction/. <site>/content/bre/
```

Typical BRE structure and where each part surfaces:

| BRE path | Feeds |
|---|---|
| `00-master-index.md`, `00-guide.md` | reference.html "BRE — Getting Started" |
| `domain-decomposition-overview/` (README, bounded-contexts, data-ownership, shared-kernel, anti-corruption-layers, execution-order, **domain-manifest.json**, `service-<slug>.md`) | domains.html (context map, extraction order), domain-detail (target service spec), reference.html, knowledge-graph |
| `detailed-domain-bre/domain-<slug>/{overview,features,business-rules,workflows,validations,integrations}.md` + `diagrams/{component,sequence,workflow}-diagram.md` | **domain-detail.html** facets |
| `detailed-domain-bre/{README,cross-domain-features,requirements-summary,traceability-matrix}.md` | reference.html "Detailed Domain BRE" |
| `cross-cutting-documentation/*.md` (auth, error-handling, event-publishing, caching, shared-entities, common-*) | reference.html "Cross-Cutting Concerns" |
| `reference-documentation/*.md` (api-endpoint-catalog, coupling-hotspots, cron-daemon-inventory, dead-code-…, external-integrations-map, feature-flag-inventory, service-component-inventory) | domains.html hotspots/integrations; reference.html "Reference Catalogs" |
| `diagrams/*.md` (architecture-diagrams, sequence-diagrams, class-er-diagrams) | reference.html "BRE Diagrams" |
| `database-documentation/{00-global-schema.sql,00-seed-data.json}` | reference.html "Database" |

Note: the BRE domain folders are named `domain-<slug>` (e.g. `domain-patient-appointment`). The `domain-detail.html` `DOMAINS[].slug` and the `reference.html` `domains` entries must use these exact slugs (reference uses the `domain-` prefix; domain-detail uses the bare slug and prefixes `domain-` itself).

---

## 3. The BRE domain manifest — authoritative domain data

`business-rules-extraction/domain-decomposition-overview/domain-manifest.json` is the single source of truth for the numbers that appear all over the site. Read it first and derive every domain figure from it. It contains, per domain: name, complexity/size, table count, feature count, rule count, LOC, entities, source files, and dependency edges (`depends_on` / `depended_on_by`) — the latter give you the extraction order and any **cyclic dependency**.

Cross-check totals with `00-master-index.md` (it summarizes domain count, total features/rules/tables, shared-entity count). Use these totals for the KPI headers on `index.html` and `domains.html`, and make the domain grids sum to them.

**Which report owns which KPI (they legitimately differ, so pick deliberately and stay consistent):**
- **Domain count, features, business rules, tables, per-domain LOC → BRE** (`domain-manifest.json` / `00-master-index.md`).
- **Codebase LOC and file count → CCA** (`analysis/code-metrics.md`, "active source"). BRE's LOC/file totals count only files it decomposed into domains, so they will be *lower* than CCA's active-source totals — both are correct at their own scope. Label the hero KPI accordingly and don't average or reconcile the two.
- **A KPI with no source number is not a KPI.** If a report gives only a qualitative value (e.g. test coverage stated as "effectively 0% / only 1 test file"), render that qualitative value or a figure the report actually states — never invent a percentage. (The scaffold's example once showed a fabricated `2%`; that is exactly the failure to avoid.)

---

## 4. MRA (modernization-readiness-analysis) → modernization + roadmap

Source: `services/<app>/modernization-readiness-analysis/<app>-mod-report.{md,json}`. Read the `.md` (human report) and/or `.json` (structured). MRA data lives in **page JavaScript**, not `content/`.

Field → destination:

| MRA field | Where |
|---|---|
| Overall score (e.g. `1.50 / 4.0`) | index gauge + modernization hero + score-sum line |
| Overall rating tier (Not Ready / Needs Work / Ready) | index gauge badge + sidebar badge + modernization hero/classification |
| Per-category scores INF/APP/DATA/SEC/OPS + rating | index category bars + modernization `SCORES` array (`pct = score/4*100`) |
| Finding counts (n High / n Medium / n Low) | index findings line + modernization classification box |
| Per-question findings (id, score, gap, recommendation) | modernization `F` array |
| Top-5 gaps | index Top-5 cards |
| Modernization pathways (name, status, priority, effort, services, description) | modernization `P` array |
| Representative AWS services / recommended patterns per pathway | modernization pathway cards + target-architecture diagram |
| Archetype, repo type, surface flags | modernization classification section |

The report's "Score Summary" table and "Scoring Notes" give exact category scores and the arithmetic; the "Top 5 Gaps", "AWS Modernization Pathways", and per-pathway sections give the rest.

---

## 5. Reconciliation rules

The template ships with the *example* project's numbers baked into static markup and with some data arrays commented out. **Every figure the reader sees must equal the target's MRA/BRE reports.** Concretely:

1. **Read the real report, then overwrite.** Do not leave the template's default scores, ratings, finding counts, or gap list. Grep the modernization/index pages for the example numbers and replace each.
2. **Rating bands** (used by `ratingOf` in modernization.html): `score < 1.5` → Not Ready (red); `1.5 ≤ score < 2.5` → Needs Work (amber); `score ≥ 2.5` → Ready (green). A 1.50 overall is **Needs Work**, even if several categories are individually Not Ready — represent both truthfully (overall amber; per-category tags as the report assigns).
3. **Percentages** for bars/rings: `pct = score / 4 * 100`. Ring `data-p` for the overall is `overall/4*100`.
4. **Counts agree across pages.** Domain count, "N bounded contexts", tables/features/rules totals, and finding counts must be identical on index, domains, modernization, and knowledge-graph. Pick the report value and propagate.
5. **Findings vs. questions.** The report may state "N High / M Medium / L Low findings" separately from the count of evaluated questions. The `F` array is per-question; the summary line is the report's finding tally. It is fine for these to differ in count — just cite each from the report, do not fabricate.
6. **Activate, don't leave inert.** After filling, confirm no commented-out data array (`= /*[…]*/ []`), no inline `score:/*x*/ 0`, and no live `{{PLACEHOLDER}}` remain (see template-architecture.md §4).

---

## 6. codekb (`aidlc-reverse-engineering`) → deep-dive sections

When the step-3 gate chose to assess the source code, the `aidlc-reverse-engineering` skill writes **9 artifacts** to the per-repo code knowledge base. Resolve the directory with the engine's own tool rather than composing it:

```bash
bun .kiro/tools/aidlc-utility.ts codekb-path --repo <repo>   # prints e.g. aidlc/spaces/<space>/codekb/<repo>/
```

This store is **not** copied into `content/` (that mirrors ATX only). Read it and use it to author page data and diagrams — it is usually the best source for the deep-dive requirements ATX tends to summarize thinly.

| codekb artifact | Use it for |
|---|---|
| `business-overview.md` | `index.html` exec summary, `methodology.html` context, domain purpose prose |
| `architecture.md` | `codebase.html`; the **technical-architecture** and **data-flow** diagrams; its **Interaction Diagrams** section is the source for **sequence / BPMN-swimlane / workflow** diagrams (it depicts how business transactions cross components) |
| `code-structure.md` | `codebase.html`; module/package organization; per-domain **source-file lists** on `domains.html` cards |
| `api-documentation.md` | **API-design** + **interfaces** diagrams; endpoint catalog cross-check; `reference.html` narrative |
| `component-inventory.md` | **component diagrams**; responsibilities + dependency edges per component |
| `technology-stack.md` | `index.html` stack KPIs; `methodology.html`; target-vs-current stack comparison |
| `dependencies.md` | the **module-dependency graph** — cross-module calls and shared modules; coupling hotspots; the knowledge-graph `links` array |
| `code-quality-assessment.md` | `roadmap.html` tech-debt register; the **testing-strategy** diagram; corroborates MRA OPS/quality findings |
| `reverse-engineering-timestamp.md` | the freshness + **Scope of Analysis** note. Cite it on `methodology.html` so readers know what was analyzed deeply vs skimmed — never claim depth the scan did not cover |

### Precedence when codekb and ATX overlap

Both describe architecture, components, dependencies, stack and quality. Resolve conflicts this way:

1. **MRA scores, ratings, finding counts, pathways → always MRA.** The codekb has no scoring; never derive a readiness number from it.
2. **BRE domain model (bounded contexts, domain counts, features/rules/tables) → always BRE.** The codekb describes code structure, not the proposed decomposition.
3. **Concrete code facts (module dependencies, API endpoints, library versions, file organization) → prefer codekb** when it is fresher than the ATX run; it was generated from the current code. Check `reverse-engineering-timestamp.md` against the ATX report dates.
4. **Material disagreements** (e.g. ATX lists a module the codekb cannot find, or versions differ) → surface to the user; do not silently pick one. A conflict often means the ATX report predates recent changes, which is itself worth stating on the site.
5. **Record provenance.** For each authored section note whether it came from ATX or the codekb, and reflect that on `methodology.html`. Customers rely on knowing which claims came from which assessment.

### If the harness is unavailable

`aidlc-reverse-engineering` requires `bun`, `.kiro/tools/aidlc-orchestrate.ts` and `.kiro/aidlc-common/`. If they are absent, do not fabricate codekb artifacts and do not pretend the analysis happened. Either install the AI-DLC v2 harness (user's choice at the step-3 gate) or build from ATX plus your own reading of the source — and in the latter case say so on `methodology.html`, since hand-read findings carry different confidence than a systematic scan.

---

## 7. Supporting inputs → `content/interfaces/`, the schema, and data exports

Beyond the three ATX reports, projects hand over interface contracts and the database itself. These fill gaps the reports summarize thinly — an OpenAPI file names every query parameter, a Postman collection shows the headers a caller actually sends, a schema dump gives real column types and foreign keys. Map them like this.

### 7a. Interface specs → `content/interfaces/`

| Supplied as | Convert with | Result |
|---|---|---|
| OpenAPI / Swagger `.json`, `.yaml` | `python3 scripts/normalize_interfaces.py <spec> --out <site>/content/interfaces` | `<stem>-openapi.md` |
| Postman collection `.json` | same command (format auto-detected) | `<stem>-postman.md` |
| Word `.docx` | the `docx` companion skill → save as Markdown | your filename |
| PDF | the `pdf` companion skill → save as Markdown | your filename |
| Excel `.xlsx` | `openpyxl` (or `markitdown`) → Markdown tables | your filename |

The script also writes `00-index.md`. Register every file in the `reference.html` `TREE` (see `template-architecture.md` §5) — an embedded document with no `TREE` entry is invisible.

Which site sections these feed:

| Content | Feeds |
|---|---|
| Endpoint list (method, path, operation) | API-design diagram; interfaces diagram; cross-check against BRE `api-endpoint-catalog` and codekb `api-documentation.md` |
| Parameters + request/response shapes | `domain-detail.html` integration facets; sequence-diagram message payloads |
| Auth scheme names | cross-cutting auth narrative; error-handling diagram |
| Postman folder structure | how callers group operations — a hint at consumer-side boundaries, not evidence of server structure |
| Word/PDF integration agreements | external-integration narrative; the contract obligations a target service must keep |

### 7b. Precedence — a spec is a claim about the interface

Specs drift from code faster than almost any other artifact, because nothing breaks when they go stale. So:

1. **Code wins over any spec.** If `swagger.json` documents `GET /patients` and no such route is registered, the endpoint does not exist — report the spec as stale rather than publishing a phantom endpoint.
2. **Where a spec and an ATX report disagree**, check both against code before choosing. Do not average them, and do not quietly prefer the newer file.
3. **A disagreement is a finding.** "The OpenAPI spec lists 9 endpoints; 6 are registered in `server/routes/index.js:22-88`" is genuinely useful to an implementer — it tells them the spec cannot be trusted as a migration checklist.
4. **Cite the pointer, not just the file.** `normalize_interfaces.py` emits JSON pointers (`#/paths/~1roomDetail/get`) precisely so a claim traced to a spec is as checkable as one traced to `file:line`.
5. **Never fill a gap from a spec's example.** Examples are illustrative and often fabricated by whoever wrote the spec; they are not evidence of real behaviour. The script omits them for this reason.

### 7c. Database schema DDL

The schema dump (`*.sql`, or BRE's `database-documentation/00-global-schema.sql`) is a strong source — it is generated from the database, so unlike prose it does not drift. Take from it:

| DDL element | Feeds |
|---|---|
| `CREATE TABLE` + column types | ER diagram; data-model section; `table` nodes in the knowledge graph |
| Primary keys, `FOREIGN KEY` constraints | ER relationships; `references` edges in the graph; multi-owner-table analysis |
| Indexes | performance narrative in the tech-debt/roadmap sections |
| `NOT NULL` / defaults / check constraints | validation rules — but only as *database-enforced* rules; application-level validation still has to come from code |

Read column meaning from the DDL and from code that uses it, never from the column name alone. A `FLAG2 CHAR(1)` tells you the shape and nothing about the semantics — that stays `INFERRED` or "not determined" until a line of code or a documented value domain settles it.

### 7d. Database data exports — analysis only, never content

An export of real rows is the one input that can turn this deliverable into a data breach: everything under `content/` is embedded into `docs-data.js` and travels with the site. So an export never lands in `content/`, and no record-level value reaches any page. See SKILL.md's *Guardrail — database data exports* for the full rule; the mapping is:

| What you may take from an export | Feeds |
|---|---|
| Row count per table; which tables are empty in practice | data-model notes; a defined-but-unused table is a real decomposition finding |
| Value domain of code-like columns (status, flag, type, category) | resolves `INFERRED` notes into verified statements; state-machine and decision-logic diagrams |
| Whether optional FKs are actually populated; real cardinality | ER diagram accuracy ("one-to-many" that is one-to-one in practice) |

Nothing else. No sample rows, no "representative record", and **no masked or anonymized examples either** — combining a masked name with a birth date and a room number can re-identify a patient, and a value domain already tells the reader everything an example row would. Record on `methodology.html` how deep you went (for example: "row counts and status-code domains only; no record-level data entered the deliverable") so a reader can calibrate the schema claims and see the handling was deliberate.
