# Authoring Guide

Conventions and building blocks for filling the site. Read during SKILL.md step 6.

## Contents
1. Bilingual (TH/EN) conventions
2. Mermaid diagram catalog (all required diagram types)
3. Pitfalls checklist
4. Browser verification procedure

---

## 1. Bilingual (TH/EN) conventions

Every human-readable string ships in both languages, side by side. The language toggle in `app.js` shows one at a time by flipping `body[data-lang]`.

```html
<span class="lang-en">Room status thresholds</span><span class="lang-th">เกณฑ์สถานะห้องตรวจ</span>
```

Rules:
- **Keep technical / domain terms in their original form** in both languages. Do not translate: product/system names (TrakCare, Socket.IO, PostgreSQL, PM2), architecture terms (bounded context, Strangler Fig, Anti-corruption Layer, CQRS, saga), protocol/stack names (OAuth2, REST, WebSocket, JWT), AWS service names, and code identifiers. Translate the surrounding prose only. Example TH: `ย้ายระบบแบบ Strangler Fig ออกเป็น 5 bounded context`.
- In JS-rendered data, provide parallel fields (`en`/`th`, `oEn`/`oTh`, `rEn`/`rTh`, `gEn`/`gTh`) — the render code emits both `lang-en`/`lang-th` spans. Never leave a `th` field blank; if unsure, mirror the English with technical terms preserved.
- Numbers, code, and Mermaid diagrams are language-neutral; you generally do not duplicate them. Where a diagram has labels, short bilingual labels (`"Edge / ขอบ"`) or English-with-preserved-terms are both acceptable — stay consistent within a page.
- Markdown in `content/` is typically single-language (as the ATX report emitted it) and is shown verbatim; the bilingual layer is the site chrome and the page-level JS data, not the embedded reports.

---

## 2. Mermaid diagram catalog

Author diagrams inside `<pre class="mermaid">…</pre>`. Mermaid + `mermaid.run()` are already wired by the pages. Below is one correct pattern per required diagram type — adapt node names to the real project from the CCA/BRE reports. Keep labels short; put detail in the surrounding prose.

**Technical architecture** (layered / grouped services)
```
graph TB
    subgraph EDGE["Edge"]
        CF["CloudFront + S3"]; AGW["API Gateway"]
    end
    subgraph SVC["Bounded contexts · ECS Fargate"]
        A["Service A"]; B["Service B"]
    end
    RDS[("Aurora PostgreSQL")]
    CF --> AGW --> A & B --> RDS
```

**Data flow**
```
graph LR
    SRC["TrakCare HIS"] -->|"OAuth2 sync"| SCH["Scheduler"]
    SCH --> DB[("dental_db")] --> APP["App Service"] -->|"6s poll"| SPA["React SPA"]
```

**BPMN 2.0 with separate swimlanes** — use a `flowchart` with one `subgraph` per lane (actor/system), and cross-lane edges declared after the lanes:
```
flowchart TB
    subgraph L1["Lane: Dental Assistant / ผู้ช่วยทันตแพทย์"]
        A1(["Start"]) --> A2["Call patient"] --> A3{"Patient present?"}
    end
    subgraph L2["Lane: System / ระบบ"]
        B1["Update PatientStatus"] --> B2["Broadcast via Socket.IO"]
    end
    subgraph L3["Lane: TrakCare / TrakCare"]
        C1["Return appointment record"]
    end
    A3 -->|"Yes"| B1
    A3 -->|"No"| A2
    B2 --> C1
```
(For true horizontal swimlanes keep `flowchart TB` with vertical lanes as above, or `LR` with the lanes stacked — pick what reads clearly and label each lane with the actor.)

**Sequence diagram**
```
sequenceDiagram
    participant SPA as React SPA
    participant API as App Service
    participant DB as dental_db
    SPA->>API: GET /roomDetail
    API->>DB: SELECT … WHERE status='Active'
    DB-->>API: rows
    API-->>SPA: 200 room list
    Note over API,DB: 60s in-memory cache refresh
```

**User journey**
```
journey
    title Assistant manages the queue / ผู้ช่วยจัดการคิว
    section Dashboard
      Open 30-room grid: 4: Assistant
      Spot color/alert change: 3: Assistant
    section Act
      Call next patient: 5: Assistant
      Update status: 4: Assistant, System
```

**Interfaces / API design** — a class diagram for interface contracts, or a flow for endpoints:
```
classDiagram
    class RoomDetailAPI {
      +GET /roomDetail() RoomList
      +POST /roomDetail(login|logout) void
    }
    class PatientStatusAPI {
      +POST /patientStatus(Call|Hold|End) void
    }
    RoomDetailAPI ..> PatientStatusAPI : emits events
```

