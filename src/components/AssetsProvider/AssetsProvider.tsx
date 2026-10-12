'use client';

import { ReactNode, useState } from 'react';

import AssetsContext, {
  AssetWithContent,
} from '@/components/AssetsProvider/assetsContext';

export default function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<AssetWithContent[]>([]);

  return (
    <AssetsContext.Provider value={{ assets, setAssets }}>
      {children}
    </AssetsContext.Provider>
  );
}
