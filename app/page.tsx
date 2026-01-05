'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Send,
  Loader2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Home,
  Phone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Constants
const AGENT_ID = '695bc26e457887dd859fb19f'

// Types
interface Message {
  id: string
  type: 'user' | 'agent'
  content: string
  timestamp: Date
}

interface AgentResponse {
  message?: string
  status?: string
  error?: string
  [key: string]: any
}

// Suggested questions for quick replies
const SUGGESTED_QUESTIONS = [
  'How can I reset my password?',
  'What is your return policy?',
  'How do I track my order?',
]

// Helper: Calculate relative time
function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString()
}

// Component: Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
      </div>
      <span className="text-sm text-gray-400 ml-2">Agent is typing...</span>
    </div>
  )
}

// Component: Message Bubble
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.type === 'user'

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {/* Agent Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
          <MessageCircle size={16} className="text-white" />
        </div>
      )}

      {/* Message Content */}
      <div className={cn('max-w-xs lg:max-w-md xl:max-w-lg', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-lg px-4 py-3 break-words',
            isUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-700 text-gray-100 rounded-bl-none'
          )}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-gray-400 mt-1 px-2">
          {getRelativeTime(message.timestamp)}
        </span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
          <span className="text-xs font-semibold text-white">U</span>
        </div>
      )}
    </div>
  )
}

// Component: Quick Reply Chips
function QuickReplyChips({ onSelect }: { onSelect: (question: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 px-6 py-4 border-t border-gray-700">
      {SUGGESTED_QUESTIONS.map((question, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(question)}
          className="px-3 py-2 bg-gray-700 text-blue-400 border border-gray-600 rounded-full text-sm hover:bg-gray-600 transition-colors"
        >
          {question}
        </button>
      ))}
    </div>
  )
}

// Component: Welcome Message
function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
        <MessageCircle size={32} className="text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">Welcome to Support</h2>
      <p className="text-gray-400 mb-6">
        Hi there! How can we help you today? Feel free to ask any questions about our products and services.
      </p>

      {/* Suggested Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-2xl">
        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Home size={18} className="text-blue-400" />
            <h3 className="font-semibold text-gray-100">Getting Started</h3>
          </div>
          <p className="text-sm text-gray-400">Learn about our basic features and how to get started</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 text-left">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={18} className="text-blue-400" />
            <h3 className="font-semibold text-gray-100">FAQs</h3>
          </div>
          <p className="text-sm text-gray-400">Find answers to frequently asked questions</p>
        </div>

        <div className="p-4 bg-gray-700 rounded-lg border border-gray-600 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={18} className="text-blue-400" />
            <h3 className="font-semibold text-gray-100">Contact Us</h3>
          </div>
          <p className="text-sm text-gray-400">Get in touch with our support team</p>
        </div>
      </div>
    </div>
  )
}

// Component: Chat Header
function ChatHeader({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <MessageCircle size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Customer Support</h1>
          <p className="text-xs text-gray-400">We're here to help</p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        aria-label={isExpanded ? 'Minimize' : 'Expand'}
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>
    </div>
  )
}

// Main Chat Page Component
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Send message handler
  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      // Call agent API
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: AGENT_ID,
          message: messageContent,
        }),
      })

      const data = await response.json()

      if (data.success && data.response) {
        // Extract message from response
        let agentMessage = ''

        const agentResponse: AgentResponse = data.response

        // Try multiple ways to extract the message
        if (agentResponse.message) {
          agentMessage = agentResponse.message
        } else if (agentResponse.response && typeof agentResponse.response === 'string') {
          agentMessage = agentResponse.response
        } else if (agentResponse.answer) {
          agentMessage = agentResponse.answer
        } else if (agentResponse.result) {
          agentMessage =
            typeof agentResponse.result === 'string'
              ? agentResponse.result
              : JSON.stringify(agentResponse.result, null, 2)
        } else if (data.raw_response) {
          agentMessage = data.raw_response
        } else {
          agentMessage = JSON.stringify(agentResponse, null, 2)
        }

        const agentMsg: Message = {
          id: `agent-${Date.now()}`,
          type: 'agent',
          content: agentMessage || 'I apologize, but I could not generate a response. Please try again.',
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, agentMsg])
      } else {
        setError(data.error || 'Failed to get response from support agent')
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          type: 'agent',
          content: `I apologize, but I encountered an error: ${data.error || 'Unknown error'}. Please try again later.`,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    } catch (err) {
      const errorText = err instanceof Error ? err.message : 'Network error occurred'
      setError(errorText)
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        type: 'agent',
        content: `I apologize, but I encountered a network error. Please check your connection and try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  // Handle quick reply selection
  const handleQuickReply = (question: string) => {
    handleSendMessage(question)
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-screen md:h-[600px] md:max-h-[600px] bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col border border-gray-700">
        {/* Header */}
        <ChatHeader isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />

        {/* Chat Content - Conditionally rendered based on expansion */}
        {isExpanded && (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {messages.length === 0 && !isLoading && <WelcomeMessage />}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isLoading && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies - Show only if no messages yet */}
            {messages.length === 0 && !isLoading && <QuickReplyChips onSelect={handleQuickReply} />}

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-700 px-6 py-4 bg-gray-900"
            >
              {error && (
                <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-200">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="text-xs text-red-300 hover:text-red-200 mt-1 font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-700 text-gray-100 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    'px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors',
                    isLoading || !input.trim()
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
