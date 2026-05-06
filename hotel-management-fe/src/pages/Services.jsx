import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { serviceApi } from "@/api";

export default function Services() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    MaDV: "",
    TenDV: "",
    DonGia: ""
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const data = await serviceApi.getServices();
      setServices(data.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách dịch vụ",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!formData.MaDV || !formData.TenDV || !formData.DonGia) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      await serviceApi.createService({
        ...formData,
        DonGia: parseFloat(formData.DonGia)
      });
      toast({
        title: "Thành công",
        description: "Dịch vụ mới đã được thêm",
      });
      setFormData({ MaDV: "", TenDV: "", DonGia: "" });
      setIsAddOpen(false);
      loadServices();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm dịch vụ",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setFormData({
      MaDV: service.MaDV || "",
      TenDV: service.TenDV || "",
      DonGia: service.DonGia || ""
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await serviceApi.updateService(selectedService._id, {
        ...formData,
        DonGia: parseFloat(formData.DonGia)
      });
      toast({
        title: "Thành công",
        description: "Thông tin dịch vụ đã được cập nhật",
      });
      setIsEditOpen(false);
      loadServices();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật dịch vụ",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await serviceApi.deleteService(selectedService._id);
      toast({
        title: "Đã xóa",
        description: "Dịch vụ đã được xóa",
      });
      setIsDeleteOpen(false);
      loadServices();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa dịch vụ",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý dịch vụ</h1>
          <p className="text-muted-foreground">Quản lý các dịch vụ bổ sung của khách sạn</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm dịch vụ mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách dịch vụ ({services.length})</CardTitle>
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
                  <TableHead>Mã dịch vụ</TableHead>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell className="font-medium">{service.MaDV}</TableCell>
                    <TableCell className="font-medium">{service.TenDV}</TableCell>
                    <TableCell className="font-medium">{service.DonGia?.toLocaleString('vi-VN')} VNĐ</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(service)}>
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

      {/* Popup thêm dv */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm dịch vụ mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="maDV">Mã dịch vụ</Label>
              <Input 
                id="maDV" 
                placeholder="Ví dụ: DV001"
                value={formData.MaDV}
                onChange={(e) => setFormData({...formData, MaDV: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tenDV">Tên dịch vụ</Label>
              <Input 
                id="tenDV" 
                placeholder="Ví dụ: Giặt ủi"
                value={formData.TenDV}
                onChange={(e) => setFormData({...formData, TenDV: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="donGia">Đơn giá (VNĐ)</Label>
              <Input 
                id="donGia" 
                type="number" 
                placeholder="Ví dụ: 50000"
                value={formData.DonGia}
                onChange={(e) => setFormData({...formData, DonGia: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
            <Button onClick={handleAddService}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup cập nhật dv */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa dịch vụ</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-maDV">Mã dịch vụ</Label>
                <Input 
                  id="edit-maDV"
                  value={formData.MaDV}
                  onChange={(e) => setFormData({...formData, MaDV: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-tenDV">Tên dịch vụ</Label>
                <Input 
                  id="edit-tenDV"
                  value={formData.TenDV}
                  onChange={(e) => setFormData({...formData, TenDV: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-donGia">Đơn giá (VNĐ)</Label>
                <Input 
                  id="edit-donGia" 
                  type="number"
                  value={formData.DonGia}
                  onChange={(e) => setFormData({...formData, DonGia: e.target.value})}
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

      {/* Popup xóa dv */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xóa dịch vụ</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="py-4">
              <p>Bạn có chắc chắn muốn xóa dịch vụ <strong>{selectedService.TenDV}</strong>?</p>
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
