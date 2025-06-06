import React, { useState } from "react";
import { Button } from "antd";
import { FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import showToast from "../../utils/toast";
import FormInput from "../../components/Auth/FormInput";
import { forgotPasswordThunk } from "../../store/slices/authSlice";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const dispatch = useDispatch();
    const { loading, error, message } = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            showToast("error", "Vui lòng nhập email");
            return;
        }
        await dispatch(forgotPasswordThunk(email));
    };

    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/src/assets/images1.jpg')`
                }}
            ></div>
            
            {/* Animated floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-red-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>
            
            {/* Backdrop blur */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-full max-w-md">
                        {/* Back to login link */}
                        <Link 
                            to="/auth/login"
                            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors duration-200"
                        >
                            <FaArrowLeft className="w-4 h-4" />
                            <span>Quay lại đăng nhập</span>
                        </Link>

                        {/* Main Card */}
                        <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-8 hover:border-white/40 transition-all duration-300">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-[1.5rem] mb-6 shadow-xl shadow-blue-500/20 rotate-6 hover:rotate-0 transition-transform duration-300 border border-white/20">
                                    <FaLock className="w-8 h-8 text-white/90" />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-3 font-['Playfair_Display'] drop-shadow-md">
                                    Quên mật khẩu?
                                </h2>
                                <p className="text-white/80 font-['Montserrat']">
                                    Đừng lo, chúng tôi sẽ giúp bạn khôi phục mật khẩu
                                </p>
                            </div>

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 backdrop-blur-sm border border-red-500/20">
                                    <p className="text-red-100 text-sm text-center font-medium">
                                        {error}
                                    </p>
                                </div>
                            )}
                            {message && (
                                <div className="mb-6 p-4 rounded-2xl bg-green-500/10 backdrop-blur-sm border border-green-500/20">
                                    <p className="text-green-100 text-sm text-center font-medium">
                                        {message}
                                    </p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <FormInput
                                    name="email"
                                    placeholder="Nhập email của bạn"
                                    icon={FaEnvelope}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="transition-all duration-200"
                                    inputClassName="w-full px-5 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 font-['Montserrat']"
                                />

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-14 bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-600/90 backdrop-blur-sm border-0 rounded-2xl font-semibold text-base shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 font-['Montserrat'] hover:scale-[1.02]"
                                >
                                    {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
                                </Button>

                                <div className="text-center space-y-4">
                                    <p className="text-white/60 text-sm">
                                        Bằng việc tiếp tục, bạn đồng ý với{" "}
                                        <Link to="/terms" className="text-blue-300 hover:text-blue-200 hover:underline">
                                            điều khoản sử dụng
                                        </Link>
                                        {" "}của chúng tôi
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
