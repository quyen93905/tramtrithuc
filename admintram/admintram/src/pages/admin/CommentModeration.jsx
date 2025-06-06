import React, { useState } from 'react';

const CommentModeration = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      content: 'Bài viết rất hay và bổ ích, cảm ơn tác giả đã chia sẻ những kiến thức quý báu này.',
      author: 'Nguyễn Văn A',
      documentId: 1,
      documentTitle: 'Tài liệu về Machine Learning',
      status: 'reported',
      reason: 'Spam',
      createdAt: '2024-03-20',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      content: 'Cảm ơn tác giả đã chia sẻ, nội dung rất chất lượng và dễ hiểu.',
      author: 'Trần Thị B',
      documentId: 1,
      documentTitle: 'Tài liệu về Machine Learning',
      status: 'active',
      createdAt: '2024-03-19',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      content: 'Thông tin rất hữu ích, mình đã áp dụng được vào dự án thực tế.',
      author: 'Lê Minh C',
      documentId: 2,
      documentTitle: 'Hướng dẫn Deep Learning',
      status: 'active',
      createdAt: '2024-03-18',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = (commentId) => {
    setComments(comments.filter((comment) => comment.id !== commentId));
  };

  const handleApprove = (commentId) => {
    setComments(
      comments.map((comment) =>
        comment.id === commentId ? { ...comment, status: 'active' } : comment
      )
    );
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Quản lý bình luận
            </h1>
            <p className="text-slate-600 text-lg">Kiểm duyệt và quản lý các bình luận từ người dùng</p>
          </div>
          <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Thêm bình luận
            </span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="mb-8">
          <div className="backdrop-blur-sm bg-white/70 border border-white/20 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm kiếm bình luận hoặc tác giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/80 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 text-slate-700 placeholder-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-4 bg-white/80 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-300 text-slate-700 min-w-[200px]"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="reported">Bị báo cáo</option>
                <option value="active">Hoạt động</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6 mb-8">
          {filteredComments.map((comment, index) => (
            <div
              key={comment.id}
              className="group backdrop-blur-sm bg-white/80 border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Status indicator line */}
              <div className={`h-1 w-full ${comment.status === 'active' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`}></div>
              
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={comment.avatar} 
                        alt={comment.author}
                        className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white/50 shadow-lg"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${comment.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-lg">{comment.author}</p>
                      <p className="text-slate-500 text-sm flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {comment.createdAt}
                      </p>
                    </div>
                  </div>
                  <div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${
                        comment.status === 'active'
                          ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200'
                          : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {comment.status === 'active' ? 'Hoạt động' : 'Bị báo cáo'}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="mb-6">
                  <p className="text-slate-700 text-lg leading-relaxed">{comment.content}</p>
                </div>
                
                {/* Document info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                  <p className="text-slate-600 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Trong tài liệu: 
                    <a href="#" className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200">
                      {comment.documentTitle}
                    </a>
                  </p>
                </div>
                
                {/* Report reason */}
                {comment.status === 'reported' && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                      </svg>
                      <div>
                        <p className="text-red-700 font-semibold mb-1">Lý do báo cáo</p>
                        <p className="text-red-600">{comment.reason}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-end space-x-3">
                  {comment.status === 'reported' && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <span className="relative flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Bỏ qua báo cáo
                      </span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-sm font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <span className="relative flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Xóa bình luận
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="backdrop-blur-sm bg-white/80 border border-white/20 rounded-3xl shadow-xl p-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="text-slate-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              Hiển thị <span className="font-semibold text-slate-800">1-{filteredComments.length}</span> trong số <span className="font-semibold text-slate-800">{comments.length}</span> bình luận
            </div>
            <div className="flex space-x-2">
              {['Trước', '1', '2', '3', 'Sau'].map((item, index) => (
                <button 
                  key={index}
                  className="px-4 py-2 bg-white/80 hover:bg-blue-50 border border-slate-200/50 hover:border-blue-300 rounded-xl transition-all duration-300 text-slate-700 hover:text-blue-600 font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModeration;