# Guna Wines — Implementation Task List

This task list breaks down the Product Requirements Document (PRD) for Guna Wines into atomic-level, actionable tasks structured by development phases. Each task lists its specific dependencies to ensure a logical and orderly execution flow.

---

## Phase 1: Branding, Wireframes & Design System (Duration: 1–2 Weeks)

Focuses on establishing the design system, establishing UI components, and building wireframe structures.

- [x] **TSK-1.1**: Define Design System & Tokens
  - **Description**: Define global styling tokens for the premium dark luxury theme.
  - **Sub-tasks**:
    - [x] Select and configure primary palette colors: Deep Wine Red, Burgundy, Dark Purple, Black.
    - [x] Select and configure secondary palette colors: Gold, Champagne Beige, Silver Gray, White Smoke.
    - [x] Choose and configure typography scales: Inter, Poppins, Playfair Display.
    - [x] Establish design tokens for glassmorphism effects (backdrop blur, border opacity, drop shadows).
  - **Dependencies**: None
  - **Verification**: Style guide document or UI sandbox containing all components styled with token set.

- [x] **TSK-1.2**: Public Website Wireframes & Layout Design
  - **Description**: Mock up the page sections and user flows for external users.
  - **Sub-tasks**:
    - [x] Wireframe Landing Page hero banner, features, and branch preview.
    - [x] Wireframe About Us, Products Showcase, and Promotions sections.
    - [x] Design Event Booking and customer enquiry form wireframes.
  - **Dependencies**: TSK-1.1
  - **Verification**: UI design layouts reviewed and completed.

- [x] **TSK-1.3**: Admin Portal Wireframes & Layout Design
  - **Description**: Design layouts for administrative workflows and dashboards.
  - **Sub-tasks**:
    - [x] Design general admin layout (collapsible sidebar, global header, notification pane).
    - [x] Design wireframes for Executive Dashboard (KPI metrics, comparison charts, sales trend lines).
    - [x] Design wireframes for Branch Dashboard (daily sales summary, attendance tracking list, pending deliveries card).
  - **Dependencies**: TSK-1.1
  - **Verification**: Admin dashboard design mocks completed.

- [x] **TSK-1.4**: Project Repository Initialization & Tech Stack Setup
  - **Description**: Setup React/Next.js and Tailwind CSS environment.
  - **Sub-tasks**:
    - [x] Initialize Next.js project with TypeScript.
    - [x] Install and configure Tailwind CSS and standard dependency libraries (e.g. Framer Motion, Lucide React).
    - [x] Configure linting and directory structures (components, hooks, context, styles).
  - **Dependencies**: None
  - **Verification**: Development server runs successfully with zero errors.

- [x] **TSK-1.5**: Implement Global CSS & Wine Theme Config
  - **Description**: Map design tokens to code variables and CSS styles.
  - **Sub-tasks**:
    - [x] Integrate custom font families in project config.
    - [x] Extend Tailwind color theme configuration with wine-inspired colors.
    - [x] Create global utility classes for glassmorphic containers.
  - **Dependencies**: TSK-1.4, TSK-1.1
  - **Verification**: A style test page displaying all colors, typography sizes, and glassmorphic cards correctly rendered.

---

## Phase 2: Frontend Prototype & Mock UI (Duration: 2–4 Weeks)

Focuses on building the interactive pages using the static theme, mock data, and transition animations.

- [x] **TSK-2.1**: Implement Public Landing Page & Global Responsive Header/Footer
  - **Description**: Develop responsive public header/footer and landing page.
  - **Sub-tasks**:
    - [x] Implement responsive navigation bar with transition animations.
    - [x] Implement hero section featuring luxury visuals, about intro block, and wine collection preview.
    - [x] Add smooth scroll behaviors and page entry micro-animations.
  - **Dependencies**: TSK-1.5, TSK-1.2
  - **Verification**: Visual check of responsive landing page on desktop and mobile viewports.

