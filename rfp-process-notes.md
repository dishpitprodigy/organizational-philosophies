# RFP Process Notes

Raw transcription of handwritten notes outlining the structure of an RFP process, covering document sections, requirements, acceptance testing, and the vendor scoring methodology.

## RFP Document Structure

- Executive summary
- Department background
- Current architecture
- Profile current usage
- Goals for replacement
- RFP Response
  - Formal contact — unattached from the project
  - Eligibility to Participate
  - Formal Contact Information
  - Proposal Submission
  - Electronic Proposals
  - Ownership and Confidentiality of Proposals
  - Clarity Within Proposals
  - Supporting Material
  - Vendor Briefing
  - Proposal to Remain Valid
  - Language and Measurement
  - Vendor Responsibility
  - Required Documentation
  - Options
  - Evaluation Methodology
  - Partial/Non-Compliance
  - Contact Information
  - Target Schedule and Delivery
  - Definitions
  - Requirements Structure
- Always define language & measurement
- Req. Docs
  - Line item costs
- Target Schedule & Delivery Date
  - RFP issued
  - Gather questions from all vendors and create FAQ
  - Vendor briefing — purpose is so vendors get an idea of your environment
  - Final round of questions
  - RFP closes
  - Individual vendor meetings (questions on their proposal)
- Requirement structure
- Vendor quals
- Requirements for HW/SW/env

## Requirements & Specs

- VAST & WEKA storage
- DC spec
- Benchmarks, if applicable
  - IO500
  - IOR Benchmark
  - md test
- Vendor response req's

## Acceptance Test

- Invoicing is not done on delivery
- 3 phases
  - Validate connectivity where needed
  - Validate benchmarks
  - Burn-in: exercise for 5 days, replace failed hardware
  - HPL: GPU Burn
  - Watch heat & power during load
- If the vendor has a way to exercise the system, they should give it to you

## Vendor Background Survey

- Financials
- References

## Kepner-Tregoe Decision Process

- Limit the # of options a vendor can send
- Goals — vendor answer
- Wants — see who can meet these things

## Weighting & Scoring Methodology

**Weighting w/ 1-5 Band Delphi**
- Weight: 1-5. Send weights to a neutral person, get outliers on either side. Let outlying people state their cases, then revote.

**Values:** done the same way

**Total**

- Relative Merit = Total of Totals
- Normalize Merit = Add all scores
- Cost
- Normalize Cost
- The highest total normalization wins the bid

## Appendix: Benchmark Selection by Workload Type

The IO500/IOR/mdtest suite above is specific to HPC-style parallel filesystems. For other purchase types, swap in the following instead:

**Enterprise NVMe block storage (e.g. Pure, Hitachi) — transactional, not massively parallel**
- FIO — general-purpose analog to IOR/mdtest for block/file storage. Define block size, read/write mix, queue depth, random vs. sequential; reports IOPS, throughput, and latency percentiles. Build one workload spec and run it identically across vendors.
- VDBench — similar role to FIO, common in enterprise storage POCs, good for simulating database-like access patterns.
- SPC-1 / SPC-2 (Storage Performance Council) — published industry-standard benchmarks: SPC-1 for OLTP-like transactional load, SPC-2 for large-block sequential throughput.
- For NVMe, prioritize queue-depth-1 latency and p99.9 tail latency under sustained load over peak IOPS, which vendors can inflate with deep queues.

**Latency-deterministic compute (e.g. HPE Gen11 GreenLake for trading systems)**
- STAC-M3 / STAC-A2 — the industry-standard benchmarks for financial infrastructure (STAC-M3 for tick/market-data analytics, STAC-A2 for risk/derivatives compute).
- Network jitter tests (sockperf, netperf, or PTP-synced round-trip timestamping) — jitter and tail spikes matter more than average throughput for trading systems.
- Intel MLC (Memory Latency Checker) or core-pinned synthetic tests for cache/NUMA behavior, since single-thread and cache-locality performance dominate over aggregate throughput.
- Apply the same acceptance-test framing as above (burn-in, watch heat & power under load), but use jitter under sustained load as the pass/fail criterion instead of raw benchmark score.

**Comparing two cloud vendors for a given task**
- Not an apples-to-apples hardware comparison — benchmark service behavior (noisy neighbors, provisioning tiers, network paths). Prefer running the actual workload (load-replay via k6, Locust, JMeter) over a synthetic industry benchmark.
- TPC-C / TPC-H / TPC-DS if the workload is database-shaped — vendor-neutral and often what cloud vendors use for their own sizing guidance.
- FIO and iperf3 still apply for raw storage/network numbers, but normalize by cost ($/IOPS, $/vCPU-hr under load) since instance and storage tiers don't map 1:1 across providers.
- Add cold-start/scale-up time as its own test — provisioning latency is a cloud-specific variable with no on-prem equivalent.
