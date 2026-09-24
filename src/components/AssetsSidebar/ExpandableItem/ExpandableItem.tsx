import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Chip, Tooltip } from '@heroui/react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { ReactNode, useContext, useEffect, useRef, useState } from 'react';

import assetsContext from '@/components/AssetsProvider/assetsContext';
import { Asset } from '@/config/assets';

/** framer-motion needs a concrete colour to interpolate to; `transparent` is not one. */
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

type Props = {
  asset: Asset;
  itemCount?: number;
  children: ReactNode;
  startContent?: ReactNode;
  enableInput?: boolean;
  assetContent?: string[];
};

export default function ExpandableItem({
  asset,
  itemCount,
  children,
  startContent,
  assetContent,
  enableInput = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setAssets } = useContext(assetsContext);

  const handleInput = () => {
    if (!assetContent) {
      return;
    }
    setAssets((prev) => [
      ...prev,
      {
        assetId: asset.id,
        content: assetContent,
      },
    ]);
  };

  const controls = useAnimation();
  const prevItemCount = useRef(itemCount);

  useEffect(() => {
    let isMounted = true;

    if (
      prevItemCount.current !== itemCount &&
      typeof itemCount !== 'undefined'
    ) {
      /*
       * Flash from transparent so the row keeps whatever surface it sits on. The
       * animation writes an inline background-color, so ending on an opaque colour
       * would pin the row to that colour for every theme.
       */
      const highlight = getComputedStyle(document.documentElement)
        .getPropertyValue('--highlight')
        .trim();

      const transparentHighlight = `${highlight}00`;

      controls
        .start({
          backgroundColor: [
            transparentHighlight,
            highlight,
            transparentHighlight,
          ],
        })
        .then(() => {
          // Fixes issue: Error: controls.start() should only be called after a component has mounted
          if (isMounted) {
            controls.start({ backgroundColor: transparentHighlight });
          }
        });
    }
    prevItemCount.current = itemCount;

    return () => {
      isMounted = false;
      controls.stop();
    };
  }, [itemCount, controls]);

  return (
    <>
      <motion.div
        className="flex flex-wrap items-center py-3 rounded-2xl"
        initial={{ backgroundColor: TRANSPARENT }}
        animate={controls}
        transition={{ duration: 0.6, ease: 'easeInOut', times: [0, 0.5, 1] }}
      >
        {startContent}
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <span className="mr-2">
              <Button
                size="sm"
                isIconOnly
                variant="primary"
                onPress={handleInput}
                isDisabled={!enableInput || itemCount === 0}
              >
                <FontAwesomeIcon icon={faArrowUp} size="lg" />
              </Button>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            {itemCount === 0
              ? 'No assets selected to send as chat message'
              : 'Send as chat message'}
          </Tooltip.Content>
        </Tooltip>
        <button
          className="font-semibold text-left min-h-10 z-10 cursor-pointer"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {asset.name}{' '}
          {typeof itemCount !== 'undefined' && <Chip>{itemCount}</Chip>}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              transition={{ duration: 0.3 }}
              variants={{
                open: { opacity: 1, height: 'auto', zoom: 1 },
                collapsed: { opacity: 0, height: 0, zoom: 0 },
              }}
              className="overflow-hidden flex flex-col items-end w-full -mt-9"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <hr className="w-full" />
    </>
  );
}
