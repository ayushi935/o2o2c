import { useMemo, useState } from 'react';
import AppShell from './layout/AppShell';
import Sidebar from './layout/Sidebar';
import Card from './components/Card';
import DataTable from './components/DataTable';

type Role = 'Admin'|'BD'|'GI'|'RC Pod'|'Business Lead'|'GI Lead'|'Pod Sponsor'|'Delivery-track Sponsor'|'Platform-track Sponsor'|'Rishabh / CXO Lead'|'Prateek / CXO Lead'|'CFO / Somesh'|'Finance Ops'|'CCOO / Viprav'|'Tender Team'|'Delivery Pod Lead'|'Delivery Pod User'|'Program Pod User'|'Mission M&E'|'Founders Office'|'Portfolio Intelligence'|'Readonly';
const ROLES: Role[] = ['Admin','BD','GI','RC Pod','Business Lead','GI Lead','Pod Sponsor','Delivery-track Sponsor','Platform-track Sponsor','Rishabh / CXO Lead','Prateek / CXO Lead','CFO / Somesh','Finance Ops','CCOO / Viprav','Tender Team','Delivery Pod Lead','Delivery Pod User','Program Pod User','Mission M&E','Founders Office','Portfolio Intelligence','Readonly'];
const ACTIONS = ['Create opportunity','Edit opportunity','Request Pre-Bid PAB','Convene Pre-Bid PAB','Record Pre-Bid PAB decision','Validate platform feasibility','Validate delivery feasibility','Submit for financial approval','CFO sign-off','Lock CM2','Upload RFP','Upload technical bid','Upload financial bid','Upload EMD proof','Mark Bid Submitted','Upload Award Communication','Mark Won','Mark Lost','Mark No-Bid','Draft/update MOU','Upload Signed MOU','Trigger O2C transition','Create milestones','Edit milestones','Upload delivery proof','Upload MoM','Upload customer acknowledgement','Verify proof','Reject proof','Trigger invoice','Issue invoice','Record payment','Confirm collection','Log scope change','Assess scope change','Request Mid-Project PAB','Convene Mid-Project PAB','Complete Post-Project PAB','Archive record','Reactivate record','Soft delete record','Manage users','Manage roles','Manage checklist templates','Manage master data','View audit log','Export audit log'];
const PERMS: Record<Role, Set<string>> = Object.fromEntries(ROLES.map(r=>[r,new Set<string>()])) as any;
['Manage users','Manage roles','Manage checklist templates','Manage master data','Soft delete record','Archive record','Reactivate record','View audit log','Export audit log'].forEach(a=>PERMS['Admin'].add(a));
['Create opportunity','Edit opportunity','Request Pre-Bid PAB','Submit for financial approval'].forEach(a=>PERMS['BD'].add(a));
['Edit opportunity','Upload technical bid','Draft/update MOU','Upload Signed MOU'].forEach(a=>PERMS['GI'].add(a));
['Create opportunity','Edit opportunity','Request Pre-Bid PAB','Submit for financial approval','Upload delivery proof','Record payment','Request Mid-Project PAB'].forEach(a=>PERMS['RC Pod'].add(a));
['Edit opportunity','Mark Lost','Mark No-Bid','Submit for financial approval'].forEach(a=>PERMS['Business Lead'].add(a));
['Draft/update MOU','Upload Signed MOU'].forEach(a=>PERMS['GI Lead'].add(a));
['Assess scope change','Mark Lost','Mark No-Bid','Archive record'].forEach(a=>PERMS['Pod Sponsor'].add(a));
['Assess scope change','Request Mid-Project PAB'].forEach(a=>PERMS['Delivery-track Sponsor'].add(a));
['Validate platform feasibility'].forEach(a=>PERMS['Platform-track Sponsor'].add(a));
['Convene Pre-Bid PAB','Validate platform feasibility','Convene Mid-Project PAB'].forEach(a=>PERMS['Rishabh / CXO Lead'].add(a));
['Convene Pre-Bid PAB','Validate delivery feasibility','Convene Mid-Project PAB'].forEach(a=>PERMS['Prateek / CXO Lead'].add(a));
['CFO sign-off','Lock CM2'].forEach(a=>PERMS['CFO / Somesh'].add(a));
['Verify proof','Reject proof','Issue invoice','Confirm collection','Record payment','View audit log'].forEach(a=>PERMS['Finance Ops'].add(a));
['Upload financial bid'].forEach(a=>PERMS['CCOO / Viprav'].add(a));
['Upload RFP','Upload technical bid','Upload financial bid','Upload EMD proof','Mark Bid Submitted','Upload Award Communication','Mark Won'].forEach(a=>PERMS['Tender Team'].add(a));
['Edit milestones','Log scope change','Assess scope change'].forEach(a=>PERMS['Delivery Pod Lead'].add(a));
['Upload delivery proof'].forEach(a=>PERMS['Delivery Pod User'].add(a));
['Upload MoM','Upload customer acknowledgement','Request Mid-Project PAB'].forEach(a=>PERMS['Program Pod User'].add(a));
['Request Mid-Project PAB'].forEach(a=>PERMS['Mission M&E'].add(a));
['View audit log'].forEach(a=>PERMS['Founders Office'].add(a));
['View audit log'].forEach(a=>PERMS['Portfolio Intelligence'].add(a));

