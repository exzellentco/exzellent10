import { Outlet, Navigate } from "react-router-dom";

const ProtectedRouter = ({ userRole, allowedRoles }) => {
  // Check for user in localStorage
  const user = localStorage.getItem("user");

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If userRole is null (still loading), show loading or wait
  if (userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"/>
      </div>
    );
  }

  // If userRole is required and user doesn't have the right role, redirect to 404
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouter;
