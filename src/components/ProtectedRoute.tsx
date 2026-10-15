import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'parent' | 'student')[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/login',
}) => {
  const { user, loading, isOnline } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEF9EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#C2410C] border-t-transparent"></div>
      </div>
    );
  }

  if (!isOnline) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RoleRoute: React.FC<{
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'parent' | 'student';
  fallbackPath?: string;
}> = ({ children, role, fallbackPath = '/login' }) => {
  return <ProtectedRoute allowedRoles={[role]} fallbackPath={fallbackPath}>{children}</ProtectedRoute>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute role="admin">{children}</RoleRoute>
);

export const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute role="teacher">{children}</RoleRoute>
);

export const ParentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute role="parent">{children}</RoleRoute>
);

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleRoute role="student">{children}</RoleRoute>
);

export const AdminOrTeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'teacher']}>{children}</ProtectedRoute>
);