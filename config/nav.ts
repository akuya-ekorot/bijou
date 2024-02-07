import { SidebarLink } from '@/components/SidebarItems';
import {
  Cog,
  File,
  FileStack,
  Globe,
  HomeIcon,
  LibraryBig,
  Tags,
} from 'lucide-react';

type AdditionalLinks = {
  title?: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: '/', title: 'Home', icon: HomeIcon },
  { href: '/account', title: 'Account', icon: Cog },
  { href: '/settings', title: 'Settings', icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
  {
    title: 'Shop Resources',
    links: [
      {
        href: '/products',
        title: 'Products',
        icon: Tags,
      },
      { href: '/collections', title: 'Collections', icon: LibraryBig },
      {
        href: '/orders',
        title: 'Orders',
        icon: Globe,
      },
      {
        href: '/customers',
        title: 'Customers',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Shop Pages',
    links: [
      {
        href: '/pages',
        title: 'Pages',
        icon: FileStack,
      },
      {
        href: '/content-blocks',
        title: 'Content Blocks',
        icon: File,
      },
      {
        href: '/heroes',
        title: 'Heroes',
        icon: File,
      },
    ],
  },
];
