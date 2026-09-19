import React, { ReactNode } from "react";
import { useLocation } from "react-router";
import { useAdminRole, AdminPermission, ROUTE_PERMISSION_MAP } from "../../context/AdminRoleContext";
import { AdminAccessDenied } from "./AdminAccessDenied";

interface AdminRoleGuardProps {
  children: ReactNode;
  requiredPermission?: AdminPermission;
}

export function AdminRoleGuard({ children, requiredPermission }: AdminRoleGuardProps) {
  const location = useLocation();
  const { hasPermission, canAccessRoute } = useAdminRole();

  if (requiredPermission) {
    if (!hasPermission(requiredPermission)) {
      return <AdminAccessDenied requiredPermission={requiredPermission} />;
    }
  } else {
    if (!canAccessRoute(location.pathname)) {
      const needed = ROUTE_PERMISSION_MAP[location.pathname] || undefined;
      return <AdminAccessDenied requiredPermission={needed || undefined} />;
    }
  }

  return <>{children}</>;
}
