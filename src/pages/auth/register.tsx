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
import { useLogin, useRegister } from "@refinedev/core";
import { useForm } from "react-hook-form";
import * as z from "zod";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
});

export default function RegisterPage() {
  const { mutate: register, isLoading } =
    useRegister<z.infer<typeof registerSchema>>();
  const { mutate: login } = useLogin<z.infer<typeof registerSchema>>();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    // check if password and confirm password match
    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", {
        type: "manual",
        message: "Passwords do not match",
      });
      return;
    }

    register(values, {
      onSuccess: (data) => {
        if (!data.success) {
          form.setError("email", {
            message: data.error?.message,
          });
          return;
        }

        login(values);
      },
    });
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="name"
                    placeholder="Jane Doe"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Enter your full name</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="new-password"
                    type={"password"}
                    placeholder="Confirm password..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>Confirm your password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4 w-full">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Loading..." : "Sign up"}
            </Button>
          </div>
        </form>
      </Form>
    </main>
  );
}
