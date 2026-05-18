// ─────────────────────────────────────────────────────────────────────────────
// Alongside Finance Process Navigator — Canonical Flow Data
// Source of truth for all three flows. Edit via the Navigator UI; do not
// hand-edit this file unless regenerating from scratch.
// Last baked: 2026-05-16
// ─────────────────────────────────────────────────────────────────────────────

import type { FlowData } from './types';

export const FLOW_DATA: FlowData = {
  "meta": {
    "lastUpdated": "2026-05-16",
    "entities": [
      {
        "code": "AGI",
        "name": "Alongside Global Inc",
        "currency": "USD",
        "region": "US",
        "role": "Primary US corp entity",
        "active": true
      },
      {
        "code": "AGL",
        "name": "Alongside Global Limited",
        "currency": "GBP",
        "region": "UK",
        "role": "Primary UK entity",
        "active": true
      },
      {
        "code": "SBI",
        "name": "Saddington Baynes Inc",
        "currency": "USD",
        "region": "US",
        "role": "Majority of revenue-generating projects",
        "active": true
      },
      {
        "code": "SBL",
        "name": "Saddington Baynes Limited",
        "currency": "GBP",
        "region": "UK",
        "role": "Occasional projects",
        "active": true
      },
      {
        "code": "BPI",
        "name": "Bonfire Production Inc",
        "currency": "USD",
        "region": "US",
        "role": "Occasional projects",
        "active": true
      },
      {
        "code": "HND",
        "name": "Hero Next Door Inc",
        "currency": "USD",
        "region": "US",
        "role": "Occasional projects",
        "active": "pending"
      },
      {
        "code": "SLI",
        "name": "Sombra Labs Inc",
        "currency": "USD",
        "region": "US",
        "role": "Status pending validation",
        "active": "pending"
      },
      {
        "code": "ORG",
        "name": "Organs Inc",
        "currency": "USD",
        "region": "US",
        "role": "Status pending validation",
        "active": "pending"
      }
    ]
  },
  "flows": {
    "flow1": {
      "id": "flow1",
      "title": "Production & Project Delivery",
      "accent": "flow1",
      "phases": [
        {
          "id": "sales",
          "title": "Sales"
        },
        {
          "id": "bidding",
          "title": "Bidding"
        },
        {
          "id": "contracting",
          "title": "Contracting"
        },
        {
          "id": "production",
          "title": "Production"
        },
        {
          "id": "review",
          "title": "Review & Approval"
        },
        {
          "id": "scope",
          "title": "Scope Changes"
        }
      ],
      "steps": [
        {
          "id": "f1.1",
          "num": 1,
          "phase": "sales",
          "type": "process",
          "title": "New opportunity identified",
          "owner": "sales",
          "ownerLabel": "Jen / Glen / Sales / Producer",
          "automated": false,
          "systems": [
            "scoro",
            "slack"
          ],
          "entity": "Multi",
          "action": "New opportunity is logged in Scoro by Sales or Producer. Captures client/prospect name, opportunity description, potential value, expected timing and quote stage / probability.",
          "dataUpdated": [
            "Client/prospect name",
            "Opportunity description",
            "Potential value",
            "Expected timing",
            "Quote stage / probability"
          ],
          "automation": "Possible Slack notification when opportunity is created.",
          "risks": [
            "Opportunity information may be incomplete if logged quickly, verbally, or from Slack/email."
          ],
          "suggestedFix": "Require a minimum field set (value, timing, contact, source) before the opportunity can be saved at stage 1%."
        },
        {
          "id": "f1.2",
          "num": 2,
          "phase": "sales",
          "type": "decision",
          "title": "Bid or no bid?",
          "owner": "sales",
          "ownerLabel": "Jen / Glen / Producer / Creative Lead",
          "automated": false,
          "systems": [
            "scoro",
            "slack",
            "email"
          ],
          "action": "Internal review of the opportunity before resources are committed.",
          "docs": [
            "Past client/project references",
            "Prior quotes",
            "High-level team capacity",
            "Any client brief or initial request"
          ],
          "decisionBranches": [
            {
              "label": "No",
              "target": "Opportunity closed/lost in Scoro"
            },
            {
              "label": "Yes",
              "target": "Continue to pitch/quote creation"
            }
          ],
          "risks": [
            "Decision-making may happen informally unless notes are logged in Scoro."
          ]
        },
        {
          "id": "f1.3",
          "num": 3,
          "phase": "bidding",
          "type": "process",
          "title": "Quote stage updated in Scoro",
          "owner": "sales",
          "ownerLabel": "Producer / Sales",
          "automated": false,
          "systems": [
            "scoro",
            "slack"
          ],
          "action": "Quote moved through Scoro stages \u2014 1%, 5%, 10%, 30%, 90% \u2014 as the opportunity progresses.",
          "dataUpdated": [
            "Quote stage",
            "Probability",
            "Forecast value",
            "Expected close date",
            "Project timing"
          ],
          "automation": "Slack notification may trigger when quote stage changes.",
          "risks": [
            "Forecast accuracy depends on producers keeping Scoro updated in real time."
          ]
        },
        {
          "id": "f1.4",
          "num": 4,
          "phase": "bidding",
          "type": "process",
          "title": "Pitch project created",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "scoro",
            "slack",
            "drive"
          ],
          "action": "Pitch project and pitch tasks created in Scoro, team allocated, forecast hours added.",
          "dataUpdated": [
            "Pitch tasks",
            "Team allocations",
            "Forecast work hours",
            "Timeline",
            "Estimated production budget",
            "Possible vendor/freelancer needs"
          ],
          "docs": [
            "Pitch folder",
            "Proposal assets",
            "Client brief",
            "Scoro pitch project"
          ],
          "automation": "Possible Slack notification and Google Drive pitch folder creation.",
          "risks": [
            "Pitch assumptions may not carry through to the final live project."
          ]
        },
        {
          "id": "f1.5",
          "num": 5,
          "phase": "bidding",
          "type": "process",
          "title": "Drive folder + Slack channel created",
          "owner": "system",
          "ownerLabel": "System / Producer oversight",
          "automated": true,
          "systems": [
            "drive",
            "slack",
            "scoro"
          ],
          "action": "Pitch project folder structure and Slack channel are created automatically (where the integration is connected), with the Drive link added back to the Scoro pitch project.",
          "dataUpdated": [
            "Drive link in Scoro",
            "Slack channel linked to pitch",
            "Folder structure created"
          ],
          "risks": [
            "If links are not added back into Scoro, project context becomes scattered across tools."
          ]
        },
        {
          "id": "f1.6",
          "num": 6,
          "phase": "bidding",
          "type": "process",
          "title": "Quote / bid built",
          "owner": "producer",
          "ownerLabel": "Producer with Sales / Creative input",
          "automated": false,
          "systems": [
            "scoro",
            "drive",
            "slack"
          ],
          "action": "Producer builds the commercial quote \u2014 scope, deliverables, timeline, staff allocation, rates, production budget, vendor and freelancer assumptions, and usage / pass-through assumptions where relevant.",
          "dataUpdated": [
            "Scope",
            "Deliverables",
            "Timeline",
            "Staff allocation",
            "Rates",
            "Production budget",
            "Vendor/freelancer assumptions",
            "Usage/pass-through assumptions"
          ],
          "docs": [
            "Client brief",
            "Previous project examples",
            "Previous quotes",
            "Budget estimate",
            "Scope notes"
          ],
          "risks": [
            "Manual quote building creates risk of missing scope, incorrect budget, or undocumented assumptions."
          ],
          "pending": [
            {
              "q": "What wording / detail does Ami expect to flow from quote line items into the eventual invoice?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f1.7",
          "num": 7,
          "phase": "bidding",
          "type": "decision",
          "title": "Approved to submit?",
          "owner": "producer",
          "ownerLabel": "Producer + Jen / Glen / Creative Lead",
          "automated": false,
          "systems": [
            "scoro",
            "slack"
          ],
          "action": "Internal quote review before the proposal is sent to the client. Quality control checkpoint to reduce weak or incorrect estimates going out.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Revise quote"
            },
            {
              "label": "Yes",
              "target": "Submit quote to client"
            }
          ],
          "risks": [
            "This should be a formal checkpoint; without it, incorrect commercial terms can reach the client."
          ],
          "suggestedFix": "Make the internal-review approval a required status change in Scoro before the quote can move to 'Bid Submitted'."
        },
        {
          "id": "f1.8",
          "num": 8,
          "phase": "bidding",
          "type": "process",
          "title": "Quote submitted to client",
          "owner": "sales",
          "ownerLabel": "Producer / Sales",
          "automated": false,
          "systems": [
            "email",
            "scoro",
            "drive"
          ],
          "action": "Proposal / quote PDF is emailed to the client, Scoro quote moved to Submitted.",
          "dataUpdated": [
            "Quote stage \u2192 Submitted",
            "Sent date logged",
            "Proposal version saved"
          ],
          "docs": [
            "Final proposal",
            "Quote PDF",
            "Client email trail"
          ],
          "risks": [
            "Client communications may remain in email/Slack and not be stored centrally in Scoro or Drive."
          ]
        },
        {
          "id": "f1.9",
          "num": 9,
          "phase": "bidding",
          "type": "process",
          "title": "Client feedback / negotiation",
          "owner": "producer",
          "ownerLabel": "Producer / Client / Sales",
          "automated": false,
          "systems": [
            "email",
            "slack",
            "scoro",
            "drive"
          ],
          "action": "Client asks questions, negotiates scope, requests revisions or confirms changes. Iterations are reflected back into the Scoro quote.",
          "dataUpdated": [
            "Quote revisions",
            "Scope changes",
            "Budget changes",
            "Assumptions",
            "Timeline changes"
          ],
          "docs": [
            "Revised quote",
            "Client feedback",
            "Approval emails",
            "Scope notes"
          ],
          "risks": [
            "Client approvals, scope changes and commercial decisions may be scattered across email, Slack and verbal conversations."
          ],
          "suggestedFix": "Define Scoro (commercial) and Frame.io (creative) as the canonical homes for client approvals; require links back from email/Slack threads."
        },
        {
          "id": "f1.10",
          "num": 10,
          "phase": "bidding",
          "type": "outcome",
          "title": "Verbal award \u2014 quote at 90%",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "scoro",
            "slack"
          ],
          "action": "Client indicates the project will proceed; producer moves the Scoro quote to 90%. Slack alert flags the win to internal team and finance.",
          "dataUpdated": [
            "Quote stage \u2192 90%",
            "Forecast",
            "Expected start date",
            "Expected billing trigger"
          ],
          "automation": "Slack notification alerts internal team; finance / accounts may be cc'd.",
          "risks": [
            "Work may start before formal PO / client onboarding is complete."
          ]
        },
        {
          "id": "f1.11",
          "num": 11,
          "phase": "bidding",
          "type": "process",
          "title": "Client details shared with Finance",
          "owner": "producer",
          "ownerLabel": "Jen / Producer",
          "automated": false,
          "systems": [
            "slack",
            "email",
            "scoro"
          ],
          "action": "Producer or sales hands client onboarding and invoicing prep over to Ami / Finance. Cross-flow handoff into Flow 2.",
          "docs": [
            "Quote",
            "Client contact details",
            "Billing contacts",
            "Entity details",
            "Payment terms",
            "Project scope"
          ],
          "crossFlow": [
            {
              "label": "Flow 2",
              "target": "Finance picks up client onboarding & invoice prep",
              "_resolvedStepId": "f2.3",
              "_resolvedStepNum": "3",
              "_resolvedStepTitle": "Client details updated in Scoro"
            }
          ],
          "risks": [
            "If finance handoff is informal, invoice setup may be delayed or incomplete."
          ]
        },
        {
          "id": "f1.12",
          "num": 12,
          "phase": "contracting",
          "type": "process",
          "title": "Pitch project converted to live project",
          "owner": "producer",
          "ownerLabel": "Producer / Production Admin",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Pitch / quote becomes a full live project in Scoro.",
          "dataUpdated": [
            "Project record",
            "Linked quote",
            "Project budget",
            "Project team",
            "Timeline",
            "Tasks",
            "Deliverables",
            "Drive links"
          ],
          "automation": "Possible project-creation notification to Slack and accounts@wearealongside.com.",
          "risks": [
            "If project setup does not match the approved quote, reporting and invoicing may become inaccurate."
          ]
        },
        {
          "id": "f1.13",
          "num": 13,
          "phase": "contracting",
          "type": "process",
          "title": "Client onboarding completed",
          "owner": "finance",
          "ownerLabel": "Ami / Finance + Client",
          "automated": false,
          "systems": [
            "scoro",
            "email",
            "drive",
            "xero"
          ],
          "action": "Client completes onboarding form (welcome email, payment terms, W-9 where applicable, business/tax documents); finance creates / updates records in Scoro and Xero.",
          "docs": [
            "Client onboarding form",
            "Payment terms / T&Cs",
            "W-9 where applicable",
            "Business/tax documents for the relevant entity",
            "Bank details",
            "Signed documents"
          ],
          "dataUpdated": [
            "Scoro client details",
            "Xero client record",
            "Billing contacts",
            "Tax details",
            "Legal entity details"
          ],
          "risks": [
            "Duplicate contacts may be created if existing client records are not checked first (e.g. '123 reg Ltd' vs '123 Reg Limited')."
          ]
        },
        {
          "id": "f1.14",
          "num": 14,
          "phase": "contracting",
          "type": "outcome",
          "title": "PO received",
          "owner": "client",
          "ownerLabel": "Client / Producer / Finance",
          "automated": false,
          "systems": [
            "email",
            "scoro",
            "drive"
          ],
          "action": "Client issues PO and shares with producer / finance. This is the key trigger for invoicing.",
          "dataUpdated": [
            "PO number",
            "PO value",
            "PO date",
            "Billing schedule",
            "Project record"
          ],
          "crossFlow": [
            {
              "label": "Flow 2",
              "target": "PO is the trigger for invoice creation in Scoro",
              "_resolvedStepId": "f2.5",
              "_resolvedStepNum": "5",
              "_resolvedStepTitle": "Invoice created in Scoro"
            }
          ],
          "risks": [
            "If work starts without a PO, invoice enforcement and payment collection are weaker."
          ]
        },
        {
          "id": "f1.15",
          "num": 15,
          "phase": "production",
          "type": "process",
          "title": "Production execution",
          "owner": "producer",
          "ownerLabel": "Producer / Creative Team",
          "automated": false,
          "systems": [
            "scoro",
            "slack",
            "drive"
          ],
          "action": "Work is produced, reviewed internally, and tracked. Daily / regular production updates may be pushed from a production meeting spreadsheet into Slack and Scoro.",
          "dataUpdated": [
            "Task status",
            "Production schedule",
            "Internal notes",
            "File locations",
            "Team updates",
            "Work allocation"
          ],
          "docs": [
            "Production schedule",
            "Project scope",
            "Budget",
            "Client brief",
            "Task list"
          ],
          "automation": "Daily production updates may be pushed to Slack.",
          "risks": [
            "Manual Scoro updates may be inconsistent, making project status hard to trust for forecasting and reporting."
          ]
        },
        {
          "id": "f1.16",
          "num": 16,
          "phase": "production",
          "type": "process",
          "title": "Project spend / cost awareness",
          "owner": "mixed",
          "ownerLabel": "Producer / Finance",
          "automated": false,
          "systems": [
            "scoro",
            "ramp",
            "xero"
          ],
          "action": "Project-related costs are monitored during delivery. Ramp captures card spend automatically; producer reviews actuals vs Scoro budget.",
          "dataUpdated": [
            "Expected vendor costs",
            "Actual Ramp spend",
            "Project budget impact",
            "Cost-to-date visibility"
          ],
          "docs": [
            "Scoro project budget",
            "Ramp spend data",
            "Vendor cost estimates"
          ],
          "crossFlow": [
            {
              "label": "Flow 3",
              "target": "Project work generates costs (vendors, freelancers, Ramp, payroll)",
              "_resolvedStepId": "f3.1",
              "_resolvedStepNum": "1",
              "_resolvedStepTitle": "Vendor / freelancer required"
            }
          ],
          "risks": [
            "Actual spend in Ramp may not align with the Scoro project budget unless project coding on each transaction is accurate."
          ]
        },
        {
          "id": "f1.17",
          "num": 17,
          "phase": "review",
          "type": "process",
          "title": "Creative review in Frame.io",
          "owner": "creative",
          "ownerLabel": "Creative Team / Producer / Client",
          "automated": false,
          "systems": [
            "frame",
            "slack",
            "email"
          ],
          "action": "Assets are uploaded to Frame.io for review. Client comments and revision requests are captured; Frame.io notifications fan out to Slack and email.",
          "dataUpdated": [
            "Review comments",
            "Revision requests",
            "Version history",
            "Approval status"
          ],
          "docs": [
            "Review links",
            "Asset versions",
            "Client comments",
            "Approval record"
          ],
          "automation": "Frame.io comment/approval notifications sent via Slack and email.",
          "risks": [
            "Frame.io use may not be consistent across projects, so the canonical creative-approval record is unreliable."
          ],
          "suggestedFix": "Standardise Frame.io as the single source of truth for creative review and final asset approval on every project."
        },
        {
          "id": "f1.18",
          "num": 18,
          "phase": "scope",
          "type": "decision",
          "title": "Scope change affects cost / timeline / invoice / revenue?",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "email",
            "slack",
            "scoro",
            "drive",
            "frame"
          ],
          "action": "Any scope change, overage, additional usage or delivery change is identified and assessed for downstream impact.",
          "dataUpdated": [
            "Revised scope",
            "Revised quote",
            "Additional cost/overage",
            "Timeline change",
            "Client approval record"
          ],
          "decisionBranches": [
            {
              "label": "No",
              "target": "Log only in Scoro / Drive"
            },
            {
              "label": "Yes",
              "target": "Update quote/project, notify Finance, may trigger additional invoice"
            }
          ],
          "crossFlow": [
            {
              "label": "Flow 2",
              "target": "Triggers additional invoice if there is an overage",
              "_resolvedStepId": "f2.5",
              "_resolvedStepNum": "5",
              "_resolvedStepTitle": "Invoice created in Scoro"
            },
            {
              "label": "Flow 3",
              "target": "Affects revenue recognition and project margin",
              "_resolvedStepId": "f3.34",
              "_resolvedStepNum": "34",
              "_resolvedStepTitle": "Revenue reviewed / booked"
            }
          ],
          "risks": [
            "Scope creep if changes are approved verbally but not reflected in Scoro / invoices."
          ]
        },
        {
          "id": "f1.19",
          "num": 19,
          "phase": "review",
          "type": "outcome",
          "title": "Client approval / delivery complete",
          "owner": "client",
          "ownerLabel": "Client / Producer",
          "automated": false,
          "systems": [
            "frame",
            "email",
            "scoro"
          ],
          "action": "Final asset approval captured (Frame.io approval preferred), delivery completed and milestone marked complete in Scoro.",
          "dataUpdated": [
            "Milestone complete",
            "Project status",
            "Delivery record",
            "Approval evidence"
          ],
          "crossFlow": [
            {
              "label": "Flow 2",
              "target": "May trigger final invoice review",
              "_resolvedStepId": "f2.6",
              "_resolvedStepNum": "6",
              "_resolvedStepTitle": "Invoice QC check"
            },
            {
              "label": "Flow 3",
              "target": "May trigger revenue recognition review and project-margin reporting",
              "_resolvedStepId": "f3.34",
              "_resolvedStepNum": "34",
              "_resolvedStepTitle": "Revenue reviewed / booked"
            }
          ],
          "risks": [
            "Final approval evidence must be stored somewhere reliable, not just in email or Slack."
          ]
        }
      ]
    },
    "flow2": {
      "id": "flow2",
      "title": "Invoicing & Payments",
      "accent": "flow2",
      "phases": [
        {
          "id": "po",
          "title": "PO & Invoice Creation"
        },
        {
          "id": "approval",
          "title": "Approval & Sync"
        },
        {
          "id": "sending",
          "title": "Sending"
        },
        {
          "id": "collection",
          "title": "Collection"
        },
        {
          "id": "late",
          "title": "Late Payment Branch"
        },
        {
          "id": "recon",
          "title": "Reconciliation"
        }
      ],
      "steps": [
        {
          "id": "f2.1",
          "num": 1,
          "phase": "po",
          "type": "outcome",
          "title": "PO received from client",
          "owner": "client",
          "ownerLabel": "Producer / Client",
          "automated": false,
          "systems": [
            "email",
            "scoro",
            "drive"
          ],
          "action": "PO is received and shared with Finance. This is the trigger for invoice creation, not final client approval.",
          "docs": [
            "PO",
            "Approved quote",
            "Client onboarding details",
            "Payment terms",
            "Project scope",
            "Billing schedule"
          ],
          "dataUpdated": [
            "PO number in Scoro",
            "Billing contact",
            "Project billing details",
            "Payment terms"
          ],
          "crossFlow": [
            {
              "label": "Flow 1",
              "target": "PO received at end of Contracting in Flow 1",
              "_resolvedStepId": "f1.14",
              "_resolvedStepNum": "14",
              "_resolvedStepTitle": "PO received"
            }
          ],
          "risks": [
            "Invoice may be delayed if PO is not shared with Finance promptly."
          ],
          "pending": [
            {
              "q": "Confirm with Ami that PO receipt is always the trigger, vs project start / milestone / billing schedule.",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f2.2",
          "num": 2,
          "phase": "po",
          "type": "decision",
          "title": "Does client already exist?",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "scoro",
            "xero"
          ],
          "action": "Check whether the client already exists before creating a new record \u2014 including near-matches such as '123 reg Ltd' vs '123 Reg Limited'.",
          "decisionBranches": [
            {
              "label": "Yes",
              "target": "Update existing record"
            },
            {
              "label": "No",
              "target": "Create new record"
            }
          ],
          "risks": [
            "Duplicate client records across Scoro and Xero distort AR reporting and create reconciliation headaches."
          ]
        },
        {
          "id": "f2.3",
          "num": 3,
          "phase": "po",
          "type": "process",
          "title": "Client details updated in Scoro",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Client billing details added or updated in Scoro.",
          "dataUpdated": [
            "Billing contact",
            "Legal entity",
            "Address",
            "Tax details",
            "PO details",
            "Payment terms",
            "Finance contact"
          ]
        },
        {
          "id": "f2.4",
          "num": 4,
          "phase": "po",
          "type": "process",
          "title": "Client details updated in Xero",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Client contact created or updated in the correct Xero entity.",
          "entity": "Multi",
          "dataUpdated": [
            "Xero contact",
            "Billing email",
            "Legal name",
            "Tax details",
            "Payment terms",
            "Entity"
          ],
          "risks": [
            "Wrong client entity / account creates reporting and payment issues that surface only at month-end."
          ],
          "pending": [
            {
              "q": "What determines the invoice entity / account \u2014 is it pre-decided at quote stage or chosen by Ami at invoice time?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f2.5",
          "num": 5,
          "phase": "po",
          "type": "process",
          "title": "Invoice created in Scoro",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Invoice is created in Scoro once PO is received \u2014 this corrects the older flow where invoice creation happened after final client approval / delivery.",
          "docs": [
            "PO",
            "Approved quote",
            "Project details",
            "Payment schedule",
            "Scope summary"
          ],
          "dataUpdated": [
            "Invoice draft",
            "Invoice line items",
            "Project link",
            "Quote link",
            "PO number",
            "Accounting object (Studio / Pass-through / Usage)"
          ],
          "risks": [
            "Invoice may not reflect later scope changes unless those are tracked and communicated back to Ami."
          ],
          "pending": [
            {
              "q": "Confirm with Ami: does every invoice start in Scoro, or does she create some directly in Xero?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f2.6",
          "num": 6,
          "phase": "approval",
          "type": "process",
          "title": "Invoice QC check",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Finance checks the invoice is complete, clear and correctly described. Descriptions should be complete enough to understand context without opening supporting documents.",
          "dataUpdated": [
            "Correct client",
            "Correct entity",
            "Correct project",
            "Correct PO",
            "Correct service description",
            "Dates",
            "Project reference",
            "Payment terms",
            "Line items",
            "Accounting object"
          ],
          "risks": [
            "Poor invoice descriptions create reconciliation, revenue recognition and client dispute issues downstream."
          ]
        },
        {
          "id": "f2.7",
          "num": 7,
          "phase": "approval",
          "type": "decision",
          "title": "Producer: invoice accurate?",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "scoro",
            "email"
          ],
          "action": "Producer confirms commercial accuracy of the invoice before it is sent.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Return to Finance to amend"
            },
            {
              "label": "Yes",
              "target": "Approve for sync / send"
            }
          ],
          "risks": [
            "Without this step, wrong scope, PO, value or billing schedule can be invoiced to the client."
          ]
        },
        {
          "id": "f2.8",
          "num": 8,
          "phase": "approval",
          "type": "process",
          "title": "Invoice synced from Scoro to Xero",
          "owner": "system",
          "ownerLabel": "Finance / System",
          "automated": true,
          "systems": [
            "scoro",
            "xero"
          ],
          "action": "Invoice moves from Scoro to Xero. Sync may be native or via Zapier depending on the entity.",
          "entity": "Multi",
          "dataUpdated": [
            "Xero invoice created",
            "Draft / approved status",
            "Income in Advance / accounting object",
            "Client account"
          ],
          "automation": "Native sync or Zapier route, varying by entity.",
          "risks": [
            "Sync delays or entity-specific sync differences may cause reporting mismatch between Scoro and Xero."
          ],
          "pending": [
            {
              "q": "Which entities use native Scoro/Xero sync and which use Zapier or manual?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f2.9",
          "num": 9,
          "phase": "sending",
          "type": "process",
          "title": "Invoice sent from Xero",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Invoice emailed to the client from Xero with payment terms / T&Cs and bank details (online payment link where available).",
          "docs": [
            "Invoice",
            "Payment terms / T&Cs",
            "Bank details",
            "Online payment link (if available)"
          ],
          "dataUpdated": [
            "Invoice sent date",
            "Due date",
            "Client email record"
          ],
          "pending": [
            {
              "q": "Are invoices sent from Xero every time, or sometimes from Scoro?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f2.10",
          "num": 10,
          "phase": "sending",
          "type": "decision",
          "title": "Net30 or Due on Receipt?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Payment terms decision drives the reminder schedule.",
          "decisionBranches": [
            {
              "label": "Net30",
              "target": "Pre-due reminder applies (step 11A)"
            },
            {
              "label": "Due on Receipt",
              "target": "Immediate payment monitoring (step 11B)"
            }
          ]
        },
        {
          "id": "f2.11a",
          "num": "11A",
          "phase": "collection",
          "type": "process",
          "title": "Net30: pre-due reminder",
          "owner": "system",
          "ownerLabel": "Xero / System",
          "automated": true,
          "systems": [
            "xero"
          ],
          "action": "Xero automatically sends a reminder 1 day before the due date.",
          "dataUpdated": [
            "Reminder activity log",
            "Invoice activity history"
          ],
          "automation": "Automated by Xero invoice reminder rule."
        },
        {
          "id": "f2.11b",
          "num": "11B",
          "phase": "collection",
          "type": "process",
          "title": "Due on Receipt: immediate monitoring",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Finance monitors whether payment has been made; no pre-due reminder applies."
        },
        {
          "id": "f2.12",
          "num": 12,
          "phase": "collection",
          "type": "decision",
          "title": "Has client paid?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "bank"
          ],
          "action": "Finance checks Xero and bank feed.",
          "decisionBranches": [
            {
              "label": "Yes",
              "target": "Go to Reconciliation (step 20)"
            },
            {
              "label": "No",
              "target": "Enter Late Payment Branch (step 13)"
            }
          ]
        },
        {
          "id": "f2.13",
          "num": 13,
          "phase": "late",
          "type": "process",
          "title": "Automated overdue reminders",
          "owner": "system",
          "ownerLabel": "Xero / System",
          "automated": true,
          "systems": [
            "xero"
          ],
          "action": "Xero issues automated chasers at +7, +14, +21 and +28 days overdue.",
          "dataUpdated": [
            "Reminder activity",
            "Overdue status",
            "Client communication log"
          ],
          "automation": "Xero invoice reminder rules at +7, +14, +21, +28 days."
        },
        {
          "id": "f2.14",
          "num": 14,
          "phase": "late",
          "type": "process",
          "title": "Manual finance chaser",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "email",
            "xero"
          ],
          "action": "Ami sends a manual chaser with invoice, T&Cs, payment terms, late-fee wording and prior correspondence.",
          "docs": [
            "Invoice",
            "T&Cs",
            "Payment terms",
            "Late fee wording",
            "Prior client correspondence"
          ],
          "risks": [
            "Escalation delay weakens payment enforcement and cashflow certainty."
          ]
        },
        {
          "id": "f2.15",
          "num": 15,
          "phase": "late",
          "type": "decision",
          "title": "Client responding?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "email"
          ],
          "action": "Is the client engaging with chasers?",
          "decisionBranches": [
            {
              "label": "Yes",
              "target": "Use excuse log / template response (step 16)"
            },
            {
              "label": "No",
              "target": "Escalate further (step 17)"
            }
          ]
        },
        {
          "id": "f2.16",
          "num": 16,
          "phase": "late",
          "type": "process",
          "title": "Use excuse log / template response",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "email"
          ],
          "action": "Respond using a template based on the client's reason for delayed payment (Excuse Log).",
          "docs": [
            "T&Cs",
            "Late payment wording",
            "Usage/payment terms",
            "Invoice history",
            "Client correspondence"
          ],
          "dataUpdated": [
            "Response record",
            "Escalation notes",
            "Follow-up date"
          ]
        },
        {
          "id": "f2.17",
          "num": 17,
          "phase": "late",
          "type": "process",
          "title": "Manual finance escalation",
          "owner": "finance",
          "ownerLabel": "Ami / Finance",
          "automated": false,
          "systems": [
            "email",
            "xero",
            "slack"
          ],
          "action": "Formal escalation: reattach invoice and T&Cs, reference contractual obligations, confirm payment terms still apply, warn of late fees and delivery restrictions."
        },
        {
          "id": "f2.18",
          "num": 18,
          "phase": "late",
          "type": "process",
          "title": "Payment delinquency action",
          "owner": "leadership",
          "ownerLabel": "Finance + Producer + Leadership",
          "automated": false,
          "systems": [
            "email",
            "slack"
          ],
          "action": "Operational restrictions are considered: 10% late fee per 30-day period, suspend ongoing work, hold final delivery, restrict access to deliverables, suspend / revoke usage rights.",
          "crossFlow": [
            {
              "label": "Flow 1",
              "target": "Production paused / delivery held",
              "_resolvedStepId": "f1.15",
              "_resolvedStepNum": "15",
              "_resolvedStepTitle": "Production execution"
            }
          ],
          "risks": [
            "This is a key enforcement control point \u2014 it must be visible to producers and leadership, not just finance."
          ]
        },
        {
          "id": "f2.19",
          "num": 19,
          "phase": "late",
          "type": "process",
          "title": "Final recovery action",
          "owner": "leadership",
          "ownerLabel": "Leadership / Finance",
          "automated": false,
          "systems": [
            "email"
          ],
          "action": "Final enforcement route: invoice unauthorised usage fees, escalate debt recovery, enforce legal remedies, suspend future work with client."
        },
        {
          "id": "f2.20",
          "num": 20,
          "phase": "recon",
          "type": "process",
          "title": "Payment received",
          "owner": "client",
          "ownerLabel": "Client / Finance",
          "automated": true,
          "systems": [
            "bank",
            "xero"
          ],
          "action": "Client payment arrives; bank feed imports the transaction. Remittance advice goes to remittances@wearealongside.com.",
          "docs": [
            "Remittance advice",
            "Bank transaction",
            "Invoice reference"
          ],
          "automation": "Bank feed import into Xero."
        },
        {
          "id": "f2.21",
          "num": 21,
          "phase": "recon",
          "type": "decision",
          "title": "Finance reconciles payment \u2014 complete?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Payment matched to invoice in Xero.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Short payment follow-up"
            },
            {
              "label": "Yes",
              "target": "Mark invoice as paid (step 22)"
            }
          ]
        },
        {
          "id": "f2.22",
          "num": 22,
          "phase": "recon",
          "type": "outcome",
          "title": "Invoice marked paid in Xero & Scoro",
          "owner": "system",
          "ownerLabel": "Finance / System",
          "automated": true,
          "systems": [
            "xero",
            "scoro"
          ],
          "action": "Invoice updated to paid; status syncs Xero \u2192 Scoro.",
          "dataUpdated": [
            "Xero paid status",
            "Scoro invoice status",
            "AR report",
            "Cash reporting",
            "Client account status"
          ],
          "automation": "Xero \u2194 Scoro integration marks invoice as paid once payment is received.",
          "crossFlow": [
            {
              "label": "Flow 3",
              "target": "Paid status feeds month-end close, revenue recognition and reporting",
              "_resolvedStepId": "f3.26",
              "_resolvedStepNum": "26",
              "_resolvedStepTitle": "Start month-end close"
            }
          ]
        }
      ]
    },
    "flow3": {
      "id": "flow3",
      "title": "Costs, Accounting & Reporting",
      "accent": "flow3",
      "phases": [
        {
          "id": "vendor-on",
          "title": "Vendor Onboarding"
        },
        {
          "id": "vendor-inv",
          "title": "Vendor Invoices"
        },
        {
          "id": "expenses",
          "title": "Employee Expenses"
        },
        {
          "id": "payroll",
          "title": "Payroll"
        },
        {
          "id": "close",
          "title": "Month-end Close"
        },
        {
          "id": "revenue",
          "title": "Revenue Recognition"
        },
        {
          "id": "inter",
          "title": "Intercompany"
        },
        {
          "id": "reporting",
          "title": "Reporting"
        }
      ],
      "steps": [
        {
          "id": "f3.1",
          "num": 1,
          "phase": "vendor-on",
          "type": "process",
          "title": "Vendor / freelancer required",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "scoro",
            "slack"
          ],
          "action": "Producer identifies need for a vendor or freelancer for the project.",
          "dataUpdated": [
            "Project budget",
            "Expected vendor cost",
            "Resource plan",
            "Scope assumptions"
          ],
          "crossFlow": [
            {
              "label": "Flow 1",
              "target": "Comes from quote / project planning or scope change",
              "_resolvedStepId": "f1.6",
              "_resolvedStepNum": "6",
              "_resolvedStepTitle": "Quote / bid built"
            }
          ],
          "risks": [
            "Vendor costs may not be captured in the project budget if not added at planning stage."
          ]
        },
        {
          "id": "f3.2",
          "num": 2,
          "phase": "vendor-on",
          "type": "process",
          "title": "Vendor onboarding form sent",
          "owner": "mixed",
          "ownerLabel": "Producer / Finance",
          "automated": false,
          "systems": [
            "email",
            "scoro"
          ],
          "action": "Vendor receives onboarding form and required documents (payment terms, NDA / T&Cs, invoice requirements, correct billing entity / address)."
        },
        {
          "id": "f3.3",
          "num": 3,
          "phase": "vendor-on",
          "type": "process",
          "title": "Vendor details received",
          "owner": "vendor",
          "ownerLabel": "Vendor / Finance",
          "automated": false,
          "systems": [
            "email",
            "drive"
          ],
          "action": "Vendor submits payment / tax details: bank details, tax form, signed NDA/T&Cs, invoice contact, company / legal name."
        },
        {
          "id": "f3.4",
          "num": 4,
          "phase": "vendor-on",
          "type": "process",
          "title": "Vendor created in Scoro",
          "owner": "finance",
          "ownerLabel": "Finance / Ops",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Vendor record created for operational / project tracking.",
          "dataUpdated": [
            "Vendor name",
            "Contact details",
            "Project association",
            "Operational contact"
          ],
          "risks": [
            "Manual setup can create duplicates or missing records."
          ]
        },
        {
          "id": "f3.5",
          "num": 5,
          "phase": "vendor-on",
          "type": "process",
          "title": "Vendor created in Xero",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Vendor contact created in Xero for payment / accounting.",
          "entity": "Multi",
          "dataUpdated": [
            "Vendor contact",
            "Payment details",
            "Tax details",
            "Default account",
            "Entity"
          ],
          "risks": [
            "Scoro and Xero vendor records may not match \u2014 driving reconciliation issues and incorrect project costing."
          ],
          "suggestedFix": "Define a vendor-creation checklist where Scoro is created first and Xero is created from the same source data; cross-check vendor IDs monthly."
        },
        {
          "id": "f3.6",
          "num": 6,
          "phase": "vendor-inv",
          "type": "process",
          "title": "Vendor invoice received",
          "owner": "vendor",
          "ownerLabel": "Vendor / Finance",
          "automated": false,
          "systems": [
            "email"
          ],
          "action": "Vendor / freelancer invoice received via email (Ami inbox / billing inbox).",
          "docs": [
            "Invoice",
            "Supporting receipts",
            "PO / project reference",
            "Job name"
          ],
          "pending": [
            {
              "q": "Which inbox should receive freelancer / vendor invoices once Ami leaves?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f3.7",
          "num": 7,
          "phase": "vendor-inv",
          "type": "decision",
          "title": "Vendor invoice complete?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "email",
            "scoro",
            "xero"
          ],
          "action": "Check correct entity / address, dates match, job name and PO included, amount matches scope, payment terms and VAT/tax correct.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Return to vendor for correction"
            },
            {
              "label": "Yes",
              "target": "Continue (step 8)"
            }
          ]
        },
        {
          "id": "f3.8",
          "num": 8,
          "phase": "vendor-inv",
          "type": "decision",
          "title": "Producer / project approval?",
          "owner": "producer",
          "ownerLabel": "Producer",
          "automated": false,
          "systems": [
            "scoro",
            "email"
          ],
          "action": "Producer confirms invoice relates to approved work / scope.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Query with vendor"
            },
            {
              "label": "Yes",
              "target": "Process bill (step 9)"
            }
          ],
          "risks": [
            "Bills may be paid without the project owner confirming the work / scope."
          ]
        },
        {
          "id": "f3.9",
          "num": 9,
          "phase": "vendor-inv",
          "type": "process",
          "title": "Bill entered via Hubdoc or Ramp Bill Pay",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "hubdoc",
            "ramp",
            "scoro",
            "xero"
          ],
          "action": "Two possible routes: (A) Hubdoc extracts invoice data and pushes the bill to Xero; (B) Ramp Bill Pay routes the bill for approval and syncs to Xero after payment.",
          "risks": [
            "Ambiguity over which route to use creates inconsistent practice and reconciliation gaps."
          ],
          "pending": [
            {
              "q": "When does Ami use Hubdoc vs Ramp Bill Pay vs Xero direct?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ],
          "suggestedFix": "Define a routing rule (e.g. card-paid vendors via Ramp; bank-paid vendors via Hubdoc) and document it next to the vendor record."
        },
        {
          "id": "f3.10",
          "num": 10,
          "phase": "vendor-inv",
          "type": "process",
          "title": "Bill reviewed in Xero / Ramp",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "ramp"
          ],
          "action": "Check bill coding before payment / sync is finalised \u2014 supplier, amount, due date, account code, project reference, entity, VAT/tax code, tracking category.",
          "risks": [
            "Hubdoc / Ramp extraction or coding may be incorrect and needs finance review."
          ]
        },
        {
          "id": "f3.11",
          "num": 11,
          "phase": "vendor-inv",
          "type": "process",
          "title": "Bill approved and scheduled for payment",
          "owner": "finance",
          "ownerLabel": "Finance / Katie / Sara",
          "automated": false,
          "systems": [
            "xero",
            "ramp",
            "bank"
          ],
          "action": "Payment is scheduled or made via Xero, Ramp or bank.",
          "dataUpdated": [
            "Bill status",
            "Planned payment date",
            "Payment reference",
            "Approval record"
          ]
        },
        {
          "id": "f3.12",
          "num": 12,
          "phase": "vendor-inv",
          "type": "outcome",
          "title": "Bill marked paid / reconciled",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "ramp"
          ],
          "action": "Payment matched to bill in Xero / Ramp; reconciliation complete.",
          "dataUpdated": [
            "AP status",
            "Bank reconciliation",
            "Project cost reporting",
            "Vendor account status"
          ]
        },
        {
          "id": "f3.13",
          "num": 13,
          "phase": "expenses",
          "type": "process",
          "title": "Employee makes purchase",
          "owner": "employee",
          "ownerLabel": "Employee",
          "automated": true,
          "systems": [
            "ramp",
            "brex"
          ],
          "action": "Business purchase made on Ramp corporate card (or Brex where still active). Amount, vendor, date, cardholder, entity and location captured automatically.",
          "entity": "Multi",
          "automation": "Ramp captures transaction in real-time.",
          "pending": [
            {
              "q": "Is Ramp replacing Brex, running alongside, US-only or multi-entity?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f3.14",
          "num": 14,
          "phase": "expenses",
          "type": "process",
          "title": "Receipt and memo submitted",
          "owner": "employee",
          "ownerLabel": "Employee",
          "automated": false,
          "systems": [
            "ramp"
          ],
          "action": "Employee submits receipt and business memo via Ramp mobile app, email forwarding (receipts@ramp.com), SMS reply, web dashboard or Gmail / Outlook integration. Project reference required if production-related.",
          "risks": [
            "Missing receipts or vague memos delay close and create audit issues."
          ]
        },
        {
          "id": "f3.15",
          "num": 15,
          "phase": "expenses",
          "type": "process",
          "title": "Ramp status check",
          "owner": "system",
          "ownerLabel": "Ramp / Finance",
          "automated": true,
          "systems": [
            "ramp"
          ],
          "action": "Ramp shows transaction status: Needs Receipt \u00b7 Needs Review \u00b7 Coding Required \u00b7 Ready to Sync \u00b7 Synced \u00b7 Sync Error.",
          "automation": "Ramp updates status automatically as fields are completed."
        },
        {
          "id": "f3.16",
          "num": 16,
          "phase": "expenses",
          "type": "process",
          "title": "Manager approval",
          "owner": "leadership",
          "ownerLabel": "Manager",
          "automated": false,
          "systems": [
            "ramp"
          ],
          "action": "Manager checks: receipt complete, memo clear, business purpose reasonable, within policy / budget, project / team correct."
        },
        {
          "id": "f3.17",
          "num": 17,
          "phase": "expenses",
          "type": "decision",
          "title": "Expense fully coded?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "ramp"
          ],
          "action": "Finance reviews coding: GL code, tracking category, entity, project (if applicable), tax code.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Correct / chase missing info"
            },
            {
              "label": "Yes",
              "target": "Ready to sync"
            }
          ],
          "risks": [
            "Brex/Ramp expenses are not always properly coded to the relevant projects in Scoro."
          ]
        },
        {
          "id": "f3.18",
          "num": 18,
          "phase": "expenses",
          "type": "process",
          "title": "Sync to Xero",
          "owner": "system",
          "ownerLabel": "Ramp / Finance",
          "automated": true,
          "systems": [
            "ramp",
            "xero"
          ],
          "action": "Approved and coded transactions pushed to Xero \u2014 automatically or in batch \u2014 with account code, tracking category, tax code and entity ledger pre-populated.",
          "entity": "Multi",
          "automation": "Ramp \u2192 Xero sync (per-entity integration).",
          "risks": [
            "Wrong coding affects project margin and entity P&L; sync errors may go unnoticed without active checking."
          ]
        },
        {
          "id": "f3.19",
          "num": 19,
          "phase": "expenses",
          "type": "process",
          "title": "Sync validation / error resolution",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "ramp",
            "xero"
          ],
          "action": "Finance fixes broken GL mapping, renamed or deleted Xero accounts, changed tracking categories, chart of accounts changes \u2014 then re-syncs.",
          "risks": [
            "Sync errors silently break P&L if not actively monitored."
          ]
        },
        {
          "id": "f3.20",
          "num": 20,
          "phase": "expenses",
          "type": "process",
          "title": "Missing receipt chase",
          "owner": "finance",
          "ownerLabel": "Finance / Manager",
          "automated": true,
          "systems": [
            "ramp",
            "slack",
            "email"
          ],
          "action": "Ramp sends automated reminders for missing receipts; managers monitor outstanding items.",
          "automation": "Ramp reminder emails / mobile push.",
          "risks": [
            "Persistent missing receipts delay month-end close."
          ]
        },
        {
          "id": "f3.21",
          "num": 21,
          "phase": "payroll",
          "type": "process",
          "title": "Payroll run in Rippling",
          "owner": "finance",
          "ownerLabel": "Finance / Payroll owner",
          "automated": false,
          "systems": [
            "rippling"
          ],
          "action": "Payroll processed \u2014 US bi-weekly, UK monthly, contractors monthly. Pay, taxes, deductions and employer costs calculated.",
          "entity": "Multi",
          "dataUpdated": [
            "Pay",
            "Taxes",
            "Deductions",
            "Employer costs"
          ]
        },
        {
          "id": "f3.22",
          "num": 22,
          "phase": "payroll",
          "type": "process",
          "title": "Payroll reviewed before approval",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "rippling"
          ],
          "action": "Check earnings / deductions / tax figures / funding bank account (Chase AGI 1383 for US, Wise AGL GBP for UK).",
          "docs": [
            "Payroll draft",
            "Earnings report",
            "Deductions report",
            "Net pay report",
            "Funding bank account"
          ]
        },
        {
          "id": "f3.23",
          "num": 23,
          "phase": "payroll",
          "type": "process",
          "title": "Payroll sync checked in Xero",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": true,
          "systems": [
            "rippling",
            "xero"
          ],
          "action": "After payroll is approved / funded, confirm the Rippling \u2192 Xero bill sync completed successfully; manually sync if needed.",
          "automation": "Rippling \u2192 Xero auto-sync on successful pay run.",
          "risks": [
            "Payroll cost may be missing or incorrectly mapped if sync fails silently."
          ]
        },
        {
          "id": "f3.24",
          "num": 24,
          "phase": "payroll",
          "type": "process",
          "title": "Payroll coding reviewed",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "rippling"
          ],
          "action": "Check correct P&L account: Direct Wages (production), Wages & Salaries (non-production / admin / finance / IT / BizOps), Internal Contractors (non-salaried)."
        },
        {
          "id": "f3.25",
          "num": 25,
          "phase": "payroll",
          "type": "process",
          "title": "UK pension upload",
          "owner": "finance",
          "ownerLabel": "Finance / Ops",
          "automated": false,
          "systems": [
            "pension"
          ],
          "entity": "AGL \u00b7 GBP",
          "action": "Monthly UK pension contributions uploaded manually to People's Pension. Not integrated with Rippling.",
          "risks": [
            "People's Pension upload may be missed because it sits outside the Rippling flow."
          ],
          "suggestedFix": "Add People's Pension upload to the month-end close checklist with a hard deadline and owner."
        },
        {
          "id": "f3.26",
          "num": 26,
          "phase": "close",
          "type": "process",
          "title": "Start month-end close",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "scoro",
            "joiin",
            "mayday",
            "rippling",
            "ramp",
            "hubdoc"
          ],
          "action": "Finance begins the month-end checklist across every entity.",
          "docs": [
            "Xero transactions",
            "Draft bills",
            "Unpaid bills",
            "Invoice list",
            "Ramp transactions and statement",
            "IT expenses list",
            "Payroll reports",
            "Scoro revenue / project data",
            "Joiin consolidated reports"
          ]
        },
        {
          "id": "f3.27",
          "num": 27,
          "phase": "close",
          "type": "process",
          "title": "Bank transactions categorised",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "All transactions categorised across all entities and bank accounts. Unknowns escalated to Katie or Sara.",
          "entity": "Multi"
        },
        {
          "id": "f3.28",
          "num": 28,
          "phase": "close",
          "type": "process",
          "title": "Ramp month-end reconciliation",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "ramp",
            "xero"
          ],
          "action": "Ensure Ramp and Xero are fully aligned: all receipts attached, memos complete, Needs Review and Coding Required cleared, final sync run, Ramp statement downloaded, Ramp account reconciled, closing balances match, entity-level spend reports run.",
          "risks": [
            "Un-synced Ramp transactions make P&L and spend reporting incomplete."
          ]
        },
        {
          "id": "f3.29",
          "num": 29,
          "phase": "close",
          "type": "process",
          "title": "Bills reviewed",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "hubdoc",
            "scoro",
            "ramp"
          ],
          "action": "All bills reviewed: draft bills addressed, no overdue unpaid bills, receipts attached, VAT applied correctly, project bills approved, Ramp Bill Pay items synced.",
          "risks": [
            "Bill updates should happen in Scoro first, then sync to Xero \u2014 reversing the order creates mismatches."
          ]
        },
        {
          "id": "f3.30",
          "num": 30,
          "phase": "close",
          "type": "process",
          "title": "Invoices reviewed",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "scoro",
            "xero"
          ],
          "action": "Check unsent / draft invoices. If invoice dated in the current month but not sent, move issue date to next month. Updates made in Scoro first, then sync to Xero."
        },
        {
          "id": "f3.31",
          "num": 31,
          "phase": "close",
          "type": "process",
          "title": "IT expenses checked",
          "owner": "finance",
          "ownerLabel": "Finance / Jay if needed",
          "automated": false,
          "systems": [
            "xero",
            "ramp"
          ],
          "action": "Confirm monthly / annual IT subscriptions are recorded or accrued \u2014 compare against the IT software list and Ramp vendor spend.",
          "risks": [
            "New subscriptions or prepaid costs may be missed or misclassified."
          ]
        },
        {
          "id": "f3.32",
          "num": 32,
          "phase": "close",
          "type": "process",
          "title": "Payroll costs checked",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "rippling"
          ],
          "action": "Ensure payroll bills are booked and mapped correctly to Direct Wages / Wages & Salaries / Internal Contractors."
        },
        {
          "id": "f3.33",
          "num": 33,
          "phase": "close",
          "type": "process",
          "title": "Depreciation booked",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Run or post depreciation entries (fixed assets module or manual journal)."
        },
        {
          "id": "f3.34",
          "num": 34,
          "phase": "close",
          "type": "process",
          "title": "Revenue reviewed / booked",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "scoro",
            "xero"
          ],
          "action": "Book revenue to correct entity and revenue account using Scoro project / entity data and the revenue recognition spreadsheet.",
          "entity": "Multi"
        },
        {
          "id": "f3.35",
          "num": 35,
          "phase": "close",
          "type": "process",
          "title": "P&L review",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "joiin",
            "sheets"
          ],
          "action": "Review each entity line by line: anomalies, missing expenses, duplicate costs, accruals, unusual variances, project cost accuracy, Ramp spend completeness. Prepare explanations for anomalies."
        },
        {
          "id": "f3.36",
          "num": 36,
          "phase": "close",
          "type": "decision",
          "title": "Sara: approved to run Mayday recharges?",
          "owner": "leadership",
          "ownerLabel": "Sara / Finance",
          "automated": false,
          "systems": [
            "xero",
            "joiin",
            "sheets"
          ],
          "action": "Sara reviews accounts before intercompany recharges.",
          "decisionBranches": [
            {
              "label": "No",
              "target": "Correct accounts"
            },
            {
              "label": "Yes",
              "target": "Run Mayday process (step 41)"
            }
          ]
        },
        {
          "id": "f3.37",
          "num": 37,
          "phase": "revenue",
          "type": "process",
          "title": "Pull invoice / accounting object report",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Pull Scoro report: Invoices / All YTD by Accounting Object \u2014 issued date current month, grouped by project, subgrouped by accounting object.",
          "docs": [
            "Invoices / All YTD by Accounting Object",
            "Revenue recognition spreadsheet",
            "Project entity details"
          ]
        },
        {
          "id": "f3.38",
          "num": 38,
          "phase": "revenue",
          "type": "process",
          "title": "Calculate revenue allocation",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "sheets",
            "scoro"
          ],
          "action": "Invoice lines book to Income in Advance first. Allocate revenue across Studio (studio work + overages), Pass-through (live action shoots), Usage (talent usage) using the accounting object percentages.",
          "dataUpdated": [
            "Studio %",
            "Pass-through %",
            "Usage %",
            "Income in Advance balance"
          ]
        },
        {
          "id": "f3.39",
          "num": 39,
          "phase": "revenue",
          "type": "process",
          "title": "Check project entity",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "scoro"
          ],
          "action": "Confirm correct entity / studio for each project via Scoro Details tab. Projects sit in SBI, BPI, HND, SBL or other entities \u2014 entity choice drives the Xero revenue journal.",
          "entity": "Multi"
        },
        {
          "id": "f3.40",
          "num": 40,
          "phase": "revenue",
          "type": "process",
          "title": "Book revenue journal in Xero",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero"
          ],
          "action": "Post revenue entry to correct entity / account: Income in Advance \u2192 Studio revenue / Usage revenue / Pass-through revenue. FX conversion applied for UK entities.",
          "entity": "Multi",
          "dataUpdated": [
            "Income in Advance",
            "Studio revenue",
            "Usage revenue",
            "Pass-through revenue",
            "FX conversion (UK)"
          ],
          "risks": [
            "Wrong entity or allocation affects revenue reporting at consolidation."
          ]
        },
        {
          "id": "f3.41",
          "num": 41,
          "phase": "inter",
          "type": "process",
          "title": "Open Mayday via Xero",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "mayday"
          ],
          "action": "Access Mayday from Xero apps to manage monthly intercompany transactions and recharges."
        },
        {
          "id": "f3.42",
          "num": 42,
          "phase": "inter",
          "type": "decision",
          "title": "Mayday Balancer: discrepancies?",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "mayday"
          ],
          "action": "Review Balancer dashboard. Discrepancies over  $1,000 highlighted red.",
          "decisionBranches": [
            {
              "label": "Yes",
              "target": "Investigate (step 43)"
            },
            {
              "label": "No",
              "target": "Run recharges (step 44)"
            }
          ]
        },
        {
          "id": "f3.43",
          "num": 43,
          "phase": "inter",
          "type": "process",
          "title": "Resolve discrepancies in Xero",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "mayday"
          ],
          "action": "Investigate FX differences, missing transactions or unreconciled intercompany items.",
          "entity": "Multi"
        },
        {
          "id": "f3.44",
          "num": 44,
          "phase": "inter",
          "type": "process",
          "title": "Run Mayday recharges",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": true,
          "systems": [
            "mayday"
          ],
          "action": "Generate recharge calculations \u2014 intercompany invoices and bills.",
          "automation": "Mayday generates recharge calculations based on expense rules.",
          "pending": [
            {
              "q": "Are intercompany allocations monthly (current) or moving to quarterly?",
              "source": "Master brief \u2014 Mayday open decision"
            }
          ]
        },
        {
          "id": "f3.45",
          "num": 45,
          "phase": "inter",
          "type": "process",
          "title": "Post intercompany invoices / bills",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "mayday",
            "xero"
          ],
          "action": "Post recharge entries to Xero. Check date and payment account before posting. Do not mark postings as final until checked.",
          "entity": "Multi"
        },
        {
          "id": "f3.46",
          "num": 46,
          "phase": "inter",
          "type": "process",
          "title": "Validate recharges in Xero / Joiin",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "xero",
            "joiin"
          ],
          "action": "Confirm all intercompany invoices / bills are posted and marked paid, and P&L looks reasonable across entities."
        },
        {
          "id": "f3.47",
          "num": 47,
          "phase": "reporting",
          "type": "process",
          "title": "Consolidated reporting prepared",
          "owner": "finance",
          "ownerLabel": "Finance",
          "automated": false,
          "systems": [
            "joiin",
            "fathom",
            "syft",
            "xero",
            "tiller",
            "ramp",
            "scoro"
          ],
          "action": "Pull P&L, AR/AP, cashflow, project revenue / profitability, consolidated entity reports, Ramp spend reports, department / entity spend.",
          "risks": [
            "Reporting is fragmented across many tools \u2014 manual consolidation is required and creates room for error."
          ],
          "suggestedFix": "Define which tool owns each metric (e.g. Joiin = consolidated P&L; Tiller = cashflow; Ramp = entity spend) so the manual consolidation step shrinks."
        },
        {
          "id": "f3.48",
          "num": 48,
          "phase": "reporting",
          "type": "process",
          "title": "Weekly finance snapshot \u2014 external accountant",
          "owner": "external",
          "ownerLabel": "External Accountant (Brooke) / Finance / Sara / Glen",
          "automated": false,
          "systems": [
            "joiin",
            "xero",
            "tiller",
            "fathom",
            "syft",
            "ramp",
            "sheets"
          ],
          "action": "Weekly Finance Snapshot pack prepared (typically by external accountant Brooke) covering revenue vs target by studio, AR/AP, cash position, draft invoices, bills due, and projected revenue recognition. Sent to Glen, Sara and finance team.",
          "docs": [
            "Revenue Report (target / invoiced / draft / revenue recognition)",
            "AR Aging",
            "AP Aging",
            "Cash Balance",
            "Current Month Invoices",
            "Current Month Revenue"
          ],
          "risks": [
            "External-accountant dependency for leadership reporting; data sourcing and definitions sit partly outside the internal team."
          ],
          "pending": [
            {
              "q": "Which data sources feed Brooke's weekly snapshot, and where are the final versions stored?",
              "source": "Master brief \u2014 questions to validate with Ami"
            }
          ]
        },
        {
          "id": "f3.49",
          "num": 49,
          "phase": "reporting",
          "type": "outcome",
          "title": "Leadership review",
          "owner": "leadership",
          "ownerLabel": "Glen / Sara / Finance",
          "automated": false,
          "systems": [
            "sheets"
          ],
          "action": "Leadership reviews the financial position. Outputs: decisions, follow-ups, cashflow actions, project margin concerns, overdue client escalation, spend control actions, process improvement actions.",
          "crossFlow": [
            {
              "label": "Flow 1",
              "target": "Late-payment / margin issues feed back into delivery decisions",
              "_resolvedStepId": "f1.15",
              "_resolvedStepNum": "15",
              "_resolvedStepTitle": "Production execution"
            }
          ]
        }
      ]
    }
  }
};
