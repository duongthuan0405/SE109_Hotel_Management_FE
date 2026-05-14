import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PlayCircle,
  Search,
  ChevronDown,
  ChevronRight,
  Hash,
  Home,
  User,
  Package
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import serviceUsageApi from "@/api/serviceUsageApi";

const statusConfig = {
  Pending: {
    label: "Chờ duyệt",
    color: "bg-warning text-warning-foreground",
    icon: Clock
  },
  In_Progress: {
    label: "Đang thực hiện",
    color: "bg-info text-info-foreground",
    icon: PlayCircle
  },
  Completed: {
    label: "Đã hoàn thành",
    color: "bg-success text-success-foreground",
    icon: CheckCircle2
  },
  Cancelled: {
    label: "Đã hủy",
    color: "bg-destructive text-destructive-foreground",
    icon: XCircle
  }
};

export default function ServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedBookings, setExpandedBookings] = useState({});

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await serviceUsageApi.getServiceUsages();
      setRequests(data.data || []);
      
      // Mặc định mở rộng tất cả các nhóm có yêu cầu "Pending"
      const pendingBookings = {};
      (data.data || []).forEach(req => {
        const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || "N/A";
        if (req.TrangThai === "Pending") {
          pendingBookings[bookingCode] = true;
        }
      });
      setExpandedBookings(pendingBookings);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách yêu cầu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus, maSDDV) => {
    try {
      await serviceUsageApi.updateServiceUsage(id, { TrangThai: newStatus });
      toast({
        title: "Thành công",
        description: `Yêu cầu ${maSDDV} đã chuyển sang ${statusConfig[newStatus].label}`,
      });
      loadRequests();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    }
  };

  const toggleBooking = (bookingCode) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingCode]: !prev[bookingCode]
    }));
  };

  const groupedRequests = useMemo(() => {
    const filtered = requests.filter(req => {
      const matchesStatus = filterStatus === "all" || req.TrangThai === filterStatus;
      const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || req.PhieuThuePhong?.MaPTP || "N/A";
      const roomCode = req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "";
      
      const matchesSearch = 
        bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.DichVu?.TenDV?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.MaSDDV.toLowerCase().includes(searchTerm.toLowerCase());
        
      return matchesStatus && matchesSearch;
    });

    const groups = {};
    filtered.forEach(req => {
      const bookingCode = req.PhieuThuePhong?.DatPhong?.MaDatPhong || req.PhieuThuePhong?.MaPTP || "N/A";
      if (!groups[bookingCode]) {
        groups[bookingCode] = {
          bookingCode,
          requests: [],
          totalAmount: 0,
          pendingCount: 0,
          roomCode: req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "N/A"
        };
      }
      groups[bookingCode].requests.push(req);
      groups[bookingCode].totalAmount += req.ThanhTien || 0;
      if (req.TrangThai === "Pending") groups[bookingCode].pendingCount++;
    });

    return Object.values(groups).sort((a, b) => b.pendingCount - a.pendingCount);
  }, [requests, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Duyệt yêu cầu dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý và phê duyệt các yêu cầu sử dụng dịch vụ theo mã đặt phòng</p>
        </div>
        <Button variant="outline" onClick={loadRequests} className="gap-2">
          <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      <Card className="bg-muted/30 border-none shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo Mã đặt phòng, Số phòng, Dịch vụ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-[200px] bg-background">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading && requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Đang tải danh sách yêu cầu...</p>
        </div>
      ) : groupedRequests.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Không tìm thấy yêu cầu nào phù hợp</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedRequests.map((group) => (
            <Card key={group.bookingCode} className={`overflow-hidden border-l-4 ${group.pendingCount > 0 ? 'border-l-warning' : 'border-l-primary'}`}>
              <CardHeader 
                className="cursor-pointer hover:bg-muted/30 transition-colors py-4"
                onClick={() => toggleBooking(group.bookingCode)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {expandedBookings[group.bookingCode] ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold text-lg">{group.bookingCode}</span>
                        {group.pendingCount > 0 && (
                          <Badge className="bg-warning text-warning-foreground ml-2 animate-pulse">
                            {group.pendingCount} yêu cầu mới
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Home className="h-3 w-3" /> Phòng: <span className="font-semibold text-foreground">{group.roomCode}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-3 w-3" /> Tổng: <span className="font-semibold text-foreground">{group.requests.length} hạng mục</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tổng tiền dịch vụ</p>
                    <p className="text-xl font-bold text-primary">{group.totalAmount.toLocaleString("vi-VN")} đ</p>
                  </div>
                </div>
              </CardHeader>
              
              {expandedBookings[group.bookingCode] && (
                <CardContent className="pt-0 border-t bg-muted/5">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-[120px]">Mã yêu cầu</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Dịch vụ</TableHead>
                        <TableHead className="text-center">Số lượng</TableHead>
                        <TableHead className="text-right">Thành tiền</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.requests.map((req) => {
                        const Config = statusConfig[req.TrangThai];
                        const Icon = Config.icon;
                        return (
                          <TableRow key={req._id} className="group">
                            <TableCell className="font-mono text-xs">{req.MaSDDV}</TableCell>
                            <TableCell className="font-bold text-primary">
                              {req.PhieuThuePhong?.Phong?.MaPhong || req.PhieuThuePhong?.Phong || "N/A"}
                            </TableCell>
                            <TableCell className="font-medium">{req.DichVu?.TenDV}</TableCell>
                            <TableCell className="text-center">{req.SoLuong}</TableCell>
                            <TableCell className="text-right font-bold">
                              {req.ThanhTien?.toLocaleString("vi-VN")} đ
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={`${Config.color} border-none`}>
                                <Icon className="h-3 w-3 mr-1" />
                                {Config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {req.TrangThai === "Pending" && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 text-success hover:text-success hover:bg-success/10"
                                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, "In_Progress", req.MaSDDV); }}
                                    >
                                      Duyệt
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, "Cancelled", req.MaSDDV); }}
                                    >
                                      Hủy
                                    </Button>
                                  </>
                                )}
                                {req.TrangThai === "In_Progress" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="h-8 border-success text-success hover:bg-success hover:text-white"
                                    onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req._id, "Completed", req.MaSDDV); }}
                                  >
                                    Hoàn thành
                                  </Button>
                                )}
                              </div>
                            </TableCell>
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
      )}
    </div>
  );
}
