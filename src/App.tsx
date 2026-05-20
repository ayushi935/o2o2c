import { useState } from 'react';
import { AppShell, Sidebar } from './layout/AppShell';
import { screens } from './pages/screens';
import { ShieldCheck } from 'lucide-react';

const menu = Object.keys(screens);

export default function App(){
  const [current,setCurrent]=useState(menu[0]);
  return <AppShell sidebar={<Sidebar items={menu} current={current} set={setCurrent}/>}> 
    <div className='mb-3 flex items-center gap-2 text-indigo-700 font-semibold'><ShieldCheck size={18}/> Governance-first workflow: {current}</div>
    {screens[current]}
  </AppShell>;
}
