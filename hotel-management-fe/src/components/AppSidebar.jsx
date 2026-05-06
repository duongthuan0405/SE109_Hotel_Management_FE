import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Bed,
  CalendarCheck,
  Users,
  FileText,
  Utensils,
  Wrench,
  UserCog,
  BarChart3,
  Settings,
  Hotel,
  Calendar,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";


const menuItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    title: "Phòng",
    url: "/rooms",
    icon: Bed,
    roles: ["Admin", "Manager", "MaintenanceStaff"],
  },
  {
    title: "Đặt phòng",
    url: "/bookings",
    icon: CalendarCheck,
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    title: "Lịch",
    url: "/calendar",
    icon: Calendar,
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    title: "Khách hàng",
    url: "/guests",
    icon: Users,
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    title: "Hóa đơn",
    url: "/invoices",
    icon: FileText,
    roles: ["Admin", "Manager", "Receptionist"],
  },
  {
    title: "Dịch vụ",
    url: "/services",
    icon: Utensils,
    roles: ["Admin", "Manager"],
  },
  {
    title: "Bảo trì",
    url: "/maintenance",
    icon: Wrench,
    roles: ["Admin", "Manager", "MaintenanceStaff"],
  },
  {
    title: "Nhân viên",
    url: "/staff",
    icon: UserCog,
    roles: ["Admin"],
  },
  {
    title: "Báo cáo",
    url: "/reports",
    icon: BarChart3,
    roles: ["Admin"],
  },
  {
    title: "Cài đặt",
    url: "/settings",
    icon: Settings,
    roles: ["Admin"],
  },
];


export function AppSidebar() {
  const role = localStorage.getItem("role");


  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4 bg-sidebar">
        <div className="flex items-center gap-2">
          <Hotel className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
              Khách sạn Hortensia
            </h2>
            <p className="text-xs text-sidebar-foreground/70">
              Quản lý khách sạn
            </p>
          </div>
        </div>
      </SidebarHeader>


      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-3">
            Menu chính
          </SidebarGroupLabel>


          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => item.roles.includes(role))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive
                              ? "bg-primary text-white font-medium shadow-sm"
                              : "text-sidebar-foreground/80 hover:bg-primary/20 hover:text-sidebar-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}



