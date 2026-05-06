import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationApi } from "@/api";
import { toast } from "react-toastify";


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchNotifications();
  }, []);


  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotificationsForGuest();
      setNotifications(data);
    } catch (error) {
      toast.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };


  const markAsRead = async (id) => {
    try {
      await notificationApi.markNotificationAsRead(id);
      setNotifications(notifications.map(notif =>
        notif._id === id ? { ...notif, DaDoc: true } : notif
      ));
      toast.success("Đã đánh dấu đã đọc");
    } catch (error) {
      toast.error("Không thể cập nhật thông báo");
    }
  };


  const unreadCount = notifications.filter(n => !n.DaDoc).length;


  if (loading) return <div>Đang tải...</div>;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Thông báo
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-muted-foreground">Không có thông báo nào.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-3 border rounded-lg ${
                  !notif.DaDoc ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{notif.TieuDe}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notif.NoiDung}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notif.NgayTao).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {!notif.DaDoc && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead(notif._id)}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};


export default Notifications;

