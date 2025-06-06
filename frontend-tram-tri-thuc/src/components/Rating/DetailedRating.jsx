import React, { useState } from "react";
import { toast } from "react-toastify";
import { Star } from "lucide-react";
import { Button } from "antd";
import RatingStar from "./RatingStar";

// Component quản lý form đánh giá và danh sách đánh giá chi tiết
const DetailedRating = ({
    documentId,
    ratings,
    averageRating,
    ratingDistribution,
    onNewRating,
    onDeleteRating,
    userId,
}) => {
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);

    const handleSubmitRating = () => {
        if (userRating === 0) {
            toast.error("Vui lòng chọn số sao để đánh giá!");
            return;
        }
        onNewRating({ documentId, score: userRating, review: userReview });
        setUserRating(0);
        setUserReview("");
        setShowReviewForm(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="pb-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Đánh giá tài liệu</h3>
            </div>
            <div className="pt-4">
                {/* Tổng quan đánh giá */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-5xl font-bold text-yellow-500 mb-2">
                            {averageRating.avgScore.toFixed(1)}
                        </div>
                        <RatingStar
                            rating={averageRating.avgScore}
                            readOnly={true}
                            size="large"
                            showLabel={false}
                        />
                        <p className="text-gray-600 mt-2">
                            Dựa trên {averageRating.totalRatings} đánh giá
                        </p>
                    </div>
                    <div className="space-y-2">
                        {ratingDistribution.map(({ star, count, percentage }) => (
                            <div key={star} className="flex items-center space-x-3">
                                <span className="text-sm font-medium w-2">{star}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-8">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form đánh giá */}
                {!showReviewForm ? (
                    <Button
                        type="primary"
                        onClick={() => setShowReviewForm(true)}
                        className="w-full"
                    >
                        Viết đánh giá
                    </Button>
                ) : (
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">Đánh giá của bạn</h4>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xếp hạng sao
                            </label>
                            <RatingStar
                                rating={userRating}
                                onRatingChange={setUserRating}
                                size="large"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nhận xét (tùy chọn)
                            </label>
                            <textarea
                                value={userReview}
                                onChange={(e) => setUserReview(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về tài liệu này..."
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                                rows="4"
                                maxLength={500}
                            />
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                type="primary"
                                onClick={handleSubmitRating}
                                disabled={userRating === 0}
                            >
                                Gửi đánh giá
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowReviewForm(false);
                                    setUserRating(0);
                                    setUserReview("");
                                }}
                            >
                                Hủy
                            </Button>
                        </div>
                    </div>
                )}

                {/* Danh sách đánh giá */}
                {ratings.length > 0 && (
                    <div className="mt-8">
                        <h4 className="font-semibold text-gray-900 mb-4">
                            Đánh giá từ người dùng ({ratings.length})
                        </h4>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {ratings.map((rating) => (
                                <div
                                    key={rating._id}
                                    className="border-b border-gray-100 pb-4 last:border-b-0"
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                            {rating.user.name[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="font-medium text-gray-900">
                                                    {rating.user.name}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    {new Date(rating.createdAt).toLocaleDateString(
                                                        "vi-VN"
                                                    )}
                                                </span>
                                            </div>
                                            <RatingStar
                                                rating={rating.score}
                                                readOnly={true}
                                                size="small"
                                                showLabel={false}
                                            />
                                            {rating.review && (
                                                <p className="text-gray-700 mt-2">
                                                    {rating.review}
                                                </p>
                                            )}
                                            {rating.userId === userId && (
                                                <Button
                                                    type="primary"
                                                    danger
                                                    size="small"
                                                    className="mt-2"
                                                    onClick={() =>
                                                        onDeleteRating(documentId)
                                                    }
                                                >
                                                    Xóa
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailedRating;
