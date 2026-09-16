import EditableList from '@/components/EditableList/EditableList';
import ExpandableMessage from '@/components/ExpandableMessage/ExpandableMessage';
import getAssetById from '@/lib/getAssetById';
import { CustomUIDataTypes } from '@/types';

type Props = {
  data: CustomUIDataTypes['asset'];
};

export default function AssetsMessage({ data }: Props) {
  const asset = getAssetById(data.assetId);

  if (!asset) {
    return null;
  }

  return (
    <ExpandableMessage
      key={asset.id}
      title={asset.name}
      onDelete={() => {}}
      content={
        <div className="ps-2 my-3 flex flex-wrap items-center">
          <div className="font-semibold grow">Output</div>
          <EditableList
            items={data.content}
            handleChange={() => {}} // TODO: support edit
            theme="darker"
          />
        </div>
      }
    />
  );
}