- [x] **TSK-2.2**: Implement Public Subpages
  - **Description**: Develop static content pages for public visitors.
  - **Sub-tasks**:
    - [x] Build About Us page with brand philosophy details.
    - [x] Build Products page showing structured mock products (categorized by wine variety, origin, bottle sizes).
    - [x] Build Branch Locations page containing address details, contacts, and branch hours.
  - **Dependencies**: TSK-2.1
  - **Verification**: Complete links traversal without dead pages or styling breaks.

- [x] **TSK-2.3**: Build Public Event Booking & Enquiry Form Page
  - **Description**: Develop interactive client submission forms for events.
  - **Sub-tasks**:
    - [x] Create event enquiry form fields (event date, guest estimate, event type, budget boundaries).
    - [x] Implement client-side validation checks (date checks, minimum budgets, phone/email validation).
    - [x] Add feedback notification dialogs on submission event.
  - **Dependencies**: TSK-2.1
  - **Verification**: Validation triggers error labels and submit prints correctly formatted form states in console logs.

- [x] **TSK-2.4**: Implement Admin Portal Layout & Navigation Frame
  - **Description**: Create the wrapper layout for authorized admin panels.
  - **Sub-tasks**:
    - [x] Build collapsible Sidebar navigation linking to all functional modules.
    - [x] Implement breadcrumbs navigation indicator.
    - [x] Implement global header displaying user profile dropdown, active branch selector, and alerts drawer.
  - **Dependencies**: TSK-1.5, TSK-1.3
  - **Verification**: Layout maintains correct proportions on resize; links successfully navigate between mock components.

- [x] **TSK-2.5**: Define TypeScript Types & Mock Data Layer
  - **Description**: Establish dummy database models to power visual prototypes.
  - **Sub-tasks**:
    - [x] Define TS types for `Branch`, `Product`, `InventoryItem`, `Invoice`, `Employee`, `EventBooking`, `ReportSummary`.
    - [x] Create standard JSON-based seed files containing realistic mock datasets.
  - **Dependencies**: TSK-1.4
  - **Verification**: File compiles clean with no TypeScript type errors.

- [x] **TSK-2.6**: Build Executive Dashboard Interface
  - **Description**: Construct the main analytics summary screen for Super Admin.
  - **Sub-tasks**:
    - [x] Code KPI widgets showing Total Revenue, Total Products, Pending Shipments, and Scheduled Events.
    - [x] Embed interactive charts (Sales Trend line chart, Branch Comparison bar chart).
    - [x] Code Recent Activities log panel and low-stock indicators table.
  - **Dependencies**: TSK-2.4, TSK-2.5
  - **Verification**: Correct rendering of charts and cards populated with mock data values.

- [x] **TSK-2.7**: Build Branch Management Dashboard Interface
  - **Description**: Implement dashboard view tailored for Branch Managers.
  - **Sub-tasks**:
    - [x] Build widgets for branch-specific metrics (Daily Sales target, local staff on duty, shipments out today).
    - [x] Add branch filtering functionality to filter data view.
  - **Dependencies**: TSK-2.4, TSK-2.5
  - **Verification**: Switching branch filter shifts mock metrics to show specific branch numbers.

---

## Phase 3: Backend Foundation & Authentication (Duration: 2–3 Weeks)

Establish the server framework, database connection, user roles, and secure access systems.

- [x] **TSK-3.1**: Initialize Express/Node Backend Structure
  - **Description**: Set up server code structure, environment files, and basic routes.
  - **Sub-tasks**:
    - [x] Initialize Node.js TypeScript project.
    - [x] Configure security middlewares (cors, helmet, rate-limiter).
    - [x] Create server controller structures and global error handler middleware.
  - **Dependencies**: TSK-1.4
  - **Verification**: Server launches locally and returns success message on health check endpoint (`/api/health`).

- [x] **TSK-3.2**: Database Setup & Schema Migrations for Users/Roles
  - **Description**: Connect database and implement user role architectures.
  - **Sub-tasks**:
    - [x] Create connection pool for SQL database (PostgreSQL/MySQL).
    - [x] Define table schemas for `Users`, `Roles`, `Permissions`, `Branches`, and `BranchAssignments`.
    - [x] Create seed scripts to insert system-defined Roles (Super Admin, Manager, Cashier, Inventory, HR, Event Coordinator).
  - **Dependencies**: TSK-3.1
  - **Verification**: Running database migrations runs successfully; verification select queries display correctly configured roles tables.

