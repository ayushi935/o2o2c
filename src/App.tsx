import { useMemo, useState } from 'react';
import AppShell from './layout/AppShell';
import Sidebar from './layout/Sidebar';
import Card from './components/Card';
import DataTable from './components/DataTable';

type Role =
  | 'Admin'
  | 'BD'
  | 'GI'
  | 'RC Pod'
  | 'Business Lead'
  | 'GI Lead'
  | 'Pod Sponsor'
  | 'Delivery-track Sponsor'
  | 'Platform-track Sponsor'
  | 'Rishabh / CXO Lead'
  | 'Prateek / CXO Lead'
  | 'CFO / Somesh'
  | 'Finance Ops'
  | 'CCOO / Viprav'
  | 'Tender Team'
  | 'Delivery Pod Lead'
  | 'Delivery Pod User'
  | 'Program Pod User'
  | 'Mission M&E'
  | 'Founders Office'
  | 'Portfolio Intelligence'
  | 'Readonly';

type OpportunityStage = 'Opportunity Registration' | 'Proposal' | 'Pre-Bid PAB' | 'Financial Approval' | 'RFP/Bid' | 'Post-Bid PAB' | 'MOU' | 'O2C Transitioned';
type ProjectStage = 'Milestone Setup' | 'Proof Upload' | 'Invoice Trigger' | 'Collection Tracking' | 'CM2 Tracking' | 'Mid-Project PAB' | 'Post-Project PAB' | 'Collection Complete';

const ROLES: Role[] = [
  'Admin','BD','GI','RC Pod','Business Lead','GI Lead','Pod Sponsor','Delivery-track Sponsor','Platform-track Sponsor','Rishabh / CXO Lead','Prateek / CXO Lead','CFO / Somesh','Finance Ops','CCOO / Viprav','Tender Team','Delivery Pod Lead','Delivery Pod User','Program Pod User','Mission M&E','Founders Office','Portfolio Intelligence','Readonly'
];

const ACTIONS = [
  'Create opportunity','Edit opportunity','Request Pre-Bid PAB','Convene Pre-Bid PAB','Record Pre-Bid PAB decision','Validate platform feasibility','Validate delivery feasibility','Submit for financial approval','CFO sign-off','Lock CM2','Upload RFP','Upload technical bid','Upload financial bid','Upload EMD proof','Mark Bid Submitted','Upload Award Communication','Mark Won','Mark Lost','Mark No-Bid','Draft/update MOU','Upload Signed MOU','Trigger O2C transition','Create milestones','Edit milestones','Upload delivery proof','Upload MoM','Upload customer acknowledgement','Verify proof','Reject proof','Trigger invoice','Issue invoice','Record payment','Confirm collection','Log scope change','Assess scope change','Request Mid-Project PAB','Convene Mid-Project PAB','Complete Post-Project PAB','Archive record','Reactivate record','Soft delete record','Manage users','Manage roles','Manage checklist templates','Manage master data','View audit log','Export audit log'
] as const;

const PATHS = [
  '/executive-home','/o2o','/o2o/new','/o2o/OP-001','/o2o/OP-001/proposal','/o2o/OP-001/pre-bid-pab','/o2o/OP-001/financial-approval','/o2o/OP-001/rfp-bid','/o2o/OP-001/post-bid-pab','/o2o/OP-001/mou','/o2c','/o2c/PR-001','/o2c/PR-001/milestones','/o2c/PR-001/proofs','/o2c/PR-001/invoices','/o2c/PR-001/collections','/o2c/PR-001/cm2','/o2c/PR-001/scope-changes','/pab','/finance','/pod-capacity','/audit','/admin-rbac'
];

