import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { settingApi } from "@/api";

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    ThongTinKhachSan: {
      Ten: "",
      DiaChi: "",
      SDT: "",
      Email: "",
    },
    ThoiGian: {
      GioNhanPhong: "",
      GioTraPhong: "",
    },
    ThuePhi: {
      ThueVAT: 0,
      PhiDichVu: 0,
    },
    GiaPhongCoBan: {
      Normal: 0,
      Standard: 0,
      Premium: 0,
      Luxury: 0,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingApi.getSettings();
      if (res && res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải cài đặt",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, key, value) => {
    let newValue = value;
    
    // Auto-remove leading zeros and enforce numeric type for Prices and Taxes
    if (section === "GiaPhongCoBan" || section === "ThuePhi") {
      // Remove non-digits
      const numericValue = value.replace(/[^0-9]/g, "");
      // Convert to number to remove leading zeros, then string
      // default to 0 if empty
      newValue = numericValue ? Number(numericValue) : 0;
    }

    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: newValue,
      },
    }));
  };

  const handleSave = async (sectionName) => {
    try {
      setSaving(true);
      await settingApi.updateSettings(settings);
      toast({
        title: "Đã lưu",
        description: `Cài đặt ${sectionName} đã được lưu thành công`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu cài đặt",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt hệ thống và thông tin khách sạn
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Hotel Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin khách sạn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tên khách sạn</Label>
              <Input
                value={settings.ThongTinKhachSan?.Ten || ""}
                onChange={(e) =>
                  handleChange("ThongTinKhachSan", "Ten", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ</Label>
              <Input
                value={settings.ThongTinKhachSan?.DiaChi || ""}
                onChange={(e) =>
                  handleChange("ThongTinKhachSan", "DiaChi", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={settings.ThongTinKhachSan?.SDT || ""}
                onChange={(e) =>
                  handleChange("ThongTinKhachSan", "SDT", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={settings.ThongTinKhachSan?.Email || ""}
                onChange={(e) =>
                  handleChange("ThongTinKhachSan", "Email", e.target.value)
                }
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => handleSave("thông tin khách sạn")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>

        {/* Time Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài đặt thời gian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Giờ nhận phòng</Label>
              <Input
                type="time"
                value={settings.ThoiGian?.GioNhanPhong || ""}
                onChange={(e) =>
                  handleChange("ThoiGian", "GioNhanPhong", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Giờ trả phòng</Label>
              <Input
                type="time"
                value={settings.ThoiGian?.GioTraPhong || ""}
                onChange={(e) =>
                  handleChange("ThoiGian", "GioTraPhong", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Đơn vị tiền tệ</Label>
              <Input value="VNĐ" disabled />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => handleSave("thời gian")}
              disabled={saving}
            >
             {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>

        {/* Room Price Settings - Fixed labels to match system types */}
        <Card>
          <CardHeader>
            <CardTitle>Giá phòng cơ bản (VNĐ/đêm)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Normal (Phòng thường)</Label>
              <Input
                type="text"
                value={settings.GiaPhongCoBan?.Normal || 0}
                onChange={(e) =>
                  handleChange("GiaPhongCoBan", "Normal", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Standard (Tiêu chuẩn)</Label>
              <Input
                type="text"
                value={settings.GiaPhongCoBan?.Standard || 0}
                onChange={(e) =>
                  handleChange("GiaPhongCoBan", "Standard", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Premium (Cao cấp)</Label>
              <Input
                type="text"
                value={settings.GiaPhongCoBan?.Premium || 0}
                onChange={(e) =>
                  handleChange("GiaPhongCoBan", "Premium", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Luxury (Sang trọng)</Label>
              <Input
                type="text"
                value={settings.GiaPhongCoBan?.Luxury || 0}
                onChange={(e) =>
                  handleChange("GiaPhongCoBan", "Luxury", e.target.value)
                }
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => handleSave("giá phòng")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>

        {/* Tax and Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Thuế và phí</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Thuế VAT (%)</Label>
              <Input
                type="text"
                value={settings.ThuePhi?.ThueVAT || 0}
                onChange={(e) =>
                  handleChange("ThuePhi", "ThueVAT", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Phí dịch vụ (%)</Label>
              <Input
                type="text"
                value={settings.ThuePhi?.PhiDichVu || 0}
                onChange={(e) =>
                  handleChange("ThuePhi", "PhiDichVu", e.target.value)
                }
              />
            </div>
            <Button
              className="w-full gap-2"
              onClick={() => handleSave("thuế và phí")}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
