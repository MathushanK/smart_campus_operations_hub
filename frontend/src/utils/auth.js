export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") {
    return null;
  }

  return role.replace(/^ROLE_/, "").toLowerCase();
};

export const normalizeUser = (rawUser) => {
  if (!rawUser) {
    return null;
  }

  const primaryRole = Array.isArray(rawUser.roles) && rawUser.roles.length > 0
    ? rawUser.roles[0]
    : null;
  const normalizedRole = normalizeRole(
    rawUser.roleName || primaryRole?.name || rawUser.role
  );
  const userId = rawUser.userId ?? rawUser.id ?? null;
  const roleId = rawUser.roleId ?? primaryRole?.id ?? null;

  return {
    ...rawUser,
    id: userId,
    userId,
    roleId,
    role: normalizedRole,
    roleName:
      rawUser.roleName ||
      primaryRole?.name ||
      (normalizedRole ? `ROLE_${normalizedRole.toUpperCase()}` : null),
    name: rawUser.name || rawUser.email || "User",
  };
};

export const getDashboardPath = (role) => {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return "/admin/dashboard";
  }

  if (normalizedRole === "technician") {
    return "/technician/dashboard";
  }

  return "/user/dashboard";
};

export const hasAllowedRole = (user, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  const currentRole = normalizeRole(user?.role || user?.roleName);
  return allowedRoles.map(normalizeRole).includes(currentRole);
};
