'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';

export default function SignIn() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');

  if (status === 'loading') return <div>Loading...</div>;

  if (session) {
    return (
      <div className="space-y-3">
        <p>
          Signed in as{' '}
          <span className="font-medium">{session.user?.email}</span>
        </p>
        <Button variant={'destructive'} onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-16 gap-3">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Sign in with your email to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            name="email"
            autoComplete="email"
          />
          <Button
            className="w-full"
            onClick={() =>
              signIn('email', {
                email,
                callbackUrl: '/',
              })
            }
          >
            Continue with Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
