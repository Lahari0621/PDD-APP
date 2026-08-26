import { create } from 'zustand'
import type { Debate, DebateMessage, Fallacy, ArgumentScores } from '../types'

interface DebateStore {
  currentDebate: Debate | null
  messages: DebateMessage[]
  isTyping: boolean
  isLoading: boolean
  activeFallacy: Fallacy | null
  isPaused: boolean
  // Argument strength (last scored)
  lastArgumentScores: ArgumentScores | null
  // Adaptive difficulty
  adaptiveDifficulty: string | null
  // Rapid fire timer
  rapidFireTimeLeft: number

  setCurrentDebate: (debate: Debate | null) => void
  addMessage: (message: DebateMessage) => void
  setMessages: (messages: DebateMessage[]) => void
  setTyping: (typing: boolean) => void
  setLoading: (loading: boolean) => void
  setActiveFallacy: (fallacy: Fallacy | null) => void
  setPaused: (paused: boolean) => void
  setLastArgumentScores: (scores: ArgumentScores | null) => void
  setAdaptiveDifficulty: (d: string | null) => void
  setRapidFireTimeLeft: (t: number) => void
  clearDebate: () => void
}

export const useDebateStore = create<DebateStore>((set) => ({
  currentDebate:        null,
  messages:             [],
  isTyping:             false,
  isLoading:            false,
  activeFallacy:        null,
  isPaused:             false,
  lastArgumentScores:   null,
  adaptiveDifficulty:   null,
  rapidFireTimeLeft:    60,

  setCurrentDebate:       (debate)  => set({ currentDebate: debate }),
  addMessage:             (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages:            (messages) => set({ messages }),
  setTyping:              (typing)  => set({ isTyping: typing }),
  setLoading:             (loading) => set({ isLoading: loading }),
  setActiveFallacy:       (fallacy) => set({ activeFallacy: fallacy }),
  setPaused:              (paused)  => set({ isPaused: paused }),
  setLastArgumentScores:  (scores)  => set({ lastArgumentScores: scores }),
  setAdaptiveDifficulty:  (d)       => set({ adaptiveDifficulty: d }),
  setRapidFireTimeLeft:   (t)       => set({ rapidFireTimeLeft: t }),
  clearDebate: () => set({
    currentDebate:       null,
    messages:            [],
    isTyping:            false,
    activeFallacy:       null,
    isPaused:            false,
    lastArgumentScores:  null,
    adaptiveDifficulty:  null,
    rapidFireTimeLeft:   60,
  }),
}))
