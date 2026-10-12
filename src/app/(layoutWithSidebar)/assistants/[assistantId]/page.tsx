import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AssistantPageContent from '@/app/(layoutWithSidebar)/assistants/[assistantId]/AssistantPage';
import ASSISTANTS from '@/config/assistants';

type AssistantPageProps = Promise<{ assistantId: string }>;

export async function generateMetadata({
  params,
}: {
  params: AssistantPageProps;
}): Promise<Metadata> {
  const { assistantId } = await params;
  const assistant = ASSISTANTS[assistantId];

  if (!assistant) {
    return {};
  }

  return {
    title: `${assistant.metadata.name}`,
  };
}

export default async function AssistantPage({
  params,
}: {
  params: AssistantPageProps;
}) {
  const { assistantId } = await params;

  if (!ASSISTANTS[assistantId]) {
    notFound();
  }

  return <AssistantPageContent assistantId={assistantId} />;
}
