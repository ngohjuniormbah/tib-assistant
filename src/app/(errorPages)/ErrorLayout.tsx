import { ReactNode } from 'react';

export default function ErrorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full box-white !py-16">
      {children}
    </div>
  );
}
