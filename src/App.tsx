import { useMemo, useState, type ReactNode } from 'react';

type Role = 'Sales Head' | 'PAB Chair' | 'Finance Controller' | 'Delivery Manager' | 'Admin';
type O2OStage = 'Lead' | 'Qualified' | 'Solutioning' | 'PAB Review' | 'Financial Gate' | 'RFP & Bid' | 'MOU';
type O2CStage = 'Mobilization' | 'Milestones' | 'Proofs' | 'Invoices' | 'Collections' | 'CM2 Closure';
type ChecklistStatus = 'Not Started' | 'In Progress' | 'Done' | 'Blocked';

type ChecklistItem = { id: string; label: string; required: boolean; status: ChecklistStatus };
type Comment = { id: string; text: string; actor: string; ts: string };
type FileRef = { id: string; name: string; ts: string };

type Opportunity = {
  id: string;
  name: string;
  account: string;
  owner: string;
  valueCr: number;
  stage: O2OStage;
  cfoApproved: boolean;
  mouSigned: boolean;
  checklist: ChecklistItem[];
  comments: Comment[];
  files: FileRef[];
};

type Milestone = { id: string; name: string; amountL: number; delivered: boolean };
type Proof = { id: string; label: string; verified: boolean };
type Invoice = { id: string; amountL: number; issued: boolean };
type Collection = { id: string; amountL: number; recorded: boolean };

type O2CProject = {
  id: string;
  opportunityId: string;
  name: string;
  owner: string;
  stage: O2CStage;
  cm2Pct: number;
  milestones: Milestone[];
  proofs: Proof[];
  invoices: Invoice[];
  collections: Collection[];
};

type AuditEntry = { id: string; ts: string; actor: string; entity: string; action: string };

const o2oStages: O2OStage[] = ['Lead', 'Qualified', 'Solutioning', 'PAB Review', 'Financial Gate', 'RFP & Bid', 'MOU'];
const o2cStages: O2CStage[] = ['Mobilization', 'Milestones', 'Proofs', 'Invoices', 'Collections', 'CM2 Closure'];

const stageRequirements: Record<O2OStage, string[]> = {
  Lead: ['need_identified'],
  Qualified: ['need_identified', 'stakeholder_mapped'],
  Solutioning: ['need_identified', 'stakeholder_mapped', 'solution_draft'],
  'PAB Review': ['prebid_pab'],
  'Financial Gate': ['cm2_review'],
  'RFP & Bid': ['cfo_approval'],
  MOU: ['bid_submitted'],
};

const now = () => new Date().toISOString().slice(11, 19);

const starterOpps: Opportunity[] = [
  {
    id: 'OP-201', name: 'UP Digital Labs', account: 'UP DoE', owner: 'Anita', valueCr: 34, stage: 'PAB Review', cfoApproved: false, mouSigned: false,
    checklist: [
      { id: 'need_identified', label: 'Need identified', required: true, status: 'Done' },
      { id: 'stakeholder_mapped', label: 'Stakeholder mapping', required: true, status: 'Done' },
      { id: 'solution_draft', label: 'Solution draft', required: true, status: 'Done' },
      { id: 'prebid_pab', label: 'Pre-bid PAB outcome', required: true, status: 'In Progress' },
      { id: 'cm2_review', label: 'CM2 review complete', required: true, status: 'Not Started' },
      { id: 'cfo_approval', label: 'CFO approval', required: true, status: 'Not Started' },
      { id: 'bid_submitted', label: 'RFP bid submitted', required: true, status: 'Not Started' },
      { id: 'mou_signed', label: 'MOU signed', required: true, status: 'Not Started' },
    ], comments: [], files: [],
  },
  {
    id: 'OP-188', name: 'Bihar FLN Expansion', account: 'Bihar Edu Dept', owner: 'Rahul', valueCr: 22, stage: 'Financial Gate', cfoApproved: false, mouSigned: false,
    checklist: [
      { id: 'need_identified', label: 'Need identified', required: true, status: 'Done' },
      { id: 'stakeholder_mapped', label: 'Stakeholder mapping', required: true, status: 'Done' },
      { id: 'solution_draft', label: 'Solution draft', required: true, status: 'Done' },
      { id: 'prebid_pab', label: 'Pre-bid PAB outcome', required: true, status: 'Done' },
      { id: 'cm2_review', label: 'CM2 review complete', required: true, status: 'In Progress' },
      { id: 'cfo_approval', label: 'CFO approval', required: true, status: 'Not Started' },
      { id: 'bid_submitted', label: 'RFP bid submitted', required: true, status: 'Not Started' },
      { id: 'mou_signed', label: 'MOU signed', required: true, status: 'Not Started' },
    ], comments: [{ id: 'c1', text: 'Margin exception under review.', actor: 'Rahul', ts: now() }], files: [],
  },
];

