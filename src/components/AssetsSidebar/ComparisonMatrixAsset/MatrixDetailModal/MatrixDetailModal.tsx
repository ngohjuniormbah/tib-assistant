'use client';

import {
  faCheck,
  faCode,
  faCopy,
  faTable,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Chip,
  Input,
  Label,
  Modal,
  ScrollShadow,
  Tabs,
  TextField,
  toast,
} from '@heroui/react';
import { FormEvent, useState } from 'react';

import { matrixToLatex, matrixToMarkdown } from '@/lib/comparisonMatrixUtils';
import { StructuredComparisonMatrix } from '@/types/comparisonMatrix';

export type MatrixDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  matrix: StructuredComparisonMatrix;
  onSave: (updatedMatrix: StructuredComparisonMatrix) => void;
};

export default function MatrixDetailModal({
  isOpen,
  onClose,
  matrix,
  onSave,
}: MatrixDetailModalProps) {
  const [selectedTab, setSelectedTab] = useState<string>('table');
  const [title, setTitle] = useState(matrix.title);
  const [properties] = useState<string[]>(matrix.properties);
  const [rows, setRows] = useState(matrix.rows);

  const currentMatrix: StructuredComparisonMatrix = {
    ...matrix,
    title,
    properties,
    rows,
    markdownTable: matrixToMarkdown({ ...matrix, title, properties, rows }),
  };

  const latexCode = matrixToLatex(currentMatrix);
  const markdownCode = matrixToMarkdown(currentMatrix);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleCellChange = (
    rowIndex: number,
    property: string,
    newValue: string
  ) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex
          ? {
              ...row,
              properties: {
                ...row.properties,
                [property]: newValue,
              },
            }
          : row
      )
    );
  };

  const handleTitleChange = (rowIndex: number, newTitle: string) => {
    setRows((prev) =>
      prev.map((row, idx) =>
        idx === rowIndex ? { ...row, studyTitle: newTitle } : row
      )
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave(currentMatrix);
    onClose();
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onClose}>
      <Modal.Container placement="top">
        <Modal.Dialog className="max-w-4xl">
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTable} className="text-muted" />
                <span>Benchmark Comparison Matrix</span>
              </div>
            </Modal.Heading>
          </Modal.Header>

          <form onSubmit={handleSubmit}>
            <Modal.Body className="space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TextField className="flex-1 min-w-[240px] flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-foreground">
                    Matrix Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </TextField>
                <div className="flex items-center gap-1.5 self-end">
                  <Chip size="sm">{rows.length} Studies</Chip>
                  <Chip size="sm">{properties.length} Dimensions</Chip>
                </div>
              </div>

              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                className="gap-0!"
              >
                <Tabs.ListContainer>
                  <Tabs.List aria-label="Matrix Views" className="w-full">
                    <Tabs.Tab id="table" className="gap-2">
                      <FontAwesomeIcon icon={faTable} />
                      <span>Table Viewer & Editor</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="latex" className="gap-2">
                      <FontAwesomeIcon icon={faCode} />
                      <span>LaTeX Export (Overleaf)</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab id="markdown" className="gap-2">
                      <FontAwesomeIcon icon={faCopy} />
                      <span>Markdown</span>
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>

                <Tabs.Panel id="table" className="pt-3">
                  <ScrollShadow className="max-h-96 overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-xs text-left border-collapse table-fixed">
                      <thead className="bg-surface-secondary border-b border-border">
                        <tr>
                          <th className="p-2.5 border-r border-border w-52 font-semibold text-foreground">
                            Study / Method
                          </th>
                          {properties.map((prop) => (
                            <th
                              key={prop}
                              className="p-2.5 border-r border-border min-w-44 font-semibold text-foreground"
                            >
                              {prop}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {rows.map((row, rowIdx) => (
                          <tr
                            key={row.studyId || rowIdx}
                            className="hover:bg-surface-secondary/30"
                          >
                            <td className="p-1.5 border-r border-border font-medium bg-surface-secondary/20">
                              <Input
                                value={row.studyTitle}
                                onChange={(e) =>
                                  handleTitleChange(rowIdx, e.target.value)
                                }
                                className="text-xs h-7 border-0"
                              />
                            </td>
                            {properties.map((prop) => (
                              <td
                                key={prop}
                                className="p-1.5 border-r border-border"
                              >
                                <Input
                                  value={row.properties[prop] || ''}
                                  onChange={(e) =>
                                    handleCellChange(
                                      rowIdx,
                                      prop,
                                      e.target.value
                                    )
                                  }
                                  placeholder="—"
                                  className="text-xs h-7 border-0"
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollShadow>
                </Tabs.Panel>

                <Tabs.Panel id="latex" className="pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      Ready for inclusion in LaTeX manuscript (\usepackage
                      {'{booktabs}'}):
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => handleCopy(latexCode, 'LaTeX')}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      <span>Copy LaTeX</span>
                    </Button>
                  </div>
                  <ScrollShadow className="max-h-72 overflow-y-auto">
                    <pre className="text-xs font-mono p-3 rounded-xl bg-surface-secondary border border-border whitespace-pre-wrap select-all">
                      {latexCode}
                    </pre>
                  </ScrollShadow>
                </Tabs.Panel>

                <Tabs.Panel id="markdown" className="pt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">
                      Standard GitHub / ORKG Markdown format:
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() => handleCopy(markdownCode, 'Markdown')}
                    >
                      <FontAwesomeIcon icon={faCopy} />
                      <span>Copy Markdown</span>
                    </Button>
                  </div>
                  <ScrollShadow className="max-h-72 overflow-y-auto">
                    <pre className="text-xs font-mono p-3 rounded-xl bg-surface-secondary border border-border whitespace-pre-wrap select-all">
                      {markdownCode}
                    </pre>
                  </ScrollShadow>
                </Tabs.Panel>
              </Tabs>
            </Modal.Body>

            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="secondary" onPress={onClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FontAwesomeIcon icon={faCheck} />
                <span>Save Matrix</span>
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
