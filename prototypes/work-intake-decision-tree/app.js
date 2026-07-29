// THROWAWAY PROTOTYPE: deterministic intake routing for a fictional company.
// Three structurally different variants are switchable through ?variant=A|B|C.

const VARIANTS = {
  A: "Guided interview",
  B: "Proposal worksheet",
  C: "Routing conversation",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];
const app = document.querySelector("#app");

const blankState = () => ({
  scenario: "Blank",
  catalogPath: "",
  inquiryHours: 1,
  requiresChange: false,
  purchase: false,
  title: "",
  outcome: "",
  currentState: "",
  difference: "",
  success: "",
  sponsor: "",
  sponsorLevel: "",
  intent: "",
  affectedUsers: 0,
  activeTeams: 0,
  boundedSupport: true,
  criticalHandoffs: 0,
  laborDays: 0,
  durationWeeks: 0,
  production: false,
  customerFacing: false,
  sensitiveData: false,
  authenticationPath: false,
  internetExposed: false,
  knownUnknowns: false,
  requiredBy: "",
  consequence: "",
  domains: [],
});

const SCENARIOS = {
  Blank: blankState(),
  "Metrics migration": {
    ...blankState(),
    scenario: "Metrics migration",
    catalogPath: "change",
    title: "Replace the engineering metrics platform",
    outcome: "Move infrastructure and application metrics to a supported platform without losing alerting coverage or historical query access.",
    currentState: "Engineering teams publish Prometheus-compatible metrics to an aging, separately operated storage and dashboard stack.",
    difference: "The replacement must preserve PromQL-compatible workflows, support OpenTelemetry ingestion, and provide a tested migration path for existing alerts and dashboards.",
    success: "All production metrics and alerts operate on the new platform for 30 days, agreed history remains queryable, and the old storage tier can be retired.",
    sponsor: "Director, Reliability Engineering",
    sponsorLevel: "Director",
    intent: "Migration",
    affectedUsers: 420,
    activeTeams: 5,
    boundedSupport: false,
    criticalHandoffs: 4,
    laborDays: 420,
    durationWeeks: 32,
    production: true,
    customerFacing: false,
    sensitiveData: false,
    authenticationPath: false,
    internetExposed: false,
    knownUnknowns: true,
    requiredBy: "Before the current platform reaches end of support",
    consequence: "Unsupported storage and alerting components increase operational and incident risk.",
    domains: ["Observability", "Platform", "Applications", "Security"],
  },
  "SSO migration": {
    ...blankState(),
    scenario: "SSO migration",
    catalogPath: "change",
    purchase: true,
    title: "Migrate workforce applications to a new SSO service",
    outcome: "Move employee-facing applications to a common SSO service while preserving access, conditional-access controls, and auditable deprovisioning.",
    currentState: "Applications use a mixture of SAML, OIDC, local accounts, and two inherited SSO services.",
    difference: "The target must support global workforce policies, staged application onboarding, strong authentication, and recovery when the primary service is unavailable.",
    success: "All in-scope applications authenticate through the new service, access reviews pass, leaver access is removed within policy, and rollback has been exercised.",
    sponsor: "VP, Corporate Technology",
    sponsorLevel: "Vice President",
    intent: "Migration",
    affectedUsers: 6400,
    activeTeams: 7,
    boundedSupport: false,
    criticalHandoffs: 8,
    laborDays: 900,
    durationWeeks: 64,
    production: true,
    customerFacing: false,
    sensitiveData: true,
    authenticationPath: true,
    internetExposed: true,
    knownUnknowns: true,
    requiredBy: "Before renewal of the inherited SSO contracts",
    consequence: "Renewal creates another year of duplicate cost and fragmented identity controls.",
    domains: ["Identity", "Security", "Applications", "Platform", "Finance / Procurement", "Privacy / Legal"],
  },
  "Identity provider migration": {
    ...blankState(),
    scenario: "Identity provider migration",
    catalogPath: "change",
    purchase: true,
    title: "Establish the next enterprise identity-provider platform",
    outcome: "Replace the legacy identity-provider estate with a resilient foundation for workforce, application, and administrative identity.",
    currentState: "Directory, authentication, DNS-integrated identity, certificates, and application trust are distributed across legacy platforms with incomplete ownership records.",
    difference: "The future platform must support multiple regions, hybrid infrastructure, service identities, delegated administration, recovery testing, and documented trust boundaries.",
    success: "Critical identity flows meet approved availability and recovery requirements, dependencies have migrated, and the legacy providers can be removed without orphaned identities or trusts.",
    sponsor: "Chief Technology Officer",
    sponsorLevel: "Executive",
    intent: "Redesign",
    affectedUsers: 12000,
    activeTeams: 11,
    boundedSupport: false,
    criticalHandoffs: 14,
    laborDays: 1650,
    durationWeeks: 104,
    production: true,
    customerFacing: true,
    sensitiveData: true,
    authenticationPath: true,
    internetExposed: true,
    knownUnknowns: true,
    requiredBy: "Before the legacy platform loses vendor support",
    consequence: "Identity remains a single point of organizational failure, and unsupported components cannot satisfy recovery expectations.",
    domains: ["Identity", "Security", "Platform", "Network", "Applications", "Finance / Procurement", "Privacy / Legal", "Service Operations"],
  },
};

