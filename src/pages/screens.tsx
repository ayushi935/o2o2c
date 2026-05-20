import ActionPanel from '../components/ActionPanel';
import Badge from '../components/Badge';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import Drawer from '../components/Drawer';
import EvidenceChecklist from '../components/EvidenceChecklist';
import LifecycleStepper from '../components/LifecycleStepper';
import MetricCard from '../components/MetricCard';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { auditEvents, cm2Records, milestones, opportunities, pabMeetings, podCapacity, projects, rbacRows } from '../data/mockData';

export const screenNames = ['Executive Home','O2O Pipeline','Opportunity Detail','PAB Governance','Financial Approval Queue','RFP & Bid Management','MOU Workspace','O2C Projects','O2C Project Detail','Milestone-to-Cash Tracker','Finance & CM2 Dashboard','Pod Capacity Dashboard','Audit Log','Admin / RBAC'];

export const screens: Record<string, JSX.Element> = {
  'Executive Home': <div className='grid gap-3 md:grid-cols-4'>
    <MetricCard label='Active Opportunities' value={opportunities.length} />
    <MetricCard label='Open Blockers' value={opportunities.flatMap((o) => o.blockers).length} />
    <MetricCard label='Live O2C Projects' value={projects.length} />
    <MetricCard label='Realization' value='64%' />
    <Card title='Guardrails'><EvidenceChecklist items={[{ label:'Orders Won derived from evidence records (not Kanban columns)', ok:true },{ label:'Soft deleted records retained in audit', ok:true },{ label:'Revenue Capture Pod accountable until 100% collection', ok:true }]} /></Card>
  </div>,
  'O2O Pipeline': <Card title='Opportunity Governance Pipeline'><DataTable cols={['Opportunity','Stage','Owner','Value (Cr)','Blockers']} rows={opportunities.map((o) => [o.name, <StatusBadge status={o.stage} />, o.owner, o.valueCr, o.blockers.join(', ') || '—'])} /></Card>,
  'Opportunity Detail': <div className='space-y-3'><Card title='UP School Digital Labs'><LifecycleStepper steps={['Sourcing','Pre-Bid PAB','Bid','Negotiation','Won']} current={2} /><div className='mt-3'><EvidenceChecklist items={[{label:'CFO sign-off completed',ok:false},{label:'Award communication evidence uploaded',ok:false},{label:'Signed MOU uploaded',ok:false}]} /></div></Card><ActionPanel>Bid submission is blocked until CFO sign-off.</ActionPanel></div>,
  'PAB Governance': <Card title='PAB Decisions'><DataTable cols={['ID','Type','Decision','Context','Trigger']} rows={pabMeetings.map((p) => [p.id,p.type,<Badge text={p.decision} />,p.context,p.trigger || '—'])} /></Card>,
  'Financial Approval Queue': <Card title='Approvals'><DataTable cols={['Item','Rule Check','Status']} rows={[['BD-77','CFO sign-off required before submission','Blocked'],['INV-33','Margin erosion >5% requires mid-project PAB','Escalated']]} /></Card>,
  'RFP & Bid Management': <Card title='RFP and Bid Governance'><DataTable cols={['Bid','Linked Opp','CFO Sign-off','Award Evidence','Submission']} rows={[['BD-77','UP School Digital Labs','Missing','N/A','Blocked'],['BD-72','Bihar FLN Expansion','Completed','Uploaded','Submitted']]} /></Card>,
  'MOU Workspace': <Drawer title='MOU Upload Registry'><DataTable cols={['Opportunity','Signed MOU','O2C Transition']} rows={opportunities.map((o) => [o.name, o.signedMou ? 'Uploaded' : 'Missing', o.signedMou ? 'Allowed' : 'Blocked'])} /></Drawer>,
  'O2C Projects': <Card title='Project Portfolio'><DataTable cols={['Project','Pod Owner','Collection%','Status','Risk']} rows={projects.map((p) => [p.name,p.podOwner,p.collectionPct,p.status,p.risk])} /></Card>,
  'O2C Project Detail': <div className='space-y-3'><Card title='Bihar FLN Expansion'><EvidenceChecklist items={[{label:'Signed MOU recorded before O2C kickoff',ok:true},{label:'Revenue Capture Pod retained until 100% collection',ok:false}]} /></Card><Modal title='Mid-Project PAB Trigger'>Timeline risk and margin erosion triggered governance review.</Modal></div>,
  'Milestone-to-Cash Tracker': <Card title='Milestone Cashflow'><DataTable cols={['Milestone','Amount (L)','Delivery','Invoice','Collection']} rows={milestones.map((m) => [m.name,m.amountL,m.delivered?'Done':'Pending',m.invoiced?'Done':'Pending',m.collected?'Done':'Pending'])} /></Card>,
  'Finance & CM2 Dashboard': <Card title='CM2 Oversight'><DataTable cols={['Project ID','Budget L','Actual L','CM2%']} rows={cm2Records.map((c) => [c.projectId,c.budgetL,c.actualL,c.cm2Pct])} /></Card>,
  'Pod Capacity Dashboard': <Card title='Pod Capacity and Load'><DataTable cols={['Pod','Used','Total','Utilization']} rows={podCapacity.map((p) => [p.pod,p.used,p.total,`${Math.round((p.used / p.total) * 100)}%`])} /></Card>,
  'Audit Log': <Card title='Audit Trail'><DataTable cols={['Time','Entity','Action','Actor']} rows={auditEvents.map((a) => [a.ts,a.entity,`${a.action}${a.softDeleted ? ' (soft-delete retained)' : ''}`,a.actor])} /></Card>,
  'Admin / RBAC': <Card title='Roles & Permissions'><DataTable cols={['Role','Permissions']} rows={rbacRows.map((r) => [r.role,r.permissions.join(', ')])} /></Card>,
};
