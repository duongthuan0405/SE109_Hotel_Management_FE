import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Utensils,
  Shirt,
  Plane,
  Car,
  Sparkles,
  Plus,
  Clock,
  CheckCircle,
  Loader2,
  PlayCircle,
} from "lucide-react";
import {
  serviceApi,
  datPhongApi,
  serviceUsageApi,
  rentalReceiptApi,
  customerApi,
} from "@/api";

// Map service names/codes to icons
const serviceIcons = {
  "Dịch Vụ Phòng": Utensils,
  DV01: Utensils,
  "Dịch Vụ Giặt Ủi": Shirt,
  DV02: Shirt,
  "Dịch Vụ Spa": Sparkles,
  DV03: Sparkles,
  "Đưa Đón Sân Bay": Plane,
  "Thuê Xe": Car,
};

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

export default function CustomerServices() {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = parseJwt(token);
        if (!decoded?.id) return;

        // 1. Get Customer
        const customers = await customerApi.getCustomers();
        const customer = customers.find((c) => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId =
            typeof c.TaiKhoan === "object" ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });

        if (!customer) {
          console.warn("No customer profile found for account:", decoded.id);
          setLoading(false);
          return;
        }

        // 2. Fetch Available Services
        const servicesData = await serviceApi.getServices();
        setServices(servicesData || []);

        // 3. Fetch My Bookings
        const bookingsData = await datPhongApi.getBookingsByCustomerId(customer._id);
        const bookings = bookingsData.data || bookingsData || [];
        
        // Find bookings that are already marked as CheckedIn
        let active = bookings.filter((b) => b.TrangThai === "CheckedIn");
        
        // 4. Try to find other active stays via Rental Receipts (PTP)
        // Wrapped in try-catch because this endpoint might be restricted for Customers
        try {
          const ptpRes = await rentalReceiptApi.getRentalReceipts();
          const allPtps = ptpRes.data || ptpRes || [];
          
          const activeStayBookingIds = allPtps
            .filter(ptp => ptp.TrangThai === 'CheckedIn')
            .map(ptp => {
               const dpId = ptp.DatPhong && typeof ptp.DatPhong === 'object' ? ptp.DatPhong._id : ptp.DatPhong;
               return dpId;
            });

          // Add any missing bookings that have a CheckedIn PTP
          bookings.forEach(b => {
            if (!active.some(a => a._id === b._id) && activeStayBookingIds.includes(b._id)) {
              active.push(b);
            }
          });
        } catch (ptpErr) {
          console.warn("Could not fetch rental receipts for extra stay check:", ptpErr.message);
        }
        
        setMyBookings(active);

        // 5. Fetch My Requests (All history) - Also wrapped
        try {
          const allUsagesReq = await serviceUsageApi.getServiceUsages();
          const allUsages = allUsagesReq.data || allUsagesReq || [];
          const allCustomerBookingIds = bookings.map((b) => b._id);

          const customerUsages = allUsages.filter((usage) => {
            if (!usage.PhieuThuePhong) return false;
            // usage.PhieuThuePhong.DatPhong might be ID or populated object
            const bookingId = usage.PhieuThuePhong.DatPhong;
            const idStr = typeof bookingId === "object" ? bookingId?._id : bookingId;
            return allCustomerBookingIds.includes(idStr);
          });
          setMyRequests(customerUsages);
        } catch (usageErr) {
          console.warn("Could not fetch service usage history:", usageErr.message);
        }
      } catch (error) {
        console.error("Error loading services data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingRequests = myRequests.filter((r) => r.TrangThai === "Pending");
  const inProgressRequests = myRequests.filter(
    (r) => r.TrangThai === "In Progress"
  );
  const completedRequests = myRequests.filter(
    (r) => r.TrangThai === "Completed"
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { label: "Chờ xử lý", variant: "outline", icon: Clock },
      "In Progress": {
        label: "Đang xử lý",
        variant: "secondary",
        icon: Loader2,
      },
      Completed: { label: "Hoàn thành", variant: "default", icon: CheckCircle },
      Cancelled: { label: "Đã hủy", variant: "destructive", icon: PlayCircle },
      DepositCancel: { label: "Hủy cọc", variant: "outline", icon: PlayCircle, className: "border-orange-500 text-orange-500" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" };
    const Icon = info.icon || Clock;
    return (
      <Badge variant={info.variant} className={`gap-1 ${info.className || ''}`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setDescription("");
    // Default to first active booking
    if (myBookings.length > 0) setSelectedBooking(myBookings[0]._id);
    else setSelectedBooking("");

    setQuantity(1);
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedBooking) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn đặt phòng (bạn cần Check-in trước)",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      // 1. Find the PhieuThuePhong for this booking
      const ptpsWrapper = await rentalReceiptApi.getRentalReceipts();
      const ptps = Array.isArray(ptpsWrapper)
        ? ptpsWrapper
        : ptpsWrapper.data || [];

      let ptp = ptps.find((p) => {
        const dpId =
          p.DatPhong && typeof p.DatPhong === "object"
            ? p.DatPhong._id
            : p.DatPhong;
        return dpId === selectedBooking;
      });

      // If no rental receipt exists, create one
      if (!ptp) {
        try {
          // Fetch the booking details to get necessary info
          const bookingsRes = await datPhongApi.getBookings();
          const allBookings = Array.isArray(bookingsRes)
            ? bookingsRes
            : bookingsRes.data || [];
          const booking = allBookings.find((b) => b._id === selectedBooking);

          if (!booking) {
            toast({
              title: "Lỗi",
              description: "Không tìm thấy thông tin đặt phòng.",
              variant: "destructive",
            });
            return;
          }

          // Fetch room ID from booking details
          let roomId = booking.Phong;
          if (!roomId && booking.ChiTietDatPhong && booking.ChiTietDatPhong.length > 0) {
            const firstDetail = booking.ChiTietDatPhong[0];
            roomId = typeof firstDetail.Phong === "object" ? firstDetail.Phong._id : firstDetail.Phong;
          }

          if (!roomId) {
            console.error("Booking missing Phong field:", booking);
            toast({
              title: "Lỗi",
              description:
                "Không thể xác định phòng từ đặt phòng. Vui lòng liên hệ quản lý.",
              variant: "destructive",
            });
            return;
          }

          // Get a valid staff member - try multiple endpoints
          let staffId = null;
          const staffEndpoints = [
            "http://localhost:5000/api/staffs",
            "http://localhost:5000/api/staff",
            "http://localhost:5000/api/nhanviens",
          ];

          for (const endpoint of staffEndpoints) {
            try {
              const staffRes = await fetch(endpoint, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              });
              if (staffRes.ok) {
                const staffData = await staffRes.json();
                const staffList = Array.isArray(staffData)
                  ? staffData
                  : staffData.data || [];
                if (staffList.length > 0) {
                  staffId = staffList[0]._id;
                  console.log("Found staff:", staffId);
                  break;
                }
              }
            } catch (e) {
              console.warn(`Could not fetch from ${endpoint}:`, e.message);
            }
          }

          if (!staffId) {
            console.error("No staff members found. Using system default.");
            toast({
              title: "Cảnh báo",
              description:
                "Sẽ yêu cầu quản lý gán nhân viên. Vui lòng chờ xử lý.",
              variant: "default",
            });

            staffId = "system";
          }

          const checkInDate = new Date(booking.NgayDen || new Date());
          const checkOutDate = new Date(
            booking.NgayDi || new Date(Date.now() + 86400000)
          );
          const guestCount =
            parseInt(booking.SoKhach) || parseInt(booking.TongSoNguoi) || 1;
const roomTypeInfo = {
  Normal: 400000,
  Standard: 600000,
  Premium: 900000,
  Luxury: 1500000,
};

          const adjustedPrice =
            parseFloat(booking.ThanhTien) ||
            parseFloat(booking.TongTien) ||
            roomTypeInfo[booking.HangPhong]; // Removed hardcoded default as per plan

          const ptpPayload = {
            MaPTP: `PTP${Date.now()}`,
            DatPhong: selectedBooking,
            Phong: roomId,
            NgayNhanPhong: checkInDate,
            NgayTraDuKien: checkOutDate,
            SoKhachThucTe: guestCount,
            DonGiaSauDieuChinh: adjustedPrice,
            NhanVienCheckIn: staffId,
            TrangThai: "CheckedIn",
          };

          console.log("Creating rental receipt with payload:", ptpPayload);
          const createdPtp = await rentalReceiptApi.createRentalReceipt(
            ptpPayload
          );
          ptp = createdPtp.data || createdPtp;
        } catch (ptpError) {
          console.error("Error creating rental receipt:", ptpError);
          toast({
            title: "Lỗi",
            description:
              ptpError.message ||
              "Không thể tạo phiếu thuê phòng. Vui lòng liên hệ quản lý.",
            variant: "destructive",
          });
          return;
        }
      }

      if (!ptp) {
        toast({
          title: "Lỗi",
          description: "Không tìm thấy phiếu thuê phòng.",
          variant: "destructive",
        });
        return;
      }

      // 2. Create Service Usage
      const payload = {
        MaSDV: `SDV${Date.now()}`,
        PhieuThuePhong: ptp._id,
        DichVu: selectedService._id,
        SoLuong: parseInt(quantity),
        NgaySDV: new Date(),
        DonGia: selectedService.DonGia,
        ThanhTien: selectedService.DonGia * quantity,
      };

      await serviceUsageApi.createServiceUsage(payload);

      toast({
        title: "Thành công",
        description: "Yêu cầu dịch vụ đã được gửi.",
      });
      setRequestDialogOpen(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error(error);
      toast({
        title: "Thất bại",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const ServiceCard = ({ service }) => {
    const Icon =
      serviceIcons[service.TenDV] || serviceIcons[service.MaDV] || Utensils;
    return (
      <Card
        className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
        onClick={() => handleServiceClick(service)}
      >
        <CardHeader className="pb-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">{service.TenDV}</CardTitle>
          <CardDescription>
            {service.MoTa || "Dịch vụ khách sạn cao cấp"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Giá</span>
            <span className="font-bold text-primary">
              {service.DonGia?.toLocaleString()} VNĐ
            </span>
          </div>
          <Button className="w-full mt-4" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Yêu cầu dịch vụ
          </Button>
        </CardContent>
      </Card>
    );
  };

  const RequestItem = ({ request }) => {
    // request.DichVu might be populated object or ID
    const serviceName = request.DichVu?.TenDV || "Dịch vụ";
    const Icon =
      serviceIcons[serviceName] ||
      serviceIcons[request.DichVu?.MaDV] ||
      Utensils;

    return (
      <div className="flex items-start gap-4 p-4 border rounded-lg">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">
              {serviceName} (x{request.SoLuong})
            </h4>
            {getStatusBadge(request.TrangThai)}
          </div>
          <div className="flex justify-between items-center pt-2 text-sm">
            <span className="text-muted-foreground">
              {new Date(
                request.createdAt || request.ThoiDiemYeuCau
              ).toLocaleDateString("vi-VN")}
            </span>
            <span className="font-medium">
              {request.ThanhTien?.toLocaleString()} VNĐ
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Dịch vụ khách sạn
        </h1>
        <p className="text-muted-foreground">
          Yêu cầu các dịch vụ bổ sung trong thời gian lưu trú
        </p>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Danh sách dịch vụ</TabsTrigger>
          <TabsTrigger value="requests">
            Yêu cầu của tôi
            {pendingRequests.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : myBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Bạn cần có đặt phòng ĐANG LƯU TRÚ (Check-in) để yêu cầu dịch
                  vụ.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => (window.location.href = "/customer/booking")}
                >
                  Đặt phòng mới
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service._id} service={service} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-6">
          {/* Pending */}
          {pendingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Đang chờ xử lý ({pendingRequests.length})
              </h3>
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <RequestItem key={request._id} request={request} />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Loader2 className="h-4 w-4" />
                Đang xử lý ({inProgressRequests.length})
              </h3>
              <div className="space-y-3">
                {inProgressRequests.map((request) => (
                  <RequestItem key={request._id} request={request} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Đã hoàn thành ({completedRequests.length})
              </h3>
              <div className="space-y-3">
                {completedRequests.map((request) => (
                  <RequestItem key={request._id} request={request} />
                ))}
              </div>
            </div>
          )}

          {!loading && myRequests.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Bạn chưa có yêu cầu dịch vụ nào
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yêu cầu dịch vụ: {selectedService?.TenDV}</DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết về yêu cầu của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Đặt phòng liên quan (Đã Check-in)</Label>
              <Select
                value={selectedBooking}
                onValueChange={setSelectedBooking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đặt phòng" />
                </SelectTrigger>
                <SelectContent>
                  {myBookings.map((booking) => (
                    <SelectItem key={booking._id} value={booking._id}>
                      {booking.HangPhong} - {booking.MaDatPhong}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Số lượng</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="w-8 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mô tả / Ghi chú</Label>
              <Textarea
                placeholder="Ghi chú thêm..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-3 bg-muted rounded-lg text-sm">
              <div className="flex justify-between">
                <span>Đơn giá:</span>
                <span className="font-medium">
                  {selectedService?.DonGia?.toLocaleString()} VNĐ
                </span>
              </div>
              <div className="flex justify-between mt-2 font-bold text-lg border-t pt-2">
                <span>Tổng cộng:</span>
                <span className="text-primary">
                  {(selectedService?.DonGia * quantity)?.toLocaleString()} VNĐ
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmitRequest} disabled={actionLoading}>
              {actionLoading && <Loader2 className="animate-spin mr-2" />} Gửi
              yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
