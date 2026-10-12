import { faCheck, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';

export default function ButtonEditIcon({ isEditing }: { isEditing: boolean }) {
  const key = isEditing ? 'faCheck' : 'faPen';

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={key}
        variants={{
          initial: { y: -20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 20, opacity: 0 },
        }}
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2 }}
        className="icon-wrapper"
      >
        <FontAwesomeIcon
          icon={isEditing ? faCheck : faPen}
          size={isEditing ? 'xl' : '1x'}
        />
      </motion.div>
    </AnimatePresence>
  );
}
