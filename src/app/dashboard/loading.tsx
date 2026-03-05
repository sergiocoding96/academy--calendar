export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        <p className="text-sm text-stone-500">Loading dashboard...</p>
      </div>
    </div>
  )
}
