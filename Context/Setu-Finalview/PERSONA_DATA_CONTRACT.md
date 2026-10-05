# Setu V2 — Persona Data Contract

**Status:** RESOLVED/SOURCE-DEFINED mix, v1.5 (2026-10-04). Companion to `Sahayogi_Setu_V2_Founder_Technical_Product_Blueprint.md`. This file answers, for every sidebar item, the master prompt's exact question: **"What data will this persona actually see on this page?"** — not "Founder can view Products," but the KPIs, columns, filters, tabs, actions and masking rules that differ persona to persona.

Template per item, per the master prompt's §12 letter scheme (A–V): Business question, Overview, KPI data, Search fields, Filters, Main table/list columns, Detail drawer, Internal tabs, Related objects, Primary actions, Secondary actions, Approval actions, Bulk actions, Export behavior, Audit behavior, Sensitive fields, Masking rules, Empty state, Loading state, Error state, No-permission state, Persona-specific differences.

To keep this file usable rather than repeating 21 near-identical templates, each item below states the **full contract once** (as built for the most-privileged persona who uses it) and then a **persona-difference table** underneath, rather than restating all 21 letters per persona.

---

## Home (persona-specific — see blueprint §8C for the full per-persona content table)

**A. Business question:** varies by persona — see blueprint §8C.
**R. Empty state:** "Nothing needs your attention right now" + link to the relevant domain.
**S. Loading state:** skeleton tiles matching the KPI card count for that persona.
**T. Error state:** stale-but-cached tile value + "Data unavailable, last updated [timestamp]" — never shows zero.
**U. No-permission state:** N/A — Home is always reachable, content is scoped to what the persona can see.

---

## Operations Inbox

**A. Business question:** What requires human attention right now, who owns it, what's the SLA, what's next?
**B. Overview:** Multi-queue view (Critical/Needs Action/Approvals/Security/Compliance/Reliability/Commercial Control), scoped per persona per `PERSONA_SIDEBAR_MATRIX.md`.
**C. KPI data:** Open count per queue, oldest-item age, SLA breach count.
**D. Search fields:** Item ID, title, workspace, product, correlation ID.
**E. Filters:** Queue, severity, state, owner, age.
**F. Main table columns:** ID, type, title, severity, workspace, product, owner, age, SLA, state.
**G. Detail drawer:** what failed, business/technical impact, affected population, retryability, timeline, attempts, related objects, evidence, approval state.
**H. Internal tabs:** none — flat list with expandable rows.
**I. Related objects:** workspace, product, subscription, integration, incident (deep links).
**J. Primary actions:** Retry, Compensate, Approve, Reject, Escalate, Assign, Resolve, Verify — named explicitly per item type, never a single generic "Resolve."
**K. Secondary actions:** Snooze (OPEN DECISION, blueprint D17).
**L. Approval actions:** Approve/Reject, gated by reason, blocked for the item's own requester.
**M. Bulk actions:** multi-select approve/reject for low-conflict items (ENGINEERING RECOMMENDATION, not yet built).
**N. Export behavior:** CSV of filtered view.
**O. Audit behavior:** every state change logged with before/after, reason, actor.
**P. Sensitive fields:** depends on linked object (workspace PII, integration credentials).
**Q. Masking rules:** inherits the linked object's masking for the viewing persona.
**R–U.** standard states per template above.

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Operations Inbox row for exact scope per persona.

---

## Workspaces / Workspace 360

**A. Business question:** What is this customer's complete operational state?
**B. Overview:** List view (filterable by lifecycle state) → Workspace 360 detail on row click.
**C. KPI data (list):** total workspaces, active, grace/restricted, failed provisioning (24h).
**D. Search fields:** workspace ID, name, organization.
**E. Filters:** lifecycle state (active/restricted/suspended/archived), plan, health.
**F. Main table columns:** workspace ID, name, organization, owner, status, product count, subscription state, health, last activity, provisioning state.
**G. Detail drawer / 360 tabs:** Overview, People, Products, Subscriptions, Entitlements, Provisioning, Integrations, Usage, Timeline, Audit.
**H. Internal tabs:** the 9 listed above — People is internal to this 360, not a standalone sidebar item (§8A).
**I. Related objects:** subscriptions, products, provisioning runs, integrations, incidents, BoSS CRM/case context (deep-link only).
**J. Primary actions (Platform Admin):** provision, upgrade/downgrade, suspend, reactivate, deprovision.
**J. Primary actions (Customer Ops):** trial-to-paid, apply grace, restrict, reactivate, cancel.
**K. Secondary actions:** request entitlement override.
**L. Approval actions:** entitlement override above threshold routes to Approvals.
**M. Bulk actions:** none currently specified.
**N. Export behavior:** workspace record export (Auditor/Compliance scope).
**O. Audit behavior:** every lifecycle/provisioning change logged with before/after, reason, actor, correlation ID.
**P. Sensitive fields:** provisioning step logs, integration internals, membership PII.
**Q. Masking rules:** Platform Admin sees full technical detail; Customer Ops sees business/commercial state only, technical fields masked or hidden entirely (the concrete Business Operator Test case, blueprint §32).
**R–U.** standard states.

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Workspaces row.

