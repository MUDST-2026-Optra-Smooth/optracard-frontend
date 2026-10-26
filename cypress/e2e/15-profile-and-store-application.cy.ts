import { setupCommonMocks } from '../support/mockApis';

describe('Profile and store application', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
  });

  it('loads the profile edit form with existing values', () => {
    cy.visit('/profile/edit');
    cy.get('input[name="username"]').should('have.value', 'somchai');
    cy.get('input[name="email"]').should('have.value', 'somchai@optracard.com');
    cy.contains('button', /Save Changes/i).should('be.visible');
  });

  it('updates the profile and sends the changed address', () => {
    cy.intercept('PUT', '**/api/profile', (request) => {
      expect(request.body).to.include({ username: 'somchai', address: 'New Bangkok Address' });
      request.reply({ statusCode: 200, body: { userId: 1, username: 'somchai', email: 'somchai@optracard.com', address: 'New Bangkok Address' } });
    }).as('updateProfile');
    cy.visit('/profile/edit');
    cy.get('textarea[name="address"]').clear().type('New Bangkok Address');
    cy.contains('button', /Save Changes/i).click();
    cy.wait('@updateProfile');
    cy.contains(/บันทึกข้อมูล|saved|success/i).should('be.visible');
  });

  it('shows an error when profile update fails', () => {
    cy.intercept('PUT', '**/api/profile', { statusCode: 500, body: { message: 'Profile update failed' } }).as('updateProfileFailed');
    cy.visit('/profile/edit');
    cy.get('textarea[name="address"]').clear().type('Broken Address');
    cy.contains('button', /Save Changes/i).click();
    cy.wait('@updateProfileFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('requires store details before moving to the next application step', () => {
    cy.visit('/start-selling');
    cy.contains('button', /^Next$/i).click();
    cy.get('input[name="storeName"]').should('have.attr', 'required');
    cy.get('textarea[name="storeDescription"]').should('have.attr', 'required');
  });

  it('moves from store details to personal details', () => {
    cy.visit('/start-selling');
    cy.get('input[name="storeName"]').type('New Card Store');
    cy.get('textarea[name="storeDescription"]').type('Cards and collectibles');
    cy.contains('button', /^Next$/i).click();
    cy.contains(/Personal Detail/i).should('be.visible');
    cy.get('input[name="ownerFirstName"]').should('be.visible');
  });
});
