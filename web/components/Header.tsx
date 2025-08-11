'use client';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { registerPushToken } from '@/lib/push-client';

const links: { href: Route; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/account', label: 'Account' },
  { href: '/workorders', label: 'Work Orders' },
  { href: '/technicians', label: 'Technicians' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/map', label: 'Map' },
  { href: '/settings', label: 'Settings' },
];

export default function Header(){
  const pathname = usePathname();

  useEffect(() => { registerPushToken(); }, []);

  return (
    <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:16 }}>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          style={{
            padding:'8px 12px',
            borderRadius:12,
            textDecoration:'none',
            background: pathname === href ? '#334155' : '#1f2937',
            color:'#e6e6ea',
            border:'1px solid rgba(255,255,255,0.08)',
          }}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
