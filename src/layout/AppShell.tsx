import { ReactNode } from 'react';
import Header from './Header';
export default function AppShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return <div className='min-h-screen'><Header /><div className='md:flex'>{sidebar}<main className='flex-1 p-4'>{children}</main></div></div>;
}
