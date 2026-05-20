import { useMemo, useState } from 'react';

type Stage =
  | 'Opportunity Registration'
  | 'Proposal Stage'
  | 'Pre-Bid PAB'
  | 'Financial Approval Gate'
  | 'RFP & Bid Management'
  | 'Post-Bid PAB'
  | 'MOU Stage';

type ChecklistStatus = 'todo' | 'done';
type Tab = 'Checklist' | 'Comments' | 'Files';
type Page = 'Home' | 'Admin' | 'Audit Log';

type ChecklistItem = { id: string; label: string; required: boolean; status: ChecklistStatus };
type Opportunity = {
  id: string;
  name: string;
  client: string;
  owner: string;
  valueCr: number;
  stage: Stage;
  status: 'Active' | 'Lost';
  checklist: ChecklistItem[];
  comments: { id: string; text: string; at: string }[];
  files: { id: string; name: string; at: string }[];
};

type Audit = { id: string; at: string; action: string };

const stages: Stage[] = [
  'Opportunity Registration',
  'Proposal Stage',
  'Pre-Bid PAB',
  'Financial Approval Gate',
  'RFP & Bid Management',
  'Post-Bid PAB',
  'MOU Stage',
];

const stageRequirements: Record<Stage, string[]> = {
  'Opportunity Registration': ['opp_form'],
  'Proposal Stage': ['opp_form', 'proposal_draft'],
  'Pre-Bid PAB': ['pab_note'],
  'Financial Approval Gate': ['finance_note'],
  'RFP & Bid Management': ['bid_pack'],
  'Post-Bid PAB': ['post_bid_review'],
  'MOU Stage': ['mou_ready'],
};

const ts = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
const mkChecklist = (): ChecklistItem[] => [
  { id: 'opp_form', label: 'Opportunity form submitted', required: true, status: 'done' },
  { id: 'proposal_draft', label: 'Proposal prepared', required: true, status: 'todo' },
  { id: 'pab_note', label: 'Pre-Bid PAB decision logged', required: true, status: 'todo' },
  { id: 'finance_note', label: 'Finance approval captured', required: true, status: 'todo' },
  { id: 'bid_pack', label: 'Bid package completed', required: true, status: 'todo' },
  { id: 'post_bid_review', label: 'Post-bid PAB captured', required: true, status: 'todo' },
  { id: 'mou_ready', label: 'MOU package ready', required: true, status: 'todo' },
];

