import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Eye, Edit, Trash2, Phone, Mail, Loader2 } from "lucide-react";
import { customerApi } from "@/api";

export default function Guests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewDetailOpen, setIsViewDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [guests, setGuests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    MaKH: "",
    HoTen: "",
    CMND: "",
    SDT: "",
    Email: ""
  });

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    setIsLoading(true);
    try {
      const data = await customerApi.getCustomers();
      setGuests(data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách khách hàng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGuest = async () => {
    if (!formData.MaKH || !formData.HoTen || !formData.CMND || !formData.SDT || !formData.Email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      await customerApi.createCustomer(formData);
      toast({
        title: "Thành công",
        description: "Khách hàng mới đã được thêm",
      });
      setFormData({ MaKH: "", HoTen: "", CMND: "", SDT: "", Email: "" });
      setIsAddOpen(false);
      loadGuests();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm khách hàng",
        variant: "destructive",
      });
    }
  };

  const handleViewDetail = (guest) => {
    setSelectedGuest(guest);
    setIsViewDetailOpen(true);
  };

  const handleEdit = (guest) => {
    setSelectedGuest(guest);
    setFormData({
      MaKH: guest.MaKH || "",
      HoTen: guest.HoTen || "",
      CMND: guest.CMND || "",
      SDT: guest.SDT || "",
      Email: guest.Email || ""
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await customerApi.updateCustomer(selectedGuest._id, formData);
      toast({
        title: "Thành công",
        description: "Thông tin khách hàng đã được cập nhật",
      });
      setIsEditOpen(false);
      loadGuests();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật khách hàng",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (guest) => {
    setSelectedGuest(guest);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await customerApi.deleteCustomer(selectedGuest._id);
      toast({
        title: "Đã xóa",
        description: "Khách hàng đã được xóa khỏi hệ thống",
      });
      setIsDeleteOpen(false);
      loadGuests();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa khách hàng",
        variant: "destructive",
      });
    }
  };

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch = 
      (guest.HoTen && guest.HoTen.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.SDT && guest.SDT.includes(searchTerm)) ||
      (guest.Email && guest.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.CMND && guest.CMND.includes(searchTerm));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý khách hàng</h1>
          <p className="text-muted-foreground">Quản lý thông tin khách hàng và lịch sử đặt phòng</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm khách hàng mới
        </Button>
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng khách hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{guests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đã đăng ký
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guests.filter(g => g.TaiKhoan).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {guests.filter(g => !g.TaiKhoan).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tìm kiếm */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại, email, CMND..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bảng kh */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng ({filteredGuests.length})</CardTitle>
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
                  <TableHead>Mã KH</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>CMND/Passport</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.map((guest) => (
                  <TableRow key={guest._id}>
                    <TableCell className="font-medium">{guest.MaKH}</TableCell>
                    <TableCell className="font-medium">{guest.HoTen}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {guest.SDT}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{guest.CMND}</TableCell>
                    <TableCell>{guest.Email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewDetail(guest)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(guest)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(guest)}>
                          <Trash2 className="h-4 w-4" />
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

      {/* PopUp thêm kh */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm khách hàng mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="makh">Mã khách hàng</Label>
              <Input 
                id="makh" 
                placeholder="Nhập mã KH"
                value={formData.MaKH}
                onChange={(e) => setFormData({...formData, MaKH: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hoten">Họ và tên</Label>
              <Input 
                id="hoten" 
                placeholder="Nhập họ tên đầy đủ"
                value={formData.HoTen}
                onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sdt">Số điện thoại</Label>
              <Input 
                id="sdt" 
                placeholder="Ví dụ: 0901234567"
                value={formData.SDT}
                onChange={(e) => setFormData({...formData, SDT: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="example@email.com"
                value={formData.Email}
                onChange={(e) => setFormData({...formData, Email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cmnd">CMND/CCCD</Label>
              <Input 
                id="cmnd" 
                placeholder="Số chứng minh thư"
                value={formData.CMND}
                onChange={(e) => setFormData({...formData, CMND: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button onClick={handleAddGuest}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PopUp chi tiết kh */}
      <Dialog open={isViewDetailOpen} onOpenChange={setIsViewDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã khách hàng</Label>
                  <p className="text-lg font-semibold">{selectedGuest.MaKH}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Họ và tên</Label>
                  <p className="text-lg font-semibold">{selectedGuest.HoTen}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số điện thoại</Label>
                  <p className="text-lg font-semibold">{selectedGuest.SDT}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-lg font-semibold">{selectedGuest.Email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CMND/CCCD</Label>
                  <p className="text-lg font-semibold">{selectedGuest.CMND}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p className="text-lg font-semibold">
                    {new Date(selectedGuest.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDetailOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PopUp xóa kh */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-hoten">Họ và tên</Label>
                <Input 
                  id="edit-hoten" 
                  value={formData.HoTen}
                  onChange={(e) => setFormData({...formData, HoTen: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-sdt">Số điện thoại</Label>
                <Input 
                  id="edit-sdt"
                  value={formData.SDT}
                  onChange={(e) => setFormData({...formData, SDT: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({...formData, Email: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-cmnd">CMND/CCCD</Label>
                <Input 
                  id="edit-cmnd"
                  value={formData.CMND}
                  onChange={(e) => setFormData({...formData, CMND: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Hủy</Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PopUp xóa kh */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xóa khách hàng</DialogTitle>
          </DialogHeader>
          {selectedGuest && (
            <div className="py-4">
              <p>Bạn có chắc chắn muốn xóa khách hàng <strong>{selectedGuest.name}</strong>?</p>
              <p className="text-sm text-muted-foreground mt-2">Hành động này không thể hoàn tác.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Xác nhận xóa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
