// ─────────────────────────────────────────────────────────────────────────────
// Alongside Finance Process Navigator — TypeScript Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type FlowId = 'flow1' | 'flow2' | 'flow3';
export type StepType = 'process' | 'decision' | 'outcome';
export type OwnerKey =
  | 'sales'
  | 'producer'
  | 'creative'
  | 'finance'
  | 'leadership'
  | 'system'
  | 'client'
  | 'employee'
  | 'vendor'
  | 'external'
  | 'mixed';

export type SystemKey =
  | 'scoro'
  | 'xero'
  | 'ramp'
  | 'brex'
  | 'hubdoc'
  | 'mayday'
  | 'rippling'
  | 'joiin'
  | 'fathom'
  | 'syft'
  | 'tiller'
  | 'frame'
  | 'slack'
  | 'drive'
  | 'email'
  | 'bank'
  | 'pension'
  | 'sheets';

export interface Entity {
  code: string;
  name: string;
  currency: 'USD' | 'GBP';
  region: 'US' | 'UK';
  role: string;
  active: boolean | 'pending';
}

export interface FlowMeta {
  lastUpdated: string;
  entities: Entity[];
}

export interface CrossFlowRef {
  label: string;
  target: string;
  _resolvedStepId?: string;
  _resolvedStepNum?: string | number;
  _resolvedStepTitle?: string;
}

export interface PendingItem {
  q: string;
  source: string;
}

export interface DecisionBranch {
  label: string;
  target: string;
}

export interface Step {
  id: string;
  num: number | string;
  phase: string;
  type: StepType;
  title: string;
  owner: OwnerKey;
  ownerLabel: string;
  automated: boolean;
  systems: SystemKey[];
  entity?: string;
  action: string;
  dataUpdated?: string[];
  docs?: string[];
  automation?: string;
  risks?: string[];
  suggestedFix?: string;
  crossFlow?: CrossFlowRef[];
  pending?: PendingItem[];
  decisionBranches?: DecisionBranch[];
}

export interface Phase {
  id: string;
  title: string;
}

export interface Flow {
  id: FlowId;
  title: string;
  accent: string;
  phases: Phase[];
  steps: Step[];
}

export interface FlowData {
  meta: FlowMeta;
  flows: {
    flow1: Flow;
    flow2: Flow;
    flow3: Flow;
  };
}

export interface ChangeLogEntry {
  timestamp: string;
  flowId: FlowId;
  stepId: string;
  stepTitle: string;
  before: Partial<Step>;
  after: Partial<Step>;
  reason: string;
}

export interface NavigatorState {
  flowData: FlowData;
  changeLog: ChangeLogEntry[];
  bakedAt: string;
  bakedNote: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Owner colour palette — lock these values; they must match navigator.css
// ─────────────────────────────────────────────────────────────────────────────
export const OWNER_COLORS: Record<OwnerKey, string> = {
  sales:      '#6366f1', // indigo  — Sales / Jen / Glen
  producer:   '#0ea5e9', // sky     — Producer
  creative:   '#a855f7', // purple  — Creative Team
  finance:    '#0f766e', // teal    — Finance / Ami
  leadership: '#f59e0b', // amber   — Leadership / Sara
  system:     '#64748b', // slate   — System / Automation
  client:     '#ec4899', // pink    — Client
  external:   '#dc2626', // red     — External Accountant (Brooke)
  employee:   '#84cc16', // lime    — Employee
  vendor:     '#f97316', // orange  — Vendor / Freelancer
  mixed:      '#94a3b8', // muted   — Mixed / shared ownership
};

// ─────────────────────────────────────────────────────────────────────────────
// Software badge config
// ─────────────────────────────────────────────────────────────────────────────
export const SYSTEM_BADGES: Record<SystemKey, { abbr: string; label: string; color: string }> = {
  scoro:    { abbr: 'S',  label: 'Scoro',        color: '#6d28d9' },
  xero:     { abbr: 'X',  label: 'Xero',         color: '#1d4ed8' },
  ramp:     { abbr: 'R',  label: 'Ramp',         color: '#15803d' },
  brex:     { abbr: 'Br', label: 'Brex',         color: '#7c3aed' },
  hubdoc:   { abbr: 'H',  label: 'Hubdoc',       color: '#0369a1' },
  mayday:   { abbr: 'M',  label: 'Mayday',       color: '#b45309' },
  rippling: { abbr: 'Rp', label: 'Rippling',     color: '#be123c' },
  joiin:    { abbr: 'J',  label: 'Joiin',        color: '#0e7490' },
  fathom:   { abbr: 'Fa', label: 'Fathom',       color: '#4338ca' },
  syft:     { abbr: 'Sy', label: 'Syft',         color: '#0891b2' },
  tiller:   { abbr: 'T',  label: 'Tiller',       color: '#065f46' },
  frame:    { abbr: 'Fr', label: 'Frame.io',     color: '#1e293b' },
  slack:    { abbr: 'Sl', label: 'Slack',        color: '#7c2d12' },
  drive:    { abbr: 'D',  label: 'Google Drive', color: '#15803d' },
  email:    { abbr: 'E',  label: 'Email',        color: '#475569' },
  bank:     { abbr: 'Bk', label: 'Bank',         color: '#1d4ed8' },
  pension:  { abbr: 'P',  label: 'Pension',      color: '#7e22ce' },
  sheets:   { abbr: 'Gs', label: 'Google Sheets',color: '#166534' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Flow accent colours
// ─────────────────────────────────────────────────────────────────────────────
export const FLOW_ACCENTS: Record<FlowId, string> = {
  flow1: '#6366f1', // indigo
  flow2: '#db2777', // rose
  flow3: '#0f766e', // teal
};

export const FLOW_TITLES: Record<FlowId, string> = {
  flow1: 'Production & Project Delivery',
  flow2: 'Invoicing & Payments',
  flow3: 'Costs, Accounting & Reporting',
};
