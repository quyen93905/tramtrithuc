// src/api/mockApi.js
export const mockUsers = [
    {
        _id: "u1",
        name: "Nguyen Van A",
        email: "a@example.com",
        role: "member",
        favoriteDocuments: ["d1", "d3"],
        recentViews: [
            { documentId: "d1", viewedAt: new Date().toISOString() },
            { documentId: "d2", viewedAt: new Date().toISOString() },
        ],
    },
];

export const mockDocuments = [
    {
        _id: "d1",
        title: "Tài liệu React",
        description: "Giới thiệu về React",
        fileUrl: "/files/react.pdf",
        mimeType: "application/pdf",
        size: 1200000,
        uploaderId: "u1",
        categoryId: "c1",
        tags: ["react", "frontend"],
        viewCount: 123,
        downloadCount: 45,
        isApproved: true,
        ratings: [
            { userId: "u1", stars: 5, comment: "Tuyệt vời", createdAt: new Date().toISOString() },
        ],
    },
];

export const mockCategories = [
    { _id: "c1", name: "Lập trình", slug: "lap-trinh", description: "Tài liệu code" },
];

export const mockComments = [
    {
        _id: "c1",
        documentId: "d1",
        userId: "u1",
        content: "Tài liệu rất hữu ích!",
        createdAt: new Date().toISOString(),
        isDeleted: false,
        isApproved: true,
    },
    {
        _id: "c2",
        documentId: "d1",
        userId: "u2",
        content: "Thiếu phần ví dụ.",
        createdAt: new Date().toISOString(),
        isDeleted: false,
        isApproved: true,
    },
];

export const mockNotifications = [
    {
        _id: "n1",
        userId: "u1",
        type: "document_approved",
        content: "Tài liệu của bạn đã được duyệt",
        link: "/document/d1",
        isRead: false,
        createdAt: new Date().toISOString(),
    },
    {
        _id: "n2",
        userId: "u1",
        type: "comment",
        content: "Ai đó đã bình luận tài liệu của bạn",
        link: "/document/d1",
        isRead: false,
        createdAt: new Date().toISOString(),
    },
];

export const mockDownloads = [
    {
        _id: "dl1",
        userId: "u1",
        documentId: "d1",
        downloadedAt: new Date().toISOString(),
        ipAddress: "127.0.0.1",
        deviceInfo: "Chrome on Windows",
    },
    {
        _id: "dl2",
        userId: "u1",
        documentId: "d2",
        downloadedAt: new Date().toISOString(),
        ipAddress: "127.0.0.1",
        deviceInfo: "Firefox on Android",
    },
];

export const fetchDocuments = () =>
    new Promise((resolve) => setTimeout(() => resolve(mockDocuments), 500));
