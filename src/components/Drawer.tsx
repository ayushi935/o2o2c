import { ReactNode } from 'react'; import Card from './Card';
export default function Drawer({ title, children }: { title: string; children: ReactNode }) { return <Card title={title}>{children}</Card>; }
