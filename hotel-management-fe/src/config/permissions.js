export const ROLE_PERMISSIONS = {
  Admin: [
    "dashboard",
    "rooms",
    "bookings",
    "guests",
    "invoices",
    "maintenance",
    "staff",
    "reports",
  ],

  Manager: ["dashboard", "bookings", "guests", "invoices", "reports"],

  Receptionist: ["dashboard", "bookings", "guests", "invoices"],

  MaintenanceStaff: ["maintenance"],
};