let state = blankState();
let wizardStep = 0;

const initialScenario = new URLSearchParams(window.location.search).get("scenario");
if (initialScenario && SCENARIOS[initialScenario]) state = structuredClone(SCENARIOS[initialScenario]);

function h(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentVariant() {
  const candidate = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
  return VARIANTS[candidate] ? candidate : "A";
}

function setVariant(key) {
  const url = new URL(window.location.href);
  url.searchParams.set("variant", key);
  window.history.replaceState({}, "", url);
  render();
}

function setScenarioInUrl(name) {
  const url = new URL(window.location.href);
  if (SCENARIOS[name] && name !== "Blank") url.searchParams.set("scenario", name);
  else url.searchParams.delete("scenario");
  window.history.replaceState({}, "", url);
}

function cycleVariant(direction) {
  const keys = Object.keys(VARIANTS);
  const next = (keys.indexOf(currentVariant()) + direction + keys.length) % keys.length;
  setVariant(keys[next]);
}

function laborBand(days) {
  if (!days) return "Unknown";
  if (days <= 10) return "XS";
  if (days <= 50) return "S";
  if (days <= 250) return "M";
  if (days <= 1000) return "L";
  return "XL";
}

function durationBand(weeks) {
  if (!weeks) return "Unknown";
  if (weeks <= 2) return "XS";
  if (weeks <= 8) return "S";
  if (weeks <= 26) return "M";
  if (weeks <= 78) return "L";
  return "XL";
}

function coordinationBand(teams, boundedSupport, handoffs) {
  if (!teams) return "Unknown";
  if (teams === 1 && handoffs === 0) return "XS";
  if (teams === 2 && boundedSupport && handoffs <= 1) return "S";
  if (teams <= 3 && handoffs <= 2) return "M";
  if (teams <= 7) return "L";
  return "XL";
}

function highestBand(bands) {
  const known = bands.filter((band) => SIZE_ORDER.includes(band));
  if (!known.length) return "Unknown";
  return known.reduce((highest, band) => SIZE_ORDER.indexOf(band) > SIZE_ORDER.indexOf(highest) ? band : highest, "XS");
}

function isCatalogRoute() {
  if (state.catalogPath === "incident" || state.catalogPath === "service") return true;
  return state.catalogPath === "inquiry" && Number(state.inquiryHours) <= 4 && !state.requiresChange && !state.purchase;
}

function materialChange() {
  return state.catalogPath === "change" || state.requiresChange || state.purchase || Number(state.inquiryHours) > 4;
}

function missingCriticalFields() {
  const missing = [];
  if (!state.title.trim()) missing.push("short title");
  if (!state.outcome.trim()) missing.push("desired outcome");
  if (!state.currentState.trim()) missing.push("current state");
  if (!state.difference.trim()) missing.push("required difference from the current state");
  if (!state.success.trim()) missing.push("success measure");
  if (!state.intent) missing.push("work intent");
  if (!state.domains.length) missing.push("affected domain");
  if (!Number(state.activeTeams)) missing.push("active-team estimate");
  if (!Number(state.laborDays)) missing.push("delivery-labor estimate");
  if (!Number(state.durationWeeks)) missing.push("elapsed-duration estimate");
  return missing;
}

function buildStakeholders() {
  const map = {
    Identity: ["Identity Engineering", "Access Governance"],
    Security: ["Information Security"],
    Platform: ["Platform Engineering"],
    Network: ["Network Engineering"],
    Applications: ["Application Owners"],
    Observability: ["Reliability / Observability"],
    "Finance / Procurement": ["Finance", "Procurement"],
    "Privacy / Legal": ["Privacy / Legal"],
    "Service Operations": ["Service Operations"],
  };
  const people = [state.sponsor || "Sponsor (not yet named)"];
  state.domains.forEach((domain) => people.push(...(map[domain] || [])));
  if (state.production) people.push("Production Service Owners");
  if (state.customerFacing) people.push("Customer Support / Success");
  return [...new Set(people)];
}

function buildReviews() {
  const reviews = [];
  if (state.production || state.activeTeams > 1 || ["Migration", "Redesign"].includes(state.intent)) reviews.push("Architecture Review");
  if (state.domains.includes("Identity") || state.domains.includes("Security") || state.authenticationPath || state.internetExposed) reviews.push("Security Review");
  if (state.production || state.domains.includes("Observability")) reviews.push("Reliability & Operations Review");
  if (state.sensitiveData || state.domains.includes("Privacy / Legal")) reviews.push("Privacy & Data Review");
  if (state.purchase || state.domains.includes("Finance / Procurement")) reviews.push("Finance & Procurement Review");
  if (state.production) reviews.push("Change & Release Review");
  if (state.activeTeams >= 4) reviews.push("Dependency & Capacity Review");
  return [...new Set(reviews)];
}

function buildRisks() {
  const risks = [];
  if (state.affectedUsers >= 5000) risks.push("Enterprise-wide blast radius");
  else if (state.affectedUsers >= 500) risks.push("Multi-department blast radius");
  else if (state.affectedUsers > 0) risks.push("Bounded user impact");
  if (state.production) risks.push("Production change");
  if (state.customerFacing) risks.push("Customer-facing impact");
  if (state.authenticationPath) risks.push("Authentication critical path");
  if (state.sensitiveData) risks.push("Sensitive or regulated data");
  if (state.internetExposed) risks.push("Internet exposure");
  if (state.purchase) risks.push("Commercial commitment");
  if (state.knownUnknowns) risks.push("Material uncertainty remains");
  if (state.criticalHandoffs >= 4) risks.push("Cross-team critical path");
  return risks.length ? risks : ["No material indicators recorded yet"];
}

function evaluate() {
  const bands = {
    labor: laborBand(Number(state.laborDays)),
    duration: durationBand(Number(state.durationWeeks)),
    coordination: coordinationBand(Number(state.activeTeams), state.boundedSupport, Number(state.criticalHandoffs)),
  };
  const deliverySize = highestBand(Object.values(bands));
  const missing = missingCriticalFields();
  let disposition;

  if (!state.catalogPath) {
    disposition = {
      key: "assisted",
      label: "Assisted Intake",
      summary: "The service-catalog boundary has not been answered. Intake staff should help determine whether this is service work before proposal review begins.",
    };
  } else if (isCatalogRoute()) {
    const labels = {
      inquiry: "General Inquiry",
      incident: "Incident / Break-Fix",
      service: "Standard Service Request",
    };
    disposition = {
      key: "service",
      label: labels[state.catalogPath],
      summary: "This belongs in the existing service catalog, not Work Proposal intake. The form would redirect the requester to the appropriate service queue.",
    };
  } else if (materialChange() && !state.sponsor.trim()) {
    disposition = {
      key: "blocked",
      label: "Sponsorship Required",
      summary: "This is material change, and every Work Proposal requires a named sponsor. The proposal cannot be submitted until someone with appropriate authority accepts sponsorship.",
    };
  } else if (missing.length) {
    disposition = {
      key: "assisted",
      label: "Assisted Intake",
      summary: `A sponsor is present, but decision-critical information is missing: ${missing.join(", ")}. Schedule an intake session before review tickets are assembled.`,
    };
  } else {
    disposition = {
      key: "proposal",
      label: "Work Proposal",
      summary: "The submission contains enough decision-critical information to assemble a draft proposal record and send its review modules to the appropriate teams.",
    };
  }

  const stakeholders = buildStakeholders();
  const reviews = buildReviews();
  const risks = buildRisks();
  const routing = [
    state.catalogPath === "change" ? "Requester selected material change outside the service catalog." : `Catalog answer: ${state.catalogPath || "not answered"}.`,
  ];
  if (materialChange()) routing.push(state.sponsor ? `Named sponsor: ${state.sponsor}.` : "Material change has no named sponsor, so submission stops.");
  if (disposition.key === "proposal") routing.push(`Delivery size is ${deliverySize}, the highest of ${bands.labor} labor, ${bands.duration} duration, and ${bands.coordination} coordination; the values are not averaged.`);
  if (state.knownUnknowns) routing.push("Recorded ambiguity triggers explicit discovery work; it does not silently inflate the size class.");
  if (reviews.length) routing.push(`Facts triggered ${reviews.length} independent review module${reviews.length === 1 ? "" : "s"}.`);

  return { disposition, bands, deliverySize, missing, stakeholders, reviews, risks, routing };
}

function scenarioBar() {
  return `<div class="scenario-bar"><span>Load scenario</span>${Object.keys(SCENARIOS).map((name) => `<button class="scenario-button ${state.scenario === name ? "active" : ""}" type="button" data-scenario="${h(name)}">${h(name)}</button>`).join("")}</div>`;
}

function topbar(dark = false) {
  return `<header class="topbar ${dark ? "dark" : ""}">
    <div class="brand"><div class="brand-mark">N</div><div><strong>Northstar Engineering</strong><small>Work intake demonstration</small></div></div>
    ${scenarioBar()}
  </header>`;
}

function selectField(field, label, options, help = "") {
  return `<label class="field"><span>${label}</span><select data-field="${field}"><option value="">Select one…</option>${options.map((option) => `<option value="${h(option)}" ${state[field] === option ? "selected" : ""}>${h(option)}</option>`).join("")}</select>${help ? `<small>${help}</small>` : ""}</label>`;
}

function textField(field, label, help = "", textarea = false) {
  const control = textarea
    ? `<textarea data-field="${field}">${h(state[field])}</textarea>`
    : `<input type="text" data-field="${field}" value="${h(state[field])}">`;
  return `<label class="field"><span>${label}</span>${control}${help ? `<small>${help}</small>` : ""}</label>`;
}

function numberField(field, label, help = "", min = 0) {
  return `<label class="field"><span>${label}</span><input type="number" min="${min}" data-field="${field}" value="${Number(state[field]) || ""}">${help ? `<small>${help}</small>` : ""}</label>`;
}

function booleanChoice(field, label, help = "") {
  return `<fieldset class="field"><legend>${label}</legend><div class="choice-grid">
    <label class="choice"><input type="radio" name="${field}" data-field="${field}" value="true" ${state[field] ? "checked" : ""}>Yes</label>
    <label class="choice"><input type="radio" name="${field}" data-field="${field}" value="false" ${!state[field] ? "checked" : ""}>No</label>
  </div>${help ? `<small>${help}</small>` : ""}</fieldset>`;
}

function boundaryFields() {
  const options = [
    ["inquiry", "I need an expert answer or brief feasibility guidance"],
    ["service", "I need an existing, documented service or standard change"],
    ["incident", "Something is broken or degraded"],
    ["change", "I am proposing new or materially changed work"],
  ];
  return `<fieldset class="field"><legend>First: does this belong in the existing service catalog?</legend><div class="choice-grid">
    ${options.map(([value, label]) => `<label class="choice"><input type="radio" name="catalogPath" data-field="catalogPath" value="${value}" ${state.catalogPath === value ? "checked" : ""}>${label}</label>`).join("")}
  </div><small>General Inquiry is a normal service request. Work Proposal intake begins only after this boundary is tested.</small></fieldset>
  ${state.catalogPath === "inquiry" ? `<div class="form-grid">${numberField("inquiryHours", "Expected expert time (hours)", "This demo treats up to four hours, with no change or purchase, as General Inquiry.")}${booleanChoice("requiresChange", "Would answering this require someone to change a system?")}</div>` : ""}`;
}

function purposeFields() {
  return `<div class="form-grid">
    <div class="wide">${textField("title", "Short working title")}</div>
    <div class="wide">${textField("outcome", "What outcome should exist when the work is done?", "Describe the result, not the product you already prefer.", true)}</div>
    <div class="wide">${textField("currentState", "What exists today?", "State the current capability and important limitations.", true)}</div>
    <div class="wide">${textField("difference", "What must be different?", "Compare expected capability with the current state.", true)}</div>
    <div class="wide">${textField("success", "How will we know it worked?", "Give an observable acceptance condition.", true)}</div>
    ${selectField("intent", "Preliminary work intent", ["Discovery", "Migration", "Redesign", "Enablement", "Optimization"])}
    ${textField("sponsor", "Named sponsor", "Every Work Proposal requires one. An unsponsored informational question belongs in General Inquiry.")}
    ${selectField("sponsorLevel", "Sponsor level", ["Manager", "Director", "Vice President", "Executive"])}
    ${textField("requiredBy", "Required-by event or date", "A date alone does not establish priority.")}
    <div class="wide">${textField("consequence", "What happens if that date is missed?", "This is evidence for portfolio prioritization, not a requester-selected urgency label.", true)}</div>
  </div>`;
}

function scopeFields() {
  const domains = ["Applications", "Identity", "Security", "Platform", "Network", "Observability", "Finance / Procurement", "Privacy / Legal", "Service Operations"];
  return `<div class="form-grid">
    ${numberField("affectedUsers", "People or customers affected", "Use the best defensible estimate.")}
    ${numberField("activeTeams", "Teams doing delivery work", "Review-only participation does not count.")}
    ${numberField("criticalHandoffs", "Cross-team critical handoffs", "Count handoffs that can stop downstream work.")}
    ${booleanChoice("boundedSupport", "If exactly two teams are involved, is the second contribution small and bounded?")}
    ${booleanChoice("production", "Will this change production?")}
    ${booleanChoice("customerFacing", "Can customers experience the outcome or a failure?")}
    ${booleanChoice("sensitiveData", "Does it handle sensitive or regulated data?")}
    ${booleanChoice("authenticationPath", "Is it part of authentication or authorization?")}
    ${booleanChoice("internetExposed", "Is any component exposed to the public internet?")}
    ${booleanChoice("purchase", "Could this require a purchase or vendor commitment?")}
    ${booleanChoice("knownUnknowns", "Are material questions still unanswered?", "This should create discovery work, not hide uncertainty inside an estimate.")}
    <fieldset class="field wide"><legend>Domains that may own, operate, fund, or depend on the result</legend><div class="choice-grid">${domains.map((domain) => `<label class="choice"><input type="checkbox" data-domain="${h(domain)}" ${state.domains.includes(domain) ? "checked" : ""}>${h(domain)}</label>`).join("")}</div></fieldset>
  </div>`;
}

function effortFields() {
  const result = evaluate();
  return `<div class="form-grid">
    ${numberField("laborDays", "Total delivery labor (person-days)", "Add the effort across all participating teams. Task estimates use person-days.")}
    ${numberField("durationWeeks", "Elapsed calendar duration (weeks)", "This includes waiting and dependencies; it is not labor.")}
  </div>
  <div class="route-preview"><strong>Current size calculation: ${result.deliverySize}</strong><br>
    Labor: ${result.bands.labor} · Duration: ${result.bands.duration} · Coordination: ${result.bands.coordination}<br>
    The highest dimension wins. Four XS dimensions could not cancel one XL dimension.</div>`;
}

function ticketTree(result) {
  if (result.disposition.key === "service") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">SR-1042</span><span>${h(result.disposition.label)} — routed to Service Operations</span></div></div>`;
  }
  if (result.disposition.key === "blocked") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DRAFT ONLY</span><span>No ticket created; sponsor confirmation required</span></div></div>`;
  }
  if (result.disposition.key === "assisted") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">INTAKE-88</span><span>Assisted Intake appointment / incomplete draft</span></div></div>`;
  }
  const subtasks = result.reviews.map((review, index) => `<div class="ticket child"><span class="ticket-key">NSE-${241 + index}</span><span>${h(review)} module</span></div>`).join("");
  return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">NSE-240</span><span>${h(state.title || "Draft Work Proposal")}</span></div>${subtasks}<div class="ticket child"><span class="ticket-key">NSE-${241 + result.reviews.length}</span><span>Assemble accepted modules into final review artifact</span></div></div>`;
}

