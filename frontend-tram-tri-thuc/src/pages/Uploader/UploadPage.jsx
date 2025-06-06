import UploadForm from "../../components/Uploader/UploadForm";
import { motion } from "framer-motion";

const UploadPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>
      {/* Nội dung chính */}
      <div className="relative z-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
          className="max-w-4xl mx-auto px-4"
        >
          <motion.h1
            className="text-4xl font-bold text-gray-800 mb-6 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Đăng tài liệu mới
          </motion.h1>
          <UploadForm />
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
