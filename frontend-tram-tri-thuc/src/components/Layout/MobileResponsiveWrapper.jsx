import { useState, useEffect } from "react";

export default function MobileResponsiveWrapper({ children }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (!sidebarOpen && isMobile) {
        return (
            <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 m-2 rounded bg-gray-200 md:hidden"
            >
                ☰ Menu
            </button>
        );
    }

    return (
        <div className="w-64 shrink-0 bg-white border-r shadow-sm">
            {isMobile && (
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-2 right-2 z-50 text-xl"
                >
                    ×
                </button>
            )}
            {children}
        </div>
    );
}
