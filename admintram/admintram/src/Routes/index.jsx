import { createBrowserRouter } from "react-router-dom";

// Layouts
import AdminLayout from "../components/Layout/AdminLayout";

// Pages – Auth
import AdminLogin from "../pages/Auth/AdminLogin";

// Pages – Admin
import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/admin/UserManagement";
import DocumentApproval from "../pages/admin/DocumentApproval";
import CategoryManager from "../pages/admin/CategoryManager";
import CommentModeration from "../pages/admin/CommentModeration";
import DashboardStats from "../pages/admin/DashboardStats";

// Pages – Public

// Route protection wrappers
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([
  {
    path: "/auth/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "dashboard", element: <DashboardStats /> },
      { path: "users", element: <UserManagement /> },
      { path: "approvals", element: <DocumentApproval /> },
      { path: "categories", element: <CategoryManager /> },
      { path: "comments", element: <CommentModeration /> },
    ],
  },
  {
    path: "*",
    element: <h1>404 – Không tìm thấy trang</h1>,
  },
]);

export default router;