function resultMarkup(compact = false) {
  const result = evaluate();
  return `<div class="result-shell">
    <section class="result-hero ${result.disposition.key}">
      <p class="eyebrow">Deterministic disposition</p>
      <div class="route">${h(result.disposition.label)}</div>
      <p>${h(result.disposition.summary)}</p>
      ${result.disposition.key === "proposal" ? `<div class="pill-row"><span class="pill">${h(state.intent)} intent</span><span class="pill">${result.deliverySize} delivery size</span><span class="pill">${h(state.sponsorLevel || "Sponsor level not set")}</span></div>` : ""}
    </section>
    <div class="result-grid">
      <section class="result-card"><h3>Delivery capacity profile</h3><ul><li>Labor: <strong>${result.bands.labor}</strong> (${Number(state.laborDays) || "?"} person-days)</li><li>Duration: <strong>${result.bands.duration}</strong> (${Number(state.durationWeeks) || "?"} weeks)</li><li>Coordination: <strong>${result.bands.coordination}</strong> (${Number(state.activeTeams) || "?"} active teams)</li><li>Overall: <strong>${result.deliverySize}</strong> — highest dimension</li></ul></section>
      <section class="result-card"><h3>Risk indicators</h3><div class="pill-row">${result.risks.map((risk) => `<span class="pill risk">${h(risk)}</span>`).join("")}</div></section>
      <section class="result-card"><h3>Proposed stakeholders</h3><div class="pill-row">${result.stakeholders.map((team) => `<span class="pill team">${h(team)}</span>`).join("")}</div></section>
      <section class="result-card"><h3>Triggered review modules</h3>${result.reviews.length ? `<div class="pill-row">${result.reviews.map((review) => `<span class="pill review">${h(review)}</span>`).join("")}</div>` : `<p class="muted">No proposal review modules triggered.</p>`}</section>
      ${compact ? "" : `<section class="result-card full"><h3>Hypothetical ticket structure</h3>${ticketTree(result)}<p class="muted" style="margin: .7rem 0 0; font-size: .75rem;">Demonstration only. No ticket has been created.</p></section>`}
      <section class="result-card full"><h3>Why it routed this way</h3>${result.routing.map((line) => `<div class="logic-line">${h(line)}</div>`).join("")}</section>
    </div>
  </div>`;
}

