import { NavLink } from "react-router-dom";
import {
  Home,
  Bed,
  CalendarDays,
  ConciergeBell,
  CreditCard,
  History,
  User,
  Hotel,
  LogOut,
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Trang chủ", url: "/customer", icon: Home },
  { title: "Đặt phòng", url: "/customer/booking", icon: Bed },
  {
    title: "Đặt phòng của tôi",
    url: "/customer/my-bookings",
    icon: CalendarDays,
  },
  { title: "Yêu cầu dịch vụ", url: "/customer/services", icon: ConciergeBell },
  { title: "Thanh toán", url: "/customer/payment", icon: CreditCard },
  { title: "Lịch sử", url: "/customer/history", icon: History },
  { title: "Thông tin cá nhân", url: "/customer/profile", icon: User },
];

export function CustomerSidebar() {
  const handleLogout = () => {
    localStorage.removeItem("isCustomerLoggedIn");
    localStorage.removeItem("customerId");
    localStorage.removeItem("customerName");
    window.location.href = "/customer/login";
  };

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
              Cổng thông tin khách hàng
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/customer"}
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
      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
