import { Checkbox, Tooltip } from '@heroui/react';

type Props = {
  isInputAsset: boolean;
  assetId: string;
  onToggleInput: (assetId: string, value: boolean) => void;
  isEnabled: boolean;
};

export default function AssetEndContent({
  isInputAsset,
  assetId,
  onToggleInput,
  isEnabled,
}: Props) {
  return (
    <Tooltip closeDelay={0} delay={0}>
      <Tooltip.Trigger>
        <Checkbox
          className="me-1"
          isDisabled={!isEnabled}
          isSelected={isInputAsset}
          onChange={(value) => {
            onToggleInput(assetId, value);
          }}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            Input
          </Checkbox.Content>
        </Checkbox>
      </Tooltip.Trigger>
      <Tooltip.Content>
        Support this asset to be an input chat message
      </Tooltip.Content>
    </Tooltip>
  );
}