const WIZARD_STEPS = [
  ["Boundary", "Service request or proposal?", boundaryFields],
  ["Purpose", "What are you trying to change?", purposeFields],
  ["Reach", "Who and what could this touch?", scopeFields],
  ["Capacity", "What will delivery consume?", effortFields],
  ["Routing", "What would the system create?", () => resultMarkup(false)],
];

function renderVariantA() {
  const [, heading, fields] = WIZARD_STEPS[wizardStep];
  return `<main class="wizard-page">${topbar()}
    <div class="wizard-frame">
      <aside class="wizard-intro">
        <p class="eyebrow">Variant A · Guided interview</p>
        <h1>Start with facts. Let the route follow.</h1>
        <p class="lede">Requesters answer one kind of question at a time. The form tests the service boundary before it asks for project detail.</p>
        <div class="wizard-steps">${WIZARD_STEPS.map(([label], index) => `<div class="wizard-step ${index === wizardStep ? "current" : ""} ${index < wizardStep ? "done" : ""}"><b>${index < wizardStep ? "✓" : index + 1}</b><span>${label}</span></div>`).join("")}</div>
        ${wizardStep < 4 ? `<div class="route-preview"><strong>Live route preview</strong><br>${h(evaluate().disposition.label)}<br><span class="muted">Nothing is submitted while you answer.</span></div>` : ""}
      </aside>
      <section class="wizard-card">
        <p class="eyebrow">Step ${wizardStep + 1} of ${WIZARD_STEPS.length}</p>
        <h2>${heading}</h2>
        <div class="question-stack">${fields()}</div>
        <div class="button-row">
          <button class="text-button" type="button" data-wizard="back" ${wizardStep === 0 ? "disabled" : ""}>← Back</button>
          ${wizardStep < WIZARD_STEPS.length - 1 ? `<button class="primary-button" type="button" data-wizard="next">Continue →</button>` : `<button class="secondary-button" type="button" data-wizard="restart">Start another draft</button>`}
        </div>
      </section>
    </div>
  </main>`;
}

