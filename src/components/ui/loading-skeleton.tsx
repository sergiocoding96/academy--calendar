import { cn } from '@/lib/utils'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-stone-200 rounded', className)}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
      <div className="p-4 border-b border-stone-200">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="divide-y divide-stone-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-xl border border-stone-200">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Content */}
      <div className="mt-6">
        <TableSkeleton />
      </div>
    </div>
  )
}
