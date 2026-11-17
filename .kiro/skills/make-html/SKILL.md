---
name: make-html
description: "Generate an enterprise-grade static HTML documentation website from AWS Transform (ATX) assessment reports and the analyzed codebase. Use this skill whenever the user wants to build, generate, or refresh an HTML site/portal/dashboard from ATX outputs — comprehensive-codebase-analysis (CCA), business-rules-extraction (BRE), or modernization-readiness-analysis (MRA) — or mentions html-template, html-sample, an assessment site, a documentation site, or 'make html' / 'สร้าง html' / 'ทำเว็บเอกสาร' from a modernization/migration assessment. Also trigger when the user points at an ATXDocumentation/ or business-rules-extraction/ folder, a modernization-readiness-analysis report, or transform-*.yaml files and wants them turned into a browsable bilingual (Thai/English) site with Mermaid diagrams. Handles supporting inputs too: OpenAPI/Swagger specs, Postman collections, Word/PDF interface documents, database schema DDL and data exports. Produces a premium bilingual Mermaid-rich Tailwind site that opens over file://."
license: Proprietary
metadata:
  version: 1.0.0
  keywords: atx, aws-transform, html, documentation-site, codebase-analysis, business-rules-extraction, modernization-readiness, mermaid, bilingual, enterprise, static-site, reverse-engineering, codekb, aidlc, knowledge-graph, deep-dive-analysis, screen-flow, module-dependency, evidence-based, source-of-truth, openapi, swagger, postman, interface-spec, database-schema, data-export
  companion_skills:
    - doc-coauthoring          # conducts the engagement (context → refine → reader-test)
    - aidlc-reverse-engineering # OPTIONAL accelerator, separate install — check presence before offering it; references/deep-analysis.md is the always-available fallback
    - pdf                       # extracts text/tables from PDF interface specs (optional)
    - docx                      # extracts content from Word interface specs (optional)
  supported_platforms:
    - kiro-ide
    - kiro-cli
---

# Make HTML — ATX Assessment Documentation Site Generator

## Overview

You turn AWS Transform (ATX) assessment output into a polished, enterprise-grade, **bilingual (Thai / English)** static HTML site that a customer can open directly in a browser. The site is a comprehensive, deep-dive documentation portal: architecture, business rules per bounded context, modernization scoring, roadmap, an interactive knowledge graph, and a full document browser — all driven by **Mermaid** diagrams and the actual report data.

You do **not** invent findings. The three ATX reports plus the analyzed codebase are the **source of truth**. Your job is to map that source faithfully into the bundled template, fill every data slot, adapt the template where the shipped structure does not fit the target project, and verify the result renders with zero console errors.

This is a build-from-a-scaffold task, not a from-scratch web project. A complete, working scaffold ships with this skill in `assets/html-template/`, and a fully populated real example (a dental-clinic modernization) ships in `assets/html-sample/`. Study the sample to see what "done" looks like; copy the template to start a new site.

## Inputs — the three ATX sources (source of truth)

| ATX report | Typical workspace location | Feeds site section |
|---|---|---|
| **CCA** — comprehensive-codebase-analysis | `ATXDocumentation/` (architecture, behavior, analysis, reference, specialized, technical-debt, diagrams, migration) | Codebase Analysis pages + the `codebase/` document browser tree |
| **BRE** — business-rules-extraction | `business-rules-extraction/` (detailed-domain-bre, domain-decomposition-overview, cross-cutting-documentation, reference-documentation, diagrams, database-documentation) | Business Rules / Domains / Domain deep-dive + the `bre/` document browser tree + Knowledge Graph |
| **MRA** — modernization-readiness-analysis | `services/<app>/modernization-readiness-analysis/*-mod-report.{md,json,html}` | Modernization Readiness (scores, findings, pathways) + Roadmap |

Also scan for `transform-*.yaml` config files (`transform-config-cca.yaml`, `transform-config-bre.yaml`, `transform-config-mra.yaml`, `transform-codebase-analysis.yaml`, `transform-business-rules.yaml`, `transform-modernization-readiness.yaml`) and the target source code — they confirm the stack, entry points, and target architecture.

### Supporting inputs — specs, schema, and data exports

Projects rarely hand you only ATX Markdown. Interface contracts arrive as OpenAPI files or Postman collections, integration agreements as Word or PDF, and the database as a schema dump plus an export of real rows. These are valuable — an OpenAPI file states parameter names the reports may summarize away, and a data export can settle what a cryptic status code actually holds. Take them, but on two conditions: they must be **normalized into Markdown** to be usable by the content pipeline, and they must be **stripped of secrets and personal data** before anything reaches the site.

