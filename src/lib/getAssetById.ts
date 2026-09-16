import ASSETS, { Asset } from '@/config/assets';

function findNestedAsset(assets: Asset[], id: string): Asset | undefined {
  for (const asset of assets) {
    if (asset.id === id) {
      return asset;
    }
    if (asset.schema) {
      const found = findNestedAsset(asset.schema, id);
      if (found) return found;
    }
  }
  return undefined;
}
export default function getAssetById(assetId: string) {
  return findNestedAsset(ASSETS, assetId);
}
