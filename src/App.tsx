import { useMemo, useState } from 'react';
import AppShell from './layout/AppShell';
import Sidebar from './layout/Sidebar';
import Card from './components/Card';

type Role = 'Admin'|'BD'|'GI'|'RC Pod'|'Business Lead'|'GI Lead'|'Pod Sponsor'|'Delivery-track Sponsor'|'Platform-track Sponsor'|'Rishabh / CXO Lead'|'Prateek / CXO Lead'|'CFO / Somesh'|'Finance Ops'|'CCOO / Viprav'|'Tender Team'|'Delivery Pod Lead'|'Delivery Pod User'|'Program Pod User'|'Mission M&E'|'Founders Office'|'Portfolio Intelligence'|'Readonly';
type StepStatus = 'Not Started'|'In Progress'|'Blocked'|'Completed'|'Terminal';
type Nav = 'Governance Journey'|'O2O Workspace'|'O2C Workspace'|'PAB Governance'|'Finance & CM2'|'Pod Capacity'|'Audit Log'|'Admin / RBAC';

const ROLES: Role[] = ['Admin','BD','GI','RC Pod','Business Lead','GI Lead','Pod Sponsor','Delivery-track Sponsor','Platform-track Sponsor','Rishabh / CXO Lead','Prateek / CXO Lead','CFO / Somesh','Finance Ops','CCOO / Viprav','Tender Team','Delivery Pod Lead','Delivery Pod User','Program Pod User','Mission M&E','Founders Office','Portfolio Intelligence','Readonly'];
const NAV_ITEMS: Nav[] = ['Governance Journey','O2O Workspace','O2C Workspace','PAB Governance','Finance & CM2','Pod Capacity','Audit Log','Admin / RBAC'];

const roleFocus: Record<Role,string> = {
  Admin:'Full governance control and RBAC oversight.', BD:'Opportunity Registration + Proposal Stage actions highlighted.', GI:'MOU + scoping actions highlighted.', 'RC Pod':'Proposal, PAB request, proof upload, collection tracking highlighted.', 'Business Lead':'Commercial structuring and no-bid/lost governance highlighted.', 'GI Lead':'MOU anchoring and operational realism highlighted.', 'Pod Sponsor':'Capacity + committability + escalation highlighted.', 'Delivery-track Sponsor':'Capacity constraints and mid-project interventions highlighted.', 'Platform-track Sponsor':'Platform feasibility and dependency readiness highlighted.', 'Rishabh / CXO Lead':'Platform feasibility validation + PAB convening highlighted.', 'Prateek / CXO Lead':'Delivery feasibility validation + PAB convening highlighted.', 'CFO / Somesh':'Financial Approval Gate + CM2 lock highlighted.', 'Finance Ops':'Proof review, invoicing, collections highlighted.', 'CCOO / Viprav':'Pricing strategy references in bid finance highlighted.', 'Tender Team':'RFP & Bid Management actions highlighted.', 'Delivery Pod Lead':'Milestones and scope impact highlighted.', 'Delivery Pod User':'Delivery evidence support highlighted.', 'Program Pod User':'MoM + customer acknowledgement highlighted.', 'Mission M&E':'Project health and risk signal visibility highlighted.', 'Founders Office':'Governance oversight, risks, escalations, audit highlighted.', 'Portfolio Intelligence':'Portfolio signals and risk visibility highlighted.', Readonly:'Map and records visible, no mutation actions.'
};

type Step = { name: string; status: StepStatus; records: number; owner: string; evidence: string; blocker: string; cta: string; workspace: Nav; }; 
type Phase = { name: string; purpose: string; primaryOwner: string; sourceRule: string; steps: Step[]; };

