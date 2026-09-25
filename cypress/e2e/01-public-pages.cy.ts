import { setupCommonMocks } from '../support/mockApis';

describe('Public & Marketplace Pages', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  it('loads the Home page with Navbar, hero, catalog sections and Footer', () => {
    cy.visit('/');
    cy.get('nav').should('exist');
    cy.contains(/Optracard/i).should('be.visible');

    // Verify search input in hero or navbar
    cy.get('input[placeholder*="Search" i]').first().should('be.visible');

    // Wait for catalog products to be displayed
    cy.contains('Pikachu Illustrator Promo Card', { timeout: 10000 }).should('be.visible');

    // Verify footer
    cy.get('footer').should('exist');
  });

  it('performs search and navigates to search results page', () => {
    cy.visit('/');
    cy.get('input[placeholder*="Search" i]').first().type('Pokemon{enter}');
    cy.url().should('include', '/search');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
  });

  it('navigates to Optracard Official Store (ViewAllOOS)', () => {
    cy.visit('/ViewAllOOS');
    cy.contains(/Official Store/i).should('be.visible');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
  });

  it('navigates to Marketplace & Trading Cards (ViewAllTrading)', () => {
    cy.visit('/ViewAllTrading');
    cy.contains(/Marketplace|Trading/i).should('be.visible');
    cy.contains('Charizard VMAX Shiny Secret Rare').should('be.visible');
  });

  it('loads the About Us page', () => {
    cy.visit('/about');
    cy.contains(/About/i).should('be.visible');
  });

  it('loads the Our Team page', () => {
    cy.visit('/team');
    cy.contains(/Team/i).should('be.visible');
  });

  it('loads single Product Detail page and displays card info', () => {
    cy.visit('/product/1');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.contains(/Pokemon/i).should('be.visible');
    cy.contains(/250,000|฿250,000/i).should('be.visible');
    cy.contains(/Add to cart|Buy now|In stock/i).should('exist');
  });
});
