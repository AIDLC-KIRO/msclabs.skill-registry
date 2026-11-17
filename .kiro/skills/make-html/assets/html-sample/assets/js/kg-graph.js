// ===== Dental Dashboard Knowledge Graph — rendering + drilldown =====
// Scope to the graph canvas svg (the page also contains inline icon <svg>s).
const svg = d3.select("#kgCanvas svg");
const g = svg.append("g");
let width = svg.node().clientWidth, height = svg.node().clientHeight;

const zoom = d3.zoom().scaleExtent([0.15, 4]).on("zoom", e => g.attr("transform", e.transform));
svg.call(zoom);

// Mutable working copies (satellite nodes get added/removed on expand)
let curNodes = nodes.map(n => ({ ...n }));
let curLinks = links.map(l => ({ ...l }));
const baseIds = new Set(nodes.map(n => n.id));
const expanded = new Set();

let linkSel, nodeSel, sim;
const adj = () => {
  const m = new Map();
  curNodes.forEach(n => m.set(n.id, new Set([n.id])));
  curLinks.forEach(l => {
    const s = l.source.id || l.source, t = l.target.id || l.target;
    m.get(s)?.add(t); m.get(t)?.add(s);
  });
  return m;
};

function ccClass(cc){ if(cc==null) return ""; if(cc>=12) return "high"; if(cc>=6) return "mid"; return "low"; }

function buildSim() {
  sim = d3.forceSimulation(curNodes)
    .force("link", d3.forceLink(curLinks).id(d => d.id).distance(l => {
      if (l.type === "contains") return 95;
      if (l.type === "owns" || l.type === "impl") return 48;
      if (l.type === "uses") return 70;
      if (l.type === "external") return 82;
      return 115;
    }).strength(l => (l.type==="owns"||l.type==="impl") ? 0.7 : 0.4))
    .force("charge", d3.forceManyBody().strength(d => (d.cat==="method"||d.cat==="table") ? -160 : -540))
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collide", d3.forceCollide().radius(d => (d.size||8) + 12))
    .on("tick", ticked);
}

function render() {
  // links
  linkSel = g.selectAll("line.link").data(curLinks, d => (d.source.id||d.source)+"→"+(d.target.id||d.target)+d.type);
  linkSel.exit().remove();
  linkSel = linkSel.enter().append("line")
    .attr("class", d => "link " + (d.type==="shareddb"?"shareddb":d.type))
    .attr("stroke-width", d => d.type==="sync" ? Math.max(1.5,(d.weight||1)) : (d.type==="contains"?1.4:1.2))
    .merge(linkSel);

  // nodes
  nodeSel = g.selectAll("g.node").data(curNodes, d => d.id);
  nodeSel.exit().remove();
  const enter = nodeSel.enter().append("g")
    .attr("class", d => "node " + d.cat + (d.cat==="domain"||d.cat==="shared" ? " expandable":""))
    .call(d3.drag().on("start",dstart).on("drag",dragged).on("end",dend));

  enter.each(function(d){
    const el = d3.select(this);
    if (d.cat === "method" || d.cat === "table") {
      const lbl = d.label || d.id;
      const w = Math.min(160, 12 + lbl.length*5.6), h = 17;
      el.append("rect").attr("x",-w/2).attr("y",-h/2).attr("width",w).attr("height",h).attr("rx",4)
        .attr("fill", d.cat==="method" ? "#0d2b2a" : "#2b0f22")
        .attr("stroke", d.cat==="method" ? "#00cec9" : "#e84393").attr("stroke-width",1);
      el.append("text").attr("text-anchor","middle").attr("y",3.5).attr("x",0)
        .style("font-size","9.5px").style("stroke","none")
        .style("fill", d.cat==="method" ? "#7ff0ec" : "#ff9ec9")
        .text(lbl.length>24 ? lbl.slice(0,23)+"…" : lbl);
    } else {
      el.append("circle").attr("r", d.size).attr("fill", categories[d.cat].color);
      el.append("text").attr("x", d.size+4).attr("y",4).text(d.id);
    }
  });
  nodeSel = enter.merge(nodeSel);

  nodeSel.on("click", (e,d) => { if(baseIds.has(d.id)||details[d.id]) { openSheet(d.id); } highlight(d.id); e.stopPropagation(); })
         .on("dblclick", (e,d) => { if (d.cat==="domain"||d.cat==="shared") toggleExpand(d.id); e.stopPropagation(); })
         .on("mouseover", (e,d) => { if(!pinned) highlight(d.id); })
         .on("mouseout", () => { if(!pinned) clearHi(); });
}

