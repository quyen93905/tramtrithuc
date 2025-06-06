import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import showToast from "../utils/toast";

export default function AdminRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { userInfo } = useSelector((state) => state.user);

  // Fallback to localStorage if Redux state is not yet populated (e.g., initial load)
  const savedUserInfo = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null;
  const token = localStorage.getItem("accessToken");

  // If no token or userInfo, redirect to login
  if (!token || !savedUserInfo) {
    showToast("error", "Vui lòng đăng nhập để truy cập!");
    return <Navigate to="/auth/login" replace />;
  }

  // If Redux state is not yet updated, use localStorage as a temporary check
  if (!isAuthenticated || !userInfo) {
    if (savedUserInfo.role === "admin") {
      return children; // Allow temporary access until Redux updates
    }
    showToast("error", "Vui lòng đăng nhập lại để truy cập!");
    return <Navigate to="/auth/login" replace />;
  }

  // Check admin role
  if (userInfo.role !== "admin") {
    showToast("error", "Bạn không có quyền truy cập trang này.");
    return <Navigate to="/" replace />;
  }

  return children;
}
