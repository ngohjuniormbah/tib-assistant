'use client';

import { Button } from '@heroui/react';
import Link from 'next/link';

import ErrorLayout from '@/app/(errorPages)/ErrorLayout';
import ROUTES from '@/constants/routes';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <ErrorLayout>
      <h1>An error occurred</h1>
      <p className="mb-6">An error occurred.</p>
      <Button
        variant="primary"
        onPress={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
      or
      <Link href={ROUTES.HOME}>Go back to home</Link>
    </ErrorLayout>
  );
}
