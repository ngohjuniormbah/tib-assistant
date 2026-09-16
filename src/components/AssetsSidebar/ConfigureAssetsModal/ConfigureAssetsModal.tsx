import { faRotateRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Modal, Tooltip } from '@heroui/react';
import { isEqual } from 'lodash';
import { Dispatch, SetStateAction, useState } from 'react';

import AssetEndContent from '@/components/AssetsSidebar/ConfigureAssetsModal/AssetEndContent/AssetEndContent';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import SortableSwitchList from '@/components/SortableSwitchList/SortableSwitchList';
import ASSETS, { AssetId } from '@/config/assets';

type Props = {
  onOpenChange: () => void;
  onClose: () => void;
  inputAssets: string[];
  outputAssets: string[];
  assistantId: string;
};

type EnabledItem = {
  id: string;
  isInputAsset?: boolean;
};

export default function ConfigureAssetsModal({
  onOpenChange,
  onClose,
  inputAssets,
  outputAssets,
  assistantId,
}: Props) {
  const {
    enabledAssets: enabledAssetsLocalStorage,
    setEnabledAssets: setEnabledAssetsLocalStorage,
  } = useStore();

  const defaultEnabledItems: EnabledItem[] = [
    ...inputAssets.map((id) => ({ id, isInputAsset: true })),
    ...outputAssets.map((id) => ({ id, isInputAsset: false })),
  ];

  const [enabledItems, setEnabledItems] = useState<EnabledItem[]>(() => {
    const storedAssets = enabledAssetsLocalStorage?.[assistantId];
    if (storedAssets?.inputAssets && storedAssets?.outputAssets) {
      return [
        ...storedAssets.inputAssets.map((id) => ({ id, isInputAsset: true })),
        ...storedAssets.outputAssets.map((id) => ({ id, isInputAsset: false })),
      ];
    }
    return defaultEnabledItems;
  });

  const handleSave = () => {
    setEnabledAssetsLocalStorage((prev) => ({
      ...prev,
      [assistantId]: {
        inputAssets:
          enabledItems
            ?.filter((item) => item.isInputAsset)
            .map(({ id }) => id as AssetId) ?? [],
        outputAssets:
          enabledItems
            ?.filter((item) => !item.isInputAsset)
            .map(({ id }) => id as AssetId) ?? [],
      },
    }));
    onClose();
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center">
                Assets library
                <Tooltip delay={0}>
                  <Tooltip.Trigger>
                    <Button
                      size="sm"
                      className="min-w-10 ms-2"
                      onPress={() => setEnabledItems(defaultEnabledItems)}
                      isDisabled={isEqual(defaultEnabledItems, enabledItems)}
                      variant="tertiary"
                    >
                      <FontAwesomeIcon icon={faRotateRight} />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Reset assets to default selection
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <SortableSwitchList
              items={ASSETS.map((asset) => ({
                id: asset.id,
                label: asset.name,
              }))}
              enabledItems={enabledItems}
              setEnabledItems={
                setEnabledItems as Dispatch<
                  SetStateAction<{ id: string; config?: object }[] | null>
                >
              }
              labelComponent={(item) => (
                <>
                  {ASSETS.find(({ id }) => id === item.id)?.name}{' '}
                  <Chip>{ASSETS.find(({ id }) => id === item.id)?.type}</Chip>
                </>
              )}
              endContentComponent={(item) => (
                <AssetEndContent
                  isInputAsset={
                    !!enabledItems?.find(({ id }) => id === item.id)
                      ?.isInputAsset
                  }
                  assetId={item.id}
                  isEnabled={item.isEnabled}
                  onToggleInput={(id, value) =>
                    setEnabledItems(
                      (prev) =>
                        prev?.map((asset) =>
                          asset.id === id
                            ? { ...asset, isInputAsset: value }
                            : asset
                        ) ?? []
                    )
                  }
                />
              )}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onPress={handleSave}>
              Save
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
