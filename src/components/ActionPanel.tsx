import { ReactNode } from 'react';
export default function ActionPanel({ children }: { children: ReactNode }) { return <div className='rounded-xl bg-slate-900 p-4 text-white'>{children}</div>; }
