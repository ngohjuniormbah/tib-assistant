import { useLocalStorage } from 'usehooks-ts';

import { AssetId } from '@/config/assets';
import { LifeCycleAssistants } from '@/config/lifeCycles';
import MCP_SERVERS, { McpServer } from '@/config/mcpServers';
import { ChatMessage } from '@/types';

export default function useStore() {
  const [isUiExpanded, setIsUiExpanded, removeIsUiExpanded] = useLocalStorage(
    'isUiExpanded',
    false,
    {
      initializeWithValue: false,
    }
  );

  const [assetsToolbarWidth, setAssetsToolbarWidth, removeAssetsToolbarWidth] =
    useLocalStorage<number>('assetsToolbarWidth', 320);

  const [enabledAssets, setEnabledAssets, removeEnabledAssets] =
    useLocalStorage<{
      [assistantId: string]: {
        inputAssets: AssetId[];
        outputAssets: AssetId[];
      };
    }>('enabledAssets', {});

  const [enabledTools, setEnabledTools, removeEnabledTools] = useLocalStorage<{
    [assistantId: string]: {
      [mcpUrl: string]: string[];
    };
  }>('enabledTools', {});

  const [enabledAssistants, setEnabledAssistants, removeEnabledAssistants] =
    useLocalStorage<LifeCycleAssistants | undefined>(
      'enabledAssistants',
      undefined
    );

  const [chatMessages, setChatMessages, removeChatMessages] = useLocalStorage<{
    [assistantId: string]: ChatMessage[];
  }>('chatMessages', {});

  const [mcpServers, setMcpServers, removeMcpServers] = useLocalStorage<
    McpServer[]
  >('mcpServers', []);

  const activeMcpServers = mcpServers.length > 0 ? mcpServers : MCP_SERVERS;

  const resetStore = () => {
    removeEnabledAssistants();
    removeEnabledAssets();
    removeEnabledTools();
    removeIsUiExpanded();
    removeAssetsToolbarWidth();
    removeChatMessages();
    removeMcpServers();
  };

  return {
    assetsToolbarWidth,
    setAssetsToolbarWidth,
    enabledAssets,
    setEnabledAssets,
    isUiExpanded,
    setIsUiExpanded,
    enabledTools,
    setEnabledTools,
    enabledAssistants,
    setEnabledAssistants,
    resetStore,
    chatMessages,
    setChatMessages,
    mcpServers: activeMcpServers,
    setMcpServers,
    removeMcpServers,
  };
}
