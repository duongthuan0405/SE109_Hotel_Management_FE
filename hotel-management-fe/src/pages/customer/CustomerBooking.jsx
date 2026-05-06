import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { roomApi, datPhongApi, customerApi, settingApi, stripeApi } from "@/api";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
// Helper to decode JWT
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

const initialRoomTypeInfo = {
  Normal: {
    price: 0,
    description: "Phòng cơ bản, phù hợp nhu cầu ngắn ngày",
    backendEnum: "Normal",
    searchKeywords: ["normal", "cơ bản", "đơn", "phòng đơn"],
  },
  Standard: {
    price: 0,
    description: "Phòng tiêu chuẩn với đầy đủ tiện nghi",
    backendEnum: "Standard",
    searchKeywords: ["standard", "std", "tiêu chuẩn"],
  },
  Premium: {
    price: 0,
    description: "Phòng cao cấp với không gian rộng rãi",
    backendEnum: "Premium",
    searchKeywords: ["premium", "cao cấp", "đôi", "phòng đôi"],
  },
  Luxury: {
    price: 0,
    description: "Phòng sang trọng với dịch vụ cao cấp",
    backendEnum: "Luxury",
    searchKeywords: ["luxury", "vip", "sang trọng"],
  },
};

export default function CustomerBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedRoomType, setSelectedRoomType] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState("2");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [rooms, setRooms] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [roomTypeInfo, setRoomTypeInfo] = useState(initialRoomTypeInfo);
  const images = [
    "https://cf.bstatic.com/xdata/images/hotel/max1024x768/163589466.jpg?k=f6595e4f13c2a5f394598a838f3d92191e96af6098975642694351457f9669d4&o=",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB8ZYR72k8mzPijKS_-zvr7CWqkOwMlHmEaQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJtm1ldS2O3BnVzHowHZH4fBPUGhk_RTxSdQ&s",
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 0. Fetch Settings for dynamic prices
        try {
          const settingsRes = await settingApi.getSettings();
          if (settingsRes?.data?.GiaPhongCoBan) {
            const prices = settingsRes.data.GiaPhongCoBan;
            setRoomTypeInfo((prev) => ({
              ...prev,
              Normal: {
                ...prev.Normal,
                price: prices.Normal || prev.Normal.price,
              },
              Standard: {
                ...prev.Standard,
                price: prices.Standard || prev.Standard.price,
              },
              Premium: {
                ...prev.Premium,
                price: prices.Premium || prev.Premium.price,
              },
              Luxury: {
                ...prev.Luxury,
                price: prices.Luxury || prev.Luxury.price,
              },
            }));
          }
        } catch (settingsErr) {
          console.warn(
            "Could not fetch settings for room prices, using defaults",
            settingsErr
          );
        }

        // 1. Fetch Rooms
        const roomsData = await roomApi.getRooms();
        setRooms(roomsData || []);

        // 2. Fetch All Bookings (for availability check)
        const bookingsRes = await datPhongApi.getBookings();
        setAllBookings(bookingsRes.data || bookingsRes || []);

        // 3. Identify Current Customer
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = parseJwt(token);
          if (decoded && decoded.id) {
            const customers = await customerApi.getCustomers();
            const foundReq = customers.find((c) => {
              if (!c.TaiKhoan) return false;
              const taiKhoanId =
                typeof c.TaiKhoan === "object" ? c.TaiKhoan._id : c.TaiKhoan;
              return taiKhoanId === decoded.id;
            });
            if (foundReq) {
              setCurrentCustomer(foundReq);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing booking page:", error);
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter Logic
  const getAvailableRooms = () => {
    // 1. Filter by Status (Static)
    // Rooms must be 'Available' (not Reserved, Occupied, or Maintenance)
    let candidates = rooms.filter(
      (r) => r.status === "available" || r.TrangThai === "Available"
    );

    // 2. Filter by Type (Strict match first, then keywords)
    if (selectedRoomType) {
      candidates = candidates.filter((r) => {
        const roomTypeName =
          r.LoaiPhong?.TenLoaiPhong || r.LoaiPhong || r.type || "";

        // Strict match against category name
        if (roomTypeName === selectedRoomType) return true;

        // Fallback to keywords
        const typeConfig = roomTypeInfo[selectedRoomType];
        const keywords = typeConfig
          ? typeConfig.searchKeywords
          : [selectedRoomType.toLowerCase()];
        return keywords.some((k) =>
          roomTypeName.toLowerCase().includes(k.toLowerCase())
        );
      });
    }

    // 3. Filter by Date Overlap (If dates selected)
    if (checkInDate && checkOutDate) {
      const requestedStart = new Date(checkInDate);
      const requestedEnd = new Date(checkOutDate);

      // Find rooms that are busy
      const busyRoomIds = new Set();

      allBookings.forEach((b) => {
        // Only care about active bookings
        if (
          [
            "Cancelled",
            "NoShow",
            "CheckedOut",
            "Completed",
            "Pending",
          ].includes(b.TrangThai)
        )
          return;

        const bookingStart = new Date(b.NgayDen);
        const bookingEnd = new Date(b.NgayDi);

        // Check overlap: (StartA < EndB) && (EndA > StartB)
        // Using strict comparison for days
        if (requestedStart < bookingEnd && requestedEnd > bookingStart) {
          // This booking overlaps. Mark its rooms as busy.
          if (b.ChiTietDatPhong && Array.isArray(b.ChiTietDatPhong)) {
            b.ChiTietDatPhong.forEach((detail) => {
              const roomId =
                typeof detail.Phong === "object"
                  ? detail.Phong._id
                  : detail.Phong;
              if (roomId) busyRoomIds.add(roomId);
            });
          }
        }
      });

      candidates = candidates.filter((r) => !busyRoomIds.has(r._id));
    }

    return candidates;
  };

  const availableRooms = getAvailableRooms();

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const nights = calculateNights();
  const roomInfo = roomTypeInfo[selectedRoomType];
  const totalAmount = roomInfo ? roomInfo.price * nights : 0;
  const depositAmount = Math.round(totalAmount * 0.3);

  const validateStep1 = () => {
    if (!selectedRoomType) {
      toast({ title: "Vui lòng chọn loại phòng", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!checkInDate || !checkOutDate) {
      toast({ title: "Vui lòng chọn ngày", variant: "destructive" });
      return false;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      toast({
        title: "Ngày nhận phòng không hợp lệ",
        description: "Không thể chọn ngày trong quá khứ",
        variant: "destructive",
      });
      return false;
    }

    if (end <= start) {
      toast({
        title: "Ngày trả phòng không hợp lệ",
        description: "Phải sau ngày nhận phòng",
        variant: "destructive",
      });
      return false;
    }

    if (availableRooms.length === 0) {
      toast({
        title: "Hết phòng",
        description: `Không còn phòng ${selectedRoomType} trống trong khoảng thời gian này.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleConfirmBooking = async () => {
    if (!currentCustomer) {
      toast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập lại",
        variant: "destructive",
      });
      return;
    }

    // Double check availability before submit
    if (availableRooms.length === 0) {
      toast({
        title: "Lỗi",
        description: "Phòng vừa được đặt bởi người khác.",
        variant: "destructive",
      });
      return;
    }

    const selectedRoom = availableRooms[0];
    const timestamp = Date.now();

    const payload = {
      KhachHang: currentCustomer._id,
      HangPhong: roomTypeInfo[selectedRoomType]?.backendEnum || "Standard",
      NgayDen: checkInDate,
      NgayDi: checkOutDate,
      SoKhach: parseInt(numberOfGuests),
      TienCoc: depositAmount,
      // Pass the specific room selected by the filter if available,
      // otherwise let backend auto-assign (though frontend validates availableRooms.length > 0)
      ChiTietDatPhong: selectedRoom
        ? [{ MaCTDP: `CTDP${timestamp}`, Phong: selectedRoom._id }]
        : [],
    };

    try {
      setIsBooking(true);
      
      // Create booking with Pending status and get Stripe checkout URL
      const { url } = await stripeApi.createCheckoutSession(payload);
      
      // Redirect to Stripe checkout page
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Không thể tạo phiên thanh toán");
      }
    } catch (error) {
      toast({
        title: "Thất bại",
        description: error.message,
        variant: "destructive",
      });
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Đặt phòng trực tuyến
        </h1>
        <p className="text-muted-foreground">Chọn loại phòng và ngày lưu trú</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className="w-12 h-1 mx-4 bg-muted" />}
          </div>
        ))}
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto" />
      ) : (
        <>
          {step === 1 && (
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(roomTypeInfo).map(([type, info]) => (
                <Card
                  key={type}
                  className={`cursor-pointer ${
                    selectedRoomType === type ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedRoomType(type)}
                >
                  <CardHeader>
                    <CardTitle>{type}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border shadow-sm">
                      <Swiper
                        modules={[Autoplay]}
                        autoplay={{ delay: 1567, disableOnInteraction: false }}
                        loop
                        className="h-full w-full"
                      >
                        {rooms[0].img && rooms[0].img.length > 0 ? (
                          rooms[0].img.map((img, idx) => (
                            <SwiperSlide
                              key={idx}
                              className="flex items-center justify-center bg-muted"
                            >
                              <img
                                src={img}
                                alt={`Phòng ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </SwiperSlide>
                          ))
                        ) : (
                          <SwiperSlide className="flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">
                              Không có hình ảnh
                            </span>
                          </SwiperSlide>
                        )}
                      </Swiper>
                    </div>
                    <div className="font-bold text-lg text-primary">
                      {info.price.toLocaleString()} VNĐ
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết lưu trú</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Ngày nhận</Label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Ngày trả</Label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-muted p-4 rounded flex justify-between items-center">
                  <span>Phòng trống ({selectedRoomType}):</span>
                  <Badge
                    variant={
                      availableRooms.length > 0 ? "success" : "destructive"
                    }
                  >
                    {availableRooms.length} phòng
                  </Badge>
                </div>
                {availableRooms.length === 0 && checkInDate && checkOutDate && (
                  <p className="text-sm text-destructive">
                    Không có phòng trống trong khoảng thời gian này.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Xác nhận</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Phòng:</span>
                    <strong>{selectedRoomType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày:</span>
                    <strong>
                      {checkInDate} - {checkOutDate}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Phòng số:</span>
                    <strong>
                      {availableRooms[0]?.SoPhong} ({availableRooms.length}{" "}
                      available)
                    </strong>
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Tổng:</span>
                    <span>{totalAmount.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Đặt cọc (30%):</span>
                    <span>{depositAmount.toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 1}
            >
              Quay lại
            </Button>
            {step < 3 ? (
              <Button onClick={handleNext}>Tiếp tục</Button>
            ) : (
              <Button onClick={() => setConfirmDialogOpen(true)}>
                Thanh toán cọc & Đặt phòng
              </Button>
            )}
          </div>

          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Xác nhận đặt phòng?</DialogTitle>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button onClick={handleConfirmBooking} disabled={isBooking}>
                  {isBooking && <Loader2 className="animate-spin mr-2" />} Đồng
                  ý
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
