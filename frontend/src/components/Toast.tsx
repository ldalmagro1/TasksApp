import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  message: string;
  type: 'success' | 'error';
}

export default function Toast({ message, type }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg pointer-events-auto backdrop-blur-md border ${
            type === 'success' 
              ? 'bg-success-50/90 border-success-200 text-success-800' 
              : 'bg-danger-50/90 border-danger-200 text-danger-800'
          }`}
        >
          <span className="text-xl">{type === 'success' ? '✅' : '❌'}</span>
          <span className="font-medium text-sm">{message}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
