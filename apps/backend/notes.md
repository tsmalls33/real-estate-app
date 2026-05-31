# TODO

- [x] Authentication & Authorization with RBAC
- [x] Create guard
- [x] Tenant routes
- [x] Add seed users and tenants
- [ ] Add the repository layer?
- [x] Fix all the type errors from the renaming and types package
- [ ] Write spec tests
- [ ] Separate service and repository for current modules (before making new ones)
- [ ] Add theme column to Tenant table or add TenantTheme table
- [ ] Move src/utils to a new package at packages/utils and import from there?
- [ ] Add validation to prevent orphaned costs. Needs to have or id_property or id_reservation, but not both null. Can be done with a check constraint in the DB and validation in the service layer.

## DB Models

### `users`

| Field | Type | Description |
| ------------- | -------- | ------------------------------------------- |
| id_user | UUID PK | |
| email | string | |
| passwordHash | string | |
| fullName | string | |
| role | enum | `client`, `employee`, `admin`, `superadmin` |
| id_tenant | UUID FK | Refers to `tenants.id` |
| createdAt | datetime | |
| updatedAt | datetime | |

### `tenants`

| Field | Type | Description |
| ------------- | -------- | --------------------------- |
| id_tenant | UUID PK | Tenant ID |
| name | string | Agency name |
| users | User[] | Refers to `users.tenant_id` |
| customDomain | string | `agency-1.com` |
| id_plan | UUID FK | Refers to `plans.id` |
| createdAt | datetime | |
| updatedAt | datetime | |

### properties

| Field | Type | Description |
| ------------- | -------------- | - |
| id_property | UUID PK | Property id |
| propertyName | string | |
| propertyAddress | string | Property address |
| propertyDescription | text | Description of the property |
| reservations | Reservation[] | list from reservation table |
| costs | Cost[] | list from costs table |
| photos | string[] | url for image files |
| coverImage | string | url for cover image |
| feeRules | FeeRules[] | Enum or list forom a table |
| agentFeePercentage | number | percentage fee for the agent for this property |
| propertyStats | PropertyStatsObject | from stats table |
| id_owner | UUID FK | `id_user` of the owner, nullable |
| salePrice | number | Price if on sale, nullable |
| saleType | ENUM('rent', 'sale') | type of property and price |
| id_tenant | UUID FK | `id_tenant` of the agency who has this property |

### property_stats

| Field | Type | Description |
| - | - | - |
| id_property | UUID FK | References `id` from `properties` table |
| numberOfBedrooms | number | Total bedrooms in the property |
| numberOfBathrooms | number | Total bathrooms (full + half) |
| sizeSquareMeters | number | Living area in square meters |
| propertyType | enum | Type (APARTMENT, HOUSE, VILLA, etc.) |
| neighborhood | string | Neighborhood name (optional) |
| yearBuilt | number | Construction year |
| floorNumber | number | Floor level in building |
| hasElevator | boolean | Building has elevator |
| hasGarage | boolean | Parking garage availability |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### reservations

| Field | Type | Description |
| - | - | - |
| id_reservation | UUID PK | Reservation id |
| guestName | string | Name of the guest |
| startDate | date | Start date of reservation |
| endDate | date | End date of reservation |
| totalPrice | number | Total price of the reservation |
| numberbOfGuests | number | Number of guests |
| costs | Cost[] | List from costs table |
| platform | enum | Platform (BOOKING_COM, AIRBNB, OTHER) |
| id_property | UUID FK | References `id_property` from properties table |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### costs

| Field | Type | Description |
| - | - | - |
| id_cost | UUID PK | Cost id |
| id_property | UUID FK | References `id_property` from properties table |
| id_reservation | UUID FK | References `id_reservation` from reservations table |
| costType | enum | Type (CLEANING, TAX, PLATFORM_FEE, etc.) |
| date | date | Date of the cost |
| amount | decimal | Amount of the cost |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### agentPayments

| Field | Type | Description |
| - | - | - |
| id_agent_payment | Integer PK | Payment id |
| dueDate | Date | Due date |
| amount | Float | Amount |
| isPaid | Boolean | Paid status (default false) |
| id_user | Integer FK | References `user.id` |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### photos

| Field | Type | Description |
| - | - | - |
| id_photo | Integer PK | Photo id |
| filename | String(100) | Filename (not null) |
| id_property | Integer FK | References `property.id` |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### clients

| Field | Type | Description |
| - | - | - |
| id_client | Integer PK | Client id |
| firstName | String(40) | First name (not null) |
| lastName | String(40) | Last name |
| email | String(30) | Email (unique) |
| phoneNb | String(30) | Phone number |
| notes | Text | Notes |
| id_user | Integer FK | References `user.id` |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

### feeRules

| Field | Type | Description |
| - | - | - |
| id_fee_rule | Integer PK | Rule id |
| name | String | Name (unique, not null) |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |
