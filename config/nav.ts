import { SidebarLink } from "@/components/SidebarItems";
import { Cog, Globe, HomeIcon, LibraryBig, Tags } from "lucide-react";

type AdditionalLinks = {
  title?: string;
  links: SidebarLink[];
};

export const defaultLinks: SidebarLink[] = [
  { href: "/", title: "Home", icon: HomeIcon },
  { href: "/account", title: "Account", icon: Cog },
  { href: "/settings", title: "Settings", icon: Cog },
];

export const additionalLinks: AdditionalLinks[] = [
  {
    links: [
      {
        href: "/collections",
        title: "Collections",
        icon: LibraryBig,
      },
      {
        href: "/products",
        title: "Products",
        icon: Tags,
      },
    ],
  },
];
