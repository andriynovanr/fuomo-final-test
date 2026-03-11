import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  // elemen UI utama
  readonly logo: Locator;
  readonly header: Locator;
  readonly heroHeading: Locator;
  readonly heroDescription: Locator;
  readonly footer: Locator;

  // nav links — desktop pakai aria-label "Go to Creators", mobile cuma "Creators"
  readonly linkCreatorsDesktop: Locator;
  readonly linkCreatorsMobile: Locator;

  constructor(page: Page) {
    this.page = page;

    // logo di header: alt text exact "FUOMO" — scope ke header biar gak match logo footer
    this.logo = page.locator('header').first().getByRole('img', { name: 'FUOMO', exact: true });

    // navbar: website pakai <header>
    this.header = page.locator('header').first();

    // hero section: heading h1 + deskripsi paragraph
    this.heroHeading = page.getByRole('heading', { name: /create/i, level: 1 });
    this.heroDescription = page.getByText('FUOMO membantu kreator', { exact: false });

    this.footer = page.locator('footer');

    // desktop: "Go to Creators" (link teks + icon, hidden di mobile via CSS)
    // mobile: "Creators" (icon only, hidden di desktop via CSS)
    this.linkCreatorsDesktop = page.getByRole('link', { name: /go to creators/i });
    this.linkCreatorsMobile = page.getByRole('link', { name: 'Creators', exact: true });
  }

  async goto() {
    return await this.page.goto('/');
  }

  // .or() otomatis pilih yang visible di viewport aktif
  async navigateToCreators() {
    await this.linkCreatorsDesktop.or(this.linkCreatorsMobile).click();
  }
}