- [x] **TSK-3.3**: Implement JWT Authentication API Endpoints
  - **Description**: Secure backend with JSON Web Tokens and encrypt user credentials.
  - **Sub-tasks**:
    - [x] Implement password hashing logic (bcrypt).
    - [x] Code `/api/auth/login` endpoint verifying password and returning signed access/refresh JWTs.
    - [x] Code `/api/auth/logout` and `/api/auth/refresh` token rotation endpoints.
    - [x] Implement password recovery request flows (`/api/auth/forgot-password`).
  - **Dependencies**: TSK-3.2
  - **Verification**: API tests verify password matching, validation failures, and token expiration logic.

- [x] **TSK-3.4**: Build Role-Based Access Control (RBAC) Middleware
  - **Description**: Write authorization interceptors to restrict endpoints by role permissions.
  - **Sub-tasks**:
    - [x] Write token extraction middleware verifying JWT integrity.
    - [x] Write role checker middleware checking if authenticated user has needed permissions.
  - **Dependencies**: TSK-3.3
  - **Verification**: Endpoint access tests (e.g., Cashier role blocked from calling HR endpoint, Super Admin can read all).

- [x] **TSK-3.5**: Integrate Admin Login UI to Backend
  - **Description**: Connect the UI prototype authentication elements to the live REST API.
  - **Sub-tasks**:
    - [x] Build Login form page validating user inputs.
    - [x] Write API client helpers (axios/fetch with token interceptors).
    - [x] Integrate React Context/Auth State to persist token and control protected route access.
  - **Dependencies**: TSK-2.4, TSK-3.3
  - **Verification**: Logging in with valid credentials directs user to dashboard; direct route access without token redirects to login page.

---

## Phase 4: Inventory & Logistics Module (Duration: 2–4 Weeks)

Implement the central inventory engine, stock control workflows, and shipment tracing between warehouses/branches.

- [x] **TSK-4.1**: Database Migrations for Products, Categories, Inventory & Suppliers
  - **Description**: Model the database tables to match inventory and logistics requirements.
  - **Sub-tasks**:
    - [x] Migrate `Categories` and `Supplier` profile tables.
    - [x] Migrate `Products` (variants, volume size, SKU) and branch-specific `Inventory` stock tables.
    - [x] Migrate `Shipments` table (tracking origin, destination, dispatcher, status timestamps).
  - **Dependencies**: TSK-3.2
  - **Verification**: Schema tables created in database; foreign keys and constraints verified.

- [x] **TSK-4.2**: Implement Inventory Query & Adjustments API Endpoints
  - **Description**: Develop API endpoints to list products and record stock corrections.
  - **Sub-tasks**:
    - [x] Code `/api/inventory` GET endpoint with filtering options (branch, search query, category, stock limits).
    - [x] Code `/api/inventory/adjust` POST endpoint allowing authorized users to record stock adjustments.
    - [x] Implement damaged/spilled stock audit logs.
  - **Dependencies**: TSK-4.1, TSK-3.4
  - **Verification**: Adjusting inventory updates quantity balance and writes audit record in DB.

- [x] **TSK-4.3**: Implement Stock Transfer & Reservation Workflows
  - **Description**: Build backend mechanics supporting stock movement request actions.
  - **Sub-tasks**:
    - [x] Create `/api/inventory/transfer` endpoint initiating and tracking branch transfers.
    - [x] Implement automated low-stock threshold alert triggers.
    - [x] Develop stock allocation reservation flags (releasing reserved wine stocks to specific event holds).
  - **Dependencies**: TSK-4.2
  - **Verification**: Submitting transfer reduces virtual pending quantity in sending branch, then increases actual stock in destination upon approval.

