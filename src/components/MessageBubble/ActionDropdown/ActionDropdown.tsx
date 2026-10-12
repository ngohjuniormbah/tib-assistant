import { faEllipsisV, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Label, ListBox, Select } from '@heroui/react';
import { Dispatch, SetStateAction, useState } from 'react';

import { AssetId } from '@/config/assets';
import getAssetById from '@/lib/getAssetById';

type Props = {
  onEdit?: () => void;
  onDelete?: () => void;
  outputAssets?: AssetId[];
  selectedOutputAsset?: string | null;
  setSelectedOutputAsset?: Dispatch<SetStateAction<AssetId | null>>;
};

export default function ActionDropdown({
  onEdit,
  onDelete,
  outputAssets,
  selectedOutputAsset,
  setSelectedOutputAsset = () => {},
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Dropdown onOpenChange={(_isOpen) => setIsOpen(_isOpen)}>
        {/*
          The Button itself is the trigger: MenuTrigger passes its props via
          context, and wrapping it in Dropdown.Trigger would nest two <button>s.
        */}
        <Button
          isIconOnly
          aria-label="Message actions"
          variant="tertiary"
          className={`${
            !isOpen ? 'opacity-0 invisible' : ''
          } me-2 group-hover:opacity-100 group-hover:visible`}
          size="sm"
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </Button>
        <Dropdown.Popover>
          {/*
            The Select sits beside the menu rather than inside it. v2 relied on
            `closeOnSelect={false}` to keep the dropdown open while the Select was
            in use; React Aria has no such prop, and a Select nested in a menu item
            would dismiss the menu on press.
          */}
          {outputAssets && outputAssets?.length > 0 ? (
            <div className="p-2">
              <Select
                className="min-w-48"
                selectedKey={selectedOutputAsset ?? null}
                onSelectionChange={(key) => {
                  setSelectedOutputAsset(key as AssetId | null);
                }}
              >
                <Label>Output asset</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {outputAssets.map((asset) => {
                      const _asset = getAssetById(asset);
                      return (
                        <ListBox.Item
                          key={_asset?.id}
                          id={_asset?.id}
                          textValue={_asset?.name}
                        >
                          {_asset?.name}
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          ) : null}
          <Dropdown.Menu aria-label="Static Actions">
            {onEdit ? (
              <Dropdown.Item id="edit" textValue="Edit" onPress={onEdit}>
                <FontAwesomeIcon icon={faPen} className="text-muted" />
                <Label>Edit</Label>
              </Dropdown.Item>
            ) : null}
            {onDelete ? (
              <Dropdown.Item id="delete" textValue="Delete" onPress={onDelete}>
                <FontAwesomeIcon icon={faTrash} className="text-muted" />
                <Label>Delete</Label>
              </Dropdown.Item>
            ) : null}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
