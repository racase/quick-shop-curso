import { test, expect } from '@playwright/test'

const API_URL = 'http://localhost:8000'

test('login correcto redirige al home y muestra el nombre del usuario', async ({ page }) => {
  await page.route(`${API_URL}/auth/login`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: 'fake-token-123' }),
    })
  )

  await page.route(`${API_URL}/auth/me`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, email: 'ana@example.com', full_name: 'Ana García', role: 'user' }),
    })
  )

  await page.goto('/login')
  await page.fill('input[type="email"]', 'ana@example.com')
  await page.fill('input[type="password"]', 'contraseña123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/')
  await expect(page.getByText('Ana García')).toBeVisible()
})

test('login incorrecto muestra mensaje de error', async ({ page }) => {
  await page.route(`${API_URL}/auth/login`, (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Incorrect email or password' }),
    })
  )

  await page.goto('/login')
  await page.fill('input[type="email"]', 'usuario@example.com')
  await page.fill('input[type="password"]', 'mal-password')
  await page.click('button[type="submit"]')

  await expect(page.getByText('Incorrect credentials. Please try again.')).toBeVisible()
  await expect(page).toHaveURL('/login')
})

test('registro correcto redirige a la página de login', async ({ page }) => {
  await page.route(`${API_URL}/auth/register`, (route) =>
    route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ id: 2, email: 'nuevo@example.com', full_name: 'Nuevo Usuario' }),
    })
  )

  await page.goto('/register')
  await page.fill('input[name="full_name"]', 'Nuevo Usuario')
  await page.fill('input[name="email"]', 'nuevo@example.com')
  await page.fill('input[name="password"]', 'contraseña123')
  await page.fill('input[name="confirm"]', 'contraseña123')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/login')
})