export default function App() {
  const [page, setPage] = useState<Page>('Home');
  const [tab, setTab] = useState<Tab>('Checklist');
  const [q, setQ] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [fileName, setFileName] = useState('');
  const [addForm, setAddForm] = useState({ name: '', client: '', owner: '', valueCr: 1 });
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);

  const log = (action: string) => setAudit((prev) => [{ id: crypto.randomUUID(), at: ts(), action }, ...prev]);
  const filtered = opps.filter((o) => `${o.name} ${o.client} ${o.owner}`.toLowerCase().includes(q.toLowerCase()));
  const detail = opps.find((o) => o.id === detailId) || null;

  const canAdvance = (o: Opportunity) => {
    const idx = stages.indexOf(o.stage);
    if (idx >= stages.length - 1 || o.status === 'Lost') return false;
    return stageRequirements[stages[idx + 1]].every((id) => o.checklist.find((c) => c.id === id)?.status === 'done');
  };

  const kpi = useMemo(() => ({
    active: opps.filter((o) => o.status === 'Active').length,
    lost: opps.filter((o) => o.status === 'Lost').length,
    pipeline: opps.reduce((a, b) => a + b.valueCr, 0),
    mou: opps.filter((o) => o.stage === 'MOU Stage').length,
  }), [opps]);

  const updateOpp = (id: string, fn: (o: Opportunity) => Opportunity) => setOpps((prev) => prev.map((o) => (o.id === id ? fn(o) : o)));

  return <div className='min-h-screen bg-slate-100'>
    <header className='bg-blue-700 p-4 text-white'>
      <h1 className='text-xl font-bold'>O2O Tracker (Opportunity to Order) ConveGenius</h1>
      <nav className='mt-2 flex gap-4 text-sm'>{(['Home', 'Admin', 'Audit Log'] as Page[]).map((p) => <button key={p} className={`${page === p ? 'font-bold underline' : ''}`} onClick={() => setPage(p)}>{p}</button>)}</nav>
    </header>

    <main className='p-4'>
      {page === 'Home' && <>
        <section className='mb-4 grid gap-3 md:grid-cols-4'>{[['Active', kpi.active], ['Lost', kpi.lost], ['Pipeline ₹ Cr', kpi.pipeline], ['In MOU Stage', kpi.mou]].map(([l, v]) => <div key={l} className='rounded bg-white p-3 shadow'><div className='text-xs text-slate-500'>{l}</div><div className='text-2xl font-bold'>{v}</div></div>)}</section>
        <section className='mb-4 flex gap-2 rounded bg-white p-3 shadow'>
          <input className='flex-1 rounded border px-2 py-1' placeholder='Filter by opportunity/client/owner' value={q} onChange={(e) => setQ(e.target.value)} />
          <button className='rounded bg-blue-700 px-3 py-1 text-white' onClick={() => setShowAdd(true)}>+ Add Opportunity</button>
        </section>
        <section className='grid gap-3 lg:grid-cols-4 xl:grid-cols-7'>{stages.map((s) => <div key={s} className='rounded bg-white p-2 shadow'><h3 className='mb-2 text-sm font-semibold'>{s}</h3><div className='space-y-2'>{filtered.filter((o) => o.stage === s).map((o) => <article key={o.id} className='rounded border bg-slate-50 p-2'>
          <button className='w-full text-left' onClick={() => { setDetailId(o.id); setTab('Checklist'); }}><div className='font-medium'>{o.name}</div><div className='text-xs text-slate-500'>{o.client} · {o.owner}</div><div className='text-xs'>₹{o.valueCr} Cr · {o.status}</div></button>
          <div className='mt-2 flex gap-1 text-xs'>
            <button className='rounded border px-2' onClick={() => { const i = stages.indexOf(o.stage); if (i > 0) { updateOpp(o.id, (x) => ({ ...x, stage: stages[i - 1] })); log(`${o.id} moved back to ${stages[i - 1]}`); } }}>Back</button>
            <button disabled={!canAdvance(o)} className='rounded border px-2 disabled:opacity-40' onClick={() => { const i = stages.indexOf(o.stage); if (i < stages.length - 1 && canAdvance(o)) { updateOpp(o.id, (x) => ({ ...x, stage: stages[i + 1] })); log(`${o.id} advanced to ${stages[i + 1]}`); } }}>Advance</button>
            <button className='rounded border px-2' onClick={() => { updateOpp(o.id, (x) => ({ ...x, status: 'Lost' })); log(`${o.id} marked lost`); }}>Mark Lost</button>
          </div></article>)}</div></div>)}</section>
      </>}

      {page === 'Admin' && <section className='grid gap-4 md:grid-cols-2'><Panel title='Users' rows={['Neha (Sales)', 'Ravi (Finance)', 'Aman (Admin)']} /><Panel title='Roles' rows={['Sales Manager', 'Bid Manager', 'Finance Reviewer', 'Admin']} /><Panel title='Checklist Templates' rows={mkChecklist().map((x) => x.label)} /><Panel title='Dropdowns' rows={['Stage', 'Status', 'Region', 'Deal Type']} /></section>}
      {page === 'Audit Log' && <section className='rounded bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>Audit Log</h2><table className='w-full text-sm'><thead><tr className='text-left'><th>Time</th><th>Action</th></tr></thead><tbody>{audit.map((a) => <tr key={a.id}><td>{a.at}</td><td>{a.action}</td></tr>)}</tbody></table></section>}
    </main>

    {showAdd && <Modal title='Add Opportunity' onClose={() => setShowAdd(false)}><div className='space-y-2'>
      <input className='w-full rounded border px-2 py-1' placeholder='Opportunity name' value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} />
      <input className='w-full rounded border px-2 py-1' placeholder='Client' value={addForm.client} onChange={(e) => setAddForm({ ...addForm, client: e.target.value })} />
      <input className='w-full rounded border px-2 py-1' placeholder='Owner' value={addForm.owner} onChange={(e) => setAddForm({ ...addForm, owner: e.target.value })} />
      <input type='number' className='w-full rounded border px-2 py-1' value={addForm.valueCr} onChange={(e) => setAddForm({ ...addForm, valueCr: Number(e.target.value) })} />
      <button className='rounded bg-blue-700 px-3 py-1 text-white' onClick={() => { if (!addForm.name || !addForm.client || !addForm.owner) return; const id = `OPP-${Date.now().toString().slice(-5)}`; setOpps((p) => [{ id, ...addForm, stage: 'Opportunity Registration', status: 'Active', checklist: mkChecklist(), comments: [], files: [] }, ...p]); log(`${id} created`); setShowAdd(false); setAddForm({ name: '', client: '', owner: '', valueCr: 1 }); }}>Create</button>
    </div></Modal>}

    {detail && <Modal title={`${detail.name} Details`} large onClose={() => setDetailId(null)}>
      <div className='mb-3 flex gap-2'>{(['Checklist', 'Comments', 'Files'] as Tab[]).map((t) => <button key={t} className={`rounded px-2 py-1 text-sm ${tab === t ? 'bg-blue-700 text-white' : 'bg-slate-200'}`} onClick={() => setTab(t)}>{t}</button>)}</div>
      {tab === 'Checklist' && <div className='space-y-2'>{detail.checklist.map((c) => <label key={c.id} className='flex items-center gap-2'><input type='checkbox' checked={c.status === 'done'} onChange={(e) => { updateOpp(detail.id, (o) => ({ ...o, checklist: o.checklist.map((x) => x.id === c.id ? { ...x, status: e.target.checked ? 'done' : 'todo' } : x) })); log(`${detail.id} checklist updated: ${c.label}`); }} /><span>{c.label} {c.required ? '(required)' : ''}</span></label>)}</div>}
      {tab === 'Comments' && <div><div className='mb-2 space-y-1 text-sm'>{detail.comments.map((c) => <div key={c.id} className='rounded bg-slate-100 p-2'>{c.text} <span className='text-xs text-slate-500'>({c.at})</span></div>)}</div><div className='flex gap-2'><input className='flex-1 rounded border px-2 py-1' value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Add comment' /><button className='rounded bg-blue-700 px-2 text-white' onClick={() => { if (!comment.trim()) return; updateOpp(detail.id, (o) => ({ ...o, comments: [{ id: crypto.randomUUID(), text: comment.trim(), at: ts() }, ...o.comments] })); log(`${detail.id} comment added`); setComment(''); }}>Add</button></div></div>}
      {tab === 'Files' && <div><div className='mb-2 space-y-1 text-sm'>{detail.files.map((f) => <div key={f.id} className='rounded bg-slate-100 p-2'>{f.name} <span className='text-xs text-slate-500'>({f.at})</span></div>)}</div><div className='flex gap-2'><input className='flex-1 rounded border px-2 py-1' value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder='Filename placeholder' /><button className='rounded bg-blue-700 px-2 text-white' onClick={() => { if (!fileName.trim()) return; updateOpp(detail.id, (o) => ({ ...o, files: [{ id: crypto.randomUUID(), name: fileName.trim(), at: ts() }, ...o.files] })); log(`${detail.id} file placeholder added`); setFileName(''); }}>Add</button></div></div>}
    </Modal>}
  </div>;
}

function Modal({ title, children, onClose, large }: { title: string; children: React.ReactNode; onClose: () => void; large?: boolean }) {
  return <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4'><div className={`rounded bg-white p-4 shadow ${large ? 'w-full max-w-4xl' : 'w-full max-w-lg'}`}><div className='mb-3 flex items-center justify-between'><h3 className='font-semibold'>{title}</h3><button onClick={onClose}>✕</button></div>{children}</div></div>;
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <div className='rounded bg-white p-3 shadow'><h3 className='mb-2 font-semibold'>{title}</h3><ul className='list-disc space-y-1 pl-5 text-sm'>{rows.map((r) => <li key={r}>{r}</li>)}</ul></div>;
}
