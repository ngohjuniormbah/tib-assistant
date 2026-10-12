import {
  faCalendar,
  faCircle,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Skeleton } from '@heroui/react';

import { PaperItem } from '@/components/ToolCallPaper/PaperList/PaperList';

type Props = {
  paper?: PaperItem;
  isLoading?: boolean;
  onChangeCheckbox?: (checked: boolean) => void;
  isSelectedCheckbox?: boolean;
  storeItem?: string[];
  setStoreItem?: (value: string[]) => Promise<void>;
};

export default function PaperListItem({
  paper,
  isLoading,
  storeItem,
  setStoreItem,
}: Props) {
  const parsedStoreItems = storeItem?.map((item) => JSON.parse(item));
  const isSelectedCheckbox = !!parsedStoreItems?.find(
    (item) => item.id === paper?.id
  );

  const handleValueChange = () => {
    if (!setStoreItem || !paper) {
      return;
    }
    setStoreItem(
      parsedStoreItems?.find((item) => item.id === paper.id)
        ? parsedStoreItems
            ?.filter((item) => item.id !== paper.id)
            .map((item) => JSON.stringify(item))
        : [
            ...(parsedStoreItems?.map((item) => JSON.stringify(item)) ?? []),
            JSON.stringify({
              id: paper.id.toString() ?? '',
              abstract: paper.abstract ?? '',
              type: 'article',
              title: paper.title,
              author: paper?.authors?.map((author) => ({ literal: author })),
              DOI: paper.doi ?? undefined,
              issued: paper.publicationDate
                ? {
                    'date-parts': [
                      [
                        paper.publicationDate
                          ? paper.publicationDate.getFullYear()
                          : 0,
                        paper.publicationDate
                          ? paper.publicationDate.getMonth() + 1
                          : undefined, // Date months range form 0 to 11, while CSL JSON months range from 1 to 12
                      ],
                    ],
                  }
                : undefined,
            }),
          ]
    );
  };

  return (
    <li className="flex border-b-1 pb-2">
      <div>
        <Checkbox
          isDisabled={isLoading}
          onChange={handleValueChange}
          isSelected={isSelectedCheckbox}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Content>
        </Checkbox>
      </div>
      <div className="min-w-0 w-full">
        {!isLoading && paper ? (
          <a href={paper.link} target="_blank" className="font-semibold">
            {paper.title}
          </a>
        ) : (
          <Skeleton className="h-10 w-full" />
        )}

        <div className="flex gap-3 w-full">
          {paper && paper.authors && paper.authors.length > 0 && (
            <span className="text-muted text-sm flex items-center min-w-0">
              <FontAwesomeIcon icon={faUser} className="opacity-75" />{' '}
              <ul className="flex p-0 m-0 overflow-hidden">
                {paper.authors.map((author, index) => (
                  <li
                    className="ml-2 whitespace-nowrap after:content-['•'] last:after:content-[''] after:ml-2"
                    key={index}
                  >
                    {author}
                  </li>
                ))}
              </ul>
            </span>
          )}
          {paper && paper.publicationDate && (
            <span className="text-muted text-sm shrink-0">
              <FontAwesomeIcon icon={faCalendar} className="me-1 opacity-75" />{' '}
              {paper.publicationDate.toLocaleString('default', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          )}
          {paper && paper.doi && (
            <span className="text-muted text-sm shrink-0">
              <FontAwesomeIcon icon={faCircle} className="me-1 opacity-75" />{' '}
              {paper.doi}
            </span>
          )}
        </div>
        {paper && paper.abstract && (
          <div className="text-sm line-clamp-3 mt-2">{paper.abstract}</div>
        )}
      </div>
    </li>
  );
}
