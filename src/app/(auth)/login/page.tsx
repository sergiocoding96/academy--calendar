import { LoginForm } from '@/components/auth/login-form'
import { Suspense } from 'react'

export const metadata = {
  title: 'Login | SotoTennis Academy',
  description: 'Sign in to your SotoTennis Academy account',
}

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome back</h2>
      <p className="text-stone-500 mb-6">Sign in to your account to continue</p>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </>
  )
}