const NAV: Record<Role, string[]> = {
  Admin: PATHS,
  BD: ['/executive-home', '/o2o', '/o2o/new', '/o2o/OP-001', '/o2o/OP-001/proposal', '/audit'],
  GI: ['/executive-home', '/o2o', '/o2o/OP-001', '/o2o/OP-001/proposal', '/o2o/OP-001/rfp-bid', '/o2o/OP-001/mou'],
  'RC Pod': ['/executive-home','/o2o','/o2o/new','/o2o/OP-001','/o2o/OP-001/proposal','/o2c','/o2c/PR-001','/o2c/PR-001/milestones','/o2c/PR-001/proofs','/o2c/PR-001/collections','/o2c/PR-001/cm2','/audit'],
  'Business Lead': ['/executive-home', '/o2o', '/o2o/OP-001', '/o2o/OP-001/proposal', '/o2o/OP-001/rfp-bid'],
  'GI Lead': ['/executive-home', '/o2o', '/o2o/OP-001/mou', '/o2o/OP-001/proposal'],
  'Pod Sponsor': ['/executive-home', '/o2o', '/o2o/OP-001', '/o2c', '/o2c/PR-001', '/o2c/PR-001/scope-changes'],
  'Delivery-track Sponsor': ['/executive-home', '/o2c', '/o2c/PR-001', '/o2c/PR-001/scope-changes', '/pab'],
  'Platform-track Sponsor': ['/executive-home', '/o2o', '/o2o/OP-001/proposal', '/pab'],
  'Rishabh / CXO Lead': ['/executive-home', '/pab', '/o2o/OP-001/pre-bid-pab', '/o2c/PR-001/cm2', '/audit'],
  'Prateek / CXO Lead': ['/executive-home', '/pab', '/o2o/OP-001/pre-bid-pab', '/o2o/OP-001/post-bid-pab', '/audit'],
  'CFO / Somesh': ['/executive-home', '/finance', '/o2o/OP-001/financial-approval', '/o2o/OP-001/rfp-bid', '/audit'],
  'Finance Ops': ['/executive-home', '/o2c', '/o2c/PR-001/proofs', '/o2c/PR-001/invoices', '/o2c/PR-001/collections', '/audit'],
  'CCOO / Viprav': ['/executive-home', '/o2o/OP-001/rfp-bid', '/finance'],
  'Tender Team': ['/executive-home', '/o2o', '/o2o/OP-001/rfp-bid', '/audit'],
  'Delivery Pod Lead': ['/executive-home', '/o2c', '/o2c/PR-001/milestones', '/o2c/PR-001/scope-changes'],
  'Delivery Pod User': ['/executive-home', '/o2c', '/o2c/PR-001/proofs'],
  'Program Pod User': ['/executive-home', '/o2c', '/o2c/PR-001/proofs', '/o2c/PR-001/scope-changes'],
  'Mission M&E': ['/executive-home', '/o2c', '/o2c/PR-001', '/o2c/PR-001/cm2', '/pab'],
  'Founders Office': ['/executive-home', '/pab', '/o2c', '/audit'],
  'Portfolio Intelligence': ['/executive-home', '/o2c', '/audit'],
  Readonly: ['/executive-home', '/o2o', '/o2c', '/audit']
};

const PERMS: Record<Role, Set<string>> = Object.fromEntries(ROLES.map((r) => [r, new Set<string>()])) as Record<Role, Set<string>>;
const add = (role: Role, list: string[]) => list.forEach((a) => PERMS[role].add(a));
add('Admin', [...ACTIONS]);
add('BD', ['Create opportunity', 'Edit opportunity', 'Request Pre-Bid PAB', 'Submit for financial approval']);
add('GI', ['Edit opportunity', 'Upload technical bid', 'Draft/update MOU', 'Upload Signed MOU']);
add('RC Pod', ['Create opportunity', 'Edit opportunity', 'Request Pre-Bid PAB', 'Submit for financial approval', 'Create milestones', 'Upload delivery proof', 'Record payment', 'Request Mid-Project PAB']);
add('Business Lead', ['Edit opportunity', 'Mark Lost', 'Mark No-Bid', 'Submit for financial approval']);
add('GI Lead', ['Draft/update MOU', 'Upload Signed MOU']);
add('Pod Sponsor', ['Assess scope change', 'Mark Lost', 'Mark No-Bid', 'Archive record']);
add('Delivery-track Sponsor', ['Assess scope change', 'Request Mid-Project PAB']);
add('Platform-track Sponsor', ['Validate platform feasibility']);
add('Rishabh / CXO Lead', ['Convene Pre-Bid PAB', 'Validate platform feasibility', 'Convene Mid-Project PAB']);
add('Prateek / CXO Lead', ['Convene Pre-Bid PAB', 'Validate delivery feasibility', 'Convene Mid-Project PAB']);
add('CFO / Somesh', ['CFO sign-off', 'Lock CM2']);
add('Finance Ops', ['Verify proof', 'Reject proof', 'Issue invoice', 'Confirm collection', 'Record payment', 'View audit log']);
add('CCOO / Viprav', ['Upload financial bid']);
add('Tender Team', ['Upload RFP', 'Upload technical bid', 'Upload financial bid', 'Upload EMD proof', 'Mark Bid Submitted', 'Upload Award Communication', 'Mark Won', 'Mark Lost', 'Mark No-Bid']);
add('Delivery Pod Lead', ['Edit milestones', 'Log scope change', 'Assess scope change']);
add('Delivery Pod User', ['Upload delivery proof']);
add('Program Pod User', ['Upload MoM', 'Upload customer acknowledgement', 'Request Mid-Project PAB']);
add('Mission M&E', ['Request Mid-Project PAB']);
add('Founders Office', ['View audit log']);
add('Portfolio Intelligence', ['View audit log']);

