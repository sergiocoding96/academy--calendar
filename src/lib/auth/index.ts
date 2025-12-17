import { redirect } from 'next/navigation'

// Simplified auth helpers for guest-only mode
// These functions return null/redirect since there's no real authentication

export async function getUser() {
  return null
}

export async function getUserProfile() {
  return null
}

export async function requireAuth() {
  // In guest-only mode, redirect to home if not authenticated
  redirect('/')
}

export async function requireRole(allowedRoles: string[]) {
  // In guest-only mode, redirect to home
  redirect('/')
}

export async function signOut() {
  redirect('/')
}
