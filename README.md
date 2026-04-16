# MN Chemical CRM

CRM system for **MN Chemical Georgia LLC** — a chemical manufacturer in Rustavi, Georgia producing and exporting Manganese (II) Oxide (MnO) and Manganese Dioxide (MnO2).

## Modules

| Module | Description |
|--------|-------------|
| **Sales** | Customer management, order pipeline (New → Confirmed → Shipped → Paid), line items |
| **Documents** | Auto-generated commercial invoices and packing lists (PDF) |
| **Logistics** | Shipment tracking with containers/batches, transport cost matching to carrier invoices |
| **Warehouse** | Packaging materials inventory with lot-level traceability (international certification requirement) |
| **HR** | Employee attendance (ZKTeco integration), leave management with approval workflow, monthly reports |
| **Accounting** | Payment tracking, receivables (per-order outstanding), cash flow (income + expenses) |
| **Auth** | JWT authentication, role-based access control (Admin, SalesManager, Staff, HR, Accounting, Production) |

## Tech Stack

- **Backend**: .NET 10 Web API (Clean Architecture)
- **Frontend**: React + TypeScript + Vite
- **Database**: PostgreSQL 17 (EF Core Code First)
- **PDF**: QuestPDF
- **Auth**: JWT + BCrypt
- **Infrastructure**: Docker Compose

## Getting Started

```bash
# Clone
git clone https://github.com/Pacacia/mnchemical-crm.git
cd mnchemical-crm

# Start everything
docker compose up -d

# Import sample data (optional)
pip3 install requests
python3 scripts/import-data.py

# Import attendance data (optional)
curl -X POST http://localhost:8080/api/attendance/import -F "file=@/path/to/raporti.csv"
```

### URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4000 |
| API | http://localhost:8080 |
| Swagger | http://localhost:8080/swagger |

Auth is bypassed in Development mode. For production, set `ASPNETCORE_ENVIRONMENT=Production` and login with `admin` / `admin123`.

## Project Structure

```
mnchemical-crm/
├── docker-compose.yml
├── scripts/
│   └── import-data.py          # Import real business data
├── src/
│   ├── api/                    # .NET Backend
│   │   ├── MnChemical.Domain/          # Entities, enums
│   │   ├── MnChemical.Application/     # DTOs, service interfaces
│   │   ├── MnChemical.Infrastructure/  # EF Core, service implementations
│   │   └── MnChemical.WebApi/          # Controllers, Program.cs
│   └── web/                    # React Frontend
│       └── src/
│           ├── api/            # API clients
│           ├── components/     # Layout, shared components
│           ├── pages/          # All page components
│           └── types/          # TypeScript type definitions
└── .github/workflows/          # CI/CD (planned)
```

## API Endpoints

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/login`, `GET /api/auth/me`, `GET /api/auth/users` |
| Customers | `GET/POST /api/customers`, `GET/PUT/DELETE /api/customers/{id}` |
| Orders | `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/{id}`, `PATCH /api/orders/{id}/status` |
| Invoices | `GET /api/invoice/{orderId}/invoice`, `GET /api/invoice/{orderId}/packing-list` |
| Shipments | `GET/POST /api/shipments`, `GET/PUT/DELETE /api/shipments/{id}` |
| Transport | `GET/POST /api/transport`, `GET /api/transport/unmatched-shipments` |
| Warehouse | `GET /api/warehouse/materials`, `GET/POST /api/warehouse/lots`, `POST /api/warehouse/consumption`, `GET /api/warehouse/inventory` |
| Employees | `GET/POST /api/employees`, `GET/PUT/DELETE /api/employees/{id}` |
| Attendance | `GET /api/attendance/today`, `GET /api/attendance`, `POST /api/attendance/import`, `GET /api/attendance/monthly` |
| Leave | `GET/POST /api/leave`, `PATCH /api/leave/{id}/review` |
| Accounting | `GET/POST /api/accounting/payments`, `GET /api/accounting/receivables`, `GET /api/accounting/cashflow` |
