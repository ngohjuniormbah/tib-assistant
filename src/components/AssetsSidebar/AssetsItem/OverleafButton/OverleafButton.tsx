'use client';

import {
  faArrowUpRightFromSquare,
  faFileCode,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { Base64 } from 'js-base64';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { cslToBibtex } from '@/lib/bibliographyUtils';
import {
  matrixToLatex,
  parseMarkdownTableToMatrix,
} from '@/lib/comparisonMatrixUtils';

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

  const bibtexEntries = cslToBibtex(bibliography ?? []);

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
