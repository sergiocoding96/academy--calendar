import Link from 'next/link'

export default function PlayerNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-5xl font-bold text-stone-300">404</div>
        <h2 className="text-xl font-bold text-stone-800">Page not found</h2>
        <p className="text-stone-500">This page doesn&apos;t exist in the player dashboard.</p>
        <Link
          href="/dashboard/player"
          className="inline-block px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Back to overview
        </Link>
      </div>
    </div>
  )
}
