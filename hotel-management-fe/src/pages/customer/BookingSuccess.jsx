import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { stripeApi } from "@/api";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get("session_id");
      const bookingId = searchParams.get("booking_id");

      if (!sessionId || !bookingId) {
        setError("Thiếu thông tin xác thực thanh toán");
        setLoading(false);
        return;
      }

      try {
        const bookingData = await stripeApi.verifyPayment(sessionId, bookingId);
        setBooking(bookingData);
        toast({
          title: "Thanh toán thành công!",
          description: "Đặt phòng của bạn đã được xác nhận.",
          className: "bg-green-100 text-green-900",
        });
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi xác thực thanh toán");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang xác thực thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Có lỗi xảy ra</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/customer/booking")}>
              Quay lại đặt phòng
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground">
          Đặt phòng thành công!
        </h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn đã đặt phòng. Tiền cọc đã được thanh toán.
        </p>
      </div>

      {booking && (
        <Card>
          <CardHeader>
            <CardTitle>Thông tin đặt phòng</CardTitle>
            <CardDescription>Mã đặt phòng: {booking.MaDatPhong}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Loại phòng</p>
                <p className="font-medium">{booking.HangPhong}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trạng thái</p>
                <p className="font-medium text-green-600">
                  {booking.TrangThai === "DepositPaid"
                    ? "Đã đặt cọc"
                    : booking.TrangThai}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày nhận phòng</p>
                <p className="font-medium">
                  {new Date(booking.NgayDen).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ngày trả phòng</p>
                <p className="font-medium">
                  {new Date(booking.NgayDi).toLocaleDateString("vi-VN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Số khách</p>
                <p className="font-medium">{booking.SoKhach} người</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiền cọc đã thanh toán</p>
                <p className="font-medium text-primary">
                  {booking.TienCoc?.toLocaleString()} VNĐ
                </p>
              </div>
            </div>

            {booking.ChiTietDatPhong && booking.ChiTietDatPhong.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Phòng được gán</p>
                <div className="flex gap-2">
                  {booking.ChiTietDatPhong.map((ct, idx) => {
                    const phong = ct.Phong;
                    const roomNumber = typeof phong === 'object' 
                      ? (phong?.SoPhong || phong?.MaPhong || 'N/A')
                      : phong;
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        Phòng {roomNumber}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={() => navigate("/customer/my-bookings")}>
          Xem đặt phòng của tôi
        </Button>
        <Button onClick={() => navigate("/customer")}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
