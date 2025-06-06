import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Settings,
  Users,
  Activity,
  Shield,
  Calendar,
} from "lucide-react";
import customAxios from "../../utils/customAxios";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await customAxios.get("/admin/users", {
          params: { page: currentPage, limit: pageSize },
        });
        if (response.data.success) {
          const fetchedUsers = response.data.data.users.map((user) => ({
            id: user._id,
            username: user.name,
            email: user.email,
            role: user.role === "uploader" ? "admin" : "user", // Map "uploader" to "admin", "member" to "user"
            status: user.isActive ? "active" : "blocked",
            createdAt: new Date(user.createdAt).toISOString().split("T")[0], // Format to "YYYY-MM-DD"
            avatar: user.avatar || "https://via.placeholder.com/32", // Fallback avatar if null or empty
            lastLogin: new Date(user.updatedAt).toISOString().split("T")[0], // Use updatedAt as lastLogin
            loginCount: 0, // Not available in API; set to 0
          }));
          setUsers(fetchedUsers);
          setTotalItems(response.data.data.pagination.totalItems);
          setTotalPages(response.data.data.pagination.totalPages);
        } else {
          setError("Failed to fetch users");
        }
      } catch (err) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [currentPage, pageSize]);

  const stats = {
    total: totalItems,
    active: users.filter((u) => u.status === "active").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const handleStatusChange = (userId, newStatus) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const StatusBadge = ({ status }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200 ${
        status === "active"
          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
          : "bg-red-100 text-red-800 border border-red-200"
      }`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-1.5 ${
          status === "active" ? "bg-emerald-400" : "bg-red-400"
        }`}
      ></div>
      {status === "active" ? "Hoạt động" : "Đã khóa"}
    </span>
  );

  const RoleBadge = ({ role }) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        role === "admin"
          ? "bg-purple-100 text-purple-800 border border-purple-200"
          : "bg-blue-100 text-blue-800 border border-blue-200"
      }`}
    >
      {role === "admin" ? (
        <Shield className="w-3 h-3 mr-1" />
      ) : (
        <Users className="w-3 h-3 mr-1" />
      )}
      {role === "admin" ? "Người đăng tài liệu " : "Người dùng"}
    </span>
  );

  const UserCard = ({ user }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                user.status === "active" ? "bg-emerald-400" : "bg-red-400"
              }`}
            ></div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RoleBadge role={user.role} />
          <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Trạng thái:</span>
          <StatusBadge status={user.status} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Đăng nhập cuối:</span>
          <span className="text-gray-700">{user.lastLogin}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Số lần đăng nhập:</span>
          <span className="font-medium text-gray-700">{user.loginCount}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">Tạo: {user.createdAt}</span>
        <div className="flex items-center space-x-2">
          <button className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors duration-200">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors duration-200">
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-200">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header with gradient background */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Quản lý người dùng
              </h1>
            </div>
            <p className="text-gray-600">
              Quản lý và theo dõi người dùng trong hệ thống
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() =>
                setViewMode(viewMode === "table" ? "card" : "table")
              }
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-medium">
                {viewMode === "table" ? "Xem thẻ" : "Xem bảng"}
              </span>
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
              <UserPlus className="w-4 h-4" />
              <span className="text-sm font-medium">Thêm người dùng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hoạt động</p>
              <p className="text-2xl font-bold text-emerald-600">
                {stats.active}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã khóa</p>
              <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-xl">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Người đăng tài liệu
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.admins}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="blocked">Đã khóa</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Người dùng</option>
              <option value="admin">Người đăng tài liệu</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      {loading ? (
        <div className="text-center py-10 text-gray-600">
          Đang tải dữ liệu...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">{error}</div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                          <div
                            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                              user.status === "active"
                                ? "bg-emerald-400"
                                : "bg-red-400"
                            }`}
                          ></div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} />
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm text

-gray-600"
                    >
                      <div className="space-y-1">
                        <div>Cuối: {user.lastLogin}</div>
                        <div className="text-xs text-gray-500">
                          {user.loginCount} lần
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{user.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors duration-200">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Hiển thị</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1); // Reset to first page when page size changes
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <span>trên tổng số {totalItems} kết quả</span>
              </div>

              <nav className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 bg-white hover:bg-gray-50"
                      } transition-colors duration-200`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
