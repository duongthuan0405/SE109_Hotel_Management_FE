import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Calendar, X, Plus, AlertCircle, Loader2 } from "lucide-react";
import { datPhongApi, customerApi } from "@/api";

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function CustomerMyBookings() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Get current customer from token
        const token = localStorage.getItem('token');
        if (!token) {
          toast({ title: "Lỗi", description: "Vui lòng đăng nhập", variant: "destructive" });
          return;
        }

        const decoded = parseJwt(token);
        if (!decoded?.id) return;

        // Find customer by account ID
        const customers = await customerApi.getCustomers();
        const customer = customers.find(c => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });

        if (!customer) {
          console.warn("No customer profile found");
          return;
        }
        setCurrentCustomer(customer);

        // 2. Fetch bookings for this customer
        const bookingsData = await datPhongApi.getBookingsByCustomerId(customer._id);
        setBookings(bookingsData.data || bookingsData || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách đặt phòng",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { label: "Chờ xác nhận", variant: "outline", color: "text-yellow-600" },
      DepositPaid: { label: "Đã đặt cọc", variant: "default", color: "text-blue-600" },
      Confirmed: { label: "Đã xác nhận", variant: "default", color: "text-blue-600" },
      CheckedIn: { label: "Đang lưu trú", variant: "secondary", color: "text-green-600" },
      CheckedOut: { label: "Đã trả phòng", variant: "outline", color: "text-gray-600" },
      Cancelled: { label: "Đã hủy", variant: "destructive", color: "text-red-600" },
      NoShow: { label: "Không đến", variant: "destructive", color: "text-red-600" },
      DepositCancel: { label: "Hủy cọc", variant: "outline", color: "text-orange-500", className: "border-orange-500" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={info.variant} className={info.className}>{info.label}</Badge>;
  };

  const canCancel = (status) => ["Pending", "DepositPaid", "Confirmed"].includes(status);
  const canExtend = (status) => ["DepositPaid", "Confirmed", "CheckedIn"].includes(status);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleExtendClick = (booking) => {
    setSelectedBooking(booking);
    setNewCheckOutDate(booking.NgayDi?.split('T')[0] || "");
    setExtendDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;

    try {
      setActionLoading(true);
      await datPhongApi.cancelBooking(selectedBooking._id);
      toast({
        title: "Hủy đặt phòng thành công",
        description: "Tiền cọc sẽ được hoàn lại theo chính sách.",
      });
      // Update local state
      setBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, TrangThai: 'Cancelled' } : b
      ));
      setCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!selectedBooking || !newCheckOutDate) return;

    const currentCheckOut = new Date(selectedBooking.NgayDi);
    const newCheckOut = new Date(newCheckOutDate);

    if (newCheckOut <= currentCheckOut) {
      toast({
        title: "Ngày không hợp lệ",
        description: "Ngày trả phòng mới phải sau ngày hiện tại",
        variant: "destructive",
      });
      return;
    }

    try {
      setActionLoading(true);

      // 1. Fetch ALL bookings to check for overlap
      // This is crucial to prevent overbooking
      const allBookingsRes = await datPhongApi.getBookings();
      const allBookings = allBookingsRes.data || allBookingsRes || [];

      // 2. Identify the room(s) of the current booking
      // Note: ChiTietDatPhong is array. In our simple UI we act like 1 room per booking usually, 
      // but should handle array.
      if (!selectedBooking.ChiTietDatPhong || selectedBooking.ChiTietDatPhong.length === 0) {
        throw new Error("Không tìm thấy thông tin phòng của đơn đặt này.");
      }

      const currentRoomIds = selectedBooking.ChiTietDatPhong.map(detail =>
        typeof detail.Phong === 'object' ? detail.Phong._id : detail.Phong
      );

      // 3. Check for conflicts
      // We need to check if ANY of currentRoomIds is busy between oldCheckOut and newCheckOut
      // However, to be safe, we check validity of the WHOLE new range vs other bookings.
      // Range: [selectedBooking.NgayDen, newCheckOut]
      const newStart = new Date(selectedBooking.NgayDen);
      const newEnd = newCheckOut;

      const hasConflict = allBookings.some(b => {
        // Skip self
        if (b._id === selectedBooking._id) return false;
        // Skip inactive
        if (['Cancelled', 'NoShow', 'CheckedOut', 'Completed'].includes(b.TrangThai)) return false;

        // Check room match
        const bRoomIds = (b.ChiTietDatPhong || []).map(d =>
          typeof d.Phong === 'object' ? d.Phong._id : d.Phong
        );
        const shareRoom = currentRoomIds.some(rid => bRoomIds.includes(rid));
        if (!shareRoom) return false;

        // Check Date Overlap
        // Overlap if (StartA < EndB) and (EndA > StartB)
        const bStart = new Date(b.NgayDen);
        const bEnd = new Date(b.NgayDi);

        return (newStart < bEnd && newEnd > bStart);
      });

      if (hasConflict) {
        toast({
          title: "Không thể gia hạn",
          description: "Phòng đã có người đặt trong khoảng thời gian này.",
          variant: "destructive"
        });
        return;
      }

      // 4. Proceed if no conflict
      await datPhongApi.updateBooking(selectedBooking._id, { NgayDi: newCheckOutDate });
      toast({
        title: "Gia hạn thành công",
        description: "Đã cập nhật ngày trả phòng mới.",
      });
      // Update local state
      setBookings(prev => prev.map(b =>
        b._id === selectedBooking._id ? { ...b, NgayDi: newCheckOutDate } : b
      ));
      setExtendDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error(error);
      toast({ title: "Lỗi", description: "Có lỗi xảy ra khi kiểm tra phòng trống.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Đặt phòng của tôi</h1>
        <p className="text-muted-foreground">Quản lý các đặt phòng của bạn</p>
      </div>

      {/* Quy định */}
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Quy định đặt phòng
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>• Hủy đặt phòng trước 48 giờ: Hoàn lại 100% tiền cọc</p>
          <p>• Hủy đặt phòng trước 24 giờ: Hoàn lại 50% tiền cọc</p>
          <p>• Hủy đặt phòng trong vòng 24 giờ: Không hoàn lại tiền cọc</p>
          <p>• Gia hạn lưu trú: Phụ thuộc vào tình trạng phòng trống</p>
        </CardContent>
      </Card>

      {/* Danh sách đặt phòng */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Phòng {booking.HangPhong || "Standard"}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Mã: {booking.MaDatPhong}</p>
                    </div>
                    {getStatusBadge(booking.TrangThai)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Nhận phòng</p>
                        <p className="font-medium">{formatDate(booking.NgayDen)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Trả phòng</p>
                        <p className="font-medium">{formatDate(booking.NgayDi)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tiền cọc</p>
                      <p className="font-bold text-primary">{booking.TienCoc?.toLocaleString()} VNĐ</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {canExtend(booking.TrangThai) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendClick(booking)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Gia hạn
                      </Button>
                    )}
                    {canCancel(booking.TrangThai) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Hủy đặt phòng
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Bạn chưa có đặt phòng nào</p>
                <Button className="mt-4" onClick={() => window.location.href = "/customer/booking"}>
                  Đặt phòng ngay
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Popup hủy đặt phòng */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đặt phòng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy? Tiền cọc sẽ được hoàn theo chính sách.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-2 text-sm">
              <p><strong>Mã:</strong> {selectedBooking.MaDatPhong}</p>
              <p><strong>Loại:</strong> {selectedBooking.HangPhong}</p>
              <p><strong>Ngày:</strong> {formatDate(selectedBooking.NgayDen)} - {formatDate(selectedBooking.NgayDi)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Đóng</Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={actionLoading}>
              {actionLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup gia hạn */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gia hạn lưu trú</DialogTitle>
            <DialogDescription>
              Chọn ngày trả phòng mới.
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><strong>Ngày trả phòng hiện tại:</strong> {formatDate(selectedBooking.NgayDi)}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-checkout">Ngày trả phòng mới</Label>
                <Input
                  id="new-checkout"
                  type="date"
                  value={newCheckOutDate}
                  onChange={(e) => setNewCheckOutDate(e.target.value)}
                  min={selectedBooking.NgayDi?.split('T')[0]}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmExtend} disabled={actionLoading}>
              {actionLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
