import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { Base64 } from 'js-base64';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';

export default function OverleafButton() {
  const { asset: bibliography } = useIndexedDbStore({
    assetId: 'bibliography',
  });

  const { asset: abstract } = useIndexedDbStore({
    assetId: 'paper.abstract',
  });

  const { asset: introduction } = useIndexedDbStore({
    assetId: 'paper.introduction',
  });

  const { asset: paperTitle } = useIndexedDbStore({
    assetId: 'paper.title',
  });

  const { asset: relatedWork } = useIndexedDbStore({
    assetId: 'paper.relatedWork',
  });
  const { asset: conclusion } = useIndexedDbStore({
    assetId: 'paper.conclusion',
  });

  return (
    <div className="w-full flex justify-center">
      <form
        action="https://www.overleaf.com/docs"
        method="post"
        target="_blank"
      >
        <input
          type="text"
          name="snip_uri"
          readOnly
          className="hidden"
          value={`data:application/x-tex;base64,${Base64.encode(
            `\\documentclass[12pt]{article}
\\title{${
              paperTitle && paperTitle?.length > 0
                ? paperTitle.join(' ')
                : 'Untitled'
            }}
\\begin{document}
\\maketitle
\\begin{abstract}
${abstract ? abstract.join('\n') : 'No abstract'}
\\end{abstract}

\\section{Introduction}
${introduction ? introduction.join('\n') : 'No introduction'}
\\section{Related Work}
${relatedWork ? relatedWork.join('\n') : 'No related work'}
\\section{Conclusion}
${conclusion ? conclusion.join('\n') : 'No conclusion'}

\\bibliographystyle{plain}
\\bibliography{refs}
\\end{document}`
          )}`}
        />
        <input
          type="text"
          name="snip_uri"
          readOnly
          className="hidden"
          value={`data:application/x-tex;base64,${Base64.encode(
            bibliography
              ?.map((item) => {
                const itemParsed = JSON.parse(item);
                return `@article{test,
  title={${itemParsed.title ?? ''}},
  author={${itemParsed.author?.join(', ')}},
  }`;
              })
              .join('\n') ?? ''
          )}`}
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
        <div className="text-center mt-3">
          <Button type="submit" className="bg-overleaf text-white">
            Open in Overleaf <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </Button>
        </div>
      </form>
    </div>
  );
}
