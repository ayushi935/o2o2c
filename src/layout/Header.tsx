import { ShieldCheck } from 'lucide-react';

export default function Header({ role, roles, onRoleChange, queueCount = 0 }: { role: string; roles: string[]; onRoleChange: (r: string) => void; queueCount?: number }) {
  return <header className='flex flex-wrap items-center justify-between gap-3 border-b bg-white p-4'>
    <div className='flex items-center gap-3 font-semibold'>
      <span className='flex items-center gap-2'><ShieldCheck size={18} />ConveGenius O2O → O2C Governance OS</span>
      <span className='rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900'>Global Action Queue: {queueCount}</span>
    </div>
    <div className='flex items-center gap-2 text-sm'>
      <span className='text-slate-500'>Role Switcher</span>
      <select className='rounded border px-2 py-1' value={role} onChange={(e) => onRoleChange(e.target.value)}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
    </div>
  </header>;
}
