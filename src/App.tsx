import { useState } from 'react';
import AppShell from './layout/AppShell';
import Sidebar from './layout/Sidebar';
import { screenNames, screens } from './pages/screens';

export default function App() {
  const [activeScreen, setActiveScreen] = useState(screenNames[0]);
  return <AppShell sidebar={<Sidebar items={screenNames} current={activeScreen} setCurrent={setActiveScreen} />}>
    <div className='mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900'>Governance-first mode: approvals, evidence, blockers, stage logic, and role accountability are always visible.</div>
    {screens[activeScreen]}
  </AppShell>;
}
