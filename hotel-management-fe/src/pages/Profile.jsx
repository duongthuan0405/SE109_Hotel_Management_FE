import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { User, Mail, Phone, Shield, Edit, KeyRound, Loader2 } from "lucide-react";
import { accountApi } from "@/api";
export default function Profile() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  // Mock dữ liệu người dùng
  const [userInfo, setUserInfo] = useState({
    fullName: "Nguyễn Văn A",
    role: "Quản lý",
    email: "admin@hotel.com",
    phone: "0909 123 456",
    username: "admin",
  });

  const [editForm, setEditForm] = useState({ ...userInfo });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveEdit = () => {
    setUserInfo({ ...editForm });
    toast({
      title: "Cập nhật thành công",
      description: "Thông tin tài khoản đã được cập nhật",
    });
    setIsEditOpen(false);
  };

  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin mật khẩu",
        variant: "destructive",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSavingPassword(true);
      await accountApi.changePassword("me", {
        MatKhauCu: passwordForm.oldPassword,
        MatKhauMoi: passwordForm.newPassword
      });
      toast({
        title: "Thành công",
        description: "Đổi mật khẩu thành công",
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể đổi mật khẩu",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin tài khoản</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý thông tin cá nhân và cài đặt bảo mật
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription>Thông tin chi tiết về tài khoản của bạn</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setEditForm({ ...userInfo });
                setIsEditOpen(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Họ và tên</p>
                    <p className="font-medium">{userInfo.fullName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{userInfo.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{userInfo.phone}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Vai trò</p>
                    <p className="font-medium">{userInfo.role}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-muted-foreground">Tên đăng nhập</p>
                    <p className="font-medium">{userInfo.username}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Quản lý mật khẩu và cài đặt bảo mật</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="old-password">Mật khẩu cũ</Label>
                <Input
                  id="old-password"
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Mật khẩu mới</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleChangePassword} disabled={savingPassword} size="lg" variant="secondary">
                {savingPassword && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Đổi mật khẩu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PopUp chỉnh sửa thông tin */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân của bạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-fullName">Họ và tên</Label>
              <Input
                id="edit-fullName"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Vai trò</Label>
              <Input
                id="edit-role"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
