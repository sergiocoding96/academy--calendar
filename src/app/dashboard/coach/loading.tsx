export default function CoachLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8 h-8 w-64 rounded bg-stone-200" />
      <div className="mb-4 h-4 w-full max-w-md rounded bg-stone-100" />
      <div className="mb-4 h-4 w-full max-w-lg rounded bg-stone-100" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-stone-100" />
        ))}
      </div>
    </div>
  )
}
