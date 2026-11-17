// ===== Dental Dashboard — Knowledge Graph + Microservices Decomposition data =====
// Source: AWS business-rules-extraction (domain-manifest.json, coupling-hotspots,
// execution-order) + comprehensive-codebase-analysis.

// Category metadata — generic type keys used by the renderer for coloring and
// the legend. KEYS (application/domain/shared/database/external/infra) are
// referenced by kg-graph.js; keep them stable.
const categories = {
  application: { label:"Application",     color:"#0A84FF" },
  domain:      { label:"Business Domain", color:"#30D158" },
  shared:      { label:"Shared Kernel",   color:"#5E5CE6" },
  database:    { label:"Database",        color:"#FF375F" },
  external:    { label:"External System", color:"#FF9F0A" },
  infra:       { label:"Infrastructure",  color:"#98989D" }
};

// Graph nodes. Shape: { id:string, cat:<category key>, size:number }
const nodes = [
  { id:"React SPA",            cat:"application", size:18 },
  { id:"App Service",          cat:"application", size:22 },
  { id:"Event Bridge",         cat:"application", size:20 },
  { id:"Scheduler",            cat:"application", size:18 },
  { id:"patient-appointment",  cat:"domain",      size:26 },
  { id:"care-provider",        cat:"domain",      size:22 },
  { id:"doctor-schedule",      cat:"domain",      size:18 },
  { id:"room-management",      cat:"domain",      size:16 },
  { id:"booking",              cat:"domain",      size:18 },
  { id:"Shared Kernel",        cat:"shared",      size:18 },
  { id:"dental_db",            cat:"database",    size:24 },
  { id:"TrakCare HIS",         cat:"external",    size:20 },
  { id:"OPD Queue",            cat:"external",    size:16 }
];

// Graph links (edges). Shape:
//   { source:<node id>, target:<node id>, type:string, weight?:number, label?:string }
// `type` drives edge styling (contains|uses|sync|shareddb|external|owns|impl).
const links = [
  // frontend
  { source:"React SPA", target:"App Service",  type:"uses", label:"REST · 6s poll" },
  { source:"React SPA", target:"Event Bridge", type:"uses", label:"WebSocket" },
  // services implement domains
  { source:"App Service",  target:"patient-appointment", type:"impl" },
  { source:"App Service",  target:"care-provider",       type:"impl" },
  { source:"App Service",  target:"doctor-schedule",     type:"impl" },
  { source:"App Service",  target:"booking",             type:"impl" },
  { source:"Event Bridge", target:"room-management",     type:"impl" },
  { source:"Event Bridge", target:"patient-appointment", type:"impl" },
  { source:"Scheduler",    target:"care-provider",       type:"impl" },
  { source:"Scheduler",    target:"doctor-schedule",     type:"impl" },
  { source:"Scheduler",    target:"patient-appointment", type:"impl" },
  // domain dependencies (uses)
  { source:"doctor-schedule",     target:"care-provider",   type:"uses" },
  { source:"room-management",     target:"care-provider",   type:"uses" },
  { source:"booking",             target:"care-provider",   type:"uses" },
  { source:"patient-appointment", target:"care-provider",   type:"uses" },
  { source:"patient-appointment", target:"doctor-schedule", type:"uses", label:"cyclic" },
  { source:"patient-appointment", target:"room-management", type:"uses" },
  { source:"doctor-schedule",     target:"patient-appointment", type:"uses", label:"cyclic" },
  // shared kernel
  { source:"patient-appointment", target:"Shared Kernel", type:"uses" },
  { source:"care-provider",       target:"Shared Kernel", type:"uses" },
  { source:"doctor-schedule",     target:"Shared Kernel", type:"uses" },
  { source:"room-management",     target:"Shared Kernel", type:"uses" },
  { source:"booking",             target:"Shared Kernel", type:"uses" },
  // shared database (the coupling seam)
  { source:"patient-appointment", target:"dental_db", type:"shareddb" },
  { source:"care-provider",       target:"dental_db", type:"shareddb" },
  { source:"doctor-schedule",     target:"dental_db", type:"shareddb" },
  { source:"room-management",     target:"dental_db", type:"shareddb" },
  { source:"booking",             target:"dental_db", type:"shareddb" },
  // external integrations
  { source:"care-provider",       target:"TrakCare HIS", type:"sync" },
  { source:"doctor-schedule",     target:"TrakCare HIS", type:"sync" },
  { source:"patient-appointment", target:"TrakCare HIS", type:"sync" },
  { source:"room-management",     target:"OPD Queue",    type:"external" },
  { source:"Event Bridge",        target:"OPD Queue",    type:"external" }
];

