# Optracard Frontend

Modern trading card game (TCG) e-commerce marketplace and official storefront built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Configuration](#-environment-configuration)
- [Local Development & Execution](#-local-development--execution)
- [Code Quality & Linting](#-code-quality--linting)
- [End-to-End (E2E) Testing](#-end-to-end-e2e-testing)
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
- **Routing:** React Router v7 (`react-router-dom`) with role-based `ProtectedRoute` guards
- **Icons:** Lucide React & React Icons
- **E2E Testing:** Cypress 16 with network intercepts and mock fixtures
- **Linting:** ESLint 10 (Flat Config) with `@typescript-eslint`
- **Containerization:** Multi-stage Docker (Node 20 Alpine builder + Nginx Alpine runtime with SPA routing fallback)
- **CI/CD:** GitHub Actions (Automated Lint, Build, Cypress E2E, and CodeQL Security Scanning)

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

## 🧪 End-to-End (E2E) Testing

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

---

## 🔄 CI/CD Pipeline-as-Code

The repository implements automated CI workflows located in `.github/workflows/`:

### 1. Frontend CI (`.github/workflows/ci.yml`)
Triggered on every `push` and `pull_request` targeting `main` or `develop`:
1. **Checkout:** Checks out source code via `actions/checkout@v4`.
2. **Environment Setup:** Configures Node.js 22 with npm dependency caching.
3. **Deterministic Install:** Executes `npm ci`.
4. **Code Quality:** Enforces zero lint errors via `npm run lint`.
5. **Production Build:** Bundles production assets via `npm run build`.
6. **Automated E2E Tests:** Runs the full Cypress test suite headlessly via `npm run test:e2e`.
7. **Artifact Archiving:** Uploads `dist/` build artifacts (retained 7 days) and uploads Cypress failure screenshots/videos if any test fails.

### 2. CodeQL Static Analysis (`.github/workflows/codeql.yml`)
Runs GitHub CodeQL automated vulnerability and security scanning on all TypeScript and JavaScript files.

---

## 📊 Test Coverage & Quality Assurance

### What is Currently Covered:
- **Comprehensive E2E Coverage:** Over 40 scenarios spanning buyer shopping, cart operations, payment simulation, seller catalog management, admin inventory control, super admin audits, and order fulfillment safeguards.
- **Network Interception & Isolation:** `cypress/support/mockApis.ts` mocks external backend REST APIs, ensuring fast, deterministic, reproducible test runs independent of live database states.
- **Route Authorization Guarding:** Protected route verification for unauthenticated redirects and role-specific permissions (`USER`, `SELLER`, `ADMIN`, `SUPER_ADMIN`).

### Recommended Next Steps for Partial Coverage Gaps:
1. **Unit Testing:** Integrate **Vitest** for isolated unit testing of utility functions (e.g. `encodeStoreId` / `decodeStoreId` in `src/utils/storeSecurity.ts`, formatters in `src/context/formatters.tsx`).
2. **Cypress Code Coverage Plugin:** Add `@cypress/code-coverage` with Babel / Vite Istanbul instrumentation to generate numeric statement and branch coverage percentages (`lcov.info`).
3. **Accessibility (a11y) Testing:** Integrate `cypress-axe` to test WCAG 2.1 AA compliance across storefront and administrative forms.

---

## 📁 Project Directory Structure

```text
optracard-frontend/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated CI (lint, build, Cypress E2E)
│       └── codeql.yml             # CodeQL static security analysis
├── cypress/
│   ├── e2e/                       # 7 End-to-end test suites
│   │   ├── 01-public-pages.cy.ts
│   │   ├── 02-auth-flows.cy.ts
│   │   ├── 03-buyer-cart-checkout.cy.ts
│   │   ├── 04-seller-workspace.cy.ts
│   │   ├── 05-admin-workspace.cy.ts
│   │   ├── 06-superadmin-workspace.cy.ts
│   │   └── 07-order-and-catalog-controls.cy.ts
│   └── support/                   # Cypress mocks & custom commands
│       ├── commands.ts
│       ├── e2e.ts
│       └── mockApis.ts
├── scripts/
│   └── cypress-run.js             # Cross-platform Cypress execution wrapper
├── src/
│   ├── api/                       # API integration modules
│   │   ├── admin.ts
│   │   ├── cart.ts
│   │   ├── catalog.ts
│   │   ├── notifications.ts
│   │   ├── seller.ts
│   │   └── superadmin.ts
│   ├── components/                # Reusable UI & workspace components
│   ├── context/                   # Global React contexts (AuthContext, etc.)
│   ├── hooks/                     # Custom React hooks (useCartCount)
│   ├── pages/                     # Storefront, Seller, Admin & SuperAdmin views
│   ├── types/                     # TypeScript domain models
│   ├── utils/                     # Utility and security functions
│   ├── App.tsx                    # Top-level routing & role protection
│   └── main.tsx                   # React application entrypoint
├── app-pod.yaml                   # Kubernetes deployment manifest
├── docker-compose.yml             # Docker Compose orchestration
├── Dockerfile                     # Multi-stage production container build
├── nginx.conf                     # Nginx SPA routing fallback config
├── eslint.config.ts               # ESLint 10 flat configuration
├── vite.config.ts                 # Vite bundler configuration
└── package.json                   # NPM dependencies and scripts
```
