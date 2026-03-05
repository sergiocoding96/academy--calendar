export default function PlayersLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8 h-8 w-48 rounded bg-stone-200" />
      <div className="mb-6 h-4 w-72 rounded bg-stone-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-stone-100" />
        ))}
      </div>
    </div>
  )
}
