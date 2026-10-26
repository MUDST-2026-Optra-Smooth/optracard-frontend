import { setupCommonMocks } from '../support/mockApis';

describe('Role and route authorization', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.clearLocalStorage();
  });

  it('redirects an unauthenticated user from seller, admin, and superadmin routes', () => {
    ['/dashboard', '/seller', '/admin/dashboard', '/superadmin/overview'].forEach((path) => {
      cy.visit(path);
      cy.url().should('include', '/login');
    });
  });

  it('prevents a normal user from opening seller and admin workspaces', () => {
    cy.loginAs('USER');
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
  });

  it('prevents a seller from opening admin and superadmin workspaces', () => {
    cy.loginAs('SELLER', 'saksit', 'saksit@optracard.com', 2);
    cy.visit('/admin/dashboard');
    cy.url().should('include', '/login');
    cy.visit('/superadmin/overview');
    cy.url().should('include', '/login');
  });

  it('prevents an admin from opening superadmin workspace', () => {
    cy.loginAs('ADMIN', 'ops_admin', 'ops@optracard.com', 100);
    cy.visit('/superadmin/users');
    cy.url().should('include', '/login');
  });

  it('clears an invalid token when accessing a protected page', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({ userId: 1, username: 'bad', role: 'USER' }));
      win.localStorage.setItem('token', 'expired-token');
    });
    cy.visit('/profile');
    cy.url().should('include', '/login');
  });
});
