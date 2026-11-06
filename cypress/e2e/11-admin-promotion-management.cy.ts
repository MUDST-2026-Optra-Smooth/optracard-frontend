import { setupCommonMocks } from '../support/mockApis';

const promotion = {
  id: 7, code: 'SAVE10', name: 'Welcome discount', discountType: 'PERCENTAGE', discountValue: 10,
  minimumOrderAmount: 500, usageLimit: null, usageCount: 0,
  startsAt: '2026-01-01T00:00:00', endsAt: '2030-12-31T23:59:00', active: true,
};

describe('Admin promotion management', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
  });

  it('creates a promotion with an uppercase code and displays it immediately', () => {
    cy.intercept('GET', '**/api/admin/promotions', []).as('getPromotions');
    cy.intercept('POST', '**/api/admin/promotions', (request) => {
      expect(request.body).to.include({ code: 'SAVE10', name: 'Welcome discount', discountType: 'PERCENTAGE' });
      request.reply(promotion);
    }).as('createPromotion');

    cy.visit('/admin/promotions');
    cy.wait('@getPromotions');
    cy.contains('No promotions yet').should('be.visible');
    cy.contains('label', 'Code').find('input').type('save10');
    cy.contains('label', 'Promotion name').find('input').type('Welcome discount');
    cy.contains('button', 'Create promotion').click();
    cy.wait('@createPromotion');
    cy.contains('Promotion created.').should('be.visible');
    cy.contains('SAVE10').should('be.visible');
    cy.contains('Welcome discount').should('be.visible');
  });

  it('removes a promotion only after confirmation', () => {
    cy.intercept('GET', '**/api/admin/promotions', [promotion]).as('getPromotions');
    cy.intercept('DELETE', '**/api/admin/promotions/7', { statusCode: 204, body: '' }).as('deletePromotion');
    cy.window().then((window) => cy.stub(window, 'confirm').returns(true));

    cy.visit('/admin/promotions');
    cy.wait('@getPromotions');
    cy.get('button[title="Delete SAVE10"]').click();
    cy.wait('@deletePromotion');
    cy.contains('Promotion deleted.').should('be.visible');
    cy.contains('SAVE10').should('not.exist');
  });
});
