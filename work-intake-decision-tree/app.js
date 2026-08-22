// THROWAWAY PROTOTYPE: deterministic intake routing for a fictional company.
// Three structurally different variants are switchable through ?variant=A|B|C.

const VARIANTS = {
  A: "Guided interview",
  B: "Proposal worksheet",
  C: "Routing conversation",
};

const domainModel = window.WorkIntakePrototype;
const { COMPANY, SCENARIOS, blankState } = domainModel;
const formDefinitions = window.WorkIntakeFormDefinitions;
const app = document.querySelector("#app");

let state = blankState();
let formDefinition;
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
  if (candidate.guided?.version === 1) {
    candidate.guided.problem ??= {
      statement: candidate.problem?.statement || "",
      benefit: candidate.problem?.benefit || "",
    };
    candidate.guided.feasibility ??= structuredClone(candidate.feasibility || {});
    return;
  }
  const current = paragraphs(candidate.currentState);
  const baseline = firstSentence(current[0]);
  const artifactMatch = String(candidate.reusableArtifact || "").match(/^([^:]+):\s*(.*)$/s);
  candidate.guided = {
    version: 1,
    enforce: candidate.scenario === "Blank" || candidate.scenario === "Metrics selection",
    dirty: {},
    problem: {
      statement: candidate.problem?.statement || "",
      benefit: candidate.problem?.benefit || "",
    },
    feasibility: structuredClone(candidate.feasibility || {}),
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
  const revisionControl = state.proposalId
    ? `<div class="revision-control"><strong>${h(state.proposalId)} rev ${h(state.proposalRevision)}</strong><button class="secondary-button" type="button" data-new-revision>Create revision ${h(domainModel.nextProposalRevision(state))}</button></div>`
    : "";
  return `<div class="scenario-tools"><div class="scenario-bar"><span>Load scenario</span>${Object.keys(SCENARIOS).map((name) => `<button class="scenario-button ${state.scenario === name ? "active" : ""}" type="button" data-scenario="${h(name)}">${h(name)}</button>`).join("")}</div>${revisionControl}</div>`;
}

function topbar(dark = false) {
  return `<header class="topbar ${dark ? "dark" : ""}">
    <div class="brand"><div class="brand-mark">N</div><div><strong>${h(COMPANY.name)}</strong><small>Research technology · Work Intake demonstration</small></div></div>
    ${scenarioBar()}
  </header>`;
}

function selectField(id) {
  const definition = definedField(id);
  const field = definition.statePath;
  return `<label class="field"><span>${h(definition.label)}</span><select data-form-field-id="${h(id)}" data-field="${h(field)}"><option value="">Select one…</option>${definition.options.map(([value, label]) => `<option value="${h(value)}" ${state[field] === value ? "selected" : ""}>${h(label)}</option>`).join("")}</select>${definition.help ? `<small>${h(definition.help)}</small>` : ""}</label>`;
}

function teamSelectField(id) {
  const definition = definedField(id);
  const field = definition.statePath;
  const options = Object.entries(COMPANY.teams).map(([id, team]) => `<option value="${h(id)}" ${state[field] === id ? "selected" : ""}>${h(team.name)}</option>`).join("");
  return `<label class="field"><span>${h(definition.label)}</span><select data-form-field-id="${h(id)}" data-field="${h(field)}"><option value="">Select one…</option>${options}</select>${definition.help ? `<small>${h(definition.help)}</small>` : ""}</label>`;
}

function textareaRows(value) {
  const wrappedLines = String(value || "").split("\n").reduce((count, line) => count + Math.max(1, Math.ceil(line.length / 92)), 0);
  return Math.max(4, Math.min(32, wrappedLines + 1));
}