- [x] **TSK-4.4**: Implement Logistics Shipments API
  - **Description**: API to track external supplier dispatch and delivery states.
  - **Sub-tasks**:
    - [x] Code endpoints to log shipment origin details (e.g. Quorum logistics), dispatch dates, transporters, and actual delivery dates.
    - [x] Code logistics expense log routes.
  - **Dependencies**: TSK-4.1, TSK-3.4
  - **Verification**: Shipment status updates correctly through states: 'Created', 'Dispatched', 'Delivered', 'Damaged'.

- [x] **TSK-4.5**: Integrate Inventory Management UI with Backend
  - **Description**: Connect the frontend inventory screen components to the real database APIs.
  - **Sub-tasks**:
    - [x] Implement data table displaying current stock count, search inputs, and filters.
    - [x] Integrate stock adjust and transfer modals with API calls.
    - [x] Display visual badge triggers warning on low inventory thresholds.
  - **Dependencies**: TSK-2.5, TSK-4.3
  - **Verification**: Actions on frontend UI reflect change states inside live database and update grids in real time.

- [x] **TSK-4.6**: Integrate Logistics Management UI with Backend
  - **Description**: Create panels showing ongoing shipments and transport budgets.
  - **Sub-tasks**:
    - [x] Build shipment pipeline progress cards dashboard view.
    - [x] Implement new shipment logging form.
  - **Dependencies**: TSK-2.5, TSK-4.4
  - **Verification**: Adding shipment updates delivery board cards and expense totals instantly.

---

## Phase 5: Billing & POS Module (Duration: 2–4 Weeks)

Implement sales processes, invoice generation, tax configurations, split payments, and customer lookups.

- [x] **TSK-5.1**: Database Migrations for Invoices, Line Items & Payments
  - **Description**: Set up tables to handle fast cashier transactions.
  - **Sub-tasks**:
    - [x] Model `Invoices` table containing fields for branch, subtotal, tax rate, discount, final amount, payment type, cashier metadata.
    - [x] Model `InvoiceItems` table linking line products to invoice identifiers.
    - [x] Model `Payments` tracking split payouts (Cash, Card, Digital Transfer).
  - **Dependencies**: TSK-3.2, TSK-4.1
  - **Verification**: Schema verified; foreign keys mapped correctly to branch, customer, and products.

- [x] **TSK-5.2**: Implement Checkout & Sales Processing APIs
  - **Description**: Backend transaction processor performing validation checks and saving invoices.
  - **Sub-tasks**:
    - [x] Build `/api/billing/checkout` API endpoint verifying product quantities, reserving inventory, calculating exact taxes, and writing records.
    - [x] Ensure database transaction rollbacks occur on any internal query errors.
  - **Dependencies**: TSK-5.1, TSK-4.2
  - **Verification**: Checkout payload returns success, reduces inventory amounts by order count, and creates invoice DB rows.

- [x] **TSK-5.3**: Implement Pricing & Discount Settings APIs
  - **Description**: Support promotional rules and dynamic discounts.
  - **Sub-tasks**:
    - [x] Create endpoints managing discount rules (percentage-based, fixed-price cuts, bulk product rules).
    - [x] Configure global default tax settings APIs.
  - **Dependencies**: TSK-5.1, TSK-3.4
  - **Verification**: Test checkout endpoint with discounts applies reductions correctly.

- [x] **TSK-5.4**: Implement PDF Invoice Generation Service
  - **Description**: Dynamically produce high-quality PDF billing receipts.
  - **Sub-tasks**:
    - [x] Install PDF document rendering library (e.g. PDFKit, Puppeteer).
    - [x] Design receipt layout styled with Guna Wines branding.
    - [x] Build endpoint `/api/billing/invoice/:id/pdf` generating and streaming PDF binary file downloads.
  - **Dependencies**: TSK-5.2
  - **Verification**: Accessing download link generates visual PDF receipt with correct line totals.

