# Endpoint Plan

## Plan Endpoints

### GET /plans

- Lists all subscription plans available in the system
- Useful for displaying plan options to potential tenants or in admin dashboards
- Can filter by active/inactive status to show only current offerings

### GET /plans/:id

- Retrieves detailed information about a specific plan
- Shows how many tenants are currently using this plan
- Needed when assigning a plan to a tenant or viewing plan analytics

### POST /plans

- Creates a new subscription plan (e.g., "Basic", "Premium", "Enterprise")
- Only accessible by superadmins who manage the platform
- Required when launching new pricing tiers or business models

### PATCH /plans/:id

- Updates plan details like name or active status
- Allows deprecating old plans by setting isActive to false
- Superadmin-only for maintaining the subscription structure

### DELETE /plans/:id

- Soft-deletes a plan by marking it inactive
- Prevents deletion if any tenants are actively using the plan
- Protects existing tenant subscriptions while retiring outdated options

## Property Endpoints

### GET /properties

- Lists all properties, with filters for status, saleType, tenant, and agent
- Core endpoint for browsing available properties for rent or sale
- Supports pagination since property lists can grow large

### GET /properties/:id

- Retrieves full details of a single property including its stats, photos, and fee rules
- Used when a client or agent wants to view a property in depth

### POST /properties

- Creates a new property record with address, description, pricing, and ownership info
- The starting point for onboarding a new property into the platform

### PATCH /properties/:id

- Updates any editable fields including name, description, price, agent fee, sale type, and status
- Covers all property updates including status transitions like AVAILABLE_RENTAL → UNDER_RENTAL

### DELETE /properties/:id

- Soft-deletes a property by setting isDeleted to true
- Preserves historical reservation and cost data linked to the property

### GET /properties/:id/reservations

- Lists all reservations for a property
- Filterable by: date range (startDate, endDate), status (UPCOMING, ACTIVE, COMPLETED, CANCELLED), and platform (AIRBNB, BOOKING, OTHER)
- Useful for tracking booking history, occupancy, and upcoming stays

### GET /properties/:id/costs

- Lists all costs linked to a property
- Filterable by: date range, cost type (CLEANING, TAX, PLATFORM_FEE, OTHER), and whether linked to a specific reservation
- Essential for generating expense reports and calculating net income per property

## Cost Endpoints

### GET /costs

- Lists all costs across all properties and reservations
- Filterable by: date range, cost type (CLEANING, TAX, PLATFORM_FEE, OTHER), property, reservation, and tenant
- Useful for a global expense dashboard or accounting overview at the admin level

### GET /costs/:id

- Retrieves a single cost record in detail
- Useful when inspecting or auditing a specific expense entry

### POST /costs

- Creates a new cost record linked to a property and/or a specific reservation
- Used when logging an expense like a cleaning fee, platform charge, or tax payment
- Both id_property and id_reservation are optional but at least one should be required

### PATCH /costs/:id

- Updates a cost's amount, date, or type
- Needed to correct data entry mistakes or update pending costs

### DELETE /costs/:id

- Permanently deletes a cost record (hard delete since costs have no isDeleted field)
- Should be restricted to admins to protect financial data integrity
