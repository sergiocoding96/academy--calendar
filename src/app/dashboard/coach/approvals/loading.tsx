export default function ApprovalsLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="h-8 w-48 rounded bg-stone-200 mb-2" />
          <div className="h-4 w-64 rounded bg-stone-100" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-stone-200" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-stone-100" />
        ))}
      </div>
    </div>
  )
}
