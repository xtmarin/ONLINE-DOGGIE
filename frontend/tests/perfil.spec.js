import { test, expect } from '@playwright/test';

async function login(page) {

  await page.goto(
    'http://127.0.0.1:5500/frontend/Login.html'
  );

  await page.fill(
    '#email',
    'Admin@gmail.com'
  );

  await page.fill(
    '#password',
    'admin'
  );

  await page.locator(
    '#form-login button[type="submit"]'
  ).click();

  await expect(page).toHaveURL(
    /admin\.html/i
  );
}

test('perfil carga informacion usuario', async ({ page }) => {

  await login(page);

  await page.goto(
    'http://127.0.0.1:5500/frontend/perfil.html'
  );

  await expect(
    page.locator('#perfil-nombre')
  ).not.toHaveText('');

  await expect(
    page.locator('#perfil-email')
  ).not.toHaveText('');

  await expect(
    page.locator('#perfil-rol')
  ).not.toHaveText('');

});

test('usuario actualiza direccion', async ({ page }) => {

  await login(page);

  await page.goto(
    'http://127.0.0.1:5500/frontend/perfil.html'
  );

  await page.fill(
    '#input-direccion',
    'Direccion Test Playwright'
  );

  await page.once('dialog', d => d.accept());

  await page.getByRole('button', {
    name: /actualizar dirección/i
  }).click();

  await expect(
    page.locator('#mensaje-direccion')
  ).toContainText('guardada');

});

test('usuario actualiza perfil', async ({ page }) => {

  await login(page);

  await page.goto(
    'http://127.0.0.1:5500/frontend/perfil.html'
  );

  await page.fill(
    '#edit-nombre',
    'Administrador'
  );

  page.on('dialog', dialog => dialog.accept());

  await page.locator(
    '#form-editar-perfil button[type="submit"]'
  ).click();

  await page.waitForTimeout(2000);

});

test('usuario puede cerrar sesion', async ({ page }) => {

  await login(page);

  await page.goto(
    'http://127.0.0.1:5500/frontend/perfil.html'
  );

  await page.click('#logout-btn');

  await expect(page).toHaveURL(
    /Login\.html/i
  );

});