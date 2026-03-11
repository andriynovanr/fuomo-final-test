# Fuomo QA Automation - Final Test

Automated test suite untuk homepage [fe-stage.fuomo.id](https://fe-stage.fuomo.id) menggunakan **Playwright** + **TypeScript**.

---

## Setup Project

```bash
# clone repo
git clone <repo-url>
cd fuomo-final-test

# install dependencies
npm install

# install browser engines Playwright
npx playwright install --with-deps
```

> **Note:** Pastikan Node.js versi LTS sudah terinstall. Cek dengan `node -v`.

---

## Struktur Project

```
fuomo-final-test/
├── pages/
│   └── home.page.ts          ← Page Object Model (locator & method)
├── tests/
│   └── home.spec.ts           ← Test scenarios
├── .github/
│   └── workflows/
│       └── playwright.yml     ← CI pipeline GitHub Actions
├── playwright.config.ts       ← Konfigurasi Playwright
├── tsconfig.json              ← Konfigurasi TypeScript
├── package.json               ← Dependency & npm scripts
├── .gitignore
└── README.md
```

---

## Menjalankan Test Secara Lokal

Bisa pakai npm scripts yang sudah disediakan:

```bash
# jalankan semua test (semua browser + mobile viewport)
npm test

# jalankan test di satu browser aja (chromium)
npm run test:chromium

# jalankan test cuma yang mobile
npm run test:mobile

# mode headed (biar keliatan browser-nya)
npm run test:headed

# buka HTML report setelah test selesai
npm run report
```

Atau langsung pakai perintah Playwright:

```bash
npx playwright test
npx playwright test --project=chromium
npx playwright show-report
```

Test akan otomatis menggunakan `BASE_URL` dari environment variable. Kalau tidak di-set, default-nya ke `https://fe-stage.fuomo.id`.

```bash
# override base URL kalau perlu (Linux/Mac)
BASE_URL=https://custom-url.example.com npx playwright test

# di Windows PowerShell
$env:BASE_URL="https://custom-url.example.com"; npx playwright test
```

---

## CI Pipeline (GitHub Actions)

File workflow ada di `.github/workflows/playwright.yml`. Pipeline ini jalan otomatis setiap:

- **Push** ke branch `main` atau `master`
- **Pull request** ke branch `main` atau `master`

### Apa yang dilakukan CI:

1. **Checkout** source code
2. **Install dependencies** via `npm ci`
3. **Install Playwright browsers** (Chromium, Firefox, WebKit)
4. **Jalankan semua test** (`npx playwright test`)
5. **Upload artifacts** — HTML Report dan JUnit Report bisa di-download dari tab Actions di GitHub

### Artifacts yang dihasilkan:

| Artifact                  | Deskripsi                                        |
| ------------------------- | ------------------------------------------------ |
| `playwright-html-report`  | Report visual interaktif, bisa dibuka di browser |
| `playwright-junit-report` | Format XML standar, bisa di-parse CI tools lain  |

---

## Strategi Testing

### Page Object Model (POM)

Semua locator dan method interaksi halaman dikumpulkan di `pages/home.page.ts`. Test file (`tests/home.spec.ts`) tinggal pakai method dari POM — jadi kalau ada perubahan UI, cukup update POM-nya aja, test logic-nya tetap sama.

```
pages/
  home.page.ts    ← locator & method interaksi
tests/
  home.spec.ts    ← skenario test
```

### Strategi Locator yang Stabil

Urutan prioritas locator yang dipakai:

1. **`getByRole()`** — paling stabil, berbasis accessibility role (misal `getByRole('img', { name: 'FUOMO' })`, `getByRole('heading', { level: 1 })`)
2. **`getByText()`** — untuk identifikasi elemen berdasarkan teks unik yang visible di halaman
3. **Semantic HTML selectors** — `page.locator('header')`, `page.locator('footer')` untuk elemen yang pakai tag semantik

**Yang dihindari:** XPath, CSS selector yang fragile, index-based selector, `waitForTimeout()`.

### Auto-Waiting & No `waitForTimeout()`

- Tidak ada `waitForTimeout()` di seluruh codebase
- Semua assertion pakai auto-waiting bawaan Playwright (`toBeVisible()`, `toHaveURL()`, `toHaveTitle()`)
- Navigasi di-verify lewat `expect(page).toHaveURL()` yang otomatis nunggu URL berubah

### Screenshot on Failure

- Konfigurasi `screenshot: 'only-on-failure'` di `playwright.config.ts`
- Kalau test gagal, Playwright otomatis ambil screenshot dan simpan di `test-results/`
- Berguna untuk debugging, terutama di CI yang headless

### Parallel Testing

- `fullyParallel: true` di config — test files dan test cases bisa jalan paralel
- Di CI, workers di-set ke 1 untuk stabilitas (env staging, shared resource)
- Di lokal, workers unlimited supaya lebih cepat

### Responsive Testing (Desktop & Mobile)

Test yang sama jalan di 5 viewport berbeda lewat Playwright projects:

| Project         | Device          | Tipe    |
| --------------- | --------------- | ------- |
| `chromium`      | Desktop Chrome  | Desktop |
| `firefox`       | Desktop Firefox | Desktop |
| `webkit`        | Desktop Safari  | Desktop |
| `Mobile Chrome` | Pixel 5         | Mobile  |
| `Mobile Safari` | iPhone 12       | Mobile  |

Tidak perlu test code terpisah untuk tiap viewport — cukup konfigurasi `projects` di `playwright.config.ts`.

---

## Test Scenarios

| #   | Skenario            | Yang Divalidasi                                                              |
| --- | ------------------- | ---------------------------------------------------------------------------- |
| 1   | Homepage accessible | HTTP response 200, page title mengandung "FUOMO"                             |
| 2   | Elemen UI utama     | Logo (`img[alt=FUOMO]`), Header, Hero heading + description, Footer          |
| 3   | Navigation link     | Klik link Creators → URL berubah ke `/creators`, halaman tujuan punya title  |
| 4   | Responsive view     | Semua test jalan di Desktop + Mobile viewport via Playwright projects config |

---

## Asumsi

Beberapa asumsi yang dibuat karena akses terbatas ke dokumentasi internal:

1. **HTML structure** — Website pakai `<header>` dan `<footer>` tapi tidak pakai `<nav>`. Area navigasi ada di dalam `<header>` pertama. Konten utama dibungkus `<main>` dengan beberapa `<section>`.

2. **Logo** — Elemen `<img>` dengan alt text `"FUOMO"` (bukan "Logo FUOMO"). Locator pakai `getByRole('img', { name: 'FUOMO' })`.

3. **Navigasi desktop vs mobile** — Desktop menampilkan link dengan tooltip text (aria-label `"Go to Creators"`, `"Go to Marketplace"`, `"Go to Support"`). Mobile menampilkan icon-only link dengan aria-label yang lebih pendek (`"Creators"`, `"Marketplace"`, `"Support"`). Tidak ada hamburger menu — icon tetap visible di mobile. Navigasi ke Creators pakai `.or()` untuk handle perbedaan ini.

4. **Hero section** — Diidentifikasi lewat `<h1>` (heading level 1, berisi teks "CREATE CONNECT GROW") dan `<p>` (berisi "FUOMO membantu kreator..."). Kalau copywriting berubah, locator ini perlu di-update di POM.

5. **SPA behavior** — Website kemungkinan SPA (Next.js). Navigasi antar halaman bisa client-side routing. `toHaveURL()` dari Playwright mendukung kedua skenario.

6. **Staging environment** — `fe-stage.fuomo.id` diasumsikan cukup stabil. Retry 2x di CI untuk handle flakiness network/server.

7. **TypeScript** — `tsconfig.json` di-set `strict: true` dan target `ES2022` sesuai standar modern.
