'use client';

import {
  faArrowUpRightFromSquare,
  faFileCode,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { Base64 } from 'js-base64';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import {
  matrixToLatex,
  parseMarkdownTableToMatrix,
} from '@/lib/comparisonMatrixUtils';

function generateBibtexKey(
  item: Record<string, unknown>,
  index: number
): string {
  if (item.id && typeof item.id === 'string') {
    return item.id.replace(/[^a-zA-Z0-9_-]/g, '');
  }
  const firstAuthor =
    Array.isArray(item.author) && item.author[0]
      ? (
          item.author[0].family ||
          item.author[0].literal ||
          'author'
        ).toLowerCase()
      : 'author';
  const cleanAuthor = String(firstAuthor).replace(/[^a-zA-Z]/g, '');
  return `${cleanAuthor}${index + 1}`;
}

function formatBibtexAuthors(authors: unknown): string {
  if (!Array.isArray(authors) || authors.length === 0) {
    return 'Unknown Author';
  }
  return authors
    .map((author) => {
      if (typeof author === 'string') return author;
      if (author && typeof author === 'object') {
        const a = author as {
          family?: string;
          given?: string;
          literal?: string;
        };
        if (a.family && a.given) return `${a.family}, ${a.given}`;
        if (a.family) return a.family;
        if (a.literal) return a.literal;
      }
      return 'Author';
    })
    .join(' and ');
}

export default function OverleafButton() {
  const { asset: bibliography } = useIndexedDbStore({
    assetId: 'bibliography',
  });

  const { asset: comparisonMatrix } = useIndexedDbStore({
    assetId: 'comparisonMatrix',
  });

  const { asset: paperTitle } = useIndexedDbStore({
    assetId: 'paper.title',
  });

  const { asset: abstract } = useIndexedDbStore({
    assetId: 'paper.abstract',
  });

  const { asset: introduction } = useIndexedDbStore({
    assetId: 'paper.introduction',
  });

  const { asset: relatedWork } = useIndexedDbStore({
    assetId: 'paper.relatedWork',
  });

  const { asset: conclusion } = useIndexedDbStore({
    assetId: 'paper.conclusion',
  });

  // 1. Build BibTeX file content
  const bibtexEntries =
    bibliography
      ?.map((rawItem, index) => {
        try {
          const item = JSON.parse(rawItem) as Record<string, unknown>;
          const key = generateBibtexKey(item, index);
          const title = (item.title as string) || 'Untitled';
          const authorStr = formatBibtexAuthors(item.author);
          const year =
            item.issued &&
            typeof item.issued === 'object' &&
            'date-parts' in item.issued &&
            Array.isArray(
              (item.issued as { 'date-parts': number[][] })['date-parts']?.[0]
            )
              ? (item.issued as { 'date-parts': number[][] })[
                  'date-parts'
                ][0][0]
              : '2024';
          const doi = item.DOI ? `,\n  doi = {${item.DOI}}` : '';

          return `@article{${key},
  title = {${title}},
  author = {${authorStr}},
  year = {${year}}${doi}
}`;
        } catch {
          return '';
        }
      })
      .filter(Boolean)
      .join('\n\n') ?? '';

  // 2. Render LaTeX benchmark tables from comparisonMatrix
  const latexTables =
    comparisonMatrix && comparisonMatrix.length > 0
      ? comparisonMatrix
          .map((rawMatrix, index) => {
            const matrix = parseMarkdownTableToMatrix(
              rawMatrix,
              `Benchmark Matrix ${index + 1}`
            );
            return matrixToLatex(matrix);
          })
          .join('\n\n')
      : '';

  // 3. Assemble full publication-grade LaTeX manuscript
  const formattedTitle =
    paperTitle && paperTitle.length > 0
      ? paperTitle[0].replace(/^#+\s*/, '').trim()
      : 'Scientific Manuscript Draft';

  const formattedAbstract =
    abstract && abstract.length > 0
      ? abstract.join('\n\n')
      : 'Abstract draft in progress.';

  const formattedIntro =
    introduction && introduction.length > 0
      ? introduction.join('\n\n')
      : 'Introduction section under preparation.';

  const formattedRelatedWork =
    relatedWork && relatedWork.length > 0
      ? relatedWork.join('\n\n')
      : 'Related work section under preparation.';

  const formattedConclusion =
    conclusion && conclusion.length > 0
      ? conclusion.join('\n\n')
      : 'Conclusion and future work section under preparation.';

  const latexDocument = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{booktabs}
\\usepackage{microtype}
\\usepackage{hyperref}
\\usepackage{cite}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{\\textbf{${formattedTitle}}}
\\author{
  \\textbf{TIB AIssistant Researcher} \\\\
  Leibniz Information Centre for Science and Technology (TIB) \\\\
  \\texttt{researcher@example.org}
}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${formattedAbstract}
\\end{abstract}

\\section{Introduction}
${formattedIntro}

\\section{Related Work}
${formattedRelatedWork}

${latexTables ? `\\subsection{Comparative Benchmarks}\n${latexTables}\n` : ''}

\\section{Conclusion and Future Work}
${formattedConclusion}

\\bibliographystyle{plain}
\\bibliography{refs}

\\end{document}`;

  return (
    <div className="w-full flex justify-center py-2">
      <form
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
        className="w-full text-center"
      >
        <input
          type="text"
          name="snip_uri"
          readOnly
          className="hidden"
          value={`data:application/x-tex;base64,${Base64.encode(latexDocument)}`}
        />
        <input
          type="text"
          name="snip_uri"
          readOnly
          className="hidden"
          value={`data:application/x-bibtex;base64,${Base64.encode(bibtexEntries)}`}
        />
        <input
          type="text"
          name="snip_name"
          value="main.tex"
          readOnly
          className="hidden"
        />
        <input
          type="text"
          name="snip_name"
          value="refs.bib"
          readOnly
          className="hidden"
        />
        <Button
          type="submit"
          className="bg-overleaf text-white font-medium gap-2 w-full sm:w-auto"
        >
          <FontAwesomeIcon icon={faFileCode} />
          <span>Open Full Manuscript in Overleaf</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} size="xs" />
        </Button>
      </form>
    </div>
  );
}
