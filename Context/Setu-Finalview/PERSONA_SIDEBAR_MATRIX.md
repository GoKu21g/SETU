# Setu V2 — Persona × Sidebar Matrix (Detailed)

**Status:** RESOLVED, binding, v1.5 (2026-10-04). Companion to `Sahayogi_Setu_V2_Founder_Technical_Product_Blueprint.md` §8B (summary matrix) and §31 (RBAC action matrix). This file expands every cell to scope / data / actions / masking / approvals, per the master prompt's explicit instruction not to produce a vague yes/no access table.

Legend for functional state: **FULL** = unrestricted for this persona's own scope · **SCOPED** = restricted to a subset · **VIEW-ONLY** = read access, no write actions render · **HIDDEN** = item does not appear in this persona's sidebar.

Founder is **FULL** on every row with no scope restriction and no masking, per the binding Founder=Super Admin resolution (blueprint §30) — Founder's row is omitted from the per-item detail below to avoid 21 repetitions of "everything, unmasked"; assume FULL/unmasked/unrestricted for Founder on every item unless a future decision changes this.

---

## Operations Inbox

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | SCOPED | Needs Action, Commercial Control queues | Provisioning/drift/integration items | Retry, assign, escalate | None | Own domain only |
| Customer Ops | SCOPED | Needs Action, Approvals (own submissions) | Onboarding/lifecycle items | Assign, resolve, escalate | Technical fields masked | Cannot approve own request |
| Tech Support | SCOPED | Needs Action (diagnostic items) | Case-linked items | Assign, diagnose | None within case scope | N/A |
| DevOps/SRE | SCOPED | Critical, Reliability queues | Incident/health items | Retry, escalate, resolve | None | N/A |
| Eng Lead | SCOPED | Approvals (release-related) | Rollback/flag items | Approve (not own request) | None | Segregation of duties enforced |
| Security Admin | SCOPED | Security queue | Access/session items | Assign, resolve | None | N/A |
| Compliance Officer | SCOPED | Compliance queue | Evidence/finding items | Assign, resolve | None | N/A |
| Product Mgr | HIDDEN | — | — | — | — | — |
| Commercial Admin | SCOPED | Commercial Control, Approvals | Subscription-state items | Approve, reconcile | None | Cannot approve own request |
| Partner Ops | SCOPED | Needs Action (partner items) | Assignment/delegation items | Assign, resolve | None | N/A |
| Auditor | VIEW-ONLY | All queues, read | Full item detail | None | None (authorized scope) | N/A |

## Workspaces

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | FULL | All workspaces | Full technical + business fields (identity, org, membership, products, subscriptions, entitlements, provisioning, integrations, health, commercial state, timeline, People tab) | Create, provision, suspend, repair | None | Above risk threshold |
| Customer Ops | SCOPED | All workspaces | Business-scoped subset only — commercial/lifecycle state; provisioning step logs, integration internals masked/hidden | Lifecycle actions (trial-to-paid, overdue, reactivate, cancel) | Technical fields masked | Entitlement overrides above threshold |
| Tech Support | SCOPED | Case-linked workspace | Diagnostic fields, masked PII | Diagnose | PII masked unless case-linked | N/A |
| Commercial Admin | SCOPED | All workspaces | Commercial/subscription fields only | Reconcile commercial state | Technical fields masked | Above threshold |
| Auditor | VIEW-ONLY | All, read | Full fields, masked per policy | None | Standard masking rules apply | N/A |
| DevOps/SRE, Eng Lead, Security Admin, Compliance Officer, Product Mgr, Partner Ops | HIDDEN | — | — | — | — | — |

