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
let wizardStep = Math.max(0, Number(new URLSearchParams(window.location.search).get("step")) || 0);
const evaluate = () => domainModel.evaluate(state);

const initialScenario = new URLSearchParams(window.location.search).get("scenario");
if (initialScenario && SCENARIOS[initialScenario]) state = structuredClone(SCENARIOS[initialScenario]);

function paragraphs(value) {
  return String(value || "").split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function firstSentence(value) {
  const match = String(value || "").match(/^.*?[.!?](?:\s|$)/);
  return match ? match[0].trim() : "";
}

function remainderAfter(value, prefix) {
  return prefix ? String(value || "").slice(prefix.length).trim() : String(value || "").trim();
}

function requirementRows(value) {
  return paragraphs(value).map((block, index) => {
    const match = block.match(/^(WILL|SHALL|SHOULD)(?:-([A-Z0-9-]+))?:\s*(.*)$/is);
    return match
      ? { id: match[2] || String(index + 1).padStart(3, "0"), force: match[1].toLowerCase(), condition: match[3].trim(), verification: "" }
      : { id: String(index + 1).padStart(3, "0"), force: "shall", condition: block, verification: "" };
  });
}

function prepareGuidedState(candidate) {
  if (candidate.guided?.version === 1) return;
  const current = paragraphs(candidate.currentState);
  const baseline = firstSentence(current[0]);
  const artifactMatch = String(candidate.reusableArtifact || "").match(/^([^:]+):\s*(.*)$/s);
  candidate.guided = {
    version: 1,
    enforce: candidate.scenario === "Blank" || candidate.scenario === "Metrics selection",
    dirty: {},
    currentState: {
      baselineMode: baseline ? "reference" : "define",
      baselineReference: baseline,
      architecture: remainderAfter(current[0], baseline),
      measurements: current[1] || "",
      constraints: current.slice(2).join("\n\n"),
      delta: "",
    },
    outcome: { scope: "", capability: candidate.outcome || "", proof: "", horizon: "" },
    difference: { preserve: "", change: candidate.difference || "", evidence: "" },
    requirements: requirementRows(candidate.requirements),
    acceptance: [{ context: "", evidence: candidate.success || "", verification: "" }],
    nonGoals: [{ exclusion: candidate.nonGoals || "", reason: "" }],
    dependencies: [{ dependency: "", owner: "", contribution: candidate.dependencyNotes || "", evidence: "" }],
    preconditions: [{ condition: candidate.preconditions || "", evidenceOwner: "" }],
    artifact: {
      identifier: artifactMatch?.[1]?.trim() || "",
      contents: artifactMatch?.[2]?.trim() || candidate.reusableArtifact || "",
      completionProof: "",
    },
    downstream: { work: candidate.downstreamEnabled || "", fixedDecisions: "" },
    timing: {
      event: candidate.requiredBy || "",
      evidence: "",
      missedDecision: candidate.consequence || "",
      avoidableCommitment: "",
      fallback: "",
    },
    discovery: {
      question: candidate.uncertaintyQuestion || "",
      endDecision: "",
      phases: [{ phase: candidate.discoveryTimebox || "", exit: "" }],
    },
    epicOutcomes: String(candidate.epicOutcomes || "").split("\n").filter(Boolean).map((capability) => ({ capability, measure: "", horizon: "" })),
  };

  if (candidate.scenario === "Metrics selection") {
    const decision = candidate.capabilityDecision;
    candidate.guided.currentState.delta = decision.currentState.delta.join(" ");
    candidate.guided.outcome = {
      scope: "Metrics emitted by 16 Kubernetes clusters, 1,240 Linux hosts, and 74 application services across two data centers and three cloud regions.",
      capability: "Northstar has selected a metrics capability that preserves Prometheus remote-write, PromQL, dashboards, alerting, and the accepted retention obligations without carrying forward the unsupported release, seven-month capacity horizon, or current operating burden.",
      proof: "it sustains 1.74 million samples per second with 14.2 million active series and the 690,000-series churn event; executes the accepted 50-query corpus; evaluates all 8,420 rules through the defined failure tests; and reduces recurring SRE work to no more than 24 person-hours per month",
      horizon: "31-day, 93-day, and 730-day retention outcomes and a defensible five-year lifecycle-cost horizon",
    };
    candidate.guided.difference = {
      preserve: "the current remote-write, PromQL, dashboard, alert-rule, OIDC-group, service-identity, and 31-day, 93-day, and 730-day retention contracts",
      change: "The selected capability must remove the March 31, 2027 support deadline, the 730-day tier's seven-month capacity horizon, the observed critical-alert evaluation gap, the unexercised restore path, and an operating model that consumes 56 SRE hours each month.",
      evidence: "OBS-MEASURE-2026-05, the 1.16-million-sample observed peak and 1.74-million-sample test target, 14.2 million active series, the 690,000-series churn event, OBS-QUERY-050, OBS-RULE-8420, equivalent failure scripts, operator exercises, and a reconciled five-year lifecycle-cost model",
    };
    candidate.guided.requirements = decision.requirements.map((item) => ({
      id: item.id.replace(/^(WILL|SHALL|SHOULD)-/i, ""),
      force: item.force,
      condition: item.statement,
      verification: item.verification,
    }));
    candidate.guided.acceptance = [
      { context: "candidate access opens", evidence: "every candidate has received the same versioned input package and its hashes are retained", verification: "candidate receipts and input-package hash register" },
      { context: "equivalent proof work ends", evidence: "every SHALL has a retained pass, fail, or explicitly accepted exception; independent scores and the decision narrative identify the same material tradeoffs", verification: "requirement-compliance matrix, evaluator score sheets, POC records, and exception decisions" },
      { context: "lifecycle cost is compared", evidence: "infrastructure, licenses, network transfer, support, and operator labor reconcile across the five-year horizon", verification: "Finance-accepted cost model tied to measured resource and operator inputs" },
      { context: "the Decision Owner accepts the selection", evidence: "the selected option, rejected options, material claims, residual uncertainty, implementation preconditions, and later implementation tests are recorded without authorizing migration", verification: "accepted SEL-OBS-007 Selection Decision Record and later acceptance contract" },
    ];
    candidate.guided.nonGoals = [
      { exclusion: "Changing instrumentation libraries, metric names, labels, dashboard ownership, alert thresholds, log aggregation, tracing, or product analytics.", reason: "Those producer and adjacent-observability changes are not required to select the metrics capability." },
      { exclusion: "Migrating a producer, retiring a retention tier, or entering Managed Runoff.", reason: "Selection authorizes implementation framing only; migration requires a later Authorized Work Proposal and Capacity Acceptances." },
      { exclusion: "Approving the target-system architecture beyond the evidence needed to compare candidates.", reason: "Later design owns its architectural decisions and records any resulting ADRs outside intake and selection." },
    ];
    candidate.guided.dependencies = [
      { dependency: "Versioned Current-State Baseline and workload replay", owner: "SRE", contribution: "Freeze OBS-ARCH-004 rev 7 plus delta, OBS-MEASURE-2026-05, the query and rule corpora, operator exercises, and failure scripts before candidate testing.", evidence: "Signed input manifest and retained hashes; this does not commit implementation capacity." },
      { dependency: "Equivalent POC compute and replay path", owner: "Platform and Network Engineering", contribution: "Provide the isolated six-node Kubernetes cluster, record resource use, sustain the 10 Gb/s replay path, and execute packet-loss and zone-isolation tests.", evidence: "POC environment record and accepted test schedule." },
      { dependency: "Consumer validation", owner: "Named system owners", contribution: "Each affected service owner validates its ten highest-value queries and critical alerts against the same candidate release and input package.", evidence: "Per-owner query and alert validation records." },
      { dependency: "Five-year comparison and contracting boundary", owner: "Finance & Procurement", contribution: "Validate lifecycle cost; authorize contracting only after the selection decision.", evidence: "$1.2 million comparison envelope; no purchase authorization in this proposal." },
    ];
    candidate.guided.preconditions = [
      { condition: "OBS-ARCH-004 rev 7, its explicit delta, and the May 1–28 workload export are accepted as the comparison baseline.", evidenceOwner: "SRE, Platform, Network Engineering, and the five largest producing teams" },
      { condition: "The workload replay contains no prohibited labels or research identifiers.", evidenceOwner: "Information Security owns the recorded redaction approval" },
      { condition: "Every candidate receives the same POC schedule, input package, measurement definitions, and tuning constraints.", evidenceOwner: "The selection facilitator owns the versioned candidate receipt register" },
      { condition: "The financial envelope is available for comparison but creates no purchase commitment.", evidenceOwner: "Finance owns the $1.2 million five-year planning envelope decision" },
    ];
    candidate.guided.artifact.completionProof = "every SHALL has retained pass/fail/accepted-exception evidence; candidate claims reconcile to the POC record and cost model; and the Decision Owner records selection, rejection, tradeoffs, residual uncertainty, and later implementation conditions";
    candidate.guided.downstream.fixedDecisions = "the capability selection, accepted Current-State Baseline and workload, retention obligations, candidate comparison, and the Selection Decision Record; later design still owns its own architectural decisions and ADRs";
    candidate.guided.timing = {
      event: "The Selection Decision Record must be accepted by November 30, 2026, before the FY2027 support-renewal and storage-expansion purchase window.",
      evidence: "the March 31, 2027 support date, Procurement's January 15 renewal decision, and the 730-day tier's measured 2.8% monthly growth forecast",
      missedDecision: "Northstar loses the supported window for a planned replacement before the current release leaves support.",
      avoidableCommitment: "approximately $310,000 for another year of the current architecture plus expansion of the 730-day tier",
      fallback: "Procurement renews the current platform by January 15 and SRE adds capacity before the tier reaches its 90% operating limit",
    };
    candidate.guided.discovery.endDecision = "Select one option, reject all options, or authorize a separately bounded proof for a named residual uncertainty; do not convert the selection result into migration authority.";
    candidate.guided.discovery.phases = [
      { phase: "5 working days — freeze inputs", exit: "baseline, delta, datasets, measures, and hashes are accepted" },
      { phase: "5 working days — Implementation Currency Check and response review", exit: "current options, claims, exceptions, and proof obligations are recorded" },
      { phase: "15 working days — equivalent POCs", exit: "every SHALL has retained pass/fail evidence and operator exercises are complete" },
      { phase: "5 working days — independent scoring and selection", exit: "score reconciliation and the Selection Decision Record are accepted or all options are rejected" },
    ];
    candidate.guided.epicOutcomes = [{
      capability: "The metrics capability decision is accepted with enough evidence to frame—but not authorize—the implementation path.",
      measure: "every mandatory condition has retained evidence; cost and material tradeoffs reconcile; residual uncertainty and later acceptance tests are recorded",
      horizon: "before the FY2027 renewal and storage-expansion purchase window",
    }];
  }
}

prepareGuidedState(state);

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

function guidedValue(path) {
  return path.split(".").reduce((value, key) => value?.[key], state.guided);
}

function setGuidedValue(path, value) {
  const keys = path.split(".");
  const finalKey = keys.pop();
  const parent = keys.reduce((object, key) => object[key], state.guided);
  parent[finalKey] = value;
}

function guidedField(path, label, help = "", options = {}) {
  const { textarea = false, placeholder = "", select = [] } = options;
  const value = guidedValue(path);
  let control;
  if (select.length) {
    control = `<select data-guided-path="${h(path)}"><option value="">Select one…</option>${select.map(([key, text]) => `<option value="${h(key)}" ${value === key ? "selected" : ""}>${h(text)}</option>`).join("")}</select>`;
  } else if (textarea) {
    control = `<textarea data-guided-path="${h(path)}" rows="${textareaRows(value)}" placeholder="${h(placeholder)}">${h(value)}</textarea>`;
  } else {
    control = `<input type="text" data-guided-path="${h(path)}" value="${h(value)}" placeholder="${h(placeholder)}">`;
  }
  return `<label class="field"><span>${h(label)}</span>${control}${help ? `<small>${h(help)}</small>` : ""}</label>`;
}

function guidedRepeater(path, title, help, columns, addLabel) {
  const rows = guidedValue(path) || [];
  return `<section class="guided-repeater wide">
    <div class="guided-heading"><div><h4>${h(title)}</h4><p>${h(help)}</p></div><button type="button" class="add-row" data-guided-add="${h(path)}">+ ${h(addLabel)}</button></div>
    <div class="guided-rows">${rows.length ? rows.map((row, index) => `<article class="guided-row">
      <div class="guided-row-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="guided-row-fields">${columns.map((column) => {
        const value = row[column.key] || "";
        const control = column.options
          ? `<select data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}"><option value="">Select…</option>${column.options.map(([key, text]) => `<option value="${h(key)}" ${value === key ? "selected" : ""}>${h(text)}</option>`).join("")}</select>`
          : column.textarea
            ? `<textarea rows="${textareaRows(value)}" data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}" placeholder="${h(column.placeholder || "")}">${h(value)}</textarea>`
            : `<input type="text" data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}" value="${h(value)}" placeholder="${h(column.placeholder || "")}">`;
        return `<label class="field ${column.wide ? "wide" : ""}"><span>${h(column.label)}</span>${control}${column.help ? `<small>${h(column.help)}</small>` : ""}</label>`;
      }).join("")}</div>
      <button type="button" class="remove-row" aria-label="Remove row ${index + 1}" data-guided-remove="${h(path)}" data-guided-index="${index}">Remove</button>
    </article>`).join("") : `<p class="empty-guided">No entries yet. Add one; an empty paragraph cannot stand in for this evidence.</p>`}</div>
  </section>`;
}

