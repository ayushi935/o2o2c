import { useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Archive,
  BadgeCheck,
  Bell,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Database,
  FileCheck2,
  FileText,
  Filter,
  Gauge,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Menu,
  Milestone,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  Users,
  XCircle,
} from 'lucide-react';

/*
  ConveGenius O2O to O2C Portal Prototype
  ------------------------------------------------------------
  This is a complete runnable UI prototype. It uses mock data only.
  Backend integration TODOs are intentionally marked in comments.

  Source-rule guardrails implemented in UI logic:
  - O2C starts only after signed MOU upload.
  - CFO sign-off blocks bid submission.
  - Won requires Award Communication evidence.
  - Orders Won is evidence-backed, not column-position based.
  - Revenue Capture Pod remains accountable until 100 percent collection.
*/

type PageId =
  | 'home'
  | 'o2o'
  | 'o2c'
  | 'pab'
  | 'finance'
  | 'capacity'
  | 'audit'
  | 'admin';

type Status =
  | 'Draft'
  | 'Active'
  | 'Awaiting Pre-Bid PAB'
  | 'Pre-Bid PAB Approved'
  | 'Conditional Go'
  | 'On Hold'
  | 'No-Go'
  | 'Awaiting Financial Approval'
  | 'Financially Approved'
  | 'Bid Submitted'
  | 'Won'
  | 'Lost'
  | 'No-Bid'
  | 'Dropped'
  | 'MOU Pending'
  | 'MOU Signed'
  | 'In O2C'
  | 'Collection Delayed'
  | 'Collection Complete'
  | 'Archived'
  | 'Soft Deleted';

type CapacityState = 'Available' | 'Committed' | 'Constrained';

type O2OStageId =
  | 'registration'
  | 'proposal'
  | 'preBidPab'
  | 'finance'
  | 'rfp'
  | 'postBidPab'
  | 'mou'
  | 'o2c';

type Opportunity = {
  id: string;
  name: string;
  customer: string;
  geography: string;
  products: string[];
  value: number;
  stage: O2OStageId;
  status: Status;
  owner: string;
  rcPod: string;
  sponsor: string;
  businessLead: string;
  giLead: string;
  daysInStage: number;
  evidenceHealth: number;
  nextAction: string;
  blocker: string;
  capacity: CapacityState;
  cm2Baseline: number;
  hasAwardArtifact: boolean;
  hasCfoSignoff: boolean;
  hasSignedMou: boolean;
};

type MilestoneRow = {
  name: string;
  amount: number;
  due: string;
  proof: 'Not Started' | 'Pending' | 'Submitted' | 'Verified';
  invoice: 'Blocked' | 'Pending' | 'Raised';
  collection: 'Not Due' | 'Partial' | 'Received' | 'Overdue';
};

type O2CProject = {
  id: string;
  name: string;
  customer: string;
  contractValue: number;
  collected: number;
  rcPod: string;
  sponsor: string;
  financeOwner: string;
  status: Status;
  cm2Baseline: number;
  cm2Actual: number;
  scopeChangeCount: number;
  milestones: MilestoneRow[];
};

type PabMeeting = {
  id: string;
  type: 'Pre-Bid' | 'Post-Bid' | 'Mid-Project' | 'Post-Project';
  linkedRecord: string;
  convener: string;
  mandatoryParticipants: string[];
  optionalParticipants: string[];
  status: 'Requested' | 'Scheduled' | 'Held' | 'Decision Pending' | 'Due';
  decision: 'Pending' | 'Go' | 'Conditional Go' | 'Hold' | 'No-Go' | 'Proceed to MOU' | 'Realign commitments';
  due: string;
  trigger: string;
};

type AuditEvent = {
  time: string;
  user: string;
  event: string;
  entity: string;
  details: string;
};

type RoleRow = {
  role: string;
  modelRole: string;
  keyViews: string;
  keyActions: string;
  restrictedActions: string;
};

type CapacitySignal = {
  pod: string;
  sponsor: string;
  state: CapacityState;
  updated: string;
  risk: 'Low' | 'Medium' | 'High';
  note: string;
};

type NavItem = {
  id: PageId;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Executive Home', icon: LayoutDashboard },
  { id: 'o2o', label: 'O2O Pipeline', icon: Briefcase },
  { id: 'o2c', label: 'O2C Projects', icon: Milestone },
  { id: 'pab', label: 'PAB Governance', icon: ClipboardCheck },
  { id: 'finance', label: 'Finance and CM2', icon: CircleDollarSign },
  { id: 'capacity', label: 'Pod Capacity', icon: Gauge },
  { id: 'audit', label: 'Audit Log', icon: Database },
  { id: 'admin', label: 'Admin and RBAC', icon: Settings },
];

const o2oStages: Array<{ id: O2OStageId; label: string; short: string; probability: number }> = [
  { id: 'registration', label: 'Opportunity Registration', short: 'Registration', probability: 0.2 },
  { id: 'proposal', label: 'Proposal Stage', short: 'Proposal', probability: 0.35 },
  { id: 'preBidPab', label: 'Pre-Bid PAB', short: 'Pre-Bid PAB', probability: 0.5 },
  { id: 'finance', label: 'Financial Approval Gate', short: 'Finance Gate', probability: 0.6 },
  { id: 'rfp', label: 'RFP and Bid Management', short: 'RFP and Bid', probability: 0.75 },
  { id: 'postBidPab', label: 'Post-Bid PAB', short: 'Post-Bid PAB', probability: 0.85 },
  { id: 'mou', label: 'MOU Stage', short: 'MOU', probability: 0.95 },
  { id: 'o2c', label: 'O2C Transition', short: 'O2C', probability: 1 },
];

