import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarDays, 
  ConciergeBell, 
  Loader2, 
  Hash, 
  Home, 
  Package, 
  ChevronDown, 
  ChevronRight,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Coffee,
  Utensils,
  Car,
  Waves,
  Zap,
  Search,
  Filter
} from "lucide-react";
import { datPhongApi, serviceUsageApi } from "@/api";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  Pending: { label: "Chờ xác nhận", variant: "outline", color: "bg-warning text-warning-foreground", icon: Clock },
  In_Progress: { label: "Đang xử lý", variant: "secondary", color: "bg-info text-info-foreground", icon: PlayCircle },
  Completed: { label: "Hoàn thành", variant: "default", color: "bg-success text-success-foreground", icon: CheckCircle2 },
  Cancelled: { label: "Đã hủy", variant: "destructive", color: "bg-destructive text-destructive-foreground", icon: XCircle },
};

const getServiceIcon = (name = "", code = "") => {
  const n = name.toLowerCase();
  const c = code.toLowerCase();
  if (n.includes("ăn") || n.includes("uống") || n.includes("food") || n.includes("meal")) return Utensils;
  if (n.includes("cafe") || n.includes("cà phê") || n.includes("nước")) return Coffee;
  if (n.includes("xe") || n.includes("car") || n.includes("transport")) return Car;
  if (n.includes("giặt") || n.includes("laundry")) return Zap;
  if (n.includes("pool") || n.includes("bơi") || n.includes("spa")) return Waves;
  return ConciergeBell;
};