## Subscriptions

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | FULL | All | Plan, lifecycle, entitlements, overrides, enforcement | Create, change plan, apply grace/restrict/suspend | None | Large/permanent overrides |
| Customer Ops | SCOPED | All | Lifecycle state, plan, commercial projection | Trial-to-paid, grace, reactivation | Technical enforcement internals masked | Overrides above threshold |
| Commercial Admin | FULL | All | Full subscription record | Change plan, override, approve | None | Self-approval blocked |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Provisioning & Drift

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | FULL | All runs | Run ID, state, timestamps, attempts, provider refs, drift classification, Allocations tab | Create/upgrade/downgrade/suspend/reactivate/deprovision/retry/verify/compensate; drift repair | None | Sensitive repairs |
| Customer Ops | VIEW-ONLY | All | **State only** — no step logs, retries, or compensation controls | None | Technical detail hidden entirely | N/A |
| Tech Support | SCOPED | Case-linked | Run state for diagnosis | Diagnose only | None within case | N/A |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Approvals

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | SCOPED | Own-domain requests | Requester, subject, before/after, policy level | Approve/reject (not own) | None | N/A — this IS the approval screen |
| Customer Ops | SCOPED | Own submitted requests | Status tracker | Withdraw own request | None | Cannot approve own |
| Eng Lead | SCOPED | Release/rollback requests | Before/after metrics | Approve (not own escalation) | None | Blast-radius threshold |
| Security Admin | SCOPED | Security-domain requests | Access/privilege requests | Approve/reject | None | Always maker-checker |
| Commercial Admin | SCOPED | Commercial requests | Override/reconciliation requests | Approve/reject | None | Severity-tiered |
| Partner Ops | SCOPED | Partner/delegation requests | Assignment changes | Approve/reject | None | Not own request |
| Auditor | VIEW-ONLY | All, read | Full history | None | None (authorized scope) | N/A |
| Tech Support, DevOps/SRE, Compliance Officer, Product Mgr | HIDDEN | — | — | — | — | — |

## Partners

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Partner Ops | FULL | All partners | Partner profile, assignments, delegation, access, activity, Partner 360 | Add/edit/suspend partner; create/change/end assignment; define delegation | None | Broad delegated rights |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

**OPEN DECISION:** this entire row is provisional pending D14 (`Partner` object model) — see blueprint §49/§22. Do not build screens against this table until that object model is resolved.

## Products

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | VIEW-ONLY | All | Registry fields | None (registry is read-only here; configure via Catalogue) | None | N/A |
| DevOps/SRE | VIEW-ONLY | All | Health-relevant fields | None | None | N/A |
| Eng Lead | VIEW-ONLY | All | Release-relevant fields | None | None | N/A |
| Product Mgr | FULL | All | Full Product 360 — identity, adoption, modules, flags, dependencies, plans | Configure feature matrix, propose flag targeting | None | N/A for matrix; flags need Eng Lead/Founder execute |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Releases

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| DevOps/SRE | SCOPED | All releases | Diagnose-relevant fields | Diagnose | None | N/A |
| Eng Lead | FULL | All releases | Full Release 360 | Pause, resume, request rollback | None | Own escalated rollback blocked |
| Product Mgr | VIEW-ONLY | All | Release summary | None | None | N/A |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Feature Flags

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| DevOps/SRE | VIEW-ONLY | All | Flag state, telemetry | None | None | N/A |
| Eng Lead | FULL | All | Full flag record | Toggle, kill switch, change rollout % | None | Change affecting many workspaces |
| Product Mgr | SCOPED | Own-product flags | Targeting/cohort fields | Propose targeting (not execute toggle) | None | Execute requires Eng Lead/Founder |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Health

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | VIEW-ONLY | All | Product-level health | None | None | N/A |
| Tech Support | SCOPED | Case-linked product | Diagnostic signals | Diagnose | None | N/A |
| DevOps/SRE | FULL | All | Metrics, logs, traces, Technical Logs tab, synthetic checks | Declare/triage/mitigate/resolve | None | N/A |
| Eng Lead | SCOPED | Own-release-correlated | Before/after metrics | None | None | N/A |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Incidents

*(Same persona pattern as Health — see above; Incident 360 adds commander/timeline/PIR fields.)*