function restart(alpha) {
  render();
  sim.nodes(curNodes);
  sim.force("link").links(curLinks);
  sim.alpha(alpha||0.7).restart();
}

function ticked() {
  linkSel.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
  nodeSel.attr("transform", d=>`translate(${d.x},${d.y})`);
}
function dstart(e,d){ if(!e.active) sim.alphaTarget(0.3).restart(); d.fx=d.x; d.fy=d.y; }
function dragged(e,d){ d.fx=e.x; d.fy=e.y; }
function dend(e,d){ if(!e.active) sim.alphaTarget(0); d.fx=null; d.fy=null; }

// ---------- Expand / collapse into method + table satellite nodes ----------
function toggleExpand(id){
  if (expanded.has(id)) collapse(id); else expand(id);
}
function expand(id){
  const det = details[id]; if(!det) return;
  expanded.add(id);
  const parent = curNodes.find(n=>n.id===id);
  const methods = (det.methods||[]).slice(0,8);
  const tables = (det.tables||[]).slice(0,8);
  methods.forEach((m,i) => {
    const nid = id+"::m::"+i;
    if(!curNodes.find(n=>n.id===nid)){
      curNodes.push({ id:nid, label:m.n, cat:"method", size:6, x:parent.x+(Math.random()-.5)*40, y:parent.y+(Math.random()-.5)*40, meta:m });
      curLinks.push({ source:id, target:nid, type:"impl" });
    }
  });
  tables.forEach((t,i) => {
    const nid = id+"::t::"+i;
    if(!curNodes.find(n=>n.id===nid)){
      curNodes.push({ id:nid, label:t, cat:"table", size:6, x:parent.x+(Math.random()-.5)*40, y:parent.y+(Math.random()-.5)*40 });
      curLinks.push({ source:id, target:nid, type:"owns" });
    }
  });
  // fix id display for satellites
  curNodes.forEach(n => { if(n.cat==="method") n.id = n.id; });
  restart(0.8);
}
function collapse(id){
  expanded.delete(id);
  curNodes = curNodes.filter(n => !(n.id.startsWith(id+"::")));
  curLinks = curLinks.filter(l => {
    const s=l.source.id||l.source, t=l.target.id||l.target;
    return !(String(s).startsWith(id+"::") || String(t).startsWith(id+"::"));
  });
  restart(0.6);
}
// satellite nodes render their label (id contains ::) — override text
// (handled in render via d.id; use label for satellites)

// ---------- Highlight ----------
let pinned = false;
function highlight(id){
  const neigh = adj().get(id) || new Set([id]);
  nodeSel.classed("faded", n => !neigh.has(n.id));
  linkSel.classed("faded", l => !((l.source.id||l.source)===id || (l.target.id||l.target)===id));
}
function clearHi(){ nodeSel.classed("faded",false); linkSel.classed("faded",false); }

// ---------- Drilldown sheet ----------
const sheet = document.getElementById("sheet");
const sheetHead = sheet.querySelector(".head");
const sheetBody = sheet.querySelector(".body");

