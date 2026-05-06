import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
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
import {
  Edit,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Loader2,
  Wrench,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  roomApi,
  roomTypeApi,
  settingApi,
  maintenanceApi,
  staffApi,
} from "@/api";
import { se } from "date-fns/locale";

// Room category definitions
// Initial room categories (fallback)
const initialRoomCategories = {
  Normal: {
    name: "Normal",
    description: "Phòng cơ bản, phù hợp nhu cầu ngắn ngày",
    price: 0,
  },
  Standard: {
    name: "Standard",
    description: "Phòng tiêu chuẩn với đầy đủ tiện nghi",
    price: 0,
  },
  Premium: {
    name: "Premium",
    description: "Phòng cao cấp với không gian rộng rãi",
    price: 0,
  },
  Luxury: {
    name: "Luxury",
    description: "Phòng sang trọng với dịch vụ cao cấp",
    price: 0,
  },
};

export default function Rooms() {
  const [roomCategories, setRoomCategories] = useState(initialRoomCategories);
  const [roomTypes, setRoomTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [techStaff, setTechStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const userRole = localStorage.getItem("role");
  const [formData, setFormData] = useState({
    MaPhong: "",
    LoaiPhong: "",
    GiaPhong: "",
    TrangThai: "Available",
  });
  const [maintenanceData, setMaintenanceData] = useState({
    MaPBT: "",
    NVKyThuat: "",
    NoiDung: "",
  });

  useEffect(() => {
    loadRooms();
    fetchSettings();
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const res = await staffApi.getStaff();
      setTechStaff(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error("Error loading staff:", err);
    }
  };

  const handleOpenMaintenance = async (room) => {
    setSelectedRoom(room);
    setMaintenanceData({
      MaPBT: "",
      NVKyThuat: "",
      NoiDung: "",
    });
    setIsMaintenanceOpen(true);
    try {
      const nextCode = await maintenanceApi.getNextMaPBTCode();
      setMaintenanceData((prev) => ({ ...prev, MaPBT: nextCode }));
    } catch (err) {
      console.error("Error fetching next MaPBT:", err);
    }
  };

  const handleSaveMaintenance = async () => {
    if (!maintenanceData.NVKyThuat || !maintenanceData.NoiDung) {
      toast({
        title: "Thông tin không đủ",
        description: "Vui lòng chọn nhân viên và nhập nội dung",
        variant: "destructive",
      });
      return;
    }
    try {
      await maintenanceApi.createMaintenanceRecord({
        ...maintenanceData,
        Phong: selectedRoom._id,
      });
      toast({
        title: "Đã tạo phiếu bảo trì",
        description: `Phòng ${selectedRoom.MaPhong} đang ở trạng thái Bảo trì`,
      });
      setIsMaintenanceOpen(false);
      loadRooms();
    } catch (err) {
      toast({ title: "Lỗi", description: err.message, variant: "destructive" });
    }
  };
  function Slider(images) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 3000); // 3s

      return () => clearInterval(timer);
    }, []);

    return (
      <div className="slider">
        <img src={images[index]} alt="slide" />
      </div>
    );
  }
  const fetchSettings = async () => {
    try {
      const res = await settingApi.getSettings();
      if (res && res.data && res.data.GiaPhongCoBan) {
        const prices = res.data.GiaPhongCoBan;
        setRoomCategories((prev) => ({
          ...prev,
          Normal: { ...prev.Normal, price: prices.Normal || prev.Normal.price },
          Standard: {
            ...prev.Standard,
            price: prices.Standard || prev.Standard.price,
          },
          Premium: {
            ...prev.Premium,
            price: prices.Premium || prev.Premium.price,
          },
          Luxury: { ...prev.Luxury, price: prices.Luxury || prev.Luxury.price },
        }));
      }
    } catch (err) {
      console.error("Could not load settings in Rooms:", err);
    }
  };

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const data = await roomApi.getRooms();
      setRooms(data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách phòng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewRoom = async () => {
    if (!formData.MaPhong || !formData.LoaiPhong || !formData.GiaPhong) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get or create room type
      let loaiPhongId = formData.LoaiPhong;

      // If LoaiPhong is a category name (not an ObjectId), find or create it
      if (formData.LoaiPhong.length < 24) {
        // It's a category name, not an ObjectId
        const categoryName = formData.LoaiPhong;
        const categoryInfo = roomCategories[categoryName];

        // Try to find existing room type with this name
        const existingRoomTypes = await roomTypeApi.getRoomTypes();
        let roomType = existingRoomTypes.find(
          (rt) => rt.TenLoaiPhong === categoryName
        );

        // If not found, create it
        if (!roomType) {
          const response = await roomTypeApi.createRoomType({
            TenLoaiPhong: categoryName,   // Khớp với body.TenLoaiPhong
            DonGia: parseFloat(categoryInfo.price), // Khớp với body.DonGia
            SoKhachToiDa: 2,
          });
          roomType = response.data || response;
        }

        loaiPhongId = roomType._id;
      }

      await roomApi.createRoom({
        MaPhong: formData.MaPhong,
        LoaiPhong: loaiPhongId,
        GiaPhong: parseFloat(formData.GiaPhong),
        TrangThai: formData.TrangThai,
      });
      toast({
        title: "Thành công",
        description: "Phòng mới đã được thêm thành công",
      });
      setFormData({
        MaPhong: "",
        LoaiPhong: "",
        GiaPhong: "",
        TrangThai: "Available",
      });
      setIsAddRoomOpen(false);
      loadRooms();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm phòng",
        variant: "destructive",
      });
    }
  };

  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    setIsViewDetailOpen(true);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    setFormData({
      MaPhong: room.MaPhong || "",
      LoaiPhong: room.LoaiPhong?._id || "",
      GiaPhong: room.GiaPhong || "",
      TrangThai: room.TrangThai || "Available",
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      let loaiPhongId = formData.LoaiPhong;

      // If LoaiPhong is a category name (not an ObjectId), find or create it
      if (formData.LoaiPhong.length < 24) {
        // It's a category name, not an ObjectId
        const categoryName = formData.LoaiPhong;

        // Try to find existing room type with this name
        const existingRoomTypes = await roomTypeApi.getRoomTypes();
        let roomType = existingRoomTypes.find(
          (rt) => rt.TenLoaiPhong === categoryName
        );

        // If not found, create it
        if (!roomType) {
          const response = await roomTypeApi.createRoomType({
            MaLoaiPhong: categoryName.toUpperCase(),
            TenLoaiPhong: categoryName,
          });
          roomType = response.data || response;
        }

        loaiPhongId = roomType._id;
      }

      await roomApi.updateRoom(selectedRoom._id, {
        MaPhong: formData.MaPhong,
        LoaiPhong: loaiPhongId,
        GiaPhong: parseFloat(formData.GiaPhong),
        TrangThai: formData.TrangThai,
      });
      toast({
        title: "Thành công",
        description: "Thông tin phòng đã được cập nhật",
      });
      setIsEditOpen(false);
      loadRooms();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật phòng",
        variant: "destructive",
      });
    }
  };

  const handleChangeStatus = (room) => {
    setSelectedRoom(room);
    setNewStatus(room.TrangThai);
    setIsChangeStatusOpen(true);
  };

  const handleSaveStatus = async () => {
    try {
      await roomApi.changeRoomStatus(selectedRoom._id, newStatus);
      toast({
        title: "Thành công",
        description: "Trạng thái phòng đã được cập nhật",
      });
      setIsChangeStatusOpen(false);
      loadRooms();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thay đổi trạng thái",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Available: {
        label: "Trống",
        className: "bg-success text-success-foreground",
      },
      Occupied: {
        label: "Đang sử dụng",
        className: "bg-primary text-primary-foreground",
      },
      Maintenance: {
        label: "Bảo trì",
        className: "bg-destructive text-destructive-foreground",
      },
      Reserved: {
        label: "Đã đặt",
        className: "bg-warning text-warning-foreground",
      },
    };
    const config = statusConfig[status] || {
      label: status,
      className: "bg-gray-500",
    };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.LoaiPhong?.TenLoaiPhong &&
      room.LoaiPhong.TenLoaiPhong.toLowerCase().includes(
        searchTerm.toLowerCase()
      );
    const matchesStatus =
      filterStatus === "all" || room.TrangThai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý phòng</h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và trạng thái các phòng
          </p>
        </div>
        {(userRole === "Admin" || userRole === "Manager") && (
          <Button onClick={() => setIsAddRoomOpen(true)}>Thêm phòng mới</Button>
        )}
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trống
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.TrangThai === "Available").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã đặt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.TrangThai === "Reserved").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang sử dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.TrangThai === "Occupied").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bảo trì
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms.filter((r) => r.TrangThai === "Maintenance").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc và tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo loại phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Available">Trống</SelectItem>
                <SelectItem value="Reserved">Đã đặt</SelectItem>
                <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                <SelectItem value="Maintenance">Bảo trì</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Danh sách phòng */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách phòng ({filteredRooms.length})</CardTitle>
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
                  <TableHead>Mã phòng</TableHead>
                  <TableHead>Loại phòng</TableHead>
                  <TableHead>Giá/đêm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room._id}>
                    <TableCell className="font-medium">
                      {room.MaPhong}
                    </TableCell>
                    <TableCell>
                      {room.LoaiPhong?.TenLoaiPhong || "N/A"}
                    </TableCell>
                    <TableCell>
                      {room.GiaPhong?.toLocaleString("vi-VN")} VNĐ
                    </TableCell>
                    <TableCell>{getStatusBadge(room.TrangThai)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetail(room)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => handleOpenMaintenance(room)}
                          >
                            <Wrench className="mr-2 h-4 w-4" />
                            Bảo trì
                          </DropdownMenuItem>

                          {(userRole === "Admin" || userRole === "Manager") && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleChangeStatus(room)}
                              >
                                Đổi trạng thái
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Popup thêm phòng */}
      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm phòng mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomNumber">Mã phòng</Label>
              <Input
                id="roomNumber"
                placeholder="Ví dụ: 301"
                value={formData.MaPhong}
                onChange={(e) =>
                  setFormData({ ...formData, MaPhong: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Hạng phòng</Label>
              <Select
                value={formData.LoaiPhong}
                onValueChange={(value) => {
                  const category = roomCategories[value];
                  setFormData({
                    ...formData,
                    LoaiPhong: value,
                    GiaPhong: category.price,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hạng phòng" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roomCategories).map(([key, category]) => (
                    <SelectItem key={key} value={key}>
                      {category.name} - {category.price.toLocaleString()} VNĐ
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.LoaiPhong && (
                <p className="text-sm text-muted-foreground">
                  {roomCategories[formData.LoaiPhong].description}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Giá/đêm (VNĐ)</Label>
              <Input
                id="price"
                type="number"
                placeholder="Tự động điền từ hạng phòng"
                value={formData.GiaPhong}
                readOnly
                className="bg-muted cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={formData.TrangThai}
                onValueChange={(value) =>
                  setFormData({ ...formData, TrangThai: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Trống</SelectItem>
                  <SelectItem value="Reserved">Đã đặt</SelectItem>
                  <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                  <SelectItem value="Maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveNewRoom}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup chi tiết phòng */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết phòng</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã phòng</Label>
                  <p className="text-lg font-semibold">
                    {selectedRoom.MaPhong}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Loại phòng</Label>
                  <p className="text-lg font-semibold">
                    {selectedRoom.LoaiPhong?.TenLoaiPhong ||
                      selectedRoom.LoaiPhong ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Giá/đêm</Label>
                  <p className="text-lg font-semibold">
                    {selectedRoom.GiaPhong?.toLocaleString("vi-VN") || "N/A"}{" "}
                    VNĐ
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRoom.TrangThai)}
                  </div>
                </div>
              </div>
              <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border shadow-sm">
                <Swiper
                  modules={[Autoplay]}
                  autoplay={{ delay: 1567, disableOnInteraction: false }}
                  loop
                  className="h-full w-full"
                >
                  {selectedRoom.img && selectedRoom.img.length > 0 ? (
                    selectedRoom.img.map((img, idx) => (
                      <SwiperSlide
                        key={idx}
                        className="flex items-center justify-center bg-muted"
                      >
                        <img
                          src={img}
                          alt={`Phòng ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <SwiperSlide className="flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">
                        Không có hình ảnh
                      </span>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup câp nhật phòng */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa phòng</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-roomNumber">Mã phòng</Label>
                <Input
                  id="edit-roomNumber"
                  value={formData.MaPhong}
                  onChange={(e) =>
                    setFormData({ ...formData, MaPhong: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Hạng phòng</Label>
                <Select
                  value={formData.LoaiPhong}
                  onValueChange={(value) => {
                    const category = roomCategories[value];
                    setFormData({
                      ...formData,
                      LoaiPhong: value,
                      GiaPhong: category.price,
                    });
                  }}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Chọn hạng phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roomCategories).map(([key, category]) => (
                      <SelectItem key={key} value={key}>
                        {category.name} - {category.price.toLocaleString()} VNĐ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.LoaiPhong && (
                  <p className="text-sm text-muted-foreground">
                    {roomCategories[formData.LoaiPhong].description}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Giá/đêm (VNĐ)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.GiaPhong}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={formData.TrangThai}
                  onValueChange={(value) =>
                    setFormData({ ...formData, TrangThai: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Trống</SelectItem>
                    <SelectItem value="Reserved">Đã đặt</SelectItem>
                    <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                    <SelectItem value="Maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup đổi trạng thái phòng */}
      <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Đổi trạng thái phòng</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Phòng</Label>
                <p className="text-lg font-semibold">{selectedRoom.MaPhong}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-status">Trạng thái mới</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="new-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Trống</SelectItem>
                    <SelectItem value="Reserved">Đã đặt</SelectItem>
                    <SelectItem value="Occupied">Đang sử dụng</SelectItem>
                    <SelectItem value="Maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChangeStatusOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveStatus}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Popup bảo trì phòng */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tạo phiếu bảo trì mới</DialogTitle>
          </DialogHeader>
          {selectedRoom && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Phòng</Label>
                <div className="col-span-3 font-semibold">
                  {selectedRoom.MaPhong}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maint-code" className="text-right">
                  Mã phiếu
                </Label>
                <Input
                  id="maint-code"
                  value={maintenanceData.MaPBT}
                  readOnly
                  className="col-span-3 bg-muted"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maint-staff" className="text-right">
                  Kỹ thuật
                </Label>
                <Select
                  value={maintenanceData.NVKyThuat}
                  onValueChange={(v) =>
                    setMaintenanceData({ ...maintenanceData, NVKyThuat: v })
                  }
                >
                  <SelectTrigger id="maint-staff" className="col-span-3">
                    <SelectValue placeholder="Chọn nhân viên" />
                  </SelectTrigger>
                  <SelectContent>
                    {techStaff.map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.HoTen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="maint-content" className="text-right">
                  Nội dung
                </Label>
                <Textarea
                  id="maint-content"
                  value={maintenanceData.NoiDung}
                  onChange={(e) =>
                    setMaintenanceData({
                      ...maintenanceData,
                      NoiDung: e.target.value,
                    })
                  }
                  className="col-span-3"
                  placeholder="Chi tiết sự cố..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMaintenanceOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveMaintenance}>Xác nhận bảo trì</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
