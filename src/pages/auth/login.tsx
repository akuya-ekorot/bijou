import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@refinedev/core";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export default function LoginPage() {
  const { mutate: login, isLoading } = useLogin<z.infer<typeof loginSchema>>();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login(values);
  }

  return (
    <main className="h-screen flex items-center justify-center">
      <Form {...form}>
        <form
          className="w-full max-w-sm space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type={"email"}
                    autoComplete="email"
                    placeholder="your@email.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter your email</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="new-password"
                    type={"password"}
                    placeholder="Password..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter your password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 w-full">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
