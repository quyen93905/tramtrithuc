import PropTypes from "prop-types";
import Pagination from "../Common/Pagination";
import DocumentCard from "./DocumentCard";

export default function DocumentList({
    documents = [],
    pagination = { currentPage: 1, totalPages: 1, limit: 12 },
    onPageChange = () => {},
    isLoading = false,
    type = null,
}) {
    const handleNext = () => {
        if (pagination.currentPage < pagination.totalPages) {
            onPageChange(pagination.currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (pagination.currentPage > 1) {
            onPageChange(pagination.currentPage - 1);
        }
    };

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading && (
                    <div className="col-span-full flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
                    </div>
                )}
                {!isLoading && documents.length === 0 && (
                    <p className="col-span-full text-center text-gray-500">
                        Không có tài liệu để hiển thị.
                    </p>
                )}
                {!isLoading &&
                    documents.map((doc) => (
                        <DocumentCard key={doc._id} document={doc} type={type} />
                    ))}
            </div>
            {pagination.totalPages > 1 && (
                <Pagination
                    page={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}

DocumentList.propTypes = {
    documents: PropTypes.array,
    pagination: PropTypes.shape({
        currentPage: PropTypes.number,
        totalPages: PropTypes.number,
        limit: PropTypes.number,
    }),
    onPageChange: PropTypes.func,
    isLoading: PropTypes.bool,
    type: PropTypes.string,
};