const PHASES: Phase[] = [
  { name:'O2O: Opportunity to Signed MOU', purpose:'Qualify and govern opportunity until signed commercial closure.', primaryOwner:'Revenue Capture Pod + Business Lead', sourceRule:'[Source Rule] CFO sign-off is required before bid submission.', steps:[
    {name:'Opportunity Registration',status:'In Progress',records:3,owner:'BD',evidence:'Budget signal, competitor intelligence, stakeholder mapping notes',blocker:'',cta:'Open Opportunity Intake',workspace:'O2O Workspace'},
    {name:'Proposal Stage',status:'In Progress',records:2,owner:'RC Pod',evidence:'Problem framing, scope, assumptions, CM2 pricing sheet',blocker:'',cta:'Open Proposal Workspace',workspace:'O2O Workspace'},
    {name:'Pre-Bid PAB',status:'In Progress',records:2,owner:'Rishabh / CXO Lead + Prateek / CXO Lead',evidence:'Proposal, CM2 sheet, feasibility validations, capacity read',blocker:'',cta:'Open Pre-Bid PAB',workspace:'PAB Governance'},
    {name:'Financial Approval Gate',status:'Blocked',records:3,owner:'CFO / Somesh',evidence:'CM2 sheet, commercial risk note, payment milestone draft',blocker:'[Source Rule] No proposal moves to bid submission without CFO sign-off.',cta:'Open CFO Queue',workspace:'Finance & CM2'},
    {name:'RFP & Bid Management',status:'Blocked',records:3,owner:'Tender Team',evidence:'RFP, technical bid, financial bid, EMD proof, submission acknowledgement',blocker:'[Source Rule] Won requires Award Communication evidence.',cta:'Open Bid Workspace',workspace:'O2O Workspace'},
    {name:'Post-Bid PAB',status:'Not Started',records:1,owner:'Rishabh / CXO Lead + Prateek / CXO Lead',evidence:'Capacity readiness, execution plan, risk register',blocker:'',cta:'Open Post-Bid PAB',workspace:'PAB Governance'},
    {name:'MOU Stage',status:'In Progress',records:2,owner:'GI + GI Lead',evidence:'Signed MOU upload and sign-offs',blocker:'[Source Rule] O2C starts only after signed MOU upload.',cta:'Open MOU Workspace',workspace:'O2O Workspace'}] },
  { name:'O2O → O2C Transition', purpose:'System-governed handover from signed MOU to execution readiness.', primaryOwner:'RC Pod', sourceRule:'[Source Rule] O2C starts only after signed MOU upload.', steps:[
    {name:'Signed MOU Uploaded',status:'In Progress',records:2,owner:'GI / GI Lead',evidence:'Signed MOU artifact',blocker:'',cta:'Review MOU Evidence',workspace:'O2O Workspace'},
    {name:'O2C Project Auto-Created',status:'In Progress',records:1,owner:'System + RC Pod',evidence:'Transition event in audit',blocker:'',cta:'Open Transition Record',workspace:'O2C Workspace'},
    {name:'RC Pod, Pod Sponsor, Business Lead, Products, Contract Value, CM2 Baseline carried forward',status:'Completed',records:1,owner:'RC Pod',evidence:'Carry-forward snapshot',blocker:'',cta:'Open Carry Forward Snapshot',workspace:'O2C Workspace'},
    {name:'Milestone Setup Pending',status:'Blocked',records:1,owner:'Delivery Pod Lead',evidence:'Milestone draft and owners',blocker:'Milestones not fully configured.',cta:'Open Milestone Setup',workspace:'O2C Workspace'}] },
  { name:'O2C: Signed MOU to Cash Realization', purpose:'Execute project-to-cash with evidence-led controls.', primaryOwner:'RC Pod + Finance Ops', sourceRule:'[Source Rule] Invoice trigger requires verified proof.', steps:[
    {name:'Milestone Setup',status:'In Progress',records:3,owner:'Delivery Pod Lead',evidence:'Milestone sequence, payment split, proof types',blocker:'',cta:'Open Milestones',workspace:'O2C Workspace'},
    {name:'Delivery Proof Upload',status:'In Progress',records:2,owner:'RC Pod + Delivery Pod User',evidence:'Proof, MoM, customer acknowledgement',blocker:'',cta:'Open Proof Upload',workspace:'O2C Workspace'},
    {name:'Proof Review and Acceptance',status:'Blocked',records:2,owner:'Finance Ops',evidence:'Verified proof decision',blocker:'Pending finance verification.',cta:'Open Proof Review',workspace:'O2C Workspace'},
    {name:'Invoice Trigger',status:'Blocked',records:2,owner:'Finance Ops',evidence:'Verified proof + invoice request',blocker:'[Source Rule] Invoice trigger requires verified proof.',cta:'Open Invoicing',workspace:'O2C Workspace'},
    {name:'Collections Tracking',status:'In Progress',records:2,owner:'Finance Ops + RC Pod',evidence:'Payment reference and outstanding amount',blocker:'',cta:'Open Collections',workspace:'O2C Workspace'},
    {name:'Expense and CM2 Tracking',status:'In Progress',records:1,owner:'CFO / Somesh + Finance Ops',evidence:'Baseline CM2 vs actual CM2',blocker:'',cta:'Open CM2 Tracker',workspace:'Finance & CM2'},
    {name:'Product Revenue Attribution',status:'Not Started',records:1,owner:'Portfolio Intelligence',evidence:'Product-level revenue mapping',blocker:'[Open Question] Final owner confirmation pending PRD clarification.',cta:'Open Attribution',workspace:'O2C Workspace'}] },
  { name:'Governance Interventions', purpose:'Handle cross-cutting risks and intervention-trigger workflows.', primaryOwner:'PAB Conveners + Sponsors', sourceRule:'[Source Rule] Mid-Project PAB triggers: scope change, timeline risk, margin erosion, government escalation, product change, delivery breakdown.', steps:[
    {name:'Mid-Project PAB',status:'In Progress',records:1,owner:'Rishabh / CXO Lead + Prateek / CXO Lead',evidence:'Trigger context, financial impact, updated plan',blocker:'',cta:'Open Mid-Project PAB',workspace:'PAB Governance'},
    {name:'Scope Change Log',status:'In Progress',records:2,owner:'Delivery Pod Lead',evidence:'Request details + decision + finance notified',blocker:'[Source Rule] Scope changes require 24h logging and 48h impact assessment.',cta:'Open Scope Change Log',workspace:'O2C Workspace'},
    {name:'Timeline Risk',status:'Blocked',records:1,owner:'Pod Sponsor',evidence:'Recovery plan and capacity read',blocker:'Capacity constraints unresolved.',cta:'Open Risk Register',workspace:'PAB Governance'},
    {name:'Margin Erosion / CM2 Variance',status:'Blocked',records:1,owner:'CFO / Somesh',evidence:'Variance analysis and correction action',blocker:'CM2 variance above tolerance.',cta:'Open CM2 Variance',workspace:'Finance & CM2'},
    {name:'Government Escalation',status:'In Progress',records:1,owner:'GI',evidence:'Escalation notes and stakeholder plan',blocker:'',cta:'Open Escalation Desk',workspace:'PAB Governance'},
    {name:'Product Change',status:'Not Started',records:0,owner:'Platform-track Sponsor',evidence:'Product feasibility and dependency impact',blocker:'',cta:'Open Product Change',workspace:'PAB Governance'},
    {name:'Delivery Breakdown',status:'Not Started',records:0,owner:'Delivery-track Sponsor',evidence:'Root-cause and recovery accountability',blocker:'',cta:'Open Delivery Breakdown',workspace:'PAB Governance'}] },
  { name:'Closure and Learning', purpose:'Close only after full collection and capture institutional learning.', primaryOwner:'RC Pod + Founders Office', sourceRule:'[Source Rule] Collection Complete requires 100% collection and RC Pod accountability continues until then.', steps:[
    {name:'Collection Complete',status:'Blocked',records:1,owner:'Finance Ops + RC Pod',evidence:'100% collection proof',blocker:'[Source Rule] Collection Complete requires 100% collection.',cta:'Open Collection Ledger',workspace:'O2C Workspace'},
    {name:'Post-Project PAB',status:'Not Started',records:1,owner:'Rishabh / CXO Lead + Prateek / CXO Lead',evidence:'Learning minutes and decisions',blocker:'Awaiting collection completion.',cta:'Open Post-Project PAB',workspace:'PAB Governance'},
    {name:'Commercial Learning',status:'Not Started',records:0,owner:'Business Lead',evidence:'Pricing assumptions review',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Delivery Learning',status:'Not Started',records:0,owner:'Delivery Pod Lead',evidence:'Timeline realism retrospective',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Product Learning',status:'Not Started',records:0,owner:'Platform-track Sponsor',evidence:'Product gap register',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Government Learning',status:'Not Started',records:0,owner:'GI',evidence:'Stakeholder pattern findings',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Financial Learning',status:'Not Started',records:0,owner:'CFO / Somesh',evidence:'CM2 and expense outcome analysis',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Operational Learning',status:'Not Started',records:0,owner:'RC Pod',evidence:'Execution drag and process bottlenecks',blocker:'',cta:'Open Learning Capture',workspace:'Governance Journey'},
    {name:'Archive',status:'Not Started',records:0,owner:'Admin',evidence:'Closure checklist and approval',blocker:'',cta:'Open Archive Control',workspace:'Admin / RBAC'}] }
];

const canMutate = (role: Role) => role !== 'Readonly' && role !== 'Founders Office' && role !== 'Portfolio Intelligence';

export default function App(){
  const [role,setRole]=useState<Role>('Admin');
  const [nav,setNav]=useState<Nav>('Governance Journey');
  const [openPhase,setOpenPhase]=useState<string | null>(PHASES[0].name);
  const [selectedStep,setSelectedStep]=useState<string>('Opportunity Registration');
  const [selectedRecord,setSelectedRecord]=useState<string>('OP-118');
  const [audit,setAudit]=useState<string[]>(['opportunity_created','proposal_submitted','pre_bid_pab_decision_recorded']);
  const queueCount = useMemo(()=>PHASES.flatMap(p=>p.steps).filter(s=>s.status==='Blocked' || s.status==='In Progress').length,[ ]);

  const phaseStats = (phase: Phase) => ({
    records: phase.steps.reduce((a,s)=>a+s.records,0),
    blocked: phase.steps.filter(s=>s.status==='Blocked').reduce((a,s)=>a+s.records,0),
    pending: phase.steps.filter(s=>s.status==='In Progress').reduce((a,s)=>a+s.records,0),
    overdue: phase.steps.filter(s=>s.status==='Blocked').length,
  });

  const openWorkspace = (workspace: Nav, step: string) => { setNav(workspace); setSelectedStep(step); };

  const stepDetail = useMemo(()=>PHASES.flatMap(p=>p.steps).find(s=>s.name===selectedStep),[selectedStep]);

  const lifecycleMap = <div className='space-y-4'>
    <Card title='O2O → O2C Governance Journey'>
      <p className='mb-2 text-sm'>Major phase → step → records/actions navigation. {roleFocus[role]}</p>
      <p className='text-sm'>No technical route labels are shown; business workflow labels only.</p>
    </Card>
    {PHASES.map((phase)=>{
      const stats = phaseStats(phase);
      return <Card key={phase.name} title={phase.name}>
        <div className='grid gap-2 text-sm md:grid-cols-3'>
          <p><b>Purpose:</b> {phase.purpose}</p><p><b>Records:</b> {stats.records} | <b>Blocked:</b> {stats.blocked}</p><p><b>Pending approvals:</b> {stats.pending} | <b>Overdue:</b> {stats.overdue}</p>
          <p><b>Primary owner:</b> {phase.primaryOwner}</p><p className='md:col-span-2'><b>Key source rule:</b> {phase.sourceRule}</p>
        </div>
        <button className='mt-3 rounded border px-3 py-1 text-sm' onClick={()=>setOpenPhase(openPhase===phase.name?null:phase.name)}>Open Phase</button>
        {openPhase===phase.name && <div className='mt-3 grid gap-3 md:grid-cols-2'>
          {phase.steps.map((step)=><div key={step.name} className='rounded border p-3 text-sm'>
            <p className='font-semibold'>{step.name}</p>
            <p>Status: <b>{step.status}</b></p><p>Records: {step.records}</p><p>Current owner role: {step.owner}</p>
            <p>Required evidence: {step.evidence}</p>
            <p>Blocking rule: {step.blocker || 'None'}</p>
            <button className='mt-2 rounded border px-2 py-1' onClick={()=>openWorkspace(step.workspace,step.name)}>{step.cta}</button>
          </div>)}
        </div>}
      </Card>;
    })}
  </div>;

  const workspace = <Card title={nav}>
    <p className='text-sm mb-3'>Current step: <b>{selectedStep}</b></p>
    <div className='grid gap-3 md:grid-cols-2'>
      <div className='rounded border p-3 text-sm'>
        <p className='font-semibold'>Records in step</p>
        <button className='mt-2 rounded border px-2 py-1' onClick={()=>setSelectedRecord('OP-118')}>OP-118 / PR-55</button>
      </div>
      <div className='rounded border p-3 text-sm'>
        <p className='font-semibold'>Step-specific actions</p>
        <p>Owner: {stepDetail?.owner}</p>
        <p>Evidence: {stepDetail?.evidence}</p>
        <p>Blocker: {stepDetail?.blocker || 'None'}</p>
        <button disabled={!canMutate(role)} title={!canMutate(role)?'Not permitted for selected role':''} className='mt-2 rounded border px-2 py-1 disabled:opacity-50'>Primary CTA: {stepDetail?.cta}</button>
      </div>
      <div className='rounded border p-3 text-sm md:col-span-2'>
        <p className='font-semibold'>Record detail panel — {selectedRecord}</p>
        <p>Status: {stepDetail?.status} | Assigned: {stepDetail?.owner}</p>
        <p>Audit: {audit.join(' → ')}</p>
      </div>
    </div>
  </Card>;

  const content = nav==='Governance Journey' ? lifecycleMap : workspace;

  return <AppShell
    sidebar={<Sidebar items={NAV_ITEMS} current={nav} setCurrent={(v)=>setNav(v as Nav)} />}
    role={role}
    roles={ROLES}
    onRoleChange={(r)=>setRole(r as Role)}
    queueCount={queueCount}
  >{content}</AppShell>;
}
