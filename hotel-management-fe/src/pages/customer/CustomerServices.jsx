import { useState, useEffect, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
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
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Hash,
  Package,
  Home,
  Search,
  Filter
} from "lucide-react";
import {
  serviceApi,
  datPhongApi,
  serviceUsageApi,
} from "@/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const serviceIcons = {
  "Dịch Vụ Phòng": Utensils,
  "DV01": Utensils,
  "Dịch Vụ Giặt Ủi": Shirt,
  "DV02": Shirt,
  "Dịch Vụ Spa": Sparkles,
  "DV03": Sparkles,
  "Đưa Đón Sân Bay": Plane,
  "Thuê Xe": Car,
  "Ăn uống": Utensils,
  "Giặt là": Shirt,
  "Massage": Sparkles,
};

const getServiceIcon = (name = "", code = "") => {
  if (serviceIcons[name]) return serviceIcons[name];
  if (serviceIcons[code]) return serviceIcons[code];
  
  const lowerName = name.toLowerCase();
  if (lowerName.includes("ăn") || lowerName.includes("uống") || lowerName.includes("food")) return Utensils;
  if (lowerName.includes("giặt") || lowerName.includes("ủi") || lowerName.includes("laundry")) return Shirt;
  if (lowerName.includes("spa") || lowerName.includes("massage")) return Sparkles;
  if (lowerName.includes("xe") || lowerName.includes("car")) return Car;
  if (lowerName.includes("bay") || lowerName.includes("plane")) return Plane;
  
  return Utensils;
};