function compiledPreview(field, label) {
  return `<details class="compiled-preview wide"><summary>Generated ${h(label)}</summary><pre data-preview-field="${h(field)}">${h(state[field])}</pre></details>`;
}

function joinParts(parts) {
  return parts.map((part) => String(part || "").trim()).filter(Boolean).join("\n\n");
}

function compileGuidedSection(section) {
  const guided = state.guided;
  guided.dirty[section] = true;
  if (section === "currentState") {
    const current = guided.currentState;
    state.currentState = joinParts([
      current.baselineMode === "reference" ? current.baselineReference : "",
      current.architecture,
      current.measurements,
      current.constraints,
      current.delta ? `Explicit delta from the accepted baseline: ${current.delta}` : "",
    ]);
  }
  if (section === "outcome") {
    const value = guided.outcome;
    state.outcome = joinParts([
      value.scope ? `Operating scope: ${value.scope}` : "",
      value.capability,
      value.proof ? `The outcome is real when ${value.proof}` : "",
      value.horizon ? `Required operating horizon: ${value.horizon}` : "",
    ]);
  }
  if (section === "difference") {
    const value = guided.difference;
    state.difference = joinParts([
      value.preserve ? `The result must preserve ${value.preserve}` : "",
      value.change,
      value.evidence ? `The comparison must use ${value.evidence}` : "",
    ]);
  }
  if (section === "requirements") {
    state.requirements = guided.requirements.filter((item) => String(item.condition || "").trim()).map((item, index) => {
      const force = String(item.force || "shall").toUpperCase();
      const identifier = item.id || String(index + 1).padStart(3, "0");
      return `${force}-${identifier}: ${item.condition}${item.verification ? `\nVerification: ${item.verification}` : ""}`.trim();
    }).filter(Boolean).join("\n\n");
  }
  if (section === "acceptance") {
    state.success = guided.acceptance.filter((item) => [item.context, item.evidence, item.verification].some((value) => String(value || "").trim())).map((item, index) => joinParts([
      `AC-${String(index + 1).padStart(3, "0")}: ${item.context ? `Given ${item.context}, ` : ""}${item.evidence}`,
      item.verification ? `Verification: ${item.verification}` : "",
    ])).filter(Boolean).join("\n\n");
  }
  if (section === "nonGoals") {
    state.nonGoals = guided.nonGoals.map((item) => `${item.exclusion}${item.reason ? ` Reason: ${item.reason}` : ""}`.trim()).filter(Boolean).join("\n");
  }
  if (section === "dependencies") {
    state.dependencyNotes = guided.dependencies.map((item) => {
      const subject = [item.dependency, item.owner ? `owned by ${item.owner}` : ""].filter(Boolean).join(" — ");
      return joinParts([subject, item.contribution, item.evidence ? `Evidence or commitment: ${item.evidence}` : ""]);
    }).filter(Boolean).join("\n\n");
  }
  if (section === "preconditions") {
    state.preconditions = guided.preconditions.map((item) => `${item.condition}${item.evidenceOwner ? ` Evidence owner: ${item.evidenceOwner}.` : ""}`.trim()).filter(Boolean).join("\n");
  }
  if (section === "artifact") {
    const value = guided.artifact;
    state.reusableArtifact = `${value.identifier}${value.identifier && value.contents ? ": " : ""}${value.contents}${value.completionProof ? ` Completion is proven by ${value.completionProof}` : ""}`.trim();
  }
  if (section === "downstream") {
    const value = guided.downstream;
    state.downstreamEnabled = joinParts([value.work, value.fixedDecisions ? `Downstream work must not reopen ${value.fixedDecisions}` : ""]);
  }
  if (section === "timing") {
    const value = guided.timing;
    state.requiredBy = joinParts([value.event, value.evidence ? `Timing source: ${value.evidence}` : ""]);
    state.consequence = joinParts([
      value.missedDecision,
      value.avoidableCommitment ? `Avoidable commitment or exposure: ${value.avoidableCommitment}` : "",
      value.fallback ? `Fallback if the condition is missed: ${value.fallback}` : "",
    ]);
  }
  if (section === "discovery") {
    state.uncertaintyQuestion = guided.discovery.question;
    state.discoveryTimebox = guided.discovery.phases.map((item) => `${item.phase}${item.exit ? `; exits when ${item.exit}` : ""}`.trim()).filter(Boolean).join("\n");
  }
  if (section === "epicOutcomes") {
    state.epicOutcomes = guided.epicOutcomes.map((item) => joinParts([
      item.capability,
      item.measure ? `Verified by ${item.measure}` : "",
      item.horizon ? `Operating horizon: ${item.horizon}` : "",
    ])).filter(Boolean).join("\n");
  }
}