- [x] **TSK-5.5**: Integrate Cashier POS Interface Screen
  - **Description**: Connect the frontend billing grid to database search engines and payment systems.
  - **Sub-tasks**:
    - [x] Build fast item lookup search bar with barcode parsing placeholders.
    - [x] Implement active order grid, tax/discount displays, payment dialog windows supporting split options.
    - [x] Integrate post-checkout triggers to download generated receipt PDF.
  - **Dependencies**: TSK-2.5, TSK-5.2, TSK-5.4
  - **Verification**: Cashier selects items, applies discounts, presses checkout, payment logs correctly, and receipt PDF downloads automatically.

---

## Phase 6: Employee & Payroll Module (Duration: 2–3 Weeks)

Manage employee files, log branch attendance logs, handle schedules, and process salary payroll slips.

- [x] **TSK-6.1**: Database Migrations for Employees, Attendance, & Payroll
  - **Description**: Design schema tables for staff management systems.
  - **Sub-tasks**:
    - [x] Migrate `Employees` details table (contacts, salary, start date, documents).
    - [x] Migrate `Attendance` logs tracking clock-in/out timestamps and branch locations.
    - [x] Migrate `Payroll` tracking monthly disbursements and PDF payslip links.
  - **Dependencies**: TSK-3.2
  - **Verification**: Verification queries confirm tables created and connected to branches.

- [x] **TSK-6.2**: Implement Employee Management APIs
  - **Description**: Create endpoints managing staff profiles.
  - **Sub-tasks**:
    - [x] Create `/api/employees` CRUD endpoints.
    - [x] Add branch reallocation functionality (`/api/employees/:id/reassign`).
    - [x] Add document upload capabilities (using standard files middleware/s3 mock folders).
  - **Dependencies**: TSK-6.1, TSK-3.4
  - **Verification**: POST requests add new staff profile; file upload saves attachment links correctly.

- [x] **TSK-6.3**: Implement Attendance & Shift Schedule APIs
  - **Description**: Record attendance times and define active shifts.
  - **Sub-tasks**:
    - [x] Code `/api/attendance/clock-in` and `clock-out` endpoints tracking IP addresses and time.
    - [x] Create shift planner scheduling APIs (`/api/shifts`).
  - **Dependencies**: TSK-6.1, TSK-3.4
  - **Verification**: Clocking in creates log; clocking out updates duration columns in DB.

- [x] **TSK-6.4**: Build Payroll Engine & Payslip APIs
  - **Description**: Process wages, add bonuses/incentives, and calculate total pay.
  - **Sub-tasks**:
    - [x] Build calculator calculating net pay (base rate + performance bonus/incentives - deductions).
    - [x] Generate monthly payroll statements and output PDF payslips.
  - **Dependencies**: TSK-6.2, TSK-6.3
  - **Verification**: Running payroll engine logs payslip data and generates printable payroll summaries.

- [x] **TSK-6.5**: Integrate HR Dashboard & Employee UI Screens
  - **Description**: Hook up backend employee endpoints to the admin UI pages.
  - **Sub-tasks**:
    - [x] Build employee listing grid with filter, editing form wizard modal.
    - [x] Develop monthly shift planner visual calendar grid.
    - [x] Implement attendance dashboard widget and payslip action download links.
  - **Dependencies**: TSK-2.5, TSK-6.2, TSK-6.4
  - **Verification**: Changes to employee records, shifts, or payroll are persisted in database and displayed in UI.

---

## Phase 7: Event Management Module (Duration: 2–3 Weeks)

Handle client inquiries, quote generation, scheduling, and inventory reservations for private bookings.

- [x] **TSK-7.1**: Database Migrations for Event Bookings & Quotations
  - **Description**: Set up tables to handle event bookings.
  - **Sub-tasks**:
    - [x] Model `Events` table storing date, client data, guests, type (corporate, wedding, birthday).
    - [x] Model `EventQuotations` containing calculations, invoice rates, deposits, status.
    - [x] Model `EventStaffing` mapping employees to scheduled events.
  - **Dependencies**: TSK-3.2, TSK-4.1
  - **Verification**: Database schemas verified with target structural links.

