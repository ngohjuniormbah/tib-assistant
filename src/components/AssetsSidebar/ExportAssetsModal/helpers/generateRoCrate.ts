import JSZip from 'jszip';

import { AssetId } from '@/config/assets';
import { DbAsset } from '@/db/db';
import getAssetById from '@/lib/getAssetById';

type LicenseType = keyof typeof LICENSE_JSON;

const LICENSE_JSON = {
  CC0: {
    '@id': 'https://creativecommons.org/publicdomain/zero/1.0/',
    '@type': 'CreativeWork',
    description: 'CC0 No Rights Reserved',
    identifier: 'https://creativecommons.org/publicdomain/zero/1.0/',
    name: 'CC0 1.0 Universal',
  },
  'CC-BY': {
    '@id': 'https://creativecommons.org/licenses/by/4.0/',
    '@type': 'CreativeWork',
    description: 'Attribution 4.0 International',
    identifier: 'https://creativecommons.org/licenses/by/4.0/',
    name: 'CC BY 4.0',
  },
  'CC-BY-SA': {
    '@id': 'https://creativecommons.org/licenses/by-sa/4.0/',
    '@type': 'CreativeWork',
    description: 'Attribution-ShareAlike 4.0 International',
    identifier: 'https://creativecommons.org/licenses/by-sa/4.0/',
    name: 'CC BY-SA 4.0',
  },
  MIT: {
    '@id': 'https://opensource.org/license/mit/',
    '@type': 'CreativeWork',
    description: 'MIT License',
    identifier: 'https://opensource.org/license/mit/',
    name: 'MIT License',
  },
};

const ASSET_TYPE_TO_ENCODING_FORMAT = {
  json: 'application/json',
  text: 'text/plain',
  object: 'unknown',
};

const ASSET_TO_DEO_TYPE: Record<AssetId, string[]> = {
  'paper.title': ['http://purl.org/spar/doco/Title'],
  'paper.relatedWork': [
    'http://purl.org/spar/doco/Section',
    'http://purl.org/spar/deo/RelatedWork',
  ],
  bibliography: ['http://purl.org/spar/doco/Bibliography'],
  researchQuestions: ['https://schema.org/Question'],
  ideationTopics: ['https://schema.org/about'],
  comparisonMatrix: ['http://purl.org/spar/doco/Table'],
  'paper.introduction': ['http://purl.org/spar/doco/Introduction'],
  'paper.abstract': ['http://purl.org/spar/doco/Abstract'],
  'paper.conclusion': ['http://purl.org/spar/doco/Conclusion'],
  paper: [],
};

export default async function generateRoCrate({
  assetsDatabase,
  formData,
  onFinish,
}: {
  assetsDatabase: DbAsset[] | undefined;
  formData: FormData;
  onFinish: () => void;
}) {
  const data = Object.fromEntries(formData);
  const selectedAssets = formData.getAll('selectedAssets');

  const authorName = data.authorName as string;
  const license = data.license as LicenseType | 'other';
  const otherLicense = data.otherLicense as string;

  const licenseText =
    license === 'other'
      ? {
          '@id': 'license',
          '@type': 'CreativeWork',
          name: otherLicense,
        }
      : LICENSE_JSON[license];

  const licenseUrl =
    license === 'other' ? 'license' : LICENSE_JSON[license]?.['@id'];

  const zip = new JSZip();
  const zipFolder = zip.folder('assets_export');
  if (!zipFolder) {
    console.error('Failed to create zip folder');
    return;
  }
  const roCrateAssets: {
    '@id': string;
    '@type': string;
    name: string;
    encodingFormat: string;
    contentSize: number;
    additionalType?: { '@id': string }[];
  }[] = [];
  const roCrateAssetLinks: { '@id': string }[] = [];

  selectedAssets.forEach((assetId) => {
    const asset = assetsDatabase?.find((a) => a.assetId === assetId);
    if (asset) {
      const assetInfo = getAssetById(asset.assetId);
      if (assetInfo) {
        const extension = assetInfo.type === 'json' ? '.jsonl' : '.txt';
        const fileName = asset.assetId + extension;
        const fileContent = asset.value.join('\n') || '';
        zipFolder.file(fileName, fileContent);

        roCrateAssets.push({
          '@id': fileName,
          '@type': 'CreativeWork',
          name: assetInfo.name,
          encodingFormat: ASSET_TYPE_TO_ENCODING_FORMAT[assetInfo.type],
          contentSize: new Blob([fileContent]).size,
          additionalType:
            ASSET_TO_DEO_TYPE[asset.assetId]?.map((type: string) => ({
              '@id': type,
            })) || [],
        });
        roCrateAssetLinks.push({
          '@id': fileName,
        });
      }
    }
  });

  const provenanceData = {
    '@context': 'https://w3id.org/ro/crate/1.1/context',
    '@graph': [
      {
        '@id': 'ro-crate-metadata.json',
        '@type': 'CreativeWork',
        conformsTo: { '@id': 'https://w3id.org/ro/crate/1.1' },
        about: { '@id': './' },
      },
      {
        '@id': './',
        '@type': 'Dataset',
        name: 'Exported assets from the TIB AIssistant for a research project',
        description:
          'This RO-Crate contains assets exported from the TIB AIssistant. Normally, individual assets are used as building blocks for research projects and eventually used in publications.',
        datePublished: new Date().toISOString(),
        license: licenseUrl,
        author: [
          {
            '@id': '#author',
          },
          {
            '@id': '#chatgpt',
          },
        ],
        hasPart: roCrateAssetLinks,
      },
      {
        '@id': '#author',
        '@type': 'Person',
        name: authorName,
      },
      {
        '@id': '#chatgpt',
        '@type': 'SoftwareApplication',
        name: 'ChatGPT',
        version: '4.0',
        url: 'https://openai.com/chatgpt',
        description:
          'ChatGPT, an AI language model developed by OpenAI, used for generating or assisting with asset creation.',
        creator: { '@id': 'https://openai.com/' },
      },
      {
        '@id': 'https://openai.com/',
        '@type': 'Organization',
        name: 'OpenAI',
        url: 'https://openai.com',
      },
      licenseText,
      ...roCrateAssets,
    ],
  };

  zipFolder.file('ro-crate-metadata.json', JSON.stringify(provenanceData));

  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `exported_assets.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onFinish();
}
