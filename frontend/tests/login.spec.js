import { test, expect } from '@playwright/test';

test('login correcto', async ({ page }) => {

  await page.goto('http://127.0.0.1:5500/frontend/Login.html');

  // esperar inputs
  await page.waitForSelector('#email');

  // llenar login
  await page.fill('#email', 'Admin@gmail.com');

  await page.fill('#password', 'admin');

  // enviar formulario
  await page.click('#btn-login');

  // esperar navegación
  await page.waitForTimeout(3000);

  // verificar que NO seguimos en login
  await expect(page).not.toHaveURL(/Login.html/i);

});