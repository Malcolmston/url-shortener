import { type ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/session';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getUser();
  if (!user) redirect('/login');

  return (
    <AppShell user={{ username: user.username, firstname: user.firstname, lastname: user.lastname }}>
      {children}
    </AppShell>
  );
}
