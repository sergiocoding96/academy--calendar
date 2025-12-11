import { Navigation } from '@/components/ui/navigation'
import { Users, UserPlus } from 'lucide-react'

export default function PeoplePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Players & Coaches</h1>
            <p className="text-stone-500 mt-1">Manage player roster, coach profiles, and availability</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <UserPlus className="w-4 h-4" />
            Add Person
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Players Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players
              </h2>
            </div>
            <div className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-stone-500 font-medium">No players yet</p>
                <p className="text-stone-400 text-sm mt-1">
                  Run the import script or add players manually
                </p>
              </div>
            </div>
          </div>

          {/* Coaches Section */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Coaches
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {['Tom P', 'Andris', 'Tomy', 'Sergio', 'DK', 'Joe D', 'Mike D', 'Reece', 'Billy', 'Kate', 'Sophie'].map(
                  (coach) => (
                    <div
                      key={coach}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                        {coach[0]}
                      </div>
                      <div>
                        <div className="font-medium text-stone-800">{coach}</div>
                        <div className="text-xs text-stone-500">Coach</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
