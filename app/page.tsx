import { getShops } from "@/lib/api/shops/queries";
import { getUserAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function Home() {
  const { session } = await getUserAuth();
  const { shops } = await getShops();

  if (!session) {
    redirect("/auth");
  }

  if (!shops.length) {
    redirect("/shops");
  }

  return (
    <main className="space-y-4">
      {shops.length > 0 ? (
        <pre className="bg-secondary p-4 rounded-sm shadow-sm text-secondary-foreground break-all whitespace-break-spaces">
          {JSON.stringify(shops, null, 2)}
        </pre>
      ) : null}
    </main>
  );
}
