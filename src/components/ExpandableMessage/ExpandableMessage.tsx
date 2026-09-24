import { faCircleDown, faCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner, Tooltip } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

import ActionDropdown from '@/components/MessageBubble/ActionDropdown/ActionDropdown';

type Props = {
  onDelete: () => void;
  title: string;
  content: ReactNode;
  isLoading?: boolean;
  isExpanded?: boolean;
  setIsExpanded?: (value: boolean) => void;
  query?: string;
};

export default function ExpandableMessage({
  onDelete,
  title,
  content,
  isLoading = false,
  isExpanded: isExpandedControlled = false,
  setIsExpanded: setIsExpandedControlled,
  query,
}: Props) {
  const [isExpandedLocal, setIsExpandedLocal] = useState(false);
  const isExpanded = isExpandedControlled || isExpandedLocal;
  const setIsExpanded = setIsExpandedControlled || setIsExpandedLocal;

  return (
    <div className={`flex group`}>
      <div
        className={`ml-auto flex group my-2 items-center ${
          isExpanded ? 'w-full' : ''
        }`}
      >
        {!isExpanded && <ActionDropdown onDelete={onDelete} />}
        <div
          className={`ml-auto rounded-3xl px-4 py-2 whitespace-pre-wrap flex flex-col bg-surface-secondary ${
            isExpanded ? 'w-full' : ''
          }`}
        >
          <div
            className={`${
              isExpanded ? 'w-full' : ''
            } flex justify-end items-start italic font-semibold ${
              !isLoading ? 'cursor-pointer' : ''
            }`}
            onClick={() => (!isLoading ? setIsExpanded(!isExpanded) : {})}
          >
            {isExpanded && (
              <div className="grow-0 mr-auto">
                <ActionDropdown onDelete={onDelete} />
              </div>
            )}
            <div className="flex items-center grow-0">
              <Tooltip delay={0} isDisabled={!query}>
                <Tooltip.Trigger>
                  <div>{title}</div>
                </Tooltip.Trigger>
                <Tooltip.Content>{query}</Tooltip.Content>
              </Tooltip>
              {isLoading ? (
                <Spinner size="sm" className="ms-2" />
              ) : (
                <FontAwesomeIcon
                  icon={isExpanded ? faCircleDown : faCircleRight}
                  className="ms-2 text-muted"
                />
              )}
            </div>
          </div>
          {!isLoading && (
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                  variants={{
                    open: {
                      opacity: 1,
                      width: 'auto',
                      height: 'auto',
                      x: 0,
                    },
                    collapsed: {
                      opacity: 0,
                      width: 0,
                      height: 0,
                      x: '50vw',
                    },
                  }}
                >
                  <div className="mt-1">
                    <hr />
                    {content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