- [x] **TSK-7.2**: Implement Event Enquiry API & Status Workflow
  - **Description**: Capture website lead inquiries and manage their workflow.
  - **Sub-tasks**:
    - [x] Build `/api/events/enquire` POST route (public access).
    - [x] Build `/api/events/:id/status` PATCH route for coordinators to update states (Enquiry, Quoted, Booked, Completed, Cancelled).
  - **Dependencies**: TSK-7.1, TSK-2.3
  - **Verification**: Public form submits data, which propagates to the admin inbox view immediately.

- [x] **TSK-7.3**: Create Event Quotation & Budget Check Engine
  - **Description**: Automated calculations based on constraints (minimum budgets, wine count totals).
  - **Sub-tasks**:
    - [x] Program budget checks returning warnings if event totals do not satisfy pricing rule configurations.
    - [x] Code dynamic Quotation PDF creation system.
  - **Dependencies**: TSK-7.2
  - **Verification**: Running quotation engine outputs PDF matching calculated totals and highlights violations if below constraints.

- [x] **TSK-7.4**: Implement Event Scheduling & Resource Allocation APIs
  - **Description**: Assign personnel and allocate inventory stock reserves to specific event dates.
  - **Sub-tasks**:
    - [x] Build staff scheduling check resolving double-bookings on event assignments.
    - [x] Build allocation checks to hold product stock amounts for upcoming event dates.
  - **Dependencies**: TSK-7.3, TSK-6.2
  - **Verification**: Scheduling overlaps return conflicts; reserving stock flags warehouse levels.

- [x] **TSK-7.5**: Integrate Event Coordinator Portal UI
  - **Description**: Build management interface for managing bookings, staff, and quotes.
  - **Sub-tasks**:
    - [x] Implement central Event Calendar showing planned bookings.
    - [x] Develop lead-handling list view with details dialog to manage quotes, staffing, and files.
  - **Dependencies**: TSK-2.5, TSK-7.4
  - **Verification**: Coordinator can review enquiries, generate quotations, drag-and-drop bookings, and assign staff.

---

## Phase 8: Customer CRM & Notifications (Duration: 1–2 Weeks)

Implement customer records, purchase tracking, segment lists, loyalty points, and notification triggers.

- [x] **TSK-8.1**: Database Migrations for Customers & CRM
  - **Description**: Model the customer profiles and analytics details.
  - **Sub-tasks**:
    - [x] Migrate `Customers` table (contacts, segment tags, registration date).
    - [x] Migrate loyalty history tables.
  - **Dependencies**: TSK-3.2
  - **Verification**: Verification queries confirm table setup.

- [x] **TSK-8.2**: Implement CRM APIs & Loyalty Tracking Engine
  - **Description**: Process customer updates, segment logic, and loyalty calculations.
  - **Sub-tasks**:
    - [x] Code `/api/customers` CRUD routes.
    - [x] Implement post-transaction hooks updating loyalty points according to invoice totals.
    - [x] Write grouping queries classifying customers by purchase history (Frequent, High-Value, Dormant).
  - **Dependencies**: TSK-8.1, TSK-5.1
  - **Verification**: Checkout calculations automatically increment customer loyalty totals.

- [x] **TSK-8.3**: Set up Notification Service Wrapper Architecture
  - **Description**: Build abstract adapters for email/SMS/WhatsApp alert structures.
  - **Sub-tasks**:
    - [x] Define notification message formats.
    - [x] Create interface adapters linking mock WhatsApp, email, or SMS dispatchers.
  - **Dependencies**: TSK-3.1
  - **Verification**: Service mock logs write message dispatch statements to debug logs.

- [x] **TSK-8.4**: Integrate Customer Management UI
  - **Description**: Develop CRM panels for the admin system.
  - **Sub-tasks**:
    - [x] Build Customer Directory displaying purchase metrics, loyalty status, and segment cards.
    - [x] Add trigger buttons to send notifications.
  - **Dependencies**: TSK-2.5, TSK-8.2
  - **Verification**: UI displays database customer metrics and trigger indicators.

---

## Phase 9: Reports & Business Analytics (Duration: 2–3 Weeks)

