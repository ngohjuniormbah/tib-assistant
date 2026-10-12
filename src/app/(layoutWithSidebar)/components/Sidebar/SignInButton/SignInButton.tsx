'use client';

import { Button, toast } from '@heroui/react';
import { useCookies } from 'next-client-cookies';
import { env } from 'next-runtime-env';
import PocketBase, { ClientResponseError } from 'pocketbase';
import { mutate } from 'swr';

export default function SignInButton() {
  const cookies = useCookies();

  const handleSignInWithORKG = async () => {
    const pb = new PocketBase(env('NEXT_PUBLIC_POCKETBASE_URL'));

    pb.authStore.clear();
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'oidc' });
      cookies.set('pb_token', pb.authStore.exportToCookie());
      mutate('isAuthenticated', true);
      mutate('getUserData');
    } catch (error) {
      console.error(error);
      if (error instanceof ClientResponseError) {
        console.error(error);
        toast.danger('An error occurred', {
          description: error.message,
        });
      }
    }
  };

  return (
    <div className="mt-10 text-center">
      <Button variant="primary" onPress={handleSignInWithORKG}>
        Sign in
      </Button>
      <p className="mt-3 bg-surface">
        To get started, you <br />
        need to sign in first
      </p>
    </div>
  );
}
