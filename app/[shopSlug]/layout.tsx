import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { checkAuth } from '@/lib/auth/utils';

export default async function Layout({
  children,
  params: { shopSlug },
}: {
  children: React.ReactNode;
  params: { shopSlug: string };
}) {
  await checkAuth();

  return (
    <div className="flex">
      <Sidebar shopSlug={shopSlug} />
      <main className="flex-1 md:p-8 pt-2 p-8 overflow-y-auto">
        <Navbar shopSlug={shopSlug} />
        {children}
      </main>
    </div>
  );
}
