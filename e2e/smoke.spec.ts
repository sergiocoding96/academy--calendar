import { test, expect } from '@playwright/test'

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/Academy|Calendar|Login/i)
  // Check for the login form heading and inputs
  await expect(page.getByText('Welcome back')).toBeVisible()
})

test('register page loads', async ({ page }) => {
  await page.goto('/register')
  await expect(page.getByText('Create account')).toBeVisible()
  await expect(page.locator('form')).toBeVisible()
})

test('unauthenticated user redirected from coach dashboard', async ({ page }) => {
  await page.goto('/dashboard/coach')
  // Should redirect to login
  await expect(page).toHaveURL(/login/)
})

test('unauthenticated user redirected from player dashboard', async ({ page }) => {
  await page.goto('/dashboard/player')
  await expect(page).toHaveURL(/login/)
})
