// frontend/src/components/Document/ReplyForm.jsx
import { useState } from "react";

const ReplyForm = ({ onSubmit, onCancel }) => {
    const [content, setContent] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent("");
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 ml-6">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Viết trả lời của bạn..."
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
            />
            <div className="flex gap-2 mt-2">
                <button
                    type="submit"
                    disabled={!content.trim()}
                    className={`px-3 py-1 rounded-lg text-white ${
                        !content.trim()
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                    Gửi
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1 rounded-lg bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                    Hủy
                </button>
            </div>
        </form>
    );
};

export default ReplyForm;
