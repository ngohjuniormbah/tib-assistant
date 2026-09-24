'use client';

import dynamic from 'next/dynamic';

import useStore from '@/components/AssetsSidebar/hooks/useStore';
import ASSISTANTS from '@/config/assistants';
import requireAuthentication from '@/lib/requireAuthentication';

const AssetsSidebar = dynamic(
  () => import('@/components/AssetsSidebar/AssetsSidebar'),
  {
    ssr: false,
  }
);

const Llm = dynamic(() => import('@/components/Llm/Llm'), {
  ssr: false,
});

type AssistantPageContentProps = {
  assistantId: string;
};

function AssistantPageContent({ assistantId }: AssistantPageContentProps) {
  const assistant = ASSISTANTS[assistantId];

  const { enabledTools: enabledToolsLocalStorage, mcpServers } = useStore();

  const defaultEnabledTools = assistant.agent.tools;

  const enabledTools =
    enabledToolsLocalStorage?.[assistant.id] ?? defaultEnabledTools;
  const endpoint = `/assistants/${assistant.id}/api`;

  return (
    <>
      <Llm
        infoBox={assistant.userInterface.infoBox}
        endpoint={endpoint}
        defaultEnabledTools={defaultEnabledTools}
        assistantId={assistant.id}
        outputAssets={assistant.agent.outputAssets ?? []}
        initialAssets={assistant.agent.inputAssets ?? []}
        initialSystemMessage={assistant.agent.initialSystemMessage}
        key={JSON.stringify({ endpoint, enabledTools, mcpServers })} // reinitialize the `useChat` hook as the endpoint cannot be changed dynamically
      />

      <AssetsSidebar
        assistantId={assistant.id}
        inputAssets={assistant.agent.inputAssets ?? []}
        outputAssets={assistant.agent.outputAssets ?? []}
      />
    </>
  );
}

export default requireAuthentication(AssistantPageContent);
