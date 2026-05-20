export default function LifecycleStepper({ steps, current }: { steps: string[]; current: number }) {
  return <div className='flex flex-wrap gap-2'>{steps.map((s, i) => <span key={s} className={`rounded px-2 py-1 text-xs ${i <= current ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}>{i + 1}. {s}</span>)}</div>;
}
