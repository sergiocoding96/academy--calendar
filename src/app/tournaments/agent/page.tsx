import { Metadata } from 'next'
import { Navigation } from '@/components/ui/navigation'
import { AgentChat } from '@/components/agent/chat'

export const metadata: Metadata = {
  title: 'Tournament Assistant | Soto Tennis Academy',
  description:
    'AI-powered tournament assistant for finding events, getting recommendations, and managing tournament schedules.',
}

export default function TournamentAgentPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden h-[calc(100vh-140px)]">
          <AgentChat />
        </div>
      </main>
    </div>
  )
}
