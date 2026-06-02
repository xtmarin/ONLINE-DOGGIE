import { test, expect } from '@playwright/test';

test('carga pagina principal', async ({ page }) => {

  await page.goto(
    'http://127.0.0.1:5500/frontend/index.html'
  );

  await expect(
    page.getByText('Bienvenido a Online Doggie')
  ).toBeVisible();

});

test('existe formulario contacto', async ({ page }) => {

  await page.goto(
    'http://127.0.0.1:5500/frontend/index.html'
  );

  await expect(
    page.locator('#form-contacto')
  ).toBeVisible();

});

test('existe formulario boletin', async ({ page }) => {

  await page.goto(
    'http://127.0.0.1:5500/frontend/index.html'
  );

  await expect(
    page.locator('#form-boletin')
  ).toBeVisible();

});