function renderVariantB() {
  return `<main class="worksheet-page">${topbar()}
    <header class="worksheet-header">
      <p class="eyebrow" style="color:#75d6b5">Variant B · Proposal worksheet</p>
      <h1>One evidence record, visible all at once.</h1>
      <p class="lede">Experienced requesters and reviewers can inspect the complete intake while the right-hand panel recalculates routing immediately.</p>
    </header>
    <div class="worksheet-layout">
      <form class="worksheet" onsubmit="return false">
        <section class="worksheet-section"><div class="section-heading"><h2>1. Service boundary</h2><span>Always first</span></div>${boundaryFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>2. Purpose and authority</h2><span>Decision-critical</span></div>${purposeFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>3. Reach and dependencies</h2><span>Fact-derived routing</span></div>${scopeFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>4. Delivery capacity</h2><span>Highest dimension wins</span></div>${effortFields()}</section>
      </form>
      <aside class="live-result"><p class="eyebrow">Live intake artifact</p>${resultMarkup(false)}</aside>
    </div>
  </main>`;
}

function answeredBubble(label, value) {
  if (!value) return "";
  return `<div class="bubble">${h(label)}</div><div class="bubble answer">${h(value)}</div>`;
}

function routingMap() {
  const result = evaluate();
  const service = result.disposition.key === "service";
  const blocked = result.disposition.key === "blocked";
  const assisted = result.disposition.key === "assisted";
  const proposal = result.disposition.key === "proposal";
  return `<div class="route-map">
    <div class="map-node active"><strong>1 · Test service-catalog boundary</strong><small>${state.catalogPath ? `Answer: ${h(state.catalogPath)}` : "Awaiting an answer"}</small></div>
    <div class="map-branches">
      <div class="map-node ${service ? "active" : "dim"}"><strong>Service Operations</strong><small>General Inquiry, standard request, or incident</small></div>
      <div class="map-node ${!service ? "active" : "dim"}"><strong>Material work candidate</strong><small>Continue only when service work is ruled out</small></div>
    </div>
    <div class="map-node ${blocked ? "active" : service ? "dim" : ""}"><strong>2 · Confirm sponsorship</strong><small>${state.sponsor ? h(state.sponsor) : "No sponsor named"}</small></div>
    <div class="map-node ${assisted ? "active" : service || blocked ? "dim" : ""}"><strong>3 · Check decision-critical information</strong><small>${result.missing.length ? `Missing: ${h(result.missing.join(", "))}` : "Required information is present"}</small></div>
    <div class="map-node ${proposal ? "active" : "dim"}"><strong>4 · Assemble modular review</strong><small>${result.reviews.length} review modules and ${result.stakeholders.length} proposed stakeholders</small></div>
  </div>`;
}