| Supporting input | How to handle it | Lands in |
|---|---|---|
| **OpenAPI / Swagger** (`.json`, `.yaml`) | `python3 scripts/normalize_interfaces.py <spec> --out <site>/content/interfaces` | `content/interfaces/` |
| **Postman collection** (`.json`) | same script — it auto-detects the format | `content/interfaces/` |
| **Word** (`.docx`) | extract with the `docx` companion skill, then save as Markdown | `content/interfaces/` |
| **PDF** | extract with the `pdf` companion skill, then save as Markdown | `content/interfaces/` |
| **Excel** (`.xlsx`) | convert sheets to Markdown tables (`openpyxl`, or `markitdown` if installed) | `content/interfaces/` |
| **Database schema DDL** (`.sql`) | read directly; drives the ER diagram and data-model sections | page data + `content/` mirror |
| **Database data export** (rows) | **analysis input only** — see the guardrail below. Never copied into `content/` | nothing; findings only |
| **Images** — architecture slides, topology diagrams, screenshots (`.png`, `.jpg`, `.svg`, `.webp`) | read them to inform your analysis; copy the ones the site should display into `assets/img/` — see below | `assets/img/`, referenced from pages |

`content/interfaces/` is a **third content tree alongside `bre/` and `codebase/`**, and `build-embed.js` picks it up automatically. Keep it separate rather than folding these documents into `content/codebase/`: that tree is a file-for-file ATX mirror verified with `diff -rq`, and mixing in generated documents would both break that check and blur provenance — a reader must be able to tell an ATX finding from a supplied spec. Add the new files to the `reference.html` document TREE so they are browsable, and note their origin on `methodology.html`.

**A spec is a claim, not a behaviour.** An OpenAPI file describes what someone intended the API to be, and a Postman collection describes how someone once called it; both drift from the running code. Treat them exactly like reports — verify against code, and where they disagree, the code wins and the disagreement is itself a finding worth publishing.

`normalize_interfaces.py` cites each section with its source file and JSON pointer, redacts credential-shaped values and internal IPs, and reduces request/response bodies to their **shape** (keys and value types) rather than their contents — exported collections routinely carry live tokens and real patient records, and neither belongs in a shareable deliverable. It prints every redaction it made; record that on `methodology.html`. If a spec cannot be parsed it says so and converts nothing, which is the right outcome: hand-transcribing an endpoint table is how fabrications enter the site.

If a converter for a Word or PDF spec is genuinely unavailable, say so and offer alternatives (install it, export the document to Markdown, or proceed without it and mark the gap). Do not skip it silently, and do not summarize a document you could not open.

### Images — architecture slides, diagrams, screenshots

Projects often carry their clearest architecture explanation in a PowerPoint slide or a hand-drawn topology PNG, and screenshots are frequently the only record of what a screen looks like. Use them, in two distinct ways that must not be confused.

**As an analysis input.** Look at the image and let it guide where to read. A topology slide showing three servers tells you what to go and confirm in `ecosystem.config.js`; a screenshot showing a "call patient" button tells you which handler to trace. But an image is the weakest evidence class in this whole skill: it is undated, unversioned, hand-drawn, and nothing breaks when it goes stale. So a fact read off a picture is a **lead, not a finding** — confirm it in code and cite the code. If you cannot, it stays `INFERRED` with the image named as its basis, or "not determined". Never transcribe boxes and arrows from a slide into an architecture diagram and present it as verified: that is fabrication with extra steps, and it is convincing precisely because someone drew it confidently.

**As site content.** Images are binary, so `build-embed.js` skips them by design — they are never embedded into `docs-data.js`. They ship as real files instead:

```bash
mkdir -p <workspace>/<output-folder>/assets/img
cp <source-image> <workspace>/<output-folder>/assets/img/
```

Reference them with a **root-relative path** — `assets/img/<file>.png` — from a page or from Markdown in `content/`. This matters more than it looks: the doc browser renders Markdown *inside a page that sits at the site root*, so a doc-relative path like `./topology.png` resolves against the site root rather than the document's folder and silently yields a broken image. When you mirror ATX docs that already contain image links, rewrite those paths to root-relative and copy the referenced files across; otherwise the pages render with empty boxes and a console error, which is easy to miss because the surrounding text looks fine.

Prefer a Mermaid diagram over a picture whenever the content allows it — it stays searchable, diffable, bilingual, and legible on any screen, whereas a slide export is a flat artifact nobody can maintain. Keep the image when it carries something Mermaid cannot: a real screenshot, a scanned drawing, a vendor diagram you must reproduce faithfully. Give every image alt text in both languages, since the alt text is what a reader gets when the image fails and what a screen reader announces.

**Images are the blind spot for every text-based check.** The pitfalls checklist greps for secrets and the compliance suite greps for stray data, and neither can see inside a PNG. A dashboard screenshot from a live system routinely contains real patient names, hospital numbers and appointment times; an architecture slide routinely contains internal hostnames and IP addresses. So **open every image and look at it before it goes into the deliverable**, and drop or redact any that shows production data or internal addressing — the same rule the text mirror follows, applied by eye because no grep will do it for you. An image that arrives with the project is not automatically cleared for a shareable site.

### Guardrail — database data exports

A data export is the one input that can turn a documentation site into a data breach. `content/` is embedded into `docs-data.js` and shipped as a file the customer forwards by email, so anything that lands there is effectively published. Exports of real rows therefore stay **outside** the site and serve only to answer questions during analysis.

Use an export to establish, with citations:
- **row counts per table**, and which tables are empty in practice (a table the schema defines but nobody populates is a real finding)
- **the value domain of code-like columns** — status, flag, type, category codes. This is what resolves an `INFERRED` note such as "`Status='A'` appears to mean Active" into a verified statement about which values actually occur.
- **cardinality and relationship reality** — whether an optional FK is used, whether a "one-to-many" is one-to-one in practice

