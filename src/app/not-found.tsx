import Link from 'next/link';

import ErrorLayout from '@/app/(errorPages)/ErrorLayout';
import ROUTES from '@/constants/routes';

export default function NotFound() {
  return (
    <ErrorLayout>
      <h1>Page not found</h1>
      <p className="mb-6">The page you are looking for does not exist.</p>
      <Link href={ROUTES.HOME}>Go back to home</Link>
    </ErrorLayout>
  );
}
