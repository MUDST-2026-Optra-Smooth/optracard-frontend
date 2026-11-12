# Auction verification and rollout

The feature branch adds live auction refresh, account bids/wins, notification inbox, inventory-linked listing details, and Superadmin oversight/settings/audit/restrictions/disputes.

- Run `npm test`, `npm run lint`, and `npm run build`.
- `npm run test:auction` selects the 18 added Vitest cases across live timers, six existing auction pages, account notifications/wins and Superadmin workflows.
- `npm run test:e2e` includes the critical auction navigation spec. `cypress/e2e/13-auction-journey.cy.ts` uses intercepted API responses for browse/bid/win/checkout/order-history and guest access. Backend integration separately verifies real database state transitions, concurrent bids, inventory and authorization.
- The new public API response terms include bidIncrement/checkoutHours/antiSnipingMinutes and optional productId/cardCondition/grading/evidenceImages. Private bidder IDs are null for unrelated viewers. API calls use VITE_API_BASE_URL, or the same origin with Vite/Nginx proxying.
- Staging/deployed smoke specs read public list/detail/history, check bidder-ID privacy and verify anonymous access restrictions. They do not place bids, pay or moderate auctions. Configure CYPRESS_API_BASE_URL before running the existing staging/deployed scripts. No deployment URL has been supplied, so these checks have not been run against a deployed service.
- Backend migration and business policy details are in the paired backend repository: docs/auction-completion.md and database/auction-completion-migration.sql.
- Full TypeScript validation still reports existing SPAD_Overview monthly metric and AuthContext test-mock errors outside the changed auction code. Production build and ESLint are separate verified checks.

Keep WeeklyReport fixes on their existing branch until reviewed. This branch must not be merged, force-pushed or deployed by a commit helper.