const NAV: Record<Role,string[]> = Object.fromEntries(ROLES.map(r=>[r,['/executive-home','/o2o','/o2c','/audit']])) as any;
NAV['Admin']=['/executive-home','/o2o','/o2c','/admin-rbac','/audit'];
NAV['Tender Team']=['/o2o','/audit']; NAV['Readonly']=['/executive-home','/o2o','/o2c'];

export default function App(){
  const [role,setRole]=useState<Role>('Admin'); const [path,setPath]=useState('/executive-home');
  const can=(a:string)=>PERMS[role].has(a);
  const sidebar = <Sidebar items={NAV[role]} current={path} setCurrent={setPath} />;
  const actionBtn=(label:string, gate?:string)=> <button disabled={!can(label) || !!gate} title={!can(label)?'Not permitted for selected role':gate} className='rounded border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-50'>{label}{gate?' [Source Rule]':''}</button>;
  const body = useMemo(()=>{
    if(path==='/admin-rbac') return <Card title='Admin / RBAC PRD Matrix'>
      <p className='mb-2 text-sm'>Role groups for MVP visibility shown, underlying permissions kept separate. Portfolio Intelligence ownership is marked where not explicit as [Recommendation]/[Open Question].</p>
      <DataTable cols={['Role','Persona','Audit visibility']} rows={ROLES.map(r=>[r,'PRD persona', can('View audit log')||r==='Admin'||r==='Founders Office'||r==='Portfolio Intelligence'?'Yes':'Limited'])} />
      <div className='mt-3'><DataTable cols={['Action','Allowed for selected role?']} rows={ACTIONS.map(a=>[a,can(a)?'Yes':'No — Not permitted for selected role'])} /></div>
    </Card>;
    if(path==='/o2o') return <Card title='O2O Workflow'>
      <p className='mb-2'>Approval blockers: Bid submission requires CFO sign-off [Source Rule]; Won requires Award Communication [Source Rule]; O2C transition only after signed MOU [Source Rule].</p>
      <div className='flex flex-wrap gap-2'>{actionBtn('Create opportunity')}{actionBtn('Request Pre-Bid PAB')}{actionBtn('Convene Pre-Bid PAB')}{actionBtn('Record Pre-Bid PAB decision')}{actionBtn('CFO sign-off')}{actionBtn('Mark Bid Submitted','CFO sign-off missing')}{actionBtn('Mark Won','Award Communication missing')}</div>
    </Card>;
    if(path==='/o2c') return <Card title='O2C Workflow'>
      <p className='mb-2'>RC Pod accountability remains active until Collection Complete [Source Rule]. Manual O2C trigger blocked for all roles [Source Rule].</p>
      <div className='flex flex-wrap gap-2'>{actionBtn('Upload Signed MOU')}{actionBtn('Trigger O2C transition','Only system trigger after Signed MOU')}{actionBtn('Create milestones')}{actionBtn('Upload delivery proof')}{actionBtn('Verify proof')}{actionBtn('Issue invoice')}{actionBtn('Record payment')}{actionBtn('Confirm collection')}</div>
    </Card>;
    if(path==='/audit') return <Card title='Audit'><p>{can('View audit log')?'Visible':'Not permitted for selected role'}</p>{actionBtn('Export audit log')}</Card>;
    return <Card title='Executive Home'>Role-based navigation and CTA visibility are enforced from PRD persona matrix.</Card>;
  },[path,role]);
  return <AppShell sidebar={sidebar} role={role} roles={ROLES} onRoleChange={(r)=>{setRole(r as Role); setPath(NAV[r as Role][0]);}}>{body}</AppShell>;
}
