import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Check, X, FileText, Calendar, User, Tag } from "lucide-react";
import axios from "axios";

const DocumentApproval = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch documents from API
    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await axios.get("http://localhost:5000/api/v1/admin/document", {
                params: { page: currentPage, limit: pageSize },
            });
            if (response.data.success) {
                const mappedDocuments = response.data.data.documents.map((doc) => ({
                    id: doc._id,
                    title: doc.title,
                    author: doc.author?.name || "Unknown",
                    category: doc.category,
                    status: doc.status || "pending",
                    submittedAt: new Date(doc.createdAt).toISOString().split("T")[0],
                    description: doc.description || "No description available",
                }));
                setDocuments(mappedDocuments);
                setTotalItems(response.data.data.pagination.totalItems);
                setTotalPages(response.data.data.pagination.totalPages);
            } else {
                setError("Failed to fetch documents");
            }
        } catch (err) {
            setError(err.message || "Error fetching documents");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [currentPage, pageSize]);

    const handleApprove = async (docId) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/v1/admin/approveDocument`, {
                documentId: docId,
            });
            if (response.data.success) {
                // Refresh the document list after approval
                await fetchDocuments();
            } else {
                setError("Failed to approve document");
            }
        } catch (err) {
            setError(err.message || "Error approving document");
        }
    };

    const handleReject = async (docId) => {
        try {
            const response = await axios.put(`http://localhost:5000/api/v1/admin/rejectDocument`, {
                documentId: docId,
            });
            if (response.data.success) {
                // Refresh the document list after rejection
                await fetchDocuments();
            } else {
                setError("Failed to reject document");
            }
        } catch (err) {
            setError(err.message || "Error rejecting document");
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case "approved":
                return {
                    color: "from-emerald-500 to-green-600",
                    bg: "bg-emerald-50",
                    text: "text-emerald-700",
                    label: "Đã duyệt",
                    icon: Check,
                };
            case "rejected":
                return {
                    color: "from-red-500 to-rose-600",
                    bg: "bg-red-50",
                    text: "text-red-700",
                    label: "Đã từ chối",
                    icon: X,
                };
            default:
                return {
                    color: "from-amber-500 to-orange-600",
                    bg: "bg-amber-50",
                    text: "text-amber-700",
                    label: "Chờ duyệt",
                    icon: FileText,
                };
        }
    };

    const filteredDocs = documents.filter((doc) => {
        const matchesSearch =
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                            Quản lý duyệt tài liệu
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Duyệt và quản lý tài liệu một cách hiệu quả
                        </p>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên tài liệu hoặc tác giả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-500"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-12 pr-8 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 min-w-48"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="pending">Chờ duyệt</option>
                                    <option value="approved">Đã duyệt</option>
                                    <option value="rejected">Đã từ chối</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Document Cards */}
                {loading ? (
                    <div className="text-center py-10 text-gray-600">Đang tải dữ liệu...</div>
                ) : error ? (
                    <div className="text-center py-10 text-red-600">{error}</div>
                ) : (
                    <div className="grid gap-6">
                        {filteredDocs.map((doc) => {
                            const statusConfig = getStatusConfig(doc.status);
                            const StatusIcon = statusConfig.icon;

                            return (
                                <div
                                    key={doc.id}
                                    className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div
                                                        className={`w-12 h-12 rounded-xl bg-gradient-to-r ${statusConfig.color} flex items-center justify-center shadow-lg`}
                                                    >
                                                        <StatusIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors duration-200">
                                                            {doc.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm mt-1">
                                                            {doc.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-indigo-500" />
                                                        <span>Tác giả: {doc.author}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Tag className="w-4 h-4 text-purple-500" />
                                                        <span>Danh mục: {doc.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-blue-500" />
                                                        <span>Ngày gửi: {doc.submittedAt}</span>
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <span
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} shadow-sm`}
                                                    >
                                                        <StatusIcon className="w-4 h-4" />
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-3 ml-6">
                                                {doc.status === "pending" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(doc.id)}
                                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:from-emerald-600 hover:to-green-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(doc.id)}
                                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-lg font-medium"
                                                        >
                                                            <X className="w-4 h-4" />
                                                            Từ chối
                                                        </button>
                                                    </>
                                                )}
                                                <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200 shadow-sm font-medium">
                                                    <Eye className="w-4 h-4" />
                                                    Chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                <div className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-gray-600">
                            Hiển thị{" "}
                            <span className="font-semibold text-indigo-600">
                                {(currentPage - 1) * pageSize + 1}
                            </span>{" "}
                            đến{" "}
                            <span className="font-semibold text-indigo-600">
                                {Math.min(currentPage * pageSize, totalItems)}
                            </span>{" "}
                            trong số{" "}
                            <span className="font-semibold text-indigo-600">{totalItems}</span> tài
                            liệu
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            {Array.from({ path: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-4 py-2 ${
                                        currentPage === page
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                            : "bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                    } rounded-xl transition-all duration-200 font-medium shadow-lg`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() =>
                                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                                }
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 bg-white border-2 border-gray-200 text-gray-600 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentApproval;
