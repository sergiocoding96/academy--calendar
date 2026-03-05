export default function AttendanceLoading() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-200 rounded-xl" />
        <div>
          <div className="h-8 w-48 rounded bg-stone-200 mb-2" />
          <div className="h-4 w-64 rounded bg-stone-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-stone-100" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-stone-100" />
    </div>
  )
}