Never put into the site, or into any file under `content/`:
- values from columns holding names, addresses, phone numbers, emails, national IDs, hospital numbers, dates of birth, or free-text notes
- sample rows or "representative records", **including masked or anonymized ones** — de-identification is harder than it looks (a name, a birth date and a room number together re-identify a person), and the reader gains nothing from an example row that a value domain does not already give them
- the export file itself, in any form

State on `methodology.html#redaction` how the export was used — for example "row counts and status-code domains only; no record-level data read into the deliverable" — so a reader knows the depth behind the schema claims and can see that patient data was handled deliberately.

### Guardrail — redaction markings

The finished site is a **file, not a system**: it gets emailed, dropped in a shared drive, and opened months later outside the network it describes. So the deliverable carries the *shape* of the customer's estate without carrying anything that identifies or reaches it. Replace these before the site ships, in `content/`, in page data, and in Mermaid labels alike:

| What | Replace with | Why |
|---|---|---|
| Customer / operator organisation name and acronym | `CUSTOMER_NAME` | Customer identity does not travel in a portable artifact |
| The organisation's DNS domain | `CUSTOMER_DOMAIN` | Identifies the customer and maps its estate |
| Internal hostnames and FQDNs | role label — `app-host`, `db-host`, `trakcare-host` | Says what the box *does*, which is the part a reader needs |
| Private IPs and subnets | `app-host`, `db-host`, `internal-subnet` | Same reasoning; the address adds nothing to a design discussion |
| Database / service account **names** | `DB_USER`, `SVC_USER` | Half of a credential pair is still credential material |
| Secret **values** — passwords, API keys, tokens, connection strings | `[REDACTED]` | Never reproduced, in any form, including "example" values |
| Named individuals, implementation vendor | `AUTHOR_REDACTED`, `VENDOR_REDACTED` | Personal and commercial attribution |
| Schema identifiers that embed the org acronym (e.g. an `ACMEItemCode` column) | consistent neutral prefix (`SvcItemCode`) | Rename **everywhere at once** — schema, ER diagram, prose, JSON — or the model stops agreeing with itself |

Two things make this easy to get wrong:

**Use bare tokens, not `<ANGLE_BRACKETS>`.** `<CUSTOMER_NAME>` looks like the obvious placeholder syntax and is the one trap here: a browser parses it as an unknown HTML element and renders **nothing**, so the footer silently loses its text and the page still looks fine. Curly braces have the mirror-image problem — `{db-host}` collides with Mermaid's rhombus-node syntax in an unquoted label. Bare `CUSTOMER_NAME` and `db-host` render literally in HTML, Markdown, Mermaid and SQL, and still read unmistakably as a redaction.

**Redaction is a finding, not a deletion.** "The `.env.production` file in the working tree contains the database password and a shared API key" is exactly the kind of thing this assessment exists to surface. Keep the finding, keep the variable name, redact only the value. Removing the finding to look tidy hides the risk the customer is paying you to see.

Then say what you did on `methodology.html#redaction` — the template ships that section with a marking table to fill in. Keep the section even when nothing needed redacting and say so, because a reader cannot otherwise tell "nothing was sensitive" from "nobody looked".

The bundled `assets/html-sample/` is redacted to exactly this standard, so you can read it as a worked example of the markings in place.

Report locations vary between projects. Discover them; never assume the dental example's paths.

### When source code is present — assess it

The ATX reports are the primary source, but they are a snapshot and can be incomplete, stale, or missing entirely. **When the target source code is in the workspace, assess it** — that is what fills the deep-dive gaps this site must cover: module dependencies and cross-module calls, API surfaces, interaction diagrams, technology stack with versions.

There are two routes to that assessment, and the difference between them is speed, not authority.

**Route A — read the code yourself, using `references/deep-analysis.md`.** This is the default, because it needs nothing installed: the six-stage pipeline (decompose → modularize → map → analyze → trace → connect) is careful reading with an evidence ledger, and you can always do it. It is also the only route that reaches line-level evidence, which is what the deep-dive sections actually require.

**Route B — reuse or generate a codekb**, if one of these is genuinely available:

- **A codekb already exists** at `aidlc/spaces/<active-space>/codekb/<repo>/` from an earlier run. Reading it costs nothing and it may be current — check its `reverse-engineering-timestamp.md` before trusting it.
- **The `aidlc-reverse-engineering` skill is installed** *and* its harness prerequisites are met, in which case it can generate that codekb now.

**Check both before offering either.** The `aidlc-reverse-engineering` skill is a separate install and is usually *not* present alongside this one:

```bash
ls -d .kiro/skills/aidlc-reverse-engineering ~/.kiro/skills/aidlc-reverse-engineering 2>/dev/null   # skill installed?
ls -d aidlc/spaces/*/codekb/*/ 2>/dev/null                                                          # codekb already there?
which bun && test -f .kiro/tools/aidlc-orchestrate.ts && test -d .kiro/aidlc-common && echo "harness OK"
```

