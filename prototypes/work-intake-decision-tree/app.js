// THROWAWAY PROTOTYPE: deterministic intake routing for a fictional company.
// Three structurally different variants are switchable through ?variant=A|B|C.

const VARIANTS = {
  A: "Guided interview",
  B: "Proposal worksheet",
  C: "Routing conversation",
};

const domainModel = window.WorkIntakePrototype;
const { COMPANY, SCENARIOS, blankState } = domainModel;
const app = document.querySelector("#app");

let state = blankState();
let wizardStep = 0;
const evaluate = () => domainModel.evaluate(state);

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

function scenarioBar() {
  return `<div class="scenario-bar"><span>Load scenario</span>${Object.keys(SCENARIOS).map((name) => `<button class="scenario-button ${state.scenario === name ? "active" : ""}" type="button" data-scenario="${h(name)}">${h(name)}</button>`).join("")}</div>`;
}

function topbar(dark = false) {
  return `<header class="topbar ${dark ? "dark" : ""}">
    <div class="brand"><div class="brand-mark">N</div><div><strong>${h(COMPANY.name)}</strong><small>Research technology · Work Intake demonstration</small></div></div>
    ${scenarioBar()}
  </header>`;
}

function selectField(field, label, options, help = "") {
  return `<label class="field"><span>${label}</span><select data-field="${field}"><option value="">Select one…</option>${options.map((option) => `<option value="${h(option)}" ${state[field] === option ? "selected" : ""}>${h(option)}</option>`).join("")}</select>${help ? `<small>${help}</small>` : ""}</label>`;
}

function teamSelectField(field, label, help = "") {
  const options = Object.entries(COMPANY.teams).map(([id, team]) => `<option value="${h(id)}" ${state[field] === id ? "selected" : ""}>${h(team.name)}</option>`).join("");
  return `<label class="field"><span>${label}</span><select data-field="${field}"><option value="">Select one…</option>${options}</select>${help ? `<small>${help}</small>` : ""}</label>`;
}

function textareaRows(value) {
  const wrappedLines = String(value || "").split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / 92)), 0);
  return Math.max(4, Math.min(32, wrappedLines + 1));
}