## Integrations

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | FULL | All | Provider registry, connection, health, webhook, sync, Message Delivery tab | Reconnect, revalidate, retry, resync | Secrets masked/referenced only | Credential changes |
| Tech Support | SCOPED | Case-linked | Health/diagnostic fields | Diagnose, safe reconnect | Secrets masked | N/A |
| DevOps/SRE | SCOPED | All | Health/impact fields | Diagnose | Secrets masked | N/A |
| Security Admin | VIEW-ONLY | All | Security-relevant fields only | None (security review, not repair) | Secrets masked | N/A |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Security & Access

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Security Admin | FULL | All | Staff users, roles, permissions, sessions, elevation, break-glass, alerts, MFA | Grant/revoke role, temporary elevation, terminate session | None (within own authorized view) | Always maker-checker, no self-approval |
| All others except Founder | HIDDEN | — | — | — | — | — |

## Access Reviews

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Security Admin | FULL | All campaigns | Population, reviewer, decisions, execution state | Start campaign, record decision (retain/modify/revoke), execute revocation | None | N/A — this is the control |
| Compliance Officer | VIEW-ONLY | All campaigns | Full, read-only | Export evidence only | None | N/A |
| Auditor | VIEW-ONLY | All, read | Full | Export | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

## Compliance, Controls, Risks & Vendors, Privacy Requests

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Compliance Officer | FULL | All | Frameworks, controls, evidence, findings, remediation, risk/vendor records, privacy case queue | Run test, attach evidence, raise/resolve finding, accept/treat risk, complete privacy case | None | Above risk threshold |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | Export | Standard | N/A |
| All others except Founder | HIDDEN | — | — | — | — | — |

## Audit Explorer

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| All 11 non-Founder, non-Auditor personas | SCOPED | **Own actions / team actions only** — a role-scoped "My Activity" slice, never the full log | Event ID, correlation ID, actor, action, before/after, result for own scope | Search, export own scope | Standard | N/A |
| Auditor | **FULL, unscoped** | Every event, every actor | Full record, structured filter chips | Search, export signed report | None beyond standard field masking | N/A — read-only by design, no approve/reject/revoke/edit action exists anywhere in this role |

## Usage & Cost

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | VIEW-ONLY | All | Meter dashboards, quota/alert thresholds | None | None | N/A |
| Product Mgr | VIEW-ONLY | Own products | Cost/usage for owned products | None | Workspace-level cost masked from Product Mgr | N/A |
| Commercial Admin | FULL | All | Cost attribution, allowance, anomalies | Flag anomaly, reconcile | None | N/A |
| Auditor | VIEW-ONLY | All, read | Full, masked per policy | None | Standard | N/A |
| All others | HIDDEN | — | — | — | — | — |

**Never shown to any persona: ₹ figures, accounting ledger data — BoSS Finance remains authoritative, per blueprint §5.**

## Catalogue & Rules

| Persona | State | Scope | Data | Actions | Masking | Approval |
|---|---|---|---|---|---|---|
| Platform Admin | SCOPED | Plans, meters, environments, provider registry | Configuration layer | Configure (high blast-radius — stricter review) | None | Change affecting all workspaces on a plan |
| Eng Lead | SCOPED | Flags/plans config | Flag definitions | Configure | None | N/A |
| Product Mgr | SCOPED | Feature Matrix | Plan-tier feature mapping | Configure | None | N/A |
| Commercial Admin | SCOPED | Pricing-side config | Pricing rules | Configure | None | N/A |
| All others | HIDDEN | — | — | — | — | — |

---

## Reconciliation note

This file's functional states must agree with blueprint §8B (summary) and §31 (RBAC action grants). Where a discrepancy is found between this file and the main blueprint, **the main blueprint (`Sahayogi_Setu_V2_Founder_Technical_Product_Blueprint.md`) is canonical** — this file is a detail expansion, not an independent source.

**CURRENT-IMPLEMENTATION status:** none of the scoping/masking logic in this file exists in code today — confirmed via `lib/`, `components/`, `app/` inspection. Only Founder's unscoped access is implicitly true today, by virtue of being the only substantively built persona, not because a permission engine enforces it.
