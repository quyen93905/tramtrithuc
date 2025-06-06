import { useState, useEffect } from "react";
import { Sliders, RefreshCw, Filter } from "lucide-react";
import showToast from "../../utils/toast";

export default function FilterPanel({
    filtersConfig = [],
    sortOptions = [],
    onFilterChange,
    filters, // Nhận filters từ CategoryPage
    defaultFilters = {},
    hideDateField = false,
}) {
    const [localFilters, setLocalFilters] = useState(filters || defaultFilters);
    const [dateError, setDateError] = useState(null);

    // Đồng bộ localFilters với filters từ props
    useEffect(() => {
        setLocalFilters(filters || defaultFilters);
    }, [filters, defaultFilters]);

    const handleChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);

        // Validate date range
        if (key === "startDate" || key === "endDate") {
            const start = new Date(newFilters.startDate);
            const end = new Date(newFilters.endDate);
            if (
                newFilters.startDate &&
                newFilters.endDate &&
                !isNaN(start.getTime()) &&
                !isNaN(end.getTime())
            ) {
                if (start > end) {
                    setDateError("Ngày bắt đầu phải trước ngày kết thúc");
                    return;
                } else {
                    setDateError(null);
                }
            }
        }
    };

    const handleApplyFilters = () => {
        if (dateError) return;
        onFilterChange({ ...localFilters, page: 1 }); // Reset page về 1 khi áp dụng bộ lọc
        showToast("success", "Đã áp dụng bộ lọc");
    };

    const handleResetFilters = () => {
        const resetFilters = {
            search: "",
            sort: sortOptions[0]?.value || "createdAt:desc",
            ...filtersConfig.reduce((acc, filter) => {
                acc[filter.key] = filter.type === "multi-select" ? [] : filter.defaultValue || "";
                return acc;
            }, {}),
            endDate: "",
            ...(hideDateField ? {} : { dateField: "createdAt" }),
        };
        setLocalFilters(resetFilters);
        onFilterChange({ ...resetFilters, page: 1 }); // Reset page về 1 khi xóa bộ lọc
        showToast("success", "Đã đặt lại bộ lọc");
    };

    return (
        <div className="p-2 bg-white/80 backdrop-blur-xl rounded-xl shadow border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
                <Filter className="w-4 h-4 text-blue-500" />
                <h4 className="font-semibold text-sm text-gray-700 tracking-wide uppercase">Bộ lọc</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2 items-end">
                {/* Dynamic Filters */}
                {filtersConfig.map((filter) => (
                    <div key={filter.key} className="flex flex-col gap-0.5 min-w-[90px] flex-grow">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                            {filter.type === "select" && <Sliders className="w-3 h-3 text-blue-400" />}
                            {filter.type === "date" && <Sliders className="w-3 h-3 text-emerald-400" />}
                            {filter.label}
                        </label>
                        {filter.type === "select" && (
                            <select
                                value={localFilters[filter.key] || ""}
                                onChange={(e) => handleChange(filter.key, e.target.value)}
                                className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 shadow-sm transition"
                            >
                                <option value="">{filter.placeholder || "Tất cả"}</option>
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                        {filter.type === "multi-select" && (
                            <div className="relative">
                                <select
                                    multiple
                                    value={localFilters[filter.key] || []}
                                    onChange={(e) =>
                                        handleChange(
                                            filter.key,
                                            Array.from(
                                                e.target.selectedOptions,
                                                (option) => option.value
                                            )
                                        )
                                    }
                                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 shadow-sm h-14"
                                >
                                    {filter.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                    Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều
                                </p>
                            </div>
                        )}
                        {filter.type === "date" && (
                            <div className="flex gap-1">
                                <input
                                    type="date"
                                    placeholder={filter.placeholder || ""}
                                    value={localFilters[filter.key] || ""}
                                    onChange={(e) => handleChange(filter.key, e.target.value)}
                                    className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white/70 shadow-sm"
                                />
                                {filter.key === "startDate" && (
                                    <input
                                        type="date"
                                        placeholder="Ngày kết thúc"
                                        value={localFilters.endDate || ""}
                                        onChange={(e) => handleChange("endDate", e.target.value)}
                                        className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white/70 shadow-sm"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                ))}

                {/* Date Field Selector */}
                {!hideDateField && (localFilters.startDate || localFilters.endDate) && (
                    <div className="flex flex-col gap-0.5 min-w-[90px] flex-grow">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                            <Sliders className="w-3 h-3 text-blue-400" />Trường ngày
                        </label>
                        <select
                            value={localFilters.dateField || "createdAt"}
                            onChange={(e) => handleChange("dateField", e.target.value)}
                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 shadow-sm"
                        >
                            <option value="createdAt">Ngày tạo</option>
                            <option value="updatedAt">Ngày cập nhật</option>
                        </select>
                    </div>
                )}

                {/* Sort Options */}
                {sortOptions.length > 0 && (
                    <div className="flex flex-col gap-0.5 min-w-[90px] flex-grow">
                        <label className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                            <Sliders className="w-3 h-3 text-blue-400" />Sắp xếp
                        </label>
                        <select
                            value={localFilters.sort}
                            onChange={(e) => handleChange("sort", e.target.value)}
                            className="w-full border border-gray-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white/70 shadow-sm"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-1 mb-1">
                    <button
                        onClick={handleApplyFilters}
                        disabled={dateError}
                        className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition shadow focus:outline-none focus:ring-1 focus:ring-blue-400
                            ${dateError
                                ? "bg-gray-200 cursor-not-allowed text-gray-400"
                                : "bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:from-blue-600 hover:to-emerald-600"}
                        `}
                    >
                        <Sliders className="w-3 h-3" /> Áp dụng
                    </button>
                    <button
                        onClick={handleResetFilters}
                        className="flex items-center gap-1 bg-gradient-to-r from-gray-400 to-gray-600 text-white px-3 py-1 rounded-md text-xs font-semibold hover:from-gray-500 hover:to-gray-700 transition shadow focus:outline-none focus:ring-1 focus:ring-gray-400"
                    >
                        <RefreshCw className="w-3 h-3" /> Xóa
                    </button>
                </div>
            </div>
            {/* Date Error */}
            {dateError && <p className="text-red-500 text-xs font-semibold mt-1">{dateError}</p>}
        </div>
    );
}
