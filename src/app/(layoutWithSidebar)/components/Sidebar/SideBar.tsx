'use client';

import { useContext } from 'react';

import SideBarContent from '@/app/(layoutWithSidebar)/components/Sidebar/SideBarContent/SideBarContent';
import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';

export default function SideBar() {
  const { isCompactViewport } = useContext(sidebarsContext);

  // below `lg` the same content lives in the navigation drawer, which `AppHeader`
  // renders so that ☰ keeps working on routes without a sidebar
  if (isCompactViewport) {
    return null;
  }

  return (
    // `hidden lg:flex` as well as the unmount above: the server has no viewport, so
    // this keeps the server-rendered markup right on a phone during hydration
    <div className="box-white w-56 grow-0 shrink-0 hidden lg:flex flex-col justify-between">
      <SideBarContent />
    </div>
  );
}
