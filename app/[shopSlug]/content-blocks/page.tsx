import { Suspense } from "react";

import Loading from "@/app/loading";
import ContentBlockList from "@/components/contentBlocks/ContentBlockList";
import { getContentBlocks } from "@/lib/api/contentBlocks/queries";
import { getPages } from "@/lib/api/pages/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ContentBlocksPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Content Blocks</h1>
        </div>
        <ContentBlocks />
      </div>
    </main>
  );
}

const ContentBlocks = async () => {
  await checkAuth();

  const { contentBlocks } = await getContentBlocks();
  const { pages } = await getPages();
  return (
    <Suspense fallback={<Loading />}>
      <ContentBlockList contentBlocks={contentBlocks} pages={pages} />
    </Suspense>
  );
};