This check is not ceremony. Offering the user a menu option you cannot perform is worse than not offering it: they pick it, you fail, and the whole gate stops meaning anything. **Only put Route B on the GATE 2 menu when the check above passes** — otherwise present Route A as the code-assessment option, which costs you nothing to promise because it depends on no third party.

When Route B does run, `aidlc-reverse-engineering` runs the AI-DLC `reverse-engineering` stage in **isolation** (`--single`), so it produces artifacts without advancing any main AI-DLC workflow. It writes **9 artifacts** to the per-repo code knowledge base (`aidlc/spaces/<active-space>/codekb/<repo>/`), and those same 9 files are what you read when reusing an existing codekb:

| Artifact | Feeds |
|---|---|
| `business-overview.md` | index exec summary, methodology |
| `architecture.md` (incl. **Interaction Diagrams**) | codebase.html, target-architecture + sequence/flow diagrams |
| `code-structure.md` | codebase.html, module-dependency diagrams |
| `api-documentation.md` | API-design diagrams, interfaces, `reference.html` |
| `component-inventory.md` | component diagrams, domain source-file lists |
| `technology-stack.md` | index stack KPIs, methodology |
| `dependencies.md` | **module-dependency graph (cross-module calls + shared modules)** |
| `code-quality-assessment.md` | roadmap tech-debt register, testing-strategy diagram |
| `reverse-engineering-timestamp.md` | freshness/scope note — cite it so readers know what was actually analyzed deeply |

`aidlc-reverse-engineering` is a thin wrapper over the AI-DLC v2 harness, so it needs `bun` plus `.kiro/tools/aidlc-orchestrate.ts` and `.kiro/aidlc-common/` on top of the skill itself — three things that can each be absent independently.

**How to decide:**
- **ATX reports complete** → they are authoritative. Assess the code anyway to enrich the deep-dive diagrams (module dependencies, interaction flows) that ATX tends to summarize thinly.
- **ATX partly missing / stale, source code available** → assess the code and treat the result as a source of truth alongside whatever ATX you have. Say plainly in the site's methodology page which sections came from which source.
- **Route B unavailable** (skill not installed, no codekb, or harness prerequisites missing) → say so plainly and use Route A. Do not fake artifacts, do not silently skip the assessment, and do not offer to install a harness as the remedy for a *missing skill* — the harness cannot supply a skill that was never installed. If the user wants Route B for future runs they can install the skill separately; this run proceeds with Route A, which reaches the same evidence by reading.
- **No source code at all** → ATX reports only; note that limitation in the site.

Never present reverse-engineered output as if it came from ATX, or vice versa — provenance matters to the customer. The same applies to the two routes: a claim you read off a codekb and a claim you traced yourself are both fine, but the methodology page should say which.

## Non-negotiable output requirements

- **Fully self-contained — nothing is fetched at open time.** The deliverable is a file that gets emailed and opened months later on a machine with no route to a CDN, so everything it needs ships inside it: Tailwind, Mermaid, marked, highlight.js and D3 as pinned files under `assets/js/vendor/`, the fonts (`Inter`, `Noto Sans Thai`, `JetBrains Mono`) as `.woff2` under `assets/fonts/` wired through `assets/css/fonts.css`, and the highlight.js theme as local CSS. A network dependency here fails *silently* — Tailwind blocked means the type is right but the whole layout collapses, a font blocked means the wrong typeface with Thai degrading hardest — so copy `assets/` wholesale and never point a `<script>` or `<link>` back at a CDN. Regenerate the vendored files with `python3 scripts/vendor_web_assets.py`; `--check` fails if any page drifted back to the network. Premium, calm, enterprise aesthetic — this is a customer deliverable.
- **Bilingual TH + EN.** Every human-readable string ships in both languages via `<span class="lang-en">…</span><span class="lang-th">…</span>`. **Keep domain/technical terms in their original form** (e.g. TrakCare, Socket.IO, Strangler Fig, OAuth2, PostgreSQL, bounded context, PM2) — translate the prose around them, not the terms.
- **All diagrams are Mermaid**, authored inside `<pre class="mermaid">…</pre>`. Cover the diagram types the assessment supports: technical architecture, data flow, BPMN 2.0 **with separate swimlanes**, sequence diagrams, user journey, interfaces, API design, data model / ER diagram, error handling, testing strategy, deployment topology, module-dependency graphs (cross-module calls + shared modules), and detailed workflows **with parameters**. See `references/authoring-guide.md` for a ready-to-use catalog.
- **Comprehensive deep-dive.** Program calculation logic, external-program linkage, detailed workflows with parameters, and module dependencies must be represented, not summarized away.
- **Main navigation is collapsible.** The shared sidebar's groups collapse and persist their state (already wired in the template); `reference.html` uses its own collapsible `<details>` document tree for the same reason.
- **Opens over `file://`.** Content is embedded into `assets/data/docs-data.js` by `build-embed.js` so Markdown loads without a server. Always regenerate it.

## Guardrails — evidence discipline (applies to everything below)

This site is used to plan real implementation work, so a single fabricated detail does more damage than a missing one: it costs the reader their ability to trust anything else in it. Hold to these without exception.

