import { faArrowsSpin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { usePathname } from 'next/navigation';

import AssistantGroup from '@/app/(layoutWithSidebar)/components/Sidebar/AssistantsList/AssistantGroup/AssistantGroup';
import ListItem from '@/app/(layoutWithSidebar)/components/Sidebar/AssistantsList/ListItem/ListItem';
import useStore from '@/components/AssetsSidebar/hooks/useStore';
import ASSISTANTS from '@/config/assistants';
import LIFE_CYCLES from '@/config/lifeCycles';
import isDefined from '@/lib/isDefined';

export default function AssistantsList() {
  const { enabledAssistants } = useStore();

  const pathname = usePathname();
  const assistants = enabledAssistants ?? LIFE_CYCLES?.default?.assistants;
  return (
    <>
      <div className="flex items-center gap-2 font-medium text-muted py-2">
        <FontAwesomeIcon icon={faArrowsSpin} className="text-sm text-muted" />
        <span>Life cycle</span>
      </div>

      <div className="overflow-auto pt-1">
        <ol className="border-s-2 ms-3 gap-4 flex flex-col">
          {assistants.map((assistant) => {
            // support nested assistant groups
            if (typeof assistant === 'object') {
              return (
                <AssistantGroup
                  key={assistant.groupName}
                  groupName={assistant.groupName}
                  assistants={assistant.assistants
                    .map((id) => ASSISTANTS[id])
                    .filter(isDefined)}
                />
              );
            } else {
              const _assistant = ASSISTANTS[assistant];
              if (!_assistant) return null;

              return (
                <ListItem
                  key={_assistant.id}
                  title={_assistant.metadata.name}
                  href={'/assistants/' + _assistant.id}
                  isActive={pathname === '/assistants/' + _assistant.id}
                />
              );
            }
          })}
        </ol>
      </div>
    </>
  );
}
