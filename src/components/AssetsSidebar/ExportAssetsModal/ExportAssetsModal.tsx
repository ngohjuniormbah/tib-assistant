import {
  Alert,
  Button,
  Description,
  Form,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextField,
} from '@heroui/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { FormEvent, useState } from 'react';

import generateRoCrate from '@/components/AssetsSidebar/ExportAssetsModal/helpers/generateRoCrate';
import ASSETS from '@/config/assets';
import { db } from '@/db/db';
import getAssetById from '@/lib/getAssetById';

type Props = {
  onOpenChange: () => void;
  onClose: () => void;
};

export default function ExportAssetsModal({ onOpenChange, onClose }: Props) {
  const [license, setLicense] = useState('CC0');

  const assetsDatabase = useLiveQuery(async () => {
    const _assets = await db.assets.toArray();
    return _assets;
  }, [ASSETS]);

  const assets = assetsDatabase
    ? assetsDatabase.map((asset) => getAssetById(asset.assetId))
    : [];

  const handleExport = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    generateRoCrate({
      assetsDatabase,
      formData: new FormData(e.currentTarget),
      onFinish: () => {
        onClose();
      },
    });
  };

  return (
    <Modal.Backdrop isOpen onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center">Export assets</div>
            </Modal.Heading>
          </Modal.Header>
          <Form className="max-w-full" onSubmit={handleExport}>
            <Modal.Body className="w-full gap-3 flex flex-col">
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Experimental feature</Alert.Title>
                  <Alert.Description>
                    This feature aims to increase the transparency of AI usage
                    in scholarly research. It is at an early stage and will be
                    improved in the future.
                  </Alert.Description>
                </Alert.Content>
              </Alert>
              <Select selectionMode="multiple" name="selectedAssets" isRequired>
                <Label>Asset to export</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox selectionMode="multiple">
                    {assets
                      ? assets.map((asset) => (
                          <ListBox.Item
                            key={asset?.id}
                            id={asset?.id}
                            textValue={asset?.name}
                          >
                            {asset?.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))
                      : null}
                  </ListBox>
                </Select.Popover>
              </Select>
              <TextField name="authorName" isRequired>
                <Label>Author name</Label>
                <Input type="text" />
                <Description>
                  The author name is added as creator in the provenance data
                </Description>
              </TextField>
              <Select
                isRequired
                name="license"
                selectedKey={license}
                onSelectionChange={(key) => setLicense(key as string)}
              >
                <Label>License</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Description>
                  The license added in the provenance data for the exported
                  assets
                </Description>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="CC0" textValue="CC0">
                      CC0
                    </ListBox.Item>
                    <ListBox.Item id="CC-BY" textValue="CC-BY">
                      CC-BY
                    </ListBox.Item>
                    <ListBox.Item id="CC-BY-SA" textValue="CC-BY-SA">
                      CC-BY-SA
                    </ListBox.Item>
                    <ListBox.Item id="MIT" textValue="MIT">
                      MIT
                    </ListBox.Item>
                    <ListBox.Item id="other" textValue="Other...">
                      Other...
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
              {license === 'other' && (
                <TextField name="otherLicense">
                  <Label>License</Label>
                  <Input type="text" />
                </TextField>
              )}
            </Modal.Body>
            <Modal.Footer className="flex w-full justify-end">
              <Button type="submit" variant="primary">
                Export
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