- **Source code is the source of truth.** Reports, READMEs, comments and prior docs are *hypotheses to verify against code*, never substitutes for it. Where a report and the code disagree, the code wins — and the conflict is itself worth reporting.
- **Never invent, guess, or pad.** No endpoint, table, column, function, parameter, threshold, or dependency goes into the site unless it exists in the source. Do not extrapolate one file's pattern to the rest, and do not claim framework-default behaviour you have not found configured.
- **Cite evidence.** Factual claims about the system carry a `file:line` reference. If you cannot point at a line, you do not know it yet.
- **"Not determined" is a valid, complete answer.** Prefer it over a plausible-sounding guess; it tells the reader exactly where to look next. Never dress an unknown up as a finding.
- **Label inferences.** If the code implies something without stating it, record it as `INFERRED` with the reasoning and the gap — never silently as fact.
- **Diagrams follow evidence.** An arrow with no call site behind it is fabrication in visual form. An incomplete diagram is fine; a fictional one is not.
- **Report coverage honestly.** State what was analyzed deeply, what was skimmed, and what was not analyzed. Never imply completeness you did not achieve.

`references/deep-analysis.md` §1 operationalizes these (citation format, the three states, the specific forbidden moves, and the evidence ledger).

## Conduct the engagement with the `doc-coauthoring` skill

This is a customer-facing documentation deliverable, so **conduct it as a guided co-authoring engagement, not a silent batch job.** At the very start, **activate the `doc-coauthoring` skill** (it ships alongside this one) and follow its active-guide posture — ask, brainstorm, curate, draft, refine, then reader-test — layered on top of the make-html build steps below.

Its three stages map onto this skill's six steps:

| doc-coauthoring stage | make-html steps | What it looks like here |
|---|---|---|
| **1. Context Gathering** | 1–3 (Job plan → Get resources → Discover) | Agree the output folder and task list (step 1), then let the user info-dump; gather and connect the ATX reports as the context source; close gaps with 5–10 clarifying questions and confirm the audience, scope and inventory before proceeding (step 3). |
| **2. Refinement & Structure** | 4–6 (Assess → Prepare → Generate) | Treat **each page as a "section"**. Confirm the page set (structure) first, then for pages that need authored prose/diagrams (domains, modernization narrative, target architecture, roadmap, methodology) briefly brainstorm → curate → draft → refine surgically with the user, in their preferred language. Pages that are pure mirrors of ATX content need less back-and-forth. |
| **3. Reader Testing** | inside step 6 (post-generation) | Beyond the browser/console checks, **reader-test the generated site**: predict 5–10 questions a reader (dentist admin, engineer, exec) would ask, then dispatch fresh sub-agents given only a page's rendered content to answer them. Fix any page where the fresh reader is confused, then re-verify. |

Keep doc-coauthoring's principles throughout: make surgical edits (never reprint whole files), explain the *why* briefly, and always give the user agency to skip a stage or work freeform. If the user says "just generate it," drop the interactive brainstorming and go straight to the build — but still run Reader Testing at the end, since blind spots are exactly what it catches.

## Workflow

Follow these six steps in order. **Steps 1, 3 and 5 are human gates** — stop and wait for the user. Steps 1–3 are conducted as `doc-coauthoring` Stage 1 (see above). Track them on a task list so nothing is skipped.

### 1. Job plan (GATE 1)
Settle three things before touching any file. Keep it short — this is a setup handshake, not a discovery interview; audience and scope are settled at GATE 2 once you know what material actually exists.

1. **Activate the `doc-coauthoring` skill.** It conducts the engagement from here on.
2. **Output folder name** (default `html-report`).
3. **Create the task list** for the run, covering all six steps so none is skipped.

**Do not ask which language to work in.** The site ships bilingual either way, so the choice never reaches the deliverable — and the language the user wrote to you in has already answered it. Match that and move on; asking is a question whose answer is sitting in the message you are replying to.

Then restate the output folder and the task list in one line and **wait for the user to confirm before moving to step 2.**

**This gate is a handshake, not a safeguard** — be honest about which it is. Nothing expensive sits behind it: no report has been read, no file written, and gates 2 and 3 would both catch a wrong output folder long before it reached the deliverable. It exists so the run starts from a stated frame rather than an assumed one, and that is worth one exchange on its own. What it actually prevents is narrower than "rework": it prevents the user discovering at gate 2 that you had been working to a different brief the whole time.

**Pass it automatically when the answer is already on the table.** If the opening message already names the output folder, restate it and continue without stopping. Stopping for a confirmation whose answer you already have trains people to click through the confirmations that do matter. Same when the user says "just generate it": gate 1 passes on the default folder `html-report/`, and gates 2 and 3 become a stated decision rather than a stop.

Build into `html-report/` unless the user names something else. Do not build into `html-sample/` — that name belongs to this skill's bundled reference example, and reusing it makes the deliverable indistinguishable from the model answer in conversation, in file paths, and in anything the customer later receives.

