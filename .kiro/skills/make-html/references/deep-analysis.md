# Deep Source-Code Analysis → Project Knowledge Graph

How to extract complete, trustworthy application knowledge from source code so the site (and any AI or engineer reading it afterwards) understands the whole project's relationships instead of hunting file by file. Read during SKILL.md step 4.

**The source code is the only source of truth here.** Reports, comments, READMEs and prior documentation are *hypotheses* to verify against code, never substitutes for it.

## Contents
1. Evidence discipline (the guardrails, operationalized)
2. The six-stage pipeline
3. Line-by-line reading discipline (and how to scale it honestly)
4. Building the Knowledge Graph
5. Screen-flow tracing (Frontend → API → Database)
6. Where the output lands in the site
7. Coverage reporting

---

## 1. Evidence discipline (the guardrails, operationalized)

The value of this analysis collapses the moment one fabricated detail enters it, because the reader can no longer trust any of it. Treat that as the governing constraint, not a style preference.

### Cite everything

Every factual claim about the system carries a **file + line** reference:

```
`workload% = booked ÷ onDuty × 100`  — server/modules/doctorSchedule.js:118-134
`POST /patientStatus` writes PatientAppointment.Status — server/event-bridge.js:212
```

A range for logic that spans lines; a single line for a definition or call site. If you cannot point at a line, you do not yet know the thing — go read it, or mark it not determined.

### Three states, and only three

| State | Meaning | How to write it |
|---|---|---|
| **Verified** | You read the code that proves it | State it plainly + cite `file:line` |
| **Partial** | You read some of it; part is unread | State what is established, then name precisely what is unread |
| **Not determined** | You did not establish it | Say "not determined from the source" — and stop there |

"Not determined" is a **correct, complete answer**. It is far more useful than a plausible guess, because it tells the reader exactly where to look next. Never convert it into prose that reads like a finding.

### Inferences must be labelled and justified

Sometimes the code implies something it does not state (a naming convention, an implicit contract). You may record it, but never disguised as fact:

```
INFERRED: RoomDetail.Status "A" appears to mean Active — every query filters
Status='A' for current rooms (roomDetail.js:44, jobsh.js:88) but no enum or
comment defines the letter. Confirm with the team.
```

Anything you cannot back with a line reference is either labelled `INFERRED` with its reasoning and its gap, or it is omitted.

### Specific things that are forbidden

These are the failure modes that actually happen — each one produces confident, wrong documentation:

- **Inventing an endpoint, table, column, function, or parameter** because the architecture "should" have one. If `GET /patients` is not in the code, it does not exist.
- **Guessing a column's meaning** from its name. `FLAG1` is not "isActive" until a line proves it.
- **Assuming framework defaults apply** without reading the config. Do not claim connection pooling, CORS, auth middleware, or caching behaviour from library knowledge alone — find where it is configured, or mark it not determined.
- **Extrapolating one file's pattern to all files.** Reading three modules that use `pgpool` does not establish that the fourth does.
- **Copying a claim from a report or a spec** (ATX, README, a prior doc, an OpenAPI file, a Postman collection, a Word/PDF interface document) into the site as verified. Specs drift especially badly because nothing breaks when they go stale — an endpoint in `swagger.json` with no route registration does not exist. If it matters, verify against code and cite the code. If it conflicts with code, the code wins, and the conflict is itself worth publishing.
- **Completing a partially-read call chain.** If you traced a handler to a service method but not into the query, say the chain is established to that point.
- **Filling a diagram for symmetry.** An arrow with no call site behind it is fabrication in visual form. Diagrams follow evidence; incomplete is fine, fictional is not.

### Keep an evidence ledger

Maintain a working ledger (a scratch Markdown file is fine) as you read, so the site's claims stay traceable and you never re-derive the same fact:

```markdown
| Claim | Evidence | State |
|---|---|---|
| Room status thresholds 30/70/100% | doctorSchedule.js:140-158 | Verified |
| Late-patient alert fires at 10 min | Dashboard/index.js:507-560 | Verified |
| Booking permission list | booking.js:31-38 (hardcoded array) | Verified |
| Who consumes /roomDetail besides SPA | — | Not determined |
```

