import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { User, Loader2, KeyRound } from "lucide-react";
import { customerApi, accountApi } from "@/api";

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Dùng phương thức getMyProfile đã được sửa đổi để lấy thông tin từ Token
        const profileRes = await customerApi.getMyProfile();
        const profile = profileRes.data || profileRes;

        if (profile) {
          localStorage.setItem("customerName", profile.HoTen);
          setFormData({
            name: profile.HoTen || "",
            email: profile.Email || "",
            phone: profile.SDT || "",
            idNumber: profile.CMND || "",
            address: profile.DiaChi || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({ title: "Lỗi", description: "Không thể tải thông tin cá nhân", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSavePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: "Lỗi", description: "Vui lòng điền đầy đủ thông tin mật khẩu", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Lỗi", description: "Mật khẩu xác nhận không khớp", variant: "destructive" });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Lỗi", description: "Mật khẩu mới phải có ít nhất 6 ký tự", variant: "destructive" });
      return;
    }
    
    try {
      setSavingPassword(true);
      await accountApi.changePassword("me", {
        MatKhauCu: passwordData.oldPassword,
        MatKhauMoi: passwordData.newPassword
      });
      toast({ title: "Thành công", description: "Đổi mật khẩu thành công" });
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast({ title: "Lỗi", description: error.message || "Không thể đổi mật khẩu", variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Dùng phương thức updateMyProfile để cập nhật dựa trên Token
      await customerApi.updateMyProfile({
        HoTen: formData.name,
        Email: formData.email,
        SDT: formData.phone,
        CMND: formData.idNumber,
        DiaChi: formData.address
      });
      
      localStorage.setItem("customerName", formData.name);
      toast({ title: "Thành công", description: "Đã cập nhật thông tin cá nhân" });
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin cá nhân</h1>
        <p className="text-muted-foreground">Quản lý và cập nhật thông tin hồ sơ của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Nhập họ và tên"
                value={formData.name} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="example@gmail.com"
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input 
                id="phone" 
                name="phone" 
                placeholder="Nhập số điện thoại"
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">CCCD/Hộ chiếu</Label>
              <Input 
                id="idNumber" 
                name="idNumber" 
                placeholder="Nhập số CMND/CCCD"
                value={formData.idNumber} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input 
              id="address" 
              name="address" 
              placeholder="Nhập địa chỉ thường trú"
              value={formData.address} 
              onChange={handleChange} 
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Lưu thay đổi
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Đổi mật khẩu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
              <Input 
                id="oldPassword" 
                name="oldPassword" 
                type="password"
                placeholder="Nhập mật khẩu hiện tại"
                value={passwordData.oldPassword} 
                onChange={handlePasswordChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input 
                id="newPassword" 
                name="newPassword" 
                type="password"
                placeholder="Nhập mật khẩu mới"
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password"
                placeholder="Nhập lại mật khẩu mới"
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSavePassword} disabled={savingPassword} size="lg" variant="secondary">
              {savingPassword && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Đổi mật khẩu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
