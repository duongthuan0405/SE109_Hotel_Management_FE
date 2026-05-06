import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, ConciergeBell, Loader2 } from "lucide-react";
import { datPhongApi, serviceUsageApi, customerApi } from "@/api";
import { toast } from "@/hooks/use-toast";

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function CustomerHistory() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        const decoded = parseJwt(token);
        if (!decoded?.id) return;

        // 1. Get Customer
        const customers = await customerApi.getCustomers();
        const customer = customers.find(c => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });

        if (!customer) return;

        // 2. Fetch all bookings for this customer
        const bookingsRes = await datPhongApi.getBookingsByCustomerId(customer._id);
        setBookings(bookingsRes.data || bookingsRes || []);

        // 3. Fetch all service usages for this customer
        try {
          const usagesRes = await serviceUsageApi.getServiceUsagesByCustomerId(customer._id);
          setServiceRequests(usagesRes.data || usagesRes || []);
        } catch (err) {
          console.error("Error fetching service history:", err);
          // Don't fail the whole page if service history fails
        }

      } catch (error) {
        console.error("Error fetching history:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải lịch sử",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { label: "Chờ xác nhận", variant: "outline" },
      DepositPaid: { label: "Đã đặt cọc", variant: "default" },
      Confirmed: { label: "Đã xác nhận", variant: "default" },
      CheckedIn: { label: "Đang lưu trú", variant: "secondary" },
      CheckedOut: { label: "Đã trả phòng", variant: "outline" },
      Cancelled: { label: "Đã hủy", variant: "destructive" },
      NoShow: { label: "Không đến", variant: "destructive" },
      DepositCancel: { label: "Hủy cọc", variant: "outline", className: "border-orange-500 text-orange-500" },
      Completed: { label: "Hoàn thành", variant: "default" },
      "In Progress": { label: "Đang xử lý", variant: "secondary" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={info.variant} className={info.className}>{info.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch sử</h1>
        <p className="text-muted-foreground">Xem lại lịch sử đặt phòng và dịch vụ</p>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings" className="gap-2">
            <CalendarDays className="h-4 w-4" /> Đặt phòng ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <ConciergeBell className="h-4 w-4" /> Dịch vụ ({serviceRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map(booking => (
                <Card key={booking._id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Phòng {booking.HangPhong}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(booking.NgayDen)} - {formatDate(booking.NgayDi)}
                        </p>
                        <p className="text-sm mt-1">Mã: {booking.MaDatPhong}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {booking.SoKhach} khách
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.TrangThai)}
                        <p className="font-bold mt-2 text-primary">
                          Cọc: {booking.TienCoc?.toLocaleString()} VNĐ
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Chưa có lịch sử đặt phòng
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="services" className="mt-6">
          {serviceRequests.length > 0 ? (
            <div className="space-y-4">
              {serviceRequests.map(request => {
                const serviceName = request.DichVu?.TenDV || "Dịch vụ";
                return (
                  <Card key={request._id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {request.SoLuong}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(request.ThoiDiemYeuCau || request.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(request.TrangThai)}
                          <p className="font-bold mt-2 text-primary">
                            {request.ThanhTien?.toLocaleString()} VNĐ
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Chưa có lịch sử dịch vụ
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
