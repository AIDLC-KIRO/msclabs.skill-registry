// ===== {{APP_NAME}} Knowledge Graph + Microservices Decomposition data =====
// Source: AWS business-rules-extraction (v2) + comprehensive-codebase-analysis

// Category metadata — generic type keys used by the renderer for coloring and
// the legend. KEYS (application/domain/shared/database/external/infra) are
// referenced by kg-graph.js; keep them stable. Labels + colors are generic UI.
// Palette follows Apple's system colours for a restrained, premium look on the
// dark graph canvas.
const categories = {
  application: { label:"Application",     color:"#0A84FF" },
  domain:      { label:"Business Domain", color:"#30D158" },
  shared:      { label:"Shared Kernel",   color:"#5E5CE6" },
  database:    { label:"Database",        color:"#FF375F" },
  external:    { label:"External System", color:"#FF9F0A" },
  infra:       { label:"Infrastructure",  color:"#98989D" }
};

// Graph nodes. Shape: { id:string, cat:<category key>, size:number }
// `cat` must be one of the `categories` keys above (drives node color).
const nodes = /*{{KG_NODES_JSON}}*/ [];

// Graph links (edges). Shape:
//   { source:<node id>, target:<node id>, type:string, weight?:number, label?:string }
// `type` drives edge styling (contains|uses|sync|shareddb|external|owns|impl).
const links = /*{{KG_LINKS_JSON}}*/ [];

// ---- Full extraction detail per node (used by drilldown sheet) ----
// Keyed by node id. Shape per entry:
//   { cat:<category key>, role?, complexity?, independence?, priority?, phase?,
//     desc:string, kpis:{ [label]:value },
//     methods:[{ n, cc?, loc?, fanIn?, fanOut?, note? }],
//     tables:string[], entry:string[],
//     inbound:[{ tgt, via, note }], outbound:[{ tgt, via, note }],
//     blockers:[{ sev, desc, res }] }
const details = /*{{KG_DETAILS_JSON}}*/ {};

// Database → owner / consumer detail.
// Keyed by database node id. Shape: { ctx:string, owners:string, note:string }
const dbDetail = /*{{KG_DB_DETAIL_JSON}}*/ {};

// External system detail.
// Keyed by external node id. Shape: { desc:string, risk:string }
const externalDetail = /*{{KG_EXTERNAL_DETAIL_JSON}}*/ {};

// Strangler-fig migration plan. Shape:
//   { phases:[{ title, items:[{ o, nm, mt }] }],
//     infra:string[],
//     blockers:[{ sev, b, svc, cost, blast }],
//     cycle:{ pair, desc, res } }
const migrationPlan = /*{{KG_MIGRATION_PLAN_JSON}}*/ {};
