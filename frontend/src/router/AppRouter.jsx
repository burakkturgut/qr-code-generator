import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import QrGenerator from "../pages/QrGenerator";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
    // Token kontrolü ile ana sayfa yönlendirmesi
    const token = localStorage.getItem("access_token");

    return (
        <Routes>
            {/* Ana Sayfa - Token varsa QR'a, yoksa Login'e yönlendir */}
            <Route
                path="/"
                element={
                    token ? <Navigate to="/qr" replace /> : <Navigate to="/login" replace />
                }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/qr"
                element={
                    <ProtectedRoute>
                        <QrGenerator />
                    </ProtectedRoute>
                }
            />

            {/* 404 - Bilinmeyen route'lar için */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRouter;