import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { User, Loader2 } from "lucide-react";
import { customerApi } from "@/api";

// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export default function CustomerProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    idNumber: "",
    address: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const decoded = parseJwt(token);
        if (!decoded?.id) return;

        const customers = await customerApi.getCustomers();
        const found = customers.find(c => {
          if (!c.TaiKhoan) return false;
          const taiKhoanId = typeof c.TaiKhoan === 'object' ? c.TaiKhoan._id : c.TaiKhoan;
          return taiKhoanId === decoded.id;
        });

        if (found) {
          setCustomer(found);
          localStorage.setItem("customerName", found.HoTen);
          setFormData({
            name: found.HoTen || "",
            email: found.Email || "",
            phone: found.SDT || "",
            idNumber: found.CMND || "",
            address: found.DiaChi || "",
          });
        } else {
          toast({ title: "Thông báo", description: "Không tìm thấy hồ sơ cá nhân cho tài khoản này", variant: "destructive" });
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

  const handleSave = async () => {
    if (!customer) return;

    try {
      setSaving(true);
      await customerApi.updateCustomer(customer._id, {
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

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thông tin cá nhân</h1>
        <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">CCCD/Hộ chiếu</Label>
              <Input id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input id="address" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="animate-spin mr-2" />} Lưu thay đổi
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
