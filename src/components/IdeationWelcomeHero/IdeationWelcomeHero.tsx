'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const ROTATING_PHRASES = [
  'Formulate testable, publication-ready research hypotheses.',
  'Uncover unexplored gaps across recent top conference papers.',
  'Identify conflicting paradigms and benchmark bottlenecks.',
  'Bridge novel intersections between scientific disciplines.',
  'Transform limitations of foundational papers into your next project.',
];

export default function IdeationWelcomeHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="my-6 text-center max-w-xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        Explore Your Next Research Direction
      </h2>
      <div className="h-10 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="text-sm text-muted font-medium"
          >
            {ROTATING_PHRASES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
