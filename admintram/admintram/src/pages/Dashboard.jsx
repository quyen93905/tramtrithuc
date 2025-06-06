import React, { useState } from 'react';
import { Users, UserCheck, FileText, Clock, Folder, MessageCircle, Flag, Eye, TrendingUp, BarChart3 } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/25",
    green: "from-green-500 to-green-600 shadow-green-500/25",
    purple: "from-purple-500 to-purple-600 shadow-purple-500/25",
    orange: "from-orange-500 to-orange-600 shadow-orange-500/25",
    red: "from-red-500 to-red-600 shadow-red-500/25",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/25",
    pink: "from-pink-500 to-pink-600 shadow-pink-500/25",
    cyan: "from-cyan-500 to-cyan-600 shadow-cyan-500/25"
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:scale-105">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value?.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">+{trend}%</span>
              <span className="text-gray-500 ml-1">từ tuần trước</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
    </div>
  );
};

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  
  const stats = {
    totalUsers: 10247,
    activeUsers: 8203,
    totalDocuments: 1547,
    pendingDocuments: 23,
    totalCategories: 15,
    totalComments: 5439,
    reportedComments: 12,
    viewsLastWeek: 124500
  };

  const statCards = [
    { 
      title: "Tổng số người dùng", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "blue", 
      trend: 12.5 
    },
    { 
      title: "Người dùng hoạt động", 
      value: stats.activeUsers, 
      icon: UserCheck, 
      color: "green", 
      trend: 8.2 
    },
    { 
      title: "Tổng số tài liệu", 
      value: stats.totalDocuments, 
      icon: FileText, 
      color: "purple", 
      trend: 15.7 
    },
    { 
      title: "Tài liệu chờ duyệt", 
      value: stats.pendingDocuments, 
      icon: Clock, 
      color: "orange" 
    },
    { 
      title: "Tổng số danh mục", 
      value: stats.totalCategories, 
      icon: Folder, 
      color: "indigo", 
      trend: 5.3 
    },
    { 
      title: "Tổng số bình luận", 
      value: stats.totalComments, 
      icon: MessageCircle, 
      color: "cyan", 
      trend: 22.1 
    },
    { 
      title: "Bình luận bị báo cáo", 
      value: stats.reportedComments, 
      icon: Flag, 
      color: "red" 
    },
    { 
      title: "Lượt xem tuần qua", 
      value: stats.viewsLastWeek, 
      icon: Eye, 
      color: "pink", 
      trend: 18.9 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Thống kê tổng quan
            </h1>
            <p className="text-gray-600">Tổng quan hiệu suất hệ thống của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            >
              <option value="7days">7 ngày qua</option>
              <option value="30days">30 ngày qua</option>
              <option value="3months">3 tháng qua</option>
            </select>
            <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Lượt xem theo thời gian</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Lượt xem</span>
              </div>
            </div>
            <div className="h-80 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10"></div>
              <div className="relative z-10 text-center">
                <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <span className="text-gray-500 font-medium">Biểu đồ tương tác sẽ được hiển thị ở đây</span>
                <p className="text-sm text-gray-400 mt-2">Tích hợp với Chart.js hoặc Recharts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100/50 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Phân bố tài liệu theo danh mục</h2>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Danh mục</span>
                </div>
              </div>
            </div>
            <div className="h-80 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <span className="text-gray-500 font-medium">Biểu đồ tròn tương tác sẽ được hiển thị ở đây</span>
                <p className="text-sm text-gray-400 mt-2">Hiển thị phân bố theo từng danh mục</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100/50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Thêm người dùng mới", color: "bg-blue-500 hover:bg-blue-600" },
              { label: "Duyệt tài liệu", color: "bg-green-500 hover:bg-green-600" },
              { label: "Quản lý danh mục", color: "bg-purple-500 hover:bg-purple-600" },
              { label: "Xem báo cáo chi tiết", color: "bg-indigo-500 hover:bg-indigo-600" }
            ].map((action, index) => (
              <button 
                key={index}
                className={`${action.color} text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;