const terminalStatuses: Status[] = ['Lost', 'No-Bid', 'Dropped', 'Archived', 'Soft Deleted', 'No-Go'];

const statusStyles: Record<Status, string> = {
  Draft: 'bg-slate-50 text-slate-600 border-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Awaiting Pre-Bid PAB': 'bg-amber-50 text-amber-700 border-amber-200',
  'Pre-Bid PAB Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Conditional Go': 'bg-purple-50 text-purple-700 border-purple-200',
  'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
  'No-Go': 'bg-red-50 text-red-700 border-red-200',
  'Awaiting Financial Approval': 'bg-amber-50 text-amber-700 border-amber-200',
  'Financially Approved': 'bg-blue-50 text-blue-700 border-blue-200',
  'Bid Submitted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Won: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Lost: 'bg-red-50 text-red-700 border-red-200',
  'No-Bid': 'bg-red-50 text-red-700 border-red-200',
  Dropped: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  'MOU Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'MOU Signed': 'bg-green-50 text-green-700 border-green-200',
  'In O2C': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Collection Delayed': 'bg-red-50 text-red-700 border-red-200',
  'Collection Complete': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Archived: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  'Soft Deleted': 'bg-zinc-50 text-zinc-700 border-zinc-200',
};

const opportunities: Opportunity[] = [
  {
    id: 'OPP-001',
    name: 'PAL Expansion - State Education Mission',
    customer: 'State Education Department',
    geography: 'Maharashtra',
    products: ['Swift PAL', 'Swift School'],
    value: 142000000,
    stage: 'preBidPab',
    status: 'Awaiting Pre-Bid PAB',
    owner: 'BD User',
    rcPod: 'RC Pod - Education Growth',
    sponsor: 'Sahib',
    businessLead: 'Business Lead - PAL',
    giLead: 'GI Lead - West',
    daysInStage: 5,
    evidenceHealth: 72,
    nextAction: 'Convene Pre-Bid PAB',
    blocker: 'Delivery feasibility note pending',
    capacity: 'Committed',
    cm2Baseline: 28,
    hasAwardArtifact: false,
    hasCfoSignoff: false,
    hasSignedMou: false,
  },
  {
    id: 'OPP-002',
    name: 'VSK Rollout - New State',
    customer: 'Department of School Education',
    geography: 'Karnataka',
    products: ['VSK', 'Swift Insights'],
    value: 235000000,
    stage: 'finance',
    status: 'Awaiting Financial Approval',
    owner: 'GI User',
    rcPod: 'RC Pod - Governance Systems',
    sponsor: 'Prateek',
    businessLead: 'Business Lead - VSK',
    giLead: 'GI Lead - South',
    daysInStage: 3,
    evidenceHealth: 88,
    nextAction: 'CFO sign-off required',
    blocker: 'CM2 approval pending',
    capacity: 'Available',
    cm2Baseline: 32,
    hasAwardArtifact: false,
    hasCfoSignoff: false,
    hasSignedMou: false,
  },
  {
    id: 'OPP-003',
    name: 'Teacher Assessment Reform Bid',
    customer: 'State Council of Educational Research',
    geography: 'Himachal Pradesh',
    products: ['TAT', 'NAT'],
    value: 78000000,
    stage: 'rfp',
    status: 'Bid Submitted',
    owner: 'Tender Team User',
    rcPod: 'RC Pod - Assessments',
    sponsor: 'Akash',
    businessLead: 'Business Lead - Assessment',
    giLead: 'GI Lead - North',
    daysInStage: 11,
    evidenceHealth: 91,
    nextAction: 'Track award communication',
    blocker: 'No blocker',
    capacity: 'Available',
    cm2Baseline: 24,
    hasAwardArtifact: false,
    hasCfoSignoff: true,
    hasSignedMou: false,
  },
  {
    id: 'OPP-004',
    name: 'SwiftChat M&E Implementation',
    customer: 'Mission Directorate',
    geography: 'Jharkhand',
    products: ['SwiftChat', 'M&E'],
    value: 125000000,
    stage: 'mou',
    status: 'MOU Pending',
    owner: 'GI User',
    rcPod: 'RC Pod - SwiftChat',
    sponsor: 'Prateek',
    businessLead: 'Business Lead - SwiftChat',
    giLead: 'GI Lead - East',
    daysInStage: 8,
    evidenceHealth: 94,
    nextAction: 'Upload signed MOU',
    blocker: 'Signed MOU not uploaded',
    capacity: 'Constrained',
    cm2Baseline: 30,
    hasAwardArtifact: true,
    hasCfoSignoff: true,
    hasSignedMou: false,
  },
  {
    id: 'OPP-005',
    name: 'Legacy Smart Classroom Bid',
    customer: 'IT Department',
    geography: 'Puducherry',
    products: ['Swift Class'],
    value: 45000000,
    stage: 'rfp',
    status: 'Lost',
    owner: 'BD User',
    rcPod: 'RC Pod - Schools',
    sponsor: 'Sahib',
    businessLead: 'Business Lead - Class',
    giLead: 'GI Lead - South',
    daysInStage: 19,
    evidenceHealth: 60,
    nextAction: 'Post-loss reason analysis',
    blocker: 'Terminal status',
    capacity: 'Available',
    cm2Baseline: 18,
    hasAwardArtifact: false,
    hasCfoSignoff: false,
    hasSignedMou: false,
  },
];

