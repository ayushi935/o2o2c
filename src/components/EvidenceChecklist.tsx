export default function EvidenceChecklist({ items }: { items: { label: string; ok: boolean }[] }) {
  return <ul className='space-y-1'>{items.map((i) => <li className='text-sm' key={i.label}>{i.ok ? '✅' : '❌'} {i.label}</li>)}</ul>;
}
