# Almunim — Aluminium Management System (Frontend)

React + Vite + Tailwind CSS frontend for the Aluminium Management System.
Connects to the existing C# ASP.NET Core Web API (AluminiumManagementAPI).

## Pages

| Page | Route | Purpose |
|---|---|---|
| Login | `/login` | Authenticate against the Users table |
| Dashboard | `/` | Key stats + recent sales |
| Products | `/products` | List / Add / Edit / Delete aluminium products |
| Customers | `/customers` | List / Add / Edit / Delete customers |
| Sales | `/sales` | List / Record / Delete sales |
| Users | `/users` | List / Add / Edit / Delete users + role assignment |
| Reports | `/reports` | Filter sales by customer, product, and date range + CSV export |
| About | `/about` | Project info and contact details |

> Note: the original brief listed "Categories" and "Orders" pages, but the
> SQL schema (`project SQL.sql`) only has **Roles, Users, Customers,
> AluminiumProducts, Sales** — so those two pages were swapped for **Users**
> and kept **Reports**, which better match the real database.

## Components

- `Sidebar.jsx` — left navigation with icons, collapses on mobile
- `Navbar.jsx` — top bar with page title, user info, logout
- `DashboardLayout.jsx` — wraps Sidebar + Navbar around each page
- `Modal.jsx` — reusable popup used for all Add/Edit forms
- `ProtectedRoute.jsx` — redirects to `/login` if not authenticated

## Getting Started

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

## ⚠️ Connecting to the Backend (important)

1. Open `src/api/api.js` and set `API_BASE_URL` to match your
   ASP.NET Core project's URL. Check
   `AluminiumManagementAPI/Properties/launchSettings.json` for the
   `applicationUrl` (e.g. `https://localhost:7123` or `http://localhost:5123`),
   then set:

   ```js
   export const API_BASE_URL = "https://localhost:XXXX/api";
   ```

2. **Enable CORS** in your backend's `Program.cs` so the browser can call it
   from `http://localhost:5173`:

   ```csharp
   builder.Services.AddCors(options =>
   {
       options.AddPolicy("AllowReact", policy =>
       {
           policy.WithOrigins("http://localhost:5173")
                 .AllowAnyHeader()
                 .AllowAnyMethod();
       });
   });

   // ...

   app.UseCors("AllowReact");
   ```

3. **Match your controller routes.** This frontend assumes standard
   `[Route("api/[controller]")]` controllers named after the tables:

   - `GET/POST /api/Products`, `PUT/DELETE /api/Products/{id}`
   - `GET/POST /api/Customers`, `PUT/DELETE /api/Customers/{id}`
   - `GET/POST /api/Sales`, `DELETE /api/Sales/{id}`
   - `GET/POST /api/Users`, `PUT/DELETE /api/Users/{id}`
   - `GET /api/Roles`
   - `POST /api/Auth/login`

   If your controller class names differ (e.g. `AluminiumProductsController`
   instead of `ProductsController`, or you don't have an `AuthController`
   yet), update the endpoint strings inside `src/pages/*.jsx` to match.

4. The JSON field names used in the frontend (`profileName`, `pricePerMeter`,
   `customerId`, `roleId`, etc.) follow C#'s default camelCase JSON
   serialization of your SQL columns. If your API returns different casing
   (e.g. `ProductID` instead of `productId`), the components already check
   both common variants (`p.productId || p.productID`) — but double check
   against your actual API response in the browser DevTools Network tab.

## Build for production

```bash
npm run build
```

Output goes to `dist/`.
