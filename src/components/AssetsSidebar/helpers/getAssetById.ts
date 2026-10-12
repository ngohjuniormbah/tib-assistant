import ASSETS, { Asset, AssetId } from '@/config/assets';

export function getAssetById(id: AssetId): Asset | undefined {
  const asset = ASSETS.find((asset) => asset.id === id);
  if (asset) {
    return asset;
  }
  for (const a of ASSETS) {
    if (a.schema) {
      const nestedAsset = a.schema.find((nested) => nested.id === id);
      if (nestedAsset) {
        return nestedAsset;
      }
    }
  }
  return undefined;
}