// ---- Full extraction detail per node (used by drilldown sheet) ----
const details = {
  "care-provider": {
    cat:"domain", role:"master data", complexity:"medium", independence:"high", priority:1, phase:1,
    desc:"Foundational master-data context for dentists, assistants and the service catalog, synced from TrakCare HIS. Every other domain reads from it, so it is extracted first.",
    kpis:{ Tables:4, Features:7, "Business Rules":8, LOC:"1,266" },
    methods:[
      { n:"retrieveDataToMem", loc:151, cc:5, note:"load providers into cache" },
      { n:"getCareProvider", loc:151, cc:4, fanOut:2, note:"TrakCare sync" },
      { n:"getService", loc:122, cc:3 }
    ],
    tables:["CareProvider","AssistanceDentist","Service","CareProviderService"],
    entry:["careProvider.js","assistanceDentist.js","service.js","careProviderService.js"],
    inbound:[
      { tgt:"patient-appointment", via:"reads", note:"CarpCode, ServiceCode" },
      { tgt:"doctor-schedule", via:"reads", note:"DoctorCode = CarpCode" },
      { tgt:"room-management", via:"reads", note:"CarpCode, AssistCode" },
      { tgt:"booking", via:"reads", note:"CarpCode, AssistCode" }
    ],
    outbound:[ { tgt:"TrakCare HIS", via:"sync", note:"GetCareProviderByLocation / GetService" } ],
    blockers:[
      { sev:"HIGH", desc:"CareProvider/Service/AssistanceDentist are shared tables read by 4 domains.", res:"Own them here; expose via API or replicated read-models instead of shared tables." }
    ]
  },
  "doctor-schedule": {
    cat:"domain", role:"scheduling", complexity:"medium", independence:"medium", priority:2, phase:1,
    desc:"Synchronizes doctor time slots from TrakCare and computes workload utilization (booked service time ÷ on-duty time). Its workload query reaches into three other domains.",
    kpis:{ Tables:2, Features:5, "Business Rules":6, LOC:"339" },
    methods:[
      { n:"retrieveDataToMem", loc:339, cc:7, fanOut:3, note:"workload CTE across 4 tables" },
      { n:"validateScheduleChangeEvent", loc:339, cc:8, note:"temp-table diff" }
    ],
    tables:["DoctorSchedule","DoctorScheduleTemp"],
    entry:["doctorSchedule.js"],
    inbound:[ { tgt:"patient-appointment", via:"reads", note:"SUMSLOT for workload display" } ],
    outbound:[
      { tgt:"care-provider", via:"reads", note:"CareProvider" },
      { tgt:"patient-appointment", via:"reads", note:"appointments in workload CTE — cyclic" },
      { tgt:"room-management", via:"reads", note:"RoomDetail in workload CTE" },
      { tgt:"TrakCare HIS", via:"sync", note:"getDoctorSchedule" }
    ],
    blockers:[
      { sev:"MEDIUM", desc:"Workload CTE joins 4 tables from 3 domains in one query.", res:"Extract workload into a materialized view or a small analytics read-model." },
      { sev:"MEDIUM", desc:"Cyclic dependency with patient-appointment.", res:"Consume events from both contexts instead of synchronous cross-reads." }
    ]
  },
  "room-management": {
    cat:"domain", role:"real-time state", complexity:"small", independence:"medium", priority:3, phase:2,
    desc:"Tracks dental treatment-room assignments in real time via event-driven check-in/check-out from the OPD Queue, broadcasting changes over Socket.IO. Enforces one doctor per room and one room per doctor.",
    kpis:{ Tables:1, Features:7, "Business Rules":6, LOC:"530" },
    methods:[
      { n:"roomDetail (POST handler)", loc:444, cc:9, note:"login/logout state machine" },
      { n:"retrieveDataToMem", loc:86, cc:3 }
    ],
    tables:["RoomDetail"],
    entry:["roomDetail.js","event-bridge.js"],
    inbound:[
      { tgt:"patient-appointment", via:"reads", note:"validates doctor is in room" },
      { tgt:"doctor-schedule", via:"reads", note:"RoomDetail in workload CTE" }
    ],
    outbound:[
      { tgt:"care-provider", via:"reads", note:"CarpCode, AssistCode" },
      { tgt:"OPD Queue", via:"events", note:"POST /roomDetail" }
    ],
    blockers:[
      { sev:"MEDIUM", desc:"event-bridge.js writes both RoomDetail and PatientAppointment.", res:"Split into domain-specific event handlers or inter-service calls." }
    ]
  },
  "patient-appointment": {
    cat:"domain", role:"transactional core", complexity:"large", independence:"low", priority:4, phase:3,
    desc:"The transactional heart of the system — appointment lifecycle from TrakCare sync through status transitions to history archival, plus the real-time 30-room dashboard. Depends on three other domains.",
    kpis:{ Tables:4, Features:10, "Business Rules":11, LOC:"3,816" },
    methods:[
      { n:"validateAppointmentChangeEvent", loc:765, cc:15, fanIn:2, note:"23-col EXCEPT diff" },
      { n:"retrieveDataToMem", loc:765, cc:7, note:"status CASE + provider filter" },
      { n:"returnBlinkPatient (FE)", loc:507, cc:15, note:"8-level nested alarm logic" }
    ],
    tables:["PatientAppointment","PatientAppointmentHistory","PatientAppointmentTemp","PatientStatus"],
    entry:["patientAppointment.js","Dashboard/index.js","routes/index.js"],
    inbound:[ { tgt:"doctor-schedule", via:"reads", note:"appointments for workload — cyclic" } ],
    outbound:[
      { tgt:"care-provider", via:"reads", note:"CareProvider, Service" },
      { tgt:"doctor-schedule", via:"reads", note:"DoctorSlot/SUMSLOT — cyclic" },
      { tgt:"room-management", via:"reads", note:"RoomDetail" },
      { tgt:"TrakCare HIS", via:"sync", note:"GetAppointmentNoGroupBy" }
    ],
    blockers:[
      { sev:"HIGH", desc:"Cyclic dependency with doctor-schedule via workload calculation.", res:"Extract workload as an event-fed read-model so neither service calls the other synchronously." },
      { sev:"HIGH", desc:"Largest, highest-complexity module — extract last.", res:"Add integration tests first, then apply Strangler Fig." }
    ]
  },
  "booking": {
    cat:"domain", role:"planning", complexity:"medium", independence:"high", priority:5, phase:2,
    desc:"Advance room scheduling via a calendar UI and Excel bulk import, with permission-based access control and work-case categories. Minimal coupling — reads only care-provider master data.",
    kpis:{ Tables:2, Features:7, "Business Rules":8, LOC:"1,976" },
    methods:[
      { n:"booking (CRUD)", loc:104, cc:6 },
      { n:"upload (Excel import)", loc:93, cc:7, note:"exceljs parse + validate" }
    ],
    tables:["BookingRoom","Workcase"],
    entry:["booking.js","upload.js","Calendar/index.js"],
    inbound:[],
    outbound:[ { tgt:"care-provider", via:"reads", note:"CareProvider, AssistanceDentist" } ],
    blockers:[
      { sev:"MEDIUM", desc:"Hardcoded booking permission deny-list in code.", res:"Move to a proper authorization model / policy store." }
    ]
  },
  "Shared Kernel": {
    cat:"shared", role:"cross-cutting utilities",
    desc:"Utilities and framework code used by every domain: connection pooling, TrakCare OAuth, cron orchestration, logging and health checks. Must be factored into shared libraries or platform services during decomposition.",
    kpis:{ Components:5, "Used by":"5 domains" },
    tables:[],
    entry:["pgpool.js","accessToken.js","jobsh.js","logger.js","healthCheck.js"],
    blockers:[
      { sev:"HIGH", desc:"jobsh.js orchestrator directly calls 7 modules.", res:"Replace with event-driven or saga-based coordination (Step Functions / EventBridge)." }
    ]
  }
};

