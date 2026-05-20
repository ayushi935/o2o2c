import { ReactNode } from 'react';
export default function Modal({ title, children }: { title: string; children: ReactNode }) { return <div className='rounded-xl border bg-white p-4'><h4 className='font-semibold'>{title}</h4><div className='mt-2'>{children}</div></div>; }