export default function CustomerHistory() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceStatusFilter, setServiceStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.MaDatPhong?.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus = bookingStatusFilter === "all" || b.TrangThai === bookingStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  const filteredServiceRequests = useMemo(() => {
    return serviceRequests.filter(req => {
      const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || req.PhieuThuePhong?.MaPTP || "";
      const matchesSearch = bookingCode.toLowerCase().includes(serviceSearch.toLowerCase());
      const matchesStatus = serviceStatusFilter === "all" || req.TrangThai === serviceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [serviceRequests, serviceSearch, serviceStatusFilter]);

  const groupedServices = useMemo(() => {
    const groups = {};
    filteredServiceRequests.forEach(req => {
      const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || req.PhieuThuePhong?.MaPTP || "Yêu cầu ngoài";
      if (!groups[bookingCode]) {
        groups[bookingCode] = {
          bookingCode,
          requests: [],
          totalAmount: 0,
          roomCode: req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "N/A"
        };
      }
      groups[bookingCode].requests.push(req);
      groups[bookingCode].totalAmount += req.ThanhTien || 0;
    });
    return Object.values(groups);
  }, [filteredServiceRequests]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const [bookingsRes, usagesRes] = await Promise.all([
          datPhongApi.getBookings(),
          serviceUsageApi.getMyServiceUsages().catch(() => ({ data: [] }))
        ]);
        setBookings(bookingsRes.data || []);
        setServiceRequests(usagesRes.data || []);
      } catch (error) {
        console.error("Error fetching history:", error);
        toast({ title: "Lỗi", description: "Không thể tải lịch sử giao dịch.", variant: "destructive" });
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
      Completed: { label: "Hoàn thành", variant: "default" },
      In_Progress: { label: "Đang xử lý", variant: "secondary" },
    };
    const info = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const toggleGroup = (code) => {
    setExpandedGroups(prev => ({ ...prev, [code]: !prev[code] }));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử giao dịch</h1>
          <p className="text-muted-foreground">Theo dõi toàn bộ hoạt động đặt phòng và dịch vụ</p>
        </div>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="bookings" className="gap-2"><CalendarDays className="h-4 w-4" /> Đặt phòng</TabsTrigger>
          <TabsTrigger value="services" className="gap-2"><ConciergeBell className="h-4 w-4" /> Dịch vụ</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                placeholder="Tìm mã đơn đặt..." 
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="Confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="CheckedIn">Đang lưu trú</SelectItem>
                  <SelectItem value="CheckedOut">Đã trả phòng</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredBookings.length > 0 ? filteredBookings.map(booking => (
              <Card key={booking._id} className="overflow-hidden border-primary/10 hover:shadow-md transition-all">
                <div className="bg-primary/5 px-6 py-3 border-b flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mã đơn đặt:</span>
                    <span className="font-mono font-bold text-lg text-primary">#{booking.MaDatPhong}</span>
                  </div>
                  {getStatusBadge(booking.TrangThai)}
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4 md:border-r md:pr-6">
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Thông tin chung</p>
                        <p className="font-bold text-lg">{booking.HangPhongDisplayName || booking.HangPhong}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <CalendarDays className="h-3 w-3" />
                          <span>{formatDate(booking.NgayDen)} — {formatDate(booking.NgayDi)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Thanh toán cọc</p>
                        <p className="text-2xl font-black text-primary">{booking.TienCoc?.toLocaleString()} VNĐ</p>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Chi tiết phòng ({booking.ChiTietDatPhong?.length || 0})</p>
                      <div className="grid gap-2">
                        {booking.ChiTietDatPhong?.map((detail, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-dashed">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-background border flex items-center justify-center font-bold text-primary text-xs">{detail.Phong?.MaPhong || "??"}</div>
                              <p className="font-bold text-sm">Phòng {detail.Phong?.MaPhong || detail.Phong || "---"}</p>
                            </div>
                            <span className="font-bold text-sm">{detail.Phong?.GiaPhong?.toLocaleString()} đ</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : <div className="text-center py-20 text-muted-foreground"><CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-10" /><p>Không tìm thấy lịch sử đặt phòng phù hợp</p></div>}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                placeholder="Tìm mã đơn đặt..." 
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={serviceStatusFilter} onValueChange={setServiceStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="Pending">Chờ xử lý</SelectItem>
                  <SelectItem value="In_Progress">Đang xử lý</SelectItem>
                  <SelectItem value="Completed">Hoàn thành</SelectItem>
                  <SelectItem value="Cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {groupedServices.length > 0 ? groupedServices.map((group) => (
              <Card key={group.bookingCode} className="overflow-hidden border-orange-100 shadow-sm">
                <div 
                  className="bg-orange-50/50 px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => toggleGroup(group.bookingCode)}
                >
                  <div className="flex items-center gap-4">
                    {expandedGroups[group.bookingCode] ? <ChevronDown className="h-5 w-5 text-orange-600" /> : <ChevronRight className="h-5 w-5 text-orange-600" />}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-orange-600" />
                        <span className="font-bold text-lg text-orange-950">{group.bookingCode}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1"><Package className="h-3 w-3" /> {group.requests.length} yêu cầu</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-orange-600/70">Tổng phí dịch vụ</p>
                    <p className="text-xl font-black text-orange-700">{group.totalAmount.toLocaleString()} đ</p>
                  </div>
                </div>

                {expandedGroups[group.bookingCode] && (
                  <CardContent className="p-0 animate-in slide-in-from-top-2 duration-200">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead className="pl-6">Dịch vụ</TableHead>
                          <TableHead className="text-center">Phòng</TableHead>
                          <TableHead className="text-center">Số lượng</TableHead>
                          <TableHead className="text-right">Thành tiền</TableHead>
                          <TableHead className="text-center pr-6">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.requests.map((req) => {
                          const Config = statusConfig[req.TrangThai] || statusConfig.Pending;
                          const Icon = Config.icon;
                          const SrvIcon = getServiceIcon(req.DichVu?.TenDV, req.DichVu?.MaDV);
                          return (
                            <TableRow key={req._id}>
                              <TableCell className="pl-6">
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 bg-background border rounded-md"><SrvIcon className="h-4 w-4 text-muted-foreground" /></div>
                                  <div>
                                    <p className="font-bold text-sm">{req.DichVu?.TenDV}</p>
                                    <p className="text-[10px] text-muted-foreground">Mã: {req.MaSDDV}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-bold text-primary">
                                {req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "---"}
                              </TableCell>
                              <TableCell className="text-center font-medium">{req.SoLuong}</TableCell>
                              <TableCell className="text-right font-bold text-primary">{req.ThanhTien?.toLocaleString()} đ</TableCell>
                              <TableCell className="text-center pr-6">
                                <Badge variant="outline" className={`${Config.color} border-none text-[10px]`}>
                                  <Icon className="h-3 w-3 mr-1" /> {Config.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            )) : <div className="text-center py-20 text-muted-foreground"><ConciergeBell className="h-12 w-12 mx-auto mb-4 opacity-10" /><p>Không tìm thấy yêu cầu dịch vụ nào phù hợp</p></div>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