**Data model / ER diagram**
```
erDiagram
    CARE_PROVIDER ||--o{ CARE_PROVIDER_SERVICE : offers
    SERVICE ||--o{ CARE_PROVIDER_SERVICE : in
    ROOM_DETAIL }o--|| CARE_PROVIDER : "assigned to"
    PATIENT_APPOINTMENT }o--|| CARE_PROVIDER : "booked with"
    PATIENT_APPOINTMENT {
      string AppointmentId PK
      string CarpCode FK
      string Status
    }
```

**Error handling**
```
flowchart TB
    T["TrakCare call"] --> C{"HTTP 200?"}
    C -->|"Yes"| OK["Map + cache"]
    C -->|"401"| R["Refresh OAuth2 token"] --> T
    C -->|"5xx / timeout"| L["Log + keep last cache"] --> A["Alert"]
```

**Testing strategy** (pyramid)
```
graph TB
    E2E["E2E · Playwright"] --> INT["Integration · API + DB"] --> UNIT["Unit · Go testing / Vitest"]
```

**Deployment topology** (physical/runtime — group by host)
```
graph TB
    subgraph HOST["App server · PM2"]
        APP["App :8081"]; EB["Event Bridge :8080"]; SCH["Scheduler"]
    end
    DB[("DB server · PostgreSQL :5432")]
    APP --> DB; EB --> DB; SCH --> DB
```

**Program calculation logic / detailed workflow with parameters** — show the formula and the parameters on the edges/nodes:
```
flowchart LR
    IN["Inputs: bookedServiceMin, onDutyMin"] --> CALC["workload% = bookedServiceMin / onDutyMin × 100"]
    CALC --> T{"threshold"}
    T -->|"≤ 30%"| G["Available (green)"]
    T -->|"31–70%"| Y["Some appt (yellow)"]
    T -->|"> 100%"| R["Over (red)"]
```

**External program linkage**
```
graph LR
    APP["App Service"] -->|"OAuth2 REST · 8 endpoints"| TRAK["TrakCare HIS"]
    OPD["OPD Queue"] -->|"HTTP POST /roomDetail,/patientStatus"| EB["Event Bridge"]
```

**Module dependencies — cross-module calls + shared modules**
```
graph TB
    JOB["jobsh.js (orchestrator)"] --> CP["careProvider.js"] & DS["doctorSchedule.js"] & PA["patientAppointment.js"]
    subgraph SHARED["Shared modules"]
        POOL["pgpool.js"]; TOK["accessToken.js"]; LOG["logger.js"]
    end
    CP --> POOL; DS --> POOL; PA --> POOL
    CP -.->|"cyclic"| DS
```

Tips: prefer `flowchart`/`graph` for structure, `sequenceDiagram` for interactions, `erDiagram` for data. Quote any label containing spaces, punctuation, `()`, or non-ASCII. Use `<br/>` for line breaks inside labels. Never wrap a whole diagram inside a single node label (that is the `PLACEHOLDER["…"]` bug).

---

## 3. Pitfalls checklist

Run through this before declaring the site done:

