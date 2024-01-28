import SignIn from "@/components/auth/SignIn";
import { getUserAuth } from "@/lib/auth/utils";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { session } = await getUserAuth();

  if (session) {
    redirect("/");
  }

  return <SignIn />;
}