function renderVariantC() {
  const result = evaluate();
  return `<main class="conversation-page">${topbar(true)}
    <div class="conversation-layout">
      <section class="chat-panel">
        <p class="eyebrow" style="color:#75d6b5">Variant C · Routing conversation</p>
        <h1>Explain the route while you build it.</h1>
        <p class="lede" style="color:#9fb2b8">A conversational front end asks for facts; a visible map shows which organizational path those facts activate.</p>
        <div class="chat-stream">
          ${answeredBubble("What are you calling this work?", state.title)}
          ${answeredBubble("What outcome should exist?", state.outcome)}
          ${answeredBubble("Who is sponsoring material change?", state.sponsor)}
          <div class="bubble">First, which front door fits this request?</div>
          <div class="chat-question">${boundaryFields()}</div>
          <div class="bubble">Give me the minimum evidence needed to test proposal readiness.</div>
          <div class="chat-question">${purposeFields()}</div>
          <div class="bubble">Now describe reach, dependencies, and expected delivery capacity.</div>
          <div class="chat-question">${scopeFields()}${effortFields()}</div>
        </div>
      </section>
      <section class="map-panel">
        <header><div><p class="eyebrow">Live routing map</p><h2>${h(result.disposition.label)}</h2><p class="muted">Every active node can explain itself.</p></div><span class="pill">${result.deliverySize} size</span></header>
        ${routingMap()}
        <div class="map-output">${resultMarkup(false)}</div>
      </section>
    </div>
  </main>`;
}

