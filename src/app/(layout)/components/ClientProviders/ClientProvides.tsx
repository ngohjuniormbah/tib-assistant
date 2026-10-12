'use client';

import { Toast } from '@heroui/react';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

import SidebarsProvider from '@/components/SidebarsProvider/SidebarsProvider';

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      // `theme.css` selects on `.dark`/`[data-theme=…]` and HeroUI reads either,
      // so keep both attributes in sync.
      attribute={['class', 'data-theme']}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen">
        <Toast.Provider placement="top end" />
        <SidebarsProvider>{children}</SidebarsProvider>
      </div>
    </ThemeProvider>
  );
}