function textField(id) {
  const definition = definedField(id);
  const field = definition.statePath;
  const control = definition.type === "textarea"
    ? `<textarea data-form-field-id="${h(id)}" data-field="${h(field)}" rows="${textareaRows(state[field])}">${h(state[field])}</textarea>`
    : `<input type="text" data-form-field-id="${h(id)}" data-field="${h(field)}" value="${h(state[field])}">`;
  return `<label class="field"><span>${h(definition.label)}</span>${control}${definition.help ? `<small>${h(definition.help)}</small>` : ""}</label>`;
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

function definedField(id) {
  const field = formDefinitions.fieldsIn(formDefinition).find((candidate) => candidate.id === id);
  if (!field) throw new Error(`Form definition field not found: ${id}`);
  return field;
}

function guidedField(id) {
  const field = definedField(id);
  const path = field.statePath;
  const label = field.label;
  const help = field.help || "";
  const textarea = field.type === "textarea";
  const placeholder = field.placeholder || "";
  const select = field.options || [];
  const value = guidedValue(path);
  let control;
  if (select.length) {
    control = `<select data-form-field-id="${h(id)}" data-guided-path="${h(path)}"><option value="">Select one…</option>${select.map(([key, text]) => `<option value="${h(key)}" ${value === key ? "selected" : ""}>${h(text)}</option>`).join("")}</select>`;
  } else if (textarea) {
    control = `<textarea data-form-field-id="${h(id)}" data-guided-path="${h(path)}" rows="${textareaRows(value)}" placeholder="${h(placeholder)}">${h(value)}</textarea>`;
  } else {
    control = `<input type="text" data-form-field-id="${h(id)}" data-guided-path="${h(path)}" value="${h(value)}" placeholder="${h(placeholder)}">`;
  }
  return `<label class="field"><span>${h(label)}</span>${control}${help ? `<small>${h(help)}</small>` : ""}</label>`;
}

function guidedRepeater(id) {
  const field = definedField(id);
  const path = field.statePath;
  const title = field.label;
  const help = field.help;
  const columns = field.columns;
  const addLabel = field.addLabel;
  const rows = guidedValue(path) || [];
  return `<section class="guided-repeater wide">
    <div class="guided-heading"><div><h4>${h(title)}</h4><p>${h(help)}</p></div><button type="button" class="add-row" data-guided-add="${h(path)}">+ ${h(addLabel)}</button></div>
    <div class="guided-rows">${rows.length ? rows.map((row, index) => `<article class="guided-row">
      <div class="guided-row-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="guided-row-fields">${columns.map((column) => {
        const value = row[column.key] || "";
        const control = column.options
          ? `<select data-form-field-id="${h(id)}" data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}"><option value="">Select…</option>${column.options.map(([key, text]) => `<option value="${h(key)}" ${value === key ? "selected" : ""}>${h(text)}</option>`).join("")}</select>`
          : column.type === "textarea"
            ? `<textarea rows="${textareaRows(value)}" data-form-field-id="${h(id)}" data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}" placeholder="${h(column.placeholder || "")}">${h(value)}</textarea>`
            : `<input type="text" data-form-field-id="${h(id)}" data-guided-list="${h(path)}" data-guided-index="${index}" data-guided-key="${h(column.key)}" value="${h(value)}" placeholder="${h(column.placeholder || "")}">`;
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
  if (section === "problem") {
    state.problem = structuredClone(guided.problem);
  }
  if (section === "feasibility") {
    state.feasibility = structuredClone(guided.feasibility);
  }
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
  ["problem", "currentState", "outcome", "feasibility", "difference", "requirements", "acceptance", "nonGoals", "dependencies", "preconditions", "artifact", "downstream", "timing", "discovery", "epicOutcomes"].forEach(compileGuidedSection);
}

function guidedSectionFor(control) {
  if (control.dataset.guidedPath) return control.dataset.guidedPath.split(".")[0];
  return control.dataset.guidedList.split(".")[0];
}

function numberField(id) {
  const definition = definedField(id);
  const field = definition.statePath;
  return `<label class="field"><span>${h(definition.label)}</span><input type="number" min="${Number(definition.minimum) || 0}" data-form-field-id="${h(id)}" data-field="${h(field)}" value="${Number(state[field]) || ""}">${definition.help ? `<small>${h(definition.help)}</small>` : ""}</label>`;
}

function booleanChoice(id) {
  const definition = definedField(id);
  const field = definition.statePath;
  return `<fieldset class="field"><legend>${h(definition.label)}</legend><div class="choice-grid">
    <label class="choice"><input type="radio" name="${h(field)}" data-form-field-id="${h(id)}" data-field="${h(field)}" value="true" ${state[field] ? "checked" : ""}>Yes</label>
    <label class="choice"><input type="radio" name="${h(field)}" data-form-field-id="${h(id)}" data-field="${h(field)}" value="false" ${!state[field] ? "checked" : ""}>No</label>
  </div>${definition.help ? `<small>${h(definition.help)}</small>` : ""}</fieldset>`;
}

function boundaryFields() {
  const definition = definedField("intake.catalog-path");
  return `<fieldset class="field"><legend>${h(definition.label)}</legend><div class="choice-grid">
    ${definition.options.map(([value, label]) => `<label class="choice"><input type="radio" name="catalogPath" data-form-field-id="${h(definition.id)}" data-field="${h(definition.statePath)}" value="${h(value)}" ${state.catalogPath === value ? "checked" : ""}>${h(label)}</label>`).join("")}
  </div><small>${h(definition.help)}</small></fieldset>
  ${state.catalogPath === "inquiry" ? `<div class="form-grid">${numberField("intake.inquiry-hours")}${booleanChoice("intake.requires-change")}</div>` : ""}`;
}

function purposeFields(mode = "all") {
  const hidden = (part) => mode === "all" || mode === part ? "" : "hidden-part";
  return `<div class="form-grid purpose-fields">
    <div class="part subgrid wide ${hidden("identity")}">
    ${textField("submission.requester")}
    ${teamSelectField("submission.requesting-team")}
    <div class="wide">${textField("proposal.title")}</div>
    </div>

    <section class="guided-section wide part ${hidden("current")}">
      <div class="guided-heading"><div><p class="eyebrow">Problem and Benefit</p><h3>Establish why any change is warranted.</h3></div><span class="evidence-rule">Problem · limitation · benefit</span></div>
      <div class="form-grid">
        <div class="wide">${guidedField("proposal.problem.statement")}</div>
        <div class="wide">${guidedField("proposal.problem.benefit")}</div>
      </div>
    </section>

    <section class="guided-section wide part ${hidden("current")}">
      <div class="guided-heading"><div><p class="eyebrow">Current-State Baseline</p><h3>Define the system that exists before proposing its replacement.</h3></div><span class="evidence-rule">Architecture · workload · failure · cost · delta</span></div>
      <div class="form-grid">
        ${guidedField("proposal.current-state.baseline-mode")}
        ${guidedField("proposal.current-state.baseline-reference")}
        <div class="wide">${guidedField("proposal.current-state.architecture")}</div>
        <div class="wide">${guidedField("proposal.current-state.workload-evidence")}</div>
        <div class="wide">${guidedField("proposal.current-state.constraints")}</div>
        <div class="wide">${guidedField("proposal.current-state.delta")}</div>
      </div>
      ${compiledPreview("currentState", "Current State")}
    </section>

    <section class="guided-section wide part ${hidden("outcome")}">
      <div class="guided-heading"><div><p class="eyebrow">Desired Outcome</p><h3>State one operating result, not a preferred implementation.</h3></div><span class="evidence-rule">Scope · capability · proof · horizon</span></div>
      <div class="form-grid">
        ${guidedField("proposal.desired-outcome.scope")}
        ${guidedField("proposal.desired-outcome.capability")}
        ${guidedField("proposal.desired-outcome.proof")}
        ${guidedField("proposal.desired-outcome.horizon")}
      </div>
      ${compiledPreview("outcome", "Desired Outcome")}
    </section>

    <section class="guided-section wide part ${hidden("outcome")}">
      <div class="guided-heading"><div><p class="eyebrow">Feasibility Basis</p><h3>Establish that the required result is physically achievable.</h3></div><span class="evidence-rule">Target · limits · evidence · assumptions · margin · finding</span></div>
      <div class="form-grid">
        ${guidedRepeater("proposal.feasibility-bases")}
      </div>
    </section>

    <section class="guided-section wide part ${hidden("outcome")}">
      <div class="guided-heading"><div><p class="eyebrow">Required Difference</p><h3>Make the material gap inspectable.</h3></div><span class="evidence-rule">Preserve · change · compare</span></div>
      <div class="form-grid">
        ${guidedField("proposal.required-difference.preserve")}
        ${guidedField("proposal.required-difference.change")}
        <div class="wide">${guidedField("proposal.required-difference.evidence-basis")}</div>
      </div>
      ${compiledPreview("difference", "Required Difference")}
    </section>

    <div class="part subgrid wide ${hidden("proof")}">
    ${guidedRepeater("proposal.requirements")}
    ${compiledPreview("requirements", "Requirements")}

    ${guidedRepeater("proposal.acceptance-conditions")}
    ${compiledPreview("success", "Acceptance Conditions")}

    ${guidedRepeater("proposal.non-goals")}
    ${compiledPreview("nonGoals", "Non-Goals")}
    </div>

    <div class="part subgrid wide ${hidden("authority")}">
    ${textField("proposal.sponsor.name")}
    ${selectField("proposal.sponsor.level")}
    ${booleanChoice("proposal.sponsor.accepted")}
    ${textField("proposal.acceptance-authority")}
    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Timing Evidence</p><h3>Establish the external condition; do not select an urgency label.</h3></div><span class="evidence-rule">Event · source · consequence · fallback</span></div>
      <div class="form-grid">
        ${guidedField("proposal.timing.event")}
        ${guidedField("proposal.timing.evidence")}
        ${guidedField("proposal.timing.missed-decision")}
        ${guidedField("proposal.timing.avoidable-commitment")}
        <div class="wide">${guidedField("proposal.timing.fallback")}</div>
      </div>
      ${compiledPreview("requiredBy", "Required-By Evidence")}
      ${compiledPreview("consequence", "Consequence of Missing It")}
    </section>
    </div>
  </div>`;
}

function scopeFields() {
  const affectedSystems = definedField("proposal.affected-systems");
  return `<div class="form-grid">
    ${numberField("proposal.affected-user-count")}
    ${teamSelectField("proposal.operational-owner")}
    ${booleanChoice("routing.production")}
    ${booleanChoice("routing.customer-facing")}
    ${booleanChoice("routing.sensitive-data")}
    ${booleanChoice("routing.authentication-path")}
    ${booleanChoice("routing.internet-exposed")}
    ${booleanChoice("routing.purchase")}
    ${numberField("routing.spend-usd")}
    <fieldset class="field wide"><legend>${h(affectedSystems.label)}</legend><div class="system-choice-grid">${Object.entries(COMPANY.systems).map(([id, system]) => `<label class="choice system-choice"><input type="checkbox" data-form-field-id="${h(affectedSystems.id)}" data-system="${h(id)}" ${state.affectedSystems.includes(id) ? "checked" : ""}><span><strong>${h(system.name)}</strong><small>Owned by ${h(COMPANY.teams[system.owner].name)} · depends on ${h(system.dependsOn.map((dependencyId) => COMPANY.systems[dependencyId].name).join(", "))}</small></span></label>`).join("")}</div><small>${h(affectedSystems.help)}</small></fieldset>
    ${guidedRepeater("proposal.dependencies")}
    ${compiledPreview("dependencyNotes", "Dependency Evidence")}
  </div>`;
}

function framingFields() {
  return `<div class="form-grid">
    ${selectField("proposal.intent")}
    ${selectField("proposal.outcome-shape")}
    ${guidedRepeater("proposal.preconditions")}
    ${compiledPreview("preconditions", "Preconditions")}

    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Reusable Output Artifact</p><h3>Name the record that proves completion and survives the work.</h3></div></div>
      <div class="form-grid">
        ${guidedField("proposal.reusable-artifact.identifier")}
        ${guidedField("proposal.reusable-artifact.contents")}
        <div class="wide">${guidedField("proposal.reusable-artifact.completion-proof")}</div>
      </div>
      ${compiledPreview("reusableArtifact", "Reusable Output Artifact")}
    </section>

    <section class="guided-section wide">
      <div class="guided-heading"><div><p class="eyebrow">Downstream Work Enabled</p><h3>Say what can proceed without reconstructing why.</h3></div></div>
      <div class="form-grid">
        ${guidedField("proposal.downstream.work")}
        ${guidedField("proposal.downstream.fixed-decisions")}
      </div>
      ${compiledPreview("downstreamEnabled", "Downstream Work Enabled")}
    </section>

    ${booleanChoice("proposal.known-uncertainty")}
    <section class="guided-section wide ${state.knownUnknowns ? "" : "guided-muted"}">
      <div class="guided-heading"><div><p class="eyebrow">Bounded Discovery</p><h3>A question, a stop condition, and an end-of-timebox decision.</h3></div><span class="evidence-rule">Never implementation authority</span></div>
      <div class="form-grid">
        <div class="wide">${guidedField("proposal.discovery.question")}</div>
        <div class="wide">${guidedField("proposal.discovery.end-decision")}</div>
      </div>
      ${guidedRepeater("proposal.discovery.phases")}
      ${compiledPreview("uncertaintyQuestion", "Discovery Question")}
      ${compiledPreview("discoveryTimebox", "Discovery Timebox")}
    </section>

    ${guidedRepeater("proposal.candidate-epic-outcomes")}
    ${compiledPreview("epicOutcomes", "Candidate Epic Outcomes")}
  </div>`;
}

function effortFields() {
  const result = evaluate();
  return `<div class="form-grid">
    ${numberField("planning.labor-days")}
    ${numberField("planning.duration-weeks")}
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
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DRAFT</span><span>Work Proposal has no authority; the draft must identify whether sponsor acceptance is claimed</span></div></div>`;
  }
  if (result.disposition.key === "assisted") {
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">ASSIST</span><span>Assisted Intake may explain the route; it may not author a Work Proposal or perform Discovery</span></div></div>`;
  }
  if (result.disposition.key === "draft") {
    const missing = [...result.proposalMissing, ...result.framingMissing];
    return `<div class="ticket-tree"><div class="ticket"><span class="ticket-key">DRAFT</span><span>Draft Work Proposal has no authority; missing evidence: ${h(missing.join(", ") || "unspecified")}</span></div></div>`;
  }
  const reviewRecords = result.reviews.map((review) => `<div class="ticket child pending"><span class="ticket-key">CANDIDATE STAGE ${review.stage}</span><span>${h(review.name)} · not created · Decision Owner: ${h(review.decisionOwner)}</span></div>`).join("");
  return `<div class="ticket-tree">
    <div class="ticket"><span class="ticket-key">${h(result.proposalRecord.label)}</span><span>${h(result.proposalRecord.type)} · ${h(result.proposalRecord.authority)}</span></div>
    <div class="ticket child"><span class="ticket-key">FRAME</span><span>${h(state.intent || "Intent missing")} framing evidence · artifact: ${h(state.reusableArtifact || "missing")}</span></div>
    ${result.workStructure.discoveryPackage ? `<div class="ticket child pending"><span class="ticket-key">DISCOVERY CANDIDATE</span><span>Bounded Discovery Work Package · ${h(result.workStructure.discoveryPackage.question)}</span></div>` : ""}
    ${reviewRecords}
    <div class="ticket child pending"><span class="ticket-key">PENDING</span><span>Durable sponsor approval must be attached before ordered review work is created</span></div>
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

  document.querySelector("[data-new-revision]")?.addEventListener("click", () => {
    domainModel.beginNewRevision(state);
    setScenarioInUrl("Custom");
    render();
  });

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
  domainModel.markProposalEdited(state);
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
  if (event.data?.type === "northstar:work-intake:proposal-identity") {
    state.proposalId = event.data.proposalId;
    state.proposalRevision = Number(event.data.revision);
    state.durablySavedRevision = Number(event.data.revision);
    render();
    return;
  }
  if (event.data?.type === "northstar:work-intake:record-request") {
    try {
      const answers = formDefinitions.collectAnswers(formDefinition, { ...state, ...state.guided });
      const missing = formDefinitions.validateAnswers(formDefinition, answers);
      const result = evaluate();
      const missingEvidence = [
        ...missing.map((entry) => ({ id: entry.id, label: entry.label })),
        ...result.proposalMissing.map((label) => ({ id: `proposal-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label })),
        ...result.framingMissing.map((label) => ({ id: `framing-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label })),
      ].filter((entry, index, entries) => entries.findIndex((candidate) => candidate.id === entry.id) === index);
      let reviewableArtifact;
      if (missingEvidence.length === 0) {
        try {
          const reviewableState = structuredClone(state);
          reviewableState.proposalId ||= "SERVER-ASSIGNED";
          reviewableState.proposalRevision ??= 0;
          reviewableState.formAnswers = answers;
          reviewableState.compiledAnswers = formDefinitions.compileAnswers(formDefinition, answers);
          reviewableArtifact = domainModel.publicationArtifact(reviewableState);
        } catch {
          // The backend treats an omitted artifact as incomplete evidence.
        }
      }
      window.parent.postMessage({
        type: "northstar:work-intake:record-response",
        requestId: event.data.requestId,
        record: {
          ...(state.proposalId ? { proposalId: state.proposalId } : {}),
          artifact: {
            form: state.form,
            answers,
            demand: { requester: state.requester, requestingTeam: state.requestingTeam, title: state.title },
            route: result.disposition,
            state: structuredClone(state),
          },
          ...(reviewableArtifact ? { reviewableArtifact } : {}),
          missingEvidence,
          changeReason: state.proposalId ? "Saved intake changes" : "Initial demand capture",
        },
      }, event.origin);
    } catch (error) {
      window.parent.postMessage({
        type: "northstar:work-intake:record-response",
        requestId: event.data.requestId,
        error: error instanceof Error ? error.message : String(error),
      }, event.origin);
    }
    return;
  }
  if (event.data?.type !== "northstar:work-intake:artifact-request") return;

  try {
    if (event.data.advanceSavedRevision && Number(state.durablySavedRevision) === Number(state.proposalRevision)) domainModel.beginNewRevision(state);
    state.formAnswers = formDefinitions.collectAnswers(formDefinition, { ...state, ...state.guided });
    const missing = formDefinitions.validateAnswers(formDefinition, state.formAnswers);
    if (missing.length) {
      throw new Error(`Required proposal evidence is missing: ${missing.map((entry) => `${entry.label} (${entry.id})`).join(", ")}`);
    }
    state.compiledAnswers = formDefinitions.compileAnswers(formDefinition, state.formAnswers);
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

async function initialize() {
  const response = await fetch("forms/definitions/technical-work-proposal.v1.json");
  if (!response.ok) {
    throw new Error(`Could not load the Work Proposal form definition (${response.status}).`);
  }
  const definition = await response.json();
  formDefinitions.validateFormDefinition(definition);
  formDefinition = formDefinitions.selectFormDefinition([definition], {
    intakeContext: "technical-work",
  });
  if (!formDefinition) {
    throw new Error("No Work Proposal form applies to technical work.");
  }
  state.form = { id: formDefinition.id, version: formDefinition.version };
  compileAllGuidedSections();
  render();
}

initialize().catch((error) => {
  app.innerHTML = `<main class="wizard-page"><section class="wizard-card"><h1>Work Intake could not start</h1><p>${h(error instanceof Error ? error.message : String(error))}</p></section></main>`;
});
