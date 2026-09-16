import { ToggleButton } from '@heroui/react';
import { TextUIPart } from 'ai';
import { Children, isValidElement, ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import { AssetId } from '@/config/assets';
import {
  createBibliographyItemFromCitation,
  isItemInBibliography,
  normalizeCitationId,
} from '@/lib/bibliographyUtils';
import { getItemById } from '@/services/orkgAsk';
import { getPaperById } from '@/services/semanticScholar';

function extractTextFromChildren(children: ReactNode): string {
  let text = '';

  Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      text += child;
    } else if (
      isValidElement(child) &&
      (child.props as { children?: ReactNode })?.children
    ) {
      text += extractTextFromChildren(
        (child.props as { children?: ReactNode }).children
      );
    }
  });
  return text;
}

type Props = {
  part: TextUIPart;
  selectedOutputAsset?: AssetId;
};

export default function AssistantMessage({ part, selectedOutputAsset }: Props) {
  const { asset, update } = useIndexedDbStore({
    assetId: selectedOutputAsset,
  });
  const { asset: bibliography, update: updateBibliography } = useIndexedDbStore(
    {
      assetId: 'bibliography',
    }
  );

  const handleToggleCitation = async (id: string) => {
    const current = bibliography ?? [];
    const isInBibliography = isItemInBibliography(current, id);

    if (isInBibliography) {
      const parsed = current.map((i) => JSON.parse(i));
      const filtered = parsed.filter((item) => item.id !== id);
      await updateBibliography(filtered.map((i) => JSON.stringify(i)));
      return;
    }

    try {
      let bib;

      if (id.startsWith('orkg-ask-') || id.startsWith('orkgAsk-')) {
        const orkgItemId = id.replace('orkg-ask-', '').replace('orkgAsk-', '');
        const itemData = await getItemById(orkgItemId);

        if (!itemData) {
          console.error('Failed to fetch ORKG paper data for ID:', orkgItemId);
          return;
        }

        bib = createBibliographyItemFromCitation(id, {
          title: itemData.title,
          authors: itemData.authors || undefined,
          abstract: itemData.abstract || undefined,
          doi: itemData.doi || undefined,
          year: itemData.date_published
            ? new Date(itemData.date_published).getFullYear().toString()
            : undefined,
        });
      } else if (
        id.startsWith('semantic-scholar-') ||
        id.startsWith('semanticScholar-')
      ) {
        const semanticPaperId = id
          .replace('semantic-scholar-', '')
          .replace('semanticScholar-', '');
        const paperData = await getPaperById(semanticPaperId);

        if (!paperData) {
          console.error(
            'Failed to fetch Semantic Scholar paper data for ID:',
            semanticPaperId
          );
          return;
        }

        bib = createBibliographyItemFromCitation(id, {
          title: paperData.title,
          authors: paperData.authors?.map((author) => author.name) || undefined,
          abstract: paperData.abstract || undefined,
          doi: paperData.doi || undefined,
          year: paperData.year?.toString() || undefined,
        });
      } else {
        console.error('Unknown citation type for ID:', id);
        return;
      }

      const parsed = current.map((i) => JSON.parse(i));
      await updateBibliography([
        ...parsed.map((i) => JSON.stringify(i)),
        JSON.stringify(bib),
      ]);
    } catch (error) {
      console.error('Error fetching paper data:', error);
    }
  };

  const handleChangeTopics = ({ label }: { label: string }) => {
    update(
      asset?.includes(label)
        ? asset.filter((asset) => asset !== label)
        : [...(asset ?? []), label]
    );
  };

  return (
    <div className="my-2 relative w-full [&_.regular-list]:list-disc [&_.regular-list]:pl-5 [&_ol.regular-list]:list-decimal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => {
            if (selectedOutputAsset !== 'bibliography') {
              return <p>{children}</p>;
            }
            const text = extractTextFromChildren(children);
            const regex =
              /(?:\[((?:orkg-ask|orkgAsk|semantic-scholar|semanticScholar))-([A-Za-z0-9_-]+)\]|((?:orkg-ask|orkgAsk|semantic-scholar|semanticScholar))-([A-Za-z0-9_-]+))/g;
            const nodes: React.ReactNode[] = [];
            let lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = regex.exec(text)) !== null) {
              const [
                full,
                bracketedPrefix,
                bracketedIdPart,
                nonBracketedPrefix,
                nonBracketedIdPart,
              ] = match;
              const start = match.index;
              if (start > lastIndex) {
                nodes.push(text.slice(lastIndex, start));
              }

              const prefix = bracketedPrefix || nonBracketedPrefix;
              const idPart = bracketedIdPart || nonBracketedIdPart;

              const canonicalId = normalizeCitationId(`${prefix}-${idPart}`);
              const isInBibliography = isItemInBibliography(
                bibliography ?? [],
                canonicalId
              );

              nodes.push(
                <span
                  key={`${canonicalId}-${start}`}
                  className="inline-flex items-center gap-1"
                >
                  <ToggleButton
                    isSelected={isInBibliography}
                    onChange={() => handleToggleCitation(canonicalId)}
                    size="sm"
                    isIconOnly
                    aria-label={
                      isInBibliography
                        ? `Remove citation ${canonicalId} from bibliography`
                        : `Add citation ${canonicalId} to bibliography`
                    }
                  >
                    {isInBibliography ? '✓' : '+'}
                  </ToggleButton>
                  <span>{full}</span>
                </span>
              );
              lastIndex = regex.lastIndex;
            }
            if (lastIndex < text.length) {
              nodes.push(text.slice(lastIndex));
            }
            return <p>{nodes}</p>;
          },
          ul: ({ children, ...props }) => {
            const isTaskList =
              Array.isArray(props?.node?.properties?.className) &&
              props.node.properties.className.includes('contains-task-list') !==
                undefined;

            if (isTaskList) {
              return <ul className="flex flex-col gap-3 my-2">{children}</ul>;
            }
            return (
              <ul {...props?.node?.properties} className="regular-list">
                {children}
              </ul>
            );
          },
          ol: ({ children, ...props }) => (
            <ol {...props?.node?.properties} className="regular-list">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isTaskItem =
              Array.isArray(props?.node?.properties?.className) &&
              props.node.properties.className.includes('task-list-item') !==
                undefined;

            const label = extractTextFromChildren(children);

            if (isTaskItem) {
              // Native input rather than HeroUI's checkbox: HeroUI keeps the
              // real input visually hidden and focuses it programmatically when
              // the label is pressed, which makes the browser scroll it into
              // view and jumps the chat. A visible input is focused by the
              // browser itself, without the scroll.
              return (
                <li>
                  <label className="inline-flex items-center gap-3 text-sm font-medium cursor-pointer">
                    <span className="relative inline-flex shrink-0">
                      <input
                        type="checkbox"
                        checked={!!label && !!asset?.includes(label)}
                        onChange={() =>
                          handleChangeTopics({
                            label,
                          })
                        }
                        className="peer size-4 appearance-none rounded-md border border-field-border bg-field outline-none checked:border-accent checked:bg-accent focus-visible:focus-ring cursor-pointer"
                      />
                      {/* Mirrors HeroUI's checkbox indicator so the two look alike. */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 17 18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="pointer-events-none absolute top-1/2 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 text-accent-foreground opacity-0 peer-checked:opacity-100"
                      >
                        <polyline points="1 9 7 14 15 4" />
                      </svg>
                    </span>
                    <span className="select-auto">{label}</span>
                  </label>
                </li>
              );
            }
            return <li {...props?.node?.properties}>{children}</li>;
          },
        }}
      >
        {part.text}
      </ReactMarkdown>
    </div>
  );
}
