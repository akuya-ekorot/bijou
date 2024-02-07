import { db } from '@/lib/db/index';
import { eq, and } from 'drizzle-orm';
import { getUserAuth } from '@/lib/auth/utils';
import {
  type ContentBlockProductId,
  contentBlockProductIdSchema,
  contentBlockProducts,
} from '@/lib/db/schema/contentBlockProducts';
import { products } from '@/lib/db/schema/products';
import { products } from '@/lib/db/schema/products';
import { contentBlocks } from '@/lib/db/schema/contentBlocks';

export const getContentBlockProducts = async () => {
  const { session } = await getUserAuth();
  const rows = await db
    .select({
      contentBlockProduct: contentBlockProducts,
      product: products,
      product: products,
      contentBlock: contentBlocks,
    })
    .from(contentBlockProducts)
    .leftJoin(products, eq(contentBlockProducts.productId, products.id))
    .leftJoin(products, eq(contentBlockProducts.productId, products.id))
    .leftJoin(
      contentBlocks,
      eq(contentBlockProducts.contentBlockId, contentBlocks.id),
    )
    .where(eq(contentBlockProducts.userId, session?.user.id!));
  const c = rows.map((r) => ({
    ...r.contentBlockProduct,
    product: r.product,
    product: r.product,
    contentBlock: r.contentBlock,
  }));
  return { contentBlockProducts: c };
};

export const getContentBlockProductById = async (id: ContentBlockProductId) => {
  const { session } = await getUserAuth();
  const { id: contentBlockProductId } = contentBlockProductIdSchema.parse({
    id,
  });
  const [row] = await db
    .select({
      contentBlockProduct: contentBlockProducts,
      product: products,
      product: products,
      contentBlock: contentBlocks,
    })
    .from(contentBlockProducts)
    .where(
      and(
        eq(contentBlockProducts.id, contentBlockProductId),
        eq(contentBlockProducts.userId, session?.user.id!),
      ),
    )
    .leftJoin(products, eq(contentBlockProducts.productId, products.id))
    .leftJoin(products, eq(contentBlockProducts.productId, products.id))
    .leftJoin(
      contentBlocks,
      eq(contentBlockProducts.contentBlockId, contentBlocks.id),
    );
  if (row === undefined) return {};
  const c = {
    ...row.contentBlockProduct,
    product: row.product,
    product: row.product,
    contentBlock: row.contentBlock,
  };
  return { contentBlockProduct: c };
};
