import { useMemo, useState } from 'react';
import AppShell from './layout/AppShell';
import Sidebar from './layout/Sidebar';
import { roleNav } from './data/mockData';
import { screens } from './pages/screens';

const roles = Object.keys(roleNav);

export default function App() {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const visibleScreens = useMemo(() => roleNav[activeRole] ?? [], [activeRole]);
  const [activeScreen, setActiveScreen] = useState(visibleScreens[0] ?? 'Executive Home');

  const resolvedScreen = visibleScreens.includes(activeScreen) ? activeScreen : visibleScreens[0];

  return <AppShell sidebar={<Sidebar items={visibleScreens} current={resolvedScreen} setCurrent={setActiveScreen} />}>
    <div className='mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900'>
      <span className='font-semibold'>Governance-first mode</span>
      <span className='text-indigo-500'>|</span>
      <label className='font-medium'>Role view:</label>
      <select value={activeRole} onChange={(e) => { setActiveRole(e.target.value); setActiveScreen((roleNav[e.target.value] ?? [])[0]); }} className='rounded border border-indigo-300 bg-white px-2 py-1 text-sm'>
        {roles.map((role) => <option key={role} value={role}>{role}</option>)}
      </select>
    </div>
    {screens[resolvedScreen]}
  </AppShell>;
}
