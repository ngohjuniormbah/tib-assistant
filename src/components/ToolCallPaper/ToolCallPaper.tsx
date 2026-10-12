import { Dispatch, SetStateAction } from 'react';

import ToolCallInput from '@/components/ToolCall/ToolCallInput/ToolCallInput';
import PaperList, {
  PaperItem,
} from '@/components/ToolCallPaper/PaperList/PaperList';

type Props = {
  papers?: PaperItem[];
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  totalPages: number;
  isLoading: boolean;
  storeItem: string[];
  setStoreItem: (value: string[]) => Promise<void>;
  input?: unknown;
};
export default function ToolCallPaper({
  papers,
  page,
  setPage,
  totalPages,
  isLoading,
  storeItem,
  setStoreItem,
  input,
}: Props) {
  return (
    <div className="mb-2">
      <div className="ps-2 my-3 ">
        <div className="font-semibold grow">Output</div>
        <PaperList
          papers={papers}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          isLoading={isLoading}
          storeItem={storeItem}
          setStoreItem={setStoreItem}
        />
      </div>
      <hr />
      <ToolCallInput input={input} />
    </div>
  );
}
