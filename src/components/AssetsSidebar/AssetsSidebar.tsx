import 'react-resizable/css/styles.css';

import { SyntheticEvent, useContext, useEffect } from 'react';
import { ResizableBox, ResizeCallbackData } from 'react-resizable';

import AssetsDrawer from '@/components/AssetsSidebar/AssetsDrawer/AssetsDrawer';
import AssetsSidebarContent from '@/components/AssetsSidebar/AssetsSidebarContent/AssetsSidebarContent';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import sidebarsContext from '@/components/SidebarsProvider/sidebarsContext';

type Props = {
  assistantId: string;
  inputAssets: string[];
  outputAssets: string[];
};

export default function AssetsSidebar({
  assistantId,
  inputAssets,
  outputAssets,
}: Props) {
  const { assetsToolbarWidth, setAssetsToolbarWidth } = useStore();
  const { assetsDrawerState, isCompactViewport, setHasAssetsPanel } =
    useContext(sidebarsContext);

  // the header only offers its assets button while a page actually has assets
  useEffect(() => {
    setHasAssetsPanel(true);

    return () => setHasAssetsPanel(false);
  }, [setHasAssetsPanel]);

  // the resize handle is meaningless on touch, and the width `ResizableBox` writes inline
  // would fight the drawer panel — so below `lg` the box is left out entirely
  if (isCompactViewport) {
    return (
      <AssetsDrawer
        isOpen={assetsDrawerState.isOpen}
        onOpenChange={assetsDrawerState.setOpen}
        assistantId={assistantId}
        inputAssets={inputAssets}
        outputAssets={outputAssets}
      />
    );
  }

  return (
    <ResizableBox
      width={Math.min(assetsToolbarWidth, 600)}
      height={Infinity}
      axis="x"
      resizeHandles={['w']}
      handle={
        <div
          className="group h-20 absolute top-1/2 cursor-ew-resize p-2 -left-[18px]"
          onDoubleClick={() => setAssetsToolbarWidth(320)}
        >
          <div className="w-1 bg-muted/60 h-full rounded group-hover:bg-muted transition-colors"></div>
        </div>
      }
      onResizeStop={(e: SyntheticEvent, data: ResizeCallbackData) =>
        setAssetsToolbarWidth(data.size.width)
      }
      minConstraints={[200, Infinity]}
      // a width persisted from a wide monitor must not swallow a narrow one
      maxConstraints={[600, Infinity]}
      className="box-white hidden lg:flex flex-col"
    >
      <AssetsSidebarContent
        assistantId={assistantId}
        inputAssets={inputAssets}
        outputAssets={outputAssets}
      />
    </ResizableBox>
  );
}
