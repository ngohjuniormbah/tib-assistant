import Link from 'next/link';

import ErrorLayout from '@/app/(errorPages)/ErrorLayout';
import ROUTES from '@/constants/routes';

export default function Unauthorized() {
  return (
    <ErrorLayout>
      <h1>Unauthorized</h1>
      <p className="mb-6">You need to be logged in to access this page.</p>
      <Link href={ROUTES.HOME}>Go back to home to sign in</Link>
    </ErrorLayout>
  );
}
