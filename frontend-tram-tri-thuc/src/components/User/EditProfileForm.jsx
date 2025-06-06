import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useMemo } from "react";
import { deleteMyAccount, updateUserInfo } from "../../store/slices/userSlice";
import { logoutThunk } from "../../store/slices/authSlice";
import { AnimatePresence, motion } from "framer-motion";
import { FaSignOutAlt, FaCamera, FaCheck, FaTimes, FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import showToast from "../../utils/toast";
import defaultAvatar from "../../assets/default-avatar.png";

const EditProfileForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userInfo, loading: userLoading, error: userError } = useSelector((state) => state.user);

    const initialFormData = useMemo(
        () => ({
            name: userInfo?.name || "",
            avatar: userInfo?.avatar || "",
        }),
        [userInfo]
    );

    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({ name: "", avatar: "" });
    const [avatarPreview, setAvatarPreview] = useState(userInfo?.avatar || "");
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        setFormData(initialFormData);
        setAvatarPreview(userInfo?.avatar || "");
        setFormErrors({ name: "", avatar: "" });
    }, [initialFormData, userInfo]);

    const validateForm = () => {
        let isValid = true;
        const errors = { name: "", avatar: "" };

        if (!formData.name.trim()) {
            errors.name = "Tên không được để trống";
            isValid = false;
        }

        if (formData.avatar && !/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i.test(formData.avatar)) {
            errors.avatar = "Avatar phải là URL hình ảnh hợp lệ";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                await dispatch(updateUserInfo(formData)).unwrap();
                setIsEditing(false);
                showToast("success", "Cập nhật hồ sơ thành công!");
            } catch (error) {
                console.error("Update failed:", error);
                showToast("error", error.message || "Cập nhật hồ sơ thất bại!");
            }
        }
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setAvatarPreview(userInfo?.avatar || "");
        setFormErrors({ name: "", avatar: "" });
        setIsEditing(false);
    };

    const handleAvatarChange = (e) => {
        const url = e.target.value;
        setFormData({ ...formData, avatar: url });
        setAvatarPreview(url);
        setFormErrors({ ...formErrors, avatar: "" });
    };

    const handleLogout = async () => {
        try {
            await dispatch(logoutThunk()).unwrap();
            localStorage.removeItem("accessToken");
            showToast("success", "Đăng xuất thành công!");
            navigate("/auth/login");
        } catch (error) {
            showToast("error", error.message || "Có lỗi xảy ra khi đăng xuất!");
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await dispatch(deleteMyAccount()).unwrap();
            showToast("success", "Tài khoản đã được xóa!");
            setShowDeleteModal(false);
            localStorage.removeItem("accessToken");
            navigate("/auth/login");
        } catch (error) {
            showToast("error", error.message || "Xóa tài khoản thất bại!");
            console.error("Delete failed:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden py-12">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
            </div>
            <div className="max-w-3xl mx-auto px-4 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                        <div className="flex items-center">
                            <div className="relative group">
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-md">
                                    <img
                                        src={avatarPreview || defaultAvatar}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.target.src = defaultAvatar)}
                                    />
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => document.getElementById("avatar-input").focus()}
                                        className="absolute bottom-2 right-2 bg-white p-2 rounded-xl shadow-lg border border-gray-100 hover:border-blue-400 hover:text-blue-600"
                                    >
                                        <FaCamera className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="ml-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                    {userInfo?.name || "Người dùng"}
                                </h2>
                                <p className="text-gray-500">{userInfo?.email || "Chưa có email"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 md:self-start">
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
                                >
                                    <FaEdit className="w-5 h-5 mr-2" />
                                    Chỉnh sửa
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                                <FaSignOutAlt className="w-5 h-5 mr-2" />
                                Log Out
                            </button>
                        </div>
                    </div>

                    {userError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-red-600 text-center">
                                {userError.message ||
                                    userError.userError?.join(", ") ||
                                    "Có lỗi xảy ra khi cập nhật"}
                            </p>
                        </div>
                    )}

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL Avatar
                                </label>
                                <input
                                    id="avatar-input"
                                    type="text"
                                    value={formData.avatar}
                                    onChange={handleAvatarChange}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.avatar ? "border-red-500" : "border-gray-200"
                                    }`}
                                    placeholder="Nhập URL hình ảnh của bạn"
                                />
                                {formErrors.avatar && (
                                    <p className="mt-2 text-sm text-red-500">{formErrors.avatar}</p>
                                )}
                            </div>

                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên hiển thị
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        formErrors.name ? "border-red-500" : "border-gray-200"
                                    }`}
                                    placeholder="Nhập tên của bạn"
                                />
                                {formErrors.name && (
                                    <p className="mt-2 text-sm text-red-500">{formErrors.name}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl"
                                >
                                    <FaTimes className="inline-block mr-2" /> Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={userLoading}
                                    className={`px-6 py-3 rounded-xl font-medium ${
                                        userLoading
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-100"
                                    } text-white`}
                                >
                                    {userLoading ? (
                                        <span className="flex items-center">
                                            <svg
                                                className="animate-spin h-5 w-5 mr-2"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Đang lưu...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <FaCheck className="inline-block mr-2" /> Lưu thay đổi
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">URL Avatar</h3>
                                <p className="text-gray-900">{formData.avatar || "Chưa có URL avatar"}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Tên hiển thị</h3>
                                <p className="text-gray-900">{formData.name || "Chưa có tên"}</p>
                            </div>
                        </div>
                    )}

                    <div className="border-t border-gray-100 mt-8 pt-6">
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
                        >
                            <FaTrash className="w-4 h-4 mr-2" />
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-6">
                                    <FaTrash className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Xác nhận xóa tài khoản
                                </h3>
                                <p className="text-gray-600 mb-8">
                                    Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác và tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteLoading}
                                        className={`px-6 py-3 rounded-xl font-medium ${
                                            deleteLoading
                                                ? "bg-red-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-100"
                                        } text-white`}
                                    >
                                        {deleteLoading ? (
                                            <span className="flex items-center">
                                                <svg
                                                    className="animate-spin h-5 w-5 mr-2"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    />
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    />
                                                </svg>
                                                Đang xóa...
                                            </span>
                                        ) : (
                                            "Xóa tài khoản"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditProfileForm;