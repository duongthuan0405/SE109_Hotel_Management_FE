import { ROLE_PERMISSIONS } from "@/config/permissions";

export const usePermission = (permission) => {
  const role = localStorage.getItem("role");
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission);
};
