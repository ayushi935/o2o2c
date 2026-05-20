import { useMemo, useState } from 'react';

type Stage = 'Lead' | 'Qualified' | 'Solutioning' | 'PAB Review' | 'Financial Gate' | 'MOU & Handover';
type O2CStage = 'Mobilization' | 'Delivery' | 'Proofs' | 'Invoices' | 'Collections' | 'CM2 Closure';

type Opportunity = {
  id: string;
  name: string;
  account: string;
  owner: string;
  valueCr: number;
  stage: Stage;
  checklist: { label: string; status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked' }[];
  comments: string[];
  files: string[];
};

const stageOrder: Stage[] = ['Lead', 'Qualified', 'Solutioning', 'PAB Review', 'Financial Gate', 'MOU & Handover'];
const o2cStages: O2CStage[] = ['Mobilization', 'Delivery', 'Proofs', 'Invoices', 'Collections', 'CM2 Closure'];

const seedOpps: Opportunity[] = [
  { id: 'OP-141', name: 'UP Smart Classrooms', account: 'UP DoE', owner: 'Anita', valueCr: 34, stage: 'PAB Review', checklist: [{ label: 'Pre-bid PAB', status: 'In Progress' }, { label: 'Risk register', status: 'Done' }], comments: ['Need CFO review by Friday.'], files: ['RFP_v3.pdf'] },
  { id: 'OP-138', name: 'Bihar FLN Expansion', account: 'Bihar Edu Dept', owner: 'Rahul', valueCr: 22, stage: 'Financial Gate', checklist: [{ label: 'CM2 sanity', status: 'In Progress' }, { label: 'Commercial approval', status: 'Blocked' }], comments: ['Margin variance flagged.'], files: ['CM2_sheet.xlsx'] },
  { id: 'OP-132', name: 'MP STEM Labs', account: 'MP SSA', owner: 'Sneha', valueCr: 18, stage: 'Solutioning', checklist: [{ label: 'Solution note', status: 'Done' }, { label: 'Partner lock', status: 'Not Started' }], comments: [], files: [] },
];

export default function App() {
  const [role, setRole] = useState('Sales Head');
  const [opps, setOpps] = useState(seedOpps);
  const [filter, setFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [detail, setDetail] = useState<Opportunity | null>(null);
  const [detailTab, setDetailTab] = useState<'Checklist' | 'Comments' | 'Files'>('Checklist');

  const kpis = useMemo(() => ({
    pipeline: opps.reduce((a, b) => a + b.valueCr, 0),
    financialGate: opps.filter((o) => o.stage === 'Financial Gate').length,
    pabQueue: opps.filter((o) => o.stage === 'PAB Review').length,
    mouReady: opps.filter((o) => o.stage === 'MOU & Handover').length,
  }), [opps]);

  const shown = opps.filter((o) => `${o.name} ${o.account} ${o.owner}`.toLowerCase().includes(filter.toLowerCase()));
  const grouped = stageOrder.map((s) => [s, shown.filter((o) => o.stage === s)] as const);

  const move = (id: string, dir: -1 | 1) => setOpps((prev) => prev.map((o) => {
    if (o.id !== id) return o;
    const idx = stageOrder.indexOf(o.stage);
    const next = Math.min(stageOrder.length - 1, Math.max(0, idx + dir));
    return { ...o, stage: stageOrder[next] };
  }));

  return <div className='min-h-screen bg-slate-100 p-4 text-slate-900'>
    <header className='mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow'>
      <div><h1 className='text-xl font-bold'>O2O / O2C Tracker</h1><p className='text-sm text-slate-500'>Rebuilt governance-first workspace</p></div>
      <div className='flex items-center gap-2'>
        <span className='text-sm'>Role</span>
        <select className='rounded border px-2 py-1' value={role} onChange={(e) => setRole(e.target.value)}>
          {['Sales Head', 'PAB Chair', 'Finance Controller', 'Admin'].map((r) => <option key={r}>{r}</option>)}
        </select>
      </div>
    </header>

    <section className='mb-4 grid gap-3 md:grid-cols-4'>{[['Pipeline (Cr)', kpis.pipeline], ['PAB Queue', kpis.pabQueue], ['Financial Gate', kpis.financialGate], ['MOU Ready', kpis.mouReady]].map(([k, v]) => <div key={k} className='rounded-xl bg-white p-4 shadow'><p className='text-sm text-slate-500'>{k}</p><p className='text-2xl font-semibold'>{v}</p></div>)}</section>

    <section className='mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-white p-3 shadow'>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} className='min-w-64 rounded border px-2 py-1' placeholder='Filter by opportunity/account/owner' />
      <button onClick={() => setAddOpen(true)} className='rounded bg-indigo-600 px-3 py-1 text-white'>+ Add Opportunity</button>
    </section>

    <section className='mb-4 overflow-auto rounded-xl bg-white p-3 shadow'>
      <h2 className='mb-2 font-semibold'>O2O Kanban</h2>
      <div className='grid min-w-[1100px] grid-cols-6 gap-3'>
        {grouped.map(([stage, items]) => <div key={stage} className='rounded border bg-slate-50 p-2'><h3 className='mb-2 text-sm font-semibold'>{stage}</h3>
          <div className='space-y-2'>{items.map((o) => <article key={o.id} className='rounded bg-white p-2 shadow-sm'>
            <button className='text-left' onClick={() => setDetail(o)}><p className='font-medium'>{o.name}</p><p className='text-xs text-slate-500'>{o.account}</p></button>
            <p className='text-xs'>₹{o.valueCr} Cr · {o.owner}</p>
            <div className='mt-2 flex gap-1'><button onClick={() => move(o.id, -1)} className='rounded border px-2 text-xs'>◀ Back</button><button onClick={() => move(o.id, 1)} className='rounded border px-2 text-xs'>Next ▶</button></div>
          </article>)}</div>
        </div>)}
      </div>
    </section>

    <section className='grid gap-4 lg:grid-cols-2'>
      <div className='rounded-xl bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>Admin Tabs & RBAC</h2>
        <div className='mb-2 flex gap-2 text-sm'><span className='rounded bg-slate-900 px-2 py-1 text-white'>Roles</span><span className='rounded bg-slate-200 px-2 py-1'>Permissions</span><span className='rounded bg-slate-200 px-2 py-1'>Audit</span></div>
        <table className='w-full text-sm'><thead><tr className='text-left'><th>Role</th><th>Access</th></tr></thead><tbody><tr><td>Sales Head</td><td>Create/edit opportunities, stage moves</td></tr><tr><td>PAB Chair</td><td>PAB workflow decisions + comments</td></tr><tr><td>Finance Controller</td><td>Financial approval gate + CM2</td></tr><tr><td>Admin</td><td>RBAC, audit exports, role switcher</td></tr></tbody></table></div>
      <div className='rounded-xl bg-white p-3 shadow'><h2 className='mb-2 font-semibold'>Audit Log</h2>
        <table className='w-full text-sm'><thead><tr className='text-left'><th>Time</th><th>Entity</th><th>Action</th></tr></thead><tbody><tr><td>10:14</td><td>OP-138</td><td>Moved to Financial Gate</td></tr><tr><td>11:02</td><td>OP-141</td><td>PAB checklist updated</td></tr><tr><td>11:48</td><td>OP-132</td><td>MOU placeholder created</td></tr></tbody></table></div>
    </section>

    <section className='mt-4 rounded-xl bg-white p-3 shadow'>
      <h2 className='mb-2 font-semibold'>Extended Model: Revised O2O + PAB + Financial + MOU + O2C Tracker</h2>
      <div className='grid gap-2 md:grid-cols-3 text-sm'>
        <div><b>Revised O2O Stages:</b> {stageOrder.join(' → ')}</div>
        <div><b>PAB Workflows:</b> Pre-bid, Mid-bid, Post-award decision gates with owner sign-offs.</div>
        <div><b>Financial Approval Gate:</b> CM2 thresholds, CFO approval, exception handling.</div>
        <div><b>MOU Upload:</b> Required before O2C conversion; placeholder file attachments enabled.</div>
        <div><b>O2C Tracker:</b> {o2cStages.join(' → ')}</div>
        <div><b>Project Detail:</b> milestones, proofs, invoices, collections, CM2 and role-based actions.</div>
      </div>
    </section>

    {addOpen && <Modal title='Add Opportunity' onClose={() => setAddOpen(false)}><p className='text-sm'>Opportunity creation modal with required fields placeholder.</p><div className='mt-2 grid gap-2'><input className='rounded border px-2 py-1' placeholder='Opportunity Name' /><input className='rounded border px-2 py-1' placeholder='Account' /><button className='rounded bg-indigo-600 px-3 py-1 text-white'>Save</button></div></Modal>}
    {detail && <Modal title={`${detail.id} · ${detail.name}`} onClose={() => setDetail(null)}><div className='mb-2 flex gap-2 text-sm'>{(['Checklist', 'Comments', 'Files'] as const).map((t) => <button key={t} className={`rounded px-2 py-1 ${detailTab === t ? 'bg-slate-900 text-white' : 'bg-slate-200'}`} onClick={() => setDetailTab(t)}>{t}</button>)}</div>
      {detailTab === 'Checklist' && <div className='space-y-2'>{detail.checklist.map((c, i) => <div key={c.label} className='flex items-center justify-between rounded border p-2'><span>{c.label}</span><select className='rounded border px-2 py-1' value={c.status} onChange={(e) => {
        const status = e.target.value as Opportunity['checklist'][number]['status'];
        setOpps((prev) => prev.map((o) => o.id !== detail.id ? o : { ...o, checklist: o.checklist.map((it, ix) => ix === i ? { ...it, status } : it) }));
        setDetail((d) => d ? ({ ...d, checklist: d.checklist.map((it, ix) => ix === i ? { ...it, status } : it) }) : d);
      }}><option>Not Started</option><option>In Progress</option><option>Done</option><option>Blocked</option></select></div>)}</div>}
      {detailTab === 'Comments' && <div><textarea className='h-24 w-full rounded border p-2' placeholder='Add comment...' /><div className='mt-2 space-y-1 text-sm'>{detail.comments.map((c, i) => <p key={i} className='rounded bg-slate-100 p-2'>{c}</p>)}</div></div>}
      {detailTab === 'Files' && <div><button className='rounded border px-2 py-1 text-sm'>Attach file (placeholder)</button><ul className='mt-2 list-disc pl-5 text-sm'>{detail.files.map((f) => <li key={f}>{f}</li>)}</ul></div>}
    </Modal>}
  </div>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <div className='fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4'>
    <div className='w-full max-w-2xl rounded-xl bg-white p-4 shadow-xl'><div className='mb-3 flex items-center justify-between'><h3 className='font-semibold'>{title}</h3><button onClick={onClose}>✕</button></div>{children}</div>
  </div>;
}
