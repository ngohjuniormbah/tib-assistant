'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ListBox, Popover, Select } from '@heroui/react';
import { RefObject, useEffect, useState } from 'react';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { AssetId } from '@/config/assets';
import getAssetById from '@/lib/getAssetById';

type AssetsSelectionPopoverProps = {
  outputAssets: AssetId[];
  containerRef: RefObject<HTMLElement | null>;
};

export default function AssetsSelectionPopover({
  outputAssets,
  containerRef,
}: AssetsSelectionPopoverProps) {
  const textAssets = outputAssets.filter(
    (id) => getAssetById(id)?.type === 'text'
  );

  const [selectedText, setSelectedText] = useState('');
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetId | null>(
    textAssets[0] ?? null
  );

  const { asset, update } = useIndexedDbStore({
    assetId: selectedAsset ?? undefined,
  });

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const range = selection.getRangeAt(0);
        const text = selection.toString().trim();

        if (!text || !containerRef.current) return;
        if (!containerRef.current.contains(range.commonAncestorContainer))
          return;

        const rect = range.getBoundingClientRect();
        setSelectedText(text);
        setAnchorRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }, 0);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef]);

  if (textAssets.length === 0) return null;

  const handleAdd = async () => {
    if (!selectedAsset || !selectedText) return;
    await update([...(asset ?? []), selectedText]);
    window.getSelection()?.removeAllRanges();
    setAnchorRect(null);
  };

  return (
    <Popover
      isOpen={!!anchorRect}
      onOpenChange={(open) => {
        if (!open) setAnchorRect(null);
      }}
    >
      <Popover.Trigger
        className="fixed pointer-events-none"
        style={{
          top: anchorRect?.top ?? 0,
          left: anchorRect?.left ?? 0,
          width: anchorRect?.width ?? 0,
          height: anchorRect?.height ?? 0,
        }}
      />
      <Popover.Content placement="top">
        <Popover.Arrow />
        <Popover.Dialog>
          <div className="p-2 min-w-[220px]">
            <p className="text-sm font-semibold mb-2">
              Add selection to assets
            </p>
            <div className="flex items-center gap-2">
              <Select
                className="flex-1"
                selectedKey={selectedAsset}
                onSelectionChange={(key) => setSelectedAsset(key as AssetId)}
                aria-label="Select asset"
              >
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {textAssets.map((id) => {
                      const a = getAssetById(id);
                      return (
                        <ListBox.Item
                          key={id}
                          id={id}
                          textValue={a?.name ?? id}
                        >
                          {a?.name ?? id}
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>
              </Select>
              <Button
                isIconOnly
                variant="primary"
                size="sm"
                onPress={handleAdd}
                className="rounded-full"
              >
                <FontAwesomeIcon icon={faPlus} />
              </Button>
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
