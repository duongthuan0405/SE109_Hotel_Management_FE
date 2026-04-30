import { useState, useEffect } from "react";
import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { maintenanceApi, roomApi } from "@/api";
import { toast } from "@/hooks/use-toast";


const MaintenanceRequest = () => {
  const [requests, setRequests] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    Phong: "",
    NoiDung: ""
  });


  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);


  const fetchRequests = async () => {
    try {
      const data = await maintenanceApi.getMaintenanceRequestsForGuest();
      setRequests(data);
    } catch (error) {
      toast.error("Không thể tải yêu cầu bảo trì");
    } finally {
      setLoading(false);
    }
  };


  const fetchRooms = async () => {
    try {
      const data = await roomApi.getRooms();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await maintenanceApi.createMaintenanceRequest(formData);
      toast.success("Yêu cầu bảo trì đã được gửi");
      setDialogOpen(false);
      setFormData({ Phong: "", NoiDung: "" });
      fetchRequests();
    } catch (error) {
      toast.error("Không thể gửi yêu cầu bảo trì");
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) return <div>Đang tải...</div>;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Yêu cầu bảo trì
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Tạo yêu cầu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo yêu cầu bảo trì</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="phong">Phòng</Label>
                  <Select
                    value={formData.Phong}
                    onValueChange={(value) => setFormData({ ...formData, Phong: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room._id} value={room._id}>
                          Phòng {room.SoPhong}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="noiDung">Nội dung yêu cầu</Label>
                  <Textarea
                    id="noiDung"
                    value={formData.NoiDung}
                    onChange={(e) => setFormData({ ...formData, NoiDung: e.target.value })}
                    placeholder="Mô tả vấn đề cần sửa chữa..."
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Gửi yêu cầu
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-muted-foreground">Chưa có yêu cầu bảo trì nào.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">Phòng {request.Phong.SoPhong}</span>
                      <Badge className={getStatusColor(request.TrangThai)}>
                        {request.TrangThai}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {request.NoiDung}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(request.NgayThucHien).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default MaintenanceRequest;

