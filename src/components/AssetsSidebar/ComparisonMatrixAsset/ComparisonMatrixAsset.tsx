'use client';

import {
  faCode,
  faPen,
  faTable,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, toast, useOverlayState } from '@heroui/react';
import { useState } from 'react';

import MatrixDetailModal from '@/components/AssetsSidebar/ComparisonMatrixAsset/MatrixDetailModal/MatrixDetailModal';
import ExpandableItem from '@/components/AssetsSidebar/ExpandableItem/ExpandableItem';
import useIndexedDbStore from '@/components/useIndexedDbStore/useIndexedDbStore';
import {
  formatMatrixForChat,
  matrixToLatex,
  parseMarkdownTableToMatrix,
} from '@/lib/comparisonMatrixUtils';
import getAssetById from '@/lib/getAssetById';
import { StructuredComparisonMatrix } from '@/types/comparisonMatrix';

export type ComparisonMatrixAssetProps = {
  enableInput?: boolean;
};

export default function ComparisonMatrixAsset({
  enableInput = false,
}: ComparisonMatrixAssetProps) {
  const [selectedMatrix, setSelectedMatrix] =
    useState<StructuredComparisonMatrix | null>(null);
  const detailModalState = useOverlayState();

  const { asset: matrixStore, update } = useIndexedDbStore({
    assetId: 'comparisonMatrix',
  });

  const matrixAssetConfig = getAssetById('comparisonMatrix');
  if (!matrixAssetConfig) {
    return null;
  }

  const rawItems = matrixStore ?? [];
  const parsedMatrices: StructuredComparisonMatrix[] = rawItems.map(
    (item, index) =>
      parseMarkdownTableToMatrix(item, `Comparative Matrix ${index + 1}`)
  );

  const handleOpenDetail = (matrix: StructuredComparisonMatrix) => {
    setSelectedMatrix(matrix);
    detailModalState.open();
  };

  const handleSaveMatrix = async (updated: StructuredComparisonMatrix) => {
    const updatedList = parsedMatrices.map((existing) =>
      existing.id === updated.id
        ? JSON.stringify(updated)
        : JSON.stringify(existing)
    );
    await update(updatedList);
  };

  const handleDeleteMatrix = async (id: string) => {
    const remaining = parsedMatrices
      .filter((m) => m.id !== id)
      .map((m) => JSON.stringify(m));
    await update(remaining);
  };

  const handleCopyLatex = (matrix: StructuredComparisonMatrix) => {
    const code = matrixToLatex(matrix);
    navigator.clipboard.writeText(code);
    toast.success('Copied LaTeX table code to clipboard!');
  };

  const formattedContentForChat = parsedMatrices.map((m) =>
    formatMatrixForChat(m)
  );

  return (
    <ExpandableItem
      asset={matrixAssetConfig}
      itemCount={parsedMatrices.length}
      enableInput={enableInput}
      assetContent={formattedContentForChat}
    >
      <div className="w-full space-y-2 mt-2">
        {parsedMatrices.length === 0 ? (
          <Alert>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>
                No comparison benchmark matrices built yet.
              </Alert.Description>
            </Alert.Content>
          </Alert>
        ) : (
          parsedMatrices.map((matrix) => (
            <div
              key={matrix.id}
              className="p-2.5 rounded-xl border border-border bg-surface-secondary/50 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <FontAwesomeIcon
                    icon={faTable}
                    className="text-muted text-xs"
                  />
                  <span className="font-bold text-xs text-foreground truncate max-w-[170px]">
                    {matrix.title}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label="Copy LaTeX"
                    onPress={() => handleCopyLatex(matrix)}
                  >
                    <FontAwesomeIcon
                      icon={faCode}
                      className="text-muted text-xs"
                    />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label="Edit matrix"
                    onPress={() => handleOpenDetail(matrix)}
                  >
                    <FontAwesomeIcon
                      icon={faPen}
                      className="text-muted text-xs"
                    />
                  </Button>
                  <Button
                    size="sm"
                    isIconOnly
                    variant="ghost"
                    aria-label="Delete matrix"
                    onPress={() => handleDeleteMatrix(matrix.id)}
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-muted text-xs"
                    />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <Chip size="sm">{matrix.rows.length} Studies</Chip>
                <Chip size="sm">{matrix.properties.length} Metrics</Chip>
              </div>

              {matrix.rows.length > 0 && (
                <div className="text-[11px] text-muted truncate">
                  <span className="font-semibold">Evaluated:</span>{' '}
                  {matrix.rows
                    .map((r) => r.studyTitle)
                    .slice(0, 3)
                    .join(', ')}
                  {matrix.rows.length > 3 ? '...' : ''}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {detailModalState.isOpen && selectedMatrix && (
        <MatrixDetailModal
          isOpen={detailModalState.isOpen}
          onClose={detailModalState.close}
          matrix={selectedMatrix}
          onSave={handleSaveMatrix}
        />
      )}
    </ExpandableItem>
  );
}
