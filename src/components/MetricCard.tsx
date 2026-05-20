import Card from './Card';
export default function MetricCard({ label, value }: { label: string; value: string | number }) { return <Card><p className='text-xs text-slate-500'>{label}</p><p className='text-2xl font-bold'>{value}</p></Card>; }
