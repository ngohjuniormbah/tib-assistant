'use client';

import {
  faCheck,
  faDownload,
  faEye,
  faList,
  faSearch,
  faTable,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Card,
  Chip,
  Modal,
  ScrollShadow,
  Spinner,
  TextArea,
} from '@heroui/react';
import { useState } from 'react';

import {
  fetchMultipleOrkgComparisons,
  OrkgComparisonResult,
} from '@/services/orkgComparison';

export type ImportComparisonModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImport: (results: OrkgComparisonResult[]) => void;
};

const ORKG_URL_ID_REGEX = /orkg\.org\/(?:[a-z0-9_-]+\/)+([A-Za-z0-9_-]+)/gi;
const ORKG_ID_REGEX = /^(R|C|P|CONTRIBUTION)[_\d][A-Za-z0-9_-]*$/i;

function extractAllOrkgIds(input: string): string[] {
  const ids: string[] = [];
  const urlMatches = input.matchAll(ORKG_URL_ID_REGEX);
  for (const m of urlMatches) {
    if (m[1] && !ids.includes(m[1])) {
      ids.push(m[1]);
    }
  }
  const tokens = input.split(/[\s,;]+/);
  for (const token of tokens) {
    const trimmed = token.trim();
    if (ORKG_ID_REGEX.test(trimmed) && !ids.includes(trimmed)) {
      ids.push(trimmed);
    }
  }
  return ids;
}

function ComparisonTablePreview({ result }: { result: OrkgComparisonResult }) {
  const props = result.propertyColumns ?? [];
  const studies = result.contributions ?? [];

  if (!studies.length) {
    return (
      <div className="text-xs text-muted italic p-2">No studies found.</div>
    );
  }

  return (
    <div className="border rounded-md overflow-x-auto my-2 max-h-56 shadow-sm">
      <table className="w-full text-xs text-left border-collapse table-fixed">
        <thead className="bg-surface-secondary font-semibold border-b">
          <tr>
            <th className="p-2 border-r w-36 font-semibold text-foreground bg-surface-tertiary">
              Properties
            </th>
            {studies.map((s, idx) => (
              <th
                key={s.id || idx}
                className="p-2 border-r w-56 font-semibold text-foreground"
                title={s.name}
              >
                <span className="line-clamp-2">{s.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {props.map((prop) => (
            <tr key={prop} className="hover:bg-surface-secondary/40">
              <td className="p-2 border-r font-medium text-foreground/80 bg-surface-secondary/20 capitalize whitespace-normal">
                {prop}
              </td>
              {studies.map((s, idx) => {
                const val =
                  s.properties[prop] || s.properties[prop.toLowerCase()] || '—';
                return (
                  <td
                    key={s.id || idx}
                    className="p-2 border-r text-xs text-muted align-top whitespace-normal"
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ImportComparisonModal({
  isOpen,
  onOpenChange,
  onImport,
}: ImportComparisonModalProps) {
  const [comparisonInput, setComparisonInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<
    OrkgComparisonResult[]
  >([]);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!comparisonInput.trim()) return;
    setIsLoading(true);
    setError(null);

    const ids = extractAllOrkgIds(comparisonInput);
    if (!ids.length) {
      setError(
        'No valid ORKG comparison links or identifiers found. Please check your input.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const results = await fetchMultipleOrkgComparisons(ids);
      if (!results.length) {
        setError(
          'Could not retrieve any comparison tables from the provided links. Please verify the IDs.'
        );
      } else {
        setComparisonResults((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = results.filter((r) => !existingIds.has(r.id));
          return [...prev, ...newUnique];
        });
        setComparisonInput('');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to query ORKG. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveComparison = (id: string) => {
    setComparisonResults((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConfirmImport = () => {
    if (!comparisonResults.length) return;
    onImport(comparisonResults);
    onOpenChange(false);
  };

  const totalStudies = comparisonResults.reduce(
    (acc, r) => acc + r.contributionCount,
    0
  );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-4xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTable} className="text-muted" />
                <span>Import ORKG Comparison Tables</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="space-y-4">
            <p className="text-sm text-muted">
              Paste one or multiple ORKG comparison URLs or IDs (one per line or
              separated by commas):
            </p>

            <div className="space-y-2">
              <TextArea
                rows={3}
                placeholder={
                  'https://orkg.org/comparisons/R1587225\nhttps://orkg.org/comparisons/R1587217\nR1587219'
                }
                value={comparisonInput}
                onChange={(e) => setComparisonInput(e.target.value)}
                disabled={isLoading}
              />
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onPress={handleFetch}
                  isDisabled={isLoading || !comparisonInput.trim()}
                >
                  {isLoading ? (
                    <Spinner size="sm" color="current" />
                  ) : (
                    <FontAwesomeIcon icon={faSearch} />
                  )}
                  <span>Resolve Comparisons</span>
                </Button>
              </div>
            </div>

            {error && (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            {comparisonResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">
                    Loaded Comparisons ({comparisonResults.length}) —{' '}
                    {totalStudies} total studies
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => setComparisonResults([])}
                  >
                    Clear All
                  </Button>
                </div>

                <ScrollShadow className="max-h-80 overflow-y-auto space-y-2 pr-1">
                  {comparisonResults.map((res) => (
                    <Card
                      key={res.id}
                      variant="secondary"
                      className="p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold m-0 line-clamp-1">
                            {res.title}
                          </h4>
                          <Chip size="sm" color="accent">
                            {res.contributionCount} studies
                          </Chip>
                          <Chip size="sm" color="default">
                            {res.propertyColumns.length} properties
                          </Chip>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            isIconOnly
                            variant="ghost"
                            aria-label="Preview table"
                            onPress={() =>
                              setActivePreviewId(
                                activePreviewId === res.id ? null : res.id
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={activePreviewId === res.id ? faList : faEye}
                            />
                          </Button>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="ghost"
                            aria-label="Remove comparison"
                            onPress={() => handleRemoveComparison(res.id)}
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-danger"
                            />
                          </Button>
                        </div>
                      </div>

                      {activePreviewId === res.id && (
                        <ComparisonTablePreview result={res} />
                      )}
                    </Card>
                  ))}
                </ScrollShadow>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="flex justify-between items-center">
            <span className="text-xs text-muted">
              {comparisonResults.length > 0
                ? `${comparisonResults.length} table${comparisonResults.length > 1 ? 's' : ''} ready to synthesize`
                : 'No comparisons added yet'}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" onPress={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleConfirmImport}
                isDisabled={!comparisonResults.length}
              >
                <FontAwesomeIcon
                  icon={comparisonResults.length ? faCheck : faDownload}
                />
                <span>
                  Import & Synthesize{' '}
                  {comparisonResults.length > 0
                    ? `(${comparisonResults.length})`
                    : ''}
                </span>
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
