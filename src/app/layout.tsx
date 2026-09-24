import '@/assets/globals.css';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { config } from '@fortawesome/fontawesome-svg-core';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PublicEnvScript } from 'next-runtime-env';
import { ReactNode } from 'react';

import ClientProviders from '@/app/(layout)/components/ClientProviders/ClientProvides';
import LayoutContainer from '@/app/(layout)/components/LayoutContainer/LayoutContainer';
import ServerProviders from '@/app/(layout)/components/ServerProviders/ServerProviders';

config.autoAddCss = false;

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | TIB AIssistant',
    default: 'TIB AIssistant',
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    // next-themes sets `class`/`data-theme` before paint, which the server cannot know
    <html lang="en" suppressHydrationWarning>
      <head>
        <PublicEnvScript />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <ServerProviders>
          <ClientProviders>
            <LayoutContainer>{children}</LayoutContainer>
          </ClientProviders>
        </ServerProviders>
      </body>
    </html>
  );
}
