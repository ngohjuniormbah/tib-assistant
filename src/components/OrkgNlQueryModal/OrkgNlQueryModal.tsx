'use client';

import { faCode, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Button,
  Modal,
  ScrollShadow,
  Spinner,
  TextArea,
} from '@heroui/react';
import { useState } from 'react';

import { queryOrkgWithNl } from '@/services/orkgSparql';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onQueryComplete: (
    query: string,
    nlResponse: string,
    sparqlQuery: string
  ) => void;
};

export default function OrkgNlQueryModal({
  isOpen,
  onOpenChange,
  onQueryComplete,
}: Props) {
  const [queryText, setQueryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSparql, setShowSparql] = useState(false);
  const [sparqlPreview, setSparqlPreview] = useState('');

  const handleQuery = async () => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);
    setSparqlPreview('');

    try {
      const result = await queryOrkgWithNl(queryText.trim());
      setSparqlPreview(result.sparqlQuery);
      onQueryComplete(
        queryText.trim(),
        result.naturalLanguageResponse,
        result.sparqlQuery
      );
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to query ORKG. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faSearch} className="text-muted" />
                <span>Query ORKG in Natural Language</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <Modal.Body className="space-y-4">
            <p className="text-sm text-muted">
              Ask anything about research in ORKG. Your question is converted to
              SPARQL, executed against the ORKG triplestore, and returned as a
              structured summary.
            </p>

            <TextArea
              placeholder={`e.g. "Find comparisons about malaria detection" or "What papers exist on transformer models?"`}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              rows={3}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleQuery();
                }
              }}
            />

            {error && (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{error}</Alert.Description>
                </Alert.Content>
              </Alert>
            )}

            {sparqlPreview && (
              <div>
                <button
                  type="button"
                  className="text-xs text-muted flex items-center gap-1 hover:text-foreground transition-colors"
                  onClick={() => setShowSparql(!showSparql)}
                >
                  <FontAwesomeIcon icon={faCode} />
                  <span>{showSparql ? 'Hide' : 'Show'} generated SPARQL</span>
                </button>
                {showSparql && (
                  <ScrollShadow className="max-h-40 overflow-y-auto mt-1">
                    <pre className="text-xs bg-surface-secondary p-2 rounded-lg whitespace-pre-wrap break-all">
                      {sparqlPreview}
                    </pre>
                  </ScrollShadow>
                )}
              </div>
            )}
          </Modal.Body>

          <Modal.Footer className="flex justify-between items-center">
            <span className="text-xs text-muted">Ctrl+Enter to run</span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onPress={() => onOpenChange(false)}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleQuery}
                isDisabled={isLoading || !queryText.trim()}
              >
                {isLoading ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <FontAwesomeIcon icon={faSearch} />
                )}
                <span>{isLoading ? 'Querying ORKG…' : 'Run Query'}</span>
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
