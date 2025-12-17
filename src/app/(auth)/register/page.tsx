import { RegisterForm } from '@/components/auth/register-form'

export const metadata = {
  title: 'Register | SotoTennis Academy',
  description: 'Create your SotoTennis Academy account',
}

export default function RegisterPage() {
  return (
    <>
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Create account</h2>
      <p className="text-stone-500 mb-6">Join the SotoTennis Academy community</p>
      <RegisterForm />
    </>
  )
}
