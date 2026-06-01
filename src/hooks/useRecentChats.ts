import { useCallback, useEffect, useState } from 'react'
import type { Chat, ChatMessage } from '../types'
import { generateId, loadJson, saveJson, STORAGE_KEYS } from '../utils/storage'

const MAX_CHATS = 5

export function useRecentChats() {
  const [chats, setChats] = useState<Chat[]>(() =>
    loadJson<Chat[]>(STORAGE_KEYS.recentChats, []),
  )

  useEffect(() => {
    saveJson(STORAGE_KEYS.recentChats, chats.slice(0, MAX_CHATS))
  }, [chats])

  const saveChat = useCallback((messages: ChatMessage[], jobId?: string, title?: string) => {
    if (messages.length === 0) return
    const firstUser = messages.find((m) => m.role === 'user')
    const chatTitle = title || firstUser?.content.slice(0, 40) || 'Chat with Nudge'
    const chat: Chat = {
      id: generateId(),
      title: chatTitle,
      messages,
      jobId,
      updatedAt: Date.now(),
    }
    setChats((prev) => [chat, ...prev.filter((c) => c.jobId !== jobId)].slice(0, MAX_CHATS))
  }, [])

  const clearChats = useCallback(() => {
    setChats([])
    localStorage.removeItem(STORAGE_KEYS.recentChats)
  }, [])

  return { chats, saveChat, clearChats }
}
