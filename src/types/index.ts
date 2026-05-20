export type Stage = 'Sourcing'|'Pre-Bid PAB'|'Bid'|'Negotiation'|'Won'|'Dropped';
export type PABDecision = 'Go'|'Conditional Go'|'Hold'|'No-Go';
export interface Opportunity {id:string;name:string;state:string;owner:string;stage:Stage;valueCr:number;cfoSigned:boolean;awardEvidence:boolean;signedMou:boolean;blockers:string[];}
export interface O2CProject {id:string;name:string;opportunityId:string;pod:string;collectionPct:number;status:string;risk:string;}
export interface Milestone {id:string;projectId:string;name:string;amountL:number;delivered:boolean;invoiced:boolean;collected:boolean;}
export interface PABMeeting {id:string;type:'Pre-Bid'|'Mid-Project';context:string;decision:PABDecision;trigger?:string;}
export interface CM2Record {projectId:string;cm2Pct:number;budgetL:number;actualL:number;}
export interface PodCapacity {pod:string;used:number;total:number;}
export interface AuditEvent {id:string;entity:string;action:string;actor:string;ts:string;softDeleted?:boolean;}
export interface RolePermission {role:string;permissions:string[];}
