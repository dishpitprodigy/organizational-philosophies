// THROWAWAY PROTOTYPE DOMAIN MODEL.
// Pure intake, framing, routing, and work-item logic shared by the browser UI
// and the terminal logic driver. No I/O belongs in this file.

(function exposeModel(root) {
  const PUBLICATION_ARTIFACT_SCHEMA_VERSION = 2;
  const SIZE_ORDER = ["XS", "S", "M", "L", "XL"];

  const COMPANY = {
    name: "Northstar Research Network",
    mission: "Operate shared research-computing and secure data-transfer services for universities and medical-research institutions.",
    groups: [
      {
        name: "Infrastructure & Reliability",
        teams: ["neteng", "syseng", "dcops", "platform", "sre"],
      },
      {
        name: "Product & Data",
        teams: ["appeng", "dataeng"],
      },
      {
        name: "Identity & Governance",
        teams: ["identity", "security", "architecture", "portfolio", "finance", "privacy"],
      },
    ],
    teams: {
      neteng: {
        shortName: "NetEng",
        name: "Network Engineering",
        owns: "backbone, data-center fabric, DNS, load balancing, and internet edge",
        capacityOwner: "Network Engineering Manager",
        technicalReviewer: "Principal Network Engineer",
      },
      syseng: {
        shortName: "SysEng",
        name: "Systems Engineering",
        owns: "Linux lifecycle, base images, virtualization, bare metal, and configuration management",
        capacityOwner: "Systems Engineering Manager",
        technicalReviewer: "Principal Systems Engineer",
      },
      dcops: {
        shortName: "DC",
        name: "Data Center Operations",
        owns: "racks, power, cabling, hardware installation, and remote hands",
        capacityOwner: "Data Center Operations Manager",
        technicalReviewer: "Data Center Technical Lead",
      },
      platform: {
        shortName: "Platform",
        name: "Platform Engineering",
        owns: "Kubernetes, deployment workflows, secrets delivery, and the internal developer platform",
        capacityOwner: "Platform Engineering Manager",
        technicalReviewer: "Principal Platform Engineer",
      },
      sre: {
        shortName: "SRE",
        name: "Site Reliability Engineering",
        owns: "production reliability, observability, SLOs, and incident learning",
        capacityOwner: "Reliability Engineering Director",
        technicalReviewer: "Principal SRE",
      },
      appeng: {
        shortName: "Apps",
        name: "Application Engineering",
        owns: "the researcher portal, public APIs, and workflow applications",
        capacityOwner: "Application Engineering Director",
        technicalReviewer: "Principal Application Engineer",
      },
      dataeng: {
        shortName: "Data",
        name: "Data Platform Engineering",
        owns: "research-data storage, databases, transfer services, and retention controls",
        capacityOwner: "Data Platform Director",
        technicalReviewer: "Principal Data Engineer",
      },
      identity: {
        shortName: "Identity",
        name: "Identity Engineering",
        owns: "workforce identity, workload identity, directories, and federation",
        capacityOwner: "Identity Engineering Manager",
        technicalReviewer: "Principal Identity Engineer",
      },
      security: {
        shortName: "Security",
        name: "Information Security",
        owns: "security risk decisions, control requirements, and exception governance",
        capacityOwner: "Chief Information Security Officer",
        technicalReviewer: "Security Review Board",
      },
      architecture: {
        shortName: "Architecture",
        name: "Enterprise Architecture",
        owns: "cross-system boundaries, architecture decisions, and technology standards",
        capacityOwner: "Chief Architect",
        technicalReviewer: "Architecture Review Council",
      },
      portfolio: {
        shortName: "Portfolio",
        name: "Technology Portfolio Office",
        owns: "administrative authority, proposal sequencing, and portfolio priority",
        capacityOwner: "Chief Technology Officer",
        technicalReviewer: "Technology Portfolio Council",
      },
      finance: {
        shortName: "Finance",
        name: "Finance & Procurement",
        owns: "funding decisions, purchasing, contracts, and commercial commitments",
        capacityOwner: "Chief Financial Officer",
        technicalReviewer: "Technology Finance Partner",
      },
      privacy: {
        shortName: "Privacy",
        name: "Privacy & Legal",
        owns: "data-use boundaries, privacy obligations, and legal review",
        capacityOwner: "General Counsel",
        technicalReviewer: "Privacy Counsel",
      },
    },
    systems: {
      researchPortal: {
        name: "Researcher Portal",
        entityRef: "system:default/researcher-portal",
        owner: "appeng",
        purpose: "Customer-facing project, dataset, and compute-workflow interface",
        dependsOn: ["edgeServices", "identityPlatform", "containerPlatform", "researchData", "metricsPlatform"],
      },
      computeScheduler: {
        name: "Compute Scheduler",
        entityRef: "system:default/compute-scheduler",
        owner: "platform",
        purpose: "Schedules research workloads across data-center and cloud compute pools",
        dependsOn: ["linuxFleet", "networkFabric", "identityPlatform", "researchData", "metricsPlatform"],
      },
      dataTransfer: {
        name: "Secure Data Transfer",
        entityRef: "system:default/secure-data-transfer",
        owner: "dataeng",
        purpose: "Moves large research datasets across institutional trust boundaries",
        dependsOn: ["edgeServices", "identityPlatform", "researchData", "metricsPlatform"],
      },
      edgeServices: {
        name: "Edge Services",
        entityRef: "system:default/edge-services",
        owner: "neteng",
        purpose: "Public DNS, DDoS controls, load balancing, and ingress routing",
        dependsOn: ["networkFabric", "identityPlatform", "metricsPlatform"],
      },
      containerPlatform: {
        name: "Container Platform",
        entityRef: "system:default/container-platform",
        owner: "platform",
        purpose: "Shared Kubernetes runtime and application-delivery substrate",
        dependsOn: ["linuxFleet", "networkFabric", "identityPlatform", "metricsPlatform"],
      },
      linuxFleet: {
        name: "Linux Fleet",
        entityRef: "system:default/linux-fleet",
        owner: "syseng",
        purpose: "RHEL images, lifecycle controls, virtualization, and bare-metal compute",
        dependsOn: ["dcFoundation", "networkFabric", "identityPlatform", "metricsPlatform"],
      },
      dcFoundation: {
        name: "Data Center Foundation",
        entityRef: "system:default/data-center-foundation",
        owner: "dcops",
        purpose: "Physical compute, power, cabling, and hardware break/fix",
        dependsOn: ["networkFabric", "metricsPlatform"],
      },
      networkFabric: {
        name: "Network Fabric",
        entityRef: "system:default/network-fabric",
        owner: "neteng",
        purpose: "Data-center and cloud connectivity, routing, and service networks",
        dependsOn: ["dcFoundation", "metricsPlatform"],
      },
      identityPlatform: {
        name: "Identity Platform",
        entityRef: "system:default/identity-platform",
        owner: "identity",
        purpose: "Human, service, and workload authentication and authorization",
        dependsOn: ["networkFabric", "linuxFleet", "metricsPlatform"],
      },
      researchData: {
        name: "Research Data Platform",
        entityRef: "system:default/research-data-platform",
        owner: "dataeng",
        purpose: "Object, file, and database services with governed retention",
        dependsOn: ["linuxFleet", "networkFabric", "identityPlatform", "metricsPlatform"],
      },
      metricsPlatform: {
        name: "Metrics & Alerting Platform",
        entityRef: "system:default/metrics-alerting-platform",
        owner: "sre",
        purpose: "Metrics ingestion, alerting, dashboards, and SLO evidence",
        dependsOn: ["containerPlatform", "networkFabric", "identityPlatform"],
      },
    },
  };

  const blankState = () => ({
    scenario: "Blank",
    proposalId: "",
    proposalRevision: 0,
    requester: "",
    requestingTeam: "",
    catalogPath: "",
    inquiryHours: 1,
    requiresChange: false,
    purchase: false,
    spendUsd: 0,
    title: "",
    problem: { statement: "", benefit: "" },
    feasibility: {
      assessments: [],
    },
    outcome: "",
    currentState: "",
    difference: "",
    requirements: "",
    success: "",
    nonGoals: "",
    sponsor: "",
    sponsorLevel: "",
    sponsorAccepted: false,
    intent: "",
    preconditions: "",
    reusableArtifact: "",
    downstreamEnabled: "",
    knownUnknowns: false,
    uncertaintyQuestion: "",
    discoveryTimebox: "",
    affectedSystems: [],
    dependencyNotes: "",
    operationalOwner: "",
    acceptanceAuthority: "",
    affectedUsers: 0,
    laborDays: 0,
    durationWeeks: 0,
    production: false,
    customerFacing: false,
    sensitiveData: false,
    authenticationPath: false,
    internetExposed: false,
    requiredBy: "",
    consequence: "",
    outcomeShape: "",
    epicOutcomes: "",
    capabilityDecision: null,
  });

  const SCENARIOS = {
    Blank: blankState(),
    "Metrics selection": {
      ...blankState(),
      scenario: "Metrics selection",
      proposalId: "WP-2026-0042",
      proposalRevision: 6,
      requester: "Avery Shah",
      requestingTeam: "sre",
      catalogPath: "change",
      purchase: true,
      spendUsd: 1200000,
      title: "Select the next engineering metrics capability",
      problem: {
        statement: "The current metrics platform cannot remain supported at the forecast workload. Its longest-retention tier reaches its operating limit in seven months, the installed release leaves vendor support on March 31, 2027, recovery has not been proven, and routine operation already consumes 56 SRE hours each month.",
        benefit: "Solving the problem preserves reliable dashboards and alerts as engineering demand grows, prevents an unsupported or capacity-constrained metrics service from hiding production failures, and returns recurring SRE capacity to reliability work instead of emergency expansion and platform maintenance.",
      },
      feasibility: {
        assessments: [{
        id: "FB-OBS-001",
        covers: "SHALL-001, SHALL-002, SHALL-003",
        target: "A candidate sustains 1.74 million samples per second for 60 minutes with 14.2 million active series and the accepted 690,000-series churn event while serving the query and rule corpora.",
        hardLimits: "The six-node POC resource envelope and 10 Gb/s replay path are fixed. Signal propagation, serialization, ingestion acknowledgement, storage work, query execution, and rule evaluation each consume nonzero time and cannot be optimized below zero.",
        evidence: "OBS-REPLAY-017 demonstrates that the retained generator, fixed path, and reconciliation sink sustain 2.2 million production-encoded samples per second. The 1.74-million target is 1.5 times the observed 1.16-million production maximum. Candidate performance under the same cardinality, churn, queries, and rules remains to be established by equivalent POCs.",
        assumptions: "The replay preserves production encoding, label cardinality, the 690,000-series churn event, query concurrency, and rule schedules. Every candidate receives the same six-node envelope, 10 Gb/s path, reset procedure, and prohibition on unreproducible vendor tuning.",
        margin: "The 1.74-million target is 460,000 samples per second, or about 21%, below the replay system's demonstrated 2.2-million generation and reconciliation boundary. No candidate implementation margin is claimed before POC evidence exists.",
        finding: "unproven",
        }, {
        id: "FB-OBS-002",
        covers: "SHALL-004",
        target: "Loss of one ingest, query, or storage instance leaves no critical-rule gap longer than 90 seconds; loss of one availability zone has acknowledged-sample RPO 0 and restores normal service within 30 minutes.",
        hardLimits: "Failure detection, quorum decisions, route convergence, retained-sample replay, and storage recovery consume irreducible time. A candidate cannot restore service before the platform detects and isolates the failed path.",
        evidence: "OBS-FAILURE-HARNESS-006 injects the required instance and zone failures and timestamps detection, isolation, replay, query recovery, and rule evaluation. The harness detects and redirects the fixed POC path in 18 seconds; candidate recovery behavior remains unproven until equivalent POCs run.",
        assumptions: "The POC uses the production failure domains, rule intervals, acknowledgement semantics, and network routes. No candidate may exclude detection or replay time from its reported recovery result.",
        margin: "The harness consumes 18 seconds of the 90-second critical-rule budget, leaving 72 seconds for candidate failover and evaluation. The 30-minute zone-recovery margin remains unclaimed until a candidate completes the test.",
        finding: "unproven",
        }, {
        id: "FB-OBS-003",
        covers: "SHALL-005, SHALL-006, SHOULD-001, AC-001",
        target: "Northstar operators complete the required lifecycle exercises from retained documentation and the selected option reduces recurring work from 56 to no more than 24 person-hours per month.",
        hardLimits: "Human execution time, data movement, restart sequences, and mandatory validation cannot be optimized away. The exercise uses an eight-hour operator window, and monthly work includes every upgrade, expansion, tenant, and incident obligation.",
        evidence: "OBS-OPS-BASELINE-009 decomposes the current 56 monthly hours by operation. The POC schedule reserves eight hours per candidate for the same five operator exercises and retains timestamps and interventions; candidate results remain unproven before those exercises run.",
        assumptions: "Operators are unfamiliar with each candidate, documentation is frozen before the exercise, vendor advocates do not drive the work, and recurring-hour estimates use the same event frequencies as the current baseline.",
        margin: "The operating target leaves 32 person-hours per month below the current baseline. No option receives that margin unless the observed exercise times and five-year event model reconcile to 24 hours or less.",
        finding: "unproven",
        }],
      },
      outcome: "Northstar has selected a metrics capability that can ingest 1.74 million samples per second, preserve 31-day, 93-day, and 730-day retention outcomes, evaluate 8,420 alert and recording rules, and serve the accepted query corpus without carrying forward the current platform's unsupported release, seven-month capacity horizon, or 56 person-hours of monthly operating work.",
      currentState: "OBS-ARCH-004 rev 7, accepted May 18, 2026, is the Current-State Baseline. Thirty-eight vmagent collectors receive Prometheus-format metrics from 16 Kubernetes clusters, 1,240 Linux hosts, and 74 application services in two data centers and three cloud regions. Relabeling routes each series to one of three VictoriaMetrics clusters: 31-day retention has 24 TiB usable and 11.6 TiB consumed; 93-day retention has 36 TiB usable and 21.8 TiB consumed; 730-day retention has 42 TiB usable and 31.4 TiB consumed. Four Grafana replicas query the three clusters through separate data sources; four vmalert replicas evaluate 8,420 alert and recording rules.\n\nThe May 1–28 workload baseline recorded 640,000 sustained samples per second, 910,000 p95, and a 1.16-million maximum lasting 22 minutes. Daily active-series cardinality was 11.8 million at p95 and 14.2 million at maximum; series churn was 212,000 new series per hour at p95 and 690,000 at maximum during coordinated deployments. The service executed 38,600 dashboard and API queries per day. Query p95 was 1.8 seconds over six hours, 7.4 seconds over 30 days, and 22.8 seconds over one year. Rule evaluation p95 was 4.8 seconds and p99 was 12.6 seconds; the platform recorded 31 late or missed evaluations per day.\n\nThe current release leaves vendor support on March 31, 2027. At the observed 2.8% monthly growth rate, the 730-day tier reaches the 90% operating limit in seven months. SRE spent 56 person-hours per month on upgrades, storage expansion, tenant changes, and incidents during the last quarter. Direct infrastructure cost averaged $42,800 per month. A vmselect rollout on June 11 created an 11-minute critical-alert evaluation gap; no full retention-tier restore has been exercised.",
      difference: "The selected capability must preserve the current Prometheus remote-write, PromQL, dashboard, and alerting contracts while removing three material gaps: the March 31, 2027 support deadline, the 730-day tier's seven-month capacity horizon, and an operating model that consumes 56 SRE hours each month. Selection must be based on the measured May workload, including the 1.16-million-sample peak, 14.2 million active series, 690,000-series hourly churn event, long-range query corpus, and observed alert failure. A product feature list or vendor sizing estimate does not close this gap.",
      requirements: "WILL-001: Northstar will provide every candidate the same sanitized May 1–28 remote-write replay, 50-query corpus, 8,420-rule corpus, failure scripts, and OBS-ARCH-004 rev 7.\n\nSHALL-001: The candidate shall ingest 1.74 million samples per second for 60 minutes while holding 14.2 million active series and introducing 690,000 new series in one hour; sent, accepted, rejected, queued, and stored counts shall reconcile with no unaccounted loss.\n\nSHALL-002: The candidate shall retain designated series for 31, 93, and 730 days and return equivalent results for the 50-query corpus. Query p95 shall not exceed 2 seconds over six hours, 8 seconds over 30 days, or 25 seconds over one year; query errors and timeouts shall remain below 0.5%.\n\nSHALL-003: The candidate shall evaluate all 8,420 rules at their present intervals. Critical rules shall have no evaluation gap longer than 90 seconds during loss of one ingest, query, or storage instance.\n\nSHALL-004: Loss of one availability zone shall produce no acknowledged-sample loss and shall restore normal ingestion, query, and alert behavior within 30 minutes.\n\nSHALL-005: An SRE unfamiliar with the candidate shall complete an upgrade, add 20% storage capacity, change a retention route, onboard a tenant, and restore or rebuild a failed storage member from retained documentation while the candidate advocate observes but does not drive.\n\nSHALL-006: The proposal shall identify every production component, owner, failure domain, support boundary, backup or rebuild method, upgrade path, end-of-life signal, and five-year lifecycle cost.\n\nSHOULD-001: The selected option should reduce recurring SRE effort from 56 to no more than 24 person-hours per month without assigning new platform work to producing teams.",
      success: "The Selection Decision Record is accepted when every candidate has received the same versioned input package; every SHALL requirement has a retained pass, fail, or explicitly accepted exception; independent evaluator scores and the final narrative identify the same material tradeoffs; lifecycle cost includes infrastructure, licenses, network transfer, support, and operator labor; and the Decision Owner records the selected option, rejected options, material claims, residual uncertainty, and implementation preconditions. The record must also define the later implementation tests and 30-day burn-in. Acceptance authorizes implementation planning only; it does not authorize migration or create an ADR.",
      nonGoals: "This selection will not change application instrumentation libraries, metric names, labels, dashboard ownership, alert thresholds, log aggregation, tracing, product analytics, or the obligation of producing teams to validate their own dashboards and alerts. It will not migrate a producer, retire a storage tier, or approve a target-system architecture beyond the evidence needed to compare candidates.",
      sponsor: "VP, Infrastructure & Reliability",
      sponsorLevel: "Vice President",
      sponsorAccepted: true,
      intent: "Discovery",
      preconditions: "SRE, Platform, Network Engineering, and the five largest producing teams have signed OBS-ARCH-004 rev 7 and the May 1–28 workload export as an accurate baseline. Security has approved the replay's label redaction. Finance has approved a $1.2 million five-year planning envelope for comparison, not purchase. Each candidate has accepted the same POC schedule, input package, measurement definitions, and prohibition on candidate-specific tuning that cannot be reproduced by Northstar operators.",
      reusableArtifact: "SEL-OBS-007: a versioned capability-selection package containing OBS-ARCH-004 rev 7 and delta, the May workload dataset and measurement definitions, REQ-OBS-007, the option and claim register, independent score sheets, complete POC results, the five-year cost model, the Selection Decision Record, and the acceptance plan for a later implementation proposal.",
      downstreamEnabled: "A later Work Proposal can name the selected capability, preserve the 31-day, 93-day, and 730-day obligations, and split implementation into producer onboarding, query and alert validation, historical-data disposition, operational handoff, and Managed Runoff without repeating product selection or reconstructing the May workload. Later architectural design remains responsible for its own decisions and ADRs.",
      knownUnknowns: true,
      uncertaintyQuestion: "Which option passes the 1.74-million-sample ingestion test, the 50-query latency envelope, the 8,420-rule failure tests, and the operator exercises at the lowest defensible five-year cost, and which current obligations or candidate claims remain unproven after that comparison?",
      discoveryTimebox: "30 working days: 5 days to freeze inputs, 5 days for the Implementation Currency Check and response review, 15 days for equivalent POCs, and 5 days for independent scoring and the selection record",
      affectedSystems: ["metricsPlatform", "researchPortal", "computeScheduler", "dataTransfer", "containerPlatform"],
      dependencyNotes: "SRE owns the baseline, replay harness, rule corpus, operator exercises, and future service. Platform provides an isolated six-node Kubernetes POC cluster and records cluster resource use. Network Engineering provides the 10 Gb/s replay path and runs packet-loss and zone-isolation tests. Identity Engineering validates OIDC groups and service identities. Researcher Portal, Compute Scheduler, Secure Data Transfer, Container Platform, and Data Platform owners each validate their ten highest-value queries and critical alerts. Finance validates the five-year cost model and may authorize contracting only after selection. Architecture reviews cross-system consequences but does not create or own the Selection Decision Record.",
      operationalOwner: "sre",
      acceptanceAuthority: "VP, Infrastructure & Reliability",
      affectedUsers: 420,
      laborDays: 110,
      durationWeeks: 8,
      production: false,
      customerFacing: false,
      sensitiveData: false,
      authenticationPath: false,
      internetExposed: false,
      requiredBy: "November 30, 2026, before the FY2027 support renewal and storage-expansion purchase window",
      consequence: "If selection is not accepted by November 30, Procurement must renew the current platform by January 15 and SRE must add capacity to the 730-day tier before it reaches the 90% operating limit. That commits approximately $310,000 to another year of the current architecture and removes the supported window for a planned replacement before March 31, 2027.",
      outcomeShape: "single",
      epicOutcomes: "The metrics capability decision is accepted with enough evidence to frame—but not authorize—the implementation path",
      capabilityDecision: {
        route: "Mixed capability selection: status quo, internal redesign, maintained open source, managed service, or commercial platform",
        invariant: "Resolve Current State → define Desired Outcome and Requirements → compare claims and options → prove → decide → implement later → accept later → reconcile",
        currentState: {
          baseline: "ARCH-OBS-004 rev 7 · Metrics and Alerting Current-State Baseline",
          resolution: "Referenced baseline plus explicit delta; unchanged architecture is not recopied into the proposal.",
          artifacts: [
            "OBS-DIAG-004: C4 context, container, and network diagrams for 38 collectors, three retention clusters, Grafana, and vmalert",
            "OBS-INV-004: owner and version inventory for 16 Kubernetes clusters, 1,240 Linux hosts, and 74 application services",
            "OBS-MEASURE-2026-05: May 1–28 ingestion, cardinality, churn, query, rule-evaluation, storage, and cost export",
            "OBS-QUERY-050 and OBS-RULE-8420: sanitized query and rule corpora used for equivalent POCs",
            "OBS-INC-2026-Q2: incident records, including the June 11 vmselect rollout and the untested full-restore risk",
          ],
          architecture: [
            "Thirty-eight vmagent collectors accept Prometheus-format metrics from 16 Kubernetes clusters, 1,240 Linux hosts, and 74 application services across two data centers and three cloud regions.",
            "Relabeling sends 510,000 sustained samples/second to the 31-day cluster, 112,000 to the 93-day cluster, and 18,000 to the 730-day cluster.",
            "The 31-day cluster has 24 TiB usable / 11.6 TiB consumed; the 93-day cluster has 36 TiB / 21.8 TiB; the 730-day cluster has 42 TiB / 31.4 TiB.",
            "Four Grafana replicas use separate data sources for each retention cluster; four vmalert replicas evaluate 8,420 alert and recording rules.",
            "OIDC groups control human query access; workload identities authorize collectors. Kubernetes, DNS, network paths, and three stateful storage clusters remain part of the service's failure surface.",
          ],
          delta: [
            "The Aurora research-compute cluster added 96 Linux hosts and 58,000 sustained samples/second after rev 7 was accepted.",
            "The 730-day tier was expanded from 36 TiB to 42 TiB usable on July 8 without changing its logical architecture; 31.4 TiB is now consumed.",
            "Researcher Portal and Secure Data Transfer added 14 one-year queries used for grant reporting and capacity decisions.",
            "The June 11 vmselect rollout created an 11-minute critical-alert evaluation gap; OBS-INC-2026-0611 records the failure and rollback.",
          ],
        },
        recordBoundaries: [
          { id: "ARCH-OBS-004 r7", kind: "Current-State Baseline", purpose: "Defines the live architecture and operating profile under review." },
          { id: "ADR-OBS-012", kind: "Historical architecture record", purpose: "Stays with the old system; later design may consult it to understand retention-by-label routing." },
          { id: "ADR-PLAT-021", kind: "Historical architecture record", purpose: "Stays with the platform; later design may consult it to understand the Kubernetes boundary." },
          { id: "ADR-SEC-009", kind: "Historical architecture record", purpose: "Stays with the identity boundary; later design may consult it as design input." },
          { id: "SEL-OBS-NEXT", kind: "Selection Decision Record · pending", purpose: "Selection output: option, rejected alternatives, tradeoffs, claims, and residual uncertainty. Not an ADR." },
          { id: "ACC-OBS-NEXT", kind: "Acceptance record · future", purpose: "Will hold implementation proof; selection does not create it early." },
          { id: "PIR-OBS-NEXT", kind: "Reconciliation · future", purpose: "Will compare live results with the selection claims and Acceptance Conditions." },
        ],
        measurements: [
          { id: "M-01", measure: "Ingestion rate", currentEvidence: "640k sustained; 910k p95; 1.16M maximum for 22 minutes", method: "May 1–28 accepted-sample counters at 5-minute resolution, reconciled against collector sent/retried/rejected counters and split by retention route." },
          { id: "M-02", measure: "Active-series cardinality", currentEvidence: "11.8M daily p95; 14.2M maximum", method: "Daily active-series snapshots by producer and retention path; top 100 label names and values retained only after security redaction." },
          { id: "M-03", measure: "Series churn", currentEvidence: "212k new series/hour p95; 690k maximum during coordinated deployment", method: "Hourly created/retired series joined to deployment records; POC replays the maximum event rather than an average day." },
          { id: "M-04", measure: "Retention demand", currentEvidence: "31d: 11.6/24 TiB; 93d: 21.8/36 TiB; 730d: 31.4/42 TiB; 2.8% monthly growth", method: "Daily storage and ingestion totals, route-level growth, and query-use evidence; each retained series class has a named business or operating owner." },
          { id: "M-05", measure: "Query workload", currentEvidence: "38,600/day; p95 1.8s at 6h, 7.4s at 30d, 22.8s at 1y", method: "OBS-QUERY-050 captures range, step, series touched, concurrency, result hash, p50/p95/p99 latency, timeout, error, and compute/storage cost." },
          { id: "M-06", measure: "Alert evaluation", currentEvidence: "8,420 rules; p95 4.8s; p99 12.6s; 31 late/missed evaluations/day", method: "Rule-evaluation duration, schedule lag, data freshness, errors, and missed intervals by criticality; critical-rule gaps are measured separately." },
          { id: "M-07", measure: "Failure and recovery", currentEvidence: "June 11 rollout caused 11-minute critical-alert gap; no full retention-tier restore exercised", method: "Repeatable loss of ingest, query, storage, Kubernetes node, availability zone, and network path; retain data loss, alert gap, degradation, detection, and recovery evidence." },
          { id: "M-08", measure: "Operator effort", currentEvidence: "56 person-hours/month quarterly mean", method: "18h upgrades, 14h capacity work, 9h tenant/retention changes, and 15h incidents per month from time and incident records." },
          { id: "M-09", measure: "Lifecycle cost", currentEvidence: "$42,800/month direct infrastructure plus 56 SRE hours", method: "Five-year compute, storage, network, license, support, and labor model normalized per million samples/second and retained TiB-month, with 20%, 50%, and 100% growth cases." },
        ],
        requirements: [
          { id: "WILL-01", force: "will", statement: "Northstar will provide OBS-MEASURE-2026-05, OBS-QUERY-050, OBS-RULE-8420, OBS-ARCH-004 rev 7, and the failure-injection scripts to every candidate without candidate-specific additions.", verification: "Input hashes and candidate receipt recorded before POC access opens." },
          { id: "WILL-02", force: "will", statement: "Northstar will preserve 31-day, 93-day, and 730-day retention outcomes unless the Selection Decision Record identifies the affected series owner, replacement evidence, and accepted consequence.", verification: "Route inventory and owner sign-off against M-04." },
          { id: "SHALL-01", force: "shall", statement: "Each candidate shall ingest 1.74M samples/second for 60 minutes while holding 14.2M active series and adding 690k series in one hour, with no unaccounted sample loss.", verification: "Reconcile sent, accepted, rejected, retried, queued, and stored samples; repeat after one ingest instance fails." },
          { id: "SHALL-02", force: "shall", statement: "Each candidate shall execute OBS-QUERY-050 with p95 ≤2s over 6h, ≤8s over 30d, and ≤25s over 1y; errors and timeouts shall remain <0.5%, and result hashes shall match accepted tolerances.", verification: "Three blind query runs at steady load and during storage-member loss." },
          { id: "SHALL-03", force: "shall", statement: "Each candidate shall evaluate all 8,420 rules at current intervals; critical rules shall have no evaluation gap >90s during loss of one ingest, query, or storage instance.", verification: "Failure injection with schedule lag, data freshness, result, and notification timestamps retained." },
          { id: "SHALL-04", force: "shall", statement: "Loss of one availability zone shall cause no acknowledged-sample loss and normal ingestion, query, and alert behavior shall recover within 30 minutes.", verification: "Zone-isolation exercise with RPO and RTO measured from independent clients." },
          { id: "SHALL-05", force: "shall", statement: "An SRE unfamiliar with the candidate shall complete upgrade, 20% capacity expansion, retention-route change, tenant onboarding, and storage-member restore or rebuild from retained documentation.", verification: "Operator owns the keyboard; advocate may answer recorded questions but may not perform the procedure." },
          { id: "SHALL-06", force: "shall", statement: "The response shall identify every component, owner, failure domain, support boundary, rebuild or backup method, upgrade path, end-of-life signal, and five-year lifecycle cost.", verification: "Component register, responsibility map, support evidence, and cost-model reconciliation." },
          { id: "SHOULD-01", force: "should", statement: "The selected option should reduce recurring SRE effort from 56 to ≤24 person-hours/month without transferring work to producing teams.", verification: "Operator-exercise timings and responsibility map compared with M-08." },
          { id: "SHOULD-02", force: "should", statement: "The selected option should provide a documented exit path that does not require simultaneous replacement of collectors, dashboards, and alert rules.", verification: "Reversibility walkthrough and migration-boundary review." },
        ],
        options: [
          { option: "Continue and refresh the current system", category: "Status quo / internal", claim: "Lowest migration risk; known operating model", proofNeeded: "Show that support, scaling, recovery, and operator burden remain acceptable for the decision horizon." },
          { option: "Consolidate on a maintained open-source architecture", category: "Adopt / redesign", claim: "Retires bespoke mechanisms and reduces lifecycle burden", proofNeeded: "Implementation Currency Check plus full POC; a free license is not evidence of operability." },
          { option: "Use a managed metrics service", category: "Buy / service", claim: "Transfers storage lifecycle and availability work", proofNeeded: "Test egress, cost under the real workload, data boundaries, support, failure behavior, throttling, and exit." },
          { option: "Use a commercially supported self-hosted platform", category: "Buy / operate", claim: "Keeps deployment control while transferring product support", proofNeeded: "Test the same workload and operator exercises; contract only claims that affect acceptance." },
        ],
        proofPlan: [
          { gate: "P0 · Input", exercise: "Freeze OBS-ARCH-004 r7, May workload export, OBS-QUERY-050, OBS-RULE-8420, failure scripts, candidate version, configuration, and tuning log.", pass: "Every input has a hash; every candidate receives the same package; deviations are recorded before execution." },
          { gate: "P1 · Connectivity", exercise: "Connect two Kubernetes collectors, 100 Linux hosts, OIDC groups, remote write, Grafana, vmalert, and all three retention outcomes.", pass: "Every interface works; owner, credential, port, protocol, certificate, and failure behavior are recorded." },
          { gate: "P2 · Workload", exercise: "Replay 640k sustained, 910k p95, and 1.74M acceptance load; hold 14.2M active series; inject 690k new series in one hour; run OBS-QUERY-050.", pass: "SHALL-01 and SHALL-02 pass in three reproducible runs with a complete resource and tuning record." },
          { gate: "P3 · Failure", exercise: "Remove one ingest, query, and storage instance; isolate one Kubernetes node and one availability zone; fill collector buffers; exhaust storage headroom.", pass: "Critical alert gap ≤90s, acknowledged-sample RPO 0, zone-loss RTO ≤30m, and every degradation is visible to operators." },
          { gate: "P4 · Operability", exercise: "A non-POC SRE performs upgrade, 20% expansion, retention change, tenant onboarding, storage-member rebuild or restore, and diagnosis of a failed query.", pass: "The operator completes each procedure from retained documentation; time, questions, missing steps, and advocate intervention are recorded." },
          { gate: "P5 · Economics", exercise: "Price the measured workload and 20%, 50%, and 100% growth over five years, including $42.8k/month baseline infrastructure and 56 SRE hours/month.", pass: "Infrastructure, licenses, support, transfer, and labor reconcile to source data; sensitivity and exit cost are visible." },
          { gate: "P6 · Decision", exercise: "Independent scoring, claim reconciliation, narrative judgment, technical and operating-model review, and Decision Owner ruling.", pass: "SEL-OBS-NEXT explains the winner, rejected options, tradeoffs, residual uncertainty, and implementation preconditions." },
        ],
        tailoring: [
          { control: "Neutral review facilitator", disposition: "Retain", rationale: "Several teams advocate for different operating models; the facilitator protects evidence and scoring but does not select the design." },
          { control: "Independent scoring before discussion", disposition: "Retain", rationale: "Material cross-team and lifecycle consequences justify Band Delphi-style scoring." },
          { control: "Formal vendor-participation package", disposition: "Conditional", rationale: "Use only for commercial finalists; internal and open-source advocates answer the same technical response structure without procurement clauses." },
          { control: "Detached formal-contact channel", disposition: "Conditional", rationale: "Required if vendors compete; unnecessary for internal option discovery." },
          { control: "Milestone payment and remedies", disposition: "Conditional", rationale: "Attach only to a selected commercial option, mapped to the same Acceptance Conditions." },
          { control: "POC and operator exercise", disposition: "Retain", rationale: "A shared production metrics system is too consequential to select by paper comparison." },
          { control: "Burn-in", disposition: "Defer to implementation", rationale: "Selection defines its workload, duration, reset rules, and evidence; the later implementation proposal performs it." },
        ],
        futureAcceptance: [
          "Connectivity acceptance: all 38 collector paths, OIDC groups, three retention outcomes, four Grafana replicas, and 8,420 rules are represented in the production validation record.",
          "Performance acceptance: production sustains 1.74M samples/second for 60 minutes, 14.2M active series, the 690k-series churn event, and the OBS-QUERY-050 latency envelope.",
          "Failure acceptance: ingest/query/storage instance loss preserves critical-rule gaps ≤90 seconds; availability-zone loss produces acknowledged-sample RPO 0 and RTO ≤30 minutes.",
          "Operational acceptance: Northstar operators complete upgrade, 20% expansion, retention change, onboarding, rebuild or restore, and incident diagnosis from accepted documentation.",
          "Migration acceptance: each producer and rule cohort runs in parallel for seven days; sample counts, query results, and alerts reconcile before its rollback path is removed.",
          "Burn-in acceptance: 30 consecutive production days meet ingestion, query, rule-evaluation, failure, cost, and operator-effort thresholds before the old storage paths enter Managed Runoff.",
          "Reconciliation: actual reliability, cost, operator burden, and user outcomes are compared with SEL-OBS-NEXT and the accepted claims.",
        ],
      },
    },
    "SSO migration": {
      ...blankState(),
      scenario: "SSO migration",
      proposalId: "WP-2026-0043",
      proposalRevision: 3,
      requester: "Morgan Lee",
      requestingTeam: "identity",
      catalogPath: "change",
      purchase: true,
      spendUsd: 480000,
      title: "Migrate workforce applications to a common SSO service",
      problem: {
        statement: "Northstar's workforce access is split across two identity providers and 23 local or LDAP account paths that cannot enforce one revocation, MFA, recovery, and audit standard. Leaver access remains active for 19 hours at p95 against a four-hour policy, 94 privileged users retain phishable factors, and one provider has no regional failover.",
        benefit: "Solving the problem reduces the time a departed worker can retain application access, protects privileged accounts from phishing, keeps workforce authentication available during a regional failure, and removes duplicated provider contracts without leaving application owners to reconstruct authorization and rollback behavior during an incident.",
      },
      feasibility: {
        assessments: [{
        id: "FB-IDMIG-001",
        covers: "SHALL-001, SHALL-006, SHALL-007, AC-001, AC-004, AC-005",
        target: "Migrate all 147 applications by December 15 while preserving accepted authorization behavior, restoring each previous provider within 30 minutes when rollback is required, completing every burn-in period, and leaving no unidentified consumer before Managed Runoff.",
        hardLimits: "Application maintenance windows, rollback configuration, traffic convergence, the seven-day validation and 30-day burn-in periods, and the final 14 traffic-free days impose irreducible elapsed time. The 12 compatibility exceptions cannot enter a wave until their supported protocol and rollback paths are known.",
        evidence: "ID-WAVE-MODEL-006 fits the 25-, 78-, and 44-application waves, their validation periods, the 12 bounded compatibility assessments, and 14 traffic-free days before the contract-exit date using named application-owner windows. ID-ROLLBACK-014 demonstrates rollback for each application class at 18 minutes p95 and 23 minutes maximum while reconciling roles and traffic.",
        assumptions: "The 147-application inventory and owner windows remain current; the accepted target tenant and two-region configuration do not change; application owners supply the stated test windows; and unresolved compatibility cases leave the migration rather than consuming unplanned wave capacity.",
        margin: "The rollback evidence leaves 7 minutes below the 30-minute limit at the measured maximum. The dated wave model retains 18 working days before December 15 for rejected applications or an explicit renewal decision.",
        finding: "supported",
        }, {
        id: "FB-IDMIG-002",
        covers: "SHALL-002, SHALL-005, AC-002",
        target: "Directory disablement prevents new sessions within 5 minutes, SCIM disables managed accounts within 15 minutes, and all required security events reach the data lake within 5 minutes.",
        hardLimits: "HR event delivery, directory commit and replication, SCIM polling or push delivery, application processing, network transit, and data-lake ingestion each consume part of the end-to-end budget. Existing application sessions cannot be revoked faster than the application checks the governing signal.",
        evidence: "ID-EVENT-BENCH-008 records p99 directory disablement at 42 seconds, SCIM disablement at 6 minutes 20 seconds, approved manual disablement at 2 hours 35 minutes, and security-event arrival at 2 minutes 14 seconds across the accepted target tenant and data-lake path. The same retained data-lake test queries every required event class 410 days after ingestion.",
        assumptions: "Applications use the accepted SCIM connector or the named manual exception; clocks are synchronized; the benchmark includes directory replication and data-lake indexing; and applications with unsupported session behavior leave the migration scope for redesign.",
        margin: "The benchmark leaves 4 minutes 18 seconds of new-session margin, 8 minutes 40 seconds of SCIM margin, 1 hour 25 minutes of manual-path margin, 2 minutes 46 seconds of security-event margin at p99, and 10 days beyond the 400-day retention requirement.",
        finding: "demonstrated",
        }, {
        id: "FB-IDMIG-003",
        covers: "SHALL-003",
        target: "All 612 privileged users enroll and validate a phishing-resistant factor before their application wave is accepted.",
        hardLimits: "Hardware-key issuance, identity proofing, user enrollment, recovery registration, and validation require human participation and cannot be parallelized beyond available support sessions and devices.",
        evidence: "MFA-PILOT-012 enrolled and validated 60 representative privileged users in two four-hour sessions with four support staff; 57 completed in the first session and all 60 completed within the second.",
        assumptions: "Devices are distributed before each wave, the four-person support model remains available, and users who miss both sessions do not enter an accepted migration wave.",
        margin: "The demonstrated rate supports 120 users per day with the same staffing. Six scheduled enrollment days provide capacity for 720 users, leaving 108 places, or about 18%, above the 612-user population.",
        finding: "demonstrated",
        }, {
        id: "FB-IDMIG-004",
        covers: "SHALL-004, AC-003",
        target: "Maintain 99.95% monthly workforce-authentication availability; restore new sessions within 5 minutes and full service within 30 minutes after primary-region loss with configuration RPO 0.",
        hardLimits: "Health detection, route convergence, token validation, configuration reconciliation, and client retry behavior consume nonzero time. Configuration RPO 0 also requires every accepted change to reach the surviving region before acknowledgement.",
        evidence: "PLAT-ID-ACCEPT-004 records primary-region isolation with new sessions restored in 2 minutes 10 seconds, full service restored in 18 minutes, and zero missing accepted configuration records. AVAIL-MODEL-004 applies the measured detection and repair distribution to the retained failure rate and projects 99.982% monthly availability.",
        assumptions: "The accepted two-region topology, synchronous configuration contract, health thresholds, DNS path, and observed authentication load remain unchanged; independent clients measure the entire interruption rather than only provider health.",
        margin: "The exercise leaves 2 minutes 50 seconds of new-session margin and 12 minutes of full-service margin with no configuration loss. The availability model leaves 0.032 percentage points above the 99.95% monthly requirement.",
        finding: "demonstrated",
        }],
      },
      outcome: "All 6,400 employees and contractors authenticate to 147 workforce applications through the approved SSO service; privileged users receive phishing-resistant MFA, leaver access is revoked within the approved interval, authentication survives loss of the primary region, and the two inherited identity-provider contracts can enter Managed Runoff before renewal.",
      currentState: "ID-ARCH-011 rev 4 identifies 147 workforce applications used by 6,400 employees and contractors. Keystone SSO serves 83 SAML applications from an active/passive deployment in two regions. Harbor Login serves 26 SAML and 15 OIDC applications from one region. The remaining 23 applications use local or LDAP accounts; 11 can enable OIDC through a supported configuration change, while 12 require discovery because they depend on LDAP groups, application-local roles, or vendor-specific SAML behavior.\n\nProvisioning is SCIM-based for 61 applications, just-in-time for 48, and manual for 38. The June leaver sample measured 6 hours 40 minutes median and 19 hours p95 from HR termination to application revocation against a four-hour policy; 27 application accounts remained enabled after 24 hours. Six hundred twelve privileged users receive MFA, but 94 still use push or one-time-password factors. Authentication logs reach the security data lake in 3–47 minutes depending on provider and are retained for 90 days in Keystone, 180 days in Harbor, and 400 days in the data lake.\n\nKeystone failover last passed on February 12, 2025. Harbor has no regional failover. Thirty-one applications embed provider-specific group identifiers, and 18 maintain sessions for more than eight hours after account disablement. The two inherited contracts renew January 31, 2027, for a combined $620,000 annual commitment.",
      difference: "The migration must move 147 applications and 6,400 people from two provider contracts and 23 local-account paths to one approved workforce trust boundary without changing application authorization semantics. It must reduce leaver revocation from 19 hours p95 to 15 minutes for SCIM-connected applications and four hours for approved manual exceptions, replace push and one-time-password MFA for 94 privileged users, provide tested regional recovery where Harbor provides none, and remove provider-specific identifiers without stranding 31 applications.",
      requirements: "SHALL-001: All 147 applications shall authenticate through the approved service using SAML 2.0 or OIDC; no production application shall retain a local workforce password after its migration wave is accepted.\n\nSHALL-002: Directory disablement shall prevent new SSO sessions within 5 minutes. SCIM-managed accounts shall be disabled within 15 minutes; each manual exception shall have a named owner, a four-hour maximum, and retained completion evidence.\n\nSHALL-003: All 612 privileged users shall use WebAuthn/FIDO2 or another Security-approved phishing-resistant factor before their application wave is accepted.\n\nSHALL-004: The service shall maintain 99.95% monthly workforce-authentication availability. Loss of the primary region shall interrupt new authentication for no more than 5 minutes and shall require no application reconfiguration; configuration RPO shall be zero and full service RTO shall be 30 minutes.\n\nSHALL-005: Authentication, MFA, provisioning, deprovisioning, administrative, and policy-change events shall arrive in the security data lake within 5 minutes and remain queryable for 400 days.\n\nSHALL-006: Every application shall have a tested rollback that restores its previous provider within 30 minutes until seven days of parallel validation have completed.\n\nSHALL-007: The migration shall preserve each application's accepted roles and group-to-role mapping; provider-specific group identifiers shall be replaced by governed groups before cutover.",
      success: "The Initiative is accepted when all 147 application owners have signed an application test record; 6,400 active identities reconcile between HR, directory, SSO, and application inventories; 20 sampled leavers meet the 5-minute, 15-minute, or approved four-hour revocation requirement; all 612 privileged users pass phishing-resistant MFA validation; primary-region isolation meets the 5-minute interruption and 30-minute RTO limits; security events arrive within 5 minutes and remain searchable; each wave completes seven days of parallel validation and 30 production days without a Severity 1 or 2 authentication defect; and Keystone and Harbor record zero production authentication traffic for 14 days before entering Managed Runoff.",
      nonGoals: "This Initiative will not redesign application roles, entitlements, or approval workflows; replace workload, research, or customer identity; merge the corporate and research directories; change HR's joiner/mover/leaver source records; or migrate applications not listed in ID-APP-147 rev 6. The 12 compatibility exceptions may produce separate redesign proposals; they do not silently expand this migration.",
      sponsor: "VP, Corporate Technology",
      sponsorLevel: "Vice President",
      sponsorAccepted: true,
      intent: "Migration",
      preconditions: "SEL-ID-003 has selected and funded the workforce SSO service. Security has accepted TRUST-WF-002 and the phishing-resistant MFA standard. ID-APP-147 rev 6 contains a named business owner, technical owner, protocol, role mapping, provisioning method, session behavior, maintenance window, and rollback contact for every application. The target tenant, two-region configuration, SCIM connector, security-data-lake feed, and break-glass access have passed platform acceptance before the first application wave begins.",
      reusableArtifact: "ID-MIG-006: the reconciled 147-application inventory; protocol and role-mapping evidence; wave assignments; per-application test and rollback records; leaver and MFA results; regional-recovery evidence; security-event evidence; exception decisions; and the Managed Runoff consumer register for Keystone and Harbor.",
      downstreamEnabled: "Application teams can execute three authorized migration waves—25 low-risk applications, 78 standard applications, and 44 critical or compatibility-sensitive applications—without reopening the selected provider, workforce trust boundary, MFA standard, leaver timing, log retention, or rollback contract. Any application that cannot satisfy those decisions returns as a separate redesign proposal.",
      knownUnknowns: true,
      uncertaintyQuestion: "For the 12 unresolved applications—7 using LDAP group bind, 3 with application-local privileged roles, and 2 using vendor-specific SAML extensions—can a supported SAML 2.0 or OIDC configuration preserve accepted authorization and rollback behavior, or does the application require a separate redesign or retirement decision?",
      discoveryTimebox: "15 working days: 2 days to reproduce each current flow, 8 days for vendor-supported protocol tests, 3 days for authorization and rollback validation, and 2 days to record migrate/redesign/retire decisions",
      affectedSystems: ["identityPlatform", "researchPortal", "dataTransfer", "metricsPlatform"],
      dependencyNotes: "Identity Engineering owns the target tenant, federation metadata, SCIM service, recovery test, and migration orchestration. Each of the 147 application owners owns protocol configuration, role-map validation, business testing, maintenance-window approval, and rollback. HR owns the termination event; Directory Services owns disablement within 5 minutes; Security owns MFA exceptions and validates the 5-minute event feed; Network Engineering owns regional DNS and egress paths; SRE monitors authentication and provisioning objectives; Finance owns the $480,000 implementation authorization and the January 31 contract decisions.",
      operationalOwner: "identity",
      acceptanceAuthority: "VP, Corporate Technology",
      affectedUsers: 6400,
      laborDays: 900,
      durationWeeks: 64,
      production: true,
      customerFacing: false,
      sensitiveData: true,
      authenticationPath: true,
      internetExposed: true,
      requiredBy: "December 15, 2026, leaving 30 days to resolve rejection or renewal before the January 31, 2027 contract date",
      consequence: "If both inherited providers have not completed 14 traffic-free days by December 15, Northstar must renew at least one contract by January 15 to avoid an unsupported authentication path. The minimum renewal is $310,000; renewing both preserves the current $620,000 annual duplication and delays removal of the 23 local-account paths for another planning cycle.",
      outcomeShape: "multiple",
      epicOutcomes: "The target tenant authenticates test users in both regions, exports required security events within 5 minutes, and passes primary-region isolation with no more than 5 minutes of new-session interruption\nTwenty-five low-risk applications complete seven days of parallel validation and operate for 30 days with accepted role mappings, leaver behavior, and rollback evidence\nSeventy-eight standard applications complete the same acceptance path with no local workforce passwords remaining\nForty-four critical or compatibility-sensitive applications complete migration, or each unresolved application has an accepted redesign or retirement proposal\nKeystone and Harbor record zero production authentication traffic for 14 days and enter Managed Runoff with no unidentified application, identity, or support consumer",
      guided: {
        version: 1, enforce: true, dirty: {},
        currentState: {
          baselineMode: "reference",
          baselineReference: "ID-ARCH-011 rev 4",
          delta: "The June leaver sample found 27 accounts still enabled after 24 hours, 94 privileged users still use push or one-time-password factors, and the current contract renewal evidence fixes January 31, 2027 as the decision boundary. No later accepted architecture revision changes the 147-application inventory.",
          architecture: "Keystone SSO serves 83 SAML applications from two regions; Harbor Login serves 26 SAML and 15 OIDC applications from one region; 23 applications retain local or LDAP accounts. Provisioning is SCIM-based for 61 applications, just-in-time for 48, and manual for 38.",
          measurements: "ID-APP-147 rev 6 records 147 applications and 6,400 employees and contractors. The June leaver sample measured 6 hours 40 minutes median and 19 hours p95 from HR termination to revocation. Authentication-log arrival ranges from 3 to 47 minutes.",
          constraints: "Harbor has no regional failover; Keystone failover was last proven February 12, 2025. Thirty-one applications embed provider-specific groups, 18 retain sessions over eight hours after disablement, and the inherited contracts renew January 31, 2027 for $620,000 annually.",
        },
        outcome: {
          scope: "All 6,400 employees and contractors and all 147 workforce applications in ID-APP-147 rev 6.",
          capability: "Every workforce application authenticates through the approved SSO service while preserving accepted authorization semantics; privileged access uses phishing-resistant MFA, leaver access is revoked within policy, and authentication survives loss of the primary region.",
          proof: "All application test records reconcile; sampled leavers meet the 5-minute, 15-minute, or approved four-hour limits; all 612 privileged users pass phishing-resistant MFA validation; and regional isolation meets the 5-minute interruption and 30-minute recovery limits.",
          horizon: "Through each wave's seven-day parallel validation and 30-day production burn-in, followed by 14 traffic-free days before each inherited provider enters Managed Runoff.",
        },
        difference: {
          preserve: "Each application's accepted roles and group-to-role mappings, workforce source-of-truth records, supported SAML or OIDC behavior, security-event retention, and a tested rollback until burn-in completes.",
          change: "Replace two provider contracts and 23 local-account paths with one approved workforce trust boundary; reduce SCIM leaver revocation from 19 hours p95 to 15 minutes; replace weak MFA for 94 privileged users; and add tested regional recovery.",
          evidence: "ID-ARCH-011 rev 4, ID-APP-147 rev 6, the June leaver sample, protocol and role-map tests, MFA results, regional-isolation records, security-event measurements, rollback exercises, and traffic reconciliation.",
        },
        requirements: [
          { id: "001", force: "shall", condition: "All 147 applications shall authenticate through the approved service using SAML 2.0 or OIDC; no accepted production application shall retain a local workforce password.", verification: "Reconcile ID-APP-147 rev 6 against target-provider configuration, application-owner test records, and local-account scans after each wave." },
          { id: "002", force: "shall", condition: "Directory disablement shall prevent new SSO sessions within 5 minutes; SCIM accounts shall disable within 15 minutes and approved manual exceptions within four hours.", verification: "Run 20 timestamped leaver tests across provisioning classes and retain HR, directory, provider, and application event correlation." },
          { id: "003", force: "shall", condition: "All 612 privileged users shall use a Security-approved phishing-resistant factor before their application wave is accepted.", verification: "Reconcile the privileged-user inventory to enrolled factors and complete representative authentication and recovery tests." },
          { id: "004", force: "shall", condition: "The service shall maintain 99.95% monthly availability; primary-region loss shall interrupt new authentication for no more than 5 minutes with configuration RPO 0 and full-service RTO of 30 minutes.", verification: "Isolate the primary region under observed load and retain independent-client timestamps, configuration reconciliation, and recovery evidence." },
          { id: "005", force: "shall", condition: "Authentication, MFA, provisioning, deprovisioning, administrative, and policy-change events shall reach the security data lake within 5 minutes and remain queryable for 400 days.", verification: "Generate each event class, reconcile source and data-lake timestamps, and verify retained historical partitions and query results." },
          { id: "006", force: "shall", condition: "Every application shall have a rollback that restores its previous provider within 30 minutes until seven days of parallel validation complete.", verification: "Execute and time rollback for each application class; retain configuration, traffic, authentication, and owner acceptance records." },
          { id: "007", force: "shall", condition: "Migration shall preserve accepted roles and group-to-role mappings; provider-specific group identifiers shall be replaced by governed groups before cutover.", verification: "Compare pre- and post-migration authorization matrices and execute business-owner role tests before accepting each application." },
        ],
        acceptance: [
          { context: "when an application wave completes parallel validation", evidence: "every application has a signed test and rollback record and no production application in the wave retains a local workforce password", verification: "wave reconciliation against ID-APP-147 rev 6 and application-owner acceptance records" },
          { context: "during sampled joiner, mover, and leaver events", evidence: "identity and account state satisfies the applicable 5-minute, 15-minute, or approved four-hour obligation", verification: "correlated HR, directory, SSO, SCIM, and application event record" },
          { context: "during primary-region isolation", evidence: "new-session interruption is no more than 5 minutes, configuration RPO is zero, and full service returns within 30 minutes", verification: "regional-recovery test record with independent timestamps and reconciled configuration" },
          { context: "after each migration wave", evidence: "the wave operates for 30 days without a Severity 1 or 2 authentication defect", verification: "incident register, SLO report, security-event reconciliation, and Decision Owner sign-off" },
          { context: "before inherited providers enter Managed Runoff", evidence: "Keystone and Harbor each record zero production authentication traffic for 14 consecutive days with no unidentified consumer", verification: "provider, network, and application traffic records reconciled to the consumer register" },
        ],
        nonGoals: [
          { exclusion: "Redesigning application roles, entitlements, or approval workflows.", reason: "The migration must preserve accepted authorization semantics; redesign requires a separately bounded decision." },
          { exclusion: "Replacing workload, research, or customer identity or merging the corporate and research directories.", reason: "Those identity populations and authority boundaries are outside the workforce-application migration outcome." },
          { exclusion: "Silently expanding migration to applications outside ID-APP-147 rev 6.", reason: "The accepted inventory defines this Initiative; compatibility failures return as redesign or retirement proposals." },
        ],
        dependencies: [
          { dependency: "Selected and funded workforce SSO capability", owner: "VP, Corporate Technology and Finance", contribution: "Keep SEL-ID-003 and the $480,000 implementation authorization effective through the migration window.", evidence: "Accepted SEL-ID-003 decision and Finance authorization; no additional capacity acceptance is implied." },
          { dependency: "Application protocol, role-map, and rollback participation", owner: "The named owner of each application in ID-APP-147 rev 6", contribution: "Configure, test, accept the maintenance window, validate roles, and execute rollback when required.", evidence: "Named ownership and protocol data in ID-APP-147 rev 6 plus per-application test records." },
          { dependency: "Termination and directory-disablement events", owner: "HR and Directory Services", contribution: "Supply authoritative termination timestamps and complete directory disablement within 5 minutes.", evidence: "HR event ledger and directory audit events used by the accepted leaver test." },
          { dependency: "Regional DNS, security-event, and monitoring paths", owner: "Network Engineering, Security, and SRE", contribution: "Support isolation testing, validate event delivery, and observe authentication and provisioning objectives.", evidence: "Accepted recovery-test plan, security data-lake feed record, and SLO dashboards." },
        ],
        preconditions: [
          { condition: "SEL-ID-003 has selected and funded the workforce SSO service.", evidenceOwner: "VP, Corporate Technology owns the accepted selection record; Finance owns the implementation authorization." },
          { condition: "TRUST-WF-002 and the phishing-resistant MFA standard are accepted.", evidenceOwner: "Security owns the approved trust-boundary and MFA-standard records." },
          { condition: "ID-APP-147 rev 6 has a complete owner, protocol, role-map, provisioning, session, window, and rollback record for every application.", evidenceOwner: "Identity Engineering owns the inventory; each application owner signs its row." },
          { condition: "The target tenant, two-region configuration, SCIM connector, event feed, and break-glass access have passed platform acceptance.", evidenceOwner: "Identity Engineering and Security own the retained platform-acceptance record." },
        ],
        artifact: { identifier: "ID-MIG-006", contents: "The reconciled 147-application inventory; protocol, role-map, wave, test, rollback, leaver, MFA, recovery, event-feed, exception, and Managed Runoff evidence.", completionProof: "All 147 application records reconcile; every SHALL and Acceptance Condition has retained proof or an explicitly accepted exception; and the Decision Owner accepts each wave and the final Managed Runoff consumer register." },
        downstream: { work: "Application teams can frame and execute three candidate migration Epics after the required proposal and capacity decisions; unresolved compatibility cases can be framed as separate redesign or retirement proposals.", fixedDecisions: "The selected provider, workforce trust boundary, phishing-resistant MFA standard, leaver timing, 400-day event retention, rollback contract, ID-APP-147 rev 6 boundary, and accepted application authorization semantics." },
        timing: {
          event: "Both inherited providers must complete 14 traffic-free days by December 15, 2026, before the January 2027 renewal decision.",
          evidence: "The Keystone and Harbor contracts renew January 31, 2027; Procurement requires a renewal decision by January 15 and the migration plan reserves 30 days to resolve rejection.",
          missedDecision: "Northstar loses the safe contract-exit window and cannot place both inherited providers into Managed Runoff before renewal.",
          avoidableCommitment: "At least $310,000 for one provider renewal; $620,000 if both are renewed, plus another cycle of local-account exposure.",
          fallback: "Procurement renews at least one inherited provider by January 15 and Identity Engineering retains the corresponding authentication paths until a new proposal is accepted.",
        },
        discovery: {
          question: "Can each of the 12 compatibility exceptions preserve accepted authorization and rollback behavior through a supported SAML 2.0 or OIDC configuration, or must it be redesigned or retired?",
          endDecision: "Record migrate, redesign, or retire for every compatibility exception; unresolved cases do not enter a migration wave and require a new bounded decision.",
          phases: [
            { phase: "2 working days — reproduce current flows", exit: "Each exception has a retained protocol, group, role, session, and rollback baseline." },
            { phase: "8 working days — supported protocol tests", exit: "Vendor-supported SAML or OIDC behavior is demonstrated or rejected with retained evidence." },
            { phase: "3 working days — authorization and rollback validation", exit: "Business owners reconcile roles and a 30-minute rollback is proven or rejected." },
            { phase: "2 working days — disposition", exit: "Every exception has an accepted migrate, redesign, or retire decision." },
          ],
        },
        epicOutcomes: [
          { capability: "The target tenant authenticates test users in both regions, exports required security events, and survives primary-region isolation.", measure: "Event arrival is within 5 minutes; new-session interruption is no more than 5 minutes; configuration RPO is zero and full-service RTO is no more than 30 minutes.", horizon: "Through platform acceptance and every migration wave's 30-day burn-in." },
          { capability: "Twenty-five low-risk applications migrate with accepted roles, leaver behavior, and rollback evidence.", measure: "All 25 owner records reconcile, parallel validation lasts 7 days, and no Severity 1 or 2 authentication defect occurs during 30 production days.", horizon: "Seven-day parallel validation plus 30-day production burn-in." },
          { capability: "Seventy-eight standard applications migrate with no local workforce passwords remaining.", measure: "All 78 owner records reconcile and local-account scans find zero production workforce passwords after acceptance.", horizon: "Seven-day parallel validation plus 30-day production burn-in." },
          { capability: "Forty-four critical or compatibility-sensitive applications migrate or receive an accepted redesign or retirement disposition.", measure: "Every application has a signed migration acceptance or a separately identified redesign or retirement proposal; none remains unclassified.", horizon: "Before the December 15 contract-exit boundary." },
          { capability: "Keystone and Harbor enter Managed Runoff without an unidentified consumer.", measure: "Both providers record zero production authentication traffic for 14 consecutive days and the consumer register reconciles to all 147 applications.", horizon: "Fourteen traffic-free days completed by December 15, 2026." },
        ],
      },
    },
    "Identity platform redesign": {
      ...blankState(),
      scenario: "Identity platform redesign",
      proposalId: "WP-2026-0044",
      proposalRevision: 3,
      requester: "Riley Gomez",
      requestingTeam: "architecture",
      catalogPath: "change",
      purchase: true,
      spendUsd: 1800000,
      title: "Establish the next enterprise identity platform",
      problem: {
        statement: "Northstar's four identity domains encode incompatible ownership, lifecycle, delegation, credential, and recovery rules, and the existing platforms cannot decide those organizational policies. As a result, 1,740 non-human identities have no accountable owner, 812 credentials are more than a year old, 37 certificate renewals have no owner, and administrators can change 21 privileged groups outside the owning team's approval path.",
        benefit: "Solving the problem gives security, application owners, and operators one accountable basis for creating, changing, recovering, and retiring identities and trusts. It reduces unauthorized or unrecoverable access paths and prevents a future product's defaults from silently becoming organizational policy for 21,300 identities and the systems that depend on them.",
      },
      feasibility: {
        assessments: [{
        id: "FB-IDBASIS-001",
        covers: "SHALL-001, SHALL-002, SHALL-004, SHALL-005, SHALL-006, AC-001, AC-002, AC-004",
        target: "Reconcile 21,300 identities, 286 trusts, and 63 issuance paths; compare three product-neutral boundary models; and produce an accepted design basis within the 20-working-day, 160-person-day Discovery envelope.",
        hardLimits: "The synchronized export window, source-system read rates, owner review time, and sequential acceptance of taxonomy and authority decisions cannot be removed by tooling. Model comparison cannot begin until the same reconciled population and control objectives are available to all three models.",
        evidence: "ID-RECON-PILOT-002 reconciled all eight source exports and classified a 2,130-record stratified sample in three working days. The retained work decomposition assigns the full population, owner validation, taxonomy decisions, three-model comparison, and final review to named contributors within 160 person-days.",
        assumptions: "All eight sources deliver parseable exports from the same 24-hour period; stable identifiers remain available; the named owners attend scheduled decision sessions; and unresolved records receive explicit dispositions rather than silently expanding the Discovery window.",
        margin: "The work decomposition reserves 16 person-days and the final 2 working days for reconciliation defects, disputed ownership, and acceptance review. If source delivery or owner attendance consumes that reserve, the proposal must revise its date or scope.",
        finding: "supported",
        }, {
        id: "FB-IDBASIS-002",
        covers: "SHALL-003, AC-003",
        target: "Establish physically achievable recovery targets for workforce and privileged-administration flows, including the proposed 15-minute and 30-minute limits, before later architecture treats them as requirements.",
        hardLimits: "Failure detection, authority restoration, configuration recovery, directory convergence, credential validation, network propagation, and client retry behavior create a nonzero recovery floor. A design cannot remove those steps by declaring a lower RTO.",
        evidence: "ID-RECOVERY-FLOOR-003 decomposes the current Corporate AD exercise and the target flow into detection, authority, configuration, replication, network, and client stages. The evidence is sufficient to run equivalent model tests but does not yet establish that all three boundary models meet 15 and 30 minutes.",
        assumptions: "Each model uses the same regional-loss scenario, identity population, configuration-RPO obligation, network paths, client retry behavior, and definition of restored service.",
        margin: "No recovery margin is claimed. The Discovery must measure each stage and either support the 15- and 30-minute targets with explicit margin or revise them before a later architecture proposal becomes reviewable.",
        finding: "unproven",
        }],
      },
      outcome: "Northstar has an accepted, product-neutral identity design basis for 12,000 human identities, 9,300 service and workload identities, 286 application trusts, and 63 certificate-issuance paths. The design basis defines identity classes, authoritative sources, lifecycle events, trust boundaries, delegated authorities, recovery obligations, and ownership precisely enough that a later platform design cannot inherit policy from whichever product is demonstrated first.",
      currentState: "ID-ARCH-001 rev 3 identifies four overlapping identity domains. Corporate Active Directory contains 8,600 workforce identities on eight domain controllers in two regions. Research Active Directory contains 3,400 researcher and administrator identities on four domain controllers in one data center. Six FreeIPA replicas provide Linux identity, host enrollment, sudo policy, and 2,700 service principals for 1,240 Linux hosts. Four cloud IAM tenants contain 6,600 workload identities, roles, and service accounts. Together, the platforms serve 286 SAML, OIDC, LDAP, Kerberos, and certificate-based trusts and 63 certificate-issuance paths.\n\nThe inventories do not agree. The July reconciliation found 1,740 service or workload identities without an accountable owner, 812 credentials older than 365 days, 430 human-name collisions between the corporate and research directories, and 37 application trusts whose signing-certificate renewal owner is unknown. Twenty-one privileged groups can be changed by administrators outside the owning team's approval path. Corporate AD recovery was exercised in March 2026; Research AD has no full-forest recovery evidence, FreeIPA has no tested loss-of-region procedure, and the four cloud tenants use different break-glass, rotation, and audit-retention rules.\n\nThe current platforms encode policy differently: HR is authoritative for employees, the research registry for visiting researchers, application teams act as the de facto source for 1,090 service identities, Platform Engineering creates and removes Kubernetes workloads, and 1,740 non-human identities still have no recorded authority. A product cannot reconcile those policy decisions for the organization.",
      difference: "The organization must replace an implementation-defined identity model with an explicit organizational model. Every one of the 21,300 known identities, 286 trusts, and 63 issuance paths needs a class, authoritative source, lifecycle owner, credential rule, recovery obligation, and decommission condition. The design basis must resolve 1,740 ownerless identities, 812 credentials older than 365 days, 430 namespace collisions, 37 ownerless certificate renewals, and 21 delegated-administration exceptions before a platform design or vendor response can be judged against anything more reliable than preference.",
      requirements: "WILL-001: HR, the research registry, Identity Engineering, Platform Engineering, and each cloud tenant will supply dated source exports with stable identifiers and named data owners.\n\nSHALL-001: The design basis shall classify every inventoried identity as workforce, researcher, privileged administrator, application service, machine, workload, integration, emergency, or explicitly accepted exception; each class shall define its authoritative source, creation event, review interval, credential type, rotation interval, suspension event, deletion event, and evidence owner.\n\nSHALL-002: Every one of the 286 trusts and 63 certificate-issuance paths shall identify the relying system, owning team, protocol, issuer, subject population, privilege conveyed, renewal mechanism, failure consequence, recovery requirement, and retirement condition.\n\nSHALL-003: Workforce authentication and privileged-administration flows shall have configuration RPO 0; accepted design targets shall restore workforce authentication within 15 minutes and privileged administration within 30 minutes after loss of one region. Research, service, and workload flows shall receive separately justified targets.\n\nSHALL-004: No standing privileged group shall be modifiable outside a named approval boundary. Delegated administration shall state who may act, on which identity classes, with which evidence, and how access is revoked.\n\nSHALL-005: Every service and workload identity shall have an accountable owner and automated credential rotation of 90 days or less, or a time-bounded exception with a compensating control and expiration date.\n\nSHALL-006: The design basis shall compare at least three boundary models against the same identity inventory, failure scenarios, staffing model, migration constraints, and five-year cost assumptions without selecting a product during Discovery.",
      success: "Discovery is accepted when the authoritative-source and platform exports reconcile to 12,000 human and 9,300 non-human identities; every identity, trust, and issuance path has a class and accountable owner or an explicitly accepted disposition; all 1,740 ownerless identities, 812 stale credentials, 430 namespace collisions, 37 renewal gaps, and 21 delegation exceptions have recorded decisions; Security and each operating owner accept the trust-boundary and recovery requirement matrix; three product-neutral boundary models have been compared using the same evidence; and the final design basis identifies requirements, non-goals, unresolved risks, implementation preconditions, and the questions later architecture must decide. It does not select a platform, authorize migration, or create an ADR.",
      nonGoals: "This Discovery will not select an identity product or vendor; design application roles or customer entitlements; rewrite HR or research-registry business processes; migrate an identity, trust, certificate, or directory; consolidate DNS; change application authorization; or treat the current directory schema as the required future taxonomy. Those decisions require later design or separate Work Proposals after the organizational identity model is accepted.",
      sponsor: "Chief Technology Officer",
      sponsorLevel: "Executive",
      sponsorAccepted: true,
      intent: "Discovery",
      preconditions: "HR and the research registry provide July 31, 2026 snapshots with immutable person identifiers. Corporate AD, Research AD, FreeIPA, and all four cloud tenants provide identity, group, credential-age, trust, and audit-configuration exports from the same 24-hour period. Application and platform owners validate the 286-trust and 63-issuance-path inventory. Security supplies control objectives without prescribing a product. Portfolio authority reserves 160 person-days across Identity, Security, Platform, Systems, application owners, and Architecture for the 20-day Discovery window.",
      reusableArtifact: "ID-BASIS-005: reconciled human and non-human identity inventories; identity-class and lifecycle taxonomy; 286-trust and 63-issuance-path register; authority and delegation matrix; namespace-collision decisions; credential and exception register; recovery-requirement matrix; three product-neutral boundary models; five-year operating assumptions; and the accepted design brief for later architecture.",
      downstreamEnabled: "A later architecture proposal can compare designs against fixed identity classes, authoritative sources, recovery targets, delegated authorities, credential rules, ownership, and migration constraints. Vendors cannot redefine workforce, researcher, workload, or emergency identity through product terminology; implementation teams do not need to rediscover who owns the 286 trusts or which of the 63 certificate paths must survive.",
      knownUnknowns: true,
      uncertaintyQuestion: "Which of the 1,740 ownerless non-human identities and 37 ownerless certificate renewals still serve a live consumer; which of the 430 namespace collisions represent the same person; and which boundary model can satisfy the accepted 15-minute workforce and 30-minute privileged recovery targets without preserving four incompatible lifecycle and delegation models?",
      discoveryTimebox: "20 working days: 4 days for synchronized export and reconciliation, 6 days for owner and consumer validation, 4 days for taxonomy and authority decisions, 4 days to compare three boundary models, and 2 days for evidence review and acceptance",
      affectedSystems: ["identityPlatform", "researchPortal", "computeScheduler", "dataTransfer", "containerPlatform", "linuxFleet", "researchData"],
      dependencyNotes: "HR owns employee identity facts; the Research Office owns visiting-researcher facts; Identity Engineering owns directory inventories, identity classes, trust discovery, and recovery evidence; Platform owns Kubernetes workloads and four cloud-tenant exports; Systems owns FreeIPA clients and service principals; each of 74 application services validates its relying-party trusts and outage consequence; Security accepts control objectives, delegated authority, credential exceptions, and break-glass rules; Architecture facilitates comparison of the three boundary models but records no ADR during intake or Discovery.",
      operationalOwner: "identity",
      acceptanceAuthority: "Chief Technology Officer",
      affectedUsers: 12000,
      laborDays: 160,
      durationWeeks: 8,
      production: false,
      customerFacing: true,
      sensitiveData: true,
      authenticationPath: true,
      internetExposed: true,
      requiredBy: "October 30, 2026, before the FY2027 platform-design and procurement request is submitted",
      consequence: "If ID-BASIS-005 is not accepted by October 30, the FY2027 request has no defensible population, recovery target, authority model, or migration boundary. The $1.8 million planning envelope must remain uncommitted; selecting a product anyway would let its directory schema, workload-identity model, delegation controls, and recovery assumptions become organizational policy without an organizational decision.",
      outcomeShape: "single",
      epicOutcomes: "ID-BASIS-005 reconciles 21,300 identities, 286 trusts, and 63 issuance paths; resolves or explicitly disposes of every owner, namespace, credential-age, delegation, and recovery gap; and supplies one accepted, product-neutral design basis to later architecture",
      guided: {
        version: 1, enforce: true, dirty: {},
        currentState: {
          baselineMode: "reference",
          baselineReference: "ID-ARCH-001 rev 3",
          delta: "The synchronized July 2026 reconciliation adds 1,740 ownerless service or workload identities, 812 credentials older than 365 days, 430 human-name collisions, 37 trusts with no signing-certificate renewal owner, and 21 delegated-administration exceptions to the accepted platform inventory.",
          architecture: "Corporate AD, Research AD, six FreeIPA replicas, and four cloud IAM tenants serve 12,000 human and 9,300 service or workload identities across 286 SAML, OIDC, LDAP, Kerberos, and certificate trusts and 63 certificate-issuance paths.",
          measurements: "The July reconciliation records 8,600 workforce identities, 3,400 researcher and administrator identities, 2,700 FreeIPA service principals, 6,600 cloud workload identities, 1,240 Linux hosts, 286 trusts, and 63 issuance paths from synchronized source exports.",
          constraints: "Research AD has no full-forest recovery evidence, FreeIPA has no tested loss-of-region procedure, cloud tenants use inconsistent break-glass and audit rules, 1,740 non-human identities lack accountable owners, and 21 privileged groups can be changed outside their owning approval paths.",
        },
        outcome: {
          scope: "All 12,000 human identities, 9,300 service and workload identities, 286 application trusts, 63 certificate-issuance paths, and their organizational authority and recovery boundaries.",
          capability: "Northstar has an accepted, product-neutral identity design basis defining identity classes, authoritative sources, lifecycle events, trust boundaries, delegated authority, credential rules, recovery obligations, ownership, and retirement conditions.",
          proof: "Every inventoried identity, trust, and issuance path reconciles to a class and accountable owner or accepted disposition; all measured gaps have recorded decisions; and three product-neutral boundary models are compared against the same evidence.",
          horizon: "Through acceptance of the later platform architecture and its five-year operating model; the design basis remains authoritative until explicitly superseded by an accepted revision.",
        },
        difference: {
          preserve: "HR and research-registry source authority, accepted application authorization semantics, required workforce and privileged recovery outcomes, auditable delegation, certificate consumer continuity, and safely governed emergency access.",
          change: "Replace four implementation-defined lifecycle and authority models with one explicit organizational model; resolve or dispose of 1,740 ownerless identities, 812 stale credentials, 430 namespace collisions, 37 renewal gaps, and 21 delegation exceptions.",
          evidence: "Synchronized HR, research-registry, directory, FreeIPA, cloud IAM, trust, certificate, recovery, credential-age, delegation, staffing, migration-constraint, and five-year cost records evaluated against the same three boundary models.",
        },
        requirements: [
          { id: "001", force: "will", condition: "HR, the research registry, Identity Engineering, Platform Engineering, and each cloud tenant will supply dated source exports with stable identifiers and named data owners.", verification: "Retain source manifests, extraction timestamps, hashes, schema versions, and signed data-owner attestations for the synchronized export window." },
          { id: "001", force: "shall", condition: "Every inventoried identity shall be classified as workforce, researcher, privileged administrator, application service, machine, workload, integration, emergency, or an explicitly accepted exception with lifecycle and evidence ownership.", verification: "Reconcile every source identifier to the identity-class register and require a recorded exception decision for every unmatched or multiply classified record." },
          { id: "002", force: "shall", condition: "Every one of the 286 trusts and 63 issuance paths shall identify its relying system, owner, protocol, issuer, population, privilege, renewal mechanism, failure consequence, recovery requirement, and retirement condition.", verification: "Reconcile directory, application, certificate-authority, and network inventories to the trust register; owners sign every row or record an accepted disposition." },
          { id: "003", force: "shall", condition: "Workforce and privileged flows shall have configuration RPO 0 and accepted recovery targets of 15 and 30 minutes; other identity classes shall receive separately justified targets.", verification: "Run tabletop and executable recovery exercises against each boundary model and retain configuration reconciliation, independent timestamps, gaps, and accepted target decisions." },
          { id: "004", force: "shall", condition: "No standing privileged group shall be modifiable outside a named approval boundary; delegated administration shall define actor, scope, evidence, and revocation.", verification: "Compare effective administration rights with the authority matrix and execute sampled grant, use, audit, and revocation tests for every delegation class." },
          { id: "005", force: "shall", condition: "Every service and workload identity shall have an accountable owner and automated rotation of 90 days or less, or a time-bounded accepted exception with compensating control and expiration.", verification: "Reconcile credential age, rotation configuration, owner, exception, compensating-control, and expiration records for all 9,300 non-human identities." },
          { id: "006", force: "shall", condition: "The design basis shall compare at least three product-neutral boundary models against the same identity inventory, failure scenarios, staffing model, migration constraints, and five-year cost assumptions.", verification: "Use a versioned comparison matrix with identical inputs and independently reviewed model claims; reject any option whose assessment depends on product-specific redefinition of an identity class." },
        ],
        acceptance: [
          { context: "when synchronized source reconciliation completes", evidence: "12,000 human and 9,300 non-human identities reconcile to authoritative records without silent omissions or duplicate counting", verification: "Versioned reconciliation report, exception register, source hashes, and data-owner signatures" },
          { context: "when ownership and lifecycle decisions complete", evidence: "every identity, trust, and issuance path has a class and accountable owner or an explicitly accepted disposition", verification: "Identity, trust, issuance-path, credential, and exception registers with owner and Decision Owner acceptance" },
          { context: "when recovery and delegation requirements are reviewed", evidence: "Security and every operating owner accept the recovery matrix, delegated-authority boundaries, credential rules, and break-glass obligations", verification: "Signed recovery and authority matrices plus retained exercise findings and exception decisions" },
          { context: "when boundary-model comparison completes", evidence: "three product-neutral models have been compared using identical evidence and the accepted design basis records tradeoffs, residual risks, requirements, and implementation preconditions", verification: "Versioned comparison matrix and accepted ID-BASIS-005 design brief" },
        ],
        nonGoals: [
          { exclusion: "Selecting an identity product or vendor or authorizing an identity migration.", reason: "This Discovery establishes the organizational design basis against which later architecture and procurement are judged." },
          { exclusion: "Designing application roles or customer entitlements or changing application authorization.", reason: "Application authorization has separate owners and is not required to establish identity classes, lifecycle authority, and trust boundaries." },
          { exclusion: "Treating the current directory schema or a demonstrated product taxonomy as the required future model.", reason: "Implementation vocabulary is evidence about current state, not authority to define organizational identity policy." },
        ],
        dependencies: [
          { dependency: "Synchronized human-identity source exports", owner: "HR and the Research Office", contribution: "Supply July 31 snapshots with immutable person identifiers and named source-data owners.", evidence: "Dated HR and research-registry manifests, hashes, schema records, and owner attestations." },
          { dependency: "Directory, cloud, workload, trust, and certificate exports", owner: "Identity Engineering, Platform Engineering, Systems, and cloud-tenant owners", contribution: "Export identity, group, trust, credential-age, issuance, audit, and recovery configuration from the same 24-hour period.", evidence: "Signed source manifest and synchronized extraction record for Corporate AD, Research AD, FreeIPA, and four cloud tenants." },
          { dependency: "Relying-system trust and outage validation", owner: "The named owners of 74 application services", contribution: "Validate relying-party trusts, privilege conveyed, certificate renewal ownership, failure consequence, and retirement conditions.", evidence: "Per-system trust-register sign-off and documented exceptions." },
          { dependency: "Control and comparison acceptance", owner: "Security, Architecture, Finance, and operating owners", contribution: "Accept control objectives, recovery targets, common evidence, staffing assumptions, and five-year cost inputs without prescribing a product.", evidence: "Accepted control-objective register, comparison protocol, staffing record, and planning-envelope decision." },
        ],
        preconditions: [
          { condition: "HR and the research registry can provide synchronized July 31 snapshots with immutable person identifiers.", evidenceOwner: "HR and Research Office data owners prove this with dated manifests and signed export records." },
          { condition: "Corporate AD, Research AD, FreeIPA, and all four cloud tenants can export identity, trust, credential-age, and audit configuration in the same 24-hour period.", evidenceOwner: "Identity Engineering, Platform, Systems, and cloud-tenant owners jointly own the synchronized source manifest." },
          { condition: "Application and platform owners have validated the 286-trust and 63-issuance-path inventory boundary.", evidenceOwner: "Each named system owner signs its trust-register rows; Identity Engineering owns reconciliation." },
          { condition: "A 160-person-day Discovery envelope is reserved without authorizing implementation.", evidenceOwner: "Portfolio authority owns the dated capacity reservation and its expiration." },
        ],
        artifact: { identifier: "ID-BASIS-005", contents: "Reconciled human and non-human identity inventories; class and lifecycle taxonomy; trust and issuance-path register; authority, delegation, credential, exception, namespace, recovery, operating-assumption, boundary-model comparison, and later-design requirement records.", completionProof: "Every source record reconciles; every measured ownership, credential, namespace, renewal, and delegation gap has an accepted disposition; three models use the same evidence; and the CTO accepts the product-neutral design brief and residual uncertainty." },
        downstream: { work: "A later architecture proposal can compare platform designs and vendors against fixed identity classes, authoritative sources, delegated authorities, recovery targets, credential rules, ownership, migration constraints, and five-year assumptions.", fixedDecisions: "The reconciled identity, trust, and issuance-path populations; authoritative sources; identity classes; lifecycle and credential rules; delegated-authority boundaries; accepted recovery targets; named ownership; and the prohibition on product-defined organizational policy." },
        timing: {
          event: "ID-BASIS-005 must be accepted by October 30, 2026, before the FY2027 platform-design and procurement request is submitted.",
          evidence: "The Portfolio and Finance FY2027 planning calendar and the CTO-sponsored $1.8 million comparison envelope establish the October 30 design-basis gate.",
          missedDecision: "The FY2027 request cannot make a defensible platform, recovery, authority, population, or migration-boundary decision.",
          avoidableCommitment: "$1.8 million remains uncommitted; proceeding anyway would allow product implementation choices to become unapproved organizational identity policy.",
          fallback: "Portfolio authority withholds the FY2027 platform-design and procurement request and either authorizes a newly bounded Discovery extension or defers platform selection to the next planning window.",
        },
        discovery: {
          question: "Which ownerless identities and renewal paths still serve live consumers, which namespace collisions represent the same person, and which product-neutral boundary model meets the accepted recovery targets without preserving incompatible lifecycle and delegation models?",
          endDecision: "Accept one product-neutral design basis, reject all three models and authorize a newly bounded comparison, or explicitly defer platform design; Discovery cannot silently become product selection or migration authority.",
          phases: [
            { phase: "4 working days — synchronized export and reconciliation", exit: "Source manifests and hashes are accepted and every mismatch is entered in the reconciliation register." },
            { phase: "6 working days — owner and consumer validation", exit: "Every identity, trust, and issuance path has a named owner or an explicit candidate disposition." },
            { phase: "4 working days — taxonomy and authority decisions", exit: "Identity classes, lifecycle rules, delegated authorities, credential rules, and recovery targets are accepted or carry named exceptions." },
            { phase: "4 working days — compare three boundary models", exit: "All models have been assessed against identical evidence, failure scenarios, staffing, migration constraints, and five-year assumptions." },
            { phase: "2 working days — evidence review and acceptance", exit: "The CTO accepts ID-BASIS-005, rejects all models, or records the next bounded decision." },
          ],
        },
        epicOutcomes: [
          { capability: "ID-BASIS-005 supplies an accepted product-neutral identity design basis to later architecture.", measure: "All 21,300 identities, 286 trusts, and 63 issuance paths reconcile and every measured ownership, namespace, credential, renewal, delegation, and recovery gap has an accepted disposition.", horizon: "Accepted by October 30, 2026 and authoritative until explicitly superseded by an accepted revision." },
        ],
      },
    },
  };

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

  function coordinationBand(teamCount, handoffCount) {
    if (!teamCount) return "Unknown";
    if (teamCount === 1 && handoffCount === 0) return "XS";
    if (teamCount === 2 && handoffCount <= 1) return "S";
    if (teamCount <= 3 && handoffCount <= 2) return "M";
    if (teamCount <= 7) return "L";
    return "XL";
  }

  function highestBand(bands) {
    const known = bands.filter((band) => SIZE_ORDER.includes(band));
    if (!known.length) return "Unknown";
    return known.reduce((highest, band) => SIZE_ORDER.indexOf(band) > SIZE_ORDER.indexOf(highest) ? band : highest, "XS");
  }

  function financialCommitmentClass(spendUsd) {
    const spend = Number(spendUsd);
    if (!spend) return { key: "F0", label: "No financial commitment recorded" };
    if (spend <= 25000) return { key: "F1", label: "Up to $25,000" };
    if (spend <= 250000) return { key: "F2", label: "$25,001–$250,000" };
    if (spend <= 1000000) return { key: "F3", label: "$250,001–$1,000,000" };
    return { key: "F4", label: "More than $1,000,000" };
  }

  function isCatalogRoute(state) {
    if (state.catalogPath === "incident" || state.catalogPath === "service") return true;
    return state.catalogPath === "inquiry" && Number(state.inquiryHours) <= 4 && !state.requiresChange && !state.purchase;
  }

  function materialChange(state) {
    return state.catalogPath === "change" || state.requiresChange || state.purchase || Number(state.inquiryHours) > 4;
  }

  function dependencyGraph(state) {
    const selected = new Set(state.affectedSystems || []);
    const dependencies = new Set();
    selected.forEach((systemId) => {
      const system = COMPANY.systems[systemId];
      (system?.dependsOn || []).forEach((dependencyId) => {
        if (!selected.has(dependencyId)) dependencies.add(dependencyId);
      });
    });
    const allSystems = [...selected, ...dependencies];
    const teamIds = [...new Set(allSystems.map((systemId) => COMPANY.systems[systemId]?.owner).filter(Boolean))];
    const handoffs = [...selected].reduce((count, systemId) => {
      const owner = COMPANY.systems[systemId]?.owner;
      return count + (COMPANY.systems[systemId]?.dependsOn || []).filter((dependencyId) => COMPANY.systems[dependencyId]?.owner !== owner).length;
    }, 0);
    return {
      selected: [...selected],
      dependencies: [...dependencies],
      allSystems,
      teamIds,
      handoffs,
    };
  }

  function missingProposalFields(state) {
    const fields = [
      ["requester", "requester named in this draft"],
      ["requestingTeam", "requesting function"],
      ["title", "short working title"],
      ["currentState", "Current State"],
      ["outcome", "Desired Outcome"],
      ["difference", "Required Difference"],
      ["requirements", "Requirements"],
      ["success", "Acceptance Conditions"],
      ["nonGoals", "Non-Goals"],
      ["dependencyNotes", "Dependency evidence"],
      ["requiredBy", "Timing Evidence"],
      ["consequence", "consequence of missing the timing condition"],
      ["operationalOwner", "Operational Ownership"],
      ["acceptanceAuthority", "Acceptance Authority"],
    ];
    const missing = fields.filter(([key]) => !String(state[key] || "").trim()).map(([, label]) => label);
    if (!String(state.problem?.statement || "").trim()) missing.push("Problem Statement");
    if (!String(state.problem?.benefit || "").trim()) missing.push("Benefit of Solving the Problem");
    const feasibilityAssessments = state.feasibility?.assessments || [];
    if (!feasibilityAssessments.length) missing.push("Feasibility Basis: at least one assessment");
    const feasibilityIds = feasibilityAssessments.map((assessment) => String(assessment.id || "").trim().toUpperCase());
    if (new Set(feasibilityIds).size !== feasibilityIds.length) {
      missing.push("Feasibility Basis: unique identifiers");
    }
    const feasibilityFindings = new Set(["demonstrated", "supported", "unproven", "contradicted"]);
    feasibilityAssessments.forEach((assessment, index) => {
      const label = `Feasibility Basis ${index + 1}`;
      if (!String(assessment.id || "").trim()) missing.push(`${label}: stable identifier`);
      if (!String(assessment.covers || "").trim()) missing.push(`${label}: covered Requirement and Acceptance IDs`);
      if (!String(assessment.target || "").trim()) missing.push(`${label}: assessed target`);
      if (!String(assessment.hardLimits || "").trim()) missing.push(`${label}: hard limits and irreducible steps`);
      if (!String(assessment.evidence || "").trim()) missing.push(`${label}: supporting evidence`);
      if (!String(assessment.assumptions || "").trim()) missing.push(`${label}: assumptions`);
      if (!String(assessment.margin || "").trim()) missing.push(`${label}: operating margin`);
      if (!String(assessment.finding || "").trim()) missing.push(`${label}: finding`);
      else if (!feasibilityFindings.has(assessment.finding)) missing.push(`${label}: supported assessment finding`);
    });
    if (state.guided?.enforce) {
      const covered = new Set(
        feasibilityAssessments.flatMap((assessment) =>
          String(assessment.covers || "").split(/[,\n]/).map((value) => value.trim().toUpperCase()).filter(Boolean)
        )
      );
      const requiredCoverage = [
        ...(state.guided.requirements || [])
          .filter((requirement) => String(requirement.force || "shall").toLowerCase() !== "will")
          .map((requirement, index) => evidenceId(String(requirement.force || "shall").toUpperCase(), requirement.id, index)),
        ...(state.guided.acceptance || []).map((_, index) => evidenceId("AC", "", index)),
      ];
      const allCoverageIds = [
        ...(state.guided.requirements || []).map((requirement, index) => evidenceId(String(requirement.force || "shall").toUpperCase(), requirement.id, index)),
        ...(state.guided.acceptance || []).map((_, index) => evidenceId("AC", "", index)),
      ];
      if (new Set(allCoverageIds).size !== allCoverageIds.length) {
        missing.push("Requirements and Acceptance Conditions: unique coverage identifiers");
      }
      [...covered]
        .filter((id) => !allCoverageIds.includes(id))
        .forEach((id) => missing.push(`Feasibility Basis coverage: unknown identifier ${id}`));
      requiredCoverage
        .filter((id) => !covered.has(id))
        .forEach((id) => missing.push(`Feasibility Basis coverage: ${id}`));
    }
    if (!(state.affectedSystems || []).length) missing.push("Dependencies / affected systems");
    if (state.knownUnknowns && !String(state.uncertaintyQuestion || "").trim()) missing.push("Known Uncertainty");
    if (state.guided?.enforce) missing.push(...missingGuidedProposalEvidence(state.guided));
    return [...new Set(missing)];
  }

  function missingGuidedProposalEvidence(guided) {
    const missing = [];
    const absent = (value) => !String(value || "").trim();
    const current = guided.currentState || {};
    if (absent(current.baselineMode)) missing.push("Current State: baseline method");
    if (current.baselineMode === "reference" && absent(current.baselineReference)) missing.push("Current State: authoritative baseline reference");
    if (current.baselineMode === "reference" && absent(current.delta)) missing.push("Current State: explicit delta from accepted baseline");
    if (absent(current.architecture)) missing.push("Current State: architecture and operating path");
    if (absent(current.measurements)) missing.push("Current State: measured production workload or explicit Discovery obligation");
    if (absent(current.constraints)) missing.push("Current State: failure, lifecycle, cost, and operator evidence");

    const outcome = guided.outcome || {};
    if (absent(outcome.scope)) missing.push("Desired Outcome: operating scope");
    if (absent(outcome.capability)) missing.push("Desired Outcome: capability or removed failure mode");
    if (absent(outcome.proof)) missing.push("Desired Outcome: decisive proof");
    if (absent(outcome.horizon)) missing.push("Desired Outcome: operating horizon or event");

    const difference = guided.difference || {};
    if (absent(difference.preserve)) missing.push("Required Difference: preserved contracts or outcomes");
    if (absent(difference.change)) missing.push("Required Difference: measured conditions that must change");
    if (absent(difference.evidence)) missing.push("Required Difference: common evidence basis");

    const requirements = guided.requirements || [];
    if (!requirements.length) missing.push("Requirements: at least one testable condition");
    requirements.forEach((item, index) => {
      const label = `Requirement ${index + 1}`;
      if (absent(item.force)) missing.push(`${label}: will / shall / should force`);
      if (absent(item.id)) missing.push(`${label}: stable identifier`);
      if (absent(item.condition)) missing.push(`${label}: operating condition`);
      if (absent(item.verification)) missing.push(`${label}: verification method`);
    });

    const acceptance = guided.acceptance || [];
    if (!acceptance.length) missing.push("Acceptance Conditions: at least one observable result");
    acceptance.forEach((item, index) => {
      if (absent(item.evidence)) missing.push(`Acceptance Condition ${index + 1}: observable result`);
      if (absent(item.verification)) missing.push(`Acceptance Condition ${index + 1}: retained proof`);
    });

    const nonGoals = guided.nonGoals || [];
    if (!nonGoals.length || nonGoals.every((item) => absent(item.exclusion))) missing.push("Non-Goals: at least one explicit boundary");

    const timing = guided.timing || {};
    if (absent(timing.event)) missing.push("Timing Evidence: event and latest useful date");
    if (absent(timing.evidence)) missing.push("Timing Evidence: source");
    if (absent(timing.missedDecision)) missing.push("Timing Evidence: unavailable decision or outcome");
    if (absent(timing.fallback)) missing.push("Timing Evidence: fallback if missed");

    const dependencies = guided.dependencies || [];
    if (!dependencies.length) missing.push("Dependency evidence: non-catalog prerequisites or explicit none");
    dependencies.forEach((item, index) => {
      const label = `Dependency ${index + 1}`;
      if (absent(item.dependency)) missing.push(`${label}: prerequisite, commitment, or external event`);
      if (absent(item.owner)) missing.push(`${label}: fact or decision owner`);
      if (absent(item.contribution)) missing.push(`${label}: contribution or decision required`);
      if (absent(item.evidence)) missing.push(`${label}: commitment or source evidence`);
    });
    return missing;
  }

  function missingFramingFields(state) {
    const fields = [
      ["intent", "primary intent"],
      ["preconditions", "preconditions"],
      ["nonGoals", "Non-Goals"],
      ["reusableArtifact", "reusable artifact"],
      ["downstreamEnabled", "downstream work enabled"],
    ];
    const missing = fields.filter(([key]) => !String(state[key] || "").trim()).map(([, label]) => label);
    if (!state.guided?.enforce) return missing;
    const guided = state.guided;
    const absent = (value) => !String(value || "").trim();
    (guided.preconditions || []).forEach((item, index) => {
      if (absent(item.condition)) missing.push(`Precondition ${index + 1}: required prior fact or decision`);
      if (absent(item.evidenceOwner)) missing.push(`Precondition ${index + 1}: evidence owner and record`);
    });
    if (!(guided.preconditions || []).length) missing.push("preconditions: at least one prior fact or decision");
    if (absent(guided.artifact?.identifier)) missing.push("reusable artifact: stable identifier");
    if (absent(guided.artifact?.contents)) missing.push("reusable artifact: required contents");
    if (absent(guided.artifact?.completionProof)) missing.push("reusable artifact: acceptance proof");
    if (absent(guided.downstream?.work)) missing.push("downstream work enabled: next decision or proposal");
    if (absent(guided.downstream?.fixedDecisions)) missing.push("downstream work enabled: inherited facts and decisions");
    if (state.knownUnknowns) {
      if (absent(guided.discovery?.question)) missing.push("Discovery: decision-critical question");
      if (absent(guided.discovery?.endDecision)) missing.push("Discovery: timebox-end decision");
      if (!(guided.discovery?.phases || []).length) missing.push("Discovery: at least one bounded phase");
      (guided.discovery?.phases || []).forEach((item, index) => {
        if (absent(item.phase)) missing.push(`Discovery phase ${index + 1}: duration and activity`);
        if (absent(item.exit)) missing.push(`Discovery phase ${index + 1}: exit evidence`);
      });
    }
    return [...new Set(missing)];
  }

  function buildReviews(state, graph) {
    const reviews = [{
      stage: 1,
      name: "Administrative Authority Review",
      decisionOwner: COMPANY.teams.portfolio.technicalReviewer,
      reason: "Decides whether this proposal may consume evaluation or bounded discovery capacity.",
    }];

    const securityTriggered = state.production || state.customerFacing || state.sensitiveData || state.authenticationPath || state.internetExposed;
    if (securityTriggered) reviews.push({
      stage: 2,
      name: "Security Review Board",
      decisionOwner: COMPANY.teams.security.technicalReviewer,
      reason: "The recorded facts cross a security, trust, production, or exposure boundary.",
    });
    if (state.sensitiveData) reviews.push({
      stage: 3,
      name: "Privacy & Data Review",
      decisionOwner: COMPANY.teams.privacy.technicalReviewer,
      reason: "The proposal handles sensitive or regulated data.",
    });
    if (state.purchase || Number(state.spendUsd) > 0) reviews.push({
      stage: 3,
      name: "Finance & Procurement Review",
      decisionOwner: COMPANY.teams.finance.technicalReviewer,
      reason: "The proposal may create a commercial or financial commitment.",
    });
    if (graph.allSystems.length > 1 || ["Migration", "Redesign"].includes(state.intent)) reviews.push({
      stage: 3,
      name: "Architecture Review",
      decisionOwner: COMPANY.teams.architecture.technicalReviewer,
      reason: "The proposal changes cross-system boundaries or structure.",
    });
    if (state.production || state.customerFacing) reviews.push({
      stage: 3,
      name: "Reliability & Operations Review",
      decisionOwner: COMPANY.teams.sre.technicalReviewer,
      reason: "The proposal changes a production service or a customer-visible operating condition.",
    });
    graph.teamIds.forEach((teamId) => {
      const team = COMPANY.teams[teamId];
      if (!team || ["security", "architecture", "portfolio", "finance", "privacy"].includes(teamId)) return;
      reviews.push({
        stage: 3,
        name: `${team.name} Technical Review`,
        decisionOwner: team.technicalReviewer,
        reason: `${team.name} owns an affected system or dependency.`,
      });
    });
    return reviews;
  }

  function buildRisks(state, graph) {
    const risks = [];
    if (state.affectedUsers >= 5000) risks.push("Enterprise-wide blast radius");
    else if (state.affectedUsers >= 500) risks.push("Multi-department blast radius");
    else if (state.affectedUsers > 0) risks.push("Bounded user impact");
    if (state.production) risks.push("Production change");
    if (state.customerFacing) risks.push("Customer-visible consequence");
    if (state.authenticationPath) risks.push("Authentication or authorization boundary");
    if (state.sensitiveData) risks.push("Sensitive or regulated data");
    if (state.internetExposed) risks.push("Internet exposure");
    if (state.purchase) risks.push("Commercial commitment");
    if (state.knownUnknowns) risks.push("Material uncertainty remains");
    if (graph.handoffs >= 4) risks.push("Cross-team critical path");
    return risks.length ? risks : ["No material indicators recorded yet"];
  }

  function buildWorkStructure(state) {
    const epicOutcomes = String(state.epicOutcomes || "").split("\n").map((line) => line.trim()).filter(Boolean);
    const discoveryPackage = state.knownUnknowns ? {
      type: "Discovery Work Package",
      name: state.uncertaintyQuestion || "Decision-critical uncertainty not yet stated",
      intent: "Discovery",
      question: state.uncertaintyQuestion || "Missing",
      doneWhen: state.reusableArtifact ? `The decision is recorded in: ${state.reusableArtifact}.` : "A decision and its evidence are recorded.",
      scope: state.discoveryTimebox || "Timebox not yet stated",
      outputFeeds: state.downstreamEnabled || "Downstream work not yet stated",
    } : null;

    if (!state.outcomeShape) return { type: "Undetermined", reason: "The proposal has not stated whether one independently valuable Epic or an Initiative containing several Epics is required.", discoveryPackage };
    if (state.outcomeShape === "single") return {
      type: "Epic candidate",
      outcome: state.outcome,
      exitCondition: state.success,
      discoveryPackage,
    };
    return {
      type: "Initiative candidate",
      outcome: state.outcome,
      epics: epicOutcomes,
      reason: epicOutcomes.length ? "Each candidate Epic must deliver independently valuable progress toward the Initiative outcome." : "The independently valuable Epic outcomes have not yet been stated.",
      discoveryPackage,
    };
  }

  function evaluate(state) {
    const graph = dependencyGraph(state);
    const bands = {
      labor: laborBand(Number(state.laborDays)),
      duration: durationBand(Number(state.durationWeeks)),
      coordination: coordinationBand(graph.teamIds.length, graph.handoffs),
    };
    const deliverySize = highestBand(Object.values(bands));
    const financialClass = financialCommitmentClass(state.spendUsd);
    const proposalMissing = missingProposalFields(state);
    const framingMissing = missingFramingFields(state);
    let disposition;

    if (!state.catalogPath) {
      disposition = {
        key: "assisted",
        label: "Assisted Intake",
        summary: "The front-door category is unclear. Assisted Intake may explain the paths and identify the next owner; it may not perform discovery or create customer demand.",
      };
    } else if (isCatalogRoute(state)) {
      const labels = {
        inquiry: "General Inquiry",
        incident: "Incident / Break-Fix",
        service: "Standard Service Request",
      };
      disposition = {
        key: "service",
        label: labels[state.catalogPath],
        summary: "This demand uses an existing operational or service path. It does not become a Work Proposal and does not prepopulate one.",
      };
    } else if (state.feasibility?.assessments?.some((assessment) => assessment.finding === "contradicted")) {
      disposition = {
        key: "blocked",
        label: "Target Is Not Physically Achievable",
        summary: "The Feasibility Basis identifies a hard limit that contradicts the requested result. The target must be corrected; approval cannot make it achievable.",
      };
    } else if (
      state.feasibility?.assessments?.some((assessment) => assessment.finding === "unproven") &&
      !(
        state.intent === "Discovery" &&
        state.knownUnknowns &&
        String(state.uncertaintyQuestion || "").trim() &&
        String(state.discoveryTimebox || "").trim()
      )
    ) {
      disposition = {
        key: "assisted",
        label: "Feasibility Assessment Required",
        summary: "The delivery target has no established Feasibility Basis. Route bounded Discovery to establish or reject the target before requesting delivery authorization.",
      };
    } else if (materialChange(state) && (!state.sponsor.trim() || !state.sponsorAccepted)) {
      disposition = {
        key: "blocked",
        label: "Sponsor Acceptance Claim Required",
        summary: "A named person is not enough. The draft must identify whether sponsor acceptance is claimed; the publishing workflow must still obtain durable, attributable approval for this exact revision.",
      };
    } else if (proposalMissing.length || framingMissing.length) {
      disposition = {
        key: "draft",
        label: "Draft Work Proposal — Incomplete",
        summary: "The named requester still owns this draft. Missing facts return to their owners; the receiving teams do not manufacture them.",
      };
    } else {
      disposition = {
        key: "proposal",
        label: "Draft Work Proposal — Complete for Submission",
        summary: "The draft contains the required intake evidence. The server must bind authenticated submission provenance and the sponsor workflow must attach durable approval before ordered review can be created.",
      };
    }

    const reviews = (materialChange(state) ? buildReviews(state, graph) : []).map((review) => ({
      ...review,
      state: "Candidate — not created",
    }));
    const capacityDecisions = graph.teamIds.map((teamId) => ({
      teamId,
      team: COMPANY.teams[teamId].name,
      decisionOwner: COMPANY.teams[teamId].capacityOwner,
      state: "Not accepted",
      meaning: "Routing identifies a dependency; it does not commit capacity within a Planning Interval.",
    }));
    const risks = buildRisks(state, graph);
    const workStructure = buildWorkStructure(state);
    const routing = [
      state.catalogPath === "change" ? "The requester knowingly selected proposed change outside the service catalog." : `Front-door answer: ${state.catalogPath || "not answered"}.`,
    ];
    if (materialChange(state)) routing.push(state.sponsorAccepted ? `The draft claims sponsorship acceptance by ${state.sponsor}; durable approval is still required.` : "The draft does not claim sponsor acceptance.");
    if (proposalMissing.length) routing.push(`Work Proposal evidence is missing: ${proposalMissing.join(", ")}.`);
    if (framingMissing.length) routing.push(`Framing is missing: ${framingMissing.join(", ")}.`);
    if (state.knownUnknowns) routing.push("Known Uncertainty produces a bounded Discovery Work Package; it does not authorize implementation or silently inflate size.");
    if (disposition.key === "proposal") routing.push(`Delivery Size Class is ${deliverySize}: the highest of ${bands.labor} labor, ${bands.duration} duration, and ${bands.coordination} coordination. The dimensions are not averaged.`);
    if (reviews.length) routing.push(`${reviews.length} review records are required in dependency order; each Decision Owner returns Approved, Conditional Approval, or Review Rejection.`);
    if (capacityDecisions.length) routing.push(`${capacityDecisions.length} delivery functions are implicated, but every Capacity Acceptance remains a separate decision.`);

    return {
      disposition,
      proposalMissing,
      framingMissing,
      bands,
      deliverySize,
      financialClass,
      graph,
      reviews,
      capacityDecisions,
      risks,
      workStructure,
      routing,
      proposalRecord: {
        type: "Draft Work Proposal",
        id: state.proposalId,
        revision: Number(state.proposalRevision),
        label: state.proposalId ? `${state.proposalId} rev ${Number(state.proposalRevision)}` : "Unassigned Work Proposal",
        authority: "No authority granted",
      },
    };
  }

  function evidenceId(prefix, value, index) {
    const candidate = String(value || "").trim().toUpperCase();
    if (candidate.startsWith(`${prefix}-`)) return candidate;
    return `${prefix}-${candidate || String(index + 1).padStart(3, "0")}`;
  }

  function atomicProposalEvidence(state, result) {
    const compiled = state.compiledAnswers;
    if (
      !compiled?.problem ||
      !compiled?.currentState ||
      !compiled?.desiredOutcome ||
      !compiled?.feasibilityBasis ||
      !compiled?.requiredDifference
    ) {
      throw new Error("Work Proposal schema version 2 requires validated, compiled form answers.");
    }
    const affectedEntities = result.graph.selected.map((systemId) => COMPANY.systems[systemId]?.entityRef).filter(Boolean);
    return {
      problem: compiled.problem,
      feasibilityBasis: {
        assessments: compiled.feasibilityBasis.assessments.map((assessment, index) => ({
          ...assessment,
          id: evidenceId("FB", assessment.id, index),
          covers: String(assessment.covers || "").split(/[,\n]/).map((value) => value.trim().toUpperCase()).filter(Boolean),
        })),
      },
      currentState: {
        summary: state.currentState,
        ...compiled.currentState,
      },
      desiredOutcome: {
        summary: state.outcome,
        ...compiled.desiredOutcome,
      },
      requiredDifference: {
        summary: state.difference,
        ...compiled.requiredDifference,
      },
      requirements: (compiled.requirements || []).map((item, index) => ({
        id: evidenceId(String(item.force || "shall").toUpperCase(), item.id, index),
        modality: String(item.force || "shall").toLowerCase(),
        condition: item.condition,
        verification: item.verification,
      })),
      acceptanceConditions: (compiled.acceptanceConditions || []).map((item, index) => ({
        id: evidenceId("AC", "", index),
        context: item.context || "",
        result: item.evidence,
        evidenceMethod: item.verification,
      })),
      nonGoals: (compiled.nonGoals || []).map((item, index) => ({
        id: evidenceId("NG", "", index),
        exclusion: item.exclusion,
        reason: item.reason || "",
      })),
      affectedEntities,
      dependencies: (compiled.dependencies || []).map((item, index) => ({
        id: evidenceId("DEP", "", index),
        dependency: item.dependency,
        owner: item.owner,
        contribution: item.contribution,
        evidence: item.evidence,
      })),
      preconditions: (compiled.preconditions || []).map((item, index) => ({
        id: evidenceId("PRE", "", index),
        condition: item.condition,
        evidenceOwner: item.evidenceOwner,
      })),
      sponsor: {
        name: compiled.proposal.sponsor.name,
        level: compiled.proposal.sponsor.level,
        accepted: false,
        assertedAccepted: Boolean(compiled.proposal.sponsor.accepted),
        verificationStatus: "unverified",
        evidence: "No durable, attributable sponsor approval is attached to this prototype revision.",
      },
      acceptanceAuthority: compiled.proposal.acceptanceAuthority,
      knownUncertainty: {
        present: Boolean(compiled.proposal.knownUncertainty.present),
        question: compiled.knownUncertainty?.question || "",
        discoveryTimebox: state.discoveryTimebox || "",
      },
      reusableArtifact: compiled.reusableArtifact,
    };
  }

  function publicationCandidates(state, result) {
    const ownerEntity = `group:default/${state.operationalOwner}`;
    const affectedEntities = result.graph.selected.map((systemId) => COMPANY.systems[systemId]?.entityRef).filter(Boolean);
    const common = { ownerEntity, affectedEntities };
    const records = [];

    if (result.workStructure.discoveryPackage) {
      records.push({
        ...common,
        id: "discovery",
        type: "Discovery Work Package",
        title: `${state.title} — bounded Discovery`,
        outcome: result.workStructure.discoveryPackage.doneWhen,
        deliveryDependsOn: [],
      });
    }

    if (result.workStructure.type === "Epic candidate") {
      records.push({
        ...common,
        id: "epic-1",
        type: "Epic candidate",
        title: state.title,
        outcome: result.workStructure.exitCondition,
        deliveryDependsOn: result.workStructure.discoveryPackage ? ["discovery"] : [],
      });
    } else if (result.workStructure.type === "Initiative candidate") {
      records.push({
        ...common,
        id: "initiative",
        type: "Initiative candidate",
        title: state.title,
        outcome: result.workStructure.outcome,
        deliveryDependsOn: result.workStructure.discoveryPackage ? ["discovery"] : [],
      });
      result.workStructure.epics.forEach((outcome, index) => records.push({
        ...common,
        id: `epic-${index + 1}`,
        type: "Epic candidate",
        title: `Epic ${index + 1} — ${state.title}`,
        outcome,
        deliveryDependsOn: ["initiative"],
      }));
    }

    return records;
  }

  function publicationArtifact(state) {
    const result = evaluate(state);
    if (result.disposition.key !== "proposal") {
      throw new Error(`Jira publication requires a complete Work Proposal draft. Current route: ${result.disposition.label}.`);
    }
    if (!result.proposalRecord.id) {
      throw new Error("Jira publication requires an assigned Work Proposal identifier.");
    }

    const atomicEvidence = atomicProposalEvidence(state, result);
    return {
      schemaVersion: PUBLICATION_ARTIFACT_SCHEMA_VERSION,
      form: state.form || {
        id: "technical-work-proposal",
        version: 1,
      },
      answers: state.formAnswers || {},
      submission: {
        requester: state.requester,
        requestingTeam: `group:default/${state.requestingTeam}`,
        source: "backstage-work-intake",
        authenticatedActor: null,
        submittedAt: null,
      },
      proposal: {
        id: result.proposalRecord.id,
        revision: result.proposalRecord.revision,
        title: state.title,
        state: "Draft Work Proposal — sponsor acceptance unverified",
        authority: "No authority granted",
        ...atomicEvidence,
      },
      reviews: result.reviews.map(({ stage, name, decisionOwner, state: reviewState }) => ({
        stage,
        name,
        decisionOwner,
        state: reviewState,
      })),
      routingRequest: {
        affectedEntities: atomicEvidence.affectedEntities,
        facts: {
          purchase: Boolean(state.purchase),
          spendUsd: Number(state.spendUsd),
          production: Boolean(state.production),
          customerFacing: Boolean(state.customerFacing),
          sensitiveData: Boolean(state.sensitiveData),
          authenticationPath: Boolean(state.authenticationPath),
          internetExposed: Boolean(state.internetExposed),
          intent: state.intent,
        },
      },
      classifications: {
        workFunctions: result.graph.teamIds,
        decisionImpacts: result.risks.map((risk) => risk.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")),
        tags: state.tags || [],
      },
      candidateDelivery: {
        authorized: false,
        reason: "This draft contains candidate review and delivery projections only. Durable sponsor approval, required review decisions, an Authorized Work Proposal, Planning Interval, and Capacity Acceptances do not yet exist.",
        records: publicationCandidates(state, result),
      },
    };
  }

  function nextProposalRevision(state) {
    return Number(state.proposalRevision) + 1;
  }

  function beginNewRevision(state) {
    if (!state.proposalId) throw new Error("A Work Proposal identifier is required before creating a revision.");
    state.proposalRevision = nextProposalRevision(state);
    state.scenario = "Custom";
    return state.proposalRevision;
  }

  function markProposalEdited(state) {
    state.scenario = "Custom";
    if (state.guided) state.guided.enforce = true;
  }

  const api = { COMPANY, PUBLICATION_ARTIFACT_SCHEMA_VERSION, SCENARIOS, beginNewRevision, blankState, evaluate, financialCommitmentClass, markProposalEdited, nextProposalRevision, publicationArtifact };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WorkIntakePrototype = api;
})(typeof window !== "undefined" ? window : globalThis);
