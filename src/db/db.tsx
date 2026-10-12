import Dexie, { type EntityTable } from 'dexie';

import { AssetId } from '@/config/assets';

export type DbAsset = {
  id: number;
  assetId: AssetId;
  value: string[];
};

const db = new Dexie('TibAissistant') as Dexie & {
  assets: EntityTable<DbAsset, 'id'>;
};

db.version(1).stores({
  assets: '++id, assetId, value', // primary key id
});

export { db };
