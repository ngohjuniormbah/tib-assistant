import { faCog, faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Button, Tooltip, useOverlayState } from '@heroui/react';
import { isEqual } from 'lodash';

import AssetsItem from '@/components/AssetsSidebar/AssetsItem/AssetsItem';
import ConfigureAssetsModal from '@/components/AssetsSidebar/ConfigureAssetsModal/ConfigureAssetsModal';
import ExportAssetsModal from '@/components/AssetsSidebar/ExportAssetsModal/ExportAssetsModal';
import useStore from '@/components/AssetsSidebar/hooks/useStore';

type AssetsSidebarContentProps = {
  assistantId: string;
  inputAssets: string[];
  outputAssets: string[];
};

/**
 * The assets panel's contents, without the panel it sits in: the desktop column supplies
 * the resizable `box-white` box, the assets drawer supplies its own panel. Keeping the two
 * apart lets a single instance move between them instead of being mounted twice.
 */
export default function AssetsSidebarContent({
  assistantId,
  inputAssets,
  outputAssets,
}: AssetsSidebarContentProps) {
  const configureAssetsModalState = useOverlayState();

  const exportAssetsModalState = useOverlayState();

  const store = useStore();

  const activeAssets = store.enabledAssets?.[assistantId];
  const activeInputAssets = activeAssets?.inputAssets ?? inputAssets;
  const activeOutputAssets = activeAssets?.outputAssets ?? outputAssets;
  // TODO replace isInputAsset with a separate lists for input and output assets (needs to update AssetsItem and ConfigureAssetsModal)
  const assetsToRender = [
    ...activeInputAssets.map((id) => ({ id, isInputAsset: true })),
    ...activeOutputAssets.map((id) => ({
      id,
      isInputAsset: false,
    })),
  ];

  return (
    <>
      <div className="flex flex-col gap-2 grow-1 h-full min-h-0">
        <h1 className="text-xl mb-0">Assets</h1>
        <div className="overflow-y-auto h-full">
          {assetsToRender.map((asset) => (
            <AssetsItem key={asset.id} asset={asset} />
          ))}
        </div>
        <div className="flex justify-center gap-1">
          {/* independent actions, not a segmented control — keep them spaced */}
          <div className="flex items-center gap-1">
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  onPress={exportAssetsModalState.open}
                  size="sm"
                  isIconOnly
                  aria-label="Export assets"
                  variant="tertiary"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Export assets</Tooltip.Content>
            </Tooltip>
            <Tooltip delay={0}>
              <Tooltip.Trigger>
                <Button
                  size="sm"
                  isIconOnly
                  aria-label="Configure assets"
                  onPress={configureAssetsModalState.open}
                  variant="tertiary"
                >
                  <Badge.Anchor>
                    <FontAwesomeIcon icon={faCog} />
                    {!(
                      !store.enabledAssets?.[assistantId] ||
                      isEqual(
                        { inputAssets, outputAssets },
                        store.enabledAssets?.[assistantId]
                      )
                    ) && (
                      <Badge color="accent" placement="top-right" size="sm" />
                    )}
                  </Badge.Anchor>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Configure assets</Tooltip.Content>
            </Tooltip>
          </div>
        </div>
      </div>

      {configureAssetsModalState.isOpen && (
        <ConfigureAssetsModal
          onClose={configureAssetsModalState.close}
          onOpenChange={configureAssetsModalState.close}
          inputAssets={inputAssets}
          outputAssets={outputAssets}
          assistantId={assistantId}
        />
      )}
      {exportAssetsModalState.isOpen && (
        <ExportAssetsModal
          onClose={exportAssetsModalState.close}
          onOpenChange={exportAssetsModalState.close}
        />
      )}
    </>
  );
}
