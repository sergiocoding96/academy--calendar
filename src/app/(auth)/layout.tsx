export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-500 rounded-2xl shadow-lg mb-4">
            <span className="text-white text-2xl font-bold">ST</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-800">SotoTennis Academy</h1>
          <p className="text-stone-500 mt-1">Tennis Academy Management System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-stone-200">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stone-500 mt-6">
          &copy; {new Date().getFullYear()} SotoTennis Academy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
