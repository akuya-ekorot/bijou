import { Suspense } from "react";

import Loading from "@/app/loading";
import ContentBlockCollectionList from "@/components/contentBlockCollections/ContentBlockCollectionList";
import { getContentBlockCollections } from "@/lib/api/contentBlockCollections/queries";
import { getCollections } from "@/lib/api/collections/queries";
import { getContentBlocks } from "@/lib/api/contentBlocks/queries";
import { checkAuth } from "@/lib/auth/utils";

export const revalidate = 0;

export default async function ContentBlockCollectionsPage() {
  return (
    <main>
      <div className="relative">
        <div className="flex justify-between">
          <h1 className="font-semibold text-2xl my-2">Content Block Collections</h1>
        </div>
        <ContentBlockCollections />
      </div>
    </main>
  );
}

const ContentBlockCollections = async () => {
  await checkAuth();

  const { contentBlockCollections } = await getContentBlockCollections();
  const { collections } = await getCollections();
  const { contentBlocks } = await getContentBlocks();
  return (
    <Suspense fallback={<Loading />}>
      <ContentBlockCollectionList contentBlockCollections={contentBlockCollections} collections={collections} contentBlocks={contentBlocks} />
    </Suspense>
  );
};