export default function App() {
  const [role, setRole] = useState<Role>('Sales Head');
  const [opps, setOpps] = useState<Opportunity[]>(starterOpps);
  const [projects, setProjects] = useState<O2CProject[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([{ id: 'a0', ts: now(), actor: 'System', entity: 'Portal', action: 'Tracker initialized' }]);
  const [filter, setFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailOppId, setDetailOppId] = useState<string | null>(null);
  const [detailProjId, setDetailProjId] = useState<string | null>(null);
  const [tab, setTab] = useState<'Checklist' | 'Comments' | 'Files'>('Checklist');
  const [commentText, setCommentText] = useState('');

  const activeOpp = opps.find((o) => o.id === detailOppId) ?? null;
  const activeProject = projects.find((p) => p.id === detailProjId) ?? null;

  const log = (entity: string, action: string) => setAudit((prev) => [{ id: `a-${Date.now()}-${Math.random()}`, ts: now(), actor: role, entity, action }, ...prev]);

  const shownOpps = opps.filter((o) => `${o.name} ${o.account} ${o.owner}`.toLowerCase().includes(filter.toLowerCase()));
  const oppCols = o2oStages.map((s) => [s, shownOpps.filter((o) => o.stage === s)] as const);
  const projCols = o2cStages.map((s) => [s, projects.filter((p) => p.stage === s)] as const);

  const kpi = useMemo(() => ({
    pipelineCr: opps.reduce((a, b) => a + b.valueCr, 0),
    pabQueue: opps.filter((o) => o.stage === 'PAB Review').length,
    financialGate: opps.filter((o) => o.stage === 'Financial Gate').length,
    o2cLive: projects.length,
  }), [opps, projects]);

  const requiredDone = (opp: Opportunity, stage: O2OStage) => {
    const req = stageRequirements[stage] ?? [];
    return req.every((id) => opp.checklist.find((c) => c.id === id)?.status === 'Done');
  };

  const moveOpp = (id: string, dir: -1 | 1) => {
    setOpps((prev) => prev.map((o) => {
      if (o.id !== id) return o;
      const idx = o2oStages.indexOf(o.stage);
      const nextIdx = Math.max(0, Math.min(o2oStages.length - 1, idx + dir));
      const target = o2oStages[nextIdx];
      if (dir === 1 && !requiredDone(o, target)) return o;
      const next = { ...o, stage: target };
      log(o.id, `Stage moved ${o.stage} -> ${target}`);
      return next;
    }));
  };

  const updateChecklist = (oppId: string, itemId: string, status: ChecklistStatus) => {
    setOpps((prev) => prev.map((o) => o.id !== oppId ? o : { ...o, checklist: o.checklist.map((c) => c.id === itemId ? { ...c, status } : c) }));
    log(oppId, `Checklist ${itemId} set to ${status}`);
  };

  const addComment = () => {
    if (!activeOpp || !commentText.trim()) return;
    const c: Comment = { id: `c-${Date.now()}`, text: commentText.trim(), actor: role, ts: now() };
    setOpps((prev) => prev.map((o) => o.id !== activeOpp.id ? o : { ...o, comments: [c, ...o.comments] }));
    setCommentText('');
    log(activeOpp.id, 'Comment added');
  };

  const attachFile = (oppId: string) => {
    const f: FileRef = { id: `f-${Date.now()}`, name: `placeholder_${Date.now()}.pdf`, ts: now() };
    setOpps((prev) => prev.map((o) => o.id !== oppId ? o : { ...o, files: [f, ...o.files] }));
    log(oppId, `File attached: ${f.name}`);
  };

  const approveCfo = (oppId: string) => {
    setOpps((prev) => prev.map((o) => o.id !== oppId ? o : {
      ...o, cfoApproved: true,
      checklist: o.checklist.map((c) => c.id === 'cfo_approval' ? { ...c, status: 'Done' } : c),
    }));
    log(oppId, 'CFO approval completed');
  };

  const signMouCreateProject = (oppId: string) => {
    const opp = opps.find((o) => o.id === oppId);
    if (!opp) return;
    if (!opp.cfoApproved) return;

    setOpps((prev) => prev.map((o) => o.id !== oppId ? o : {
      ...o, mouSigned: true,
      checklist: o.checklist.map((c) => c.id === 'mou_signed' ? { ...c, status: 'Done' } : c),
    }));

    const pid = `PRJ-${Date.now().toString().slice(-5)}`;
    const project: O2CProject = {
      id: pid, opportunityId: opp.id, name: opp.name, owner: opp.owner, stage: 'Mobilization', cm2Pct: 18,
      milestones: [], proofs: [], invoices: [], collections: [],
    };
    setProjects((prev) => [project, ...prev]);
    log(oppId, `Signed MOU and auto-created O2C project ${pid}`);
  };

  const stageForwardProject = (projectId: string) => setProjects((prev) => prev.map((p) => {
    if (p.id !== projectId) return p;
    const i = o2cStages.indexOf(p.stage);
    const n = Math.min(o2cStages.length - 1, i + 1);
    const next = { ...p, stage: o2cStages[n] };
    log(p.id, `Project stage moved ${p.stage} -> ${next.stage}`);
    return next;
  }));

  const createMilestone = (projectId: string) => {
    const m: Milestone = { id: `MS-${Date.now().toString().slice(-4)}`, name: `Milestone ${Math.floor(Math.random() * 10)}`, amountL: 25, delivered: false };
    setProjects((prev) => prev.map((p) => p.id !== projectId ? p : { ...p, milestones: [m, ...p.milestones] }));
    log(projectId, `Milestone created: ${m.id}`);
  };
  const verifyProof = (projectId: string) => {
    const proof: Proof = { id: `PF-${Date.now().toString().slice(-4)}`, label: 'Site deployment proof', verified: true };
    setProjects((prev) => prev.map((p) => p.id !== projectId ? p : { ...p, proofs: [proof, ...p.proofs] }));
    log(projectId, `Proof verified: ${proof.id}`);
  };
  const issueInvoice = (projectId: string) => {
    const inv: Invoice = { id: `INV-${Date.now().toString().slice(-4)}`, amountL: 12, issued: true };
    setProjects((prev) => prev.map((p) => p.id !== projectId ? p : { ...p, invoices: [inv, ...p.invoices] }));
    log(projectId, `Invoice issued: ${inv.id}`);
  };
  const recordCollection = (projectId: string) => {
    const col: Collection = { id: `COL-${Date.now().toString().slice(-4)}`, amountL: 8, recorded: true };
    setProjects((prev) => prev.map((p) => p.id !== projectId ? p : { ...p, collections: [col, ...p.collections], cm2Pct: p.cm2Pct + 1 }));
    log(projectId, `Collection recorded: ${col.id}`);
  };

  return <div className='min-h-screen bg-slate-100 p-4 text-slate-900'>
    <header className='mb-4 flex flex-wrap items-center justify-between rounded-xl bg-white p-4 shadow'>
      <div><h1 className='text-2xl font-bold'>O2O → O2C Tracker</h1><p className='text-sm text-slate-500'>Default landing: O2O Tracker Board</p></div>
      <div className='flex items-center gap-2'><span className='text-sm'>Role</span><select className='rounded border px-2 py-1' value={role} onChange={(e) => setRole(e.target.value as Role)}>{(['Sales Head', 'PAB Chair', 'Finance Controller', 'Delivery Manager', 'Admin'] as Role[]).map((r) => <option key={r}>{r}</option>)}</select></div>
    </header>

    <section className='mb-4 grid gap-3 md:grid-cols-4'>
      <Kpi label='Pipeline (₹ Cr)' value={kpi.pipelineCr} /><Kpi label='PAB Queue' value={kpi.pabQueue} /><Kpi label='Financial Gate' value={kpi.financialGate} /><Kpi label='Active O2C Projects' value={kpi.o2cLive} />
    </section>

    <section className='mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow'>
      <input className='min-w-72 rounded border px-2 py-1' placeholder='Filter opportunities' value={filter} onChange={(e) => setFilter(e.target.value)} />
      <button onClick={() => setShowAdd(true)} className='rounded bg-indigo-600 px-3 py-1 text-white'>+ Add Opportunity</button>
      <span className='ml-auto text-xs text-slate-500'>Stage advance allowed only when required checklist items are Done.</span>
    </section>

    <Board title='O2O Tracker Board' columns={oppCols.map(([stage, list]) => <div key={stage} className='rounded border bg-slate-50 p-2'><h3 className='mb-2 text-sm font-semibold'>{stage}</h3><div className='space-y-2'>{list.map((o) => <article key={o.id} className='rounded bg-white p-2 shadow'>
      <button onClick={() => { setDetailOppId(o.id); setTab('Checklist'); }} className='w-full text-left'><p className='font-medium'>{o.name}</p><p className='text-xs text-slate-500'>{o.account} · {o.owner}</p></button>
      <p className='mt-1 text-xs'>₹{o.valueCr} Cr</p>
      <div className='mt-2 flex gap-1'><button onClick={() => moveOpp(o.id, -1)} className='rounded border px-2 text-xs'>◀ Back</button><button onClick={() => moveOpp(o.id, 1)} className='rounded border px-2 text-xs'>Next ▶</button></div>
    </article>)}</div></div>)} />

    <section className='mt-4 grid gap-4 lg:grid-cols-2'>
      <div className='rounded-xl bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>Admin Tabs (RBAC)</h2><div className='mb-2 flex gap-2 text-sm'><span className='rounded bg-slate-900 px-2 py-1 text-white'>Users</span><span className='rounded bg-slate-200 px-2 py-1'>Permissions</span><span className='rounded bg-slate-200 px-2 py-1'>Policy</span></div><table className='w-full text-sm'><thead><tr className='text-left'><th>Role</th><th>Capabilities</th></tr></thead><tbody><tr><td>Sales Head</td><td>O2O create/move/comment/file</td></tr><tr><td>PAB Chair</td><td>PAB decisions</td></tr><tr><td>Finance Controller</td><td>CFO approval, CM2 checks</td></tr><tr><td>Delivery Manager</td><td>Milestones/proofs/invoices/collections</td></tr><tr><td>Admin</td><td>RBAC + audit controls</td></tr></tbody></table></div>
      <div className='rounded-xl bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>Audit Log</h2><table className='w-full text-sm'><thead><tr className='text-left'><th>Time</th><th>Actor</th><th>Entity</th><th>Action</th></tr></thead><tbody>{audit.slice(0, 10).map((a) => <tr key={a.id}><td>{a.ts}</td><td>{a.actor}</td><td>{a.entity}</td><td>{a.action}</td></tr>)}</tbody></table></div>
    </section>

    <Board title='O2C Tracker Board' columns={projCols.map(([stage, list]) => <div key={stage} className='rounded border bg-emerald-50 p-2'><h3 className='mb-2 text-sm font-semibold'>{stage}</h3><div className='space-y-2'>{list.map((p) => <article key={p.id} className='rounded bg-white p-2 shadow'><button className='w-full text-left' onClick={() => setDetailProjId(p.id)}><p className='font-medium'>{p.name}</p><p className='text-xs text-slate-500'>{p.id} · CM2 {p.cm2Pct}%</p></button><button onClick={() => stageForwardProject(p.id)} className='mt-2 rounded border px-2 text-xs'>Advance Stage ▶</button></article>)}</div></div>)} />

    {showAdd && <AddOpportunityModal onClose={() => setShowAdd(false)} onSave={(payload) => {
      const opp: Opportunity = {
        id: `OP-${Math.floor(Math.random() * 900 + 100)}`,
        name: payload.name,
        account: payload.account,
        owner: payload.owner,
        valueCr: payload.valueCr,
        stage: 'Lead',
        cfoApproved: false,
        mouSigned: false,
        checklist: starterOpps[0].checklist.map((c) => ({ ...c, status: c.id === 'need_identified' ? 'Done' : 'Not Started' })),
        comments: [],
        files: [],
      };
      setOpps((prev) => [opp, ...prev]);
      log(opp.id, 'Opportunity created');
      setShowAdd(false);
    }} />}

    {activeOpp && <Modal title={`${activeOpp.id} · ${activeOpp.name}`} onClose={() => setDetailOppId(null)}>
      <div className='mb-2 flex flex-wrap gap-2 text-sm'>{(['Checklist', 'Comments', 'Files'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded px-2 py-1 ${tab === t ? 'bg-slate-900 text-white' : 'bg-slate-200'}`}>{t}</button>)}</div>
      <div className='mb-2 flex flex-wrap gap-2'>
        <button onClick={() => approveCfo(activeOpp.id)} className='rounded border px-2 py-1 text-xs'>CFO Approval</button>
        <button onClick={() => signMouCreateProject(activeOpp.id)} className='rounded border px-2 py-1 text-xs'>Sign MOU + Create O2C Project</button>
        <span className='text-xs text-slate-500'>CFO: {activeOpp.cfoApproved ? 'Approved' : 'Pending'} · MOU: {activeOpp.mouSigned ? 'Signed' : 'Pending'}</span>
      </div>
      {tab === 'Checklist' && <div className='space-y-2'>{activeOpp.checklist.map((c) => <div key={c.id} className='flex items-center justify-between rounded border p-2'><span className='text-sm'>{c.label} {c.required ? '*' : ''}</span><select className='rounded border px-2 py-1 text-sm' value={c.status} onChange={(e) => updateChecklist(activeOpp.id, c.id, e.target.value as ChecklistStatus)}><option>Not Started</option><option>In Progress</option><option>Done</option><option>Blocked</option></select></div>)}</div>}
      {tab === 'Comments' && <div><textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className='h-24 w-full rounded border p-2' placeholder='Add comment' /><button onClick={addComment} className='mt-2 rounded bg-indigo-600 px-3 py-1 text-white'>Add Comment</button><div className='mt-2 space-y-1'>{activeOpp.comments.map((c) => <p className='rounded bg-slate-100 p-2 text-sm' key={c.id}><b>{c.actor}</b> [{c.ts}] — {c.text}</p>)}</div></div>}
      {tab === 'Files' && <div><button onClick={() => attachFile(activeOpp.id)} className='rounded border px-2 py-1 text-sm'>Attach file placeholder</button><ul className='mt-2 list-disc pl-5 text-sm'>{activeOpp.files.map((f) => <li key={f.id}>{f.name} ({f.ts})</li>)}</ul></div>}
    </Modal>}

    {activeProject && <Modal title={`${activeProject.id} · ${activeProject.name} (O2C)`} onClose={() => setDetailProjId(null)}>
      <div className='grid gap-2 md:grid-cols-2'>
        <button onClick={() => createMilestone(activeProject.id)} className='rounded border px-2 py-1 text-sm'>Create Milestone</button>
        <button onClick={() => verifyProof(activeProject.id)} className='rounded border px-2 py-1 text-sm'>Verify Proof</button>
        <button onClick={() => issueInvoice(activeProject.id)} className='rounded border px-2 py-1 text-sm'>Issue Invoice</button>
        <button onClick={() => recordCollection(activeProject.id)} className='rounded border px-2 py-1 text-sm'>Record Collection</button>
      </div>
      <div className='mt-3 grid gap-3 md:grid-cols-2 text-sm'>
        <Panel title='Milestones' items={activeProject.milestones.map((m) => `${m.id}: ${m.name} ₹${m.amountL}L`)} />
        <Panel title='Proofs' items={activeProject.proofs.map((p) => `${p.id}: ${p.label} (${p.verified ? 'Verified' : 'Pending'})`)} />
        <Panel title='Invoices' items={activeProject.invoices.map((i) => `${i.id}: ₹${i.amountL}L (${i.issued ? 'Issued' : 'Pending'})`)} />
        <Panel title='Collections' items={activeProject.collections.map((c) => `${c.id}: ₹${c.amountL}L (${c.recorded ? 'Recorded' : 'Pending'})`)} />
      </div>
    </Modal>}
  </div>;
}

function Kpi({ label, value }: { label: string; value: number }) {
  return <div className='rounded-xl bg-white p-4 shadow'><p className='text-sm text-slate-500'>{label}</p><p className='text-2xl font-semibold'>{value}</p></div>;
}

function Board({ title, columns }: { title: string; columns: ReactNode[] }) {
  return <section className='mt-4 overflow-auto rounded-xl bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>{title}</h2><div className='grid min-w-[1200px] grid-cols-7 gap-3'>{columns}</div></section>;
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return <div className='rounded border p-2'><h4 className='mb-1 font-medium'>{title}</h4><ul className='list-disc pl-5'>{items.map((i, idx) => <li key={`${title}-${idx}`}>{i}</li>)}{items.length === 0 && <li className='list-none text-slate-400'>No records yet.</li>}</ul></div>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className='fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4'><div className='w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl'><div className='mb-3 flex items-center justify-between'><h3 className='font-semibold'>{title}</h3><button onClick={onClose}>✕</button></div>{children}</div></div>;
}

function AddOpportunityModal({ onClose, onSave }: { onClose: () => void; onSave: (payload: { name: string; account: string; owner: string; valueCr: number }) => void }) {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [owner, setOwner] = useState('');
  const [valueCr, setValueCr] = useState(5);
  return <Modal title='Add Opportunity' onClose={onClose}><div className='grid gap-2'><input className='rounded border px-2 py-1' placeholder='Opportunity Name' value={name} onChange={(e) => setName(e.target.value)} /><input className='rounded border px-2 py-1' placeholder='Account' value={account} onChange={(e) => setAccount(e.target.value)} /><input className='rounded border px-2 py-1' placeholder='Owner' value={owner} onChange={(e) => setOwner(e.target.value)} /><input className='rounded border px-2 py-1' type='number' value={valueCr} onChange={(e) => setValueCr(Number(e.target.value) || 0)} /><button className='rounded bg-indigo-600 px-3 py-1 text-white' onClick={() => name && account && owner && onSave({ name, account, owner, valueCr })}>Create Opportunity</button></div></Modal>;
}
