import { setupCommonMocks } from '../support/mockApis';

describe('Catalog search', () => {
  beforeEach(() => setupCommonMocks());

  it('shows matching suggestions for a typo and retains them on the results page', () => {
    cy.visit('/');
    cy.get('nav input[placeholder*="Search"]').type('pokamon');
    cy.wait('@searchProducts').its('request.url').should('include', 'q=pokamon');
    cy.get('nav').contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.get('nav input[placeholder*="Search"]').type('{enter}');
    cy.location('search').should('include', 'q=pokamon');
    cy.contains('h1', 'pokamon');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.contains('Blue-Eyes White Dragon 1st Edition').should('not.exist');
  });

  it('uses the same search for Thai synonyms', () => {
    cy.visit('/search?q=%E0%B9%82%E0%B8%9B%E0%B9%80%E0%B8%81%E0%B8%A1%E0%B8%AD%E0%B8%99');
    cy.wait('@searchProducts');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
  });

  it('keeps relevance ordering while allowing price and game filters', () => {
    cy.intercept('GET', '**/api/products/catalog?*', {
      body: {
        items: [
        { id: 1, name: 'Exact Pokemon', game: 'Pokemon', type: 'Single', price: 500, source: 'OFFICIAL' },
        { id: 2, name: 'Fuzzy Pokamon', game: 'Pokemon', type: 'Single', price: 100, source: 'OFFICIAL' },
        { id: 3, name: 'Other game card', game: 'One Piece', type: 'Single', price: 200, source: 'OFFICIAL' },
        ],
        page: 0,
        pageSize: 24,
        totalItems: 3,
        totalPages: 1,
        sort: 'newest',
      },
    });
    cy.visit('/search?q=pokemon');
    cy.contains('Exact Pokemon').should('be.visible').then(($exact) => {
      cy.contains('Fuzzy Pokamon').then(($fuzzy) => {
        expect($exact[0].compareDocumentPosition($fuzzy[0]) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
      });
    });
    cy.contains('button', 'Sort by').click();
    cy.contains('button', 'Price: Low to High').click();
    cy.contains('Fuzzy Pokamon').then(($fuzzy) => {
      cy.contains('Exact Pokemon').then(($exact) => {
        expect($fuzzy[0].compareDocumentPosition($exact[0]) & Node.DOCUMENT_POSITION_FOLLOWING).to.not.equal(0);
      });
    });
    cy.contains('button', 'Game:').click();
    cy.contains('button', 'One Piece').click();
    cy.contains('Other game card').should('be.visible');
    cy.contains('Exact Pokemon').should('not.exist');
  });

  it('does not show stale suggestions after a newer query', () => {
    cy.intercept('GET', '**/api/products/search*', (request) => {
      if (request.query.q === 'old') {
        request.reply({ delay: 1200, body: [{ id: 1, name: 'Old result', game: 'Old', type: 'Single' }] });
      } else {
        request.reply({ body: [{ id: 2, name: 'New result', game: 'New', type: 'Single' }] });
      }
    }).as('delayedSearch');
    cy.visit('/');
    cy.get('nav input[placeholder*="Search"]').type('old');
    cy.wait(400);
    cy.get('nav input[placeholder*="Search"]').clear().type('new');
    cy.get('nav').contains('New result').should('be.visible');
    cy.wait(1400);
    cy.get('nav').contains('Old result').should('not.exist');
  });
});
