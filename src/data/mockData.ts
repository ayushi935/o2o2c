import { AuditEvent, CM2Record, Milestone, O2CProject, Opportunity, PABMeeting, PodCapacity, RBACRow } from '../types';

export const opportunities: Opportunity[] = [
  { id:'OP-118',name:'UP School Digital Labs',account:'UP Education Dept',state:'UP',owner:'Rohit',stage:'Bid',valueCr:24,cfoSigned:false,awardEvidence:false,signedMou:false,blockers:['CFO sign-off pending'] },
  { id:'OP-121',name:'Bihar FLN Expansion',account:'Bihar Education Mission',state:'Bihar',owner:'Sana',stage:'Won',valueCr:42,cfoSigned:true,awardEvidence:true,signedMou:true,blockers:[] },
  { id:'OP-127',name:'Odisha Teacher Stack',account:'Odisha SCERT',state:'Odisha',owner:'Anish',stage:'Negotiation',valueCr:18,cfoSigned:true,awardEvidence:false,signedMou:false,blockers:['Commercial deviation pending'] },
];
export const pabMeetings: PABMeeting[] = [
  { id:'PAB-09', type:'Pre-Bid', context:'UP School Digital Labs', decision:'Conditional Go' },
  { id:'PAB-12', type:'Mid-Project', context:'Bihar FLN Expansion', decision:'Hold', trigger:'margin erosion' },
];
export const projects: O2CProject[] = [
  { id:'PR-55', name:'Bihar FLN Expansion', opportunityId:'OP-121', podOwner:'Revenue Capture Pod', collectionPct:64, status:'Execution', risk:'Timeline risk' },
  { id:'PR-58', name:'Rajasthan STEM Rollout', opportunityId:'OP-099', podOwner:'Revenue Capture Pod', collectionPct:100, status:'Closed', risk:'Low' },
];
export const milestones: Milestone[] = [
  { id:'MS-1', projectId:'PR-55', name:'Pilot completion', amountL:125, delivered:true, invoiced:true, collected:true },
  { id:'MS-2', projectId:'PR-55', name:'District onboarding', amountL:220, delivered:true, invoiced:true, collected:false },
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
];
export const rbacRows: RBACRow[] = [
  { role:'CEO', permissions:['View all', 'Approve PAB'] },
  { role:'CFO', permissions:['Sign-off bids', 'Approve finance queue'] },
  { role:'Revenue Capture Pod Lead', permissions:['Trigger invoices', 'Record collections'] },
];
