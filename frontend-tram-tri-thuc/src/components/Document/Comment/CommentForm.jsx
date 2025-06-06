// frontend/src/components/Document/CommentForm.jsx
import { useState } from "react";

const CommentForm = ({ onSubmit, loading }) => {
    const [content, setContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Viết bình luận của bạn..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
            />
            <button
                type="submit"
                disabled={loading || !content.trim()}
                className={`mt-2 px-4 py-2 rounded-lg text-white ${
                    loading || !content.trim()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
                {loading ? "Đang gửi..." : "Gửi"}
            </button>
        </form>
    );
};

export default CommentForm;