### 2. Get resources
Make sure the things the build needs are actually in hand:
- **The scaffold** — this skill's `assets/html-template/` (the reusable site) and `assets/html-sample/` (the completed reference example).
- **The ATX reports** — CCA, BRE, MRA. Confirm each is present and readable. If one is missing, lives in another repo, or is out of date, this is the doc-coauthoring "info-dump / connect your sources" moment: ask the user to point to it, connect the repo, or regenerate it. Note which reports you have before moving on.
- **The supporting inputs** — interface specs (OpenAPI/Swagger, Postman, Word, PDF, Excel), database schema DDL, and any database data export. Ask for them explicitly; users often have an API spec or a schema dump they did not think to mention because the ATX reports were the headline. Note the format of each, since that decides whether it needs the normalizer script, a companion skill, or nothing.
- **The source code + assessment capability** — if the target source is in the workspace, run the three presence checks from *When source code is present* above: is the `aidlc-reverse-engineering` skill installed, is a codekb already at `aidlc/spaces/*/codekb/`, are the harness prerequisites met. Note what you found; the decision is made at GATE 2, and what you found decides which options you may put on that menu.

### 3. Discover resources — identify source code repositories (GATE 2)
Scan the workspace and build a concrete inventory:
- Locate the source code repositories and the three ATX report sets; note exact paths and completeness.
- Locate `transform-*.yaml`, `*.sql` schema dumps, README, and architecture images.
- Locate the supporting inputs: OpenAPI/Swagger files (`swagger.json`, `openapi.yaml`, often under a `server/`, `api/` or `docs/` folder), Postman collections (`*.postman_collection.json`), interface documents (`.docx`, `.pdf`), spreadsheets that define an import/export contract, and any database data export. Report each with its format so the conversion path is obvious, and flag a data export explicitly — it carries the strictest handling rule.
- Locate the **images**: architecture slides and diagrams (often `img/`, `docs/`, `*.png`, `Slide*.PNG`) and any screenshots. **Open the ones you plan to use** — you cannot judge whether a picture belongs in a customer deliverable without looking at it, and a text scan will not tell you. Report which ones look usable, which show production data or internal addressing, and which are better redrawn as Mermaid.
- Identify the target project name, stack, and the bounded contexts / domains the BRE proposes, with **counts** (domains, tables, features, rules, findings) — you will verify these against the site later.

Use `list_directory`, `grep_search`, and shell `find`. Then **confirm the inventory with the human**: present which of CCA/BRE/MRA are present, where, how complete, the domain list with counts, and anything missing or ambiguous; ask **who the audience is** (exec, engineer, operational staff — it decides how much depth each page carries) and whether they want to **refine scope** (focus on some domains, adjust the target-architecture direction, rename the output folder). Audience belongs here rather than at step 1 because you can only promise depth you now know the material supports.

**Also settle the code-assessment decision here**, since it changes what step 4 can do. State what you found (source code present? codekb already there? `aidlc-reverse-engineering` installed and its harness prerequisites met?) and offer only the options that check out:

- **Read the code directly** (Route A, `references/deep-analysis.md`) — always available, reaches line-level evidence, costs a reading pass. Offer this whenever source code is present.
- **Reuse an existing codekb** — offer only if one is actually on disk; say how stale it is from its timestamp artifact.
- **Run `aidlc-reverse-engineering`** — offer only if the presence check passed. Generates the 9 artifacts; note it takes a full scan pass.
- **ATX reports only** — skip code assessment; the site notes that limitation.

If Route B did not check out, say which piece is missing and move on with Route A rather than dangling an option nobody can take. A menu whose items sometimes cannot be performed teaches the user to stop reading the menu.

Restate the agreed scope, output folder, and code-assessment choice in one line. **Do not proceed until they confirm.**

### 4. Assess code for generate HTML — assess repositories to identify and generate reports
This step is where the raw assessment happens. If GATE 2 chose to run code assessment, **do that first** — the resulting artifacts feed everything after it.

**4a. Assess the source code (if chosen).** For Route A, go straight to 4a′ — the pipeline there *is* the assessment. For Route B, invoke the `aidlc-reverse-engineering` skill: it runs the stage isolated (`--single`), so it will not advance any main AI-DLC workflow, it asks its own scan-breadth question (full rescan vs focused), and it writes the 9 artifacts to the path its `codekb-path` tool prints — do not compose that path yourself. When it finishes (or when reusing an existing codekb), read all 9; `reverse-engineering-timestamp.md` tells you what was analyzed **deeply** vs skimmed, which is what you may legitimately claim on the site. If the invocation fails because the skill turns out not to be installed after all, do not retry it or improvise its output — fall back to Route A and tell the user you switched.

**4a′. Deep-dive the source and build the project knowledge graph.** The codekb artifacts are a structured summary; the site's deep-dive sections (module dependencies, calculation logic, screen flows, end-to-end transactions) need evidence at line level. Run the six-stage pipeline in **`references/deep-analysis.md`**:

> **Decompose** the runtime units → **Modularize** components and their responsibilities → **Map relationships & dependencies** from real call sites, imports and SQL → **Analyze interconnections** (cycles, fan-in/out hotspots, multi-owner tables, chokepoints) → **Trace screen flow** per screen (UI → handler → API → module → query → table, and back) → **Connect end-to-end** business transactions.