function textField(field, label, help = "", textarea = false) {
  const control = textarea
    ? `<textarea data-field="${field}" rows="${textareaRows(state[field])}">${h(state[field])}</textarea>`
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
    ${textField("requester", "Authenticated requester", "The person who knowingly asks the organization to act. A receiving team may not manufacture this demand.")}
    ${teamSelectField("requestingTeam", "Requesting function")}
    <div class="wide">${textField("title", "Short working title")}</div>
    <div class="wide">${textField("currentState", "Current State", "What capability, constraint, failure, cost, or operating condition exists now?", true)}</div>
    <div class="wide">${textField("outcome", "Desired Outcome", "Describe what should become true, not the product you already prefer.", true)}</div>
    <div class="wide">${textField("difference", "Required Difference", "State the material gap between the Current State and Desired Outcome.", true)}</div>
    <div class="wide">${textField("requirements", "Requirements", "What must the result do or preserve? Use testable operating conditions where possible.", true)}</div>
    <div class="wide">${textField("success", "Acceptance Conditions", "What observable evidence will show that the Desired Outcome is real?", true)}</div>
    <div class="wide">${textField("nonGoals", "Non-Goals", "What does this proposal deliberately not solve?", true)}</div>
    ${textField("sponsor", "Work Sponsor", "A name alone is not sponsorship; acceptance must be tied to this proposal revision.")}
    ${selectField("sponsorLevel", "Sponsor level", ["Manager", "Director", "Vice President", "Executive"])}
    ${booleanChoice("sponsorAccepted", "Has the sponsor accepted this proposal revision?", "Sponsorship accepts the priority claim, evaluation capacity, and organizational tradeoffs.")}
    ${textField("acceptanceAuthority", "Acceptance Authority", "Who may decide that the delivered result satisfies the agreed proof and operating conditions?")}
    <div class="wide">${textField("requiredBy", "Required-by event or date", "A date alone does not establish priority.", true)}</div>
    <div class="wide">${textField("consequence", "What happens if that date is missed?", "This is evidence for portfolio prioritization, not a requester-selected urgency label.", true)}</div>
  </div>`;
}

function scopeFields() {
  return `<div class="form-grid">
    ${numberField("affectedUsers", "People or customers affected", "Use the best defensible estimate.")}
    ${teamSelectField("operationalOwner", "Operational Ownership", "Who will operate, support, maintain, and respond to failure after acceptance?")}
    ${booleanChoice("production", "Will this change production?")}
    ${booleanChoice("customerFacing", "Can customers experience the outcome or a failure?")}
    ${booleanChoice("sensitiveData", "Does it handle sensitive or regulated data?")}
    ${booleanChoice("authenticationPath", "Is it part of authentication or authorization?")}
    ${booleanChoice("internetExposed", "Is any component exposed to the public internet?")}
    ${booleanChoice("purchase", "Could this require a purchase or vendor commitment?")}
    ${numberField("spendUsd", "Potential financial commitment (USD)", "Financial Commitment Class is kept separate from delivery size and risk.")}
    <fieldset class="field wide"><legend>Affected systems</legend><div class="system-choice-grid">${Object.entries(COMPANY.systems).map(([id, system]) => `<label class="choice system-choice"><input type="checkbox" data-system="${h(id)}" ${state.affectedSystems.includes(id) ? "checked" : ""}><span><strong>${h(system.name)}</strong><small>Owned by ${h(COMPANY.teams[system.owner].name)} · depends on ${h(system.dependsOn.map((dependencyId) => COMPANY.systems[dependencyId].name).join(", "))}</small></span></label>`).join("")}</div><small>The system derives participating functions and dependency handoffs from this service map. Routing does not commit their capacity.</small></fieldset>
    <div class="wide">${textField("dependencyNotes", "Dependency evidence", "Record commitments, decisions, external events, or hidden contracts that the service map cannot derive.", true)}</div>
  </div>`;
}

function framingFields() {
  return `<div class="form-grid">
    ${selectField("intent", "Primary intent", ["Discovery", "Migration", "Redesign", "Enablement", "Optimization"], "One intent per Work Package; if two are required, split the work.")}
    ${selectField("outcomeShape", "Top-level outcome shape", ["single", "multiple"], "One independently valuable result produces an Epic; several produce an Initiative containing Epics.")}
    <div class="wide">${textField("preconditions", "What must be true before work starts?", "List constraints and prerequisite decisions, not solutions.", true)}</div>
    <div class="wide">${textField("reusableArtifact", "What reusable artifact must exist at the end?", "For Discovery, this is the proof of completion; it is not running code.", true)}</div>
    <div class="wide">${textField("downstreamEnabled", "What downstream work should never need to ask why again?", "State what can proceed without reconstructing the reasoning.", true)}</div>
    ${booleanChoice("knownUnknowns", "Does material Known Uncertainty remain?", "A substantive unknown creates bounded Discovery; Assisted Intake must stop before doing that work.")}
    <div class="wide">${textField("uncertaintyQuestion", "Decision-critical question", "What question must bounded Discovery answer?", true)}</div>
    <div class="wide">${textField("discoveryTimebox", "Discovery timebox", "State how the timebox is divided so continuing work cannot hide inside an undifferentiated duration.", true)}</div>
    <div class="wide">${textField("epicOutcomes", "Candidate independently valuable Epic outcomes", "One outcome per line. These are candidate delivery records, not authorized work.", true)}</div>
  </div>`;
}

function effortFields() {
  const result = evaluate();
  return `<div class="form-grid">
    ${numberField("laborDays", "Current labor forecast (person-days)", "A delivery estimate supplied or accepted by delivery reviewers; it is not requester-selected size.")}
    ${numberField("durationWeeks", "Current elapsed-duration forecast (weeks)", "This includes waiting and dependencies; it does not overwrite the Approved Delivery Baseline.")}
  </div>
  <div class="route-preview"><strong>Current size calculation: ${result.deliverySize}</strong><br>
    Labor: ${result.bands.labor} · Duration: ${result.bands.duration} · Coordination: ${result.bands.coordination}<br>
    The highest dimension wins. Four XS dimensions could not cancel one XL dimension.</div>`;
}

function artifactTree(result) {
  if (result.disposition.key === "service") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DEMAND</span><span>${h(result.disposition.label)} · governed by its operational path and structured capture</span></div></div>`;
  }
  if (result.disposition.key === "blocked") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DRAFT</span><span>Work Proposal has no authority; sponsorship acceptance is required</span></div></div>`;
  }
  if (result.disposition.key === "assisted") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">ASSIST</span><span>Assisted Intake may explain the route; it may not author a Work Proposal or perform Discovery</span></div></div>`;
  }
  if (result.disposition.key === "draft") {
    const missing = [...result.proposalMissing, ...result.framingMissing];
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DRAFT</span><span>Draft Work Proposal has no authority; missing evidence: ${h(missing.join(", ") || "unspecified")}</span></div></div>`;
  }
  const reviewRecords = result.reviews.map((review) => `<div class="ticket child"><span class="ticket-key">STAGE ${review.stage}</span><span>${h(review.name)} record · Decision Owner: ${h(review.decisionOwner)}</span></div>`).join("");
  return `<div class="ticket-tree">
    <div class="ticket"><span class="ticket-key">${h(result.proposalRecord.label)}</span><span>${h(result.proposalRecord.type)} · ${h(result.proposalRecord.authority)}</span></div>
    <div class="ticket child"><span class="ticket-key">FRAME</span><span>${h(state.intent || "Intent missing")} framing record · artifact: ${h(state.reusableArtifact || "missing")}</span></div>
    ${result.workStructure.discoveryPackage ? `<div class="ticket child"><span class="ticket-key">DISCOVERY</span><span>Bounded Discovery Work Package · ${h(result.workStructure.discoveryPackage.question)}</span></div>` : ""}
    ${reviewRecords}
    <div class="ticket child pending"><span class="ticket-key">PENDING</span><span>Authorized Work Proposal · assembled only after every required review record clears</span></div>
  </div>`;
}

function systemGraphMarkup(result) {
  const selected = result.graph.selected.map((id) => `<li><strong>${h(COMPANY.systems[id].name)}</strong> · ${h(COMPANY.teams[COMPANY.systems[id].owner].name)}</li>`).join("");
  const dependencies = result.graph.dependencies.map((id) => `<li><strong>${h(COMPANY.systems[id].name)}</strong> · derived dependency owned by ${h(COMPANY.teams[COMPANY.systems[id].owner].name)}</li>`).join("");
  return `<h4>Named affected systems</h4><ul>${selected || "<li>None named</li>"}</ul><h4>Derived dependencies</h4><ul>${dependencies || "<li>None derived</li>"}</ul>`;
}

function companyStructureMarkup() {
  return `<p class="muted company-mission">${h(COMPANY.mission)}</p><div class="org-grid">${COMPANY.groups.map((group) => `<section class="org-group"><h4>${h(group.name)}</h4>${group.teams.map((teamId) => { const team = COMPANY.teams[teamId]; return `<div class="org-team"><strong>${h(team.shortName)}</strong><span>${h(team.name)}</span><small>Owns ${h(team.owns)}.</small></div>`; }).join("")}</section>`).join("")}</div>`;
}

function reviewMarkup(result) {
  if (!result.reviews.length) return `<p class="muted">No Work Proposal review is active on this front-door path.</p>`;
  return `<div class="decision-list">${result.reviews.map((review) => `<article class="decision-row"><span class="stage-badge">Stage ${review.stage}</span><div><strong>${h(review.name)}</strong><small>${h(review.state)} · Decision Owner: ${h(review.decisionOwner)}</small><p>${h(review.reason)}</p></div></article>`).join("")}</div>`;
}

function capacityMarkup(result) {
  if (!result.capacityDecisions.length) return `<p class="muted">No delivery functions derived yet.</p>`;
  return `<div class="decision-list">${result.capacityDecisions.map((decision) => `<article class="decision-row"><span class="state-badge">${h(decision.state)}</span><div><strong>${h(decision.team)}</strong><small>Capacity Owner: ${h(decision.decisionOwner)}</small><p>${h(decision.meaning)}</p></div></article>`).join("")}</div>`;
}

function workStructureMarkup(result) {
  const structure = result.workStructure;
  const discovery = structure.discoveryPackage ? `<div class="work-record"><span class="record-type">Discovery Work Package</span><strong>${h(structure.discoveryPackage.question)}</strong><small>Done when: ${h(structure.discoveryPackage.doneWhen)} · Timebox: ${h(structure.discoveryPackage.scope)}</small></div>` : "";
  if (structure.type === "Undetermined") return `${discovery}<p class="muted">${h(structure.reason)}</p>`;
  if (structure.type === "Epic candidate") return `${discovery}<div class="work-record"><span class="record-type">Epic candidate</span><strong>${h(structure.outcome)}</strong><small>Outcome / Exit Condition: ${h(structure.exitCondition)}</small></div>`;
  const epics = structure.epics.map((outcome) => `<div class="work-record child-record"><span class="record-type">Epic candidate</span><strong>${h(outcome)}</strong><small>Requires its own Outcome / Exit Condition and Delivery Readiness decisions.</small></div>`).join("");
  return `${discovery}<div class="work-record"><span class="record-type">Initiative candidate</span><strong>${h(structure.outcome)}</strong><small>${h(structure.reason)}</small></div>${epics}`;
}

function evidenceTable(headers, rows) {
  return `<div class="evidence-table-wrap"><table class="evidence-table"><thead><tr>${headers.map((header) => `<th>${h(header)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${h(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

function evidenceList(items) {
  return `<ul>${items.map((item) => `<li>${h(item)}</li>`).join("")}</ul>`;
}

function capabilityDecisionMarkup() {
  const decision = state.capabilityDecision;
  if (!decision) return "";

  const current = decision.currentState;
  return `<section class="result-card full capability-package">
    <p class="eyebrow">Detailed Discovery output</p>
    <h3>Metrics Capability Decision Package</h3>
    <p class="package-route"><strong>${h(decision.route)}</strong></p>
    <div class="loop-strip">${decision.invariant.split(" → ").map((step, index) => `<span><b>${index + 1}</b>${h(step)}</span>`).join("")}</div>
    <p class="muted">This package selects and proves a target. It does not turn selection into migration authority. Implementation, acceptance, Managed Runoff, and reconciliation remain later governed commitments.</p>

    <details open class="evidence-section"><summary>1 · Current-State Baseline and explicit delta</summary>
      <div class="evidence-body">
        <div class="baseline-banner"><strong>${h(current.baseline)}</strong><span>${h(current.resolution)}</span></div>
        <div class="evidence-columns"><div><h4>Authoritative artifacts</h4>${evidenceList(current.artifacts)}</div><div><h4>Live architecture represented</h4>${evidenceList(current.architecture)}</div></div>
        <h4>Delta since the accepted revision</h4>${evidenceList(current.delta)}
        <h4>Record boundaries</h4><p>Historical ADRs remain with the systems they govern. Selection produces a Selection Decision Record, not an ADR. If later design makes an architectural decision, that design records it outside this process.</p>${evidenceTable(["Artifact", "Kind", "Boundary"], decision.recordBoundaries.map((item) => [item.id, item.kind, item.purpose]))}
      </div>
    </details>

    <details open class="evidence-section"><summary>2 · Measurement ledger</summary>
      <div class="evidence-body"><p>The ledger freezes the measured Current State before candidate testing begins. Every acceptance threshold traces to the same retained evidence rather than a vendor estimate or an unexplained round number.</p>
      ${evidenceTable(["ID", "Measure", "Current evidence", "Required measurement method"], decision.measurements.map((item) => [item.id, item.measure, item.currentEvidence, item.method]))}</div>
    </details>

    <details open class="evidence-section"><summary>3 · Requirements structure</summary>
      <div class="evidence-body"><p><strong>will</strong> records a proposal fact or buyer obligation; <strong>shall</strong> is mandatory and pass/fail; <strong>should</strong> is a scored comparative goal.</p>
      ${evidenceTable(["ID", "Force", "Requirement", "Verification"], decision.requirements.map((item) => [item.id, item.force, item.statement, item.verification]))}</div>
    </details>

    <details open class="evidence-section"><summary>4 · Options and claims</summary>
      <div class="evidence-body"><p>The current system is an option, not an invisible default. Open source, internal redesign, managed service, and commercial software enter the same evidence system.</p>
      ${evidenceTable(["Option", "Category", "Claim", "Proof required"], decision.options.map((item) => [item.option, item.category, item.claim, item.proofNeeded]))}</div>
    </details>

    <details open class="evidence-section"><summary>5 · POC and decision gates</summary>
      <div class="evidence-body">${evidenceTable(["Gate", "Exercise", "Pass condition"], decision.proofPlan.map((item) => [item.gate, item.exercise, item.pass]))}</div>
    </details>

    <details open class="evidence-section"><summary>6 · Evidence-System Tailoring</summary>
      <div class="evidence-body"><p>The logical process is invariant. These are decisions about ceremony, independent roles, procurement controls, and proof depth.</p>
      ${evidenceTable(["Control", "Disposition", "Rationale"], decision.tailoring.map((item) => [item.control, item.disposition, item.rationale]))}</div>
    </details>

    <details open class="evidence-section"><summary>7 · Acceptance and reconciliation contract for later implementation</summary>
      <div class="evidence-body">${evidenceList(decision.futureAcceptance)}</div>
    </details>
  </section>`;
}

function resultMarkup(compact = false) {
  const result = evaluate();
  return `<div class="result-shell">
    <section class="result-hero ${result.disposition.key}">
      <p class="eyebrow">Deterministic disposition</p>
      <div class="route">${h(result.disposition.label)}</div>
      <p>${h(result.disposition.summary)}</p>
      ${!["service", "assisted"].includes(result.disposition.key) ? `<div class="pill-row"><span class="pill">${h(state.intent || "Intent missing")}</span><span class="pill">${result.deliverySize} Delivery Size Class</span><span class="pill">${h(result.financialClass.key)} Financial Commitment Class</span></div>` : ""}
    </section>
    <div class="result-grid">
      <section class="result-card"><h3>Delivery Capacity Profile</h3><ul><li>Labor: <strong>${result.bands.labor}</strong> (${Number(state.laborDays) || "?"} person-days)</li><li>Duration: <strong>${result.bands.duration}</strong> (${Number(state.durationWeeks) || "?"} weeks)</li><li>Coordination: <strong>${result.bands.coordination}</strong> (${result.graph.teamIds.length || "?"} implicated teams; ${result.graph.handoffs} derived handoffs)</li><li>Delivery Size Class: <strong>${result.deliverySize}</strong> — highest dimension</li></ul></section>
      <section class="result-card"><h3>Financial Commitment Class</h3><p><strong>${h(result.financialClass.key)}</strong> · ${h(result.financialClass.label)}</p><p class="muted">Kept separate from delivery capacity and risk.</p></section>
      <section class="result-card"><h3>Work Proposal Risk Profile</h3><div class="pill-row">${result.risks.map((risk) => `<span class="pill risk">${h(risk)}</span>`).join("")}</div></section>
      <section class="result-card"><h3>Proposal and framing gaps</h3><h4>Work Proposal evidence</h4><p>${result.proposalMissing.length ? h(result.proposalMissing.join(" · ")) : "Complete enough for review"}</p><h4>Framing</h4><p>${result.framingMissing.length ? h(result.framingMissing.join(" · ")) : "Five-Box Framing Scaffold represented"}</p></section>
      ${capabilityDecisionMarkup()}
      <section class="result-card full"><h3>Fictional company operating model</h3>${companyStructureMarkup()}</section>
      <section class="result-card full"><h3>Northstar service and dependency map</h3>${systemGraphMarkup(result)}</section>
      <section class="result-card full"><h3>Provisional ordered review route</h3><p class="muted">This browser preview explains why review may be required. Backstage replaces it with the authoritative catalog dependency closure, owning Groups, and reviewer roles before Jira publication.</p>${reviewMarkup(result)}</section>
      <section class="result-card full"><h3>Capacity Acceptance</h3>${capacityMarkup(result)}</section>
      <section class="result-card full"><h3>Candidate delivery hierarchy</h3>${workStructureMarkup(result)}<p class="muted">Stories / Work Packages wait for design evidence and one coherent vertical slice with Acceptance Criteria. Tasks wait until a concrete deliverable is known. Candidate records refine planning; they do not rewrite the approved outcome, boundary, requirement, or Acceptance Conditions.</p></section>
      ${compact ? "" : `<section class="result-card full"><h3>Artifact and authority chain</h3>${artifactTree(result)}<p class="muted" style="margin: .7rem 0 0; font-size: .75rem;">Demonstration only. No request, review record, or delivery item has been created.</p></section>`}
      <section class="result-card full"><h3>Why it routed this way</h3>${result.routing.map((line) => `<div class="logic-line">${h(line)}</div>`).join("")}</section>
    </div>
  </div>`;
}

const WIZARD_STEPS = [
  ["Boundary", "Service request or proposal?", boundaryFields],
  ["Proposal", "What organizational change is being proposed?", purposeFields],
  ["Framing", "What kind of thinking does the work require?", framingFields],
  ["Reach", "Which systems and operating boundaries could this touch?", scopeFields],
  ["Capacity", "What does the current delivery forecast say?", effortFields],
  ["Lifecycle", "What may proceed, and what remains undecided?", () => resultMarkup(false)],
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
        ${wizardStep < WIZARD_STEPS.length - 1 ? `<div class="route-preview"><strong>Live route preview</strong><br>${h(evaluate().disposition.label)}<br><span class="muted">Nothing is submitted while you answer.</span></div>` : ""}
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
        <section class="worksheet-section"><div class="section-heading"><h2>2. Work Proposal evidence</h2><span>Authenticated demand</span></div>${purposeFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>3. Five-Box Framing Scaffold</h2><span>Before design</span></div>${framingFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>4. Reach and dependencies</h2><span>Fact-derived routing</span></div>${scopeFields()}</section>
        <section class="worksheet-section"><div class="section-heading"><h2>5. Delivery Capacity Profile</h2><span>Forecast, not requester size</span></div>${effortFields()}</section>
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
    <div class="map-node ${assisted || result.disposition.key === "draft" ? "active" : service || blocked ? "dim" : ""}"><strong>3 · Establish Proposal Readiness</strong><small>${result.proposalMissing.length ? `Missing evidence: ${h(result.proposalMissing.join(", "))}` : "Work Proposal evidence is present"}</small></div>
    <div class="map-node ${result.framingMissing.length ? "active" : service || blocked ? "dim" : ""}"><strong>4 · Frame before design</strong><small>${result.framingMissing.length ? `Missing: ${h(result.framingMissing.join(", "))}` : `${h(state.intent || "Unknown")} intent; ${result.workStructure.discoveryPackage ? "bounded Discovery required" : "no Discovery package derived"}`}</small></div>
    <div class="map-node ${proposal ? "active" : "dim"}"><strong>5 · Begin ordered review</strong><small>${result.reviews.length} provisional review records; Backstage re-derives the authoritative route before Jira publication; ${result.capacityDecisions.length} later Capacity Acceptance decisions</small></div>
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
          <div class="bubble">Frame the work before anyone converges on design or implementation.</div>
          <div class="chat-question">${framingFields()}</div>
          <div class="bubble">Now identify systems and operating boundaries. The organization derives teams and reviews from those facts.</div>
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
      markCustom();
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

  document.querySelectorAll("[data-system]").forEach((control) => control.addEventListener("change", () => {
    const system = control.dataset.system;
    state.affectedSystems = control.checked ? [...new Set([...state.affectedSystems, system])] : state.affectedSystems.filter((item) => item !== system);
    markCustom();
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

function markCustom() {
  if (state.scenario !== "Custom" && state.proposalId) state.proposalRevision = Number(state.proposalRevision) + 1;
  state.scenario = "Custom";
}

function updateLightweightOutputs() {
  // Wizard inputs can update without stealing focus. Full result appears in step five.
  const preview = document.querySelector(".wizard-intro .route-preview");
  if (preview) preview.innerHTML = `<strong>Live route preview</strong><br>${h(evaluate().disposition.label)}<br><span class="muted">Nothing is submitted while you answer.</span>`;
  const capacity = document.querySelector(".wizard-card .route-preview");
  if (capacity && wizardStep === 4) {
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

window.addEventListener("message", (event) => {
  if (event.source !== window.parent || event.origin !== window.location.origin) return;
  if (event.data?.type !== "northstar:work-intake:artifact-request") return;

  try {
    window.parent.postMessage({
      type: "northstar:work-intake:artifact-response",
      requestId: event.data.requestId,
      artifact: domainModel.publicationArtifact(state),
    }, event.origin);
  } catch (error) {
    window.parent.postMessage({
      type: "northstar:work-intake:artifact-response",
      requestId: event.data.requestId,
      error: error instanceof Error ? error.message : String(error),
    }, event.origin);
  }
});

render();
