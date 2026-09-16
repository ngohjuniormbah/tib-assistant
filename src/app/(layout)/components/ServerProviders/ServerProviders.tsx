import { CookiesProvider } from 'next-client-cookies/server';
import { ReactNode } from 'react';

export default function ServerProviders({ children }: { children: ReactNode }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
