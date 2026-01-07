import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import QrGenerator from "../pages/QrGenerator";

function AppRouter() {
    const isAuthenticated = false; // şimdilik yaptım değiştircem unutma

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/qr"
                element={
                    isAuthenticated ? <QrGenerator /> : <Navigate to="/login" />
                }
            />

            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default AppRouter;
