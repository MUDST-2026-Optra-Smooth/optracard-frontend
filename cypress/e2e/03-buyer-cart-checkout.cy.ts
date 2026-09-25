import { setupCommonMocks } from '../support/mockApis';

describe('Buyer Profile, Cart & Checkout Journey', () => {
  beforeEach(() => {
    setupCommonMocks();
  });

  it('redirects unauthenticated user to login when accessing protected pages', () => {
    cy.clearLocalStorage();
    cy.visit('/cart');
    cy.url().should('include', '/login');

    cy.visit('/profile');
    cy.url().should('include', '/login');

    cy.visit('/order-history');
    cy.url().should('include', '/login');
  });

  it('displays user profile and allows editing information', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/profile');

    cy.contains('somchai').should('be.visible');
    cy.contains('somchai@optracard.com').should('be.visible');

    // Click edit profile button
    cy.get('button[aria-label="Edit profile"]').click();
    cy.url().should('include', '/profile/edit');
    cy.get('input[name="phone"], input[type="tel"]').first().should('exist');
  });

  it('manages cart items and initiates checkout modal', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/cart');

    // Verify cart items loaded from mock
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
    cy.contains('Charizard VMAX Shiny Secret Rare').should('be.visible');
    cy.contains(/259,000|฿259,000/i).should('be.visible');

    // Click Place Order button to open checkout modal
    cy.contains('button', /Place Order/i).click();

    // Verify Checkout modal opens with shipping & payment options
    cy.contains(/Checkout|Shipping & Payment/i).should('be.visible');
    cy.contains(/Cash Payment/i).should('exist');
    cy.contains(/Credit Card/i).should('exist');
    cy.contains(/QR Payment/i).should('exist');
  });

  it('completes checkout and navigates to payment success page', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/cart');

    // Open checkout
    cy.contains('button', /Place Order/i).click();

    // Select QR Payment
    cy.contains(/QR Payment/i).click();

    // Confirm order
    cy.contains('button', /Confirm Order/i).click();

    // Should navigate to /payment-success
    cy.url().should('include', '/payment-success');
    cy.contains(/Payment Successful|Order Confirmed|Thank you/i).should('be.visible');

    // Has button to return home or order history
    cy.contains(/Back to Home|Continue Shopping|Order History/i).should('be.visible');
  });

  it('views order history and order details', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/order-history');

    cy.contains(/Order History|My Orders/i).should('be.visible');
    cy.contains('ORD-2026-001').should('be.visible');

    // Navigate to order detail
    cy.visit('/order-history/ORD-2026-001');
    cy.contains('ORD-2026-001').should('be.visible');
    cy.contains('Pikachu Illustrator Promo Card').should('be.visible');
  });
});
