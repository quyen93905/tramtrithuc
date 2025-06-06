import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import showToast from "../utils/toast";

export default function UploaderRoute({ children }) {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { userInfo } = useSelector((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" />;
    }
    if (!userInfo || !["uploader", "admin"].includes(userInfo.role)) {
        showToast("error", "Bạn không có quyền truy cập vào trang này.");
        return <Navigate to="/" />;
    }

    return children;
}
