import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import staffApi from "@/api/staffApi";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Staff() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form state for adding
  const [addForm, setAddForm] = useState({
    name: "",
    phone: "",
    status: "active",
  });

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    status: "active",
  });

  // Fetch staff on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getStaff();
      // Handle both array and object responses
      const staffList = Array.isArray(data) ? data : data.data || [];
      setStaff(staffList);
    } catch (err) {
      console.error(err);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách nhân viên",
        variant: "destructive",
      });
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      if (!addForm.name || !addForm.phone) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        });
        return;
      }

      await staffApi.createStaff({
        tenNhanVien: addForm.name,
        soDienThoai: addForm.phone,
        trangThai: addForm.status === "active" ? 1 : 0,
      });

      toast({
        title: "Thành công",
        description: "Nhân viên mới đã được thêm",
      });

      setAddForm({ name: "", phone: "", status: "active" });
      setIsAddOpen(false);
      fetchStaff();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể thêm nhân viên",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setEditForm({
      name: staff.tenNhanVien || "",
      phone: staff.soDienThoai || "",
      status: staff.trangThai === 1 ? "active" : "inactive",
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editForm.name || !editForm.phone) {
        toast({
          title: "Lỗi",
          description: "Vui lòng điền đầy đủ thông tin",
          variant: "destructive",
        });
        return;
      }

      await staffApi.updateStaff(selectedStaff.id, {
        tenNhanVien: editForm.name,
        soDienThoai: editForm.phone,
        trangThai: editForm.status === "active" ? 1 : 0,
      });

      toast({
        title: "Thành công",
        description: "Thông tin nhân viên đã được cập nhật",
      });
      setIsEditOpen(false);
      fetchStaff();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể cập nhật nhân viên",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (staff) => {
    setSelectedStaff(staff);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await staffApi.deleteStaff(selectedStaff.id);
      toast({
        title: "Đã xóa",
        description: "Nhân viên đã được xóa khỏi hệ thống",
      });
      setIsDeleteOpen(false);
      fetchStaff();
    } catch (err) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xóa nhân viên",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: "Quản trị viên", variant: "default" },
      manager: { label: "Quản lý", variant: "default" },
      front_desk: { label: "Lễ tân", variant: "secondary" },
      housekeeping: { label: "Buồng phòng", variant: "outline" },
      technician: { label: "Kỹ thuật", variant: "outline" },
    };
    return (
      <Badge variant={roleConfig[role].variant}>{roleConfig[role].label}</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý nhân viên
          </h1>
          <p className="text-muted-foreground">
            Quản lý thông tin và phân quyền nhân viên
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Thêm nhân viên
        </Button>
      </div>

      {/* Các thẻ */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng nhân viên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {staff.filter((s) => s.trangThai === 1).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bảng nv */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((staffMember) => (
                <TableRow key={staffMember._id}>
                  <TableCell className="font-medium">
                    {staffMember.MaNV}
                  </TableCell>
                  <TableCell className="font-medium">
                    {staffMember.HoTen}
                  </TableCell>
                  <TableCell>{staffMember.SDT}</TableCell>
                  <TableCell>
                    <Badge variant="default">Đang làm việc</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(staffMember)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(staffMember)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PopUp thêm nv */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm nhân viên mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staffName">Họ và tên</Label>
              <Input
                id="staffName"
                placeholder="Nhập họ tên đầy đủ"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2"></div>
            <div className="grid gap-2">
              <Label htmlFor="staffPhone">Số điện thoại</Label>
              <Input
                id="staffPhone"
                placeholder="Ví dụ: 0901234567"
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm({ ...addForm, phone: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={addForm.status}
                onValueChange={(value) =>
                  setAddForm({ ...addForm, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Đang làm việc</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddStaff}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PopUp cập nhật nv */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-staffName">Họ và tên</Label>
                <Input
                  id="edit-staffName"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2"></div>
              <div className="grid gap-2">
                <Label htmlFor="edit-staffPhone">Số điện thoại</Label>
                <Input
                  id="edit-staffPhone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Trạng thái</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang làm việc</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
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

      {/* PopUp xóa nv */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Xóa nhân viên</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="py-4">
              <p>
                Bạn có chắc chắn muốn xóa nhân viên{" "}
                <strong>{selectedStaff.name}</strong>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
