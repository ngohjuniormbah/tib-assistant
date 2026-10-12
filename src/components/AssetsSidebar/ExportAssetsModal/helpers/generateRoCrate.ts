import JSZip from 'jszip';

import { AssetId } from '@/config/assets';
import { DbAsset } from '@/db/db';
import { cslToBibtex } from '@/lib/bibliographyUtils';
import {
  matrixToLatex,
  parseMarkdownTableToMatrix,
} from '@/lib/comparisonMatrixUtils';
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

const ASSET_TYPE_TO_ENCODING_FORMAT: Record<string, string> = {
  json: 'application/json',
  text: 'text/plain',
  object: 'application/json',
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
  reviewReport: [
    'http://purl.org/spar/doco/Section',
    'https://schema.org/Review',
  ],
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

  const authorName = (data.authorName as string) || 'Anonymous Researcher';
  const license = (data.license as LicenseType | 'other') || 'CC-BY';
  const otherLicense = (data.otherLicense as string) || 'Custom License';

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
  const zipFolder = zip.folder('research_project_export');
  if (!zipFolder) {
    console.error('Failed to create zip folder');
    return;
  }

  const roCrateAssets: Array<{
    '@id': string;
    '@type': string;
    name: string;
    encodingFormat: string;
    contentSize: number;
    additionalType?: Array<{ '@id': string }>;
  }> = [];
  const roCrateAssetLinks: Array<{ '@id': string }> = [];

  // Helper to lookup asset value
  const getAssetValue = (id: string): string[] => {
    return assetsDatabase?.find((a) => a.assetId === id)?.value ?? [];
  };

  // 1. Export Selected Raw Assets
  selectedAssets.forEach((assetId) => {
    const asset = assetsDatabase?.find((a) => a.assetId === assetId);
    if (asset) {
      const assetInfo = getAssetById(asset.assetId);
      if (assetInfo) {
        const extension = assetInfo.type === 'json' ? '.jsonl' : '.txt';
        const fileName = `assets/${asset.assetId}${extension}`;
        const fileContent = asset.value.join('\n') || '';
        zipFolder.file(fileName, fileContent);

        roCrateAssets.push({
          '@id': fileName,
          '@type': 'CreativeWork',
          name: assetInfo.name,
          encodingFormat:
            ASSET_TYPE_TO_ENCODING_FORMAT[assetInfo.type] || 'text/plain',
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

  // 2. Compile LaTeX Manuscript & refs.bib
  const titleVal = getAssetValue('paper.title');
  const abstractVal = getAssetValue('paper.abstract');
  const introVal = getAssetValue('paper.introduction');
  const relatedVal = getAssetValue('paper.relatedWork');
  const conclusionVal = getAssetValue('paper.conclusion');
  const bibVal = getAssetValue('bibliography');
  const matrixVal = getAssetValue('comparisonMatrix');

  const paperTitle =
    titleVal[0]?.replace(/^#+\s*/, '').trim() ||
    'Scientific Research Manuscript';
  const bibtexContent = cslToBibtex(bibVal);
  const latexTables = matrixVal
    .map((m, idx) =>
      matrixToLatex(parseMarkdownTableToMatrix(m, `Benchmark Table ${idx + 1}`))
    )
    .join('\n\n');

  const mainTexContent = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{booktabs}
\\usepackage{microtype}
\\usepackage{hyperref}
\\usepackage{cite}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{\\textbf{${paperTitle}}}
\\author{
  \\textbf{${authorName}} \\\\
  Leibniz Information Centre for Science and Technology (TIB)
}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${abstractVal.join('\n\n') || 'Abstract under preparation.'}
\\end{abstract}

\\section{Introduction}
${introVal.join('\n\n') || 'Introduction under preparation.'}

\\section{Related Work}
${relatedVal.join('\n\n') || 'Related work under preparation.'}

${latexTables ? `\\subsection{Benchmark Comparison}\\n${latexTables}\\n` : ''}

\\section{Conclusion}
${conclusionVal.join('\n\n') || 'Conclusion under preparation.'}

\\bibliographystyle{plain}
\\bibliography{refs}

\\end{document}`;

  zipFolder.file('manuscript/main.tex', mainTexContent);
  zipFolder.file('manuscript/refs.bib', bibtexContent);
  roCrateAssetLinks.push({ '@id': 'manuscript/main.tex' });
  roCrateAssetLinks.push({ '@id': 'manuscript/refs.bib' });

  // 3. Export ORKG Contribution Graph Payload (orkg-bundle.json)
  const orkgContributionBundle = {
    paper: {
      title: paperTitle,
      authors: [{ label: authorName }],
      publicationYear: new Date().getFullYear(),
      researchField: 'Computer Science',
      contributions: [
        {
          name: 'Core Contribution',
          values: {
            'Research Questions': getAssetValue('researchQuestions').map(
              (q) => ({ text: q })
            ),
            'Comparative Matrices': matrixVal.map((m) => ({ text: m })),
            'Synthesis Findings': conclusionVal.map((c) => ({ text: c })),
          },
        },
      ],
    },
    provenance: {
      generator: 'TIB AIssistant',
      version: '2.3.3',
      exportDate: new Date().toISOString(),
      license: licenseUrl,
    },
  };
  const orkgBundleString = JSON.stringify(orkgContributionBundle, null, 2);
  zipFolder.file('orkg/orkg-contribution-bundle.json', orkgBundleString);
  roCrateAssetLinks.push({ '@id': 'orkg/orkg-contribution-bundle.json' });

  // 4. Generate README.md Project Summary
  const readmeContent = `# ${paperTitle}

**Principal Investigator / Author:** ${authorName}  
**Platform:** TIB AIssistant (Leibniz Information Centre for Science and Technology)  
**Export Date:** ${new Date().toLocaleDateString()}  
**License:** ${license}  

---

## Included Artifacts:
- **\`manuscript/main.tex\`**: Complete LaTeX paper source code with integrated sections.
- **\`manuscript/refs.bib\`**: Formatted BibTeX bibliography.
- **\`orkg/orkg-contribution-bundle.json\`**: Contribution graph payload ready for import into the Open Research Knowledge Graph (ORKG).
- **\`assets/\`**: Individual raw research lifecycle assets (Ideation, Research Questions, Matrices, Reviews).
- **\`ro-crate-metadata.json\`**: Conforming W3C RO-Crate 1.1 provenance descriptor.
`;
  zipFolder.file('README.md', readmeContent);
  roCrateAssetLinks.push({ '@id': 'README.md' });

  // 5. Build Conforming RO-Crate 1.1 Metadata
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
        name: paperTitle,
        description:
          'Comprehensive scholarly research bundle exported from the TIB AIssistant research lifecycle platform, including LaTeX manuscript, ORKG contribution graph, and provenance metadata.',
        datePublished: new Date().toISOString(),
        license: licenseUrl,
        author: [
          {
            '@id': '#author',
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
        '@id': '#tib-aissistant',
        '@type': 'SoftwareApplication',
        name: 'TIB AIssistant',
        version: '2.3.3',
        url: 'https://github.com/ngohjuniormbah/tib-assistant',
        creator: {
          '@id': 'https://www.tib.eu/',
          '@type': 'Organization',
          name: 'Technische Informationsbibliothek (TIB)',
        },
      },
      licenseText,
      ...roCrateAssets,
    ],
  };

  zipFolder.file(
    'ro-crate-metadata.json',
    JSON.stringify(provenanceData, null, 2)
  );

  // Trigger browser download
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = `TIB_AIssistant_Project_Export.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onFinish();
}