function compileAllGuidedSections() {
  ["currentState", "outcome", "difference", "requirements", "acceptance", "nonGoals", "dependencies", "preconditions", "artifact", "downstream", "timing", "discovery", "epicOutcomes"].forEach(compileGuidedSection);
}

function guidedSectionFor(control) {
  if (control.dataset.guidedPath) return control.dataset.guidedPath.split(".")[0];
  return control.dataset.guidedList.split(".")[0];
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

function purposeFields(mode = "all") {
  const hidden = (part) => mode === "all" || mode === part ? "" : "hidden-part";
  return `<div class="form-grid purpose-fields">
    <div class="part subgrid wide ${hidden("identity")}">
    ${textField("requester", "Authenticated requester", "The person who knowingly asks the organization to act. A receiving team may not manufacture this demand.")}
    ${teamSelectField("requestingTeam", "Requesting function")}
    <div class="wide">${textField("title", "Short working title")}</div>
    </div>

    <section class="guided-section wide part ${hidden("current")}">
      <div class="guided-heading"><div><p class="eyebrow">Current-State Baseline</p><h3>Define the system that exists before proposing its replacement.</h3></div><span class="evidence-rule">Architecture · workload · failure · cost · delta</span></div>
      <div class="form-grid">
        ${guidedField("currentState.baselineMode", "How is Current State established?", "Reference an accepted revision only when its delta is explicit.", { select: [["reference", "Reference an accepted baseline and state its delta"], ["define", "Define the Current State in this proposal"]] })}
        ${guidedField("currentState.baselineReference", "Authoritative baseline reference", "Name the artifact, revision, acceptance date, and owner. Do not write “see existing documentation.”", { placeholder: "OBS-ARCH-004 rev 7, accepted May 18, 2026 by SRE" })}
        <div class="wide">${guidedField("currentState.architecture", "Architecture and operating path", "Name the live components, quantities, locations, connections, owners, and traffic or data path relevant to this request.", { textarea: true, placeholder: "38 collectors receive Prometheus-format metrics from 16 clusters…" })}</div>
        <div class="wide">${guidedField("currentState.measurements", "Measured production workload", "Give the observation window, units, sustained behavior, percentiles, maxima, and the retained source. State “not measured” when Discovery must establish it.", { textarea: true, placeholder: "May 1–28: 640,000 sustained samples/s; 910,000 p95… Source: OBS-WORKLOAD-2026-05." })}</div>
        <div class="wide">${guidedField("currentState.constraints", "Observed failure, lifecycle, cost, and operator effort", "Record actual behavior: support dates, capacity horizon, recovery evidence, incidents, recurring labor, and current cost. Do not turn a suspected cause into a fact.", { textarea: true, placeholder: "The release leaves vendor support on… SRE spends 56 person-hours/month…" })}</div>
        <div class="wide">${guidedField("currentState.delta", "Explicit delta from the referenced baseline", "If the baseline remains current, say what was checked and that no material delta was found. Otherwise name every change relevant to this proposal.", { textarea: true, placeholder: "Since rev 7, storage nodes were replaced like-for-like; topology and retention behavior are unchanged…" })}</div>
      </div>
      ${compiledPreview("currentState", "Current State")}
    </section>

    <section class="guided-section wide part ${hidden("outcome")}">
      <div class="guided-heading"><div><p class="eyebrow">Desired Outcome</p><h3>State one operating result, not a preferred implementation.</h3></div><span class="evidence-rule">Scope · capability · proof · horizon</span></div>
      <div class="form-grid">
        ${guidedField("outcome.scope", "Who or what must experience the result?", "Name the population, services, sites, workloads, or operating boundary.", { textarea: true, placeholder: "All 6,400 employees and contractors across 147 workforce applications…" })}
        ${guidedField("outcome.capability", "What must become true?", "Use product-neutral operating language. Include preserved behavior and the failure mode that disappears.", { textarea: true, placeholder: "Northstar has selected a capability that preserves… without carrying forward…" })}
        ${guidedField("outcome.proof", "How will the organization know it is true?", "Name the decisive measures or observations. Detailed test steps belong in Acceptance Conditions.", { textarea: true, placeholder: "The accepted query corpus passes and recurring operator work is ≤24 hours/month…" })}
        ${guidedField("outcome.horizon", "For how long or by what event must it remain true?", "Use an operating horizon, contractual event, or sustained observation window—not an arbitrary project deadline.", { textarea: true, placeholder: "Through the five-year planning horizon and a 30-day production burn-in…" })}
      </div>
      ${compiledPreview("outcome", "Desired Outcome")}
    </section>

    <section class="guided-section wide part ${hidden("outcome")}">
      <div class="guided-heading"><div><p class="eyebrow">Required Difference</p><h3>Make the material gap inspectable.</h3></div><span class="evidence-rule">Preserve · change · compare</span></div>
      <div class="form-grid">
        ${guidedField("difference.preserve", "What current contracts or outcomes must remain true?", "Name interfaces, behavior, data obligations, recovery promises, or authorization semantics that cannot be lost.", { textarea: true, placeholder: "Prometheus remote-write, PromQL, dashboards, alert rules, and retention obligations…" })}
        ${guidedField("difference.change", "Which measured conditions must change?", "Pair each current limitation with the condition required instead. Do not say only “modernize,” “improve,” or “replace.”", { textarea: true, placeholder: "Remove the March 31 support deadline, seven-month capacity horizon, and 56-hour monthly operating burden…" })}
        <div class="wide">${guidedField("difference.evidence", "What evidence must the decision compare?", "Name the production workload, failure behavior, operator exercise, cost model, retention obligation, or other common test basis.", { textarea: true, placeholder: "The May workload replay, 50-query corpus, 8,420-rule corpus, failure scripts, and five-year lifecycle cost…" })}</div>
      </div>
      ${compiledPreview("difference", "Required Difference")}
    </section>

    <div class="part subgrid wide ${hidden("proof")}">
    ${guidedRepeater("requirements", "Requirements", "One condition per row. Facts and buyer obligations use will; mandatory pass/fail conditions use shall; scored comparative goals use should. Every row names how it will be verified.", [
      { key: "force", label: "Force", options: [["will", "will — supplied fact or obligation"], ["shall", "shall — mandatory pass/fail condition"], ["should", "should — scored comparative goal"]] },
      { key: "id", label: "Stable ID", placeholder: "001" },
      { key: "condition", label: "Operating condition", textarea: true, wide: true, placeholder: "The candidate shall ingest 1.74 million samples/s for 60 minutes…" },
      { key: "verification", label: "Verification method", textarea: true, wide: true, placeholder: "Replay the retained May workload; reconcile sent, accepted, rejected, queued, and stored counts…" },
    ], "requirement")}
    ${compiledPreview("requirements", "Requirements")}

    ${guidedRepeater("acceptance", "Acceptance Conditions", "Describe observable proof of the Desired Outcome. Acceptance is not “the implementation is complete,” “documentation exists,” or “a ticket was closed.”", [
      { key: "context", label: "Condition or event", textarea: true, placeholder: "During loss of one availability zone under the accepted peak workload…" },
      { key: "evidence", label: "Observable result", textarea: true, placeholder: "No acknowledged samples are lost and normal ingestion, query, and alert behavior returns within 30 minutes…" },
      { key: "verification", label: "Retained proof", textarea: true, wide: true, placeholder: "Failure-test record with timestamps, reconciled counters, query results, and evaluator sign-off…" },
    ], "acceptance condition")}
    ${compiledPreview("success", "Acceptance Conditions")}

    ${guidedRepeater("nonGoals", "Non-Goals", "Name adjacent work that a reasonable reader might otherwise assume is included. An exclusion is a boundary, not a parking lot for unresolved scope.", [
      { key: "exclusion", label: "Explicitly excluded change", textarea: true, placeholder: "This proposal will not change application instrumentation libraries, metric names, or dashboard ownership…" },
      { key: "reason", label: "Why it is outside this outcome", textarea: true, placeholder: "Those changes have separate owners and are not required to close the stated gap…" },
    ], "non-goal")}
    ${compiledPreview("nonGoals", "Non-Goals")}
    </div>

    <div class="part subgrid wide ${hidden("authority")}">
    ${textField("sponsor", "Work Sponsor", "A name alone is not sponsorship; acceptance must be tied to this proposal revision.")}
    ${selectField("sponsorLevel", "Sponsor level", ["Manager", "Director", "Vice President", "Executive"])}
    ${booleanChoice("sponsorAccepted", "Has the sponsor accepted this proposal revision?", "Sponsorship accepts the priority claim, evaluation capacity, and organizational tradeoffs.")}
    ${textField("acceptanceAuthority", "Acceptance Authority", "Who may decide that the delivered result satisfies the agreed proof and operating conditions?")}
    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Timing Evidence</p><h3>Establish the external condition; do not select an urgency label.</h3></div><span class="evidence-rule">Event · source · consequence · fallback</span></div>
      <div class="form-grid">
        ${guidedField("timing.event", "Required-by event and latest useful date", "Tie the date to a contract, renewal, capacity limit, compliance event, dependency window, or other observable condition.", { textarea: true, placeholder: "Selection accepted by November 30, before the FY2027 renewal and storage-purchase window…" })}
        ${guidedField("timing.evidence", "Source of the timing condition", "Name the contract clause, forecast, calendar, accepted plan, or owner who can verify it.", { textarea: true, placeholder: "Current support contract; 2.8% monthly growth forecast; Procurement renewal calendar…" })}
        ${guidedField("timing.missedDecision", "Which decision or outcome becomes unavailable?", "State the organizational consequence. “The project will be late” is circular and supplies no priority evidence.", { textarea: true, placeholder: "The organization loses the supported replacement window before March 31, 2027…" })}
        ${guidedField("timing.avoidableCommitment", "What cost, risk, or obligation is created?", "Quantify the consequence where the evidence permits it.", { textarea: true, placeholder: "$310,000 renewal plus another capacity expansion on the current architecture…" })}
        <div class="wide">${guidedField("timing.fallback", "What will the organization do if it misses the condition?", "Name the real fallback. If no decision has been made, say who must make it.", { textarea: true, placeholder: "Procurement renews for one year and SRE expands the 730-day tier before the 90% limit…" })}</div>
      </div>
      ${compiledPreview("requiredBy", "Required-By Evidence")}
      ${compiledPreview("consequence", "Consequence of Missing It")}
    </section>
    </div>
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
    ${guidedRepeater("dependencies", "Non-catalog dependency evidence", "The catalog derives system ownership and dependency closure. Add only a prerequisite decision, contribution, commitment, external event, or hidden contract that it cannot derive. A dependency does not imply Capacity Acceptance.", [
      { key: "dependency", label: "Dependency", placeholder: "Sanitized production-workload replay" },
      { key: "owner", label: "Fact or decision owner", placeholder: "SRE Observability Lead" },
      { key: "contribution", label: "What must be supplied or decided?", textarea: true, wide: true, placeholder: "Freeze the May 1–28 replay and measurement definitions before candidate testing begins…" },
      { key: "evidence", label: "Existing commitment or source", textarea: true, wide: true, placeholder: "OBS-WORKLOAD-2026-05 accepted by producing teams; no delivery capacity committed…" },
    ], "dependency")}
    ${compiledPreview("dependencyNotes", "Dependency Evidence")}
  </div>`;
}

function framingFields() {
  return `<div class="form-grid">
    ${selectField("intent", "Primary intent", ["Discovery", "Migration", "Redesign", "Enablement", "Optimization"], "One intent per Work Package; if two are required, split the work.")}
    ${selectField("outcomeShape", "Top-level outcome shape", ["single", "multiple"], "One independently valuable result produces an Epic; several produce an Initiative containing Epics.")}
    ${guidedRepeater("preconditions", "Preconditions", "State conditions that must already be true before this work may start. Do not disguise implementation steps or preferred designs as prerequisites.", [
      { key: "condition", label: "Required prior fact or decision", textarea: true, placeholder: "Producing teams have accepted OBS-ARCH-004 rev 7 and the May workload export as accurate…" },
      { key: "evidenceOwner", label: "Who proves it, and with what record?", textarea: true, placeholder: "SRE owns the signed baseline; Security owns replay-redaction approval…" },
    ], "precondition")}
    ${compiledPreview("preconditions", "Preconditions")}

    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Reusable Output Artifact</p><h3>Name the record that proves completion and survives the work.</h3></div></div>
      <div class="form-grid">
        ${guidedField("artifact.identifier", "Stable artifact identifier", "Use the organization’s durable record name—not a Jira issue key generated later.", { placeholder: "SEL-OBS-007" })}
        ${guidedField("artifact.contents", "Required contents", "Name the baseline, measurements, decisions, rejected options, residual uncertainty, and later acceptance contract the artifact must retain.", { textarea: true, placeholder: "Versioned baseline and delta; workload dataset; requirement compliance; POC results; tradeoffs…" })}
        <div class="wide">${guidedField("artifact.completionProof", "What makes the artifact accepted rather than merely present?", "Name the required reconciliation, signatures, decision, or evidence closure.", { textarea: true, placeholder: "Every SHALL has pass/fail/accepted-exception evidence and the Decision Owner records the selected and rejected options…" })}</div>
      </div>
      ${compiledPreview("reusableArtifact", "Reusable Output Artifact")}
    </section>

    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Downstream Work Enabled</p><h3>Say what can proceed without reconstructing why.</h3></div></div>
      <div class="form-grid">
        ${guidedField("downstream.work", "What later work can now be framed?", "Name the next decision or Work Proposal, not a promise that implementation has been authorized.", { textarea: true, placeholder: "A later Work Proposal can name the selected capability and split implementation into producer onboarding…" })}
        ${guidedField("downstream.fixedDecisions", "Which accepted facts or decisions must not be reopened?", "Name the baseline, obligations, comparison, and boundaries that downstream work inherits.", { textarea: true, placeholder: "Product selection, May workload, retention obligations, and the accepted failure tests…" })}
      </div>
      ${compiledPreview("downstreamEnabled", "Downstream Work Enabled")}
    </section>

    ${booleanChoice("knownUnknowns", "Does material Known Uncertainty remain?", "A substantive unknown creates bounded Discovery; Assisted Intake must stop before doing that work.")}
    <section class="guided-section wide ${state.knownUnknowns ? "" : "guided-muted"}">
      <div class="guided-heading"><div><p class="eyebrow">Bounded Discovery</p><h3>A question, a stop condition, and an end-of-timebox decision.</h3></div><span class="evidence-rule">Never implementation authority</span></div>
      <div class="form-grid">
        <div class="wide">${guidedField("discovery.question", "Decision-critical question", "Ask one question whose answer changes the design, option, boundary, or authorization decision.", { textarea: true, placeholder: "Which option passes the accepted workload and failure tests at the lowest defensible lifecycle cost?" })}</div>
        <div class="wide">${guidedField("discovery.endDecision", "Decision required when the timebox ends", "State the allowed dispositions even if evidence remains incomplete: proceed, reject, split, extend through a new decision, or accept residual uncertainty.", { textarea: true, placeholder: "Select one option, reject all options, or authorize a separately bounded proof for a named residual uncertainty…" })}</div>
      </div>
      ${guidedRepeater("discovery.phases", "Timebox phases", "Divide the timebox into evidence-producing phases. Each phase has an exit condition; elapsed time alone is not progress.", [
        { key: "phase", label: "Bounded phase and duration", textarea: true, placeholder: "5 working days — freeze inputs and candidate claims" },
        { key: "exit", label: "Phase exit evidence", textarea: true, placeholder: "Versioned input package accepted; unresolved claims entered in the claim register" },
      ], "timebox phase")}
      ${compiledPreview("uncertaintyQuestion", "Discovery Question")}
      ${compiledPreview("discoveryTimebox", "Discovery Timebox")}
    </section>

    ${guidedRepeater("epicOutcomes", "Candidate independently valuable Epic outcomes", "Use only when the top-level outcome requires an Initiative. Each row states a capability or removed failure mode, its verification, and an operating horizon. These remain candidates, not authorized work.", [
      { key: "capability", label: "Capability or failure mode changed", textarea: true, placeholder: "The target tenant authenticates test users in both regions and survives primary-region isolation…" },
      { key: "measure", label: "Measure or decisive check", textarea: true, placeholder: "No more than five minutes of new-session interruption; security events export within five minutes…" },
      { key: "horizon", label: "Operating horizon", textarea: true, placeholder: "30-day burn-in after the migration wave…" },
    ], "candidate Epic outcome")}
    ${compiledPreview("epicOutcomes", "Candidate Epic Outcomes")}
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
  ["Demand", "Who is asking the organization to act?", () => purposeFields("identity")],
  ["Current State", "What system and operating conditions exist now?", () => purposeFields("current")],
  ["Outcome", "What must become true, and what must change?", () => purposeFields("outcome")],
  ["Proof", "What conditions and evidence will govern the result?", () => purposeFields("proof")],
  ["Authority", "Who accepts the claim, and what makes its timing real?", () => purposeFields("authority")],
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
    prepareGuidedState(state);
    compileAllGuidedSections();
    setScenarioInUrl(button.dataset.scenario);
    render();
  }));

  document.querySelectorAll("[data-guided-path], [data-guided-list]").forEach((control) => {
    const eventName = control.matches("select") ? "change" : "input";
    control.addEventListener(eventName, () => {
      if (control.dataset.guidedPath) setGuidedValue(control.dataset.guidedPath, control.value);
      else guidedValue(control.dataset.guidedList)[Number(control.dataset.guidedIndex)][control.dataset.guidedKey] = control.value;
      const section = guidedSectionFor(control);
      compileGuidedSection(section);
      markCustom();
      setScenarioInUrl("Custom");
      document.querySelectorAll(`[data-preview-field]`).forEach((preview) => { preview.textContent = state[preview.dataset.previewField] || ""; });
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

  document.querySelectorAll("[data-guided-add]").forEach((button) => button.addEventListener("click", () => {
    const path = button.dataset.guidedAdd;
    const templates = {
      requirements: { id: "", force: "shall", condition: "", verification: "" },
      acceptance: { context: "", evidence: "", verification: "" },
      nonGoals: { exclusion: "", reason: "" },
      dependencies: { dependency: "", owner: "", contribution: "", evidence: "" },
      preconditions: { condition: "", evidenceOwner: "" },
      "discovery.phases": { phase: "", exit: "" },
      epicOutcomes: { capability: "", measure: "", horizon: "" },
    };
    guidedValue(path).push(structuredClone(templates[path]));
    compileGuidedSection(path.split(".")[0]);
    markCustom();
    setScenarioInUrl("Custom");
    render();
  }));

  document.querySelectorAll("[data-guided-remove]").forEach((button) => button.addEventListener("click", () => {
    const path = button.dataset.guidedRemove;
    guidedValue(path).splice(Number(button.dataset.guidedIndex), 1);
    compileGuidedSection(path.split(".")[0]);
    markCustom();
    setScenarioInUrl("Custom");
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
    if (button.dataset.wizard === "restart") { state = blankState(); prepareGuidedState(state); compileAllGuidedSections(); wizardStep = 0; }
    render();
  }));
}

function markCustom() {
  if (state.scenario !== "Custom" && state.proposalId) state.proposalRevision = Number(state.proposalRevision) + 1;
  state.scenario = "Custom";
  if (state.guided) state.guided.enforce = true;
}

function updateLightweightOutputs() {
  // Wizard inputs can update without stealing focus. Full result appears in the final step.
  const preview = document.querySelector(".wizard-intro .route-preview");
  if (preview) preview.innerHTML = `<strong>Live route preview</strong><br>${h(evaluate().disposition.label)}<br><span class="muted">Nothing is submitted while you answer.</span>`;
  const capacity = document.querySelector(".wizard-card .route-preview");
  if (capacity && wizardStep === WIZARD_STEPS.length - 2) {
    const result = evaluate();
    capacity.innerHTML = `<strong>Current size calculation: ${result.deliverySize}</strong><br>Labor: ${result.bands.labor} · Duration: ${result.bands.duration} · Coordination: ${result.bands.coordination}<br>The highest dimension wins. Four XS dimensions could not cancel one XL dimension.`;
  }
}

function render() {
  const variant = currentVariant();
  wizardStep = Math.min(wizardStep, WIZARD_STEPS.length - 1);
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

compileAllGuidedSections();
render();
