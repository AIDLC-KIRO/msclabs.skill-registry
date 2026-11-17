/* ============================================================
   Dental Dashboard ATX Assessment — Shared App Script
   Chrome (sidebar/topbar), bilingual toggle, Mermaid, UX
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- Navigation model ---------------- */
  /* ------------------------------------------------------------------
     Navigation model — the single source of truth for the sidebar.

     CONTRACT (verified by the audit script, keep it true when editing):
       1. Sub-links of a page MUST be listed in the same order as the
          corresponding <section id="..."> elements appear in that page.
       2. Every <section id> in a content page SHOULD have a sub-link, so
          the sidebar is a complete table of contents for the site.
       3. Each page's on-page TOC (`[data-toc]`) must list the same
          anchors, in the same order, as this model does.
     ------------------------------------------------------------------ */
  const NAV = [
    {
      title: { en: "Overview", th: "ภาพรวม" },
      links: [
        { href: "index.html", icon: "grid", en: "Executive Dashboard", th: "แดชบอร์ดผู้บริหาร" },
        { href: "methodology.html", icon: "flask", en: "Assessment Methodology", th: "ระเบียบวิธีการประเมิน" },
        { href: "methodology.html#about", icon: "book", en: "About AWS Transform", th: "เกี่ยวกับ AWS Transform", sub: true },
        { href: "methodology.html#transformations", icon: "shapes", en: "Transformations Used", th: "Transformation ที่ใช้", sub: true },
        { href: "methodology.html#pipeline", icon: "route", en: "Assessment Pipeline", th: "ขั้นตอนการประเมิน", sub: true },
        { href: "methodology.html#rubric", icon: "list-checks", en: "Severity Rubric", th: "เกณฑ์ความรุนแรง", sub: true },
        { href: "methodology.html#dimensions", icon: "boxes", en: "Analysis Dimensions", th: "มิติการวิเคราะห์", sub: true },
        { href: "methodology.html#bre-depth", icon: "layers", en: "Method-Level Depth", th: "ความลึกระดับเมธอด", sub: true },
        { href: "methodology.html#effort", icon: "gauge", en: "Effort Classification", th: "ระดับความพยายาม", sub: true },
        { href: "methodology.html#reproducibility", icon: "cpu", en: "Reproducible Config", th: "การตั้งค่าที่ทำซ้ำได้", sub: true },
        { href: "methodology.html#standards", icon: "shield", en: "Standards Alignment", th: "การสอดคล้องมาตรฐาน", sub: true },
      ],
    },
    {
      title: { en: "Codebase Analysis", th: "การวิเคราะห์โค้ด" },
      links: [
        { href: "codebase.html", icon: "layers", en: "Architecture & Code", th: "สถาปัตยกรรม & โค้ด" },
        { href: "codebase.html#architecture", icon: "layers", en: "System Overview", th: "ภาพรวมระบบ", sub: true },
        { href: "codebase.html#tiers", icon: "layers", en: "3-Tier Architecture", th: "สถาปัตยกรรม 3 ชั้น", sub: true },
        { href: "codebase.html#subsystems", icon: "boxes", en: "System Architecture", th: "สถาปัตยกรรมแยกตามระบบ", sub: true },
        { href: "codebase.html#server-instances", icon: "cpu", en: "By Server Instance", th: "แยกตาม Server Instance", sub: true },
        { href: "codebase.html#tech-stack", icon: "cpu", en: "Technology Stack", th: "เทคโนโลยี", sub: true },
        { href: "codebase.html#components", icon: "boxes", en: "Major Components", th: "องค์ประกอบหลัก", sub: true },
        { href: "codebase.html#patterns", icon: "shapes", en: "Patterns & Anti-Patterns", th: "รูปแบบ & Anti-Patterns", sub: true },
        { href: "codebase.html#metrics", icon: "activity", en: "Code Metrics", th: "เมตริกโค้ด", sub: true },
        { href: "codebase.html#security", icon: "shield", en: "Security Analysis", th: "การวิเคราะห์ความปลอดภัย", sub: true },
      ],
    },
    {
      title: { en: "Business Rules", th: "กฎทางธุรกิจ" },
      links: [
        { href: "domains.html", icon: "boxes", en: "Business Domains", th: "โดเมนธุรกิจ" },
        { href: "domains.html#domains-summary", icon: "grid", en: "Domain Summary", th: "สรุปโดเมน", sub: true },
        { href: "domains.html#domain-detail", icon: "layers", en: "Domain Deep-Dive", th: "เจาะลึกรายโดเมน", sub: true },
        { href: "domains.html#bounded-contexts", icon: "git-branch", en: "Bounded Contexts", th: "Bounded Contexts", sub: true },
        { href: "domains.html#execution-order", icon: "route", en: "Extraction Order", th: "ลำดับการแยกบริการ", sub: true },
        { href: "domains.html#cross-cutting", icon: "share", en: "Cross-Cutting Concerns", th: "Cross-Cutting Concerns", sub: true },
        { href: "domains.html#integrations", icon: "plug", en: "External Integrations", th: "การเชื่อมต่อภายนอก", sub: true },
        { href: "domains.html#server-connections", icon: "network", en: "Server Connections", th: "การเชื่อมต่อเซิร์ฟเวอร์", sub: true },
      ],
    },
    {
      title: { en: "Knowledge Graph", th: "Knowledge Graph" },
      links: [
        { href: "knowledge-graph.html", icon: "network", en: "Interactive Graph", th: "กราฟเชิงโต้ตอบ" },
      ],
    },
    {
      title: { en: "Modernization", th: "การปรับปรุงให้ทันสมัย" },
      links: [
        { href: "modernization.html", icon: "gauge", en: "Readiness Assessment", th: "การประเมินความพร้อม" },
        { href: "modernization.html#scores", icon: "activity", en: "Score Summary", th: "สรุปคะแนน", sub: true },
        { href: "modernization.html#findings", icon: "list-checks", en: "Detailed Findings", th: "ผลการประเมินโดยละเอียด", sub: true },
        { href: "modernization.html#pathways", icon: "route", en: "AWS Pathways", th: "เส้นทาง AWS", sub: true },
        { href: "modernization.html#decomposition", icon: "git-branch", en: "Decomposition Strategy", th: "กลยุทธ์การแยกบริการ", sub: true },
      ],
    },
    {
      title: { en: "Roadmap", th: "แผนงาน" },
      links: [
        { href: "roadmap.html", icon: "map", en: "Modernization Roadmap", th: "แผนการปรับปรุง" },
        { href: "roadmap.html#remediation", icon: "list-checks", en: "Remediation Plan", th: "แผนการแก้ไข", sub: true },
        { href: "roadmap.html#sequence", icon: "route", en: "Phased Sequence", th: "ลำดับการดำเนินงาน", sub: true },
        { href: "roadmap.html#debt-register", icon: "shapes", en: "Tech Debt Register", th: "ทะเบียนหนี้ทางเทคนิค", sub: true },
        { href: "roadmap.html#learning", icon: "book", en: "Learning Resources", th: "แหล่งเรียนรู้", sub: true },
      ],
    },
    {
      title: { en: "Developer Reference", th: "คู่มือสำหรับนักพัฒนา" },
      links: [
        { href: "application-reference.html", icon: "app-window", en: "Application Reference", th: "คู่มืออ้างอิงแอป" },
        { href: "application-reference.html#identity", icon: "grid", en: "Identity & Entry Points", th: "ข้อมูลแอป & จุดเริ่มต้น", sub: true },
        { href: "application-reference.html#structure", icon: "layers", en: "Program Structure", th: "โครงสร้างโปรแกรม", sub: true },
        { href: "application-reference.html#config", icon: "cpu", en: "Runtime Configuration", th: "การตั้งค่ารันไทม์", sub: true },
        { href: "application-reference.html#pages", icon: "app-window", en: "Page & Endpoint Inventory", th: "รายการหน้า & Endpoint", sub: true },
        { href: "application-reference.html#services", icon: "shapes", en: "Service & Utility Classes", th: "คลาสบริการ & ยูทิลิตี", sub: true },
        { href: "application-reference.html#data-access", icon: "cpu", en: "Data Access Layer", th: "ชั้นการเข้าถึงข้อมูล", sub: true },
        { href: "application-reference.html#data-models", icon: "boxes", en: "Data Models & Contracts", th: "โมเดลข้อมูล & สัญญา", sub: true },
        { href: "application-reference.html#workflows", icon: "route", en: "Core Workflows", th: "เวิร์กโฟลว์หลัก", sub: true },
        { href: "application-reference.html#rules", icon: "list-checks", en: "Business Rules", th: "กฎทางธุรกิจ", sub: true },
        { href: "application-reference.html#integrations", icon: "plug", en: "External Integrations", th: "การเชื่อมต่อภายนอก", sub: true },
        { href: "application-reference.html#schema", icon: "cpu", en: "Database Schema", th: "สคีมาฐานข้อมูล", sub: true },
      ],
    },
    /* ---- Full Documentation ------------------------------------------
       Mirrors the topic groups of the document tree in reference.html.
       Each entry targets that group's representative document, so the
       sidebar and the doc browser present the same topic order.
       Keep in sync with REF_TREE in reference.html.
       ---------------------------------------------------------------- */
    {
      title: { en: "Full Documentation", th: "เอกสารฉบับเต็ม" },
      links: [
        { href: "reference.html", icon: "book", en: "Document Browser", th: "เปิดคลังเอกสาร" },
        { href: "reference.html#doc=bre/00-master-index.md", icon: "grid", en: "Getting Started", th: "เริ่มต้น", sub: true },
        { href: "reference.html#doc=codebase/architecture/system-overview.md", icon: "layers", en: "Architecture", th: "สถาปัตยกรรม", sub: true },
        { href: "reference.html#doc=codebase/behavior/business-logic.md", icon: "shapes", en: "Behavior & Logic", th: "พฤติกรรม & ตรรกะ", sub: true },
        { href: "reference.html#doc=codebase/reference/program-structure.md", icon: "code", en: "Code Reference", th: "อ้างอิงโค้ด", sub: true },
        { href: "reference.html#doc=codebase/analysis/code-metrics.md", icon: "activity", en: "Code Analysis", th: "การวิเคราะห์โค้ด", sub: true },
        { href: "reference.html#doc=codebase/specialized/database-patterns.md", icon: "cpu", en: "Specialized", th: "เฉพาะทาง", sub: true },
        { href: "reference.html#doc=codebase/technical-debt-report.md", icon: "shapes", en: "Technical Debt", th: "หนี้ทางเทคนิค", sub: true },
        { href: "reference.html#doc=codebase/migration/component-order.md", icon: "route", en: "Migration Guidance", th: "แนวทางการย้ายระบบ", sub: true },
        { href: "reference.html#doc=bre/domain-decomposition-overview/README.md", icon: "git-branch", en: "Domain Decomposition", th: "การแยกโดเมน", sub: true },
        /* This group's documents are generated per proposed service
           (service-<slug>.md), so there is no fixed first document to link.
           Execution Order is used as the stable representative; repoint it at
           your own first service spec if you prefer. */
        { href: "reference.html#doc=bre/domain-decomposition-overview/execution-order.md", icon: "route", en: "Target Service Specs", th: "สเปกบริการเป้าหมาย", sub: true },
        { href: "reference.html#doc=bre/detailed-domain-bre/README.md", icon: "boxes", en: "Detailed Domain BRE", th: "BRE รายโดเมน", sub: true },
        { href: "reference.html#doc=bre/cross-cutting-documentation/authentication-authorization.md", icon: "share", en: "Cross-Cutting Concerns", th: "Cross-Cutting Concerns", sub: true },
        { href: "reference.html#doc=bre/reference-documentation/api-endpoint-catalog.md", icon: "plug", en: "Reference Catalogs", th: "แคตตาล็อกอ้างอิง", sub: true },
        { href: "reference.html#doc=bre/diagrams/architecture-diagrams.md", icon: "network", en: "System Diagrams", th: "ไดอะแกรมระบบ", sub: true },
        { href: "reference.html#doc=bre/domain-decomposition-overview/bounded-contexts.md", icon: "route", en: "Service Candidates", th: "บริการที่เสนอแยก", sub: true },
        { href: "reference.html#doc=bre/database-documentation/00-global-schema.sql", icon: "cpu", en: "Database", th: "ฐานข้อมูล", sub: true },
        { href: "reference.html#doc=bre/domain-decomposition-overview/domain-manifest.json", icon: "boxes", en: "Machine-Readable Artifacts", th: "อาร์ทิแฟกต์เครื่องอ่าน", sub: true },
      ],
    },
  ];

  const ICONS = {
    grid: '<path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    shapes: '<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z"/><rect x="3" y="14" width="7" height="7" rx="1"/><circle cx="17.5" cy="17.5" r="3.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85M7 16.5l5-3M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/>',
    "git-branch": '<line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    plug: '<path d="M12 22v-5M9 8V2M15 8V2M18 8H6v4a6 6 0 0 0 12 0Z"/>',
    gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    "list-checks": '<path d="m3 17 2 2 4-4M3 7l2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
    route: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
    map: '<path d="M9 3 3 5.5v15L9 18l6 3 6-2.5v-15L15 6 9 3Z"/><path d="M9 3v15M15 6v15"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    flask: '<path d="M9 3h6M10 3v6.5L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-8.5V3"/><path d="M7.5 14h9"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    network: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M6.7 7.4 10.6 15.9M17.3 7.4 13.4 15.9M7.2 6h9.6"/>',
    "app-window": '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20"/><circle cx="6" cy="6.5" r=".6"/><circle cx="8.5" cy="6.5" r=".6"/>',
  };

  function svgIcon(name, cls) {
    return `<svg class="${cls || "nav-ico"}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
  }

  /* ---------------- Build chrome ---------------- */
  const currentFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  function buildSidebar() {
    const groups = NAV.map((g) => {
      const items = g.links
        .map((l) => {
          const isActive = l.href.split("#")[0].toLowerCase() === currentFile && !l.sub;
          return `<a href="${l.href}" class="nav-link ${l.sub ? "ml-3 !py-1.5 text-[0.83rem]" : ""} ${isActive ? "active" : ""}">
            ${svgIcon(l.icon)}
            <span><span class="lang-en">${l.en}</span><span class="lang-th">${l.th}</span></span>
          </a>`;
        })
        .join("");
      // Collapsible group: header button toggles the item list; state persists per group.
      const key = "navgrp:" + g.title.en.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const hasActive = g.links.some((l) => l.href.split("#")[0].toLowerCase() === currentFile);
      let saved = null; try { saved = localStorage.getItem(key); } catch (e) {}
      const collapsed = saved === "0" && !hasActive; // default open; the active section always stays open
      return `<div class="nav-group ${collapsed ? "collapsed" : ""}" data-navgroup="${key}">
        <button type="button" class="nav-section-btn px-3 mb-2" data-navtoggle="${key}" aria-expanded="${collapsed ? "false" : "true"}">
          <span class="nav-section-title"><span class="lang-en">${g.title.en}</span><span class="lang-th">${g.title.th}</span></span>
          <svg class="nav-caret" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <nav class="nav-group-items space-y-1">${items}</nav>
      </div>`;
    }).join("");

    return `
      <div class="h-full flex flex-col bg-black border-r border-white/10">
        <a href="index.html" class="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
          <div class="w-9 h-9 rounded-xl brand-gradient grid place-items-center shadow-lg shadow-indigo-900/40">
            <span class="text-white font-black text-lg">D</span>
          </div>
          <div class="leading-tight">
            <div class="text-white font-bold text-[0.95rem]">Dental Dashboard</div>
            <div class="text-[0.66rem] text-slate-400 tracking-wide">ATX ASSESSMENT</div>
          </div>
        </a>
        <div class="flex-1 overflow-y-auto px-3 py-5">${groups}</div>
        <div class="px-4 py-4 border-t border-white/10 shrink-0">
          <div class="glass rounded-xl p-3">
            <div class="text-[0.68rem] text-slate-400 mb-1"><span class="lang-en">Overall Readiness</span><span class="lang-th">ความพร้อมโดยรวม</span></div>
            <div class="flex items-center gap-2">
              <span class="text-2xl font-black text-white kpi">1.50</span>
              <span class="text-slate-400 text-xs mt-1">/ 4.0</span>
              <span class="badge badge-amber ml-auto"><span class="lang-en">Needs Work</span><span class="lang-th">ต้องปรับปรุง</span></span>
            </div>
          </div>
        </div>
      </div>`;
  }

  function buildTopbar() {
    return `
      <div class="topbar sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center gap-3 px-4 lg:px-8">
        <button id="menuBtn" class="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 text-slate-600">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
        </button>
        <div class="hidden md:flex items-center gap-2 text-sm text-slate-500" id="breadcrumb"></div>
        <div class="ml-auto flex items-center gap-2">
          <a href="https://aws.amazon.com/transform/" target="_blank" rel="noopener" class="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
            AWS Transform
          </a>
          <div class="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            <button data-setlang="en" class="lang-btn px-3 py-1.5 text-xs font-bold rounded-lg transition">EN</button>
            <button data-setlang="th" class="lang-btn px-3 py-1.5 text-xs font-bold rounded-lg transition">ไทย</button>
          </div>
        </div>
      </div>`;
  }

  const BREADCRUMBS = {
    "index.html": { en: "Executive Dashboard", th: "แดชบอร์ดผู้บริหาร" },
    "methodology.html": { en: "Assessment Methodology", th: "ระเบียบวิธีการประเมิน" },
    "codebase.html": { en: "Comprehensive Codebase Analysis", th: "การวิเคราะห์โค้ดแบบครอบคลุม" },
    "domains.html": { en: "Business Rules Extraction", th: "การสกัดกฎทางธุรกิจ" },
    "domain-detail.html": { en: "Domain Deep-Dive", th: "เจาะลึกรายโดเมน" },
    "modernization.html": { en: "Modernization Readiness Analysis", th: "การวิเคราะห์ความพร้อมสู่ความทันสมัย" },
    "knowledge-graph.html": { en: "Knowledge Graph", th: "Knowledge Graph" },
    "application-reference.html": { en: "Application Reference", th: "คู่มืออ้างอิงแอปพลิเคชัน" },
    "roadmap.html": { en: "Modernization Roadmap", th: "แผนการปรับปรุงให้ทันสมัย" },
    "reference.html": { en: "Developer Reference", th: "คู่มือสำหรับนักพัฒนา" },
  };

  function renderBreadcrumb() {
    const bc = document.getElementById("breadcrumb");
    if (!bc) return;
    const c = BREADCRUMBS[currentFile] || BREADCRUMBS["index.html"];
    bc.innerHTML = `<span class="text-slate-400">Dental Dashboard</span>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      <span class="font-semibold text-slate-700"><span class="lang-en">${c.en}</span><span class="lang-th">${c.th}</span></span>`;
  }

  /* ---------------- Language ---------------- */
  function applyLang(lang) {
    document.body.setAttribute("data-lang", lang);
    document.documentElement.setAttribute("lang", lang === "th" ? "th" : "en");
    localStorage.setItem("ws-lang", lang);
    document.querySelectorAll(".lang-btn").forEach((b) => {
      const on = b.getAttribute("data-setlang") === lang;
      b.classList.toggle("bg-white", on);
      b.classList.toggle("shadow-sm", on);
      b.classList.toggle("text-indigo-600", on);
      b.classList.toggle("text-slate-400", !on);
    });
  }

  /* ---------------- Mermaid ---------------- */
  // Tier-aware colour language: colour every subgraph (cluster) by what it
  // represents, so architecture diagrams read at a glance. Matches EN or TH
  // keywords in the cluster's label. Order matters (specific → generic).
  var CLUSTER_RULES = [
    { re: /instance\s*1|\bspof\b/i,         fill: "#fdecec", stroke: "#e88" },     // primary DB instance / SPOF
    { re: /instance\s*2/i,                  fill: "#fdf3e4", stroke: "#d9ad6a" },  // secondary instance
    { re: /presentation|นำเสนอ/i,           fill: "#eef6fe", stroke: "#7fb4ee" },  // UI tier
    { re: /business logic|ตรรกะ/i,          fill: "#fdf3e4", stroke: "#d9ad6a" },  // logic tier
    { re: /transactional|ธุรกรรม/i,         fill: "#fdecec", stroke: "#e89b9b" },  // transactional systems
    { re: /content|cms|เนื้อหา/i,           fill: "#e9f6ee", stroke: "#7cbd96" },  // content systems
    { re: /external|ภายนอก/i,               fill: "#f5f5f7", stroke: "#b8b8bf" },  // external systems
    { re: /data|ข้อมูล|database/i,          fill: "#f0ecfb", stroke: "#a693dd" },  // data tier
  ];
  function colorizeClusters(root) {
    (root || document).querySelectorAll(".cluster").forEach(function (c) {
      if (c.dataset.wsColored) return;
      var lbl = c.querySelector(".cluster-label, .nodeLabel, text");
      var txt = (lbl && lbl.textContent) || "";
      for (var i = 0; i < CLUSTER_RULES.length; i++) {
        if (CLUSTER_RULES[i].re.test(txt)) {
          var rect = c.querySelector("rect");
          if (rect) {
            rect.style.fill = CLUSTER_RULES[i].fill;
            rect.style.stroke = CLUSTER_RULES[i].stroke;
            rect.style.strokeWidth = "1.5px";
            rect.setAttribute("rx", "10"); rect.setAttribute("ry", "10");
          }
          c.dataset.wsColored = "1";
          break;
        }
      }
    });
  }
  window.__wsColorizeClusters = colorizeClusters;

  // Safety net so Mermaid labels are never clipped, even if a web font loads
  // after the diagram is measured (the usual cause of "cut-off" text).
  function injectMermaidCSS() {
    if (document.getElementById("ws-mermaid-fix")) return;
    var st = document.createElement("style");
    st.id = "ws-mermaid-fix";
    st.textContent =
      ".mermaid .nodeLabel,.mermaid .edgeLabel,.mermaid .cluster-label,.mermaid span.nodeLabel{white-space:nowrap!important;}" +
      ".mermaid .node foreignObject,.mermaid .cluster foreignObject,.mermaid .label foreignObject,.mermaid foreignObject{overflow:visible!important;}";
    document.head.appendChild(st);
  }

  function runMermaid() {
    try {
      if (typeof window.mermaid.run === "function") {
        var p = window.mermaid.run({ querySelector: ".mermaid" });
        if (p && typeof p.then === "function") p.then(function () { colorizeClusters(document); }).catch(function () {});
        else colorizeClusters(document);
      }
    } catch (err) { /* diagram parse errors are shown inline by mermaid */ }
  }
  // Expose so pages that render Mermaid dynamically (domain-detail, reference)
  // can re-run colourising after their own mermaid.run().
  window.__wsRunMermaid = runMermaid;

  function initMermaid() {
    if (!window.mermaid) return;
    injectMermaidCSS();
    window.mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "base",
      fontFamily: "'SF Pro TH', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif",
      themeVariables: {
        primaryColor: "#f5f5f7",
        primaryBorderColor: "#0071e3",
        primaryTextColor: "#1d1d1f",
        lineColor: "#a1a1a6",
        secondaryColor: "#ffffff",
        tertiaryColor: "#f5f5f7",
        clusterBkg: "#ffffff",
        clusterBorder: "#d2d2d7",
        fontSize: "14px",
      },
      flowchart: { curve: "basis", htmlLabels: true, padding: 16, nodeSpacing: 46, rankSpacing: 58, useMaxWidth: true },
      sequence: { useMaxWidth: true },
    });
    // Wait until the web fonts are actually loaded before Mermaid measures label
    // widths — otherwise labels are sized with a fallback font and get clipped
    // when Inter / Noto Sans Thai swap in. A timeout guards against hangs.
    if (document.fonts && document.fonts.ready && typeof document.fonts.load === "function") {
      var done = false;
      var go = function () { if (done) return; done = true; runMermaid(); };
      Promise.all([
        document.fonts.load("400 14px Inter"),
        document.fonts.load("600 14px Inter"),
        document.fonts.load("700 14px Inter"),
        document.fonts.load("400 14px 'Noto Sans Thai'"),
        document.fonts.load("600 14px 'Noto Sans Thai'")
      ]).then(function () { return document.fonts.ready; }).then(go).catch(go);
      setTimeout(go, 1800);
    } else {
      runMermaid();
    }
  }

  /* ---------------- Auto-reveal: give every content page the scroll choreography ---------------- */
  function initAutoReveal() {
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Only standard content pages (skips the doc/source browsers which stream content in).
    const main = document.querySelector(".app-main main");
    if (!main) return;
    const vh = window.innerHeight || 800;
    main.querySelectorAll("section").forEach((sec) => {
      if (sec.classList.contains("reveal") || sec.classList.contains("reveal-zoom")) return;
      if (sec.closest(".reveal, .reveal-zoom")) return;        // never nest inside a reveal
      if (sec.querySelector(".reveal, .reveal-zoom")) return;  // don't wrap already-revealed children
      if (sec.querySelector("canvas")) return;                 // leave interactive graphs alone
      if ((sec.textContent || "").trim().length < 24) return;  // skip empty / JS-populated containers
      // Only animate sections that start below the fold. Above-the-fold content
      // stays visible immediately, so nothing flickers on load or during a
      // cross-document view transition.
      if (sec.getBoundingClientRect().top < vh * 0.85) return;
      sec.classList.add("reveal");
    });
  }

  /* ---------------- Scroll reveal ---------------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal, .reveal-zoom");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        // Stagger elements entering together (above-the-fold on load) so blocks
        // cascade in rather than snapping at once — Apple-style choreography.
        let i = 0;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            if (i) el.style.transitionDelay = Math.min(i * 80, 400) + "ms";
            i++;
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    // Safety net: guarantee visibility for content that never enters the viewport
    // (e.g. print, no-scroll views, or off-screen sections on tall pages).
    setTimeout(() => els.forEach((e) => e.classList.add("in")), 1400);
  }

  /* ----------------
     Page-to-page transitions are handled natively by the browser via the CSS
     `@view-transition { navigation: auto }` rule (cross-document view
     transitions). No JavaScript interception is needed — this avoids the
     fade-out-to-blank "blink" that a manual handler caused, especially on
     instant file:// loads. Unsupported browsers fall back to the gentle
     `pageEnter` opacity fade-in defined in the stylesheet.
     ---------------- */

  /* ---------------- Count up ---------------- */
  function initCount() {
    const els = document.querySelectorAll("[data-count]");
    if (!els.length) return;
    const run = (el) => {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      const target = parseFloat(el.getAttribute("data-count"));
      const dec = (el.getAttribute("data-count").split(".")[1] || "").length;
      const dur = 1200; const t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        // easeOutExpo — Apple's counters decelerate hard at the end
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(step); else el.textContent = target.toFixed(dec);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.5 });
    els.forEach((e) => io.observe(e));
    // Safety net: finalize any counter that never scrolled into view.
    setTimeout(() => els.forEach((el) => { if (!el.dataset.done) { el.dataset.done = "1"; const target = parseFloat(el.getAttribute("data-count")); const dec = (el.getAttribute("data-count").split(".")[1] || "").length; el.textContent = target.toFixed(dec); } }), 1500);
  }

  /* ---------------- Bars ---------------- */
  function initBars() {
    const bars = document.querySelectorAll(".bar > span[data-w]");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { const el = e.target; requestAnimationFrame(() => { el.style.width = el.getAttribute("data-w"); }); io.unobserve(el); }
    }), { threshold: 0.4 });
    bars.forEach((b) => { b.style.width = "0%"; b.style.transition = "width .9s cubic-bezier(.4,0,.6,1)"; io.observe(b); });
    setTimeout(() => bars.forEach((b) => { b.style.width = b.getAttribute("data-w"); }), 1500);
  }

  /* ---------------- Rings ---------------- */
  function initRings() {
    const rings = document.querySelectorAll(".ring[data-p]");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { const el = e.target; const p = el.getAttribute("data-p"); el.style.setProperty("--p", "0"); el.style.transition = "--p 1s cubic-bezier(.4,0,.6,1)"; requestAnimationFrame(() => el.style.setProperty("--p", p)); io.unobserve(el); }
    }), { threshold: 0.4 });
    rings.forEach((r) => io.observe(r));
    setTimeout(() => rings.forEach((r) => { if (r.style.getPropertyValue("--p") !== r.getAttribute("data-p")) r.style.setProperty("--p", r.getAttribute("data-p")); }), 1500);
  }

  /* ---------------- On-page TOC scrollspy ---------------- */
  function initTOC() {
    const toc = document.querySelector("[data-toc]");
    if (!toc) return;
    const links = Array.from(toc.querySelectorAll("a"));
    const map = new Map();
    links.forEach((a) => { const id = a.getAttribute("href").slice(1); const t = document.getElementById(id); if (t) map.set(t, a); });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.remove("active")); const a = map.get(e.target); if (a) a.classList.add("active"); } });
    }, { rootMargin: "-80px 0px -70% 0px", threshold: 0 });
    map.forEach((_, t) => io.observe(t));
  }

  /* ---------------- Init ---------------- */
  // Build the sidebar + topbar. This runs SYNCHRONOUSLY (app.js sits at the end
  // of <body>, so #sidebar/#topbar already exist) rather than on DOMContentLoaded.
  // Injecting the chrome before the first paint eliminates the empty-rail →
  // filled "pop-in" flicker that showed on every page navigation.
  function buildChrome() {
    const sb = document.getElementById("sidebar");
    if (sb && !sb.dataset.built) { sb.innerHTML = buildSidebar(); sb.dataset.built = "1"; }
    const tb = document.getElementById("topbar");
    if (tb && !tb.dataset.built) { tb.innerHTML = buildTopbar(); tb.dataset.built = "1"; }
    renderBreadcrumb();

    const saved = localStorage.getItem("ws-lang") || "en";
    applyLang(saved);
    document.querySelectorAll(".lang-btn").forEach((b) => b.addEventListener("click", () => applyLang(b.getAttribute("data-setlang"))));

    // collapsible nav groups — toggle a group's items and remember the choice
    if (sb) {
      sb.querySelectorAll("[data-navtoggle]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.getAttribute("data-navtoggle");
          const grp = sb.querySelector('[data-navgroup="' + key + '"]');
          if (!grp) return;
          const nowCollapsed = grp.classList.toggle("collapsed");
          btn.setAttribute("aria-expanded", nowCollapsed ? "false" : "true");
          try { localStorage.setItem(key, nowCollapsed ? "0" : "1"); } catch (e) {}
        });
      });
    }

    // mobile menu
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn && sb) {
      menuBtn.addEventListener("click", () => sb.querySelector(".app-sidebar")?.classList.toggle("open") || sb.classList.toggle("open"));
      document.addEventListener("click", (e) => {
        if (window.innerWidth < 1024 && !sb.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) sb.classList.remove("open");
      });
    }
  }

  // Content effects can run after the DOM is fully parsed.
  function initContent() {
    initMermaid();
    initAutoReveal();
    initReveal();
    initCount();
    initBars();
    initRings();
    initTOC();
    document.querySelectorAll("[data-year]").forEach((e) => (e.textContent = new Date().getFullYear()));
  }

  buildChrome();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initContent);
  else initContent();
})();