function openSheet(id){
  pinned = true; highlight(id);
  const d = details[id];
  const col = categories[(d&&d.cat)||"domain"].color;
  if (!d) {
    // database / external / infra minimal card
    const node = curNodes.find(n=>n.id===id) || {cat:"database"};
    const db = dbDetail[id], ex = externalDetail[id];
    sheetHead.innerHTML = `<span class="close" onclick="closeSheet()">×</span>
      <h2>${id}</h2><div class="cat" style="color:${categories[node.cat].color}">${categories[node.cat].label}</div>`;
    let b = "";
    if (db) { b += `<div class="sec"><div class="desc">${db.note}</div></div>
      <div class="kpis"><div class="kpi"><div class="k">DataContext</div><div class="v" style="font-size:12px">${db.ctx}</div></div></div>
      <div class="sec"><h3>Owning / consuming domains</h3><div class="desc">${db.owners}</div></div>`; }
    if (ex) { b += `<div class="sec"><div class="desc">${ex.desc}</div></div>
      <div class="blocker MEDIUM"><span class="sev MEDIUM">RISK</span>${ex.risk}</div>`; }
    b += connectionsBlock(id);
    sheetBody.innerHTML = b;
    sheet.classList.add("open");
    return;
  }

  sheetHead.innerHTML = `<span class="close" onclick="closeSheet()">×</span>
    <h2>${id}</h2>
    <div class="cat" style="color:${col}">${categories[d.cat].label}${d.role?" · "+d.role:""}</div>`;

  let html = `<div class="sec"><div class="desc">${d.desc}</div></div>`;

  // KPIs
  if (d.kpis) {
    html += `<div class="kpis">`;
    for (const [k,v] of Object.entries(d.kpis)) html += `<div class="kpi"><div class="k">${k}</div><div class="v">${v}</div></div>`;
    html += `</div>`;
  }

  // Migration priority
  if (d.priority) {
    html += `<div class="sec"><h3>Migration Priority</h3>
      <div class="prio"><div class="num">${d.priority}</div>
      <div><div>Phase ${d.phase} · order ${d.priority} of 9</div>
      <div style="margin-top:3px"><span class="badge indep-${d.independence}">${d.independence} independence</span> <span class="chip">${d.complexity}</span></div></div></div></div>`;
  }

  // Methods
  if (d.methods && d.methods.length) {
    html += `<div class="sec"><h3>Methods <span class="n">${d.methods.length}</span></h3>
      <table class="mtx"><tr><th>Method</th><th>CC</th><th>In/Out</th><th>Note</th></tr>`;
    d.methods.forEach(m => {
      const cc = m.cc!=null ? `<span class="cc ${ccClass(m.cc)}">${m.cc}</span>` : "";
      const io = (m.fanIn||m.fanOut) ? `${m.fanIn||0}/${m.fanOut||0}` : "";
      html += `<tr><td class="mono">${m.n}${m.loc?` <span style="color:#98a2b8">· ${m.loc} LOC</span>`:""}</td><td>${cc}</td><td>${io}</td><td>${m.note||""}</td></tr>`;
    });
    html += `</table></div>`;
  }

  // Owned data
  if (d.tables && d.tables.length) {
    html += `<div class="sec"><h3>Owned Data <span class="n">${d.tables.length}</span></h3><div>`;
    d.tables.forEach(t => html += `<span class="chip mono">${t}</span>`);
    html += `</div></div>`;
  }

  // Entry points
  if (d.entry && d.entry.length) {
    html += `<div class="sec"><h3>Entry Points <span class="n">${d.entry.length}</span></h3><div>`;
    d.entry.forEach(e => html += `<span class="chip mono">${e}</span>`);
    html += `</div></div>`;
  }

  // Inbound contracts
  if (d.inbound && d.inbound.length) {
    html += `<div class="sec"><h3>Inbound Contracts <span class="n">${d.inbound.length}</span></h3>`;
    d.inbound.forEach(c => html += `<div class="contract"><span class="tgt">${c.tgt}</span> <span class="via">${c.via}</span><div>${c.note||""}</div></div>`);
    html += `</div>`;
  } else if (d.priority) {
    html += `<div class="sec"><h3>Inbound Contracts</h3><div class="desc" style="color:#7bed9f">None — no upstream domain callers.</div></div>`;
  }

  // Outbound contracts
  if (d.outbound && d.outbound.length) {
    html += `<div class="sec"><h3>Outbound Contracts <span class="n">${d.outbound.length}</span></h3>`;
    d.outbound.forEach(c => html += `<div class="contract"><span class="tgt">→ ${c.tgt}</span> <span class="via">${c.via}</span><div>${c.note||""}</div></div>`);
    html += `</div>`;
  } else if (d.priority) {
    html += `<div class="sec"><h3>Outbound Contracts</h3><div class="desc" style="color:#7bed9f">None — fully autonomous.</div></div>`;
  }

  // Blockers
  html += `<div class="sec"><h3>Decomposition Blockers <span class="n">${(d.blockers||[]).length}</span></h3>`;
  if (d.blockers && d.blockers.length) {
    d.blockers.forEach(b => html += `<div class="blocker ${b.sev}"><span class="sev ${b.sev}">${b.sev}</span>${b.desc}<div class="res">→ ${b.res}</div></div>`);
  } else {
    html += `<div class="desc" style="color:#7bed9f">None — clean extraction.</div>`;
  }
  html += `</div>`;

  sheetBody.innerHTML = html;
  sheet.classList.add("open");
}