const o2cProjects: O2CProject[] = [
  {
    id: 'O2C-101',
    name: 'VSK Command Center - Phase 2',
    customer: 'State Education Department',
    contractValue: 180000000,
    collected: 95000000,
    rcPod: 'RC Pod - Governance Systems',
    sponsor: 'Prateek',
    financeOwner: 'Finance Ops',
    status: 'In O2C',
    cm2Baseline: 31,
    cm2Actual: 27,
    scopeChangeCount: 1,
    milestones: [
      { name: 'M1 - Kickoff and baseline', amount: 45000000, due: '2026-06-15', proof: 'Verified', invoice: 'Raised', collection: 'Received' },
      { name: 'M2 - Dashboard deployment', amount: 65000000, due: '2026-07-30', proof: 'Verified', invoice: 'Raised', collection: 'Partial' },
      { name: 'M3 - State rollout', amount: 70000000, due: '2026-09-30', proof: 'Pending', invoice: 'Blocked', collection: 'Not Due' },
    ],
  },
  {
    id: 'O2C-102',
    name: 'PAL Learning Enhancement Programme',
    customer: 'Samagra Shiksha Society',
    contractValue: 220000000,
    collected: 220000000,
    rcPod: 'RC Pod - Education Growth',
    sponsor: 'Sahib',
    financeOwner: 'Finance Ops',
    status: 'Collection Complete',
    cm2Baseline: 29,
    cm2Actual: 30,
    scopeChangeCount: 0,
    milestones: [
      { name: 'M1 - Setup', amount: 60000000, due: '2026-04-15', proof: 'Verified', invoice: 'Raised', collection: 'Received' },
      { name: 'M2 - Implementation', amount: 100000000, due: '2026-05-15', proof: 'Verified', invoice: 'Raised', collection: 'Received' },
      { name: 'M3 - Completion', amount: 60000000, due: '2026-05-31', proof: 'Verified', invoice: 'Raised', collection: 'Received' },
    ],
  },
  {
    id: 'O2C-103',
    name: 'Assessment Digitisation Project',
    customer: 'Examination Board',
    contractValue: 90000000,
    collected: 20000000,
    rcPod: 'RC Pod - Assessments',
    sponsor: 'Akash',
    financeOwner: 'Finance Ops',
    status: 'Collection Delayed',
    cm2Baseline: 26,
    cm2Actual: 19,
    scopeChangeCount: 2,
    milestones: [
      { name: 'M1 - Assessment platform setup', amount: 20000000, due: '2026-05-20', proof: 'Verified', invoice: 'Raised', collection: 'Received' },
      { name: 'M2 - Pilot completion', amount: 30000000, due: '2026-06-10', proof: 'Verified', invoice: 'Raised', collection: 'Overdue' },
      { name: 'M3 - Endline report', amount: 40000000, due: '2026-08-30', proof: 'Not Started', invoice: 'Blocked', collection: 'Not Due' },
    ],
  },
];

const pabMeetings: PabMeeting[] = [
  {
    id: 'PAB-501',
    type: 'Pre-Bid',
    linkedRecord: 'PAL Expansion - State Education Mission',
    convener: 'Rishabh + Prateek',
    mandatoryParticipants: ['RC Pod', 'Rishabh', 'Prateek', 'Pod Sponsor'],
    optionalParticipants: ['Platform leaders', 'Finance', 'Delivery leaders', 'Founders Office'],
    status: 'Decision Pending',
    decision: 'Pending',
    due: '2026-05-23',
    trigger: 'Sharp proposal submitted to CXO layer',
  },
  {
    id: 'PAB-502',
    type: 'Post-Bid',
    linkedRecord: 'SwiftChat M&E Implementation',
    convener: 'Rishabh + Prateek',
    mandatoryParticipants: ['RC Pod', 'Pod Sponsor', 'Delivery leaders', 'Platform leaders'],
    optionalParticipants: ['Finance', 'Founders Office'],
    status: 'Held',
    decision: 'Proceed to MOU',
    due: '2026-05-18',
    trigger: 'Bid probability high / bid won',
  },
  {
    id: 'PAB-503',
    type: 'Mid-Project',
    linkedRecord: 'Assessment Digitisation Project',
    convener: 'Rishabh + Prateek',
    mandatoryParticipants: ['Requester', 'RC Pod', 'Pod Sponsor'],
    optionalParticipants: ['Finance', 'Mission M&E', 'Programs Pod'],
    status: 'Requested',
    decision: 'Pending',
    due: '2026-05-22',
    trigger: 'Collection delay plus margin erosion',
  },
  {
    id: 'PAB-504',
    type: 'Post-Project',
    linkedRecord: 'PAL Learning Enhancement Programme',
    convener: 'Open Question',
    mandatoryParticipants: ['RC Pod', 'Pod Sponsor', 'Finance', 'Mission M&E'],
    optionalParticipants: ['Founders Office', 'Product', 'Programs Pod'],
    status: 'Due',
    decision: 'Pending',
    due: '2026-05-28',
    trigger: 'Collection complete',
  },
];

const capacitySignals: CapacitySignal[] = [
  { pod: 'P1 Revenue Capture - Education Growth', sponsor: 'Sahib', state: 'Committed', updated: '2d ago', risk: 'Medium', note: 'Can take limited proposal work, no new state rollout without tradeoff.' },
  { pod: 'P2 Delivery - PAL', sponsor: 'Sahib', state: 'Available', updated: '1d ago', risk: 'Low', note: 'Delivery pod has capacity for one additional implementation mandate.' },
  { pod: 'Programs Pod - West', sponsor: 'Mohit Bahri', state: 'Constrained', updated: '8d ago', risk: 'High', note: 'Stale and constrained signal; sponsor review required before external timeline commitment.' },
  { pod: 'P3 Platform - Insights', sponsor: 'Rishabh', state: 'Committed', updated: '3d ago', risk: 'Medium', note: 'Platform asks must be sequenced into quarterly backlog.' },
];

