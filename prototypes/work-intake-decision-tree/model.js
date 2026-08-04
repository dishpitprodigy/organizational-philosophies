// THROWAWAY PROTOTYPE DOMAIN MODEL.
// Pure intake, framing, routing, and work-item logic shared by the browser UI
// and the terminal logic driver. No I/O belongs in this file.

(function exposeModel(root) {
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
      proposalRevision: 2,
      requester: "Avery Shah",
      requestingTeam: "sre",
      catalogPath: "change",
      purchase: true,
      spendUsd: 1200000,
      title: "Select the next engineering metrics capability",
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
      proposalRevision: 0,
      requester: "Morgan Lee",
      requestingTeam: "identity",
      catalogPath: "change",
      purchase: true,
      spendUsd: 480000,
      title: "Migrate workforce applications to a common SSO service",
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
    },
    "Identity platform redesign": {
      ...blankState(),
      scenario: "Identity platform redesign",
      proposalId: "WP-2026-0044",
      proposalRevision: 0,
      requester: "Riley Gomez",
      requestingTeam: "architecture",
      catalogPath: "change",
      purchase: true,
      spendUsd: 1800000,
      title: "Establish the next enterprise identity platform",
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
      ["requester", "authenticated requester"],
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
    if (!(state.affectedSystems || []).length) missing.push("Dependencies / affected systems");
    if (state.knownUnknowns && !String(state.uncertaintyQuestion || "").trim()) missing.push("Known Uncertainty");
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
    return fields.filter(([key]) => !String(state[key] || "").trim()).map(([, label]) => label);
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
    } else if (materialChange(state) && (!state.sponsor.trim() || !state.sponsorAccepted)) {
      disposition = {
        key: "blocked",
        label: "Sponsorship Required",
        summary: "A named person is not enough. The sponsor must knowingly accept the priority claim, evaluation capacity, and organizational tradeoffs for this proposal revision.",
      };
    } else if (proposalMissing.length || framingMissing.length) {
      disposition = {
        key: "draft",
        label: "Draft Work Proposal — Incomplete",
        summary: "The authenticated requester still owns this draft. Missing facts return to their owners; the receiving teams do not manufacture them.",
      };
    } else {
      disposition = {
        key: "proposal",
        label: "Work Proposal — Ready for Ordered Review",
        summary: "The proposal contains enough evidence to request review or bounded discovery. It is not an Authorized Work Proposal, and no delivery capacity has been committed.",
      };
    }

    const reviews = (materialChange(state) ? buildReviews(state, graph) : []).map((review) => ({
      ...review,
      state: disposition.key !== "proposal" ? "Not created" : review.stage === 1 ? "Ready for review" : "Waiting for predecessor",
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
    if (materialChange(state)) routing.push(state.sponsorAccepted ? `Sponsorship accepted by ${state.sponsor}.` : "Sponsorship has not been durably accepted for this revision.");
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
        type: disposition.key === "proposal" ? "Reviewable Work Proposal" : "Draft Work Proposal",
        id: state.proposalId,
        revision: Number(state.proposalRevision),
        label: state.proposalId ? `${state.proposalId} rev ${Number(state.proposalRevision)}` : "Unassigned Work Proposal",
        authority: disposition.key === "proposal" ? "May consume ordered review or bounded discovery capacity" : "No authority granted",
      },
    };
  }

  function evidenceStatements(value) {
    return String(value || "")
      .split(/\n{2,}/)
      .map((statement) => statement.trim())
      .filter(Boolean);
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
      throw new Error(`Jira publication requires a Work Proposal that is ready for ordered review. Current route: ${result.disposition.label}.`);
    }
    if (!result.proposalRecord.id) {
      throw new Error("Jira publication requires an assigned Work Proposal identifier.");
    }

    return {
      schemaVersion: 1,
      proposal: {
        id: result.proposalRecord.id,
        revision: result.proposalRecord.revision,
        title: state.title,
        state: result.disposition.label,
        authority: result.proposalRecord.authority,
        currentState: state.currentState,
        desiredOutcome: state.outcome,
        requiredDifference: state.difference,
        requirements: evidenceStatements(state.requirements),
        acceptanceConditions: evidenceStatements(state.success),
      },
      reviews: result.reviews.map(({ stage, name, decisionOwner, state: reviewState }) => ({
        stage,
        name,
        decisionOwner,
        state: reviewState,
      })),
      routingRequest: {
        affectedEntities: result.graph.selected.map((systemId) => COMPANY.systems[systemId]?.entityRef).filter(Boolean),
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
      candidateDelivery: {
        authorized: false,
        reason: "The artifact is a Reviewable Work Proposal. Required review decisions, an Authorized Work Proposal, Planning Interval, and Capacity Acceptances do not yet exist.",
        records: publicationCandidates(state, result),
      },
    };
  }

  const api = { COMPANY, SCENARIOS, blankState, evaluate, financialCommitmentClass, publicationArtifact };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.WorkIntakePrototype = api;
})(typeof window !== "undefined" ? window : globalThis);
