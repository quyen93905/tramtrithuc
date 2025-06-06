import { Dialog } from "@headlessui/react";

const DocumentPreviewModal = ({ isOpen, onClose, document }) => {
    if (!document) return null;

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
                <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                    <h3 className="text-lg font-semibold mb-4">{document.title}</h3>
                    <iframe src={document.fileUrl} className="w-full h-96" title="Preview"></iframe>
                    <button onClick={onClose} className="mt-4 btn btn-secondary">
                        Đóng
                    </button>
                </div>
            </div>
        </Dialog>
    );
};

export default DocumentPreviewModal;