function connectionsBlock(id){
  const conns = curLinks.filter(l => (l.source.id||l.source)===id || (l.target.id||l.target)===id)
    .map(l => { const s=l.source.id||l.source, t=l.target.id||l.target; const o=s===id?t:s; return `<span class="chip">${o}${l.label?" · "+l.label:""}</span>`; });
  return conns.length ? `<div class="sec"><h3>Relationships <span class="n">${conns.length}</span></h3><div>${conns.join("")}</div></div>` : "";
}

function closeSheet(){ sheet.classList.remove("open"); pinned=false; clearHi(); }
window.closeSheet = closeSheet;

svg.on("click", () => { closeSheet(); });

// ---------- Legend ----------
const legend = document.getElementById("legend");
const counts = {}; nodes.forEach(n => counts[n.cat]=(counts[n.cat]||0)+1);
const disabled = new Set();
let lh = `<h3>Entities</h3>`;
for (const [k,c] of Object.entries(categories)) lh += `<div class="legend-row" data-cat="${k}"><span class="dot" style="background:${c.color}"></span>${c.label}<span class="count">${counts[k]||0}</span></div>`;
lh += `<div id="edgekey"><h3 style="margin-bottom:6px">Relationships</h3>
  <div><span class="ln" style="border-color:#3d4658"></span>contains</div>
  <div><span class="ln" style="border-color:#00b894;border-top-style:dashed"></span>uses database</div>
  <div><span class="ln" style="border-color:#6c5ce7"></span>sync call (thickness=coupling)</div>
  <div><span class="ln" style="border-color:#e17055;border-top-style:dashed"></span>shared-db coupling</div>
  <div><span class="ln" style="border-color:#fdcb6e;border-top-style:dashed"></span>external / infra</div>
  <div><span class="ln" style="border-color:#00cec9"></span>method (expanded)</div>
  <div><span class="ln" style="border-color:#e84393;border-top-style:dotted"></span>owned table (expanded)</div>
</div>`;
legend.innerHTML = lh;
legend.querySelectorAll(".legend-row").forEach(row => row.addEventListener("click", () => {
  const cat = row.dataset.cat;
  if (disabled.has(cat)) { disabled.delete(cat); row.classList.remove("off"); }
  else { disabled.add(cat); row.classList.add("off"); }
  nodeSel.style("display", n => disabled.has(n.cat) ? "none" : null);
  linkSel.style("display", l => (disabled.has((typeof l.source==="object"?l.source.cat:null)) || disabled.has((typeof l.target==="object"?l.target.cat:null))) ? "none":null);
}));

// ---------- Search ----------
document.getElementById("search").addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) { clearHi(); return; }
  const m = new Set(curNodes.filter(n => (n.label||n.id).toLowerCase().includes(q)).map(n=>n.id));
  nodeSel.classed("faded", n => !m.has(n.id));
  linkSel.classed("faded", l => !(m.has(l.source.id||l.source) && m.has(l.target.id||l.target)));
});

