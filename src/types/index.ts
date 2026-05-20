export type Stage = 'Sourcing' | 'Pre-Bid PAB' | 'Bid' | 'Negotiation' | 'Won' | 'Dropped';
export type PABDecision = 'Go' | 'Conditional Go' | 'Hold' | 'No-Go';
export type UIState = 'empty' | 'loading' | 'blocked' | 'approved' | 'rejected' | 'delayed' | 'terminal' | 'active';

export interface Opportunity {
  id: string; name: string; account: string; state: string; owner: string; stage: Stage; valueCr: number;
  cfoSigned: boolean; awardEvidence: boolean; signedMou: boolean; blockers: string[]; status: UIState;
}
export interface O2CProject { id: string; name: string; opportunityId: string; podOwner: string; collectionPct: number; status: string; risk: string; lifecycleState: UIState; }
export interface Milestone { id: string; projectId: string; name: string; amountL: number; delivered: boolean; invoiced: boolean; collected: boolean; state: UIState; }
export interface PABMeeting { id: string; type: 'Pre-Bid'|'Mid-Project'; context: string; decision: PABDecision; trigger?: string; status: UIState; }
export interface CM2Record { projectId: string; budgetL: number; actualL: number; cm2Pct: number; }
export interface PodCapacity { pod: string; used: number; total: number; }
export interface AuditEvent { id: string; ts: string; entity: string; action: string; actor: string; softDeleted?: boolean; }
export interface RBACRow { role: string; permissions: string[]; }
