export default function SessionsLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8 h-8 w-48 rounded bg-stone-200" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-stone-100 h-32" />
        ))}
      </div>
    </div>
  )
}
