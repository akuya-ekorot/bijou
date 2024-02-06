import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Eye, MoreHorizontal, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompleteCollection } from '@/lib/db/schema/collections';
import { Product } from '@/lib/db/schema/products';
import Link from 'next/link';
import { Badge } from '../ui/badge';

export const columns: ColumnDef<CompleteCollection>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'products',
    header: () => <div className="">No. of products</div>,
    cell: ({ row }) => {
      const products = row.getValue('products') as Array<Product>;

      return (
        <p className="flex flex-wrap items-center gap-2">
          <Badge>{products.length}</Badge>
        </p>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const collection = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link
                className="flex items-center gap-2"
                href={`collections/${collection.id}`}
              >
                <Eye className="h-4 w-4" />
                View collection
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button
                variant={'destructive'}
                className="flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete collection
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
