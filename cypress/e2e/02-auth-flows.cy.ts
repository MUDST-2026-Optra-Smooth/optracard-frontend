import { setupCommonMocks } from '../support/mockApis';

describe('Authentication & User Registration Flows', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.clearLocalStorage();
  });

  it('renders login page correctly and displays inputs', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('form').contains('button[type="submit"]', /Login/i).should('be.visible');
    cy.contains(/Create an account/i).should('exist');
  });

  it('logs in successfully and redirects to dashboard/home', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('somchai@optracard.com');
    cy.get('input[name="password"]').type('password123');

    cy.get('form').contains('button[type="submit"]', /Login/i).click();
    cy.wait('@authLogin');

    // Should redirect to home and store user in localStorage
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    cy.window().then((win) => {
      const user = JSON.parse(win.localStorage.getItem('user') || '{}');
      expect(user.username).to.eq('somchai');
      expect(win.localStorage.getItem('token')).to.exist;
    });
  });

  it('renders registration page and validates password matching', () => {
    cy.visit('/register');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('input[name="confirmPassword"]').should('be.visible');

    let alertMessage = '';
    cy.on('window:alert', (text) => {
      alertMessage = text;
    });

    // Mismatched passwords
    cy.get('input[name="username"]').type('newuser');
    cy.get('input[name="email"]').type('newuser@example.com');
    cy.get('input[name="phone"]').type('0812345678');
    cy.get('textarea[name="address"]').type('123 Sukhumvit Road, Bangkok');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('mismatch456');
    cy.get('form').contains('button[type="submit"]', /Sign up|Register|Create/i).click().then(() => {
      expect(alertMessage).to.include('Passwords do not match');
    });
  });

  it('allows logging out and clears authentication state', () => {
    cy.loginAs('USER', 'somchai', 'somchai@optracard.com');
    cy.visit('/');

    // User is logged in
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.exist;
    });

    // Profile link or user avatar in navbar
    cy.get('nav').within(() => {
      cy.get('a[href="/profile"]').should('exist');
    });

    // Visiting profile and clicking logout
    cy.visit('/profile');
    cy.contains('button', /Logout/i).click();

    // Verify localStorage cleared
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
    // Verify redirected to login because /profile is protected
    cy.url().should('include', '/login');
  });
});
