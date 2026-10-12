import { InferUITools, UIMessage } from 'ai';
import z from 'zod';

import { AssetWithContent } from '@/components/AssetsProvider/assetsContext';

export const messageMetadataSchema = z.object();

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export type ChatTools = InferUITools<Record<string, never>>;

export type CustomUIDataTypes = {
  asset: AssetWithContent;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export type Assistant = {
  id?: string;
  metadata: {
    name: string;
    description?: string;
    lifeCyclePhase?: string;
    domain?: string;
    creator?: string;
  };
  userInterface: {
    infoBox: string;
    readMoreText?: string;
  };
  agent: {
    tools?: { [mcpUrl: string]: string[] };
    inputAssets?: string[];
    outputAssets?: string[];
    model?: string;
    systemPrompt?: string;
    initialSystemMessage?: string;
  };
};
