import { Search } from "lucide-react";

export default function SearchBar({
    onSearch,
    placeholder = "Tìm tài liệu...",
    className = "",
    isLoading = false,
}) {
    return (
        <div className={`mb-4 ${className}`}>
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full outline-none text-sm"
                    onChange={(e) => onSearch?.(e.target.value)}
                />
                {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 ml-2" />
                )}
            </div>
        </div>
    );
}