---

## Subscriptions / Subscription 360

**A. Business question:** What is this workspace entitled to, and why?
**C. KPI data:** active, grace, restricted, suspended, cancelled, expired counts; plan mix.
**E. Filters:** lifecycle state, plan, product.
**F. Main table columns:** subscription ID, workspace, product, plan, lifecycle state, renewal date.
**G. Detail / tabs:** plan, lifecycle, entitlements, add-ons, override history, enforcement status, commercial-state projection.
**J. Primary actions:** change plan, apply grace, restrict, suspend, reactivate.
**K. Secondary actions:** request override (reason, scope, start/end date, reference).
**L. Approval actions:** override above threshold → maker-checker; auto-expires per policy.
**P/Q. Sensitive/masking:** commercial terms visible to Commercial Admin and Platform Admin; Customer Ops sees lifecycle/commercial state without override-mechanics detail.
**Accounting note:** never shows ₹ ledger figures — BoSS Finance remains authoritative (blueprint §5).

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Subscriptions row.

---

## Provisioning & Drift

**A. Business question:** What was requested, what should exist, what actually exists, has it been verified?
**B. Internal tabs:** Runs, Allocations, Drift, Repairs.
**F. Run table columns:** run ID, operation, workspace, product, plan, state, timestamps, attempt, provider reference, correlation ID, source event, verification result.
**G. Detail:** every step with timestamp/attempt/result, failure classification, manual intervention/approver, final verification.
**Drift:** expected vs. actual, classified benign/actionable/critical.
**J. Primary actions (Platform Admin only):** create/upgrade/downgrade/suspend/reactivate/deprovision/retry/verify/compensate; repair — pre-check, dry-run diff, execute, post-check.
**Customer Ops sees:** state only (Requested/In Progress/Waiting/Failed/Completed/Verified) with plain-language description — no step logs, retries, or compensation controls (deliberate boundary, not an oversight).
**Explicit principle:** no ad-hoc production SQL as a normal operational path — every repair is a governed, audited screen action.

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Provisioning & Drift row.

---

## Approvals

**A. Business question:** What decisions are waiting on me, and on whom am I waiting?
**C. KPI data:** pending count, oldest pending age, escalated count.
**F. Columns:** approval ID, requester, approver, subject, workspace, product, requested change, reason, policy level, deadline.
**G. Detail:** before/after, full reference, history.
**States:** Pending, Escalated, Approved, Rejected, Auto-approved, Overridden, Withdrawn.
**L. Approval actions:** Approve/Reject with mandatory reason; requester cannot approve own request, enforced structurally.
**O. Audit behavior:** full before/after, approver identity, timestamp.

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Approvals row.

---

## Partners / Partner 360

**OPEN DECISION — provisional contract, pending D14 (`Partner` object model).** Do not implement against this section until that object model is resolved (blueprint §22, §49).

**A. Business question:** Are partner/client assignments and delegated rights correct?
**F. Columns:** partner, type, owner, status, client workspaces, products, delegated rights, dates, granted by.
**G. Partner 360 tabs/fields:** identity/type/status, assigned workspaces/products, partner users + delegated access, assignment/delegation status with expiry, recent activity, upcoming/completed reviews.
**J. Primary actions (Partner Ops only):** add/edit/suspend partner; create/change/end assignment; define/change delegated actions; per-review keep/change/remove.
**Operating model:** Partner → Assignment → Delegation → Access → Activity → Review.

---

