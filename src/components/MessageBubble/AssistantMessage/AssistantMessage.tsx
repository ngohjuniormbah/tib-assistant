import {
  faFlask,
  faTable,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ToggleButton } from '@heroui/react';
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
import { isIdeaSelected, parseIdeaItem } from '@/lib/ideationUtils';
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
    if (selectedOutputAsset === 'ideationTopics') {
      const currentList = asset ?? [];
      const alreadySelected = isIdeaSelected(currentList, label);
      if (alreadySelected) {
        const filtered = currentList.filter(
          (item) => !isIdeaSelected([item], label)
        );
        update(filtered);
      } else {
        const structuredIdea = parseIdeaItem(label);
        update([...currentList, JSON.stringify(structuredIdea)]);
      }
    } else {
      update(
        asset?.includes(label)
          ? asset.filter((item) => item !== label)
          : [...(asset ?? []), label]
      );
    }
  };

  const handleDeepDiveAction = (
    label: string,
    action: 'experiment' | 'reviewer' | 'matrix' | 'heilmeier'
  ) => {
    let prompt = '';
    const cleanTitle = label.split(/[\r\n]+/)[0] || label;
    if (action === 'experiment') {
      prompt = `For this research direction:\n"${cleanTitle}"\n\nOutline a publication-grade experimental design: specify the target datasets, evaluation metrics, baseline algorithms to compare against, and essential ablation studies.`;
    } else if (action === 'reviewer') {
      prompt = `Act as a skeptical Senior Reviewer 2 for a top conference (e.g. NeurIPS, ISWC, ACL). What are the 3 strongest technical vulnerabilities, methodological confounders, or reasons to reject this proposed idea:\n"${cleanTitle}"?\n\nProvide constructive rebuttal strategies for each point.`;
    } else if (action === 'matrix') {
      prompt = `Construct an exhaustive competitive Markdown comparison table contrasting this proposed approach:\n"${cleanTitle}"\nagainst existing state-of-the-art baselines across scalability, accuracy, compute complexity, and domain assumptions.`;
    } else if (action === 'heilmeier') {
      prompt = `Provide a complete Heilmeier Catechism evaluation for this research idea:\n"${cleanTitle}"\n1. What are you trying to do without jargon?\n2. How is it done today, and what are the limits?\n3. What is new in your approach and why will it succeed now?\n4. Who cares and what difference will it make?\n5. What are the risks and payoffs?\n6. How much will it cost and how long will it take?\n7. What are the mid-term and final "exams" to check for success?`;
    }
    window.dispatchEvent(new CustomEvent('insert-prompt', { detail: prompt }));
  };

  return (
    <div className="my-2 relative w-full leading-relaxed [&_.regular-list]:list-disc [&_.regular-list]:pl-5 [&_ol.regular-list]:list-decimal space-y-3">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            const isExternal = href?.startsWith('http');
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link font-medium underline underline-offset-3 hover:text-accent transition-colors inline-flex items-center gap-1"
              >
                <span>{children}</span>
                {isExternal && (
                  <svg
                    className="size-3 inline-block shrink-0 opacity-70"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                )}
              </a>
            );
          },
          p: ({ children }) => {
            if (selectedOutputAsset !== 'bibliography') {
              return <p className="mb-2 leading-relaxed">{children}</p>;
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
                  className="inline-flex items-center gap-1 mx-1"
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
                  <span className="font-mono text-xs bg-surface-tertiary px-1.5 py-0.5 rounded border border-border">
                    {full}
                  </span>
                </span>
              );
              lastIndex = regex.lastIndex;
            }
            if (lastIndex < text.length) {
              nodes.push(text.slice(lastIndex));
            }
            return <p className="mb-2 leading-relaxed">{nodes}</p>;
          },
          ul: ({ children, ...props }) => {
            const isTaskList =
              Array.isArray(props?.node?.properties?.className) &&
              props.node.properties.className.includes('contains-task-list') !==
                undefined;

            if (isTaskList) {
              return (
                <ul className="flex flex-col gap-3 my-3 list-none pl-0">
                  {children}
                </ul>
              );
            }
            return (
              <ul
                {...props?.node?.properties}
                className="regular-list space-y-1 mb-2"
              >
                {children}
              </ul>
            );
          },
          ol: ({ children, ...props }) => (
            <ol
              {...props?.node?.properties}
              className="regular-list space-y-1 mb-2"
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isTaskItem =
              Array.isArray(props?.node?.properties?.className) &&
              props.node.properties.className.includes('task-list-item') !==
                undefined;

            if (isTaskItem) {
              const childrenArray = Children.toArray(children);
              const filteredChildren = childrenArray.filter(
                (child) => !(isValidElement(child) && child.type === 'input')
              );
              const label = extractTextFromChildren(filteredChildren).trim();
              const isSelected =
                selectedOutputAsset === 'ideationTopics'
                  ? isIdeaSelected(asset ?? [], label)
                  : !!label && !!asset?.includes(label);

              return (
                <li className="list-none my-2.5">
                  <div
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-surface-secondary border-accent/60 shadow-sm'
                        : 'bg-surface-secondary/50 border-border hover:border-muted/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <label className="relative inline-flex shrink-0 mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleChangeTopics({ label })}
                          className="peer size-4.5 appearance-none rounded-md border border-field-border bg-field outline-none checked:border-accent checked:bg-accent focus-visible:focus-ring cursor-pointer transition-colors"
                        />
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
                      </label>
                      <div className="flex-1 min-w-0 text-sm leading-relaxed space-y-1.5 select-auto">
                        {filteredChildren}

                        <div className="flex flex-wrap gap-1.5 pt-2.5 mt-2 border-t border-border/50 items-center">
                          <span className="text-xs text-muted font-medium mr-1">
                            Deep Dive:
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5 text-xs py-0.5 px-2.5"
                            onPress={() =>
                              handleDeepDiveAction(label, 'experiment')
                            }
                          >
                            <FontAwesomeIcon
                              icon={faFlask}
                              className="text-xs text-muted"
                            />
                            <span>Design Experiment</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5 text-xs py-0.5 px-2.5"
                            onPress={() =>
                              handleDeepDiveAction(label, 'reviewer')
                            }
                          >
                            <FontAwesomeIcon
                              icon={faTriangleExclamation}
                              className="text-xs text-muted"
                            />
                            <span>Stress-Test (Reviewer 2)</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5 text-xs py-0.5 px-2.5"
                            onPress={() =>
                              handleDeepDiveAction(label, 'matrix')
                            }
                          >
                            <FontAwesomeIcon
                              icon={faTable}
                              className="text-xs text-muted"
                            />
                            <span>SOTA Baselines</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="gap-1.5 text-xs py-0.5 px-2.5"
                            onPress={() =>
                              handleDeepDiveAction(label, 'heilmeier')
                            }
                          >
                            <FontAwesomeIcon
                              icon={faFlask}
                              className="text-xs text-muted"
                            />
                            <span>Heilmeier Defense</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
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
