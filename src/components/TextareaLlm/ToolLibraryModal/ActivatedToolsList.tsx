'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';

import TOOL_GALLERY from '@/config/toolGallery';

type ActivatedToolsListProps = {
  enabledTools: {
    [mcpUrl: string]: string[];
  };
  onRemoveTool: (mcpUrl: string, toolName: string) => void;
};

export default function ActivatedToolsList({
  enabledTools,
  onRemoveTool,
}: ActivatedToolsListProps) {
  const totalCount = Object.values(enabledTools).reduce(
    (sum, tools) => sum + tools.length,
    0
  );

  const getToolDisplayName = (mcpUrl: string, toolName: string) => {
    const found = TOOL_GALLERY[mcpUrl]?.find(
      (tool) => tool.mcpToolName === toolName
    );
    return found ? found.name : toolName;
  };

  return (
    <div>
      <h3 className="!text-base font-semibold mb-3">
        Activated tools ({totalCount})
      </h3>

      {totalCount === 0 && (
        <p className="text-sm text-muted">
          No tools activated. Add tools from the gallery to get started.
        </p>
      )}

      {Object.entries(enabledTools).map(([mcpUrl, tools]) => {
        if (tools.length === 0) return null;

        return (
          <div key={mcpUrl} className="mb-4">
            <div className="flex items-center justify-between mb-2 min-w-0">
              <h4 className="text-sm font-semibold text-muted truncate max-w-full">
                {mcpUrl}
              </h4>
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                onPress={() =>
                  tools.forEach((tool) => onRemoveTool(mcpUrl, tool))
                }
                aria-label="Remove all tools"
              >
                <FontAwesomeIcon icon={faTimes} className="text-muted" />
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              {tools.map((toolName) => (
                <div
                  key={toolName}
                  className="flex items-center justify-between gap-2 bg-surface-secondary rounded-lg px-2 py-1 text-sm min-w-0"
                >
                  <span
                    className="truncate flex-1 min-w-0"
                    title={getToolDisplayName(mcpUrl, toolName)}
                  >
                    {getToolDisplayName(mcpUrl, toolName)}
                  </span>
                  <Button
                    isIconOnly
                    variant="ghost"
                    size="sm"
                    onPress={() => onRemoveTool(mcpUrl, toolName)}
                  >
                    <FontAwesomeIcon icon={faTimes} className="text-muted" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