function bindInteractions() {
  document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => {
    state = structuredClone(SCENARIOS[button.dataset.scenario]);
    setScenarioInUrl(button.dataset.scenario);
    render();
  }));

  document.querySelectorAll("[data-field]").forEach((control) => {
    const eventName = control.matches("select, input[type=radio]") ? "change" : "input";
    control.addEventListener(eventName, () => {
      const field = control.dataset.field;
      if (control.type === "radio" && ["true", "false"].includes(control.value)) state[field] = control.value === "true";
      else if (control.type === "number") state[field] = Number(control.value);
      else state[field] = control.value;
      state.scenario = "Custom";
      setScenarioInUrl("Custom");
      const variant = currentVariant();
      if ((variant === "B" || variant === "C") && eventName === "change") render();
      else if (variant === "B") {
        const panel = document.querySelector(".live-result");
        if (panel) panel.innerHTML = `<p class="eyebrow">Live intake artifact</p>${resultMarkup(false)}`;
      } else if (variant === "C") {
        const panel = document.querySelector(".map-output");
        if (panel) panel.innerHTML = resultMarkup(false);
      } else updateLightweightOutputs();
    });
  });

  document.querySelectorAll("[data-domain]").forEach((control) => control.addEventListener("change", () => {
    const domain = control.dataset.domain;
    state.domains = control.checked ? [...new Set([...state.domains, domain])] : state.domains.filter((item) => item !== domain);
    state.scenario = "Custom";
    setScenarioInUrl("Custom");
    render();
  }));

  document.querySelectorAll("[data-wizard]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.wizard === "next") wizardStep = Math.min(WIZARD_STEPS.length - 1, wizardStep + 1);
    if (button.dataset.wizard === "back") wizardStep = Math.max(0, wizardStep - 1);
    if (button.dataset.wizard === "restart") { state = blankState(); wizardStep = 0; }
    render();
  }));
}

