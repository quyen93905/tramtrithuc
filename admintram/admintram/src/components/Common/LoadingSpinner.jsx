import React from "react";
import PropTypes from "prop-types";

const LoadingSpinner = ({ size = "medium" }) => {
    const sizeClasses = {
        small: "h-6 w-6",
        medium: "h-12 w-12",
        large: "h-16 w-16",
    };

    return (
        <div className="flex justify-center items-center">
            <div
                className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
            ></div>
        </div>
    );
};

LoadingSpinner.propTypes = {
    size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default LoadingSpinner;