const auditEvents: AuditEvent[] = [
  { time: 'Today 10:45', user: 'Finance Ops', event: 'cfo_signoff_pending', entity: 'OPP-002', details: 'CM2 version v3 submitted for approval' },
  { time: 'Today 09:30', user: 'GI User', event: 'mou_draft_updated', entity: 'OPP-004', details: 'Payment milestone clause revised' },
  { time: 'Yesterday', user: 'RC Pod', event: 'proof_verified', entity: 'O2C-103 / M2', details: 'MoM and customer acknowledgement verified' },
  { time: 'Yesterday', user: 'System', event: 'collection_delayed', entity: 'O2C-103', details: 'Invoice overdue; escalation created' },
  { time: '2d ago', user: 'Rishabh + Prateek', event: 'pab_decision', entity: 'PAB-502', details: 'Proceed to MOU; O2C readiness green' },
  { time: '3d ago', user: 'Admin', event: 'role_permission_updated', entity: 'Finance Role', details: 'Added proof.verify and invoice.trigger permissions' },
];

const roles: RoleRow[] = [
  { role: 'Admin', modelRole: 'System administrator', keyViews: 'All', keyActions: 'Users, roles, templates, master data, audit', restrictedActions: 'Cannot bypass source-rule gates' },
  { role: 'BD User', modelRole: 'Revenue Capture Pod - BD', keyViews: 'O2O Pipeline, Opportunity Detail', keyActions: 'Create opportunity, update proposal inputs, track customer context', restrictedActions: 'Cannot approve PAB or CFO gate' },
  { role: 'GI User', modelRole: 'Government Interface', keyViews: 'O2O, RFP, MOU', keyActions: 'Scoping, MOU drafting, stakeholder context, transition support', restrictedActions: 'Cannot trigger O2C without signed MOU artifact' },
  { role: 'Business Lead', modelRole: 'P1 Revenue Capture lead', keyViews: 'O2O, O2C, Collections', keyActions: 'Own proposal, commercial structuring, collection accountability', restrictedActions: 'Cannot commit timeline without sponsor capacity read' },
  { role: 'RC Pod Member', modelRole: 'BD + GI joint unit', keyViews: 'O2O, O2C', keyActions: 'Opportunity qualification, proposal shaping, proof upload, collections tracking', restrictedActions: 'Cannot end accountability before 100 percent collection' },
  { role: 'Pod Sponsor', modelRole: 'Mission accountability owner', keyViews: 'O2O, O2C, Capacity, PAB', keyActions: 'Capacity read, committability call, escalation ownership', restrictedActions: 'Cannot replace CFO sign-off' },
  { role: 'Rishabh', modelRole: 'CDSO / platform feasibility', keyViews: 'PAB, Capacity, Platform Feasibility', keyActions: 'Convene PAB, validate platform feasibility, record decisions', restrictedActions: 'Cannot provide CFO approval' },
  { role: 'Prateek', modelRole: 'COO / delivery feasibility', keyViews: 'PAB, Capacity, Delivery Feasibility', keyActions: 'Convene PAB, validate delivery feasibility, record decisions', restrictedActions: 'Cannot provide CFO approval' },
  { role: 'CFO / Finance', modelRole: 'Financial governance', keyViews: 'Finance, CM2, O2C', keyActions: 'CM2 approval, proof verification, invoice trigger, collection confirmation', restrictedActions: 'Cannot convene PAB alone' },
  { role: 'Tender Team', modelRole: 'Bid management and compliance', keyViews: 'RFP and Bid', keyActions: 'Bid drafting, compliance, EMD, portal submission, submission ack', restrictedActions: 'Cannot submit if CFO gate is not cleared' },
  { role: 'Delivery Pod Lead', modelRole: 'Delivery execution owner', keyViews: 'O2C Milestones, Proofs, Capacity', keyActions: 'Provide delivery proof inputs, raise scope changes', restrictedActions: 'Cannot verify proof for invoice' },
  { role: 'Program Pod User', modelRole: 'Ground implementation', keyViews: 'Proofs, Mission M&E', keyActions: 'Upload MoMs and implementation acknowledgements', restrictedActions: 'Cannot approve CM2 or invoice' },
  { role: 'Mission M&E', modelRole: 'Outcome and actual CM2 signal owner', keyViews: 'Mission M&E, O2C, CM2', keyActions: 'Signal Amber/Red, consolidate actual CM2 inputs', restrictedActions: 'Cannot override collection records' },
  { role: 'Founders Office', modelRole: 'Governance and strategy viewer', keyViews: 'Executive, Portfolio, PAB, Audit', keyActions: 'View, review, escalate, inspect portfolio health', restrictedActions: 'Not day-to-day execution owner' },
];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function money(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={cx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', className)}>{children}</span>;
}

function StatusBadge({ status }: { status: Status }) {
  return <Badge className={statusStyles[status]}>{status}</Badge>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cx('rounded-2xl border border-slate-200 bg-white p-4 shadow-soft', className)}>{children}</div>;
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="rounded-2xl bg-slate-900 p-2 text-white">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ComponentType<{ className?: string }>;
  tone?: 'slate' | 'green' | 'amber' | 'red' | 'blue';
}) {
  const tones = {
    slate: 'bg-slate-50 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
  } as const;

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        {Icon && (
          <div className={cx('rounded-xl p-2', tones[tone])}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
      {helper && <div className="mt-1 text-xs text-slate-500">{helper}</div>}
    </Card>
  );
}

function EvidenceBar({ value }: { value: number }) {
  const bar = value >= 85 ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>Evidence health</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className={cx('h-2 rounded-full', bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

function SourceRuleBox() {
  const rules = [
    'O2C starts only after signed MOU upload.',
    'CFO sign-off blocks bid submission.',
    'Won requires Award Communication evidence.',
    'Orders Won is not calculated from Kanban column position.',
    'Revenue Capture Pod remains accountable until 100 percent collection.',
  ];
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
        <ListChecks className="h-4 w-4" /> Source-rule guardrails
      </div>
      <ul className="mt-3 space-y-2 text-xs text-slate-600">
        {rules.map((rule) => (
          <li key={rule} className="flex gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" />
            <span>{rule}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LifecycleStepper({ activeStage }: { activeStage: O2OStageId }) {
  const activeIndex = o2oStages.findIndex((stage) => stage.id === activeStage);
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-[980px] items-center">
        {o2oStages.map((stage, index) => {
          const done = index < activeIndex;
          const current = index === activeIndex;
          return (
            <div key={stage.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center text-center">
                <div
                  className={cx(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold',
                    done && 'border-emerald-500 bg-emerald-50 text-emerald-700',
                    current && 'border-slate-900 bg-slate-900 text-white',
                    !done && !current && 'border-slate-200 bg-slate-50 text-slate-400',
                  )}
                >
                  {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <div className={cx('mt-2 w-24 text-xs font-medium', current ? 'text-slate-950' : 'text-slate-500')}>{stage.short}</div>
              </div>
              {index < o2oStages.length - 1 && <div className={cx('mx-2 h-px flex-1', index < activeIndex ? 'bg-emerald-300' : 'bg-slate-200')} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecutiveHome({
  setActivePage,
  setSelectedOpportunity,
  setSelectedProject,
}: {
  setActivePage: (page: PageId) => void;
  setSelectedOpportunity: (opportunity: Opportunity) => void;
  setSelectedProject: (project: O2CProject) => void;
}) {
  const activeOpps = opportunities.filter((opportunity) => !terminalStatuses.includes(opportunity.status));
  const totalPipeline = activeOpps.reduce((sum, opportunity) => sum + opportunity.value, 0);
  const weightedPipeline = activeOpps.reduce((sum, opportunity) => {
    const stage = o2oStages.find((item) => item.id === opportunity.stage);
    return sum + opportunity.value * (stage?.probability ?? 0);
  }, 0);
  const evidenceBackedOrdersWon = opportunities.filter((opportunity) => opportunity.status === 'Won' && opportunity.hasAwardArtifact).length;
  const collectionRisk = o2cProjects
    .filter((project) => project.status === 'Collection Delayed')
    .reduce((sum, project) => sum + (project.contractValue - project.collected), 0);

  return (
    <div>
      <SectionTitle
        icon={LayoutDashboard}
        title="Executive Home"
        subtitle="Governance-first view across O2O, PAB, O2C, collections, and CM2."
        action={<button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Export leadership pack</button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Active Pipeline" value={money(totalPipeline)} helper={`${activeOpps.length} non-terminal opportunities`} icon={TrendingUp} tone="blue" />
        <MetricCard label="Weighted Pipeline" value={money(weightedPipeline)} helper="Stage probability x active value" icon={Activity} tone="green" />
        <MetricCard label="Evidence-backed Orders Won" value={evidenceBackedOrdersWon} helper="Requires Won status plus award artifact" icon={BadgeCheck} tone="green" />
        <MetricCard label="Collection Risk" value={money(collectionRisk)} helper="Delayed or overdue collection exposure" icon={AlertTriangle} tone="red" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-950">Priority Governance Queue</h3>
              <p className="text-sm text-slate-500">Records with gates, blockers, or revenue risk.</p>
            </div>
            <button onClick={() => setActivePage('o2o')} className="text-sm font-medium text-slate-900">
              Open pipeline
            </button>
          </div>
          <div className="space-y-3">
            {opportunities.slice(0, 4).map((opportunity) => (
              <button
                key={opportunity.id}
                onClick={() => {
                  setSelectedOpportunity(opportunity);
                  setActivePage('o2o');
                }}
                className="w-full rounded-2xl border border-slate-100 p-4 text-left hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="font-semibold text-slate-950">{opportunity.name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {opportunity.customer} - {opportunity.geography} - {opportunity.products.join(', ')}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusBadge status={opportunity.status} />
                      <Badge className="border-slate-200 bg-slate-50 text-slate-600">Sponsor: {opportunity.sponsor}</Badge>
                      <Badge className="border-slate-200 bg-slate-50 text-slate-600">Capacity: {opportunity.capacity}</Badge>
                    </div>
                  </div>
                  <div className="min-w-[220px]">
                    <EvidenceBar value={opportunity.evidenceHealth} />
                  </div>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">Next:</span> {opportunity.nextAction} - <span className="font-medium text-slate-900">Blocker:</span> {opportunity.blocker}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-slate-950">O2C Cash Realization</h3>
          <p className="mt-1 text-sm text-slate-500">RC Pod accountability remains until 100 percent collection.</p>
          <div className="mt-4 space-y-3">
            {o2cProjects.map((project) => {
              const percent = Math.round((project.collected / project.contractValue) * 100);
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProject(project);
                    setActivePage('o2c');
                  }}
                  className="w-full rounded-2xl border border-slate-100 p-3 text-left hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{project.name}</div>
                      <div className="mt-1 text-xs text-slate-500">{project.sponsor} - {project.rcPod}</div>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-slate-900" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {percent}% collected - {money(project.collected)} of {money(project.contractValue)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function O2OPipeline({
  selectedOpportunity,
  setSelectedOpportunity,
}: {
  selectedOpportunity: Opportunity;
  setSelectedOpportunity: (opportunity: Opportunity) => void;
}) {
  const groupedStages = useMemo(
    () =>
      o2oStages.slice(0, 7).map((stage) => ({
        ...stage,
        items: opportunities.filter((opportunity) => opportunity.stage === stage.id),
      })),
    [],
  );

  return (
    <div>
      <SectionTitle
        icon={Briefcase}
        title="O2O Pipeline"
        subtitle="From opportunity registration to signed MOU. Terminal statuses stay out of active KPIs."
        action={<button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">+ Add Opportunity</button>}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input className="w-full outline-none placeholder:text-slate-400" placeholder="Search by opportunity, customer, product, pod sponsor..." />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        {groupedStages.map((stage) => (
          <div key={stage.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{stage.short}</div>
                <div className="text-xs text-slate-500">{Math.round(stage.probability * 100)}% weight</div>
              </div>
              <Badge className="border-slate-200 bg-white text-slate-600">{stage.items.length}</Badge>
            </div>
            <div className="space-y-3">
              {stage.items.map((opportunity) => (
                <button
                  key={opportunity.id}
                  onClick={() => setSelectedOpportunity(opportunity)}
                  className={cx(
                    'w-full rounded-2xl border bg-white p-3 text-left shadow-sm hover:border-slate-400',
                    selectedOpportunity.id === opportunity.id ? 'border-slate-900' : 'border-slate-200',
                  )}
                >
                  <div className="font-medium leading-tight text-slate-950">{opportunity.name}</div>
                  <div className="mt-2 text-xs text-slate-500">{opportunity.customer}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <StatusBadge status={opportunity.status} />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-slate-950">{money(opportunity.value)}</div>
                  <div className="mt-3">
                    <EvidenceBar value={opportunity.evidenceHealth} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>{opportunity.daysInStage}d in stage</span>
                    <span>{opportunity.sponsor}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <OpportunityDetail opportunity={selectedOpportunity} />
    </div>
  );
}

function OpportunityDetail({ opportunity }: { opportunity: Opportunity }) {
  const stage = o2oStages.find((item) => item.id === opportunity.stage);
  const canSubmitBid = opportunity.hasCfoSignoff && !terminalStatuses.includes(opportunity.status);
  const canTransitionToO2c = opportunity.hasSignedMou && opportunity.status === 'MOU Signed';
  const canCountAsWon = opportunity.status === 'Won' && opportunity.hasAwardArtifact;

  const evidenceRows = [
    { label: 'Project proposal uploaded', done: true, owner: 'RC Pod' },
    { label: 'CM2 sheet aligned to CCOO pricing strategy', done: opportunity.evidenceHealth >= 70, owner: 'RC Pod + Finance' },
    { label: 'Platform feasibility validation', done: ['finance', 'rfp', 'postBidPab', 'mou', 'o2c'].includes(opportunity.stage), owner: 'Rishabh' },
    { label: 'Delivery feasibility validation', done: opportunity.capacity !== 'Constrained', owner: 'Prateek / Pod Sponsor' },
    { label: 'CFO sign-off', done: opportunity.hasCfoSignoff, owner: 'Somesh / CFO' },
    { label: 'Award communication evidence', done: opportunity.hasAwardArtifact, owner: 'RC Pod / Tender Team' },
    { label: 'Signed MOU uploaded', done: opportunity.hasSignedMou, owner: 'GI + Rishabh + Prateek' },
  ];

  return (
    <div className="mt-6 space-y-4">
      <SectionTitle icon={FileText} title="Opportunity Detail" subtitle="Governance workspace with stage, status, evidence, owners, blockers, and next action." />
      <Card>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-semibold text-slate-950">{opportunity.name}</h3>
              <StatusBadge status={opportunity.status} />
            </div>
            <div className="mt-2 text-sm text-slate-500">
              {opportunity.customer} - {opportunity.geography} - {opportunity.products.join(', ')}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Info label="Value" value={money(opportunity.value)} />
              <Info label="Current stage" value={stage?.label ?? 'Unknown'} />
              <Info label="RC Pod" value={opportunity.rcPod} />
              <Info label="Pod Sponsor" value={opportunity.sponsor} />
              <Info label="Business Lead" value={opportunity.businessLead} />
              <Info label="GI Lead" value={opportunity.giLead} />
              <Info label="Capacity read" value={opportunity.capacity} />
              <Info label="CM2 baseline" value={`${opportunity.cm2Baseline}%`} />
            </div>
          </div>
          <div className="min-w-[280px] rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-950">Current required action</div>
            <div className="mt-2 text-sm text-slate-600">{opportunity.nextAction}</div>
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <span className="font-semibold">Blocker:</span> {opportunity.blocker}
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              <Badge className={canSubmitBid ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}>
                Bid submission: {canSubmitBid ? 'Allowed' : 'Blocked'}
              </Badge>
              <Badge className={canCountAsWon ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                Orders Won KPI: {canCountAsWon ? 'Counted' : 'Not counted'}
              </Badge>
              <Badge className={canTransitionToO2c ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'}>
                O2C transition: {canTransitionToO2c ? 'Ready' : 'Not ready'}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <LifecycleStepper activeStage={opportunity.stage} />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <h3 className="font-semibold text-slate-950">Gate Evidence Checklist</h3>
          <div className="mt-4 space-y-3">
            {evidenceRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 p-3">
                <div className="flex items-center gap-3">
                  {row.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock3 className="h-5 w-5 text-amber-600" />}
                  <div>
                    <div className="text-sm font-medium text-slate-700">{row.label}</div>
                    <div className="text-xs text-slate-500">Owner: {row.owner}</div>
                  </div>
                </div>
                <Badge className={row.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                  {row.done ? 'Done' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <SourceRuleBox />
      </div>
    </div>
  );
}

function O2CProjects({
  selectedProject,
  setSelectedProject,
}: {
  selectedProject: O2CProject;
  setSelectedProject: (project: O2CProject) => void;
}) {
  const current = selectedProject;
  const collectionPercent = Math.round((current.collected / current.contractValue) * 100);

  return (
    <div>
      <SectionTitle icon={Milestone} title="O2C Projects" subtitle="Milestone-to-cash governance from signed MOU to 100 percent collection." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          {o2cProjects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={cx(
                'w-full rounded-2xl border bg-white p-4 text-left shadow-sm hover:border-slate-400',
                current.id === project.id ? 'border-slate-900' : 'border-slate-200',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-semibold text-slate-950">{project.name}</div>
                <StatusBadge status={project.status} />
              </div>
              <div className="mt-2 text-sm text-slate-500">{project.customer}</div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-900" style={{ width: `${Math.round((project.collected / project.contractValue) * 100)}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-500">{money(project.collected)} collected</div>
            </button>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-2xl font-semibold text-slate-950">{current.name}</h3>
                  <StatusBadge status={current.status} />
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {current.customer} - {current.rcPod} - Sponsor: {current.sponsor}
                </p>
              </div>
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">Request Mid-Project PAB</button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <MetricCard label="Contract Value" value={money(current.contractValue)} helper="Signed MOU value" icon={FileCheck2} tone="blue" />
              <MetricCard label="Collected" value={money(current.collected)} helper={`${collectionPercent}% of contract`} icon={CircleDollarSign} tone="green" />
              <MetricCard
                label="CM2 Variance"
                value={`${current.cm2Actual - current.cm2Baseline}%`}
                helper={`Baseline ${current.cm2Baseline}% vs actual ${current.cm2Actual}%`}
                icon={TrendingUp}
                tone={current.cm2Actual >= current.cm2Baseline ? 'green' : 'red'}
              />
              <MetricCard label="Scope Changes" value={current.scopeChangeCount} helper="Logged and assessed" icon={AlertTriangle} tone={current.scopeChangeCount > 0 ? 'amber' : 'green'} />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-slate-950">Milestone-to-Cash Tracker</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="py-3">Milestone</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Proof</th>
                    <th>Invoice</th>
                    <th>Collection</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {current.milestones.map((milestone) => (
                    <tr key={milestone.name} className="align-top">
                      <td className="py-3 font-medium text-slate-950">{milestone.name}</td>
                      <td>{milestone.due}</td>
                      <td>{money(milestone.amount)}</td>
                      <td>{milestone.proof}</td>
                      <td>{milestone.invoice}</td>
                      <td>
                        <Badge
                          className={
                            milestone.collection === 'Overdue'
                              ? 'border-red-200 bg-red-50 text-red-700'
                              : milestone.collection === 'Received'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                          }
                        >
                          {milestone.collection}
                        </Badge>
                      </td>
                      <td>
                        <button className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium">Open</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PABGovernance() {
  return (
    <div>
      <SectionTitle icon={ClipboardCheck} title="PAB Governance" subtitle="Pre-Bid, Post-Bid, Mid-Project, and Post-Project PAB workflow engine." />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="PABs Requested" value={pabMeetings.length} helper="All PAB types" icon={CalendarDays} tone="blue" />
        <MetricCard label="Decision Pending" value={pabMeetings.filter((pab) => pab.decision === 'Pending').length} helper="Needs convener action" icon={Clock3} tone="amber" />
        <MetricCard label="Mid-Project Triggers" value={pabMeetings.filter((pab) => pab.type === 'Mid-Project').length} helper="Scope, timeline, margin, govt, product, delivery" icon={AlertTriangle} tone="red" />
        <MetricCard label="Post-Project Due" value={pabMeetings.filter((pab) => pab.type === 'Post-Project').length} helper="Learning closure" icon={Archive} tone="green" />
      </div>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3">PAB ID</th>
                <th>Type</th>
                <th>Linked Record</th>
                <th>Convener</th>
                <th>Trigger</th>
                <th>Mandatory Participants</th>
                <th>Status</th>
                <th>Decision</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pabMeetings.map((pab) => (
                <tr key={pab.id}>
                  <td className="py-3 font-medium text-slate-950">{pab.id}</td>
                  <td>{pab.type}</td>
                  <td>{pab.linkedRecord}</td>
                  <td>{pab.convener}</td>
                  <td>{pab.trigger}</td>
                  <td>{pab.mandatoryParticipants.join(', ')}</td>
                  <td>{pab.status}</td>
                  <td>{pab.decision}</td>
                  <td>{pab.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function FinanceCM2() {
  return (
    <div>
      <SectionTitle icon={CircleDollarSign} title="Finance and CM2" subtitle="CFO approvals, invoice readiness, collections, and approved-vs-actual CM2." />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="CFO Queue" value="1" helper="Awaiting financial approval" icon={LockKeyhole} tone="amber" />
        <MetricCard label="Proof Verified, Invoice Pending" value="1" helper="Finance action required" icon={FileCheck2} tone="blue" />
        <MetricCard label="Collection Delayed" value="1" helper="Escalation active" icon={AlertTriangle} tone="red" />
        <MetricCard label="CM2 Erosion" value="2" helper="Actual below approved baseline" icon={TrendingUp} tone="red" />
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-slate-950">Approved vs Actual CM2</h3>
        <div className="mt-4 space-y-3">
          {o2cProjects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold text-slate-950">{project.name}</div>
                  <div className="text-sm text-slate-500">
                    Baseline {project.cm2Baseline}% - Actual {project.cm2Actual}% - Finance owner: {project.financeOwner}
                  </div>
                </div>
                <Badge className={project.cm2Actual >= project.cm2Baseline ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}>
                  {project.cm2Actual - project.cm2Baseline}% variance
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PodCapacity() {
  const stateClass = (state: CapacityState) => {
    if (state === 'Available') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (state === 'Committed') return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-red-200 bg-red-50 text-red-700';
  };

  return (
    <div>
      <SectionTitle icon={Gauge} title="Pod Capacity" subtitle="Sponsor capacity read before government timeline commitments." />
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Available" value={capacitySignals.filter((signal) => signal.state === 'Available').length} helper="Can absorb new mandate" icon={CheckCircle2} tone="green" />
        <MetricCard label="Committed" value={capacitySignals.filter((signal) => signal.state === 'Committed').length} helper="Needs tradeoff or next cycle" icon={Clock3} tone="amber" />
        <MetricCard label="Constrained" value={capacitySignals.filter((signal) => signal.state === 'Constrained').length} helper="No new work as rule" icon={XCircle} tone="red" />
      </div>

      <Card className="mt-6">
        <div className="grid gap-3 md:grid-cols-2">
          {capacitySignals.map((signal) => (
            <div key={signal.pod} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-950">{signal.pod}</div>
                  <div className="mt-1 text-sm text-slate-500">Sponsor: {signal.sponsor} - Updated {signal.updated}</div>
                  <div className="mt-2 text-sm text-slate-600">{signal.note}</div>
                </div>
                <Badge className={stateClass(signal.state)}>{signal.state}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuditLog() {
  return (
    <div>
      <SectionTitle icon={Database} title="Audit Log" subtitle="Immutable trail for stages, statuses, PAB decisions, approvals, documents, invoices, collections, and admin changes." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3">Time</th>
                <th>User</th>
                <th>Event</th>
                <th>Entity</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditEvents.map((event) => (
                <tr key={`${event.time}-${event.entity}-${event.event}`}>
                  <td className="py-3 text-slate-500">{event.time}</td>
                  <td>{event.user}</td>
                  <td>
                    <Badge className="border-slate-200 bg-slate-50 text-slate-700">{event.event}</Badge>
                  </td>
                  <td className="font-medium text-slate-950">{event.entity}</td>
                  <td>{event.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function AdminRBAC() {
  return (
    <div>
      <SectionTitle icon={Settings} title="Admin and RBAC" subtitle="Role, stage, portal, template, dropdown, approval, and audit visibility controls." />
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Configured Roles" value={roles.length} helper="Action-level permissions" icon={Users} tone="blue" />
        <MetricCard label="Protected Gates" value="5" helper="PAB, CFO, bid, MOU, O2C" icon={ShieldCheck} tone="green" />
        <MetricCard label="Master Data Lists" value="4" helper="Products, customers, geography, pods" icon={Database} tone="slate" />
        <MetricCard label="Audit Visibility" value="FO + Admin" helper="Role-scoped audit access" icon={LockKeyhole} tone="amber" />
      </div>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="py-3">Role</th>
                <th>Model Role</th>
                <th>Key Views</th>
                <th>Key Actions</th>
                <th>Restrictions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((role) => (
                <tr key={role.role}>
                  <td className="py-3 font-semibold text-slate-950">{role.role}</td>
                  <td>{role.modelRole}</td>
                  <td>{role.keyViews}</td>
                  <td>{role.keyActions}</td>
                  <td>{role.restrictedActions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('home');
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>(opportunities[0]);
  const [selectedProject, setSelectedProject] = useState<O2CProject>(o2cProjects[0]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function renderPage() {
    if (activePage === 'home') return <ExecutiveHome setActivePage={setActivePage} setSelectedOpportunity={setSelectedOpportunity} setSelectedProject={setSelectedProject} />;
    if (activePage === 'o2o') return <O2OPipeline selectedOpportunity={selectedOpportunity} setSelectedOpportunity={setSelectedOpportunity} />;
    if (activePage === 'o2c') return <O2CProjects selectedProject={selectedProject} setSelectedProject={setSelectedProject} />;
    if (activePage === 'pab') return <PABGovernance />;
    if (activePage === 'finance') return <FinanceCM2 />;
    if (activePage === 'capacity') return <PodCapacity />;
    if (activePage === 'audit') return <AuditLog />;
    if (activePage === 'admin') return <AdminRBAC />;
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle navigation">
              <Menu className="h-5 w-5" />
            </button>
            <div className="rounded-2xl bg-slate-900 p-2 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold leading-tight">ConveGenius O2O to O2C</div>
              <div className="text-xs text-slate-500">Farming Governance - PAB - Revenue Realization</div>
            </div>
          </div>
          <div className="hidden max-w-md flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <input className="w-full outline-none placeholder:text-slate-400" placeholder="Search records, PABs, projects, invoices..." />
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-slate-200 p-2" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <Badge className="hidden border-slate-200 bg-slate-50 text-slate-700 md:inline-flex">Founders Office Viewer</Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cx(
            'fixed inset-y-16 left-0 z-30 w-72 border-r border-slate-200 bg-white p-4 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={cx(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium',
                    active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                  )}
                >
                  <Icon className="h-4 w-4" /> {item.label}
                </button>
              );
            })}
          </nav>
          <div className="mt-6">
            <SourceRuleBox />
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-4 lg:p-6">{renderPage()}</main>
      </div>
    </div>
  );
}