// ---------- Reset ----------
document.getElementById("reset").addEventListener("click", () => {
  [...expanded].forEach(collapse);
  svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
  document.getElementById("search").value = "";
  disabled.clear(); legend.querySelectorAll(".legend-row").forEach(r=>r.classList.remove("off"));
  closeSheet();
  nodeSel.style("display",null); linkSel.style("display",null);
  restart(0.6);
});

// ---------- Migration Plan modal ----------
const modal = document.getElementById("modal");
const modalCard = modal.querySelector(".modal-card");
document.getElementById("migBtn").addEventListener("click", () => {
  let h = `<span class="close" onclick="closeModal()">×</span>
    <h2>Strangler-Fig Migration Plan</h2>
    <div class="desc" style="margin-bottom:6px">Extraction order by call cohesion, shared-data ownership and domain boundaries. Start with the most isolated services.</div>`;
  migrationPlan.phases.forEach(ph => {
    h += `<div class="phase"><div class="ph-head">${ph.title}</div><div class="ph-body">`;
    ph.items.forEach(it => h += `<div class="mig-row"><div class="o">${it.o}</div><div class="nm">${it.nm}</div><div class="mt">${it.mt}</div></div>`);
    h += `</div></div>`;
  });
  h += `<div class="sec" style="margin-top:16px"><h3>Infrastructure services (parallel to all phases)</h3>`;
  migrationPlan.infra.forEach(i => h += `<div class="infra-item">${i}</div>`);
  h += `</div>`;
  h += `<div class="sec" style="margin-top:16px"><h3>Cyclic dependency</h3>
    <div class="blocker HIGH"><span class="sev HIGH">CYCLE</span>${migrationPlan.cycle.pair}<div class="res">${migrationPlan.cycle.desc}<br>→ ${migrationPlan.cycle.res}</div></div></div>`;
  h += `<div class="sec" style="margin-top:16px"><h3>Decomposition blockers summary</h3>
    <table class="mtx"><tr><th>Sev</th><th>Blocker</th><th>Service(s)</th><th>Cost</th><th>Blast</th></tr>`;
  migrationPlan.blockers.forEach(b => h += `<tr><td><span class="sev ${b.sev}" style="font-size:9px">${b.sev}</span></td><td>${b.b}</td><td>${b.svc}</td><td>${b.cost}</td><td>${b.blast}</td></tr>`);
  h += `</table></div>`;
  modalCard.innerHTML = h;
  modal.classList.add("open");
});
function closeModal(){ modal.classList.remove("open"); }
window.closeModal = closeModal;
modal.addEventListener("click", e => { if(e.target===modal) closeModal(); });

// ---------- Satellite label fix + init ----------
// Override text rendering so satellite nodes show their label (id has :: suffix)
const origRender = render;

window.addEventListener("resize", () => {
  width = svg.node().clientWidth; height = svg.node().clientHeight;
  sim.force("center", d3.forceCenter(width/2,height/2)).alpha(0.3).restart();
});

buildSim();
render();
sim.alpha(1).restart();

// ---------- Fit-to-content (auto-frame all nodes) ----------
function fitToContent(pad) {
  pad = pad || 70;
  if (!curNodes.length) return;
  // Refresh dimensions in case the layout was not ready at init time.
  width = svg.node().clientWidth || width;
  height = svg.node().clientHeight || height;
  const xs = curNodes.map(n => n.x), ys = curNodes.map(n => n.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = (maxX - minX) || 1, h = (maxY - minY) || 1;
  const scale = Math.min(1.6, Math.max(0.2, Math.min((width - pad * 2) / w, (height - pad * 2) / h)));
  const tx = width / 2 - scale * (minX + maxX) / 2;
  const ty = height / 2 - scale * (minY + maxY) / 2;
  svg.transition().duration(650).call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
}
const _fitBtn = document.getElementById("fitBtn");
if (_fitBtn) _fitBtn.addEventListener("click", () => fitToContent());
// Auto-frame once the force simulation has settled on first load.
setTimeout(() => fitToContent(), 1500);
