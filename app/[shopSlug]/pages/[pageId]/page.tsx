import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getPageById } from "@/lib/api/pages/queries";
import OptimisticPage from "./OptimisticPage";
import { checkAuth } from "@/lib/auth/utils";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import Loading from "@/app/loading";


export const revalidate = 0;

export default async function PagePage({
  params,
}: {
  params: { pageId: string };
}) {

  return (
    <main className="overflow-auto">
      <Page id={params.pageId} />
    </main>
  );
}

const Page = async ({ id }: { id: string }) => {
  await checkAuth();

  const { page } = await getPageById(id);
  

  if (!page) notFound();
  return (
    <Suspense fallback={<Loading />}>
      <div className="relative">
        <Button asChild variant="ghost">
          <Link href="/pages">
            <ChevronLeftIcon />
          </Link>
        </Button>
        <OptimisticPage page={page}  />
      </div>
    </Suspense>
  );
};
