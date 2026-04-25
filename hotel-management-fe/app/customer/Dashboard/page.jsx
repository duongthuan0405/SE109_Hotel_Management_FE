"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bed,
  CalendarDays,
  ConciergeBell,
  CreditCard,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { datPhongApi, customerApi, serviceUsageApi, rentalReceiptApi } from "@/api";
import { toast } from "@/hooks/use-toast";
import Notifications from "@/components/Notification";
import MaintenanceRequest from "@/components/MaintenanceRequest";


// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};


export default function CustomerDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // setLoading(true);
        // const token = localStorage.getItem('token');
        // if (!token) {
        //   router.push("/SignIn");
        //   return;
        // }


        const decoded = parseJwt(token);
        if (!decoded?.id) return;


        // 1. Get Customer Info
        const customers = await customerApi.getCustomers();
        const foundCustomer = customers.find(c => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });


        if (foundCustomer) {
          setCustomer(foundCustomer);
          localStorage.setItem("customerId", foundCustomer._id);
          localStorage.setItem("customerName", foundCustomer.HoTen);


          // 2. Get Bookings
          const bookingsRes = await datPhongApi.getBookingsByCustomerId(foundCustomer._id);
          const bookingsData = bookingsRes.data || bookingsRes || [];
          setBookings(bookingsData);


          // 3. Get Service Requests (complex filtering)
          // Fetch all usages
          const allUsagesRes = await serviceUsageApi.getServiceUsages();
          const allUsages = allUsagesRes.data || allUsagesRes || [];


          // Fetch all rental receipts to map to bookings
          const ptpsRes = await rentalReceiptApi.getRentalReceipts();
          const ptps = Array.isArray(ptpsRes) ? ptpsRes : (ptpsRes.data || []);


          const customerBookingIds = bookingsData.map(b => b._id);


          // Filter usages belonging to customer's bookings
          const customerUsages = allUsages.filter(usage => {
            // Find usage's PTP
            // Usage connects to PTP, PTP connects to DatPhong
            const ptpId = typeof usage.PhieuThuePhong === 'object' ? usage.PhieuThuePhong._id : usage.PhieuThuePhong;
            const ptp = ptps.find(p => p._id === ptpId);
            if (!ptp) return false;


            const bookingId = typeof ptp.DatPhong === 'object' ? ptp.DatPhong._id : ptp.DatPhong;
            return customerBookingIds.includes(bookingId);
          });


          setRequests(customerUsages);
        }


      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };


    fetchData();
  }, [router]);


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
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Xin chào, {customer ? customer.HoTen : "Khách hàng"}!
        </h1>
        <p className="text-muted-foreground">
          Chào mừng bạn đến với cổng thông tin khách hàng
        </p>
      </div>


      {/* Thống kê nhanh */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/customer/my-bookings")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đặt phòng đang chờ
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Chờ xác nhận từ khách sạn
            </p>
          </CardContent>
        </Card>


        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/customer/my-bookings")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đặt phòng hiện tại
            </CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              Đã xác nhận hoặc đang lưu trú
            </p>
          </CardContent>
        </Card>


        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/customer/my-bookings")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Yêu cầu dịch vụ
            </CardTitle>
            <ConciergeBell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Đang chờ xử lý</p>
          </CardContent>
        </Card>


        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push("/customer/payment")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thanh toán</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Xem ngay</div>
            <p className="text-xs text-muted-foreground">Quản lý thanh toán</p>
          </CardContent>
        </Card>
      </div>


      <div className="grid gap-6 md:grid-cols-2">
        <Notifications />
        <MaintenanceRequest />
      </div>


      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Đặt phòng gần đây</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/customer/my-bookings")}
            >
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking._id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Phòng {booking.HangPhong}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.NgayDen)} - {formatDate(booking.NgayDi)}
                      </p>
                    </div>
                    {getStatusBadge(booking.TrangThai)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có đặt phòng nào</p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/customer/booking")}
                >
                  Đặt phòng ngay
                </Button>
              </div>
            )}
          </CardContent>
        </Card>


        {/* Recent Service Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Yêu cầu dịch vụ gần đây</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/customer/services")}
            >
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.slice(0, 3).map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {request.DichVu?.TenDV || "Dịch vụ"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SL: {request.SoLuong}
                      </p>
                    </div>
                    <Badge variant={request.TrangThai === "Pending" ? "outline" : "secondary"}>
                      {request.TrangThai}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Chưa có yêu cầu dịch vụ nào</p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => router.push("/customer/services")}
                >
                  Yêu cầu dịch vụ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <Button
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push("/customer/booking")}
          >
            <Bed className="h-6 w-6" />
            <span>Đặt phòng mới</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push("/customer/services")}
          >
            <ConciergeBell className="h-6 w-6" />
            <span>Yêu cầu dịch vụ</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push("/customer/payment")}
          >
            <CreditCard className="h-6 w-6" />
            <span>Thanh toán</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex-col gap-2"
            onClick={() => router.push("/customer/history")}
          >
            <CalendarDays className="h-6 w-6" />
            <span>Xem lịch sử</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}