This ledger is also what makes the coverage report (§7) truthful rather than aspirational.

---

## 2. The six-stage pipeline

Run these in order — each stage consumes the previous one's output. The aim is to move from "a pile of files" to "a connected model of the system."

### Stage 1 — Decompose the system
Establish the real top-level structure from evidence: entry points, deployable processes, build targets, and runtime boundaries.

Look for: process entry files, server bootstraps, `main`/`index` files, build configs, process managers (PM2 `ecosystem.config.js`, Dockerfiles, systemd units), and route registration. Record each unit with its entry file and how it starts.

Output: a list of runtime units (e.g. *App Service — `server/app.js`, Express, port 8081, cluster mode*) each with citations.

### Stage 2 — Modularize components
Within each unit, identify the modules/components and what each is responsible for. Read the module, do not infer from its filename.

For each: exported surface (functions/classes and their signatures), owned state, side effects (DB writes, network calls, timers, event emission), and a one-line responsibility you can defend from the code.

Output: a component inventory — component → file(s), exports, responsibility, side effects, citations.

### Stage 3 — Map relationships & dependencies
Now connect them. Build the dependency edges **from actual references**, not from architecture intuition:

- `import` / `require` / include statements → module dependencies
- function/method call sites → call edges (record the calling line)
- SQL statements → module→table edges, tagged read or write
- HTTP clients → module→external-system edges
- event emit/subscribe pairs → async edges
- shared modules → the fan-in points many modules depend on

Distinguish **cross-module calls** from **shared/utility modules**: a utility everything imports (pool, logger, auth) is a different architectural fact than a business module reaching into another business module. The second is coupling worth reporting; the first is infrastructure.

Output: a dependency edge list, each edge citing the line that creates it.

### Stage 4 — Analyze interconnections
Interpret the graph from stage 3 to surface structural facts:

- **Cycles** — module A ↔ B (report the two call sites that close the loop)
- **Fan-in hotspots** — the orchestrator every module depends on
- **Fan-out hotspots** — the module that touches many others' data
- **Multi-owner tables** — a table written by more than one module (a decomposition seam)
- **Chokepoints** — a single process that is the sole writer or sole gateway for a flow
- **Dead ends** — exported functions with no call site found (state that you searched, and where)

Output: findings with severity and the evidence for each — this is what makes the coupling/hotspot sections of the site defensible.

### Stage 5 — Trace screen flow
Per screen/page, trace the full path end to end. Details in §5.

Output: per-screen chains — UI element → handler → HTTP call → route → module → query → table, and back.

### Stage 6 — Connect end-to-end
Stitch the per-screen chains and the dependency graph into whole-system flows: a business transaction from user action (or external event) through every component to persistence and back to the UI, including the real-time path if one exists.

Verify each hop exists in code. Where a hop is unverified, mark the chain **partial** at that point rather than closing it with an assumption.

Output: end-to-end transaction flows, each hop cited — the backbone of the site's data-flow, sequence, and BPMN diagrams.

---

## 3. Line-by-line reading discipline (and how to scale it honestly)

"Line by line" means the logic that carries meaning is actually read — not that every line of every file gets equal attention. Be deliberate and transparent about the difference.

### Read exhaustively (line by line)
- Business rule and calculation logic — thresholds, formulas, state machines, validation
- Status/state transitions and the conditions that trigger them
- SQL statements and anything building them dynamically
- Integration adapters — auth, retries, error mapping, timeouts
- Event handlers and schedulers, including their timing parameters
- Anything the site will state as a rule, number, or workflow step

For calculations, transcribe the actual expression and its inputs, units, and rounding. For state machines, enumerate the transitions found. These are the details downstream implementation depends on being exact.

### Read structurally (skim with intent)
- Generated code, vendored libraries, lockfiles, build output
- Boilerplate, scaffolding, repetitive CRUD once the pattern is verified in a few instances (and say how many you verified)
- Styling and static assets, unless they encode business meaning (e.g. a status colour map — that *is* business logic)

