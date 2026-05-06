import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Banknote, Smartphone, CheckCircle, Loader2, FileText, Clock } from "lucide-react";
import { customerApi, datPhongApi, invoiceApi } from "@/api";

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const paymentMethods = [
  { id: "banking", name: "Chuyển khoản ngân hàng" },
  { id: "cash", name: "Tiền mặt tại quầy" },
];

export default function CustomerPayment() {
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("banking");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = parseJwt(token);
        if (!decoded?.id) return;

        // 1. Get Customer to know ID
        const customers = await customerApi.getCustomers();
        const customer = customers.find(c => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });

        if (customer) {
          // 2. Fetch Bookings
          const bookingRes = await datPhongApi.getBookingsByCustomerId(customer._id);
          setBookings(bookingRes.data || bookingRes || []);

          // 3. Fetch Invoices (and filter by customer)
          try {
            const invoiceRes = await invoiceApi.getInvoices();
            const allInvoices = invoiceRes.data || invoiceRes || [];
            const myInvoices = allInvoices.filter(inv => {
              const invCustId = typeof inv.KhachHang === 'object' ? inv.KhachHang._id : inv.KhachHang;
              return invCustId === customer._id;
            });
            setInvoices(myInvoices);
          } catch (invErr) {
            console.error("Error fetching invoices:", invErr);
          }
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin thanh toán",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unpaidBookings = bookings.filter(b => b.TrangThai === "Pending");
  const paidBookings = bookings.filter(b => ["Confirmed", "CheckedIn", "CheckedOut", "Completed"].includes(b.TrangThai));

  const handlePayClick = (booking) => {
    setSelectedBooking(booking);
    setPayDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      // Simulate payment processing
      await datPhongApi.updateBooking(selectedBooking._id, {
        TrangThai: 'Confirmed'
      });

      toast({
        title: "Thanh toán thành công",
        description: "Đã xác nhận đặt cọc. Đặt phòng của bạn đã được xác nhận.",
      });

      // Update local state
      setBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, TrangThai: 'Confirmed' } : b
      ));

      setPayDialogOpen(false);
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thanh toán</h1>
        <p className="text-muted-foreground">Quản lý thanh toán và hóa đơn</p>
      </div>

      <Tabs defaultValue="deposit">
        <TabsList>
          <TabsTrigger value="deposit" className="gap-2">
            <Clock className="h-4 w-4" /> Đặt cọc ({unpaidBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CreditCard className="h-4 w-4" /> Đã thanh toán ({paidBookings.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" /> Hóa đơn ({invoices.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Đặt cọc */}
        <TabsContent value="deposit" className="mt-6 space-y-4">
          {unpaidBookings.length > 0 ? (
            unpaidBookings.map(booking => (
              <Card key={booking._id}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg">Phòng {booking.HangPhong}</span>
                      <Badge variant="outline">{booking.MaDatPhong}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.NgayDen).toLocaleDateString('vi-VN')} - {new Date(booking.NgayDi).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mt-2">
                      Cần đặt cọc: <strong className="text-destructive text-lg">{booking.TienCoc?.toLocaleString()} VNĐ</strong>
                    </p>
                  </div>
                  <Button onClick={() => handlePayClick(booking)}>Thanh toán ngay</Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Không có khoản đặt cọc nào cần thanh toán</CardContent></Card>
          )}
        </TabsContent>

        {/* Tab Lịch sử (Deposits Paid) */}
        <TabsContent value="history" className="mt-6 space-y-4">
          {paidBookings.length > 0 ? (
            paidBookings.map(booking => (
              <Card key={booking._id}>
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Đặt cọc phòng {booking.HangPhong}</p>
                      <p className="text-xs text-muted-foreground">Mã: {booking.MaDatPhong}</p>
                      <p className="text-xs text-muted-foreground">
                        Ngày: {new Date(booking.updatedAt || booking.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">{booking.TienCoc?.toLocaleString()} VNĐ</p>
                    <Badge variant="outline">Chuyển khoản</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có lịch sử giao dịch</CardContent></Card>
          )}
        </TabsContent>

        {/* Tab Hóa đơn (Invoices Completed) */}
        <TabsContent value="invoices" className="mt-6 space-y-4">
          {invoices.length > 0 ? (
            invoices.map(invoice => (
              <Card key={invoice._id}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">Hóa đơn #{invoice.MaHD}</span>
                      <Badge variant="default">Đã thanh toán</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ngày lập: {new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-primary">{invoice.TongThanhToan?.toLocaleString()} VNĐ</p>
                    <p className="text-xs text-muted-foreground">Tổng tiền dịch vụ: {invoice.TongTienDichVu?.toLocaleString()} VNĐ</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có hóa đơn nào</CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Popup thanh toán */}
      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán đặt cọc</DialogTitle>
            <DialogDescription>Chọn hình thức thanh toán</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Mã đặt phòng:</span>
                  <span className="font-medium">{selectedBooking.MaDatPhong}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span>Số tiền cọc:</span>
                  <span className="font-bold text-primary text-lg">{selectedBooking.TienCoc?.toLocaleString()} VNĐ</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center space-x-2 border p-3 rounded cursor-pointer hover:bg-accent">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="cursor-pointer flex-1">{method.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {paymentMethod === 'banking' && (
                <div className="text-sm text-muted-foreground p-2 bg-yellow-50 border border-yellow-100 rounded">
                  <p>Ngân hàng: <strong>Vietcombank</strong></p>
                  <p>STK: <strong>0123456789</strong></p>
                  <p>Nội dung: <strong>{selectedBooking.MaDatPhong}</strong></p>
                  <p className="mt-1 text-xs">(Hệ thống sẽ tự động xác nhận sau khi bạn bấm xác nhận bên dưới)</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmPayment} disabled={actionLoading}>
              {actionLoading && <Loader2 className="animate-spin mr-2" />} Xác nhận đã thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