Aggregate data across sales, stock, and event bookings to generate executive dashboards.

- [x] **TSK-9.1**: Define SQL Database Views for Aggregate Analytics
  - **Description**: Write optimized views summarizing complex business data.
  - **Sub-tasks**:
    - [x] Create view/query for Sales Trends (daily/monthly revenue, branch comparisons).
    - [x] Create view/query for Inventory Aging and low-stock alerts.
    - [x] Create view/query for Event Profitability (actual costs vs. quotation revenues).
  - **Dependencies**: TSK-4.1, TSK-5.1, TSK-6.1, TSK-7.1
  - **Verification**: Executing SQL views returns aggregate statistics.

- [x] **TSK-9.2**: Implement Reporting API Endpoints
  - **Description**: Serve consolidated datasets to dashboard charts.
  - **Sub-tasks**:
    - [x] Code `/api/reports/sales` endpoint accepting date range filters.
    - [x] Code `/api/reports/inventory` and `/api/reports/events` summary endpoints.
  - **Dependencies**: TSK-9.1
  - **Verification**: GET request payloads return arrays matching filtered dates.

- [x] **TSK-9.3**: Implement Data Export Utility (Excel/CSV/PDF)
  - **Description**: Allow admins to export reporting information.
  - **Sub-tasks**:
    - [x] Code CSV/Excel file stream responses using excel-writer packages.
    - [x] Code PDF export engines compiling summary tables into PDF layouts.
  - **Dependencies**: TSK-9.2
  - **Verification**: Clicking export routes downloads spreadsheet files containing matched DB records.

- [x] **TSK-9.4**: Hook Up Interactive Admin Dashboards
  - **Description**: Connect the UI prototype charts to live backend endpoints.
  - **Sub-tasks**:
    - [x] Replace static mock hooks with Axios API fetch hooks.
    - [x] Configure date-range pickers and branch filter actions to refresh chart states.
  - **Dependencies**: TSK-2.6, TSK-9.3
  - **Verification**: Updating filters triggers API calls and refreshes dashboard charts with correct metrics.

---

## Phase 10: Optimization & Production Launch (Duration: 1–2 Weeks)

Tuning front-end loading, setting indexing, reviewing configurations, and deployment.

- [x] **TSK-10.1**: Frontend Performance Optimization
  - **Description**: Optimize performance and rendering speeds.
  - **Sub-tasks**:
    - [x] Implement lazy-loading on page components and chunk routes.
    - [x] Optimize loading and caching headers for landing page images.
  - **Dependencies**: TSK-2.2, TSK-9.4
  - **Verification**: Lighthouse performance score checks achieve 90+.

- [x] **TSK-10.2**: Database Optimization & Query Tuning
  - **Description**: Tune indices for database scalability.
  - **Sub-tasks**:
    - [x] Write indices on commonly queried keys (`SKU`, `branch_id`, `employee_id`, `invoice_number`).
    - [x] Analyze execution paths of reporting views to ensure fast response times.
  - **Dependencies**: TSK-9.2
  - **Verification**: Query responses take less than 150ms on index keys.

- [x] **TSK-10.3**: Security Auditing & Code Hardening
  - **Description**: Run vulnerability tests and checks before staging.
  - **Sub-tasks**:
    - [x] Add Zod/Joi schemas enforcing backend input validation checks.
    - [x] Verify JWT token rotation policies and security configuration headers.
    - [x] Verify database audit logs write entries on login, billing adjustments, and role updates.
  - **Dependencies**: TSK-3.4
  - **Verification**: API tests block bad request inputs; database audit logs register all system adjustments.

- [x] **TSK-10.4**: Production Environment Provision & Deploy
  - **Description**: Deploy backend, database, and client applications.
  - **Sub-tasks**:
    - [x] Provision production cloud server (e.g. AWS, Vercel, Render).
    - [x] Setup production database instance and execute migrations.
    - [x] Configure environment variables, connect domains, and run production tests.
  - **Dependencies**: TSK-10.3
  - **Verification**: Domain resolves, user logs in, billing functions correctly in production mode.
