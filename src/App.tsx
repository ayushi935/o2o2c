import { useMemo, useState } from 'react';
import Card from './components/Card';
import DataTable from './components/DataTable';

type Role = 'Admin'|'BD'|'GI'|'RC Pod'|'Business Lead'|'GI Lead'|'Pod Sponsor'|'Delivery-track Sponsor'|'Platform-track Sponsor'|'Rishabh / CXO Lead'|'Prateek / CXO Lead'|'CFO / Somesh'|'Finance Ops'|'CCOO / Viprav'|'Tender Team'|'Delivery Pod Lead'|'Delivery Pod User'|'Program Pod User'|'Mission M&E'|'Founders Office'|'Portfolio Intelligence'|'Readonly';
type TopNav = 'O2O Tracker'|'O2C Tracker'|'PAB Governance'|'Finance & CM2'|'Admin'|'Audit Log';
type ChecklistStatus = 'Not completed'|'Completed'|'Not required';

type Opportunity = { id:string; name:string; stage:string; status:string; customer:string; type:'B2G'|'B2B'; motion:'Farming'|'Hunting'; products:string[]; value:number; owner:string; rcPod:string; podSponsor:string; blocker:string; nextAction:string; comments:number; files:number; days:number; cfoSigned:boolean; awardUploaded:boolean; mouUploaded:boolean; checklist: { id:string; title:string; required:boolean; gating:boolean; evidence:string; rule?:string; status:ChecklistStatus; comment:string }[] };
type O2CProject = { id:string; name:string; customer:string; stage:string; contractValue:number; collected:number; rcPod:string; podSponsor:string; financeOwner:string; blocker:string; nextAction:string; proofVerified:boolean; cm2Variance:number };

type Audit = { time:string; user:string; event:string; entity:string; ref:string; details:string };

const ROLES: Role[] = ['Admin','BD','GI','RC Pod','Business Lead','GI Lead','Pod Sponsor','Delivery-track Sponsor','Platform-track Sponsor','Rishabh / CXO Lead','Prateek / CXO Lead','CFO / Somesh','Finance Ops','CCOO / Viprav','Tender Team','Delivery Pod Lead','Delivery Pod User','Program Pod User','Mission M&E','Founders Office','Portfolio Intelligence','Readonly'];
const STAGES = ['Opportunity Registration','Proposal Stage','Pre-Bid PAB','Financial Approval Gate','RFP & Bid Management','Post-Bid PAB','MOU Stage','O2C Transition Ready'];
const O2C_STAGES = ['Milestone Setup','Delivery Proof Upload','Proof Review','Invoice Trigger','Collection Tracking','Expense & CM2 Tracking','Collection Complete','Post-Project PAB'];

