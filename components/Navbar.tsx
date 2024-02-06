'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { defaultLinks } from '@/config/nav';

export default function Navbar({ shopSlug }: { shopSlug: string }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden border-b mb-4 pb-2 w-full">
      <nav className="flex justify-between w-full items-center">
        <div className="font-semibold text-lg">Logo</div>
      </nav>
      <div className="my-4 p-4 bg-muted">
        <ul className="space-y-2">
          {defaultLinks.map((link) => (
            <li key={link.title} className="">
              <Link
                href={`${shopSlug}/${link.href}`}
                className={
                  pathname === `${shopSlug}/${link.href}`
                    ? 'text-primary hover:text-primary font-semibold'
                    : 'text-muted-foreground hover:text-primary'
                }
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
