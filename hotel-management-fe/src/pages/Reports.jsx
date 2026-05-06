import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, DollarSign, Bed } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { roomApi, bookingApi, invoiceApi, serviceUsageApi } from "@/api";

export default function Reports() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [serviceUsages, setServiceUsages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomsData, bookingsData, invoicesData, serviceUsagesData] =
          await Promise.all([
            roomApi.getRooms(),
            bookingApi.getBookings(),
            invoiceApi.getInvoices(),
            serviceUsageApi.getServiceUsages(),
          ]);

        // Normalize responses to handle both array and nested object responses
        const normalizedRooms = Array.isArray(roomsData)
          ? roomsData
          : roomsData?.data || [];
        const normalizedBookings = Array.isArray(bookingsData)
          ? bookingsData
          : bookingsData?.data || [];
        const normalizedInvoices = Array.isArray(invoicesData)
          ? invoicesData
          : invoicesData?.data || [];
        const normalizedServiceUsages = serviceUsagesData?.data || [];

        setRooms(normalizedRooms);
        setBookings(normalizedBookings);
        setInvoices(normalizedInvoices);
        setServiceUsages(normalizedServiceUsages);
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu báo cáo",
          variant: "destructive",
        });
        setRooms([]);
        setBookings([]);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = invoices
    .filter(
      (inv) =>
        inv.TrangThaiThanhToan === "Paid" ||
        inv.paymentStatus === "paid" ||
        inv.TrangThaiThanhToan === 1 ||
        inv.status === "paid"
    )
    .reduce(
      (sum, inv) => sum + (inv.TongTien || inv.TongThanhToan || inv.total || 0),
      0
    );
  const totalBookings = bookings.length;
  const occupancyRate =
    rooms.length > 0
      ? (
          (rooms.filter(
            (r) =>
              r.status === "occupied" ||
              r.TrangThai === "Occupied" ||
              r.TrangThai === 1
          ).length /
            rooms.length) *
          100
        ).toFixed(1)
      : 0;

  const exportRevenueReport = () => {
    if (!invoices.length) {
      toast({ title: "Không có dữ liệu hóa đơn" });
      return;
    }

    // Sort by date descending
    const sortedInvoices = [...invoices].sort(
      (a, b) =>
        new Date(b.NgayLap || b.invoiceDate) -
        new Date(a.NgayLap || a.invoiceDate)
    );

    const data = sortedInvoices.map((inv) => ({
      "Mã hóa đơn": inv.MaHD || inv.id || "",
      "Khách hàng":
        inv.KhachHang?.HoTen ||
        inv.KhachHang?.TenKH ||
        inv.customer?.name ||
        "Khách vãng lai",
      "Ngày lập": inv.NgayLap
        ? new Date(inv.NgayLap).toLocaleDateString("vi-VN")
        : inv.invoiceDate
        ? new Date(inv.invoiceDate).toLocaleDateString("vi-VN")
        : "",
      "Tiền phòng (VNĐ)": inv.TongTienPhong || 0,
      "Tiền dịch vụ (VNĐ)": inv.TongTienDichVu || 0,
      "Tổng thanh toán (VNĐ)":
        inv.TongThanhToan || inv.TongTien || inv.total || 0,
      "Trạng thái":
        inv.TrangThaiThanhToan === "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
    }));

    // Calculate Totals
    const totalRoom = data.reduce(
      (sum, item) => sum + (item["Tiền phòng (VNĐ)"] || 0),
      0
    );
    const totalService = data.reduce(
      (sum, item) => sum + (item["Tiền dịch vụ (VNĐ)"] || 0),
      0
    );
    const totalGrand = data.reduce(
      (sum, item) => sum + (item["Tổng thanh toán (VNĐ)"] || 0),
      0
    );

    // Append Total Row
    data.push({
      "Mã hóa đơn": "TỔNG CỘNG",
      "Khách hàng": "",
      "Ngày lập": "",
      "Tiền phòng (VNĐ)": totalRoom,
      "Tiền dịch vụ (VNĐ)": totalService,
      "Tổng thanh toán (VNĐ)": totalGrand,
      "Trạng thái": "",
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doanh thu");
    XLSX.writeFile(wb, "Bao_cao_doanh_thu.xlsx");
  };

  const exportRoomUsageReport = () => {
    if (!rooms.length) {
      toast({ title: "Không có dữ liệu phòng" });
      return;
    }

    const data = rooms.map((room) => {
      // Find all bookings for this room
      const roomBookings = bookings.filter((b) =>
        b.ChiTietDatPhong?.some(
          (detail) => (detail.Phong?._id || detail.Phong) === room._id
        )
      );

      // Calculate total nights occupied
      const totalNights = roomBookings.reduce((sum, b) => {
        if (!b.NgayDen || !b.NgayDi) return sum;
        const start = new Date(b.NgayDen);
        const end = new Date(b.NgayDi);
        const nights = Math.max(
          0,
          Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        );
        return sum + nights;
      }, 0);

      // Calculate total revenue form this room
      const totalRevenue = totalNights * (room.GiaPhong || 0);

      return {
        "Mã phòng": room.MaPhong || "",
        "Loại phòng": room.LoaiPhong?.TenLoaiPhong || "N/A",
        "Giá niêm yết (VNĐ)": room.GiaPhong || 0,
        "Trạng thái hiện tại":
          room.TrangThai === "Available"
            ? "Trống"
            : room.TrangThai === "Occupied"
            ? "Đang có khách"
            : room.TrangThai === "Reserved"
            ? "Đã đặt"
            : "Khác",
        "Tổng đêm đã sử dụng": totalNights,
        "Số lần đặt": roomBookings.length,
        "Tổng doanh thu (VNĐ)": totalRevenue,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Su_dung_phong");
    XLSX.writeFile(wb, "Bao_cao_su_dung_phong.xlsx");
  };

  const exportServiceUsageReport = () => {
    if (!serviceUsages.length) {
      toast({ title: "Không có dữ liệu lịch sử dịch vụ" });
      return;
    }

    const serviceMap = {};

    serviceUsages.forEach((usage) => {
      // Get service name from populated DichVu or fallback
      const serviceName = usage.DichVu?.TenDV || "Dịch vụ đã xóa/Unknown";

      if (!serviceMap[serviceName]) {
        serviceMap[serviceName] = {
          "Tên dịch vụ": serviceName,
          "Số lần bán": 0,
          "Tổng doanh thu (VNĐ)": 0,
        };
      }

      serviceMap[serviceName]["Số lần bán"] += usage.SoLuong || 0;
      serviceMap[serviceName]["Tổng doanh thu (VNĐ)"] += usage.ThanhTien || 0;
    });

    const data = Object.values(serviceMap).sort(
      (a, b) => b["Tổng doanh thu (VNĐ)"] - a["Tổng doanh thu (VNĐ)"]
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dich_vu");
    XLSX.writeFile(wb, "Bao_cao_dich_vu.xlsx");
  };

  const exportCustomerReport = () => {
    if (!bookings.length) {
      toast({ title: "Không có dữ liệu khách hàng" });
      return;
    }

    const customerMap = {};

    // Process Bookings
    bookings.forEach((b) => {
      const kh = b.KhachHang || b.customer;
      if (!kh) return; // Skip if no customer linked

      const customerId = kh._id || kh.id || kh.MaKH || "unknown";
      const customerName = kh.HoTen || kh.TenKH || "Khách vãng lai";

      if (!customerMap[customerId]) {
        customerMap[customerId] = {
          "Mã khách hàng": kh.MaKH || "N/A",
          "Tên khách hàng": customerName,
          "Số điện thoại": kh.SDT || kh.phone || "N/A",
          "Số lần đặt phòng": 0,
          "Tổng chi tiêu (VNĐ)": 0,
          "Lần cuối ghé thăm": null,
        };
      }

      customerMap[customerId]["Số lần đặt phòng"] += 1;

      const checkInDate = new Date(b.NgayDen);
      if (
        !customerMap[customerId]["Lần cuối ghé thăm"] ||
        checkInDate > customerMap[customerId]["Lần cuối ghé thăm"]
      ) {
        customerMap[customerId]["Lần cuối ghé thăm"] = checkInDate;
      }
    });

    // Match Invoices to Customers for Revenue
    invoices.forEach((inv) => {
      const kh = inv.KhachHang;
      if (kh) {
        const customerId = kh._id || kh;
        // Note: inv.KhachHang might be just ID string in some responses, or object in others.
        // Reports.jsx fetch does simple getInvoices(), logic in invoiceController populates KhachHang.
        // So inv.KhachHang should be object.
        const kID = typeof kh === "object" ? kh._id || kh.id : kh;

        if (customerMap[kID]) {
          customerMap[kID]["Tổng chi tiêu (VNĐ)"] += inv.TongThanhToan || 0;
        }
      }
    });

    const data = Object.values(customerMap)
      .map((c) => ({
        ...c,
        "Lần cuối ghé thăm": c["Lần cuối ghé thăm"]
          ? c["Lần cuối ghé thăm"].toLocaleDateString("vi-VN")
          : "N/A",
      }))
      .sort((a, b) => b["Tổng chi tiêu (VNĐ)"] - a["Tổng chi tiêu (VNĐ)"]);

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Khach_hang");
    XLSX.writeFile(wb, "Bao_cao_khach_hang.xlsx");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Báo cáo</h1>
          <p className="text-muted-foreground">
            Xem và xuất các báo cáo thống kê
          </p>
        </div>
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng doanh thu
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalRevenue / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground">VNĐ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số đặt phòng</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
            <p className="text-xs text-muted-foreground">Tổng số đơn</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ sử dụng phòng
            </CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">Trung bình</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                bookings.filter(
                  (b) =>
                    b.status === "checked_in" || b.TrangThai === "CheckedIn"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Đang lưu trú</p>
          </CardContent>
        </Card>
      </div>

      {/* Loại báo cáo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Báo cáo chi tiết về doanh thu theo khoảng thời gian, loại phòng và
              dịch vụ
            </p>
            <Button className="w-full gap-2" onClick={exportRevenueReport}>
              <Download className="h-4 w-4" />
              Xuất báo cáo doanh thu
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo tỷ lệ sử dụng phòng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thống kê tỷ lệ sử dụng phòng theo thời gian và loại phòng
            </p>
            <Button className="w-full gap-2" onClick={exportRoomUsageReport}>
              <Download className="h-4 w-4" />
              Xuất báo cáo sử dụng phòng
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thống kê sử dụng các dịch vụ bổ sung và doanh thu từ dịch vụ
            </p>
            <Button className="w-full gap-2" onClick={exportServiceUsageReport}>
              <Download className="h-4 w-4" />
              Xuất báo cáo dịch vụ
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Báo cáo khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thống kê khách hàng mới, khách quay lại và mức độ hài lòng
            </p>
            <Button className="w-full gap-2" onClick={exportCustomerReport}>
              <Download className="h-4 w-4" />
              Xuất báo cáo khách hàng
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
