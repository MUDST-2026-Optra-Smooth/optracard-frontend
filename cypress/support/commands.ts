/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role?: 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN', username?: string, email?: string, userId?: number): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginAs', (role = 'USER', username = 'testuser', email = 'test@optracard.com', userId = 1) => {
  const user = {
    userId,
    username,
    email,
    role,
  };
  const token = `fake-jwt-token-for-${role.toLowerCase()}`;
  window.localStorage.setItem('user', JSON.stringify(user));
  window.localStorage.setItem('token', token);
});

export {};
