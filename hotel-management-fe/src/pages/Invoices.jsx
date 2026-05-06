import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download, Eye, DollarSign, Loader2 } from "lucide-react";
import {
  invoiceApi,
  bookingApi,
  customerApi,
  rentalReceiptApi,
  paymentMethodApi,
} from "@/api";

export default function Invoices() {
  const loadCustomers = async () => {
    try {
      const data = await customerApi.getCustomers();
      setCustomers(data.data);
    } catch (err) {
      console.error("Load customers error", err);
    }
  };
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [formData, setFormData] = useState({
    PhieuThuePhong: "",
    NhanVienThuNgan: "",
    KhachHang: "",
    PhuongThucThanhToan: "",
    TongTienPhong: 0,
    TongTienDichVu: 0,
    PhuThu: 0,
    TienBoiThuong: 0,
    TienDaCoc: 0,
    TrangThaiThanhToan: "Paid",
    HoTenKhachHang: "", // Display only
  });
  const [rentalReceipts, setRentalReceipts] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadRentalReceipts();
    loadCustomers();
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const data = await paymentMethodApi.getPaymentMethods();
      setPaymentMethods(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const loadRentalReceipts = async () => {
    try {
      const data = await rentalReceiptApi.getRentalReceipts();
      const receipts = Array.isArray(data) ? data : data.data || [];
      const active = receipts.filter((r) => r.TrangThai === "CheckedIn");
      setRentalReceipts(active);
    } catch (error) {
      console.error("Error loading rental receipts:", error);
    }
  };

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await invoiceApi.getInvoices();
      setInvoices(data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách hóa đơn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await bookingApi.getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!formData.PhieuThuePhong || !formData.PhuongThucThanhToan) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn Phiếu thuê phòng và Phương thức thanh toán",
        variant: "destructive",
      });
      return;
    }

    // Clean up payload: remove NhanVienThuNgan and empty strings
    const { NhanVienThuNgan, ...rest } = formData;
    const cleanData = Object.fromEntries(
      Object.entries(rest).filter(
        ([_, v]) => v !== "" && v !== null && v !== undefined
      )
    );

    const payload = {
      ...cleanData,
      TongTienPhong: Number(formData.TongTienPhong) || 0,
      TongTienDichVu: Number(formData.TongTienDichVu) || 0,
      PhuThu: Number(formData.PhuThu) || 0,
      TienBoiThuong: Number(formData.TienBoiThuong) || 0,
      TienDaCoc: Number(formData.TienDaCoc) || 0,
    };

    // Ensure display-only field is not sent
    delete payload.HoTenKhachHang;

    console.log("Creating invoice with cleaned payload:", payload);

    try {
      await invoiceApi.createInvoice(payload);
      toast({
        title: "Thành công",
        description: "Hóa đơn mới đã được tạo và đánh dấu là Đã thanh toán",
      });
      setFormData({
        PhieuThuePhong: "",
        NhanVienThuNgan: "",
        KhachHang: "",
        PhuongThucThanhToan: "",
        TongTienPhong: 0,
        TongTienDichVu: 0,
        PhuThu: 0,
        TienBoiThuong: 0,
        TienDaCoc: 0,
        TrangThaiThanhToan: "Paid",
      });
      setIsCreateOpen(false);
      loadInvoices();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hóa đơn",
        variant: "destructive",
      });
    }
  };

  const handleReceiptSelect = async (phieuId) => {
    try {
      const resp = await invoiceApi.getPreview(phieuId);
      if (resp.success) {
        const { data } = resp;
        setFormData((prev) => ({
          ...prev,
          PhieuThuePhong: phieuId,
          KhachHang: data.KhachHang,
          TongTienPhong: data.TongTienPhong,
          TongTienDichVu: data.TongTienDichVu,
          TienDaCoc: data.TienDaCoc,
          HoTenKhachHang: data.HoTenKhachHang || "",
        }));
      }
    } catch (err) {
      console.error("Fetch preview error:", err);
      setFormData((prev) => ({ ...prev, PhieuThuePhong: phieuId }));
    }
  };

  const handleViewDetail = async (invoice) => {
    try {
      const detail = await invoiceApi.getInvoiceById(invoice._id);
      setSelectedInvoice(detail);
      setIsViewDetailOpen(true);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải chi tiết hóa đơn",
        variant: "destructive",
      });
    }
  };

  const handlePrint = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintOpen(true);
  };

  const handleConfirmPrint = () => {
    toast({
      title: "Đang in",
      description: "Hóa đơn đang được in...",
    });
    setIsPrintOpen(false);
    // In a real application, this would trigger the browser's print dialog
    if (window) {
      window.print();
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      Unpaid: {
        label: "Chưa thanh toán",
        className: "bg-destructive text-destructive-foreground",
      },
      Paid: {
        label: "Đã thanh toán",
        className: "bg-success text-success-foreground",
      },
      PartiallyPaid: {
        label: "Thanh toán một phần",
        className: "bg-warning text-warning-foreground",
      },
      Refunded: {
        label: "Đã hoàn tiền",
        className: "bg-secondary text-secondary-foreground",
      },
    };
    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-500",
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const calculateTotal = (invoice) => {
    if (!invoice) return 0;
    const tong =
      (Number(invoice.TongTienPhong) || 0) +
      (Number(invoice.TongTienDichVu) || 0) +
      (Number(invoice.PhuThu) || 0) +
      (Number(invoice.TienBoiThuong) || 0) -
      (Number(invoice.TienDaCoc) || 0);
    return Math.max(0, tong);
  };

  const totalRevenue = invoices
    .filter((i) => i.TrangThaiThanhToan === "Paid")
    .reduce((sum, inv) => sum + calculateTotal(inv), 0);
  const unpaidAmount = invoices
    .filter(
      (i) =>
        i.TrangThaiThanhToan === "Unpaid" ||
        i.TrangThaiThanhToan === "PartiallyPaid"
    )
    .reduce((sum, inv) => sum + calculateTotal(inv), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý hóa đơn
          </h1>
          <p className="text-muted-foreground">
            Tạo và quản lý hóa đơn thanh toán
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tạo hóa đơn mới
        </Button>
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã thanh toán</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter((i) => i.TrangThaiThanhToan === "Paid").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {(totalRevenue / 1000000).toFixed(1)}M VNĐ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chưa thanh toán
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                invoices.filter(
                  (i) =>
                    i.TrangThaiThanhToan === "Unpaid" ||
                    i.TrangThaiThanhToan === "PartiallyPaid"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {(unpaidAmount / 1000000).toFixed(1)}M VNĐ
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã hoàn tiền</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                invoices.filter((i) => i.TrangThaiThanhToan === "Refunded")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng hđ */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Phiếu thuê phòng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>{invoice.MaHD}</TableCell>
                    <TableCell>
                      {invoice.PhieuThuePhong?.MaPTP || "N/A"}
                    </TableCell>
                    <TableCell>{invoice.KhachHang?.HoTen || "N/A"}</TableCell>
                    <TableCell>
                      {invoice.createdAt
                        ? new Date(invoice.createdAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.TongThanhToan?.toLocaleString("vi-VN")} VNĐ
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(invoice.TrangThaiThanhToan)}
                    </TableCell>
                    <TableCell>
                      {invoice.PhuongThucThanhToan?.TenPTTT || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrint(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Popup tạo hđ */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Tạo hóa đơn mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[65vh] pr-2">
            <div className="grid gap-2">
              <Label htmlFor="bookingRef">Phiếu thuê phòng</Label>
              <Select
                value={formData.PhieuThuePhong}
                onValueChange={handleReceiptSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phiếu thuê phòng" />
                </SelectTrigger>
                <SelectContent>
                  {rentalReceipts.map((r) => (
                    <SelectItem key={r._id} value={r._id}>
                      {r.MaPTP} - Phòng{" "}
                      {r.Phong?.SoPhong || r.Phong?.MaPhong || "N/A"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.HoTenKhachHang && (
              <div className="grid gap-2">
                <Label>Khách hàng (Tự động)</Label>
                <Input
                  value={formData.HoTenKhachHang}
                  readOnly
                  className="bg-muted"
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="roomTotal">Tổng tiền phòng (VNĐ)</Label>
              <Input
                id="roomTotal"
                type="number"
                value={formData.TongTienPhong}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceTotal">Tổng tiền dịch vụ (VNĐ)</Label>
              <Input
                id="serviceTotal"
                type="number"
                value={formData.TongTienDichVu}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="surcharge">Phụ thu (VNĐ)</Label>
              <Input
                id="surcharge"
                type="number"
                value={formData.PhuThu}
                onChange={(e) =>
                  setFormData({ ...formData, PhuThu: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="compensation">Tiền bồi thường (VNĐ)</Label>
              <Input
                id="compensation"
                type="number"
                value={formData.TienBoiThuong}
                onChange={(e) =>
                  setFormData({ ...formData, TienBoiThuong: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deposit">Tiền đã cọc (VNĐ)</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.TienDaCoc}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
              <Select
                value={formData.PhuongThucThanhToan}
                onValueChange={(value) =>
                  setFormData({ ...formData, PhuongThucThanhToan: value })
                }
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm._id} value={pm._id}>
                      {pm.TenPTTT}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              {/* <Label htmlFor="paymentStatus">Trạng thái thanh toán</Label>
              <Select
                value={formData.TrangThaiThanhToan}
                onValueChange={(value) =>
                  setFormData({ ...formData, TrangThaiThanhToan: value })
                }
              >
                <SelectTrigger id="paymentStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="PartiallyPaid">
                    Thanh toán một phần
                  </SelectItem>
                  <SelectItem value="Paid">Đã thanh toán</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Tổng cộng cần thanh toán:</span>
                <span className="text-primary">
                  {calculateTotal(formData).toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateInvoice}
              disabled={!formData.PhieuThuePhong}
            >
              Tạo hóa đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup chi tiết hđ */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã hóa đơn</Label>
                  <p className="text-lg font-semibold">
                    {selectedInvoice.MaHD}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">
                    {getPaymentStatusBadge(selectedInvoice.TrangThaiThanhToan)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Phiếu thuê phòng
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedInvoice.PhieuThuePhong?.MaPTP || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Khách hàng</Label>
                  <p className="text-lg font-semibold">
                    {selectedInvoice.KhachHang?.HoTen || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày lập</Label>
                  <p className="text-lg font-semibold">
                    {selectedInvoice.createdAt
                      ? new Date(selectedInvoice.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Phương thức thanh toán
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedInvoice.PhuongThucThanhToan?.TenPTTT || "N/A"}
                  </p>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền phòng:</span>
                  <span className="font-semibold">
                    {(selectedInvoice.TongTienPhong || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tiền dịch vụ:</span>
                  <span className="font-semibold">
                    {(selectedInvoice.TongTienDichVu || 0).toLocaleString(
                      "vi-VN"
                    )}{" "}
                    VNĐ
                  </span>
                </div>
                {selectedInvoice.PhuThu > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phụ thu:</span>
                    <span className="font-semibold">
                      +{(selectedInvoice.PhuThu || 0).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                )}
                {selectedInvoice.TienBoiThuong > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bồi thường:</span>
                    <span className="font-semibold">
                      -
                      {(selectedInvoice.TienBoiThuong || 0).toLocaleString(
                        "vi-VN"
                      )}{" "}
                      VNĐ
                    </span>
                  </div>
                )}
                {selectedInvoice.TienDaCoc > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Đã cọc:</span>
                    <span className="font-semibold">
                      -
                      {(selectedInvoice.TienDaCoc || 0).toLocaleString("vi-VN")}{" "}
                      VNĐ
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="font-bold">
                    {calculateTotal(selectedInvoice).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup in hđ */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Xem trước & In hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="border rounded-lg p-6 space-y-4">
              <div className="text-center border-b pb-4">
                <h3 className="text-xl font-bold">HÓA ĐƠN</h3>
                <p className="text-sm text-muted-foreground">
                  Hệ thống Quản lý Khách sạn
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã hóa đơn:</span>
                  <span className="font-semibold">
                    {selectedInvoice.MaHD ||
                      selectedInvoice._id.substring(0, 8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày lập:</span>
                  <span className="font-semibold">
                    {selectedInvoice.createdAt
                      ? new Date(selectedInvoice.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-semibold">
                    {selectedInvoice.KhachHang?.HoTen || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Phiếu thuê phòng:
                  </span>
                  <span className="font-semibold">
                    {selectedInvoice.PhieuThuePhong?.MaPTP || "N/A"}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="font-bold">
                    {calculateTotal(selectedInvoice).toLocaleString("vi-VN")}{" "}
                    VNĐ
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPrintOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmPrint}>In hóa đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
