import { useState, useEffect, useMemo } from "react";
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
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, Bed, Calendar, Users, Wallet } from "lucide-react";
import { customerApi, momoApi, roomTypeApi } from "@/api";

export default function CustomerBooking() {
  const [step, setStep] = useState(1);
  const [roomTypes, setRoomTypes] = useState([]);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minGuests, setMinGuests] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, roomTypesData] = await Promise.all([
          customerApi.getMyProfile(),
          roomTypeApi.getRoomTypes()
        ]);
        setCurrentCustomer(profileRes.data || profileRes);
        setRoomTypes(roomTypesData || []);
        if (roomTypesData?.length > 0) setSelectedRoomTypeId(roomTypesData[0]._id);
      } catch (error) {
        console.error("Error fetching booking data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter(type => {
      const matchesSearch = type.TenLoaiPhong.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = maxPrice === "" || type.DonGia <= parseInt(maxPrice);
      const matchesGuests = minGuests === "" || type.SoKhachToiDa >= parseInt(minGuests);
      return matchesSearch && matchesPrice && matchesGuests;
    });
  }, [roomTypes, searchTerm, maxPrice, minGuests]);

  const selectedRoomType = roomTypes.find(rt => rt._id === selectedRoomTypeId);
  const nights = (checkInDate && checkOutDate) ? Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)) : 0;
  const totalAmount = (selectedRoomType?.DonGia || 0) * (nights > 0 ? nights : 0) * roomQuantity;
  const depositAmount = Math.round(totalAmount * 0.3);

  const handleNext = () => {
    if (step === 1 && !selectedRoomTypeId) return toast({ title: "Chọn loại phòng", variant: "destructive" });
    if (step === 2) {
      if (!checkInDate || !checkOutDate) return toast({ title: "Chọn ngày", variant: "destructive" });
      if (new Date(checkInDate) < new Date().setHours(0,0,0,0)) return toast({ title: "Ngày không hợp lệ", variant: "destructive" });
      if (new Date(checkOutDate) <= new Date(checkInDate)) return toast({ title: "Ngày không hợp lệ", variant: "destructive" });
    }
    setStep(step + 1);
  };

  const handleConfirmBooking = async () => {
    try {
      setIsBooking(true);
      const payload = {
        KhachHang: currentCustomer._id,
        HangPhong: selectedRoomType._id,
        NgayDen: checkInDate,
        NgayDi: checkOutDate,
        SoLuongPhong: parseInt(roomQuantity),
        TienCoc: depositAmount,
      };
      const { payUrl } = await momoApi.createPayment(payload);
      if (payUrl) window.location.href = payUrl;
      else throw new Error("Khởi tạo thanh toán MoMo thất bại");
    } catch (error) {
      toast({ title: "Lỗi", description: error.message, variant: "destructive" });
      setIsBooking(false);
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Đặt phòng khách sạn</h1>
        <p className="text-muted-foreground text-lg">Trải nghiệm kỳ nghỉ tuyệt vời theo cách của bạn</p>
      </div>

      {/* Progress Stepper */}
      <div className="relative flex justify-between items-center px-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -z-10" />
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 bg-background px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4 border-background ${
              step >= s ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
            </div>
            <span className={`text-xs font-bold uppercase tracking-tighter ${step >= s ? "text-primary" : "text-muted-foreground"}`}>
              {s === 1 ? "Loại phòng" : s === 2 ? "Thời gian" : "Thanh toán"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <Card className="bg-muted/30 border-none shadow-none">
            <CardContent className="p-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="search" className="text-xs font-bold uppercase">Tìm kiếm</Label>
                <Input 
                  id="search"
                  placeholder="Tên loại phòng..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-bold uppercase">Giá tối đa (VNĐ)</Label>
                <Input 
                  id="price"
                  type="number"
                  placeholder="Ví dụ: 1000000" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guests" className="text-xs font-bold uppercase">Số khách tối thiểu</Label>
                <Input 
                  id="guests"
                  type="number"
                  placeholder="Ví dụ: 2" 
                  value={minGuests}
                  onChange={(e) => setMinGuests(e.target.value)}
                  className="bg-background"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 animate-in slide-in-from-right-4 duration-300">
            {filteredRoomTypes.length > 0 ? (
              filteredRoomTypes.map((type) => (
                <Card key={type._id} className={`cursor-pointer transition-all hover:shadow-md ${selectedRoomTypeId === type._id ? "ring-2 ring-primary bg-primary/5" : ""}`} onClick={() => setSelectedRoomTypeId(type._id)}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">{type.TenLoaiPhong}</CardTitle>
                      <Bed className={`h-5 w-5 ${selectedRoomTypeId === type._id ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3 w-3" /> Tối đa: {type.SoKhachToiDa} khách
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-black text-primary">{type.DonGia?.toLocaleString()} VNĐ <span className="text-xs font-normal text-muted-foreground">/ đêm</span></p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                <p className="text-muted-foreground font-medium">Không tìm thấy loại phòng phù hợp với bộ lọc.</p>
                <Button variant="link" onClick={() => { setSearchTerm(""); setMaxPrice(""); setMinGuests(""); }}>Xóa bộ lọc</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <Card className="animate-in slide-in-from-right-4 duration-300">
          <CardHeader>
            <CardTitle>Thời gian & Số lượng</CardTitle>
            <CardDescription>Vui lòng chọn ngày nhận/trả phòng và số lượng phòng.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Ngày nhận phòng</Label>
                <Input type="date" className="h-12" value={checkInDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setCheckInDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Ngày trả phòng</Label>
                <Input type="date" className="h-12" value={checkOutDate} min={checkInDate || new Date().toISOString().split('T')[0]} onChange={(e) => setCheckOutDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-3">
              <Label className="flex items-center gap-2"><Bed className="h-4 w-4" /> Số lượng phòng muốn đặt</Label>
              <div className="flex items-center gap-6">
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setRoomQuantity(Math.max(1, roomQuantity - 1))}>-</Button>
                <span className="text-3xl font-black w-12 text-center">{roomQuantity}</span>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setRoomQuantity(roomQuantity + 1)}>+</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="overflow-hidden animate-in zoom-in-95 duration-300 shadow-xl border-primary/20">
          <div className="bg-primary/5 p-6 border-b text-center">
            <CardTitle className="text-2xl">Xác nhận đặt phòng</CardTitle>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-y-4 text-sm border-b pb-6">
              <div className="text-muted-foreground">Loại phòng:</div>
              <div className="text-right font-bold">{selectedRoomType?.TenLoaiPhong}</div>
              <div className="text-muted-foreground">Thời gian:</div>
              <div className="text-right font-semibold">{checkInDate} → {checkOutDate} ({nights} đêm)</div>
              <div className="text-muted-foreground">Số lượng phòng:</div>
              <div className="text-right font-semibold">{roomQuantity} phòng</div>
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Tổng tiền:</span>
                <span className="text-3xl font-black text-primary">{totalAmount.toLocaleString()} VNĐ</span>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex justify-between items-center text-orange-700">
                <div className="flex items-center gap-2 font-bold"><Wallet className="h-5 w-5" /> Tiền cọc (30%)</div>
                <div className="text-xl font-black">{depositAmount.toLocaleString()} VNĐ</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" className="gap-2" onClick={() => setStep(step - 1)} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <Button size="lg" className="px-10 gap-2 shadow-lg" onClick={step < 3 ? handleNext : () => setConfirmDialogOpen(true)}>
          {step === 3 ? "Thanh toán ngay" : "Tiếp theo"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tiến hành đặt cọc</DialogTitle></DialogHeader>
          <DialogDescription>Hệ thống sẽ chuyển bạn đến ứng dụng MoMo để thực hiện thanh toán {depositAmount.toLocaleString()} VNĐ an toàn.</DialogDescription>
          <DialogFooter>
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDialogOpen(false)}>Hủy</Button>
            <Button className="flex-1" onClick={handleConfirmBooking} disabled={isBooking}>
              {isBooking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
