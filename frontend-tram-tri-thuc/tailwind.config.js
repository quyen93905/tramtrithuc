/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                poppins: ["Poppins", "sans-serif"],
            },
            animation: {
                fadeIn: "fadeIn 0.3s ease-in-out",
                slideIn: "slideIn 0.3s ease-in-out",
                pulseHover: "pulseHover 0.2s ease-in-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: 0 },
                    "100%": { opacity: 1 },
                },
                slideIn: {
                    "0%": { transform: "translateY(-10px)", opacity: 0 },
                    "100%": { transform: "translateY(0)", opacity: 1 },
                },
                pulseHover: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.05)" },
                },
            },
        },
    },
    darkMode: "class", // Đặt darkMode ở đây
};
