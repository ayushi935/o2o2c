import { AuditEvent, CM2Record, Milestone, O2CProject, Opportunity, PABMeeting, PodCapacity, RBACRow } from '../types';

export const opportunities: Opportunity[] = [
  { id:'OP-118',name:'UP School Digital Labs',account:'UP Education Dept',state:'UP',owner:'Rohit',stage:'Bid',valueCr:24,cfoSigned:false,awardEvidence:false,signedMou:false,blockers:['CFO sign-off pending'],status:'blocked' },
  { id:'OP-121',name:'Bihar FLN Expansion',account:'Bihar Education Mission',state:'Bihar',owner:'Sana',stage:'Won',valueCr:42,cfoSigned:true,awardEvidence:true,signedMou:true,blockers:[],status:'approved' },
  { id:'OP-127',name:'Odisha Teacher Stack',account:'Odisha SCERT',state:'Odisha',owner:'Anish',stage:'Negotiation',valueCr:18,cfoSigned:true,awardEvidence:false,signedMou:false,blockers:['Commercial deviation pending'],status:'delayed' },
];
export const pabMeetings: PABMeeting[] = [
  { id:'PAB-09', type:'Pre-Bid', context:'UP School Digital Labs', decision:'Conditional Go', status:'loading' },
  { id:'PAB-12', type:'Mid-Project', context:'Bihar FLN Expansion', decision:'Hold', trigger:'margin erosion', status:'rejected' },
];
export const projects: O2CProject[] = [
  { id:'PR-55', name:'Bihar FLN Expansion', opportunityId:'OP-121', podOwner:'Revenue Capture Pod', collectionPct:64, status:'Execution', risk:'Timeline risk', lifecycleState:'active' },
  { id:'PR-58', name:'Rajasthan STEM Rollout', opportunityId:'OP-099', podOwner:'Revenue Capture Pod', collectionPct:100, status:'Closed', risk:'Low', lifecycleState:'terminal' },
];
export const milestones: Milestone[] = [
  { id:'MS-1', projectId:'PR-55', name:'Pilot completion', amountL:125, delivered:true, invoiced:true, collected:true, state:'approved' },
  { id:'MS-2', projectId:'PR-55', name:'District onboarding', amountL:220, delivered:true, invoiced:true, collected:false, state:'delayed' },
  { id:'MS-3', projectId:'PR-55', name:'Teacher enablement', amountL:95, delivered:false, invoiced:false, collected:false, state:'empty' },
];
export const cm2Records: CM2Record[] = [
  { projectId:'PR-55', budgetL:900, actualL:975, cm2Pct:23 },
  { projectId:'PR-58', budgetL:610, actualL:600, cm2Pct:29 },
];
export const podCapacity: PodCapacity[] = [
  { pod:'Pod A', used:31, total:40 }, { pod:'Pod B', used:27, total:35 }, { pod:'Revenue Capture Pod', used:18, total:20 },
];
export const auditEvents: AuditEvent[] = [
  { id:'AU-1', ts:'2026-05-18 10:12', entity:'OP-118', action:'CFO sign-off requested', actor:'Rohit' },
  { id:'AU-2', ts:'2026-05-19 14:04', entity:'BD-77', action:'Bid soft deleted', actor:'Admin', softDeleted:true },
  { id:'AU-3', ts:'2026-05-19 17:26', entity:'PR-55', action:'PAB trigger for timeline risk', actor:'Program PMO' },
];
export const rbacRows: RBACRow[] = [
  { role:'CEO', permissions:['View all', 'Approve PAB', 'View audit', 'View CM2'] },
  { role:'CFO', permissions:['Sign-off bids', 'Approve finance queue', 'Reject CM2 variance', 'Unlock submission'] },
  { role:'Sales Director', permissions:['Create opportunity', 'Upload proposal', 'Request PAB', 'Upload award evidence'] },
  { role:'Revenue Capture Pod Lead', permissions:['Create milestones', 'Trigger invoice', 'Record collection', 'Close project at 100% collections'] },
  { role:'Admin', permissions:['Role assignment', 'Action-level policy edit', 'Soft-delete restore', 'Audit export'] },
];

export const roleNav: Record<string, string[]> = {
  CEO: ['Executive Home', 'O2O Pipeline', 'Opportunity Detail', 'PAB Governance', 'Finance & CM2 Dashboard', 'Audit Log', 'Admin / RBAC'],
  CFO: ['Executive Home', 'Financial Approval Queue', 'RFP & Bid Management', 'Opportunity Detail', 'Finance & CM2 Dashboard', 'Audit Log'],
  'Sales Director': ['Executive Home', 'O2O Pipeline', 'Opportunity Detail', 'RFP & Bid Management', 'MOU Workspace', 'PAB Governance'],
  'Revenue Capture Pod Lead': ['Executive Home', 'O2C Projects', 'O2C Project Detail', 'Milestone-to-Cash Tracker', 'Pod Capacity Dashboard', 'Audit Log'],
  Admin: ['Executive Home', 'Admin / RBAC', 'Audit Log', 'O2O Pipeline', 'O2C Projects'],
};
