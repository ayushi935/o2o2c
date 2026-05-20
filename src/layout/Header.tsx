import { ShieldCheck } from 'lucide-react';

export default function Header({ role, roles, onRoleChange }: { role: string; roles: string[]; onRoleChange: (r: string) => void }) {
  return <header className='flex flex-wrap items-center justify-between gap-3 border-b bg-white p-4'>
    <div className='flex items-center gap-2 font-semibold'><ShieldCheck size={18} />ConveGenius Governance OS</div>
    <div className='flex items-center gap-2 text-sm'>
      <span className='text-slate-500'>Role Switcher</span>
      <select className='rounded border px-2 py-1' value={role} onChange={(e) => onRoleChange(e.target.value)}>{roles.map((r) => <option key={r}>{r}</option>)}</select>
    </div>
  </header>;
}
