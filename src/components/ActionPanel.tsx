interface ActionPanelProps {
  requiredAction: string;
  owner: string;
  blocker: string;
  artifact: string;
  sla: string;
  nextAction: string;
}

export default function ActionPanel({ requiredAction, owner, blocker, artifact, sla, nextAction }: ActionPanelProps) {
  return <aside className='rounded-xl border border-amber-200 bg-amber-50 p-4'>
    <h4 className='mb-3 text-sm font-semibold text-amber-900'>Required Governance Action</h4>
    <ul className='space-y-2 text-sm text-slate-800'>
      <li><strong>Current action:</strong> {requiredAction}</li>
      <li><strong>Owner:</strong> {owner}</li>
      <li><strong>Blocker:</strong> {blocker}</li>
      <li><strong>Required artifact:</strong> {artifact}</li>
      <li><strong>SLA / aging:</strong> {sla}</li>
      <li><strong>Next allowed action:</strong> {nextAction}</li>
    </ul>
  </aside>;
}
