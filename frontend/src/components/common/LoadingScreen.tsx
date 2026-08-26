import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-dark flex items-center justify-center z-50">
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center mx-auto mb-6 shadow-glow-blue"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold text-white mb-2">AI Debate Partner</h2>
          <p className="text-slate-500 text-sm">Initializing neural systems...</p>
        </motion.div>
        <div className="mt-6 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary-500"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
