import { createContext, SetStateAction } from 'react';

import { AssetId } from '@/config/assets';

export type AssetWithContent = {
  assetId: AssetId;
  content: string[];
};

const assetsContext = createContext<{
  assets: AssetWithContent[];
  setAssets: (items: SetStateAction<AssetWithContent[]>) => void;
}>({
  assets: [],
  setAssets: () => {},
});

export default assetsContext;
