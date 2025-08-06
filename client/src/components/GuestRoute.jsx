import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function GuestRoute({ children }) {
    const { user } = useAuth();
    return user ? <Navigate to={"/dashboard"} replace /> : children
}