# Optracard Frontend

Modern trading card game (TCG) e-commerce marketplace and official storefront built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Local Development & Execution](#-local-development--execution)
- [Code Quality & Linting](#-code-quality--linting)
- [Unit & Integration Testing (Vitest)](#-unit--integration-testing-vitest)
- [End-to-End (E2E) Testing (Cypress)](#-end-to-end-e2e-testing-cypress)
- [Docker & Containerization](#-docker--containerization)
- [Kubernetes Deployment](#-kubernetes-deployment)
- [CI/CD Pipeline-as-Code](#-cicd-pipeline-as-code)
- [Test Coverage & Quality Assurance](#-test-coverage--quality-assurance)
- [Project Directory Structure](#-project-directory-structure)

---

## 🛠 Architecture & Tech Stack

- **Core Framework:** React 19 (`react`, `react-dom`)
- **Language:** TypeScript 5 (Strict Mode enabled)
- **Build Tool:** Vite 8 with HMR & ESM chunking
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing:** React Router v7 (`react-router-dom`) with role-based `ProtectedRoute` guards and wildcard fallbacks
- **Icons:** Lucide React & React Icons
- **Unit & Integration Testing:** Vitest 3, React Testing Library, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom`
- **E2E Testing:** Cypress 16 with network intercepts and mock fixtures
- **Linting:** ESLint 10 (Flat Config) with `@typescript-eslint`
- **Containerization:** Multi-stage Docker (Node 20 Alpine builder + Nginx Alpine runtime with SPA routing fallback)
- **CI/CD:** GitHub Actions (Automated Lint, Unit/Integration Tests, Build, Cypress E2E, and CodeQL Security Scanning)

---

## ⚙️ Prerequisites

Before getting started, ensure you have the following installed on your machine:
- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **npm:** `v10.x` or higher
- **Docker & Docker Compose** (optional, for containerized execution)
- **kubectl** & a running Kubernetes cluster (optional, for K8s deployment)

---

## 🔑 Environment Configuration

Create a local `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend API gateway URL used for authentication, catalog, cart, and admin operations. |

*(Note: During local development with `npm run dev`, Vite also proxies `/api` requests to `http://localhost:8080`)*

---

## 🚀 Local Development & Execution

### 1. Install Dependencies
```bash
npm install
# or for strict reproducible installations:
npm ci
```

### 2. Start Local Development Server
```bash
npm run dev
```
The application will be running at [http://localhost:5173](http://localhost:5173).

### 3. Production Build
Compile TypeScript and bundle optimized client assets:
```bash
npm run build
```
Production assets are generated in the `dist/` directory.

### 4. Preview Production Build
Serve the generated production build locally:
```bash
npm run preview
```

---

## 🧹 Code Quality & Linting

The repository uses ESLint 10 with Flat Configuration (`eslint.config.ts`) and TypeScript-ESLint.

Run the linter to verify code standards across the codebase:
```bash
npm run lint
```
To automatically fix formatting and rule violations where supported:
```bash
npx eslint . --fix
```

---

## 🧪 Unit & Integration Testing (Vitest)

Unit and integration tests are powered by **Vitest 3** with **React Testing Library** and **jsdom**. The test suites are cleanly organized in the dedicated `test/` folder at the root level, completely decoupled from production source files in `src/`.

### Directory Layout & Test Suites

```text
test/
├── setup.ts                           # Global test lifecycle, DOM cleanups & jest-dom matchers
├── unit/                              # Isolated logic, formatting & component unit tests
│   ├── storeSecurity.test.ts          # Obfuscation tokens, store encoding/decoding & tamper protection
│   ├── formatters.test.ts             # Thai Baht currency and ISO date formatters
│   ├── ProductCard.test.tsx           # Product badges, expansion tags & out-of-stock disabled states
│   └── ProtectedRoute.test.tsx        # Role-based route guarding (USER, SELLER, ADMIN, SUPER_ADMIN)
└── integration/                       # Multi-component & stateful interaction flows
    ├── Navbar.integration.test.tsx    # Multi-role navigation bar behavior & Cart visibility across personas
    └── Login.integration.test.tsx     # Form input validation, JWT persistence in localStorage & 401 handling
```

### Test Suite Highlights

| Scope | Suite | Scenarios Verified |
| :--- | :--- | :--- |
| **Unit** | `test/unit/storeSecurity.test.ts` | Base64 URL obfuscation of store IDs, parameter injection resistance, tamper detection, and fallback handling. |
| **Unit** | `test/unit/formatters.test.ts` | THB currency formatting (decimals, commas) and localized date rendering with edge case handling. |
| **Unit** | `test/unit/ProductCard.test.tsx` | Official vs. Marketplace badge rendering, price tag display, card click navigation, and disabled out-of-stock action states. |
| **Unit** | `test/unit/ProtectedRoute.test.tsx` | Redirection to `/login` with `location.state.from` preserved for unauthenticated visitors, role authorization enforcement, and access grants. |
| **Integration** | `test/integration/Navbar.integration.test.tsx` | Verifies Navbar items across roles. Specifically validates that the **Cart icon and count badge are accessible to Customers, Admins, and Super Admins** alike. |
| **Integration** | `test/integration/Login.integration.test.tsx` | Full login form interaction: submitting valid credentials, persisting JWT tokens and roles into `localStorage`, redirecting upon success, and displaying error alerts on 401 responses. |

### Running Unit & Integration Tests

#### Headless Execution (Single Run)
```bash
npm run test
```

#### Interactive Watch Mode (Development / TDD)
```bash
npm run test:watch
```

---

## 🧪 End-to-End (E2E) Testing (Cypress)

End-to-end tests are written in **Cypress** and cover the end-to-end user journeys for all four supported personas: **Customer (Buyer)**, **Seller (Merchant)**, **Admin**, and **Super Admin**.

### E2E Test Suites Overview (`cypress/e2e/`)

| Spec File | Persona / Scope | Scenarios Covered |
| :--- | :--- | :--- |
| `01-public-pages.cy.ts` | Guest / Buyer | Homepage hero, catalog grids, search with filters, official store, marketplace view, About Us, Our Team, product detail. |
| `02-auth-flows.cy.ts` | Authentication | Login form, credential validation, JWT local storage persistence, registration validation, and logout. |
| `03-buyer-cart-checkout.cy.ts` | Buyer | Add to cart, quantity increments/decrements, cart snapshot badge, simulated checkout, and payment success flow. |
| `04-seller-workspace.cy.ts` | Seller | Seller dashboard metrics, creating new product listings, editing existing products, and merchant store profile. |
| `05-admin-workspace.cy.ts` | Admin | GMV & revenue metrics, official stock inventory, platform order management, seller verification, and header cart access. |
| `06-superadmin-workspace.cy.ts` | Super Admin | Platform overview, stores audit, catalog visibility toggles, platform transaction logs, user account deletion, staff administration. |
| `07-order-and-catalog-controls.cy.ts` | Safeguards & Operations | Order tracking validation before shipment, marketplace review templates, and permanent catalog deletion guards. |

### Running E2E Tests

#### Automated Headless Execution (CI mode)
Starts the Vite test server on port 3001 and executes all Cypress test specs headlessly:
```bash
npm run test:e2e
```

#### Interactive Cypress Test Runner (GUI mode)
1. Start the test server in one terminal:
   ```bash
   npm run dev:test
   ```
2. Open the Cypress Interactive GUI in another terminal:
   ```bash
   npm run cypress:open
   ```

#### Direct Cypress CLI Run
```bash
npm run cypress:run
```

#### Deployed Full-Stack Smoke Tests
The normal suite uses mocked APIs for fast UI regression checks. The deployed smoke suite at `cypress/e2e-deployed/08-deployed-smoke.cy.ts` deliberately uses no `cy.intercept()` calls and is run by the deployment workflow after `main` is deployed. It needs the deployed frontend URL, backend URL, and a dedicated demo-user credential.

---

---

## 🐳 Docker & Containerization

The project includes an optimized multi-stage `Dockerfile` and `docker-compose.yml` configured with an SPA-compliant Nginx server.

### 1. Build Docker Image
```bash
docker build -t optracard-frontend:latest .
```
To supply a custom backend API URL during build time:
```bash
docker build --build-arg VITE_API_BASE_URL=https://api.optracard.com -t optracard-frontend:latest .
```

### 2. Run with Docker
```bash
docker run -d -p 80:80 --name optracard_frontend optracard-frontend:latest
```
Access the application at [http://localhost](http://localhost).

### 3. Run with Docker Compose
```bash
# Start container in detached mode
docker compose up -d

# Check status
docker compose ps

# View container logs
docker compose logs -f

# Stop and remove container
docker compose down
```
Access the compose-managed container at [http://localhost:5173](http://localhost:5173).

*(Note: `nginx.conf` includes `try_files $uri $uri/ /index.html;` to ensure client-side routing like `/cart` or `/admin/dashboard` does not return 404 upon browser reload).*

---

## ☸️ Kubernetes Deployment

A declarative Kubernetes manifest is provided in [`app-pod.yaml`](./app-pod.yaml) defining a dedicated `Namespace`, a 2-replica `Deployment`, and a `NodePort` `Service` (exposing port 80 at NodePort 30080).

### Deploying to Kubernetes:
```bash
# 1. Apply namespace, deployment, and service
kubectl apply -f app-pod.yaml

# 2. Verify deployment and pod status
kubectl get deployments,pods,services -n optracard-frontend

# 3. Access via NodePort or Port Forward
# If using Minikube:
minikube service optracard-frontend-service -n optracard-frontend

# Or via port-forward:
kubectl port-forward svc/optracard-frontend-service -n optracard-frontend 8080:80
```
Open [http://localhost:8080](http://localhost:8080) in your browser (or port `30080` if accessing the cluster node directly).

The Kubernetes frontend proxies browser requests under `/api` to
`optracard-backend-service` inside the `optracard-backend` namespace. Build the
frontend image without a `VITE_API_BASE_URL` value for this deployment. Only the
frontend port-forward is needed in a browser:

```bash
kubectl port-forward svc/optracard-frontend-service 30080:80 -n optracard-frontend
```

---

## 🔄 CI/CD Pipeline-as-Code

The repository implements automated CI workflows located in `.github/workflows/`:

### 1. Frontend CI/CD (`.github/workflows/ci.yml`)
The CI job runs on every `push` and `pull_request`. The deployment job remains restricted to successful pushes to `main`.
1. **Checkout:** Checks out source code via `actions/checkout@v4`.
2. **Environment Setup:** Configures Node.js 22 with npm dependency caching.
3. **Deterministic Install:** Executes `npm ci`.
4. **Code Quality:** Enforces zero lint errors via `npm run lint`.
5. **Unit & Integration Tests:** Executes all Vitest suites headlessly via `npm run test`.
6. **Production Build:** Bundles production assets via `npm run build`.
7. **Automated E2E Tests:** Runs the full Cypress test suite headlessly via `npm run test:e2e`.
8. **Artifact Archiving:** Uploads `dist/` build artifacts (retained 7 days) and uploads Cypress failure screenshots/videos if any test fails.

After a successful push to `main` (or manual trigger), the deploy job:
1. Builds the image with the deployed backend URL.
2. Pushes a Docker Hub image tagged with the commit SHA.
3. Applies `app-pod.yaml`, sets that SHA on the Deployment, and waits for rollout completion.
4. Runs the no-mock deployed Cypress smoke suite (if `FRONTEND_URL` is configured).

#### GitHub Secrets Configuration:

| Secret | Required For | Description |
| :--- | :--- | :--- |
| `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` | Deployment | Push the versioned frontend image to Docker Hub. |
| `KUBECONFIG_BASE64` | Deployment | Base64-encoded kubeconfig for the Kubernetes cluster. |
| `FRONTEND_URL` | Deployed Smoke | URL of the live frontend. **Setting this secret enables the smoke test step in CI.** |
| `BACKEND_API_URL` | Deployed Smoke | URL of the live backend (used by Cypress for live API requests). |
| `E2E_EMAIL`, `E2E_PASSWORD` | Deployed Smoke | Valid demo buyer credentials used to verify deployed login and profile access. |

> [!NOTE]
> **Why adding `FRONTEND_URL` & `BACKEND_API_URL` caused CI to fail:**
> 1. **Activation Trigger:** In `.github/workflows/ci.yml`, the `Run deployed full-stack smoke tests` step contains `if: env.FRONTEND_URL != ''`. When the secret is omitted, this step is skipped. Populating `FRONTEND_URL` triggers execution of `cypress/e2e-deployed/08-deployed-smoke.cy.ts`.
> 2. **Network / Port Accessibility:** The runner attempts to connect to `http://localhost:30080` (Frontend) and `http://localhost:30081` (Backend). In containerized runners or cloud runners, `localhost:30080` is not automatically mapped to the cluster's NodePort unless the runner runs directly on the Kubernetes host with host networking or active port forwarding.
> 3. **Mandatory Credentials:** The smoke suite tests live authentication and expects `E2E_EMAIL` and `E2E_PASSWORD`. If only the URLs were added as secrets without corresponding credentials, Cypress assertions fail immediately on missing authentication parameters.
> 4. **Live Endpoint Health:** The test suite queries live endpoints (`/v3/api-docs` and `/api/products/home`). If the backend container is not online or accessible at `BACKEND_API_URL`, Cypress receives `ECONNREFUSED`.

### 2. CodeQL Static Analysis (`.github/workflows/codeql.yml`)
Runs GitHub CodeQL automated vulnerability and security scanning on all TypeScript and JavaScript files.

---

## 📊 Test Coverage & Quality Assurance

The project follows a multi-tiered test automation strategy:

```text
               /\
              /  \     Deployed Smoke (3 live end-to-end journeys)
             /----\
            /      \   Cypress E2E (7 suites, >40 mock-backed user flows)
           /--------\
          /          \ Vitest Integration (Navbar roles, Cart access, Login flow)
         /------------\
        /              \ Vitest Unit (Store security, formatters, components, route guards)
       ------------------
```

### What is Covered:
- **Unit Testing (Vitest + React Testing Library):**
  - Store security & token generation (`storeSecurity.test.ts`): obfuscation, decoding, tamper detection, fallback safety.
  - Number & date formatters (`formatters.test.ts`): Thai Baht currency formatting, decimal edge cases, localized dates.
  - UI Component states (`ProductCard.test.tsx`): Official vs Marketplace tags, price display, out-of-stock disabling.
  - Route authorization (`ProtectedRoute.test.tsx`): Unauthenticated redirects to `/login` preserving `location.state.from`, role permission enforcement (`ADMIN`, `SUPER_ADMIN`, `SELLER`).
- **Integration Testing (Vitest + React Testing Library):**
  - Multi-role Navbar (`Navbar.integration.test.tsx`): Header links for Guest, Customer, Admin, and Super Admin personas. Verifies that **Cart is accessible to Admins and Super Admins**.
  - Login authentication flow (`Login.integration.test.tsx`): Form submissions, JWT and role storage in `localStorage`, 401 error message rendering.
- **End-to-End Coverage (Cypress):**
  - Over 40 scenarios spanning buyer shopping, cart operations, payment simulation, seller catalog management, admin inventory control, super admin audits, and order fulfillment safeguards.
- **Network Interception & Isolation:**
  - `cypress/support/mockApis.ts` mocks external backend REST APIs, ensuring deterministic, reproducible test runs.
- **Deployed Full-Stack Smoke:**
  - Cypress checks against actual deployed Frontend, Backend, and PostgreSQL services without API mocking.

---

## 📁 Project Directory Structure

```text
optracard-frontend/
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Automated CI (lint, vitest, build, Cypress E2E)
│       └── codeql.yml                 # CodeQL static security analysis
├── test/                              # Unit & Integration test suites (Vitest)
│   ├── setup.ts                       # Test lifecycle, cleanup & jest-dom setup
│   ├── unit/                          # Isolated unit tests
│   │   ├── formatters.test.ts         # Currency & date formatters
│   │   ├── ProductCard.test.tsx       # Component badge & out-of-stock logic
│   │   ├── ProtectedRoute.test.tsx    # Role guarding & redirect behavior
│   │   └── storeSecurity.test.ts      # Obfuscation tokens & tamper prevention
│   └── integration/                   # Multi-component integration tests
│       ├── Login.integration.test.tsx # Login form flow, JWT persistence & 401 alert
│       └── Navbar.integration.test.tsx# Multi-role navigation & cart accessibility
├── cypress/
│   ├── e2e/                           # 7 mock-backed Cypress test suites
│   │   ├── 01-public-pages.cy.ts
│   │   ├── 02-auth-flows.cy.ts
│   │   ├── 03-buyer-cart-checkout.cy.ts
│   │   ├── 04-seller-workspace.cy.ts
│   │   ├── 05-admin-workspace.cy.ts
│   │   ├── 06-superadmin-workspace.cy.ts
│   │   └── 07-order-and-catalog-controls.cy.ts
│   ├── e2e-deployed/
│   │   └── 08-deployed-smoke.cy.ts     # 3 no-mock checks, run after deployment
│   └── support/                       # Cypress mocks & custom commands
│       ├── commands.ts
│       ├── e2e.ts
│       └── mockApis.ts
├── scripts/
│   └── cypress-run.js                 # Cross-platform Cypress execution wrapper
├── src/
│   ├── api/                           # API integration modules
│   │   ├── admin.ts
│   │   ├── cart.ts
│   │   ├── catalog.ts
│   │   ├── notifications.ts
│   │   ├── seller.ts
│   │   └── superadmin.ts
│   ├── components/                    # Reusable UI & workspace components
│   ├── context/                       # Global React contexts (AuthContext, etc.)
│   ├── hooks/                         # Custom React hooks (useCartCount)
│   ├── pages/                         # Storefront, Seller, Admin & SuperAdmin views
│   ├── types/                         # TypeScript domain models
│   ├── utils/                         # Utility and security functions
│   ├── App.tsx                        # Top-level routing, redirects & role protection
│   └── main.tsx                       # React application entrypoint
├── app-pod.yaml                       # Kubernetes deployment manifest
├── docker-compose.yml                 # Docker Compose orchestration
├── Dockerfile                         # Multi-stage production container build
├── nginx.conf                         # Nginx SPA routing fallback config
├── eslint.config.ts                   # ESLint 10 flat configuration
├── vitest.config.ts                   # Vitest unit & integration test configuration
├── vite.config.ts                     # Vite bundler configuration
└── package.json                       # NPM dependencies and scripts
```
