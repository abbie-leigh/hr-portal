import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import EmployeeDashboard from "../pages/EmployeeDashboard";
import UserManagement from "../pages/UserManagement";
import UserProfile from "../pages/UserProfile";

function RequireAuth({ children }) {
    const currentUser = useSelector((state) => state.auth.currentUser);
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function RequireHr({ children }) {
    const currentUser = useSelector((state) => state.auth.currentUser);
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }
    if (currentUser.role !== "hr-representative") {
        return <Navigate to="/employee-dashboard" replace />;
    }
    return children;
}

function AppRouter() {
    return (
        <Routes>
            {/* Entry decision */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Signup />} />

            {/* Protected routes (later) */}
            <Route
                path="/employee-dashboard"
                element={
                    <RequireAuth>
                        <EmployeeDashboard />
                    </RequireAuth>
                }
            />
            <Route
                path="/user-management"
                element={
                    <RequireHr>
                        <UserManagement />
                    </RequireHr>
                }
            />
            <Route
                path="/user-management/:userId"
                element={
                    <RequireHr>
                        <UserProfile />
                    </RequireHr>
                }
            />
        </Routes>
    );
}

export default AppRouter;
