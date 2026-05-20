import type { UIState } from '../types';

const stateStyles: Record<UIState, string> = {
  empty: 'bg-slate-100 text-slate-700',
  loading: 'bg-sky-100 text-sky-700',
  blocked: 'bg-rose-100 text-rose-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  delayed: 'bg-amber-100 text-amber-700',
  terminal: 'bg-violet-100 text-violet-700',
  active: 'bg-indigo-100 text-indigo-700',
};

export default function StatePill({ state }: { state: UIState }) {
  return <span className={`rounded px-2 py-1 text-xs font-medium capitalize ${stateStyles[state]}`}>{state}</span>;
}
