import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';

export default function Modal({
  title,
  open,
  setOpen,
  children,
}: {
  title?: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
}) {
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetContent>
        <SheetHeader className="px-5 pt-5">
          <SheetTitle>{title ?? 'Modal'}</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[512px]">
          <div className="px-5 pb-5">{children}</div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
