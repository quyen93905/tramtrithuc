import React, { useState } from "react";
import { Star } from "lucide-react";

// Nhãn mô tả cho đánh giá sao
const ratingLabels = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Trung bình",
    4: "Tốt",
    5: "Xuất sắc",
};

// Component hiển thị và xử lý đánh giá sao
const RatingStar = ({
    rating = 0,
    onRatingChange = null,
    size = "medium",
    showLabel = true,
    readOnly = false,
    precision = 1,
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(rating);

    const sizes = {
        small: "w-4 h-4",
        medium: "w-6 h-6",
        large: "w-8 h-8",
    };

    const handleClick = (value) => {
        if (readOnly) return;
        setCurrentRating(value);
        if (onRatingChange) onRatingChange(value);
    };

    const handleMouseEnter = (value) => {
        if (readOnly) return;
        setHoverRating(value);
    };

    const handleMouseLeave = () => {
        if (readOnly) return;
        setHoverRating(0);
    };

    const getStarType = (index) => {
        const value = hoverRating || currentRating;
        if (precision === 0.5) {
            if (value >= index) return "full";
            if (value >= index - 0.5) return "half";
            return "empty";
        }
        return value >= index ? "full" : "empty";
    };

    const renderStar = (index, type) => {
        const baseClasses = `${sizes[size]} transition-colors duration-200 ${
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
        }`;

        if (type === "full") {
            return (
                <Star
                    key={index}
                    className={`${baseClasses} text-yellow-400 fill-yellow-400`}
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                />
            );
        } else if (type === "half") {
            return (
                <div key={index} className={`relative ${sizes[size]}`}>
                    <Star
                        className={`${baseClasses} text-gray-300 fill-gray-300 absolute`}
                        onClick={() => handleClick(index)}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                    />
                    <div className="overflow-hidden w-1/2">
                        <Star
                            className={`${baseClasses} text-yellow-400 fill-yellow-400`}
                            onClick={() => handleClick(index)}
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                        />
                    </div>
                </div>
            );
        } else {
            return (
                <Star
                    key={index}
                    className={`${baseClasses} text-gray-300 hover:text-yellow-400`}
                    onClick={() => handleClick(index)}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                />
            );
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((index) => renderStar(index, getStarType(index)))}
            </div>
            {showLabel && (
                <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                        {(hoverRating || currentRating).toFixed(1)}
                    </span>
                    {!readOnly && (hoverRating || currentRating) > 0 && (
                        <span className="text-sm text-gray-500">
                            ({ratingLabels[Math.ceil(hoverRating || currentRating)]})
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default RatingStar;