Read business rules, calculations, state transitions, SQL and integration adapters **line by line**; skim generated/boilerplate code and say how much you verified. Turn code + schema + documents + meaningful assets into the **knowledge graph** that drives `knowledge-graph.html`, keeping every node and edge backed by a citation. Parallelize independent areas with subagents, but reject any uncited claim they return. Maintain the evidence ledger as you go — it becomes the coverage report on `methodology.html`.

This is what makes the site usable for implementation rather than just orientation: exact formulas with their parameters, real cross-module call edges, and traceable screen-to-database chains.

**4b. Read the ATX reports.** Extract the concrete data each page needs:
- From **BRE**: the domain manifest (names, complexity, tables, features, rules, dependencies, source files), bounded contexts, extraction order, coupling hotspots, external integrations, cross-cutting concerns.
- From **CCA**: architecture, patterns, tech-debt, metrics — these mostly map file-for-file into `content/codebase/`.
- From **MRA**: overall + per-category scores, rating tier, finding counts, top gaps, and the triggered modernization pathways — read the actual `*-mod-report.md`/`.json`; the numbers must match exactly.

**4c. Reconcile the two sources.** Where ATX and the codekb overlap (architecture, components, dependencies, tech stack, quality/debt), they should agree; when they disagree, the **codekb is fresher** (it was just generated from the code) while **ATX/MRA scores stay authoritative for scoring**. Surface any material conflict to the user rather than silently picking one, and record the provenance of each section for the methodology page.

Cross-check the counts against the manifest/master-index. `references/source-mapping.md` gives the precise field-to-page mapping (including the 9 codekb artifacts) and the reconciliation rules.

### 5. Prepare for generate HTML — confirm and connect artifact repositories, then start (GATE 3)
Confirm the build plan with the user: output folder, the page set (this is doc-coauthoring's "agree the structure" step), and any template sections that must be **adapted** to this project (e.g. a single shared database vs. the template's multi-database matrix). Get the go-ahead, then kick off the build by connecting the artifacts:

1. **Copy the scaffold.** `cp -R assets/html-template <workspace>/<output-folder>`.
2. **Mirror the ATX sources into `content/`.** The scaffold ships with **empty** `content/bre/` and `content/codebase/` on purpose (no demo data, so nothing from another engagement can leak into a customer deliverable). Fill them from the sources you confirmed in step 3:
   ```bash
   cd <workspace>/<output-folder>
   cp -R <cca-source>/.  content/codebase/     # e.g. ATXDocumentation
   cp -R <bre-source>/.  content/bre/          # e.g. business-rules-extraction
   ```
   (MRA data goes into page JS, not `content/`.) If you are **refreshing an existing site** rather than starting clean, replace the trees wholesale (`rm -rf content/codebase content/bre` first) — a plain `cp -R` merges, so stale docs from a previous run would survive.

   Afterwards sanity-check the deliverable contains only this project's material: `ls content/bre/detailed-domain-bre/` should list only your project's `domain-*` folders.

3. **Normalize the supporting inputs into `content/interfaces/`** (skip if there are none). The content pipeline renders Markdown, so specs have to be converted rather than dropped in raw — a `.docx` or `.pdf` read as UTF-8 becomes mojibake, and raw JSON in the doc browser is unreadable to the audience this site is for:
   ```bash
   python3 <skill>/scripts/normalize_interfaces.py <spec.json> <collection.json> <api.yaml> \
       --out <workspace>/<output-folder>/content/interfaces
   ```
   For Word and PDF use the `docx` / `pdf` companion skills to extract, then save the result as Markdown in the same folder. Read the script's redaction list and carry it into the methodology page. Then add the generated files to the `reference.html` document TREE as their own group, so they appear in the browser rather than sitting embedded but unreachable.

   **Keep the database data export out of `content/` entirely** — use it for analysis only, per the guardrail in the Inputs section.

4. **Copy in the images the site will display** (skip if none). They are files, not embedded content, so they go to `assets/img/` and are referenced root-relatively:
   ```bash
   mkdir -p <workspace>/<output-folder>/assets/img
   cp <reviewed-images> <workspace>/<output-folder>/assets/img/
   ```
   Only copy images you have **looked at** and cleared of production data and internal addressing. If an ATX document you mirrored already links to images, rewrite those links to `assets/img/<file>` and bring the files across, or the page renders an empty box.

   **Scrub identity and secrets from the mirror — the mirror is NOT byte-for-byte when this fires.** See *Guardrail — redaction markings* in the Inputs section above for what to replace and with what. `content/` is embedded into `docs-data.js` and served in a shareable site, so redaction happens *after* copying, then you re-run `build-embed.js`. This means a `diff -rq <source> content/...` will legitimately differ on the scrubbed files; verify identity only on files you did not scrub, and record the scrub on `methodology.html#redaction`. Do not resolve the tension the other way (shipping the real values to keep the diff clean) — the no-secrets rule wins over verbatim fidelity.

### 6. Generate HTML
Execute the build. High level (full mechanics in `references/template-architecture.md`):

