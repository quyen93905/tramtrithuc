import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import router from "./Routes";
import { RouterProvider } from "react-router-dom";

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <ToastContainer
                position="bottom-right"
                autoClose={3000} // Đóng sau 3s
                limit={1} // Giới hạn 1 toast cùng lúc
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
            />
        </>
    );
}

export default App;
