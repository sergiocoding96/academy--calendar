'use client'

import { Calendar, Users, Trophy, Search, Sparkles } from 'lucide-react'

interface ChatSuggestionsProps {
  onSelect: (suggestion: string) => void
}

const suggestions = [
  {
    icon: Calendar,
    text: 'Show tournaments this month',
    color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
  },
  {
    icon: Users,
    text: 'List all U16 players',
    color: 'text-green-600 bg-green-50 hover:bg-green-100',
  },
  {
    icon: Trophy,
    text: 'Recommend tournaments for Carlos',
    color: 'text-amber-600 bg-amber-50 hover:bg-amber-100',
  },
  {
    icon: Search,
    text: 'Find ITF Junior events in Spain',
    color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
  },
]

export function ChatSuggestions({ onSelect }: ChatSuggestionsProps) {
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-medium text-stone-700">
          Quick actions
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon
          return (
            <button
              key={index}
              onClick={() => onSelect(suggestion.text)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${suggestion.color}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-left">{suggestion.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
