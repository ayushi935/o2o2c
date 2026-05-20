import { ReactNode } from 'react';
import Header from './Header';
export default function AppShell({ sidebar, children, role, roles, onRoleChange, queueCount }: { sidebar: ReactNode; children: ReactNode; role: string; roles: string[]; onRoleChange: (r: string) => void; queueCount?: number }) {
  return <div className='min-h-screen'><Header role={role} roles={roles} onRoleChange={onRoleChange} queueCount={queueCount} /><div className='md:flex'>{sidebar}<main className='flex-1 p-4'>{children}</main></div></div>;
}
