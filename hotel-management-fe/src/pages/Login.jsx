import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Hotel, Eye, EyeOff, Loader2 } from "lucide-react";
import { authApi } from "@/api";

export default function Login() {
  const navigate = useNavigate();
  const [TenDangNhap, setTenDangNhap] = useState("");
  const [MatKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!TenDangNhap.trim() || !MatKhau.trim()) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        description: "Tên đăng nhập và mật khẩu không được để trống",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.login(TenDangNhap, MatKhau);

      // Lưu auth
      localStorage.setItem("token", result.token);
      localStorage.setItem("role", result.VaiTro);
      localStorage.setItem("username", TenDangNhap);

      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberUsername", TenDangNhap);
      } else {
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberUsername");
      }

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${result.VaiTro}!`,
      });

      if (
        result.VaiTro === "Admin" ||
        result.VaiTro === "Manager" ||
        result.VaiTro === "Receptionist"
      ) {
        navigate("/dashboard", { replace: true });
      } else if (result.VaiTro === "MaintenanceStaff") {
        navigate("/maintenance", { replace: true });
      } else if (result.VaiTro === "Customer") {
        navigate("/customer", { replace: true });
      }
    } catch (error) {
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Tên đăng nhập hoặc mật khẩu sai",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [resetOTP, setResetOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.forgotPassword(resetEmail);
      toast({
        title: "Mã OTP đã được gửi",
        description: "Vui lòng kiểm tra email để lấy mã xác thực (Nếu trong môi trường dev, kiểm tra console log ở backend)",
      });
      setResetStep(2);
    } catch (error) {
      toast({
        title: "Gửi yêu cầu thất bại",
        description: error.message || "Đã có lỗi xảy ra",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetOTP || !newPassword || !confirmNewPassword) {
      toast({
        title: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Mật khẩu không khớp",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPasswordWithOTP(resetEmail, resetOTP, newPassword);
      toast({
        title: "Thành công",
        description: "Mật khẩu của bạn đã được thay đổi",
      });
      setIsForgotPasswordOpen(false);
      // Reset states
      setResetStep(1);
      setResetEmail("");
      setResetOTP("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      toast({
        title: "Đặt lại mật khẩu thất bại",
        description: error.message || "Mã OTP không đúng hoặc đã hết hạn",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Hotel className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">
              Đăng nhập hệ thống
            </CardTitle>
            <CardDescription className="mt-2">
              Quản lý khách sạn - Hệ thống tích hợp
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                placeholder="Nhập tên đăng nhập"
                value={TenDangNhap}
                onChange={(e) => setTenDangNhap(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={MatKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <Button
                variant="link"
                className="px-0 text-sm"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Quên mật khẩu?
              </Button>
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>

          <div className="border-t pt-4 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Bạn chưa có tài khoản?
            </p>

            <Link to="/customer/register">
              <Button variant="outline" className="w-full">
                Đăng ký tài khoản khách hàng
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Liên hệ quản trị viên để tạo tài khoản
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={isForgotPasswordOpen}
        onOpenChange={(open) => {
          setIsForgotPasswordOpen(open);
          if (!open) {
            setResetStep(1);
            setResetEmail("");
            setResetOTP("");
            setNewPassword("");
            setConfirmNewPassword("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quên mật khẩu</DialogTitle>
            <DialogDescription>
              {resetStep === 1
                ? "Nhập email của bạn để nhận mã OTP đặt lại mật khẩu"
                : "Nhập mã OTP đã nhận được và mật khẩu mới của bạn"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {resetStep === 1 ? (
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="example@hotel.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-otp">Mã xác thực (OTP)</Label>
                  <Input
                    id="reset-otp"
                    placeholder="Nhập 6 số"
                    value={resetOTP}
                    onChange={(e) => setResetOTP(e.target.value)}
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Mật khẩu mới</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    placeholder="Xác nhận lại mật khẩu"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsForgotPasswordOpen(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            {resetStep === 1 ? (
              <Button onClick={handleForgotPassword} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </Button>
            ) : (
              <Button onClick={handleResetPassword} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
