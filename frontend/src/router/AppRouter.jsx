import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import QrGenerator from "../pages/QrGenerator";

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("access_token");
    return token ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
    return (
        <Routes>
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
        </Routes>
    );
};

export default AppRouter;