## Products / Product 360

**A. Business question:** What is happening with this product and everything important around it?
**C. KPI data:** products live, average adoption %, workspaces near plan limits.
**F. Columns (list):** product, brand, health, dependency summary → Product 360.
**G. Product 360 tabs/fields:** identity (name/ID/lifecycle/owner/technical owner), workspace population, plan distribution, usage/adoption, health (trend from scorecard), incidents, releases, dependencies (outgoing `dependsOn` + computed incoming `dependencyOf`), cost, controls/risks, timeline, source/freshness.
**Explicit architectural principle:** the product list is **never** hardcoded to a fixed count — "Setu supports 9 products" is current/sample data, not an architectural constraint. New products register through the adapter model (blueprint §36) without a Setu redesign.
**J. Primary actions (Product Mgr):** configure feature matrix, propose flag targeting.
**Product List ≠ Product Card ≠ Product 360 ≠ Registry** — four distinct views: discovery/search, compact quick view, deep investigation, governed configuration.

**Persona differences:** see `PERSONA_SIDEBAR_MATRIX.md` → Products row.

---

## Releases / Release 360

**A. Business question:** Did a release or configuration change create this problem?
**F. Columns:** release ID, product, version, build, commit, environment, rollout %, cohort, state.
**G. Detail:** errors, latency, affected workspaces, migrations, config changes, linked incidents, timeline, audit.
**State machine:** Draft → Internal → Beta → Partial → GA → Paused → Rolled-back / Retired.
**J. Primary actions (Eng Lead):** pause, resume, request rollback.
**L. Approval actions:** rollback above blast-radius threshold requires approval; requester cannot approve own escalation.
**Note:** CI/CD remains the deployment system of record — Setu governs visibility and rollback decisions, not the deployment pipeline itself.

---

## Feature Flags

**A. Business question:** Who gets to experience this capability right now, and is rollout safe?
**F. Columns:** flag, product, owner, state, targeting/cohort, percentage, schedule, telemetry, error rate, expiry.
**State machine:** Draft → Internal → Beta → Partial → GA → Paused → Rolled-back / Retired (two separate terminal states — a rolled-back flag can be revived, Retired is final).
**J. Primary actions (Eng Lead):** toggle, kill switch, change rollout %.
**Product Mgr:** proposer-only on targeting; cannot execute the toggle directly.
**Feature Matrix ≠ Feature Flag** — restated here because it's the single most-flagged naming confusion across source documents: the matrix is commercial (what a plan includes); the flag is runtime (who sees it right now).

---

## Health

**A. Business question:** What failed and what is affected?
**Hierarchy:** Platform → Product → Service/Component. **Not** simply "worst component wins" — see blueprint §14's dilution-model recommendation (not yet implemented; current build uses a simpler escalation rule, documented honestly in blueprint §14).
**F. Columns:** product, status, uptime, error rate vs. SLO, p95 latency, requests/sec, saturation.
**H. Internal tabs:** Technical Logs (internal to Health, not standalone per §8A).
**J. Primary actions (DevOps/SRE):** declare/triage/mitigate/resolve.

---

## Incidents / Incident 360

**A. Business question:** What's broken, who owns it, how bad is it?
**State machine:** Detected → Triaged → Investigating → Mitigating → Monitoring → Resolved → Closed.
**G. Incident 360 fields:** severity/status, commander/technical owner, affected scope (product/service/environment/workspace population), detection, linked releases/integrations/error groups, timeline, mitigation/recovery/verification, BoSS case correlation, PIR (root cause, contributing factors, follow-ups).
**Field improvement (RESEARCH-DERIVED):** `affectedWorkspaces` should be catalog-backed pick-from-list, not free text — serves DevOps/SRE, Engineering Lead and Technical Support identically.

---

## Integrations / Integration 360

**A. Business question:** Is this provider connection healthy, and is it secure?
**H. Internal tabs:** Provider Registry, Connections, Health, Webhooks, Sync, Message Delivery, Impact, Security. Message Delivery is internal here, not standalone (§8A).
**J. Primary actions (Platform Admin):** reconnect, revalidate, retry webhook, resync.
**P/Q. Sensitive/masking:** secrets never displayed in full — masked references only, regardless of persona viewing.

---

## Security & Access

