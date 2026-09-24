import { ReactNode } from 'react';

import SideBar from '@/app/(layoutWithSidebar)/components/Sidebar/SideBar';
import AssetsProvider from '@/components/AssetsProvider/AssetsProvider';

export default async function LayoutWithSidebar({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SideBar />
      <AssetsProvider>{children}</AssetsProvider>
    </>
  );
}
