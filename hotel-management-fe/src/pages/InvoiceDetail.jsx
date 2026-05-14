import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  ChevronLeft, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  CreditCard,
  Hash,
  Home,
  DollarSign
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { invoiceApi, paymentMethodApi } from "@/api";

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết hóa đơn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsUpdating(true);
    try {
      // Tự động lấy phương thức thanh toán đầu tiên (thường là Tiền mặt)
      const pms = await paymentMethodApi.getPaymentMethods();
      const defaultPmId = pms.data?.[0]?._id || "";

      await invoiceApi.confirmPayment(id, {
        PhuongThucThanhToan: defaultPmId,
      });
      
      toast({ title: "Thành công", description: "Đã xác nhận thanh toán hóa đơn" });
      loadInvoice();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xác nhận thanh toán",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Đang tải dữ liệu hóa đơn...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-destructive">Không tìm thấy hóa đơn</h2>
        <Button variant="link" onClick={() => navigate("/invoices")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const config = {
      Paid: { label: "Đã thanh toán", color: "bg-success text-success-foreground" },
      Unpaid: { label: "Chưa thanh toán", color: "bg-destructive text-destructive-foreground" },
      PartiallyPaid: { label: "Thanh toán một phần", color: "bg-warning text-warning-foreground" },
      Refunded: { label: "Đã hoàn tiền", color: "bg-secondary text-secondary-foreground" },
    };
    const s = config[status] || { label: status, color: "bg-muted text-muted-foreground" };
    return <Badge className={s.color}>{s.label}</Badge>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* Header - Hidden when printing */}
      <div className="flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => navigate("/invoices")} className="gap-2">
          <ChevronLeft className="h-4 w-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          {invoice.TrangThaiThanhToan === "Unpaid" && (
            <Button className="gap-2" onClick={handleConfirmPayment} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Xác nhận thanh toán nhanh
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> In hóa đơn
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 print:block">
        {/* Left Column: Info Card */}
        <div className="md:col-span-1 space-y-6 print:mb-6">
          <Card className="print:border-none print:shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Mã hóa đơn
                </Label>
                <p className="font-bold text-lg">{invoice.MaHD}</p>
              </div>
              
              <div className="space-y-1 print:hidden">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Trạng thái
                </Label>
                <div>{getStatusBadge(invoice.TrangThaiThanhToan)}</div>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Ngày lập
                </Label>
                <p className="font-medium">
                  {new Date(invoice.NgayLap).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <User className="h-3 w-3" /> Khách hàng
                </Label>
                <p className="font-medium">{invoice.KhachHang?.fullName || invoice.KhachHang?.HoTen || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <CreditCard className="h-3 w-3" /> Phương thức
                </Label>
                <p className="font-medium">{invoice.PhuongThucThanhToan?.name || invoice.PhuongThucThanhToan?.TenPTTT || "N/A"}</p>
              </div>

              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2">
                  <Home className="h-3 w-3" /> Số phòng
                </Label>
                <p className="font-bold text-primary">
                  {invoice.DatPhong?.rentalSlips?.map(rs => rs.room?.code).join(", ") || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Items Table */}
        <div className="md:col-span-2 space-y-6">
          <Card className="print:border-none print:shadow-none">
            <CardHeader>
              <CardTitle>Chi tiết dịch vụ & Hạng mục</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-black">
                    <TableHead className="px-4 text-black">Tên hạng mục</TableHead>
                    <TableHead className="text-center text-black">Số lượng</TableHead>
                    <TableHead className="text-right text-black">Đơn giá</TableHead>
                    <TableHead className="text-right px-4 text-black">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.ChiTietHoaDon?.map((item, idx) => (
                    <TableRow key={idx} className="border-black">
                      <TableCell className="font-medium px-4">{item.TenHang}</TableCell>
                      <TableCell className="text-center">{item.SoLuong}</TableCell>
                      <TableCell className="text-right">{item.DonGia?.toLocaleString("vi-VN")} đ</TableCell>
                      <TableCell className="text-right font-bold text-primary px-4">
                        {item.ThanhTien?.toLocaleString("vi-VN")} đ
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Summary Section */}
              <div className="mt-8 space-y-3 bg-muted/30 p-6 rounded-xl border border-dashed print:border-solid print:bg-transparent">
                <div className="flex justify-between text-muted-foreground print:text-black">
                  <span>Tiền phòng:</span>
                  <span>{invoice.TongTienPhong?.toLocaleString("vi-VN")} đ</span>
                </div>
                <div className="flex justify-between text-muted-foreground print:text-black">
                  <span>Tiền dịch vụ:</span>
                  <span>{invoice.TongTienDichVu?.toLocaleString("vi-VN")} đ</span>
                </div>
                
                {invoice.PhuThu > 0 && (
                  <div className="flex justify-between text-orange-600 print:text-black">
                    <span>Phụ thu:</span>
                    <span>+{invoice.PhuThu?.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}
                
                {invoice.TienBoiThuong > 0 && (
                  <div className="flex justify-between text-destructive print:text-black">
                    <span>Bồi thường:</span>
                    <span>+{invoice.TienBoiThuong?.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                {invoice.TienDaCoc > 0 && (
                  <div className="flex justify-between text-green-600 font-medium print:text-black">
                    <span>Đã đặt cọc:</span>
                    <span>-{invoice.TienDaCoc?.toLocaleString("vi-VN")} đ</span>
                  </div>
                )}

                <div className="border-t pt-4 mt-4 flex justify-between items-center border-black">
                  <span className="text-xl font-bold">Tổng thanh toán</span>
                  <span className="text-3xl font-extrabold text-primary print:text-black">
                    {invoice.TongThanhToan?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>

              <div className="hidden print:grid grid-cols-2 text-center mt-20 italic text-sm">
                <div>
                  <p className="font-bold not-italic">Khách hàng</p>
                  <p className="text-xs text-muted-foreground">(Ký và ghi rõ họ tên)</p>
                </div>
                <div>
                  <p className="font-bold not-italic">Nhân viên thu ngân</p>
                  <p className="text-xs text-muted-foreground">(Ký và ghi rõ họ tên)</p>
                  <div className="mt-20 not-italic font-bold text-lg">
                    {invoice.NhanVienThuNgan?.fullName || invoice.NhanVienThuNgan?.HoTen || ".........................."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
