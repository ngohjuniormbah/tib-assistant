import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, useOverlayState } from '@heroui/react';
import { IData } from 'csl-json';
import { useState } from 'react';

import JsonModal from '@/components/AssetsSidebar/Editor/JsonModal/JsonModal';
import ExpandableItem from '@/components/AssetsSidebar/ExpandableItem/ExpandableItem';
import EditableList from '@/components/EditableList/EditableList';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import getAssetById from '@/lib/getAssetById';

type Props = {
  enableInput?: boolean;
};

function paperToCitation(paper: IData) {
  const authors = paper?.author?.length
    ? paper.author.length > 2
      ? (paper.author[0].family ?? paper.author[0].literal) + ' et al.'
      : paper.author.map((author) => author.family ?? author.literal).join(', ')
    : 'No authors';

  const year = paper?.issued?.['date-parts']?.[0]?.[0] ?? 'n.d.';

  return `${authors} (${year})`;
}

export default function BibliographyAsset({ enableInput = false }: Props) {
  const [editingItem, setEditingItem] = useState<IData | null>(null);

  const { asset: bibliography, update } = useIndexedDbStore({
    assetId: 'bibliography',
  });

  const jsonModalState = useOverlayState();

  const bibliographyAsset = getAssetById('bibliography');

  if (!bibliographyAsset) {
    return null;
  }

  return (
    <ExpandableItem
      asset={bibliographyAsset}
      itemCount={bibliography?.length ?? 0}
      enableInput={enableInput}
      assetContent={bibliography}
    >
      <EditableList
        items={bibliography ?? []}
        handleChange={(items) => {
          update(items);
        }}
        noItemsMessage={
          <Alert>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>No bibliography items yet</Alert.Description>
            </Alert.Content>
          </Alert>
        }
        type="json"
        itemComponent={({ item, isEditing }) => (
          <div className="flex justify-between items-center w-full">
            <div className="text-sm py-1 px-2">
              {paperToCitation(JSON.parse(item as string))}
            </div>
            {isEditing && (
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={() => {
                  jsonModalState.open();
                  setEditingItem(JSON.parse(item as string));
                }}
                aria-label="Edit bibliography item"
              >
                <FontAwesomeIcon
                  icon={faPen}
                  className="text-muted"
                  size="lg"
                />
              </Button>
            )}
          </div>
        )}
      />
      {jsonModalState.isOpen && (
        <JsonModal
          onOpenChange={jsonModalState.close}
          onClose={jsonModalState.close}
          json={editingItem}
          onSave={(json) => {
            if (editingItem) {
              update(
                bibliography?.map((item) =>
                  JSON.parse(item).id === editingItem.id
                    ? JSON.stringify(json as IData)
                    : item
                ) ?? []
              );
            }
          }}
        />
      )}
    </ExpandableItem>
  );
}
