import { Navigation } from '@/components/ui/navigation'
import { Settings, Database, Palette, Bell, Shield } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      <Navigation />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-stone-800">Settings</h1>
          <p className="text-stone-500 mt-1">Configure courts, session types, and system preferences</p>
        </div>

        <div className="space-y-6">
          {/* Database Connection */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Database Connection</h2>
                  <p className="text-sm text-stone-500">Supabase configuration</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Supabase URL</label>
                  <input
                    type="text"
                    placeholder="https://your-project.supabase.co"
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                  <p className="text-xs text-stone-500 mt-1">Set via NEXT_PUBLIC_SUPABASE_URL environment variable</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Connection Status</label>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="text-sm text-stone-600">Checking connection...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courts Configuration */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Courts</h2>
                  <p className="text-sm text-stone-500">Manage available courts</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: 'HC 1', surface: 'Hard' },
                  { name: 'HC 2', surface: 'Hard' },
                  { name: 'Clay 1', surface: 'Clay' },
                  { name: 'Clay 2', surface: 'Clay' },
                  { name: 'Clay 3', surface: 'Clay' },
                  { name: 'HC 3', surface: 'Hard' },
                ].map((court) => (
                  <div
                    key={court.name}
                    className="p-4 rounded-xl border border-stone-200 hover:border-green-300 hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <div className="font-semibold text-stone-800">{court.name}</div>
                    <div className="text-xs text-stone-500">{court.surface}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Appearance</h2>
                  <p className="text-sm text-stone-500">Customize the look and feel</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-stone-500 text-sm">Coming soon: Theme customization, coach colors, and more.</p>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-800">Notifications</h2>
                  <p className="text-sm text-stone-500">Configure alerts and reminders</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-stone-500 text-sm">Coming soon: Email notifications, tournament deadline reminders.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
