import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import ROUTES from '@/constants/routes';
import { Assistant } from '@/types';

const assistantPath = (id?: string) => `${ROUTES.ASSISTANTS}/${id}`;

export default function AssistantGroup({
  assistants,
  groupName,
}: {
  groupName: string;
  assistants: Assistant[];
}) {
  const pathname = usePathname();
  const hasActiveItem = assistants.some(
    (assistant) => pathname === assistantPath(assistant.id)
  );
  const [isOpen, setIsOpen] = useState(hasActiveItem);

  return (
    <li className="ms-6 relative">
      <span className="absolute flex items-center justify-center w-4 h-4 bg-default rounded-full left-[-33px] top-1 ring-4 ring-surface">
        <FontAwesomeIcon
          icon={!isOpen ? faPlus : faMinus}
          className="text-[75%] opacity-30"
        />
      </span>

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-transparent border-none p-0 m-0 shadow-none hover:underline"
      >
        {groupName}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {assistants.map((assistant) => (
              <li className="ms-2 relative my-3 last:mb-0" key={assistant.id}>
                <Link
                  href={assistantPath(assistant.id)}
                  className={`text-inherit ${pathname === assistantPath(assistant.id) ? 'font-bold' : 'me-1'}`}
                >
                  {assistant.metadata.name}
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
