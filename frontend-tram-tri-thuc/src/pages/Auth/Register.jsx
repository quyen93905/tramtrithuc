import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox } from "antd";
import { FaEnvelope, FaLock, FaUser, FaStar, FaGlobe, FaRocket, FaArrowRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import FormInput from "../../components/Auth/FormInput";
import { registerThunk, resetAuthState } from "../../store/slices/authSlice";
import backgroundImage from '../../assets/image3.jpg';
const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success } = useSelector((state) => state.auth);
    const [activeFeature, setActiveFeature] = useState(0);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            agree: false,
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .min(3, "Tên phải có ít nhất 3 ký tự")
                .max(50, "Tên không được vượt quá 50 ký tự")
                .required("Vui lòng nhập họ tên"),
            email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
            password: Yup.string()
                .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
                .matches(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ in hoa")
                .matches(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số")
                .required("Vui lòng nhập mật khẩu"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
                .required("Vui lòng xác nhận mật khẩu"),
            agree: Yup.boolean().oneOf([true], "Bạn phải đồng ý với điều khoản sử dụng").required(),
        }),
        onSubmit: async (values) => {
            const { name, email, password } = values;
            await dispatch(registerThunk({ name, email, password }));
        },
    });

    useEffect(() => {
        if (success) {
            formik.resetForm();
            navigate("/auth/login");
            dispatch(resetAuthState());
        }
    }, [success, navigate, dispatch, formik]);

    useEffect(() => {
        return () => {
            dispatch(resetAuthState());
        };
    }, [dispatch]);

    // Auto-cycle through features
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const featureData = [
        {
            icon: FaStar,
            title: "Tạo tài khoản miễn phí",
            description: "Chỉ vài bước đơn giản",
            color: "text-amber-500",
            bg: "bg-amber-50"
        },
        {
            icon: FaRocket,
            title: "Truy cập không giới hạn",
            description: "Kho tài liệu đa dạng, phong phú",
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            icon: FaGlobe,
            title: "Cộng đồng lớn mạnh",
            description: "Kết nối và chia sẻ kiến thức",
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${backgroundImage})`
                }}
            ></div>
            
            {/* Animated floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-400/30 to-violet-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>
            
            <div className="container mx-auto px-4 lg:px-8 relative z-10">
                <div className="min-h-screen flex items-center">
                    <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        
                        {/* Left side - Brand & Features */}
                        <div className="order-2 lg:order-1 space-y-12">
                            {/* Brand Section */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center space-x-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                                        <FaStar className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-2xl font-bold text-white drop-shadow-lg">KhoTangTriThuc</span>
                                </div>
                                
                                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg font-['Playfair_Display']">
                                    <span className="font-['Montserrat'] tracking-wide">Tham gia ngay</span>
                                    <br />
                                    <span className="bg-gradient-to-r from-cyan-400 via-pink-400 to-violet-400 bg-clip-text text-transparent font-['Playfair_Display'] italic">
                                        cộng đồng tri thức
                                    </span>
                                </h1>
                                
                                <p className="text-xl font-['Montserrat'] text-purple-100 mb-8 max-w-2xl drop-shadow leading-relaxed tracking-wide">
                                    <span className="font-light">Khám phá</span> hàng triệu{" "}
                                    <span className="text-cyan-300 font-medium">tài liệu học thuật</span>,{" "}
                                    <span className="text-pink-300 font-medium">sách điện tử</span> và{" "}
                                    <span className="text-violet-300 font-medium">nghiên cứu</span>{" "}
                                    <span className="font-light">từ khắp nơi trên thế giới</span>
                                </p>
                            </div>

                            {/* Features Section */}
                            <div className="space-y-6">
                                {featureData.map((feature, index) => {
                                    const IconComponent = feature.icon;
                                    const isActive = index === activeFeature;
                                    
                                    return (
                                        <div
                                            key={index}
                                            className={`group relative p-6 rounded-2xl border backdrop-blur-md transition-all duration-400 cursor-pointer ${
                                                isActive 
                                                    ? `bg-white/20 border-white/30 shadow-xl shadow-white/10 scale-105` 
                                                    : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/25 hover:shadow-lg hover:shadow-white/5'
                                            }`}
                                            onClick={() => setActiveFeature(index)}
                                        >
                                            <div className="flex items-start space-x-4">
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                    isActive 
                                                        ? `${feature.color} bg-white shadow-lg` 
                                                        : 'bg-white/20 text-white group-hover:bg-white/30'
                                                }`}>
                                                    <IconComponent className="w-6 h-6" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 className={`font-semibold text-lg mb-2 transition-colors duration-300 ${
                                                        isActive ? 'text-white' : 'text-purple-100 group-hover:text-white'
                                                    }`}>
                                                        {feature.title}
                                                    </h3>
                                                    <p className={`text-sm transition-colors duration-300 ${
                                                        isActive ? 'text-purple-100' : 'text-purple-200'
                                                    }`}>
                                                        {feature.description}
                                                    </p>
                                                </div>
                                                
                                                <div className={`flex-shrink-0 opacity-0 transform translate-x-2 transition-all duration-300 ${
                                                    isActive ? 'opacity-100 translate-x-0' : 'group-hover:opacity-100 group-hover:translate-x-0'
                                                }`}>
                                                    <FaArrowRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-200'}`} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right side - Register Form */}
                        <div className="order-1 lg:order-2">
                            <div className="bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/30 p-8 lg:p-12 max-w-md mx-auto w-full hover:border-white/40 transition-all duration-300">
                                {/* Header */}
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500/80 to-violet-600/80 backdrop-blur-sm rounded-[1.5rem] mb-6 shadow-xl shadow-pink-500/20 rotate-6 hover:rotate-0 transition-transform duration-300 border border-white/20">
                                        <FaUser className="w-8 h-8 text-white/90" />
                                    </div>
                                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3 font-['Playfair_Display'] drop-shadow-md">
                                        Đăng ký
                                    </h2>
                                    <p className="text-white/80 font-['Montserrat']">Tạo tài khoản để bắt đầu</p>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-8 p-4 rounded-2xl bg-red-500/10 backdrop-blur-sm border border-red-500/20">
                                        <p className="text-red-100 text-sm text-center font-medium">
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {/* Form */}
                                <form className="space-y-6" onSubmit={formik.handleSubmit}>
                                    <div className="space-y-5">
                                        <FormInput
                                            formik={formik}
                                            name="name"
                                            placeholder="Họ và tên"
                                            icon={FaUser}
                                            className="transition-all duration-200"
                                            inputClassName="w-full px-5 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 font-['Montserrat']"
                                        />
                                        <FormInput
                                            formik={formik}
                                            name="email"
                                            placeholder="Email"
                                            icon={FaEnvelope}
                                            className="transition-all duration-200"
                                            inputClassName="w-full px-5 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 font-['Montserrat']"
                                        />
                                        <FormInput
                                            formik={formik}
                                            name="password"
                                            type="password"
                                            placeholder="Mật khẩu"
                                            icon={FaLock}
                                            isPassword
                                            className="transition-all duration-200"
                                            inputClassName="w-full px-5 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 font-['Montserrat']"
                                        />
                                        <FormInput
                                            formik={formik}
                                            name="confirmPassword"
                                            type="password"
                                            placeholder="Xác nhận mật khẩu"
                                            icon={FaLock}
                                            isPassword
                                            className="transition-all duration-200"
                                            inputClassName="w-full px-5 py-4 pl-14 rounded-2xl bg-white/5 backdrop-blur-sm text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition-all duration-200 font-['Montserrat']"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Checkbox
                                            name="agree"
                                            checked={formik.values.agree}
                                            onChange={formik.handleChange}
                                            className="text-white/80 hover:scale-105 transition-transform duration-200"
                                        >
                                            <span className="text-white/80 font-['Montserrat']">
                                                Tôi đồng ý với{" "}
                                                <Link
                                                    to="#"
                                                    className="text-pink-300 hover:text-pink-200 hover:underline font-medium"
                                                >
                                                    điều khoản sử dụng
                                                </Link>
                                            </span>
                                        </Checkbox>
                                        {formik.touched.agree && formik.errors.agree && (
                                            <p className="text-pink-300 text-xs font-['Montserrat']">
                                                {formik.errors.agree}
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="w-full h-14 bg-gradient-to-r from-pink-500/80 to-violet-600/80 hover:from-pink-500/90 hover:to-violet-600/90 backdrop-blur-sm border-0 rounded-2xl font-semibold text-base shadow-lg shadow-pink-500/20 hover:shadow-xl hover:shadow-pink-500/30 transition-all duration-200 font-['Montserrat'] hover:scale-[1.02]"
                                    >
                                        {loading ? "Đang đăng ký..." : "Đăng ký ngay"}
                                    </Button>

                                    

                                    <p className="text-center text-white/70 text-sm mt-8 font-['Montserrat']">
                                        Đã có tài khoản?{" "}
                                        <Link
                                            to="/auth/login"
                                            className="text-pink-300 hover:text-pink-200 font-semibold transition-colors duration-200 hover:underline"
                                        >
                                            Đăng nhập
                                        </Link>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;