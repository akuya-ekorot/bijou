import { SidebarLink } from '@/components/SidebarItems';
import {
  Cog,
  FileStack,
  Globe,
  HomeIcon,
  Image,
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
    title: 'Entities',
    links: [
      {
        href: '/pages',
        title: 'Pages',
        icon: FileStack,
      },
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
      {
        href: '/payments',
        title: 'Payments',
        icon: Globe,
      },
      {
        href: '/products',
        title: 'Products',
        icon: Tags,
      },
      { href: '/collections', title: 'Collections', icon: LibraryBig },
      { href: '/images', title: 'Images', icon: Image },
    ],
  },
];
