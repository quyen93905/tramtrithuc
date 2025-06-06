import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { motion } from "framer-motion";
import {
  FiTrendingUp,
  FiUsers,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";
import customAxios from "../../utils/customAxios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardStats = () => {
  // Static data for stats cards
  const [stats, setStats] = useState({
    totalDocuments: 156,
    totalUsers: 89,
    approvedDocuments: 134,
    pendingDocuments: 22,
  });

  // State for API data
  const [viewStats, setViewStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Static data for Doughnut chart
  const [categoryData, setCategoryData] = useState({
    labels: ["Công nghệ", "Kinh tế", "Văn học", "Khoa học", "Giáo dục"],
    data: [30, 25, 20, 15, 10],
  });

  // Fetch view statistics from API
  useEffect(() => {
    const fetchViewStats = async () => {
      try {
        setLoading(true);
        const response = await customAxios.get("/admin/viewstatistics");
        if (response.data.success) {
          setViewStats(response.data.data);
        } else {
          setError("Failed to fetch view statistics");
        }
      } catch (err) {
        setError("Error fetching view statistics: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    const getSystemStats = async () => {
      try {
        setLoading(true);
        const response = await customAxios.get("/admin/totalinfo");
        if (response.data) {
          setStats(response.data.data);
        } else {
          setError("Failed to fetch view statistics");
        }
      } catch (err) {
        setError("Error fetching view statistics: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    getSystemStats();
    fetchViewStats();
  }, []);

  // Bar chart configuration for 12 months of 2025
  const months = [
    "Jan 2025",
    "Feb 2025",
    "Mar 2025",
    "Apr 2025",
    "May 2025",
    "Jun 2025",
    "Jul 2025",
    "Aug 2025",
    "Sep 2025",
    "Oct 2025",
    "Nov 2025",
    "Dec 2025",
  ];

  // Map API data to the correct month positions
  const barChartValues = Array(12).fill(0); // Initialize with zeros for all 12 months
  if (viewStats.length > 0) {
    viewStats.forEach((stat) => {
      // Assuming stat.period is in format "MMM 2025" like "May 2025"
      const monthIndex = months.indexOf(stat.period);
      if (monthIndex !== -1) {
        barChartValues[monthIndex] = stat.totalViews || 0;
      }
    });
  } else {
    // Fallback sample data if API data is unavailable
    barChartValues.splice(
      0,
      12,
      400,
      450,
      420,
      480,
      600,
      550,
      500,
      470,
      490,
      510,
      530,
      520
    );
  }

  const barChartData = {
    labels: months,
    datasets: [
      {
        label: "Lượt xem tài liệu",
        data: barChartValues,
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Lượt xem tài liệu theo tháng",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Doughnut chart configuration
  const doughnutData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(16, 185, 129, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Phân bố tài liệu theo danh mục",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    cutout: "60%",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent font-['Inter']">
                Thống kê hệ thống
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-1"></div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
        >
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng số tài liệu
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalDocuments}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tổng số người dùng
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Tài liệu đã duyệt
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.approvedDocuments}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <FiFileText className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.pendingDocuments}
                </h3>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <Bar data={barChartData} options={barChartOptions} />
            )}
          </motion.div>

          {/* Doughnut Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-200/50"
          >
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