export default function App() {
  const [role, setRole] = useState<Role>('Admin');
  const [path, setPath] = useState('/executive-home');
  const [oppStage, setOppStage] = useState<OpportunityStage>('Opportunity Registration');
  const [projectStage, setProjectStage] = useState<ProjectStage>('Milestone Setup');
  const [cfoSigned, setCfoSigned] = useState(false);
  const [awardEvidence, setAwardEvidence] = useState(false);
  const [signedMou, setSignedMou] = useState(false);
  const [proofVerified, setProofVerified] = useState(false);
  const [collectionPct, setCollectionPct] = useState(0);
  const [audit, setAudit] = useState<string[]>(['opportunity_created', 'stage_changed:Opportunity Registration']);

  const can = (action: string) => PERMS[role].has(action);
  const addAudit = (event: string) => setAudit((prev: string[]) => [`${new Date().toISOString()} ${event}`, ...prev]);

  const actionBtn = (label: string, onClick: () => void, blocker?: string) => (
    <button
      disabled={!can(label) || Boolean(blocker) || role === 'Readonly'}
      title={!can(label) || role === 'Readonly' ? 'Not permitted for selected role' : blocker}
      className='rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50'
      onClick={onClick}
    >
      {label} {blocker ? '[Source Rule]' : ''}
    </button>
  );

  const body = useMemo(() => {
    if (path === '/admin-rbac') {
      return <Card title='Admin / RBAC Matrix'>
        <p className='mb-2 text-sm'>Source-confirmed roles shown directly. Unconfirmed ownerships are tagged [Open Question] and recommendations [Recommendation].</p>
        <DataTable cols={['Role', 'Portal visibility', 'Approval rights', 'Audit visibility']} rows={ROLES.map((r) => [r, NAV[r].join(', '), PERMS[r].has('CFO sign-off') || PERMS[r].has('Record Pre-Bid PAB decision') ? 'Yes' : 'No', PERMS[r].has('View audit log') || r === 'Admin' ? 'Yes' : 'Limited'])} />
        <div className='mt-3'><DataTable cols={['Action permission', 'Selected role']} rows={ACTIONS.map((a) => [a, can(a) ? 'Allowed' : 'Not permitted for selected role'])} /></div>
      </Card>;
    }

    if (path === '/o2o') return <Card title='O2O Portal Workflow'>
      <p className='mb-2 text-sm'>Journey: Opportunity Registration → Proposal → Pre-Bid PAB → Financial Approval → RFP/Bid → Post-Bid PAB → MOU Upload → O2C Transition.</p>
      <p className='mb-2 text-sm'>Current Stage: <b>{oppStage}</b></p>
      <div className='flex flex-wrap gap-2'>
        {actionBtn('Create opportunity', () => { setOppStage('Opportunity Registration'); addAudit('opportunity_created'); setPath('/o2o/new'); })}
        {actionBtn('Submit for financial approval', () => { setOppStage('Financial Approval'); addAudit('proposal_submitted'); setPath('/o2o/OP-001/financial-approval'); })}
        {actionBtn('CFO sign-off', () => { setCfoSigned(true); setOppStage('RFP/Bid'); addAudit('cfo_signoff_recorded'); })}
        {actionBtn('Mark Bid Submitted', () => addAudit('bid_submitted'), cfoSigned ? undefined : 'CFO sign-off missing')}
        {actionBtn('Upload Award Communication', () => { setAwardEvidence(true); addAudit('award_communication_uploaded'); })}
        {actionBtn('Mark Won', () => { setOppStage('Post-Bid PAB'); addAudit('status_changed:Won'); }, awardEvidence ? undefined : 'Award Communication evidence missing')}
        {actionBtn('Upload Signed MOU', () => { setSignedMou(true); setOppStage('MOU'); addAudit('mou_uploaded'); setPath('/o2o/OP-001/mou'); })}
        {actionBtn('Trigger O2C transition', () => { setOppStage('O2C Transitioned'); addAudit('o2o_to_o2c_transition_created'); setPath('/o2c/PR-001'); }, signedMou ? undefined : 'Signed MOU missing')}
      </div>
    </Card>;

    if (path.startsWith('/o2c')) return <Card title='O2C Execution Workflow'>
      <p className='mb-2 text-sm'>Journey: Milestone Setup → Proof Upload → Invoice Trigger → Collection Tracking → CM2 Tracking → Mid-Project PAB → Post-Project PAB → Collection Complete.</p>
      <p className='mb-2 text-sm'>Project Stage: <b>{projectStage}</b> | Collection: <b>{collectionPct}%</b> (RC Pod accountable until 100% [Source Rule])</p>
      <div className='flex flex-wrap gap-2'>
        {actionBtn('Create milestones', () => { setProjectStage('Milestone Setup'); addAudit('milestone_created'); setPath('/o2c/PR-001/milestones'); })}
        {actionBtn('Upload delivery proof', () => { setProjectStage('Proof Upload'); addAudit('proof_uploaded'); setPath('/o2c/PR-001/proofs'); })}
        {actionBtn('Verify proof', () => { setProofVerified(true); addAudit('proof_verified'); })}
        {actionBtn('Issue invoice', () => { setProjectStage('Invoice Trigger'); addAudit('invoice_issued'); setPath('/o2c/PR-001/invoices'); }, proofVerified ? undefined : 'Proof not verified')}
        {actionBtn('Record payment', () => { const next = Math.min(collectionPct + 50, 100); setCollectionPct(next); setProjectStage(next === 100 ? 'Collection Complete' : 'Collection Tracking'); addAudit('collection_updated'); setPath('/o2c/PR-001/collections'); })}
        {actionBtn('Request Mid-Project PAB', () => { setProjectStage('Mid-Project PAB'); addAudit('mid_project_pab_requested'); })}
        {actionBtn('Complete Post-Project PAB', () => { setProjectStage('Post-Project PAB'); addAudit('post_project_pab_completed'); })}
      </div>
    </Card>;

    if (path === '/audit') return <Card title='Audit Trail'>
      <p className='mb-2'>{(can('View audit log') || role === 'Admin') ? 'Visible for selected role.' : 'Not permitted for selected role'}</p>
      {actionBtn('Export audit log', () => addAudit('audit_exported'))}
      <ul className='mt-3 list-disc pl-6 text-sm'>{audit.map((a) => <li key={a}>{a}</li>)}</ul>
    </Card>;

    return <Card title='Executive Home'>
      <p className='text-sm'>Clickable portal mode enabled. Sidebar/page visibility, CTA visibility, approvals, and blockers are all role-sensitive.</p>
      <p className='mt-2 text-sm'>[Source Rule] No role can bypass CFO gate, Award evidence gate, or Signed-MOU gate.</p>
      <p className='mt-2 text-sm'>[Recommendation] Portfolio Intelligence is read-heavy unless PRD confirms action ownership.</p>
      <p className='mt-2 text-sm'>[Open Question] Final owner for some cross-functional approvals remains flagged in RBAC matrix.</p>
    </Card>;
  }, [path, role, oppStage, projectStage, cfoSigned, awardEvidence, signedMou, proofVerified, collectionPct, audit]);

  return <AppShell
    sidebar={<Sidebar items={NAV[role]} current={path} setCurrent={setPath} />}
    role={role}
    roles={ROLES}
    onRoleChange={(r: string) => { const next = r as Role; setRole(next); setPath(NAV[next][0]); }}
  >
    {body}
  </AppShell>;
}
