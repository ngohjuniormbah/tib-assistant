'use client';

import { Drawer } from '@heroui/react';

import SideBarContent from '@/app/(layoutWithSidebar)/components/Sidebar/SideBarContent/SideBarContent';

type NavigationDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function NavigationDrawer({
  isOpen,
  onOpenChange,
}: NavigationDrawerProps) {
  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="left">
        {/* the panel replaces the desktop column, so it repeats its `justify-between` */}
        <Drawer.Dialog
          aria-label="Navigation"
          className="justify-between pt-12"
        >
          <Drawer.CloseTrigger />
          <SideBarContent />
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
