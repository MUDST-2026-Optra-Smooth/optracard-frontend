import { setupCommonMocks } from '../support/mockApis';

describe('Superadmin mutations', () => {
  beforeEach(() => {
    setupCommonMocks();
    cy.loginAs('SUPER_ADMIN', 'superadmin', 'superadmin@optracard.com', 99);
  });

  it('opens the add administrator form', () => {
    cy.visit('/superadmin/staff/add');
    cy.contains(/Add administrator|Temporary password/i).should('be.visible');
    cy.contains('button', /Create administrator/i).should('be.visible');
  });

  it('requires a minimum temporary password', () => {
    cy.visit('/superadmin/staff/add');
    cy.get('input[type="password"]').should('have.attr', 'minlength', '8');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('creates an administrator account', () => {
    cy.intercept('POST', '**/api/superadmin/staff', (request) => {
      expect(request.body).to.include({ username: 'newadmin', email: 'newadmin@example.com' });
      request.reply({ statusCode: 201, body: { id: 101, username: 'newadmin', role: 'ADMIN' } });
    }).as('createStaff');
    cy.visit('/superadmin/staff/add');
    cy.get('input').eq(0).type('newadmin');
    cy.get('input').eq(1).type('newadmin@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', /Create administrator/i).click();
    cy.wait('@createStaff');
  });

  it('shows an error when administrator creation fails', () => {
    cy.intercept('POST', '**/api/superadmin/staff', { statusCode: 409, body: { message: 'Email already exists' } }).as('createStaffFailed');
    cy.visit('/superadmin/staff/add');
    cy.get('input').eq(0).type('duplicate');
    cy.get('input').eq(1).type('existing@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.contains('button', /Create administrator/i).click();
    cy.wait('@createStaffFailed');
    cy.get('[role="alert"]').should('be.visible');
  });

  it('protects the current superadmin account from deletion', () => {
    cy.visit('/superadmin/staff');
    cy.get('[aria-label*="cannot delete your own account"]').should('be.disabled');
  });

  it('opens a user delete confirmation dialog', () => {
    cy.visit('/superadmin/users');
    cy.get('[aria-label="Delete somchai"]').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.contains(/Delete|confirm/i).should('be.visible');
  });
});
