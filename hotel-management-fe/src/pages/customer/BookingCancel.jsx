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
import { Loader2, XCircle } from "lucide-react";
import { stripeApi } from "@/api";

export default function BookingCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cancelBooking = async () => {
      const bookingId = searchParams.get("booking_id");

      if (bookingId) {
        try {
          await stripeApi.cancelPendingBooking(bookingId);
        } catch (err) {
          console.error("Error canceling booking:", err);
        }
      }

      toast({
        title: "Thanh toán bị hủy",
        description: "Bạn đã hủy quá trình thanh toán.",
        variant: "destructive",
      });

      setLoading(false);
    };

    cancelBooking();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang xử lý...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-foreground">
          Thanh toán bị hủy
        </h1>
        <p className="text-muted-foreground">
          Bạn đã hủy quá trình thanh toán. Đặt phòng chưa được xác nhận.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bạn muốn làm gì tiếp theo?</CardTitle>
          <CardDescription>
            Bạn có thể thử đặt phòng lại hoặc quay về trang chủ.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate("/customer/booking")}>
            Đặt phòng lại
          </Button>
          <Button variant="outline" onClick={() => navigate("/customer")}>
            Về trang chủ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
