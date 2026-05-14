import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle, Loader2, FileText, Clock, Wallet } from "lucide-react";
import { datPhongApi, invoiceApi, momoApi } from "@/api";

const paymentMethods = [
  { id: "momo", name: "Ví điện tử MoMo", icon: Wallet },
  { id: "banking", name: "Chuyển khoản ngân hàng", icon: CreditCard },
  { id: "cash", name: "Tiền mặt tại quầy", icon: Wallet },
];

export default function CustomerPayment() {
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Lấy danh sách đặt phòng (Token)
        const bookingRes = await datPhongApi.getBookings();
        setBookings(bookingRes.data || []);

        // 2. Lấy danh sách hóa đơn cá nhân (Token)
        try {
          const invoiceRes = await invoiceApi.getMyInvoices();
          setInvoices(invoiceRes.data || []);
        } catch (invErr) {
          console.error("Error fetching invoices:", invErr);
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
      // Nếu chọn MoMo thì thực hiện luồng thanh toán thật
      if (paymentMethod === "momo") {
        const payload = {
          HangPhong: selectedBooking.HangPhong,
          NgayDen: selectedBooking.NgayDen,
          NgayDi: selectedBooking.NgayDi,
          SoLuongPhong: selectedBooking.SoLuongPhong || 1,
          TienCoc: selectedBooking.TienCoc,
        };
        const { payUrl } = await momoApi.createPayment(payload);
        if (payUrl) {
          window.location.href = payUrl;
          return;
        }
      }

      // Giả lập luồng thanh toán đặt cọc cho các phương thức khác
      await datPhongApi.updateBooking(selectedBooking._id, {
        TrangThai: 'Confirmed'
      });

      toast({
        title: "Xác nhận thành công",
        description: "Yêu cầu thanh toán của bạn đang được hệ thống kiểm tra.",
      });

      // Cập nhật state cục bộ
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

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thanh toán & Hóa đơn</h1>
        <p className="text-muted-foreground">Quản lý các khoản đặt cọc và xem lịch sử hóa đơn của bạn</p>
      </div>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="deposit" className="gap-2">
            <Clock className="h-4 w-4" /> Cần đặt cọc ({unpaidBookings.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Đã cọc ({paidBookings.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" /> Hóa đơn ({invoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="mt-6 space-y-4">
          {unpaidBookings.length > 0 ? (
            unpaidBookings.map(booking => (
              <Card key={booking._id} className="overflow-hidden border-l-4 border-l-yellow-500">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">Phòng {booking.HangPhong}</span>
                      <Badge variant="outline">{booking.MaDatPhong}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Lưu trú: {new Date(booking.NgayDen).toLocaleDateString('vi-VN')} - {new Date(booking.NgayDi).toLocaleDateString('vi-VN')}
                    </p>
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground">Số tiền cần đặt cọc:</p>
                      <p className="font-bold text-2xl text-destructive">{booking.TienCoc?.toLocaleString()} VNĐ</p>
                    </div>
                  </div>
                  <Button size="lg" onClick={() => handlePayClick(booking)} className="w-full md:w-auto">Thanh toán ngay</Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Hiện không có khoản đặt cọc nào cần thanh toán.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          {paidBookings.length > 0 ? (
            paidBookings.map(booking => (
              <Card key={booking._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Đặt cọc phòng {booking.HangPhong}</p>
                      <p className="text-xs text-muted-foreground">Mã: {booking.MaDatPhong} • Ngày: {new Date(booking.updatedAt || booking.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-green-600">+{booking.TienCoc?.toLocaleString()} VNĐ</p>
                    <Badge variant="secondary" className="font-normal">Hoàn tất</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Bạn chưa có lịch sử đặt cọc nào.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 space-y-4">
          {invoices.length > 0 ? (
            invoices.map(invoice => (
              <Card key={invoice._id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="space-y-1 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">Hóa đơn #{invoice.MaHD}</span>
                      <Badge className="bg-blue-500 hover:bg-blue-600">Đã thanh toán</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ngày lập: {new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right w-full md:w-auto border-t md:border-0 pt-4 md:pt-0">
                    <p className="text-xs text-muted-foreground">Tổng thanh toán</p>
                    <p className="font-bold text-2xl text-primary">{invoice.TongThanhToan?.toLocaleString()} VNĐ</p>
                    <p className="text-xs text-muted-foreground">Phí dịch vụ: {invoice.TongTienDichVu?.toLocaleString()} VNĐ</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-12 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Bạn chưa có hóa đơn thanh toán cuối cùng nào.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Thanh toán trực tuyến</DialogTitle>
            <DialogDescription>Vui lòng chọn phương thức thanh toán phù hợp</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6 py-4">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dịch vụ:</span>
                  <span className="font-medium text-foreground">Đặt cọc phòng {selectedBooking.HangPhong}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary/10">
                  <span className="text-sm font-semibold">Tổng cộng:</span>
                  <span className="font-bold text-2xl text-primary">{selectedBooking.TienCoc?.toLocaleString()} VNĐ</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base">Phương thức thanh toán</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-3">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center space-x-3 border rounded-xl p-4 cursor-pointer hover:bg-accent transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex items-center gap-3 cursor-pointer flex-1 font-medium">
                        <method.icon className="h-5 w-5 text-primary" />
                        {method.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {paymentMethod === 'banking' && (
                <div className="text-sm space-y-2 p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <p className="flex justify-between"><span>Ngân hàng:</span> <span className="font-bold">Vietcombank</span></p>
                  <p className="flex justify-between"><span>Số tài khoản:</span> <span className="font-bold">0123456789</span></p>
                  <p className="flex justify-between"><span>Nội dung CK:</span> <span className="font-bold text-primary">{selectedBooking.MaDatPhong}</span></p>
                  <p className="mt-2 text-xs text-yellow-700 italic">Lưu ý: Hệ thống sẽ ghi nhận sau khi bạn nhấn "Xác nhận đã chuyển".</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPayDialogOpen(false)} className="flex-1">Đóng</Button>
            <Button onClick={handleConfirmPayment} disabled={actionLoading} className="flex-1">
              {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận thanh toán"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