**A. Business question:** Who has special access, and what changed?
**C. KPI data (Security Admin Home):** Open Alerts, Awaiting Approval, Expiring Access, Live Sessions, Overdue Reviews, Broken Connections (if Integrations in release).
**H. Internal structure (7 sidebar sub-items, per the Security Administrator role document):** Alerts, Privileges, Sessions, Reviews, Integrations (proposed), Policies, Trail.
**J. Primary actions (Security Admin only):** acknowledge/assign/resolve alerts; approve/reject access requests; remove access; end sessions; per-review keep/change/remove.
**Explicit rule:** nobody approves their own request or reviews their own access; this persona cannot end their own session.

---

## Access Reviews

**A. Business question:** Does everyone still need the access they have?
**F. Columns:** campaign, population, reviewer, due date, progress.
**J. Primary actions (Security Admin only):** start campaign, record decision (retain/modify/revoke), execute revocation.
**Compliance Officer:** view-only + export evidence — explicitly no start-campaign/record-decision/execute-revocation action for this persona.
**Offboarding consideration:** role revocation, session termination, orphaned-access cleanup, approval/automation reassignment.

---

## Compliance / Controls / Risks & Vendors / Privacy Requests

**A. Business question:** Are controls, evidence and findings under control, and what's at risk?
**H. Internal tabs (Compliance):** Frameworks, Controls, Evidence, Tests, Findings, Remediation, Privacy Requests, Data Governance.
**G. Control 360 fields:** control ID, statement, owner, frequency, status, frameworks, implementation, evidence, tests, evidence snapshots, findings, remediation, history.
**Control states:** Not Due, Due, In Progress, Effective, Exception, Failed.
**J. Primary actions (Compliance Officer only):** run control test, attach evidence, raise/resolve finding, accept/treat risk, complete/except a privacy request (case-orchestration-only — tracks the case, does not execute automated deletion/correction against product systems, per blueprint D12).
**Risk treatment options:** Mitigate, Transfer, Avoid, Accept.
**Vendor fields:** vendor, service, criticality, dependent products, data shared, contract/DPA, renewal, review, incidents, exit requirements.

---

## Audit Explorer

**A. Business question:** Can I reconstruct what happened, independently?
**F. Columns:** event ID, correlation ID, actor, effective role, timestamp, environment, target, action, reason, reference, before/after, approval, session, result, workflow, incident, integrity.
**E. Filters:** date, actor, role, action, entity, product, workspace, environment, result, event type.
**Auditor:** full, unscoped, read + export — structured filter-chip search, not a raw-query console.
**Every other persona:** role-scoped "My actions/team actions" slice only.
**Founder:** full, unscoped — per the binding Founder=Super Admin resolution, blueprint §30.
**No persona, including Founder, can edit or delete an audit record.**

---

## Usage & Cost

**A. Business question:** Is platform spend under control and explainable?
**C. KPI data:** platform cost MTD, previous period, variance, projected cost.
**F. Columns:** provider/product/workspace cost breakdown, anomalies, allowance vs. usage.
**J. Primary actions (Commercial Admin):** flag anomaly, reconcile.
**Explicit boundary:** never a duplicate Finance system — no ₹ ledger figures anywhere in this screen; BoSS Finance remains authoritative.

---

## Catalogue & Rules

**A. Business question:** What are the governed definitions everything else reads from?
**H. Catalogue contents:** brands, products, modules, plans, plan versions, add-ons, bundles, entitlement templates, Feature Matrix.
**H. Rules contents:** discount, provisioning, workflow, notification, policy rules — draft/published/dry-run/effective-date/priority/kill-switch/run-history where supported.
**J. Primary actions (Platform Admin, scoped sub-areas per other personas):** configure — but this is the one domain whose governance table (blueprint §31) carries its own note: a change here can affect every workspace on a plan at once, so it carries stricter review than day-to-day operating screens.

---

## Reconciliation note

Every contract above must agree with blueprint §31 (RBAC action matrix) and `PERSONA_SIDEBAR_MATRIX.md` (functional-state + scope summary). Where this file is silent on a persona for a given item, that persona is HIDDEN for that item — see the sidebar matrix file for the authoritative HIDDEN/VIEW-ONLY/SCOPED/FULL call.

**CURRENT-IMPLEMENTATION status:** Founder's data contract is the only one substantively built (`app/founder/*`). No other persona's data contract above exists in code today.
