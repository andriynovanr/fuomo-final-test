import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';

test.describe('Homepage - Fuomo', () => {

  // Scenario 1: homepage bisa diakses tanpa error
  test('homepage load sukses - HTTP 200 dan page title tidak kosong', async ({ page }) => {
    const homePage = new HomePage(page);

    // tangkap response buat cek HTTP status
    const response = await homePage.goto();

    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/FUOMO/);
  });

  // Scenario 2: validasi elemen UI utama	
  test('elemen UI utama muncul di halaman', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await expect(homePage.logo).toBeVisible();
    await expect(homePage.header).toBeVisible();
    await expect(homePage.heroHeading).toBeVisible();
    await expect(homePage.heroDescription).toBeVisible();
    await expect(homePage.footer).toBeVisible();
  });

  // Scenario 3: navigasi link berfungsi
  test('klik navigasi ke halaman Creators berhasil', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await homePage.navigateToCreators();

    await expect(page).toHaveURL(/\/creators/);
    await expect(page).toHaveTitle(/.+/);
  });

  /*
   * Scenario 4: Responsive View (Desktop & Mobile)
   *
   * Dihandle lewat konfigurasi projects di playwright.config.ts.
   * Semua test di atas otomatis jalan di:
   * - Desktop: Chromium, Firefox, WebKit
   * - Mobile: Chrome (Pixel 5) & Safari (iPhone 12)
   *
   * Jadi nggak perlu nulis test terpisah buat tiap viewport,
   * cukup config project-nya aja yang nge-cover.
   */
});
