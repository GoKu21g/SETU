# Setu V2 — Navigation Architecture

**Status:** RESOLVED, binding, v1.5 (2026-10-04). Companion to `Sahayogi_Setu_V2_Founder_Technical_Product_Blueprint.md` §8A — this file stands alone for quick reference but must agree with that section; the blueprint is the canonical source if the two ever diverge.

## 1. Home is the Setu logo, not a sidebar item

The logo/icon at the top-left of the shell is the Home navigation control. Clicking it routes the signed-in user to their **persona-specific Home**. No "Home," "Dashboard," or "Control Room" item appears in any persona's sidebar.

| Persona | Home destination |
|---|---|
| Founder / Executive (Super Admin) | Founder Control Room |
| Platform Administrator | Platform Operations Home |
| Customer Operations Agent | Customer Operations Home |
| Technical Support Agent | Support / Diagnostics Home |
| DevOps / SRE | Reliability Home |
| Engineering Lead | Engineering / Release Home |
| Security Administrator | Security Home |
| Compliance Officer | Compliance Home |
| Product Manager | Product Home |
| Commercial Administrator | Commercial Home |
| Partner Operations | Partner Home |
| Auditor / Reviewer | Audit Home |

A common Home *shell* (layout, greeting, calendar) may be reused across personas; each persona's Home *content* must answer that persona's own primary question — see `PERSONA_DATA_CONTRACT.md`.

## 2. Operations Inbox is separate, first-class

Operations Inbox is its own sidebar destination with its own route. It is not a Home tab, not a Control Room widget, not merged into any other screen.

| | Home | Operations Inbox |
|---|---|---|
| Question answered | "What is the current state of my area of responsibility?" | "What requires human attention right now, who owns it, what is the SLA, and what should happen next?" |
| Shape | Rolled-up status, KPIs, trend | A task queue — items, owners, deadlines, actions |

## 3. The canonical sidebar

One structure, every persona. Names never change between personas — only visibility, functional state, scope, data, actions, filters, fields and masking change (see `PERSONA_SIDEBAR_MATRIX.md`).

```
[SETU LOGO]  →  Home (persona-specific; not a sidebar row)

OPERATIONS
  • Operations Inbox

CUSTOMERS
  • Workspaces
  • Subscriptions
  • Provisioning & Drift
  • Approvals
  • Partners

PRODUCTS
  • Products
  • Releases
  • Feature Flags

RELIABILITY
  • Health
  • Incidents
  • Integrations

SECURITY & COMPLIANCE
  • Security & Access
  • Access Reviews
  • Compliance
  • Controls
  • Risks & Vendors
  • Privacy Requests
  • Audit Explorer

BUSINESS
  • Usage & Cost

SETTINGS
  • Catalogue & Rules
```

## 4. Capability ≠ Sidebar Item

Not every capability becomes a top-level nav item. Internal capabilities below are consolidated into their parent domain as tabs, drawers, or panels — confirmed in this revision, not newly proposed:

| Capability | Lives inside | Why not standalone |
|---|---|---|
| People | Workspace 360 → People tab | Internal context for one workspace |
| Message Delivery | Integrations → Message Delivery tab | A diagnostic facet of one integration |
| Technical Logs | Health → Technical Logs tab | A detail view under reliability |
| Allocations | Provisioning & Drift → Allocations tab | A technical facet of the provisioning run |
| Feature Matrix | Catalogue & Rules → internal area | Commercial plan-tier definition, distinct from runtime Feature Flags |

**Feature Flags and Releases stay top-level**, deliberately — both govern operationally distinct, time-sensitive actions (kill switch, rollback) that need direct access, not two clicks through Products.

**Feature Matrix ≠ Feature Flag:** the matrix is "what the plan commercially includes" (Catalogue & Rules); the flag is "who receives it at runtime" (Feature Flags).

## 5. What was rejected, and why

The previously-uploaded Navigation Architecture Guide proposed a **5-pillar top-level sidebar** (Products / Health / Usage / Flags / Releases as sibling top-level routes). This is **not adopted**:

- Its Flags-vs-Releases distinction (§4 above) is correct and is kept.
- Its proposal to make Usage, Flags, and Releases standalone top-level items — rather than grouped by functional domain — is superseded by the canonical sidebar in §3, which groups by *what the item is about* (Customers/Products/Reliability/Security & Compliance/Business), not by *operational layer*.

The three-way conflict this created with the blueprint's own §22 and the previously-locked 20-item taxonomy is resolved in favor of the canonical sidebar above — full reasoning in the blueprint's §49 D1.

## 6. Current implementation gap — stated plainly

**CURRENT-IMPLEMENTATION:** `components/shell/Sidebar.tsx` today implements an **8-item Founder sidebar** (Control Room, Customers, Products, Reliability, Security & Compliance, Cost & Analytics, Audit Explorer — 7 live, Settings/Catalogue planned as the 8th) with Control Room as a visible sidebar row and no separate Operations Inbox item (Approvals is Founder's closest equivalent, folded under the main nav, not Customers). **This does not yet match the canonical sidebar above.** This document records the target; it does not claim the code has been migrated to it. Migrating `Sidebar.tsx` and `lib/personas.ts` to the canonical structure is unscoped engineering work, not yet started.
