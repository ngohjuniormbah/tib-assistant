import { useLiveQuery } from 'dexie-react-hooks';

import { AssetId } from '@/config/assets';
import { db } from '@/db/db';

export default function useIndexedDbStore({ assetId }: { assetId?: AssetId }) {
  const asset = useLiveQuery(async () => {
    if (!assetId) {
      return [];
    }
    const assets = await db.assets.where('assetId').equals(assetId).first();
    return assets?.value ?? [];
  }, [assetId]);

  // Not the most ideal way to manage assets, instead we could use separate operations (create, update, delete, etc.)
  // but this means managing the data is harder, also we need to manage to order when sorting is used. For now
  // store the entre JSON array of assets in the store is easiest
  const update = async (value: string[]) => {
    return db.transaction('rw', db.assets, async () => {
      if (!assetId) {
        return;
      }
      const asset = await db.assets.where('assetId').equals(assetId).first();
      if (asset) {
        await db.assets.update(asset.id, { value });
      } else {
        await db.assets.add({ assetId, value });
      }
    });
  };

  return { asset, update };
}