1. **Fill every page's data** from the reports — domains, scores, findings, pathways, knowledge-graph nodes/links, doc-browser tree. Many pages ship data **commented out** with an empty active value (`const X = /*[ … ]*/ [];`), as `{{PLACEHOLDER}}` tokens, or inline `score:/*1.10*/ 0`; you must **activate/fill** them or the section renders empty/zero. Treat each page as a doc-coauthoring "section" — for prose-heavy pages, brainstorm → curate → draft → refine with the user.
2. **Author the Mermaid diagrams.** Any diagram wrapped as `PLACEHOLDER["graph …"]` is a broken template stub — **unwrap it** to a real diagram (the label form makes Mermaid throw "Syntax error in text").
3. **Adapt template sections that do not fit** the project's reality, and fix inconsistent counts (domain count, "N bounded contexts") so the whole site agrees with the reports.
4. **Regenerate embedded content:** run `node build-embed.js` inside the output folder so `assets/data/docs-data.js` includes the `bre/`, `codebase/` and (if present) `interfaces/` keys. Read its skip list — anything it skipped is a document the site is missing until you convert it.
5. **Verify (technical)** — serve the folder (`python3 -m http.server`) and load every page; confirm 0 console errors, all data rendered, all Mermaid diagrams produce an `svg` (no "Syntax error in text"), and the collapsible menu toggles.
6. **Reader-test (doc-coauthoring Stage 3)** — predict 5–10 questions real readers would ask, then dispatch fresh sub-agents given only a page's rendered content and see if they answer correctly and without confusion. Loop back and fix any page that reads ambiguously, then re-verify. Stop the server when done.

Report what was generated, where, how it was reader-tested, and any point where you deviated from or adapted the template.

## Page inventory

The scaffold ships these pages. All load `assets/js/app.js` + `assets/css/styles.css`, so the top bar and language toggle are consistent everywhere. The nine pages carrying `<aside id="sidebar">` get the shared collapsible sidebar; `reference.html` deliberately replaces it with its own collapsible `<details>` document tree (a doc browser needs the full corpus outline, not the site nav), and `aws-architecture-diagram.html` is a standalone full-bleed diagram page:

| Page | Purpose | Primary source |
|---|---|---|
| `index.html` | Executive dashboard: KPIs, readiness gauge, domain grid, top gaps | CCA + BRE + MRA |
| `codebase.html` | Codebase analysis narrative | CCA |
| `domains.html` | Business-rules overview: domain summary, cards, context map, extraction order, coupling hotspots, integrations, server/DB topology | BRE |
| `domain-detail.html` | Per-domain deep-dive (overview, features, rules, workflows, validations, integrations, diagrams, target service spec) | BRE (`content/bre/detailed-domain-bre/domain-<slug>/`) |
| `modernization.html` | MRA scores, classification, detailed findings, AWS pathways, target architecture | MRA |
| `roadmap.html` | Phased modernization roadmap + tech-debt register | MRA + CCA |
| `reference.html` | Full document browser over everything in `content/` (codebase + bre trees) | CCA + BRE |
| `knowledge-graph.html` | Interactive D3 graph of services/domains/DB/externals + decomposition/migration plan | BRE (`assets/js/kg-data.js`) |
| `methodology.html` | How the assessment was produced | template + transform configs |
| `application-reference.html`, `aws-architecture-diagram.html` | Supplementary reference pages | project-specific |

## Reference files

Read these when you reach the relevant step — they hold the detail that does not fit here:

- **`references/template-architecture.md`** — how the scaffold works: file layout, the `app.js` NAV array + collapsible-menu mechanism, `build-embed.js` / `docs-data.js`, each page's exact data-array contract, and the three "fill me" patterns (`{{PLACEHOLDER}}`, commented-out arrays, `PLACEHOLDER["…"]` Mermaid stubs) with how to resolve each. **Read before step 6.**
- **`references/source-mapping.md`** — exact mapping from each ATX folder/report field to the page and JS variable it feeds, the rule that MRA numbers must be reconciled to the report (not left at template defaults), and **§6: the 9 `aidlc-reverse-engineering` codekb artifacts → which deep-dive sections they feed, with the ATX-vs-codekb precedence rules**. **Read during steps 4–6.**
- **`references/deep-analysis.md`** — the evidence discipline in operational detail (citation format, three states, forbidden moves, evidence ledger), the six-stage decompose→modularize→map→analyze→trace→connect pipeline, line-by-line reading discipline and how to scale it honestly, the code-level Knowledge Graph schema, screen-flow tracing recipe, and coverage reporting. **Read during step 4 whenever source code is in scope.**
- **`references/authoring-guide.md`** — bilingual span conventions, the Mermaid diagram catalog for every required diagram type (incl. BPMN swimlanes and parameterized workflows), a pitfalls checklist, and the browser-verification procedure. **Read during step 6.**

## Bundled resources

- `assets/html-template/` — the reusable scaffold. Copy this to start a new site.
- `assets/html-sample/` — a complete, real, populated example (dental-clinic modernization, 5 bounded contexts). Use it as the reference for structure, tone, bilingual phrasing, and diagram style. Do not ship it as the customer's site; it is the model answer.
- `scripts/normalize_interfaces.py` — converts OpenAPI/Swagger and Postman collections into cited Markdown for `content/interfaces/`, redacting credentials and internal addresses and reducing payloads to shapes. Run it instead of transcribing a spec by hand; `--help` documents the arguments.
