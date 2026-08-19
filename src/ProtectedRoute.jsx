import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ allowRoles, children }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <p>กำลังโหลด...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowRoles.includes(role)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return children;
}
