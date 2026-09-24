import EditableList from '@/components/EditableList/EditableList';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { Asset } from '@/config/assets';

type Props = {
  asset: Asset;
};

export default function SubAssetsItem({ asset }: Props) {
  const { asset: assetStore, update } = useIndexedDbStore({
    assetId: asset.id,
  });

  return (
    <div className="w-full flex flex-wrap mt-2 items-center" key={asset.id}>
      <div className="grow font-semibold">{asset.name}</div>
      <EditableList
        items={assetStore ?? []}
        handleChange={(items) => update(items as string[])}
      />
    </div>
  );
}