export default function CustomerServices() {
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [description, setDescription] = useState("");
  const [selectedRentalSlipId, setSelectedRentalSlipId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [services, setServices] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  const [serviceSearch, setServiceSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  const filteredServices = useMemo(() => {
    return services.filter(s => s.TenDV.toLowerCase().includes(serviceSearch.toLowerCase()));
  }, [services, serviceSearch]);

  const filteredRequests = useMemo(() => {
    return myRequests.filter(req => {
      const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || req.PhieuThuePhong?.MaPTP || "";
      const matchesSearch = bookingCode.toLowerCase().includes(historySearch.toLowerCase());
      const matchesStatus = historyStatusFilter === "all" || req.TrangThai === historyStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myRequests, historySearch, historyStatusFilter]);

  const groupedRequests = useMemo(() => {
    if (!Array.isArray(filteredRequests)) return [];
    const groups = {};
    filteredRequests.forEach(req => {
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
  }, [filteredRequests]);

  const activeRentalSlips = useMemo(() => {
    const slips = [];
    activeBookings.forEach(booking => {
      // Vì mapToDTO trả về PhieuThuePhong (singular) hoặc ta có thể check rentalSlips nếu có
      if (booking.PhieuThuePhong) {
        slips.push({
          ...booking.PhieuThuePhong,
          MaDatPhong: booking.MaDatPhong,
          // Đảm bảo có MaPhong để hiển thị
          MaPhong: booking.PhieuThuePhong.MaPhong || booking.PhieuThuePhong.Phong?.MaPhong || "N/A"
        });
      }
      // Nếu có mảng PhieuThuePhongs (nếu ta đã sửa BE)
      if (booking.PhieuThuePhongs && Array.isArray(booking.PhieuThuePhongs)) {
        booking.PhieuThuePhongs.forEach(rs => {
          if (!slips.find(s => s._id === rs._id)) {
            slips.push({
              ...rs,
              MaDatPhong: booking.MaDatPhong
            });
          }
        });
      }
    });
    return slips;
  }, [activeBookings]);

  const toggleGroup = (code) => {
    setExpandedGroups(prev => ({ ...prev, [code]: !prev[code] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, bookingsRes, requestsRes] = await Promise.all([
          serviceApi.getServices(),
          datPhongApi.getBookings(),
          serviceUsageApi.getMyServiceUsages()
        ]);
        
        setServices(servicesRes.data || []);
        
        const bookings = bookingsRes.data || [];
        const active = bookings.filter(b => b.TrangThai === "CheckedIn");
        setActiveBookings(active);
        
        setMyRequests(requestsRes.data || []);
      } catch (error) {
        console.error("Error loading services data:", error);
        toast({ title: "Lỗi", description: "Không thể tải dữ liệu dịch vụ", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceClick = (service) => {
    if (activeBookings.length === 0) {
      toast({
        title: "Không thể đặt dịch vụ",
        description: "Bạn cần phải có phòng đang lưu trú (Checked-in) để sử dụng dịch vụ.",
        variant: "destructive"
      });
      return;
    }
    setSelectedService(service);
    setDescription("");
    setSelectedRentalSlipId(activeRentalSlips[0]?._id || "");
    setQuantity(1);
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!selectedRentalSlipId) return;
    try {
      setActionLoading(true);
      
      const payload = {
        PhieuThuePhong: selectedRentalSlipId,
        DichVu: selectedService._id,
        SoLuong: parseInt(quantity),
        GhiChu: description
      };

      await serviceUsageApi.customerOrderService(payload);
      toast({ title: "Thành công", description: "Yêu cầu dịch vụ của bạn đã được gửi đi." });
      setRequestDialogOpen(false);
      
      const updatedRequests = await serviceUsageApi.getMyServiceUsages();
      setMyRequests(updatedRequests.data || []);
    } catch (error) {
      toast({ title: "Thất bại", description: error.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Pending: { label: "Chờ xử lý", variant: "outline", icon: Clock },
      In_Progress: { label: "Đang xử lý", variant: "secondary", icon: Loader2 },
      Completed: { label: "Hoàn thành", variant: "default", icon: CheckCircle },
      Cancelled: { label: "Đã hủy", variant: "destructive", icon: AlertCircle },
    };
    const info = statusMap[status] || { label: status, variant: "outline", icon: Clock };
    const Icon = info.icon;
    return (
      <Badge variant={info.variant} className="gap-1.5 px-3 py-1 font-medium">
        <Icon className={`h-3.5 w-3.5 ${status === "In_Progress" ? "animate-spin" : ""}`} />
        {info.label}
      </Badge>
    );
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dịch vụ khách sạn</h1>
          <p className="text-muted-foreground">Tận hưởng các tiện ích đẳng cấp ngay tại phòng của bạn</p>
        </div>
        {activeBookings.length > 0 && (
          <Badge variant="secondary" className="px-4 py-1.5 text-sm">
            Phòng đang ở: {activeBookings.map(b => b.MaDatPhong).join(", ")}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="available">Dịch vụ hiện có</TabsTrigger>
          <TabsTrigger value="history">Yêu cầu của tôi</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-8 space-y-6">
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm tên dịch vụ..." 
              className="pl-9"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => {
                const Icon = getServiceIcon(service.TenDV, service.MaDV);
                return (
                  <Card key={service._id} className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                    <div className="h-3 bg-primary/20" />
                    <CardHeader className="space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{service.TenDV}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{service.MoTa || "Dịch vụ phòng 24/7 chuyên nghiệp"}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end border-t pt-4">
                        <span className="text-sm text-muted-foreground">Giá dịch vụ</span>
                        <span className="text-xl font-bold text-primary">{service.DonGia?.toLocaleString()} VNĐ</span>
                      </div>
                      <Button className="w-full py-6 text-base font-semibold shadow-md" onClick={() => handleServiceClick(service)}>
                        <Plus className="h-5 w-5 mr-2" /> Đặt dịch vụ
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-20 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                <p className="text-muted-foreground">Không tìm thấy dịch vụ nào phù hợp.</p>
                <Button variant="link" onClick={() => setServiceSearch("")}>Xóa tìm kiếm</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm mã đơn đặt phòng..." 
                className="pl-9"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={historyStatusFilter} onValueChange={setHistoryStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả trạng thái" />
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

          {groupedRequests.length > 0 ? (
            <div className="space-y-4">
              {groupedRequests.map((group) => (
                <Card key={group.bookingCode} className="overflow-hidden border-primary/10 shadow-sm">
                  <div 
                    className="bg-primary/5 px-6 py-4 border-b flex justify-between items-center cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => toggleGroup(group.bookingCode)}
                  >
                    <div className="flex items-center gap-4">
                      {expandedGroups[group.bookingCode] ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-primary" />}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-primary" />
                          <span className="font-bold text-lg">#{group.bookingCode}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Package className="h-3 w-3" /> {group.requests.length} yêu cầu</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Tổng phí dịch vụ</p>
                      <p className="text-xl font-black text-primary">{group.totalAmount.toLocaleString()} đ</p>
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
                            const serviceName = req.DichVu?.TenDV || "Dịch vụ";
                            const Icon = getServiceIcon(serviceName, req.DichVu?.MaDV);
                            return (
                              <TableRow key={req._id} className="hover:bg-accent/5 transition-colors">
                                <TableCell className="pl-6">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-background border rounded-md"><Icon className="h-4 w-4 text-muted-foreground" /></div>
                                    <div>
                                      <p className="font-bold">{serviceName}</p>
                                      <p className="text-[10px] text-muted-foreground">Mã: {req.MaSDDV}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-center font-bold text-primary">
                                  {req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "---"}
                                </TableCell>
                                <TableCell className="text-center font-medium">{req.SoLuong}</TableCell>
                                <TableCell className="text-right font-bold text-primary">{req.ThanhTien?.toLocaleString()} đ</TableCell>
                                <TableCell className="text-center pr-6">{getStatusBadge(req.TrangThai)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30 border-dashed py-16 text-center">
              <Utensils className="h-16 w-16 mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground text-lg">Bạn chưa có yêu cầu dịch vụ nào.</p>
              <Button variant="link" onClick={() => (window.location.href = "#")}>Xem các dịch vụ hiện có</Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Xác nhận yêu cầu</DialogTitle>
            <DialogDescription>Dịch vụ: <span className="font-bold text-foreground">{selectedService?.TenDV}</span></DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Chọn phòng của bạn</Label>
              <Select value={selectedRentalSlipId} onValueChange={setSelectedRentalSlipId}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Chọn phòng" />
                </SelectTrigger>
                <SelectContent>
                  {activeRentalSlips.map((slip) => (
                    <SelectItem key={slip._id} value={slip._id}>
                      Phòng {slip.MaPhong} — {slip.MaDatPhong}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Số lượng</Label>
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
                <span className="w-8 text-center text-xl font-bold">{quantity}</span>
                <Button variant="outline" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú thêm</Label>
              <Textarea 
                placeholder="Ví dụ: Mang lên lúc 8h sáng, ít đường..." 
                className="resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3} 
              />
            </div>
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex justify-between items-center font-bold text-xl">
                <span className="text-base font-medium">Tổng thanh toán:</span>
                <span className="text-primary">{(selectedService?.DonGia * quantity)?.toLocaleString()} VNĐ</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="flex-1 h-12" onClick={() => setRequestDialogOpen(false)}>Hủy bỏ</Button>
            <Button className="flex-1 h-12 shadow-lg shadow-primary/20" onClick={handleSubmitRequest} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Gửi yêu cầu ngay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
