import { test, expect } from '@playwright/test'

test('login correcto redirige al catalogo', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@quickshop.com')
  await page.locator('input[type="password"]').fill('Admin1234!')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL('/')
})

test('login incorrecto muestra mensaje de error', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('noexiste@example.com')
  await page.locator('input[type="password"]').fill('Wrongpass1')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.locator('p.text-red-600')).toBeVisible()
})

test('registro nuevo usuario redirige al catalogo', async ({ page }) => {
  const email = `test_${Date.now()}@example.com`
  await page.goto('/register')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill('Test1234!')
  await page.getByRole('button', { name: 'Crear cuenta' }).click()
  await expect(page).toHaveURL('/')
})
