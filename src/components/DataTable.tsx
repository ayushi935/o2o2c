import { ReactNode } from 'react';
export default function DataTable({ cols, rows }: { cols: string[]; rows: (string | number | ReactNode)[][] }) {
  return <div className='overflow-auto'><table className='w-full text-sm'><thead><tr>{cols.map((c) => <th className='border-b p-2 text-left' key={c}>{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td className='border-b p-2' key={j}>{c}</td>)}</tr>)}</tbody></table></div>;
}
