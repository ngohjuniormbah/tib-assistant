import { useLiveQuery } from 'dexie-react-hooks';

import { AssetId } from '@/config/assets';
import { db } from '@/db/db';

/**
 * Reads the content of multiple assets in a single live query. Use this instead
 * of calling `useIndexedDbStore` in a loop, which breaks the rules of hooks.
 * The returned contents are aligned with the order of `assetIds`.
 */
export default function useIndexedDbStores({
  assetIds,
}: {
  assetIds?: AssetId[];
}) {
  // the identity of `assetIds` changes on every render, so subscribe to the ids themselves
  const assetIdsKey = assetIds?.join(',') ?? '';

  return useLiveQuery(async () => {
    if (!assetIds) {
      return [];
    }
    return Promise.all(
      assetIds.map(async (assetId) => {
        const asset = await db.assets.where('assetId').equals(assetId).first();
        return asset?.value ?? [];
      })
    );
  }, [assetIdsKey]);
}