### Scaling without lying
- **Prioritize by the questions the site must answer.** Work backwards from the pages/diagrams you owe.
- **Parallelize with subagents** for independent areas (one per module or screen), each instructed to return findings **with `file:line` citations** and to report unread areas explicitly. Do not accept a subagent's uncited claim into the site.
- **Work in passes** — breadth first (inventory + edges), then depth on the areas that carry business rules.
- **Record coverage as you go** in the ledger, so §7's report is a record, not a reconstruction.

If the codebase is too large to cover in the time available, cover the priority areas properly and **report the rest as not analyzed**. A narrow, honest analysis is usable; a broad, partly-invented one is not.

---

## 4. Building the Knowledge Graph

The graph is the deliverable that lets an AI or a new engineer grasp the project's relationships at once instead of grepping file by file. The site already renders one — `knowledge-graph.html` driven by `assets/js/kg-data.js` (see `template-architecture.md` §5 for the schema contract).

### Extend the schema for code-level entities

`kg-data.js` ships architecture-level categories. For a code-derived graph, extend `categories` with the entity kinds you actually found, then keep the renderer's two hard rules: **every node's `cat` must be a `categories` key**, and **every link endpoint must be an existing node `id`**.

```js
const categories = {
  screen:    { label:"Screen / Page",   color:"#0A84FF" },
  component: { label:"UI Component",    color:"#64D2FF" },
  module:    { label:"Backend Module",  color:"#30D158" },
  fn:        { label:"Function/Method", color:"#00CEC9" },
  endpoint:  { label:"API Endpoint",    color:"#FFD60A" },
  table:     { label:"DB Table",        color:"#FF375F" },
  external:  { label:"External System", color:"#FF9F0A" },
  shared:    { label:"Shared Module",   color:"#5E5CE6" },
};
```

Edge `type` values should name the **real** relationship, so the graph stays interrogable:

| `type` | Meaning | Evidence that creates it |
|---|---|---|
| `renders` | screen renders component | JSX/template usage |
| `navigates` | screen → screen | router link / redirect |
| `calls` | code → code | call site |
| `requests` | frontend → endpoint | HTTP client call |
| `handles` | endpoint → module/handler | route registration |
| `reads` / `writes` | module → table | SQL statement |
| `emits` / `subscribes` | async event pair | emit / listener |
| `imports` | module → shared module | import/require |

Carry the evidence on the edge so the graph itself is auditable:

```js
{ source:"Dashboard", target:"GET /roomDetail", type:"requests",
  ev:"src/routes/index.js:88" }
```

### Include documents, assets and the database

The request is to turn *the whole project* into a graph, not just code:

