import React, { useState, useEffect } from "react";
import customAxios from "../../utils/customAxios";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    slug: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for modal visibility
  const [categoryToDelete, setCategoryToDelete] = useState(null); // State for category to delete

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await customAxios.get("/admin/categories", {
        params: { page: currentPage, limit: pageSize },
      });
      if (response.data.success) {
        const mappedCategories = response.data.data.categories.map((cat) => ({
          id: cat._id,
          name: cat.name,
          description: cat.description || "No description available",
          documentCount: cat.documentCount || 0,
          createdAt: new Date(cat.createdAt).toISOString().split("T")[0],
        }));
        setCategories(mappedCategories);
        setTotalItems(response.data.data.pagination.totalItems);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (err) {
      setError(err.message || "Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, pageSize]);

  const handleAdd = async () => {
    if (
      newCategory.name.trim() &&
      newCategory.description.trim() &&
      newCategory.slug.trim()
    ) {
      try {
        const response = await customAxios.post("/admin/categories", {
          name: newCategory.name,
          description: newCategory.description,
          slug: newCategory.slug,
        });
        if (response.data.success) {
          await fetchCategories();
          setNewCategory({ name: "", description: "", slug: "" });
        } else {
          setError("Failed to create category");
        }
      } catch (err) {
        setError(err.message || "Error creating category");
      }
    } else {
      setError("Tên, mô tả và slug là bắt buộc");
    }
  };

  const handleEdit = (category) => {
    setEditingCategory({
      ...category,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
    });
  };

  const handleUpdate = async () => {
    if (
      editingCategory &&
      editingCategory.name.trim() &&
      editingCategory.description.trim()
    ) {
      try {
        const response = await customAxios.put(
          `/admin/categories/${editingCategory.id}`,
          {
            name: editingCategory.name,
            description: editingCategory.description,
            slug:
              editingCategory.slug ||
              editingCategory.name.toLowerCase().replace(/\s+/g, "-"),
          }
        );
        if (response.data.success) {
          await fetchCategories();
          setEditingCategory(null);
        } else {
          setError("Failed to update category");
        }
      } catch (err) {
        setError(err.message || "Error updating category");
      }
    } else {
      setError("Tên và mô tả là bắt buộc");
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        const response = await customAxios.delete(
          `/admin/categories/${categoryToDelete.id}`
        );
        if (response.data.success) {
          await fetchCategories();
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        } else {
          setError("Failed to delete category");
        }
      } catch (err) {
        setError(err.message || "Error deleting category");
      }
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Quản lý danh mục
          </h1>
          <p className="text-gray-600 text-lg">
            Tổ chức và quản lý các danh mục tài liệu của bạn
          </p>
        </div>

        {/* Form thêm danh mục mới */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center mb-6">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Thêm danh mục mới
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tên danh mục
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                placeholder="Nhập tên danh mục"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Slug
              </label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, slug: e.target.value })
                }
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                placeholder="Nhập slug (e.g., cong-nghe)"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Mô tả
              </label>
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white/50"
                placeholder="Nhập mô tả danh mục"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 text-sm font-medium">{error}</div>
          )}

          <button
            onClick={handleAdd}
            className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ✨ Thêm danh mục
          </button>
        </div>

        {/* Danh sách danh mục */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
            <h3 className="text-xl font-bold text-gray-800">
              Danh sách danh mục
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-600">
              Đang tải dữ liệu...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tên danh mục
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Mô tả
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Số tài liệu
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full text-white text-sm font-bold">
                            {index + 1 + (currentPage - 1) * pageSize}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          {editingCategory?.id === category.id ? (
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  name: e.target.value,
                                })
                              }
                              className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          ) : (
                            <div className="text-sm font-bold text-gray-900">
                              {category.name}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {editingCategory?.id === category.id ? (
                            <input
                              type="text"
                              value={editingCategory.description}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  description: e.target.value,
                                })
                              }
                              className="border-2 border-blue-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                          ) : (
                            <div className="text-sm text-gray-600">
                              {category.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                            📁 {category.documentCount} tài liệu
                          </span>
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-600 font-medium">
                          {category.createdAt}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex space-x-3">
                            {editingCategory?.id === category.id ? (
                              <button
                                onClick={handleUpdate}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-500/50 transform hover:scale-105 transition-all duration-200 shadow-md"
                              >
                                ✓ Lưu
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEdit(category)}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transform hover:scale-105 transition-all duration-200 shadow-md"
                              >
                                ✏️ Sửa
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transform hover:scale-105 transition-all duration-200 shadow-md"
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phân trang hiện đại */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-700 font-medium">
                    Hiển thị{" "}
                    <span className="font-bold text-blue-600">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    đến{" "}
                    <span className="font-bold text-blue-600">
                      {Math.min(currentPage * pageSize, totalItems)}
                    </span>{" "}
                    trong số{" "}
                    <span className="font-bold text-blue-600">
                      {totalItems}
                    </span>{" "}
                    danh mục
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`inline-flex items-center px-4 py-2 text-sm font-bold ${
                            currentPage === page
                              ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600"
                              : "text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-blue-300"
                          } rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm`}
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
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Xác nhận xóa danh mục
              </h3>
              <p className="text-gray-600 mb-6">
                Bạn có chắc chắn muốn xóa danh mục{" "}
                <span className="font-semibold text-red-600">
                  {categoryToDelete?.name}
                </span>{" "}
                không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-gray-300/50 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-all duration-200"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManager;
