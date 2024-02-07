import { db } from '@/lib/db/index';
import { eq, and } from 'drizzle-orm';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type ContentBlockId,
  contentBlockIdSchema,
  contentBlocks,
} from '@/lib/db/schema/contentBlocks';
import { pages } from '@/lib/db/schema/pages';
import {
  contentBlockProducts,
  type CompleteContentBlockProduct,
} from '@/lib/db/schema/contentBlockProducts';
import {
  contentBlockCollections,
  type CompleteContentBlockCollection,
} from '@/lib/db/schema/contentBlockCollections';

export const getContentBlocks = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select({ contentBlock: contentBlocks, page: pages })
    .from(contentBlocks)
    .leftJoin(pages, eq(contentBlocks.pageId, pages.id))
    .where(eq(contentBlocks.userId, session?.user.id!));
  const c = rows.map((r) => ({ ...r.contentBlock, page: r.page }));
  return { contentBlocks: c };
};

export const getContentBlockById = async (id: ContentBlockId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockId } = contentBlockIdSchema.parse({ id });
  const [row] = await db
    .select({ contentBlock: contentBlocks, page: pages })
    .from(contentBlocks)
    .where(
      and(
        eq(contentBlocks.id, contentBlockId),
        eq(contentBlocks.userId, session?.user.id!),
      ),
    )
    .leftJoin(pages, eq(contentBlocks.pageId, pages.id));
  if (row === undefined) return {};
  const c = { ...row.contentBlock, page: row.page };
  return { contentBlock: c };
};

export const getContentBlockByIdWithContentBlockProductsAndContentBlockCollections =
  async (id: ContentBlockId) => {
    const { session } = await getUserAuth();
    const { id: contentBlockId } = contentBlockIdSchema.parse({ id });
    const rows = await db
      .select({
        contentBlock: contentBlocks,
        contentBlockProduct: contentBlockProducts,
        contentBlockCollection: contentBlockCollections,
      })
      .from(contentBlocks)
      .where(
        and(
          eq(contentBlocks.id, contentBlockId),
          eq(contentBlocks.userId, session?.user.id!),
        ),
      )
      .leftJoin(
        contentBlockProducts,
        eq(contentBlocks.id, contentBlockProducts.contentBlockId),
      )
      .leftJoin(
        contentBlockCollections,
        eq(contentBlocks.id, contentBlockCollections.contentBlockId),
      );
    if (rows.length === 0) return {};
    const c = rows[0].contentBlock;
    const cp = rows
      .filter((r) => r.contentBlockProduct !== null)
      .map((c) => c.contentBlockProduct) as CompleteContentBlockProduct[];
    const cc = rows
      .filter((r) => r.contentBlockCollection !== null)
      .map((c) => c.contentBlockCollection) as CompleteContentBlockCollection[];

    return {
      contentBlock: c,
      contentBlockProducts: cp,
      contentBlockCollections: cc,
    };
  };
