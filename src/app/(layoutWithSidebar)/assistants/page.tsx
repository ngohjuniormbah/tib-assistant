import AssistantCard from '@/components/AssistantCard/AssistantCard';
import ASSISTANTS from '@/config/assistants';

export const metadata = {
  title: 'Assistants library',
};

export default function AssistantsPage() {
  const assistants = Object.values(ASSISTANTS || {});

  return (
    <div className="box-white grow !py-4 !px-4 lg:!px-6 [&_h1]:my-2 [&_h2]:my-2 [&_h3]:my-2 [&_h4]:my-2">
      <h1>Assistant library</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <AssistantCard
            key={assistant.id}
            assistant={assistant}
            isLinkEnabled
          />
        ))}
      </section>
    </div>
  );
}
