import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Calendar, X, Plus, AlertCircle, Loader2, CalendarDays, Bed, Wallet, Search, Filter } from "lucide-react";
import { datPhongApi } from "@/api";

export default function CustomerMyBookings() {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newCheckOutDate, setNewCheckOutDate] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await datPhongApi.getBookings();
        console.log("Bookings response:", res);
        setBookings(res.data || res || []);
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

  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = booking.MaDatPhong?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || booking.TrangThai === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

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
      toast({ title: "Thành công", description: "Đã hủy đặt phòng." });
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, TrangThai: 'Cancelled' } : b));
      setCancelDialogOpen(false);
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmExtend = async () => {
    if (!selectedBooking || !newCheckOutDate) return;
    try {
      setActionLoading(true);
      await datPhongApi.updateBooking(selectedBooking._id, { NgayDi: newCheckOutDate });
      toast({ title: "Thành công", description: "Đã gia hạn ngày trả phòng." });
      setBookings(prev => prev.map(b => b._id === selectedBooking._id ? { ...b, NgayDi: newCheckOutDate } : b));
      setExtendDialogOpen(false);
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Đặt phòng của tôi</h1>
          <p className="text-muted-foreground">Quản lý các phiên đặt phòng đang hoạt động</p>
        </div>
        <Button onClick={() => window.location.href = "/customer/booking"}>
          <Plus className="h-4 w-4 mr-2" /> Đặt phòng mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm theo mã đặt phòng..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="Pending">Chờ xác nhận</SelectItem>
              <SelectItem value="DepositPaid">Đã đặt cọc</SelectItem>
              <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
              <SelectItem value="CheckedIn">Đang lưu trú</SelectItem>
              <SelectItem value="CheckedOut">Đã trả phòng</SelectItem>
              <SelectItem value="Cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-orange-200 bg-orange-50/30">
        <CardContent className="pt-6 flex gap-4 items-start">
          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-800 space-y-1">
            <p className="font-bold">Lưu ý về chính sách:</p>
            <p>• Hủy trước 48h hoàn 100% cọc. Hủy trước 24h hoàn 50% cọc.</p>
            <p>• Việc gia hạn phụ thuộc vào tình trạng phòng trống tại thời điểm yêu cầu.</p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-6">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all">
                <div className="bg-primary/5 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mã phiên đặt:</span>
                    <span className="font-mono font-bold text-lg text-primary bg-background px-2 py-0.5 rounded border shadow-sm">
                      #{booking.MaDatPhong}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.TrangThai)}
                    <div className="flex gap-1">
                      {canExtend(booking.TrangThai) && (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => handleExtendClick(booking)}>Gia hạn</Button>
                      )}
                      {canCancel(booking.TrangThai) && (
                        <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10" onClick={() => handleCancelClick(booking)}>Hủy đơn</Button>
                      )}
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-3 gap-8">
                    {/* Thông tin thời gian */}
                    <div className="space-y-4 lg:border-r lg:pr-8">
                      <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Thông tin lưu trú</p>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg"><CalendarDays className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Thời gian</p>
                            <p className="font-bold text-sm">{formatDate(booking.NgayDen)} — {formatDate(booking.NgayDi)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg"><Bed className="h-5 w-5 text-primary" /></div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium">Hạng phòng</p>
                            <p className="font-bold text-sm">Hạng phòng: {booking.HangPhongDisplayName || booking.HangPhong || "Tiêu chuẩn"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground font-medium">Tiền cọc đã thanh toán</p>
                        <p className="text-2xl font-black text-primary flex items-center gap-2">
                          {booking.TienCoc?.toLocaleString()} <span className="text-sm font-bold">VNĐ</span>
                        </p>
                      </div>
                    </div>

                    {/* Danh sách phòng chi tiết */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                          Danh sách phòng chi tiết ({booking.ChiTietDatPhong?.length || 0})
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {booking.ChiTietDatPhong && booking.ChiTietDatPhong.length > 0 ? (
                          booking.ChiTietDatPhong.map((detail, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-accent/30 border border-dashed hover:bg-accent/50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div>
                                  <p className="font-bold text-sm">Phòng {detail.Phong?.MaPhong || detail.Phong || "---"}</p>
                                  <p className="text-[10px] text-muted-foreground">Mã chi tiết: {detail.MaCTDP}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-xs">{detail.Phong?.GiaPhong?.toLocaleString()} VNĐ</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 py-10 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                            <p className="text-sm text-muted-foreground italic">Chưa có phòng cụ thể. Lễ tân sẽ sớm sắp xếp cho bạn.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed py-20 text-center">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Bed className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xl font-bold">Bạn chưa có đơn đặt phòng nào</p>
                  <p className="text-muted-foreground">Hãy bắt đầu kỳ nghỉ của bạn ngay hôm nay!</p>
                </div>
                <Button size="lg" onClick={() => window.location.href = "/customer/booking"}>
                  Đặt phòng ngay
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Popups remain the same logic */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Xác nhận hủy đơn đặt</DialogTitle></DialogHeader>
          <DialogDescription>Bạn có chắc chắn muốn hủy phiên đặt #{selectedBooking?.MaDatPhong}? Hành động này không thể hoàn tác.</DialogDescription>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Quay lại</Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gia hạn thời gian lưu trú</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-primary/5 rounded-lg text-sm">
              Ngày trả phòng hiện tại: <strong>{formatDate(selectedBooking?.NgayDi)}</strong>
            </div>
            <div className="space-y-2">
              <Label>Chọn ngày trả phòng mới</Label>
              <Input type="date" value={newCheckOutDate} onChange={(e) => setNewCheckOutDate(e.target.value)} min={selectedBooking?.NgayDi?.split('T')[0]} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>Hủy bỏ</Button>
            <Button onClick={handleConfirmExtend} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Gửi yêu cầu gia hạn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
