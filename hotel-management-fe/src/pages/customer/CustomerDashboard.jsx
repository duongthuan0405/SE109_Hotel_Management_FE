import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  CalendarDays,
  ConciergeBell,
  ArrowRight,
  Loader2,
  CreditCard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { datPhongApi, customerApi, serviceUsageApi } from "@/api";
import { toast } from "@/hooks/use-toast";
import Notifications from "@/components/Notification";
import MaintenanceRequest from "@/components/MaintainanceRequest";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Lấy thông tin cá nhân (dùng Token)
        const profileRes = await customerApi.getMyProfile();
        const profile = profileRes.data || profileRes;
        
        if (profile) {
          setCustomer(profile);
          localStorage.setItem("customerId", profile._id);
          localStorage.setItem("customerName", profile.HoTen);

          // 2. Lấy danh sách đặt phòng (dùng Token)
          const bookingsRes = await datPhongApi.getBookings();
          const bookingsData = bookingsRes.data || [];
          setBookings(bookingsData);

          // 3. Lấy danh sách dịch vụ đã đặt (dùng Token)
          const requestsRes = await serviceUsageApi.getMyServiceUsages();
          const requestsData = requestsRes.data || [];
          setRequests(requestsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin tổng quan. Vui lòng kiểm tra lại kết nối.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingBookings = bookings.filter(b => b.TrangThai === "Pending").length;
  const activeBookings = bookings.filter(b => ["DepositPaid", "Confirmed", "CheckedIn"].includes(b.TrangThai)).length;
  const pendingRequests = requests.filter(r => r.TrangThai === "Pending").length;

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { label: "Chờ xác nhận", variant: "outline" },
      DepositPaid: { label: "Đã đặt cọc", variant: "default" },
      Confirmed: { label: "Đã xác nhận", variant: "default" },
      CheckedIn: { label: "Đang ở", variant: "secondary" },
      CheckedOut: { label: "Đã trả phòng", variant: "outline" },
      Cancelled: { label: "Đã hủy", variant: "destructive" },
      NoShow: { label: "Không đến", variant: "destructive" },
      DepositCancel: { label: "Hủy cọc", variant: "outline", className: "border-orange-500 text-orange-500" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={info.variant} className={info.className}>{info.label}</Badge>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Xin chào, {customer ? customer.HoTen : "Khách hàng"}!
        </h1>
        <p className="text-muted-foreground">
          Chào mừng bạn quay trở lại cổng thông tin khách hàng.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/customer/my-bookings")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Đơn đặt phòng mới</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/customer/my-bookings")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Đang lưu trú</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Phòng đang sử dụng</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/customer/services")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yêu cầu dịch vụ</CardTitle>
            <ConciergeBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Đang chờ xử lý</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate("/customer/payment")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Xem hóa đơn</div>
            <p className="text-xs text-muted-foreground">Quản lý tài chính</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Notifications />
        <MaintenanceRequest />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đặt phòng gần đây</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/customer/my-bookings")}>
              Tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Phòng {booking.HangPhong}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.NgayDen)} - {formatDate(booking.NgayDi)}
                      </p>
                    </div>
                    {getStatusBadge(booking.TrangThai)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                <p className="text-sm">Bạn chưa có đơn đặt phòng nào.</p>
                <Button variant="link" onClick={() => navigate("/customer/booking")}>Đặt phòng ngay</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Dịch vụ gần đây</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/customer/services")}>
              Tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.slice(0, 3).map((request) => (
                  <div key={request._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{request.DichVu?.TenDV || "Dịch vụ"}</p>
                      <p className="text-xs text-muted-foreground">Số lượng: {request.SoLuong}</p>
                    </div>
                    <Badge variant="secondary">{request.TrangThai}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-center text-muted-foreground">
                <p className="text-sm">Bạn chưa yêu cầu dịch vụ nào.</p>
                <Button variant="link" onClick={() => navigate("/customer/services")}>Đặt dịch vụ</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <Button className="h-auto py-6 flex-col gap-2" onClick={() => navigate("/customer/booking")}>
            <Bed className="h-6 w-6" />
            <span>Đặt phòng mới</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate("/customer/services")}>
            <ConciergeBell className="h-6 w-6" />
            <span>Yêu cầu dịch vụ</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate("/customer/payment")}>
            <CreditCard className="h-6 w-6" />
            <span>Xem hóa đơn</span>
          </Button>
          <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate("/customer/history")}>
            <CalendarDays className="h-6 w-6" />
            <span>Lịch sử đặt</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
