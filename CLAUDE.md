# MN Chemical CRM — Project Instructions

## Quick Reference
- **Repo**: Pacacia/mnchemical-crm
- **Stack**: .NET 10, React+Vite+TypeScript, PostgreSQL, Docker Compose, QuestPDF
- **Run**: `docker compose up -d` → frontend http://localhost:4000, API http://localhost:8080, Swagger http://localhost:8080/swagger
- **Auth**: bypassed in Development mode. Login: admin/admin123 (for production)
- **GitHub Project**: https://github.com/users/Pacacia/projects/1

## Architecture
Clean Architecture: Domain → Application → Infrastructure → WebApi. Frontend is a separate React SPA in `src/web/`.

## Key Paths
- Backend solution: `src/api/MnChemical.slnx`
- Domain entities: `src/api/MnChemical.Domain/Entities/`
- DTOs: `src/api/MnChemical.Application/DTOs/`
- Service interfaces: `src/api/MnChemical.Application/Services/`
- Service implementations: `src/api/MnChemical.Infrastructure/Services/`
- Controllers: `src/api/MnChemical.WebApi/Controllers/`
- DI registration: `src/api/MnChemical.Infrastructure/DependencyInjection/ServiceCollectionExtensions.cs`
- Program.cs: `src/api/MnChemical.WebApi/Program.cs`
- Frontend pages: `src/web/src/pages/`
- Frontend API clients: `src/web/src/api/`
- Types: `src/web/src/types/index.ts`
- Router: `src/web/src/App.tsx`
- Nav sidebar: `src/web/src/components/Layout.tsx`
- Import script: `scripts/import-data.py`

## Build & Deploy
```bash
# Build backend
cd src/api && dotnet build MnChemical.slnx

# Type-check frontend
cd src/web && npx tsc --noEmit

# Docker rebuild + restart
docker compose build && docker compose up -d

# EF Core migration
cd src/api && dotnet ef migrations add <Name> --project MnChemical.Infrastructure --startup-project MnChemical.WebApi --output-dir Data/Migrations

# Import real data (requires running API)
python3 scripts/import-data.py

# Reimport attendance
curl -X POST http://localhost:8080/api/attendance/import -F "file=@/path/to/raporti.csv"
```

## Patterns to Follow
- New feature = Domain entity → Application DTO + interface → Infrastructure service → WebApi controller → Frontend API client → Frontend page → Register in DI → Add route in App.tsx → Add nav in Layout.tsx
- Use `as const` objects instead of TypeScript enums (erasableSyntaxOnly compatibility)
- DateTime fields sent to API must include `T00:00:00Z` suffix (Npgsql requires UTC)
- All controllers have `[Authorize]` attribute (bypassed in dev via middleware)
- Frontend uses TanStack Query for data fetching with `queryClient.invalidateQueries` after mutations

## Modules
1. **Sales**: Customers, Orders (with line items), status workflow
2. **Documents**: Invoice PDF, Packing List PDF (QuestPDF)
3. **Logistics**: Shipments (linked to orders), Transport costs (linked to shipments)
4. **Warehouse**: 16 material types, lot-level inventory, consumption per shipment
5. **HR**: Employees, Attendance (ZKTeco CSV import), Leave requests with approval
6. **Accounting**: Payments, Receivables, Cash Flow
7. **Auth**: JWT, role-based (Admin, SalesManager, Staff, HrManager, etc.)

## Docker Ports
- PostgreSQL: 5433 (host) → 5432 (container)
- API: 8080 (host) → 5000 (container)
- Frontend: 4000 (host) → 80 (container/nginx)

## Source Data Files
Original business files in `/Users/giorgipatsatsia/repos/mnchemical/`:
- `gayidvebi.xlsx` — sales orders
- `საწყობი.xlsx` — warehouse (12 sheets, packaging materials)
- `raporti.csv` — ZKTeco attendance export
- `mnchemical-requirements.xlsx` — requirements spec (5 modules)
- `invoice.docx`, `packing list.docx` — document templates
- `გადაზიდვის ინვოისი.pdf` — sample transport invoice