// Database → owner / consumer detail. Shape: { ctx, owners, note }
const dbDetail = {
  "dental_db": {
    ctx:"pgpool.js · single pool (max 20)",
    owners:"All 5 domains (patient-appointment, care-provider, doctor-schedule, room-management, booking) read and write this one database.",
    note:"PostgreSQL 14.2 · 13 tables · no schema isolation. The single shared database is the primary coupling seam and a single point of failure (no replica)."
  }
};

// External system detail. Shape: { desc, risk }
const externalDetail = {
  "TrakCare HIS": {
    desc:"InterSystems TrakCare Hospital Information System — system of record for providers, services, appointments and doctor schedules. OAuth2 password-grant REST API (8 endpoints); 60s appointment polling, daily master-data sync.",
    risk:"TLS verification is disabled (NODE_TLS_REJECT_UNAUTHORIZED=0); credentials are stored in plaintext .env files; no request-level circuit breaker."
  },
  "OPD Queue": {
    desc:"External hospital middleware / nurse-station application that POSTs room login/logout and patient-status events to the Event Bridge on port 8080 (/roomDetail, /patientStatus).",
    risk:"Events accepted with only IP filtering (no strong auth); a single fork-mode Event Bridge process is the sole writer for these events."
  }
};

// Strangler-fig migration plan. Shape:
//   { phases:[{ title, items:[{ o, nm, mt }] }], infra:[...],
//     blockers:[{ sev, b, svc, cost, blast }], cycle:{ pair, desc, res } }
const migrationPlan = {
  phases:[
    { title:"Phase 1 · Foundation (weeks 1-6)", items:[
      { o:1, nm:"care-provider", mt:"Extract master-data service first — no domain dependencies; expose via API + replicated read-model." }
    ]},
    { title:"Phase 2 · Parallel reads (weeks 6-14)", items:[
      { o:2, nm:"doctor-schedule", mt:"Extract; move workload calc to an event-fed read-model." },
      { o:3, nm:"room-management", mt:"Extract event-driven room state; split Event Bridge writers." },
      { o:5, nm:"booking", mt:"Extract in parallel — depends only on care-provider." }
    ]},
    { title:"Phase 3 · Transactional core (weeks 14-24)", items:[
      { o:4, nm:"patient-appointment", mt:"Extract last with integration tests; consume schedule/room events instead of cross-reads." }
    ]}
  ],
  infra:[
    "PGPool → per-service schemas on Amazon RDS PostgreSQL + RDS Proxy",
    "AccessToken → shared auth library + AWS Secrets Manager for TrakCare creds",
    "JobScheduler (jobsh) → Amazon EventBridge Scheduler / Step Functions",
    "Logger → structured logs to Amazon CloudWatch",
    "HealthCheck → ALB / container health checks",
    "Containerize the 3 PM2 processes → Amazon ECS Fargate; add CDK IaC + CodePipeline CI/CD"
  ],
  blockers:[
    { sev:"HIGH",   b:"Single shared dental_db (no isolation, no replica)", svc:"RDS PostgreSQL + per-service schemas", cost:"Medium", blast:"All 5 domains" },
    { sev:"HIGH",   b:"jobsh.js orchestrator calls 7 modules directly",     svc:"Step Functions / EventBridge",          cost:"Medium", blast:"7 modules" },
    { sev:"HIGH",   b:"No IaC and no CI/CD (ClickOps + manual PM2)",         svc:"AWS CDK + CodePipeline",                cost:"Medium", blast:"Whole platform" },
    { sev:"MEDIUM", b:"event-bridge.js writes two domains' tables",          svc:"Domain event handlers / SQS",           cost:"Low",    blast:"Room + Patient" },
    { sev:"MEDIUM", b:"Workload query joins 4 tables across 3 domains",      svc:"Materialized view / analytics service", cost:"Low",    blast:"PA + DS" }
  ],
  cycle:{
    pair:"patient-appointment ↔ doctor-schedule",
    desc:"patient-appointment reads schedule slots for workload display, while doctor-schedule's workload CTE reads appointments — a two-way synchronous dependency.",
    res:"Extract workload into a dedicated read-model (materialized view or small analytics service) fed by events from both contexts, so neither service calls the other synchronously."
  }
};