function updateLightweightOutputs() {
  // Wizard inputs can update without stealing focus. Full result appears in step five.
  const preview = document.querySelector(".wizard-intro .route-preview");
  if (preview) preview.innerHTML = `<strong>Live route preview</strong><br>${h(evaluate().disposition.label)}<br><span class="muted">Nothing is submitted while you answer.</span>`;
  const capacity = document.querySelector(".wizard-card .route-preview");
  if (capacity && wizardStep === 3) {
    const result = evaluate();
    capacity.innerHTML = `<strong>Current size calculation: ${result.deliverySize}</strong><br>Labor: ${result.bands.labor} · Duration: ${result.bands.duration} · Coordination: ${result.bands.coordination}<br>The highest dimension wins. Four XS dimensions could not cancel one XL dimension.`;
  }
}

function render() {
  const variant = currentVariant();
  document.querySelector("#variant-label").textContent = `${variant} — ${VARIANTS[variant]}`;
  app.innerHTML = variant === "A" ? renderVariantA() : variant === "B" ? renderVariantB() : renderVariantC();
  bindInteractions();
}

document.querySelector("#previous-variant").addEventListener("click", () => cycleVariant(-1));
document.querySelector("#next-variant").addEventListener("click", () => cycleVariant(1));
document.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  if (event.target.matches("input, textarea, select, [contenteditable]")) return;
  cycleVariant(event.key === "ArrowLeft" ? -1 : 1);
});

render();
