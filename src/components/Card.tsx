import { ReactNode } from 'react';
export default function Card({ title, children }: { title?: string; children: ReactNode }) {
  return <section className='rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>{title && <h3 className='mb-3 font-semibold'>{title}</h3>}{children}</section>;
}
