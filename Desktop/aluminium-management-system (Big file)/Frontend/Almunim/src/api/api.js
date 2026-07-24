import axios from "axios";

// ⚠️ IMPORTANT: Update this to match your ASP.NET Core backend URL and port.
// Check Properties/launchSettings.json in the AluminiumManagementAPI project
// for the correct "applicationUrl" (e.g. https://localhost:7123 or http://localhost:5123)
export const API_BASE_URL = "https://localhost:7123/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach a simple response interceptor so every failed call gives a readable
// error message back to the page instead of a raw axios error object.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data ||
      error.message ||
      "Something went wrong. Please try again.";
    return Promise.reject(new Error(typeof message === "string" ? message : "Request failed"));
  }
);

export default api;

/*
  NOTE ON ENDPOINT NAMES
  -----------------------
  These calls assume standard ASP.NET Core controller routes generated from
  your table names (ApiController + [Route("api/[controller]")]):

    GET    /api/Products
    GET    /api/Products/{id}
    POST   /api/Products
    PUT    /api/Products/{id}
    DELETE /api/Products/{id}

    GET/POST/PUT/DELETE  /api/Customers
    GET/POST/PUT/DELETE  /api/Sales
    GET/POST/PUT/DELETE  /api/Users
    GET                  /api/Roles
    POST                 /api/Auth/login   (or /api/Users/login)

  If your controller class names or route attributes are different
  (e.g. AluminiumProductsController instead of ProductsController),
  just update the endpoint strings in src/pages/*.jsx to match.
*/
