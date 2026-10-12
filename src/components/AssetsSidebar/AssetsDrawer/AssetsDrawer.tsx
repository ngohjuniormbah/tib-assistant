'use client';

import { Drawer } from '@heroui/react';

import AssetsSidebarContent from '@/components/AssetsSidebar/AssetsSidebarContent/AssetsSidebarContent';

type AssetsDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  assistantId: string;
  inputAssets: string[];
  outputAssets: string[];
};

export default function AssetsDrawer({
  isOpen,
  onOpenChange,
  assistantId,
  inputAssets,
  outputAssets,
}: AssetsDrawerProps) {
  return (
    <Drawer.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Content placement="right">
        <Drawer.Dialog aria-label="Assets" className="pt-12">
          <Drawer.CloseTrigger />
          <AssetsSidebarContent
            assistantId={assistantId}
            inputAssets={inputAssets}
            outputAssets={outputAssets}
          />
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  );
}
