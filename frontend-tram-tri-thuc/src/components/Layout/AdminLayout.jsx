import { Outlet } from "react-router-dom";
import AdminNavbar from "./Header/AdminNavbar";
import AdminSidebar from "./Sidebar/AdminSidebar";

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <AdminNavbar />
            <div className="flex flex-1">
                <AdminSidebar />
                <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