- [ ] `grep -rn '{{[^}]*}}' <site> --include='*.html' --include='*.js'` → only matches inside comments remain.
- [ ] `grep -rEn '\*/ *\[\] *;|\*/ *\{\} *;' <site>` → none (every data array activated).
- [ ] `grep -rn 'PLACEHOLDER\["' <site>/*.html` → none (every Mermaid stub unwrapped).
- [ ] No inline commented values like `score:/*1.10*/ 0` remain.
- [ ] `content/codebase` matches the CCA source (`diff -rq`); `content/bre` matches the BRE source.
- [ ] **Deliverable contains only this project's material:** `ls content/bre/detailed-domain-bre/` lists only your project's domains (no leftovers from a previous run).
- [ ] **No secrets in the output:** the site is a customer deliverable, so check nothing sensitive rode along from the reports — `grep -rEin '(password|secret|api[_-]?key|token)[^a-z]*[:=]' content/ | grep -v '\$\|env\|ENABLE_\|x-api-key'` should surface only *names* of env vars, never values. Internal host:port pairs and credentials belong in the customer's private runbook, not a shareable site.
- [ ] `node build-embed.js` ran and `docs-data.js` has both `bre/` and `codebase/` keys (plus `interfaces/` if specs were supplied).
- [ ] **The embedder skipped nothing you needed:** if `build-embed.js` printed a `skipped … non-text file(s)` list, each entry was either converted to Markdown and re-embedded, or is genuinely not needed. A skipped `.docx`/`.pdf` spec that nobody converted is a missing document, not a clean build.
- [ ] **Supplied specs are registered and reconciled:** every file in `content/interfaces/` has a `reference.html` TREE entry (embedded-but-unreachable is the quiet failure), and any endpoint the spec lists but the code does not register is reported as a stale-spec finding rather than published as real.
- [ ] **Every image was opened and looked at.** No grep can read a PNG, so this is the one check that has to be done by eye: no screenshot showing real patient data, no slide showing internal hostnames or IPs. `find <site>/assets/img -type f` should list only images you have personally reviewed.
- [ ] **No broken images:** every `<img>` resolves. In the browser, `[...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src)` returns `[]`. Markdown image links must be **root-relative** (`assets/img/x.png`) — a doc-relative `./x.png` resolves against the site root, not the document's folder, and fails silently.
- [ ] **No data-export residue:** `ls content/` shows only `bre/`, `codebase/` and optionally `interfaces/` — no export dump, and no page or `kg-data.js` node detail carries record-level values (names, HN/patient IDs, phone numbers, dates of birth, free-text notes), masked or otherwise. `methodology.html` states the depth an export was used at.
- [ ] `domain-detail.html` `DOMAINS[].slug` are full slugs matching `content/bre/detailed-domain-bre/domain-<slug>/`.
- [ ] Every `reference.html` TREE `doc:` and every `app.js` NAV `#doc=` path exists under `content/`.
- [ ] MRA numbers (overall, per-category, findings, rating band) are identical across index/modernization and equal the report.
- [ ] Domain count and "N bounded contexts" agree everywhere with the BRE manifest.
- [ ] `kg-data.js`: every node `cat` is a `categories` key; every link endpoint is a node id; `migrationPlan` fully populated.
- [ ] Both languages present for every new string; technical terms preserved.
- [ ] **Provenance is honest:** if a codekb was used, `methodology.html` says so and cites the scan's Scope of Analysis; nothing claims depth the scan did not cover, and no reverse-engineered finding is presented as an ATX finding (or vice versa).
- [ ] **Every claim is evidenced:** rules, formulas, thresholds, endpoints, tables and dependency edges trace to a `file:line` in the evidence ledger. Nothing fabricated, no unlabelled inference, no diagram arrow without a call site behind it.
- [ ] **Unknowns are stated, not filled:** anything not established appears as "not determined", and `methodology.html` carries the Scope of Analysis (deep / skimmed / not analyzed / not determined) with countable figures.
- [ ] `get_diagnostics` clean on edited files; `node -c` passes on standalone `.js`.

---

## 4. Browser verification procedure

The site must render over HTTP/`file://` with zero console errors and all Mermaid diagrams drawn. Verify, don't assume.

1. Serve the folder (do not open `file://` in an automated browser — it is blocked):
   ```bash
   python3 -m http.server 8099    # run from inside <site>, as a background process
   ```
2. Load each page (`http://localhost:8099/<page>.html`) and check:
   - **Console: 0 errors.**
   - Data rendered — e.g. domain grid has the right number of cards, score bars show real numbers, findings/pathways lists are non-empty, doc-browser tree has both codebase + bre groups (and the Interface Specs group if you created one, with each document opening rather than showing "not found"), knowledge graph shows nodes + links.
   - **Mermaid rendered** — for each page, `document.querySelectorAll('.mermaid svg').length` equals `.mermaid` block count, and the page text contains no "Syntax error in text".
   - **Collapsible menu** toggles. On the nine sidebar-bearing pages, click a `[data-navtoggle]` and confirm `.nav-group.collapsed` flips (and survives a reload). On `reference.html` the equivalent check is that its `#treeNav details.tree-group` sections open/close — it has no global sidebar by design, so a `.nav-group` count of 0 there is correct, not a failure.
3. A quick per-page check via the browser tool's evaluate:
   ```js
   () => ({
     mermaidBlocks: document.querySelectorAll('.mermaid').length,
     renderedSvgs: document.querySelectorAll('.mermaid svg').length,
     hasSyntaxErr: /Syntax error in text|Parse error/i.test(document.body.innerText)
   })
   ```
4. Stop the server when done.

If a diagram fails, re-read §2 (usually an unquoted label, a `\n` used instead of `<br/>`, or a leftover `PLACEHOLDER["…"]` wrapper). If a section is empty, re-check the §3 fill patterns.

### 4b. Reader Testing (doc-coauthoring Stage 3)

Technical rendering passing is necessary but not sufficient — the site also has to *make sense to a reader*. Run doc-coauthoring's Reader Testing before calling it done:

1. Predict 5–10 questions real readers would ask, spanning the audiences: a non-technical admin (e.g. "which rooms are over-booked and why?"), an engineer ("what breaks if we split the shared database?"), and an executive ("how ready are we and what's the top risk?").
2. For each, dispatch a **fresh sub-agent** given only the rendered content of the relevant page (not this conversation's context) and the question. Note what it answers correctly vs. misreads.
3. Also ask a sub-agent the standard checks: what is ambiguous, what prior knowledge the page assumes, and whether anything contradicts another page.
4. Fix any page a fresh reader stumbles on (usually a missing definition, an unexplained acronym, or a number that disagrees with another page), then re-run the technical verification.

The site is done when fresh readers answer the predicted questions correctly and surface no new gaps — and the user has done their own final read-through.
