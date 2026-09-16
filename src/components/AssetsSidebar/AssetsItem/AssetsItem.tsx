import { Alert } from '@heroui/react';
import { useEffect, useState } from 'react';

import OverleafButton from '@/components/AssetsSidebar/AssetsItem/OverleafButton/OverleafButton';
import SubAssetsItem from '@/components/AssetsSidebar/AssetsItem/SubAssetsItem/SubAssetsItem';
import BibliographyAsset from '@/components/AssetsSidebar/BibliographyAsset/BibliographyAsset';
import ExpandableItem from '@/components/AssetsSidebar/ExpandableItem/ExpandableItem';
import EditableList from '@/components/EditableList/EditableList';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { AssetId } from '@/config/assets';
import { db } from '@/db/db';
import getAssetById from '@/lib/getAssetById';

type Props = {
  asset: {
    id: AssetId;
    isInputAsset?: boolean;
  };
};
export default function AssetsItem({ asset }: Props) {
  const [assetContent, setAssetContent] = useState<string[]>([]);

  const _asset = getAssetById(asset.id);

  const { asset: assetStore, update } = useIndexedDbStore({
    assetId: asset.id,
  });

  useEffect(() => {
    if (!_asset) {
      return;
    }
    const getAllContent = async () => {
      const assetArrays = await Promise.all(
        _asset.schema?.map((asset) =>
          db.assets.where('assetId').equals(asset.id).toArray()
        ) ?? []
      );
      const flattenedAssets = assetArrays.flat();
      const assetStrings = flattenedAssets.map(
        (item) =>
          `${getAssetById(item.assetId)?.name ?? item.assetId}: ${item.value}`
      );
      setAssetContent(assetStrings);
    };
    if (_asset.type === 'object') {
      getAllContent();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAssetContent(assetStore ?? []);
    }
  }, [_asset, assetStore]);

  if (!_asset) {
    return null;
  }

  if (_asset?.id === 'bibliography') {
    return (
      <BibliographyAsset enableInput={asset.isInputAsset} key={asset.id} />
    );
  }
  return (
    <ExpandableItem
      key={asset.id}
      asset={_asset}
      itemCount={
        _asset.type !== 'object' ? (assetStore?.length ?? 0) : undefined
      }
      assetContent={assetContent}
      enableInput={asset.isInputAsset}
    >
      {_asset.type === 'text' && (
        <EditableList
          items={assetStore ?? []}
          handleChange={(items) => update(items as string[])}
          noItemsMessage={
            <Alert>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>No items</Alert.Description>
              </Alert.Content>
            </Alert>
          }
        />
      )}
      {_asset.type === 'object' && (
        <>
          <div className="w-full" />
          <div className="space-y-1 w-full mt-12">
            {_asset.schema?.map((subAsset) => (
              <SubAssetsItem asset={subAsset} key={subAsset.id} />
            ))}
          </div>
          {/* hardcoded for now, could be a appendContent prop in the future for assets, if needed */}
          {_asset.id === 'paper' && <OverleafButton />}
        </>
      )}
    </ExpandableItem>
  );
}
