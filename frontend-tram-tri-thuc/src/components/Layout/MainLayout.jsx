import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Navbar from "./Header/Navbar";

export default function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar at top */}
            <Navbar />

            <div className="flex flex-1">
                {/* Fixed Sidebar */}
                <div className="w-64 fixed left-0 top-16 h-[calc(100vh-4rem)]">
                    <Sidebar />
                </div>

                {/* Main Content - with margin to account for fixed sidebar */}
                <div className="flex-1 ml-64 pt-2">
                    <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
