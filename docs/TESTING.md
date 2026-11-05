# Frontend test strategy

## Purpose and test pyramid

The frontend keeps fast, deterministic rules close to the component and reserves browser tests for routing and critical user journeys.

| Layer | Scope | API mode | When it runs |
| --- | --- | --- | --- |
| Unit | formatters, API clients, context state, component validation | mocked / isolated | every PR |
| Integration | component plus router/context/API contract | mocked `fetch` | every PR |
| Critical Cypress | public, authentication, cart/checkout, search and promotion/reorder journeys | Cypress intercepts | every PR |
| Full Cypress | every local role workflow and regression spec | Cypress intercepts | nightly/manual |
| Staging | unmocked public and resettable-account verification | real staging API | nightly/manual, before promotion |
| Production smoke | availability and read-only public/authenticated checks | real production API | after rollout |

Coverage reports are baselined and retained as CI artifacts; this phase deliberately has no global percentage threshold. A meaningful assertion over behaviour is more useful than a high line-count target.

## Commands

```bash
npm run lint
npm run test
npm run build
npm run test:e2e           # PR-critical mocked Cypress subset
npm run test:e2e:full      # all mocked local Cypress specs
npm run test:e2e:staging   # real staging; requires CYPRESS_API_BASE_URL
npm run test:e2e:deployed  # real deployed smoke; requires CYPRESS_BASE_URL/API_BASE_URL
```

`test:e2e` starts Vite on port 3001. The other browser commands expect the target to be running already. Never add a fixed `cy.wait(...)`: wait for an aliased request, location change, visible status, or actionable control instead.

## Test data and safety rules

- Use `data-cy` for a new critical action when its accessible role/name is not stable. Prefer accessible queries first.
- Mocked Cypress data lives in `cypress/fixtures` and `cypress/support/mockApis.ts`; keep it deterministic and role-neutral.
- Staging writes must use names/codes prefixed `E2E-{runId}-`, where `runId` comes from the workflow. Cleanup must use the normal authenticated API in `after`/`afterEach`; no production-only test endpoint is permitted.
- Set separate resettable staging users for buyer, seller, admin and super-admin. Supply only dedicated test credentials through CI secrets.
- Production smoke is strictly read-only: health/UI/catalog/search/product/OpenAPI plus a dedicated buyer's login, profile and order-history reads. It must not add to cart, change profile data, create listings, order, apply a promotion, or approve anything.
- Avoid selectors based on Tailwind classes, order-dependent cards, real dates, or copied production data.

## Frontend test-case matrix

| Area | Unit/integration cases | Cypress / deployed coverage |
| --- | --- | --- |
| Authentication and RBAC | restore valid session; remove malformed/no-token session; login/logout persistence; protected/role route redirect | guest/user/seller/admin/super-admin direct URLs; login and logout redirects; deployed read-only profile/history |
| API clients | bearer header; success; 401/403/422/500; malformed payload; server-message fallback; event dispatch | outbound request method/body/query assertions for checkout, reorder, approvals, promotion |
| Navbar/search | Enter submit; clear query; Thai alias; typo route; stale suggestions; role links and cart badge | `/search` retains query; relevance and price order; game/source/store/language/price filters; back navigation |
| Catalog/product | loading, empty and request error states; source badge; visibility | public browse, product detail, official then marketplace grouping, public deployed product request |
| Cart and promotion | stock/quantity boundaries; valid, expired, minimum, global/per-user limit; rule rendering; rejected-code reason | critical buyer journey and promotion/reorder spec; alert role and keyboard smoke |
| Checkout | pickup versus delivery required address; payment selection; multi-seller shipping; pending submit disabled; failure recovery | add/update/remove cart and checkout request contract |
| Buyer orders/reorder | totals, discount, shipping snapshots; full/partial/no stock reorder; cart-refresh event and toast lifecycle | history → detail → reorder; negative unavailable item state |
| Seller | stock threshold, product active state, destructive confirmation, tracking/status validation and rollback | seller dashboard/listing/stock-alert/order journey |
| Admin | promotion cap/minimum/per-user normalization; errors; listing/store approval/rejection; reports empty/populated | official catalog/store/marketplace/promotion lifecycle |
| Super-admin | users/staff/stores/catalog/transactions populated and empty states; role denial | workspace navigation and forbidden buyer/cart controls |
| Accessibility | label associations, alerts/status, keyboard search, focusable confirmations | `12-accessibility-and-access.cy.ts` plus role/name selectors in critical specs |

## CI ownership

- **PR fast path** (`ci.yml`): lint, Vitest, build, and `test:e2e` critical Cypress specs. It uploads build and failure artifacts.
- **Nightly/manual** (`full-e2e.yml`): runs `test:e2e:full` and, when staging URLs are configured, the unmocked read-only suite. Add the write journey only alongside documented setup/cleanup helpers and resettable credentials.
- **Deploy** (`ci.yml`): runs every file in `cypress/e2e-deployed`; public tests always run and the credential-dependent read-only test is skipped only when credentials are absent.

Reviewers should require a matching test whenever a business rule, role permission, outbound payload, or customer-visible error changes.