const baseChecklist = [
  { id:'c1', title:'Pre-Bid PAB approval recorded', required:true, gating:true, evidence:'PAB minutes', rule:'[Source Rule] PAB gate required', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c2', title:'Platform feasibility validated', required:true, gating:true, evidence:'Feasibility note', rule:'[Source Rule] Required before bid', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c3', title:'Delivery feasibility validated', required:true, gating:true, evidence:'Capacity read', rule:'[Source Rule] Required before bid', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c4', title:'CFO sign-off obtained', required:true, gating:true, evidence:'Signed CM2 approval', rule:'[Source Rule] CFO sign-off required before bid submission.', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c5', title:'Award communication uploaded', required:true, gating:true, evidence:'Award letter', rule:'[Source Rule] Award Communication evidence required to mark Won.', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c6', title:'Signed MOU uploaded', required:true, gating:true, evidence:'Signed MOU PDF', rule:'[Source Rule] Signed MOU required before O2C transition.', status:'Not completed' as ChecklistStatus, comment:'' },
  { id:'c7', title:'Stakeholder mapping review', required:false, gating:false, evidence:'Stakeholder map', status:'Not required' as ChecklistStatus, comment:'' },
];

const can = (r: Role, action: string) => {
  if (r === 'Admin') return true;
  if (r === 'Readonly') return false;
  const map: Record<Role, string[]> = {
    Admin:[],BD:['Add Opportunity','Edit Opportunity','Advance Stage','Add Comment'],GI:['Edit Opportunity','Upload Signed MOU'], 'RC Pod':['Add Opportunity','Advance Stage','Upload Proof','Record Collection'], 'Business Lead':['Edit Opportunity','Mark Lost'], 'GI Lead':['Upload Signed MOU'], 'Pod Sponsor':['Record PAB'], 'Delivery-track Sponsor':['Record PAB'], 'Platform-track Sponsor':['Record PAB'], 'Rishabh / CXO Lead':['Record PAB'], 'Prateek / CXO Lead':['Record PAB'], 'CFO / Somesh':['CFO Sign-off','Lock CM2'], 'Finance Ops':['Verify Proof','Issue Invoice','Record Collection'], 'CCOO / Viprav':['Review Pricing'], 'Tender Team':['Mark Bid Submitted','Upload Award Communication','Mark Won'], 'Delivery Pod Lead':['Add Milestone','Upload Proof'], 'Delivery Pod User':['Upload Proof'], 'Program Pod User':['Upload Proof'], 'Mission M&E':['View'], 'Founders Office':['View'], 'Portfolio Intelligence':['View'], Readonly:[]
  };
  return map[r].includes(action);
};

export default function App(){
  const [role,setRole] = useState<Role>('Admin');
  const [nav,setNav] = useState<TopNav>('O2O Tracker');
  const [opps,setOpps] = useState<Opportunity[]>([{ id:'OP-118', name:'UP Digital Labs', stage:'Financial Approval Gate', status:'Active', customer:'UP Education Dept', type:'B2G', motion:'Hunting', products:['LMS','Assessment'], value:24, owner:'Rohit', rcPod:'RC North', podSponsor:'Sponsor A', blocker:'CFO sign-off pending', nextAction:'Open CFO Queue', comments:4, files:7, days:9, cfoSigned:false, awardUploaded:false, mouUploaded:false, checklist: structuredClone(baseChecklist) }]);
  const [projects,setProjects] = useState<O2CProject[]>([]);
  const [audit,setAudit] = useState<Audit[]>([{time:new Date().toISOString(), user:'System', event:'opportunity_created', entity:'Opportunity', ref:'OP-118', details:'Seed record'}]);
  const [showAdd,setShowAdd] = useState(false);
  const [selectedOpp,setSelectedOpp] = useState<string | null>(null);
  const [selectedProject,setSelectedProject] = useState<string | null>(null);
  const [oppTab,setOppTab] = useState('Checklist');
  const [projTab,setProjTab] = useState('Milestones');

  const addAudit = (event:string, entity:string, ref:string, details:string)=>setAudit(a=>[{time:new Date().toISOString(), user:role, event, entity, ref, details},...a]);

  const kpi = useMemo(()=>({ total: opps.reduce((a,o)=>a+o.value,0), weighted: opps.reduce((a,o)=>a+o.value*0.5,0), high: opps.filter(o=>o.value>20).length, won: opps.filter(o=>o.awardUploaded).length, pab: opps.filter(o=>o.stage==='Pre-Bid PAB').length, cfo: opps.filter(o=>o.stage==='Financial Approval Gate').length, mou: opps.filter(o=>o.stage==='MOU Stage').length, ready: opps.filter(o=>o.stage==='O2C Transition Ready').length }),[opps]);

  const openOpp = opps.find(o=>o.id===selectedOpp);
  const openProject = projects.find(p=>p.id===selectedProject);

  const moveStage = (opp: Opportunity, direction: 1|-1) => {
    const idx = STAGES.indexOf(opp.stage); const ni = Math.max(0, Math.min(STAGES.length-1, idx+direction));
    const missing = opp.checklist.filter(c=>c.required && c.status!=='Completed').length;
    if (direction===1 && missing>0) return;
    setOpps(list=>list.map(o=>o.id===opp.id?{...o,stage:STAGES[ni],days:0}:o)); addAudit('stage_changed','Opportunity',opp.id,`Moved to ${STAGES[ni]}`);
  };

  const topNav = <div className='bg-indigo-700 text-white'><div className='mx-auto max-w-[1400px] p-3 flex flex-wrap items-center gap-3 justify-between'>
    <div className='font-semibold'>ConveGenius O2O → O2C Governance Tracker</div>
    <div className='text-xs'>{new Date().toDateString()}</div>
    <input className='rounded px-2 py-1 text-black text-sm' placeholder='Search opportunities/projects' />
    <span className='text-xs'>🔔 3</span><span className='text-xs'>User: Demo</span><span className='rounded bg-indigo-900 px-2 py-1 text-xs'>{role}</span>
    <select className='rounded text-black px-2 py-1 text-sm' value={role} onChange={e=>setRole(e.target.value as Role)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select><button className='text-xs underline'>Logout</button>
  </div>
  <div className='mx-auto max-w-[1400px] px-3 pb-2 flex gap-2 text-sm'>{(['O2O Tracker','O2C Tracker','PAB Governance','Finance & CM2','Admin','Audit Log'] as TopNav[]).map(n=><button key={n} className={`rounded px-3 py-1 ${nav===n?'bg-white text-indigo-700':'bg-indigo-800'}`} onClick={()=>setNav(n)}>{n}</button>)}</div></div>;

  const o2oBoard = <div className='space-y-3'>
    <div className='grid gap-2 md:grid-cols-4'>{[
      ['Total Pipeline',`₹${kpi.total} Cr`],['Weighted Pipeline',`₹${kpi.weighted.toFixed(1)} Cr`],['High Confidence Opportunities',kpi.high],['Evidence-backed Orders Won',kpi.won],['Awaiting PAB',kpi.pab],['Awaiting CFO Approval',kpi.cfo],['MOU Pending',kpi.mou],['O2C Transition Ready',kpi.ready]
    ].map(([k,v])=><Card key={String(k)}><p className='text-xs text-slate-500'>{k}</p><p className='text-lg font-semibold'>{v}</p></Card>)}</div>
    <Card title='Filters'><div className='grid gap-2 md:grid-cols-5 text-sm'>{['Type','Product','Geography','Stage','Status','Salesperson / Owner','Pod Sponsor','RC Pod'].map(f=><input key={f} placeholder={f} className='rounded border px-2 py-1'/>)}<label className='flex items-center gap-1'><input type='checkbox'/>Show archived</label></div></Card>
    <div className='overflow-auto'><div className='flex gap-3 min-w-[1700px]'>{STAGES.map(stage=>{const list=opps.filter(o=>o.stage===stage); const sum=list.reduce((a,o)=>a+o.value,0); return <div key={stage} className='w-80 rounded-xl border bg-slate-50 p-2'>
      <div className='mb-2'><p className='font-semibold text-sm'>{stage}</p><p className='text-xs text-slate-500'>Count: {list.length} | Value: ₹{sum} Cr</p></div>
      <div className='space-y-2'>{list.map(o=><button key={o.id} className='w-full rounded border bg-white p-2 text-left text-xs' onClick={()=>setSelectedOpp(o.id)}>
        <div className='flex justify-between'><b>{o.name}</b><span className='rounded bg-blue-100 px-1'>{o.status}</span></div><p>{o.customer}</p><p>{o.type} • {o.motion}</p><p>Products: {o.products.join(', ')}</p><p>₹{o.value} Cr | Checklist {o.checklist.filter(c=>c.status==='Completed').length}/{o.checklist.length}</p><p>Comments {o.comments} • Files {o.files} • Days {o.days}</p><p>RC Pod: {o.rcPod} | Sponsor: {o.podSponsor}</p><p className='text-rose-600'>Blocker: {o.blocker}</p><p>Next: {o.nextAction}</p>
      </button>)}</div></div>;})}</div></div>
    <button onClick={()=>setShowAdd(true)} className='rounded bg-indigo-600 px-3 py-2 text-white'>+ Add Opportunity</button>
  </div>;

  const o2cBoard = <div className='space-y-3'><div className='grid gap-2 md:grid-cols-3'>{[['Total Contract Value in O2C',`₹${projects.reduce((a,p)=>a+p.contractValue,0)} Cr`],['Collected Value',`₹${projects.reduce((a,p)=>a+p.collected,0)} Cr`],['Outstanding Value',`₹${projects.reduce((a,p)=>a+(p.contractValue-p.collected),0)} Cr`],['Collection %',`${projects.length?Math.round(projects.reduce((a,p)=>a+(p.collected/p.contractValue*100),0)/projects.length):0}%`],['Milestones Due',projects.length],['Proof Pending',projects.filter(p=>!p.proofVerified).length],['Invoice Pending',projects.filter(p=>p.stage==='Invoice Trigger').length],['Collection Delayed',projects.filter(p=>p.stage==='Collection Tracking').length],['CM2 Variance Alerts',projects.filter(p=>p.cm2Variance<0).length]].map(([k,v])=><Card key={String(k)}><p className='text-xs text-slate-500'>{k}</p><p className='font-semibold'>{v}</p></Card>)}</div>
  <div className='overflow-auto'><div className='flex min-w-[1700px] gap-3'>{O2C_STAGES.map(stage=>{const list=projects.filter(p=>p.stage===stage); return <div key={stage} className='w-80 rounded-xl border bg-slate-50 p-2'><p className='font-semibold text-sm'>{stage}</p>{list.map(p=><button onClick={()=>setSelectedProject(p.id)} key={p.id} className='mt-2 w-full rounded border bg-white p-2 text-left text-xs'><b>{p.name}</b><p>{p.customer}</p><p>₹{p.contractValue} Cr | Collected ₹{p.collected} Cr</p><p>RC Pod {p.rcPod} | Sponsor {p.podSponsor}</p><p>CM2 variance {p.cm2Variance}%</p><p className='text-rose-600'>{p.blocker}</p></button>)}</div>;})}</div></div></div>;

  const pabPage = <Card title='PAB Governance'><DataTable cols={['PAB type','Linked opportunity/project','Conveners','Mandatory participants','Optional participants','Status','Decision','Conditions','Date','Pending action']} rows={[['Pre-Bid PAB','OP-118','Rishabh + Prateek','RC Pod, Rishabh, Prateek, Pod Sponsor','Finance Ops','Scheduled','-','-','2026-05-20','Record decision']]} /></Card>;
  const financePage = <Card title='Finance & CM2'><DataTable cols={['Queue','Record','Pending reason']} rows={[['CFO approval queue','OP-118','Awaiting CFO sign-off'],['Proof review queue','PR-1 / M1','Proof pending verification'],['Invoice trigger queue','PR-1 / M1','[Source Rule] Proof verification required before invoice trigger.'],['Collection delayed queue','PR-1','Outstanding overdue'],['CM2 variance table','PR-1','-6% variance'],['Third-party expense approvals','PR-1','Pending approval'],['Actual vs approved CM2','PR-1','22% vs 28%']]} /></Card>;
  const adminPage = <Card title='Admin'><div className='grid gap-2 md:grid-cols-3'>{['Users','Roles','Checklist Templates','Dropdowns','Products','Customers / Departments','Pod Mapping','PAB Templates','Approval Rights'].map(t=><button key={t} className='rounded border p-2 text-left text-sm'>{t}</button>)}</div></Card>;
  const auditPage = <Card title='Audit Log'><DataTable cols={['Time','User','Event','Entity','Opportunity / Project','Details']} rows={audit.map(a=>[a.time,a.user,a.event,a.entity,a.ref,a.details])} /></Card>;

  return <div className='min-h-screen bg-white'>
    {topNav}
    <main className='mx-auto max-w-[1400px] p-4'>{nav==='O2O Tracker'?o2oBoard:nav==='O2C Tracker'?o2cBoard:nav==='PAB Governance'?pabPage:nav==='Finance & CM2'?financePage:nav==='Admin'?adminPage:auditPage}</main>

    {showAdd && <div className='fixed inset-0 bg-black/30 p-4'><div className='mx-auto max-w-3xl rounded bg-white p-4'><h3 className='mb-2 font-semibold'>Add Opportunity</h3><div className='grid gap-2 md:grid-cols-2 text-sm'>{['Opportunity name','Department / customer','Farming / Hunting','Type: B2G / B2B','State / geography multi-select','Product multi-select','Estimated value','Expected closing date','BD owner','GI owner','Revenue Capture Pod','Pod Sponsor','Budget signal','Competitor intelligence','Stakeholder mapping notes'].map(f=><input key={f} placeholder={f} className='rounded border px-2 py-1' />)}</div><div className='mt-3 flex justify-end gap-2'><button onClick={()=>setShowAdd(false)} className='rounded border px-3 py-1'>Cancel</button><button onClick={()=>{const id=`OP-${Math.floor(Math.random()*900+100)}`; setOpps(o=>[{...o[0],id,name:`New Opportunity ${id}`,stage:'Opportunity Registration',status:'Active'},...o]); addAudit('opportunity_created','Opportunity',id,'Created from add modal'); setShowAdd(false);}} className='rounded bg-indigo-600 px-3 py-1 text-white'>Add Opportunity</button></div></div></div>}

    {openOpp && <div className='fixed inset-0 bg-black/40 p-4 overflow-auto'><div className='mx-auto max-w-6xl rounded bg-white p-4 text-sm'>
      <div className='flex justify-between'><div><h3 className='text-lg font-semibold'>{openOpp.name}</h3><p>{openOpp.stage} • {openOpp.status} • {openOpp.type} • {openOpp.motion}</p></div><button onClick={()=>setSelectedOpp(null)}>Close</button></div>
      <p className='mt-1'>{openOpp.customer} | ₹{openOpp.value} Cr | Products: {openOpp.products.join(', ')} | RC Pod: {openOpp.rcPod} | BD: {openOpp.owner} | GI: GI User | Sponsor: {openOpp.podSponsor} | Days: {openOpp.days}</p>
      <p className='mt-2 rounded bg-slate-100 p-2'>Checklist addressed: {openOpp.checklist.filter(c=>c.status==='Completed').length}/{openOpp.checklist.length} • Evidence health: {openOpp.files} files • Pending blockers: {openOpp.checklist.filter(c=>c.required&&c.status!=='Completed').length} • Current required action: {openOpp.nextAction}</p>
      <div className='my-3 flex flex-wrap gap-2'>{['Checklist','Comments','Files','PAB','Financials / CM2','RFP & Bid','MOU','O2C Handover','Activity / Audit'].map(t=><button key={t} onClick={()=>setOppTab(t)} className={`rounded border px-2 py-1 ${oppTab===t?'bg-indigo-600 text-white':''}`}>{t}</button>)}</div>
      {oppTab==='Checklist' && <div className='space-y-2'>{openOpp.checklist.map(ci=><div key={ci.id} className='rounded border p-2'><p className='font-medium'>{ci.title} {ci.required?'(Required)':'(Optional)'} {ci.gating?'[Gating]':''}</p><select value={ci.status} onChange={e=>setOpps(list=>list.map(o=>o.id!==openOpp.id?o:{...o,checklist:o.checklist.map(c=>c.id===ci.id?{...c,status:e.target.value as ChecklistStatus}:c)}))} className='mt-1 rounded border px-2 py-1'><option>Not completed</option><option>Completed</option><option>Not required</option></select><input placeholder='Comment' className='ml-2 rounded border px-2 py-1'/><button className='ml-2 rounded border px-2 py-1'>Attach file</button><p>Required evidence: {ci.evidence}</p><p>{ci.rule||'No blocking rule'}</p></div>)}
      <p className={`rounded p-2 ${openOpp.checklist.filter(c=>c.required&&c.status!=='Completed').length===0?'bg-emerald-100':'bg-rose-100'}`}>{openOpp.checklist.filter(c=>c.required&&c.status!=='Completed').length===0?'All required items addressed — ready to advance':`${openOpp.checklist.filter(c=>c.required&&c.status!=='Completed').length} required item(s) pending before this opportunity can advance`}</p>
      <div className='flex gap-2'><button className='rounded border px-2 py-1' onClick={()=>moveStage(openOpp,-1)}>Move back to previous stage</button><button className='rounded border px-2 py-1' onClick={()=>moveStage(openOpp,1)}>Advance to next stage</button></div>
      </div>}
      {oppTab==='PAB' && <div><p>Conveners: Rishabh + Prateek</p><p>Mandatory: RC Pod, Rishabh, Prateek, Pod Sponsor</p><textarea placeholder='Minutes / rationale' className='w-full rounded border p-2 my-2'/><div className='flex gap-2'>{['Go','Conditional Go','Hold','No-Go'].map(d=><button key={d} className='rounded border px-2 py-1' onClick={()=>{addAudit('pab_decision_recorded','Opportunity',openOpp.id,d); if(d==='Go') setOpps(l=>l.map(o=>o.id===openOpp.id?{...o,stage:'Financial Approval Gate'}:o));}}>{d}</button>)}</div></div>}
      {oppTab==='Financials / CM2' && <div><p>CM2 pricing sheet v1.2 | CCOO strategy ref linked | Margin summary available</p><button disabled={!can(role,'CFO Sign-off')} title={!can(role,'CFO Sign-off')?'Not permitted for selected role.':''} className='rounded border px-2 py-1 disabled:opacity-50' onClick={()=>{setOpps(l=>l.map(o=>o.id===openOpp.id?{...o,cfoSigned:true}:o)); addAudit('cfo_signoff_recorded','Opportunity',openOpp.id,'CFO approved and CM2 locked');}}>CFO sign-off</button></div>}
      {oppTab==='RFP & Bid' && <div><button disabled={!openOpp.cfoSigned} title={!openOpp.cfoSigned?'[Source Rule] CFO sign-off required before bid submission.':''} className='rounded border px-2 py-1 disabled:opacity-50' onClick={()=>addAudit('bid_submitted','Opportunity',openOpp.id,'Bid submitted')}>Mark Bid Submitted</button><button className='ml-2 rounded border px-2 py-1' onClick={()=>{setOpps(l=>l.map(o=>o.id===openOpp.id?{...o,awardUploaded:true}:o)); addAudit('award_communication_uploaded','Opportunity',openOpp.id,'Award communication attached');}}>Upload Award Communication</button><button disabled={!openOpp.awardUploaded} title={!openOpp.awardUploaded?'[Source Rule] Award Communication evidence required to mark Won.':''} className='ml-2 rounded border px-2 py-1 disabled:opacity-50'>Mark Won</button></div>}
      {oppTab==='MOU' && <div><button className='rounded border px-2 py-1' onClick={()=>{setOpps(l=>l.map(o=>o.id===openOpp.id?{...o,mouUploaded:true,status:'MOU Signed',stage:'O2C Transition Ready'}:o)); const pid=`PR-${Math.floor(Math.random()*90+10)}`; setProjects(p=>[{id:pid,name:openOpp.name,customer:openOpp.customer,stage:'Milestone Setup',contractValue:openOpp.value,collected:0,rcPod:openOpp.rcPod,podSponsor:openOpp.podSponsor,financeOwner:'Finance Ops',blocker:'[Source Rule] Proof verification required before invoice trigger.',nextAction:'Add milestones',proofVerified:false,cm2Variance:-6},...p]); addAudit('o2c_project_created','Project',pid,'o2o_to_o2c_transition_created');}}>Upload Signed MOU</button></div>}
      {oppTab==='Activity / Audit' && <DataTable cols={['Time','Event','Ref']} rows={audit.filter(a=>a.ref===openOpp.id).map(a=>[a.time,a.event,a.ref])} />}
    </div></div>}

    {openProject && <div className='fixed inset-0 bg-black/40 p-4 overflow-auto'><div className='mx-auto max-w-6xl rounded bg-white p-4 text-sm'><div className='flex justify-between'><h3 className='text-lg font-semibold'>{openProject.name}</h3><button onClick={()=>setSelectedProject(null)}>Close</button></div><p>Contract ₹{openProject.contractValue} Cr | Collected ₹{openProject.collected} Cr | Status {openProject.stage} | RC {openProject.rcPod} | Sponsor {openProject.podSponsor} | Finance {openProject.financeOwner}</p><div className='my-3 flex flex-wrap gap-2'>{['Milestones','Proofs','Invoices','Collections','Scope Changes','CM2','Mid-Project PAB','Post-Project PAB','Documents','Audit'].map(t=><button key={t} onClick={()=>setProjTab(t)} className={`rounded border px-2 py-1 ${projTab===t?'bg-indigo-600 text-white':''}`}>{t}</button>)}</div><p>Working tab: {projTab}</p><button className='rounded border px-2 py-1' onClick={()=>{setProjects(p=>p.map(x=>x.id===openProject.id?{...x,collected:Math.min(x.contractValue,x.collected+5),stage:x.collected+5>=x.contractValue?'Collection Complete':'Collection Tracking'}:x)); addAudit('collection_updated','Project',openProject.id,'Payment recorded');}}>Record payment</button></div></div>}
  </div>;
}