- **Database** — tables as nodes; columns, PK/FK and indexes as node detail; FK constraints as `references` edges. Take these from the schema DDL, not from model naming. If a **data export** is available, it settles questions the DDL cannot: which tables are actually populated, and what values a code-like column really holds — that is how an `INFERRED` note about `Status='A'` becomes verified. Take only counts and value domains from it; record-level data never enters the graph or any page (see SKILL.md's data-export guardrail — the graph is embedded in a shareable file, so a node detail containing a patient name is a leak).
- **Documents** — specs/READMEs/ADRs as nodes linked to the components they describe (`documents`), which makes stale docs visible when the code moved.
- **Assets** — only where they carry meaning (an Excel import template that defines accepted columns, a status-colour map). Link them to the code that consumes them.

### Keep it faithful
Prune nodes you never verified rather than padding the graph — a smaller graph that is entirely true is worth more than a dense one that is partly imagined. If a relationship is `INFERRED`, mark it on the edge (e.g. `ev:"INFERRED — see note"`) so a reader can discount it.

---

## 5. Screen-flow tracing (Frontend → API → Database)

Trace **per screen**, because that is how both users and implementers think about the system. For each screen, establish this chain with a citation at every hop:

```
Screen/Route
  → UI element + its handler            (component file:line)
  → client call (method, path, params)  (api/service file:line)
  → route registration                 (router file:line)
  → handler / module function           (module file:line)
  → validation + business rule applied  (file:line)
  → SQL / query + tables touched (R/W)  (file:line)
  → response shape returned             (file:line)
  → state update + re-render            (component file:line)
  → real-time path, if any              (emit + listener file:line)
```

Practical order that avoids dead ends:

1. **Enumerate screens from the router** — the route table is the authoritative screen list; do not guess from folder names.
2. **For each screen, list the data it needs** and find the client calls that fetch it (search the component and its hooks/services).
3. **Match each client call to its server route** by method + path, reading the actual registration (watch for prefixes/mounts that change the final path).
4. **Follow the handler into the module** and read the business logic exhaustively (§3).
5. **Record every table touched** and whether read or written, from the SQL itself.
6. **Trace the response back** into state and rendering, so the loop closes.
7. **Note the push path** if the screen also receives WebSocket/SSE updates — including which server event triggers it.

Where a hop cannot be established (e.g. a path built dynamically), record the chain as partial at exactly that hop and name what blocked it. Do not bridge it with a guess.

The output feeds the user-journey, sequence, BPMN-swimlane and data-flow diagrams — and because each hop is cited, those diagrams are defensible.

---

## 6. Where the output lands in the site

| Analysis output | Site destination |
|---|---|
| Runtime units (stage 1) | deployment-topology diagram; `index.html` architecture summary |
| Component inventory (stage 2) | `codebase.html`; component diagrams; per-domain source-file lists |
| Dependency edges (stage 3) | **module-dependency diagram** (cross-module + shared modules); knowledge-graph `links` |
| Interconnection findings (stage 4) | coupling-hotspot cards; cyclic-dependency section; decomposition-seam narrative |
| Screen flows (stage 5) | user-journey, sequence, BPMN-swimlane diagrams; `application-reference.html` |
| End-to-end flows (stage 6) | data-flow diagram; interaction/sequence diagrams |
| Business rules + calculations | `domains.html` rule cards; calculation-logic diagrams (formula + thresholds + parameters) |
| Schema + FK graph | ER diagram; data-model section |
| Knowledge graph | `knowledge-graph.html` via `assets/js/kg-data.js` |
| Coverage + citations | `methodology.html` (see §7) |

Because the site is customer-facing, keep raw `file:line` citations where they help an implementer (component lists, rule cards, the graph's `ev` fields) and keep the executive pages readable. The evidence must exist and be reachable — it does not have to clutter the summary.

---

## 7. Coverage reporting

Close the analysis with an honest statement of scope on `methodology.html`. Without it a reader cannot calibrate how much to trust any section:

```markdown
## Scope of Analysis
Analyzed deeply (line by line):
  server/modules/*.js (11 files), server/event-bridge.js, server/app.js,
  src/pages/Dashboard/, src/routes/index.js
Analyzed structurally (skimmed):
  src/pages/Calendar/, src/pages/Schedule/ (verified CRUD pattern in 2 of 6 files)
Not analyzed:
  build output, vendored libs, src/legacy/ (excluded by scope)
Not determined:
  consumers of /roomDetail beyond the SPA; meaning of RoomDetail.FLAG2
Supporting sources used:
  server/swagger.json (6 endpoints, normalized; 2 documented paths not found in routes)
  dental-db-20241224.sql (schema DDL: 14 tables, 9 FK constraints)
  production data export: row counts and status-code domains only — no record-level
    data entered this deliverable
Analysis date / commit: 2026-08-27 / <sha>
```

Name the supporting sources and the depth you used them at. A reader who knows the endpoint list came from a spec rather than from route registrations will treat it as a checklist to verify, not as ground truth — and stating plainly that a data export was read only for counts is what lets a customer see their patient data was handled deliberately.

State counts you can back (files read, endpoints traced, tables mapped, screens traced) rather than adjectives like "comprehensive". If a section of the site rests on partial evidence, say so at that section — a reader who knows where the edges are can act; one who was told everything is complete cannot.
