export default function Sidebar({ items, current, setCurrent }: { items: string[]; current: string; setCurrent: (s: string) => void }) {
  return <aside className='w-full bg-slate-950 p-3 text-slate-100 md:w-72'>{items.map((i) => <button key={i} onClick={() => setCurrent(i)} className={`mb-1 w-full rounded px-3 py-2 text-left ${current === i ? 'bg-indigo-600' : 'hover:bg-slate-800'}`}>{i}</button>)}</aside>;
}
