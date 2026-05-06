import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: "Xin chào! 👋 Tôi là trợ lý của khách sạn. Tôi có thể giúp bạn với:\n• Thông tin phòng\n• Đặt phòng\n• Dịch vụ\n• Thanh toán\n• Hỗ trợ kỹ thuật",
      topic: "greeting",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get the last bot message topic
  const getLastBotTopic = () => {
    const lastBotMessage = [...messages].reverse().find(m => m.type === "bot");
    return lastBotMessage?.topic || null;
  };

  // Check if message is affirmative (wants more info)
  const isAffirmativeResponse = (message) => {
    const msg = message.toLowerCase();
    return (
      msg.includes("muốn") ||
      msg.includes("vâng") ||
      msg.includes("được") ||
      msg.includes("biết") ||
      msg.includes("chi tiết") ||
      msg.includes("yes") ||
      msg.includes("yep") ||
      msg.includes("ok") ||
      msg.includes("okay") ||
      msg.includes("đúng") ||
      msg.includes("có") ||
      msg.includes("tốt") ||
      msg.match(/^(vâng|được|ok|tốt|okela)$/i) ||
      msg.match(/^(được|muốn).*(biết|chi tiết|thêm|tìm hiểu)/) ||
      msg.match(/(biết|tìm hiểu|chi tiết).*(thêm|được)/)
    );
  };

  const getRoomDetailsResponse = () => {
    return "Dưới đây là chi tiết về các loại phòng:\n\n🛏️ **Phòng Đơn (Single)**\n• Diện tích: 25m²\n• Giường đơn\n• Giá: 500,000đ/đêm\n\n🛏️ **Phòng Đôi (Double)**\n• Diện tích: 35m²\n• Giường đôi\n• Giá: 800,000đ/đêm\n\n👨‍👩‍👧‍👦 **Phòng Gia Đình (Family)**\n• Diện tích: 50m²\n• 2 giường đôi + 1 giường đơn\n• Giá: 1,200,000đ/đêm\n\n✨ **Phòng Suite**\n• Diện tích: 65m²\n• Khu vực khách + phòng ngủ\n• Giá: 1,800,000đ/đêm\n\nTất cả phòng có: WiFi, TV, AC, Tủ lạnh, Phòng tắm hiện đại.\n\nBạn có muốn đặt phòng nào không?";
  };

  const getServiceDetailsResponse = () => {
    return "Chi tiết các dịch vụ:\n\n🧹 **Dọn phòng hàng ngày** - Miễn phí\n\n🍽️ **Dịch vụ phòng ăn** - 24/7\n• Thực đơn đa dạng\n• Giao phòng nhanh\n\n👕 **Giặt ủi**\n• Giặt khô: 50,000đ/kg\n• Ủi: 30,000đ/kg\n\n🚕 **Taxi/Đưa đón**\n• Sân bay: 200,000đ\n• Thành phố: Giá cước\n\n📶 **WiFi** - Miễn phí (100Mbps)\n\nBạn cần dịch vụ nào?";
  };

  const getBookingDetailsResponse = () => {
    return "Quy trình đặt phòng chi tiết:\n\n📝 **Bước 1: Chọn ngày**\n• Chọn ngày check-in\n• Chọn ngày check-out\n• Số đêm sẽ tự tính\n\n🛏️ **Bước 2: Chọn phòng**\n• Xem danh sách phòng trống\n• Xem hình ảnh phòng\n• Chọn loại phòng phù hợp\n\n👤 **Bước 3: Thông tin khách**\n• Họ tên đầy đủ\n• Số điện thoại\n• Email\n• Quốc tịch\n\n💳 **Bước 4: Thanh toán**\n• Thẻ tín dụng\n• Chuyển khoản\n• Thanh toán tại quầy\n\nBạn muốn bắt đầu đặt phòng không?";
  };

  const getPaymentDetailsResponse = () => {
    return "Chi tiết về thanh toán:\n\n💳 **Phương thức thanh toán**\n• Thẻ tín dụng (VISA, Mastercard)\n• Thẻ ghi nợ\n• Chuyển khoản ngân hàng\n• Ví điện tử (Momo, Zalo Pay)\n• Tiền mặt tại quầy\n\n📄 **Hóa đơn**\n• Cấp hóa đơn chi tiết\n• Ghi rõ từng dịch vụ\n• Gửi qua email\n\n💰 **Chính sách giá**\n• Không phí ẩn\n• Giá hiển thị bao gồm thuế\n• Hỗ trợ giảm giá theo nhóm\n\nCó thêm câu hỏi về thanh toán không?";
  };

  const getMaintenanceDetailsResponse = () => {
    return "Hỗ trợ bảo trì & sửa chữa:\n\n🔧 **Các vấn đề thường gặp**\n• Điều hòa không lạnh\n• Nước nóng không có\n• Đèn bị hỏng\n• Phụ kiện vỡ\n\n📞 **Cách yêu cầu**\n• Gọi lễ tân: Phím 0\n• Gửi yêu cầu qua ứng dụng\n• Gọi: 0123-456-789\n\n⏱️ **Thời gian xử lý**\n• Sự cố khẩn cấp: 10 phút\n• Bảo trì thông thường: 15 phút\n• Yêu cầu đặc biệt: 1 giờ\n\n✅ **Đảm bảo**\n• Miễn phí sửa chữa do khách sạn\n• Xử lý hỏng hóc do khách: Chi phí thực tế\n\nBạn gặp vấn đề gì không?";
  };

  const getContactDetailsResponse = () => {
    return "Thông tin liên hệ & địa chỉ:\n\n📍 **Địa chỉ**\n123 Đường ABC, Thành phố\nViệt Nam\n\n📞 **Điện thoại**\n• Lễ tân: +84-123-456-789\n• Phòng: Phím 0\n• Emergency: +84-987-654-321\n\n📧 **Email**\n• Thông tin: info@hotelkhoi.vn\n• Đặt phòng: booking@hotelkhoi.vn\n• Hỗ trợ: support@hotelkhoi.vn\n\n🌐 **Website**\nwww.hotelkhoi.vn\n\n⏰ **Giờ làm việc**\n• Lễ tân: 24/7\n• Hành chính: 8:00 - 17:00\n\nGọi cho chúng tôi bất kỳ lúc nào!";
  };

  const getCancellationDetailsResponse = () => {
    return "Chính sách hủy phòng chi tiết:\n\n🔄 **Điều khoản hủy**\n• Hủy 7+ ngày trước: Hoàn 100%\n• Hủy 4-7 ngày: Hoàn 50%\n• Hủy 1-3 ngày: Hoàn 0%\n• Hủy ngày check-in: Mất 1 đêm\n\n⏱️ **Thời gian xử lý**\n• Hoàn tiền: 3-5 ngày làm việc\n• Thẻ tín dụng: Lâu hơn\n\n💡 **Lưu ý**\n• Kiểm tra email xác nhận\n• Lưu mã đặt phòng\n• Liên hệ lễ tân nếu cần thay đổi\n\n❓ **Trường hợp đặc biệt**\n• Tình huống khẩn cấp: Hoàn 100%\n• Thay đổi ngày: Không phí\n• Nâng cấp phòng: Hoàn lệnh phí\n\nBạn có muốn hủy đặt phòng không?";
  };

  const getCheckInDetailsResponse = () => {
    return "Thông tin Check-in/Check-out:\n\n🔐 **Check-in**\n• Thời gian: 14:00\n• Địa điểm: Lễ tân tầng 1\n• Cần CCCD/Hộ chiếu\n• Nhân phòng phòng thẻ\n\n🔑 **Check-out**\n• Thời gian: 11:00\n• Trả chìa khóa tại lễ tân\n• Thanh toán phát sinh (nếu có)\n• Kiểm tra đồ vật cá nhân\n\n⏰ **Giờ muộn (Late Check-out)**\n• 11:00-13:00: +50,000đ\n• 13:00-17:00: +100,000đ\n• Tùy có sẵn phòng\n• Đặt trước 09:00\n\n🧳 **Giữ hành lý**\n• Miễn phí trong 7 ngày\n• Phải trả trước khi rời đi\n• Bảo quản trong kho an toàn\n\nBạn có câu hỏi gì không?";
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    const lastTopic = getLastBotTopic();

    // Check for specific service mentions FIRST (handles follow-ups to service_info)
    if (
      message.includes("wifi") ||
      message.includes("wi-fi") ||
      message.includes("internet") ||
      message.includes("mạng")
    ) {
      return {
        text: "Thông tin về dịch vụ WiFi:\n\n📶 **WiFi Miễn Phí**\n• Tốc độ: 100 Mbps\n• Độ ổn định: 99.9% uptime\n• Phạm vi: Toàn bộ khách sạn\n• Không cần mật khẩu: Tự động kết nối\n• Hỗ trợ: 24/7\n\n💡 **Cách kết nối**\n1. Mở WiFi settings\n2. Tìm mạng 'HotelKhoi-WiFi'\n3. Kết nối (không cần mật khẩu)\n4. Tự động nhận IP\n\n📞 Có vấn đề về WiFi?\n• Gọi lễ tân: Phím 0\n• Chat với support\n\nCó thể giúp gì thêm không?",
        topic: "wifi_details"
      };
    }

    if (
      message.includes("giặt") ||
      message.includes("laundry") ||
      message.includes("ủi") ||
      message.includes("quần áo")
    ) {
      return {
        text: "Thông tin về Dịch vụ Giặt Ủi:\n\n👕 **Giặt Ủi**\n• Hoạt động: 7:00-19:00\n• Giao: Thứ 2-6\n• Gọi: Phím 3\n\n💰 **Giá dịch vụ**\n• Giặt khô: 50,000đ/kg (tối thiểu 5 kg)\n• Ủi: 30,000đ/kg\n• Giặt+Ủi: 70,000đ/kg\n• Giặt tay: 100,000đ/kg\n\n⏱️ **Thời gian**\n• Giặt thường: 2-3 ngày\n• Giặt nhanh: 1 ngày (+20,000đ)\n• Khẩn cấp: 4 giờ (+50,000đ)\n\n🔔 **Cách sử dụng**\n1. Đặt quần áo vào túi\n2. Gọi phòm ủi (Phím 3)\n3. Nhân viên lấy tại phòng\n4. Nhận khi hoàn tất\n\nBạn cần giặt không?",
        topic: "laundry_details"
      };
    }

    if (
      message.includes("phòng ăn") ||
      message.includes("room service") ||
      message.includes("ăn uống") ||
      message.includes("thức ăn") ||
      message.includes("đặt phòng ăn")
    ) {
      return {
        text: "Thông tin về Dịch vụ Phòng Ăn:\n\n🍽️ **Phòng Ăn 24/7**\n• Mở cửa: Luôn luôn\n• Gọi: Phím 2\n• Thời gian giao: 20-30 phút\n\n📋 **Menu**\n• Ăn sáng: 6:00-10:00\n• Ăn trưa: 11:00-14:00\n• Ăn chiều: 17:00-21:00\n• Suất ăn đặc biệt: Bất kỳ lúc nào\n\n💰 **Giá cơ bản**\n• Combo nhẹ: 150,000đ\n• Combo chuẩn: 250,000đ\n• Combo cao cấp: 400,000đ\n\n🔔 **Cách đặt**\n1. Gọi số 2 từ điện thoại phòng\n2. Nói chuyện với nhân viên\n3. Xác nhận chi tiết\n4. Chờ giao đến phòng\n\nBạn muốn đặt gì không?",
        topic: "roomservice_details"
      };
    }

    if (
      message.includes("dọn") ||
      message.includes("cleaning") ||
      message.includes("sạch sẽ") ||
      message.includes("dọn phòng")
    ) {
      return {
        text: "Thông tin về Dịch vụ Dọn Phòng:\n\n🧹 **Dọn Phòng Hàng Ngày**\n• Thời gian: 10:00-11:30\n• Miễn phí hoàn toàn\n• Nhân viên chuyên nghiệp\n• Sử dụng hóa chất an toàn\n\n📋 **Dịch vụ bao gồm**\n• Lau sạch toàn bộ phòng\n• Thay giường sạch\n• Thay khăn tắm\n• Làm sạch phòng tắm\n• Xếp gọn đồ vật\n\n🔔 **Yêu cầu đặc biệt**\n• Gọi lễ tân (Phím 0)\n• Yêu cầu dọn ngoài giờ: +50,000đ\n• Dọn khẩn cấp: 15 phút (miễn phí)\n\n⏰ **Lưu ý**\n• Treo bảng 'Do Not Disturb' nếu không muốn dọn\n• Báo trước nếu muốn dọn sớm\n\nCó cần gì thêm không?",
        topic: "cleaning_details"
      };
    }

    if (
      message.includes("taxi") ||
      message.includes("đưa đón") ||
      message.includes("transport") ||
      message.includes("xe") ||
      message.includes("sân bay")
    ) {
      return {
        text: "Thông tin về Dịch vụ Taxi/Đưa Đón:\n\n🚕 **Đưa Đón**\n• Bảo hành: Sạch sẽ, an toàn\n• Lái xe chuyên nghiệp\n• Điều hòa mát mẻ\n• Thẻ SIM để liên lạc\n\n💰 **Giá cước**\n• Sân bay (20 km): 200,000đ\n• Thành phố: Theo taxi meter\n• Ngoài giờ (+19:00): +10%\n• Chờ xe: 50,000đ/giờ\n\n🚖 **Loại xe**\n• Sedan (1-3 khách): 200,000đ\n• 7 chỗ (4-7 khách): 300,000đ\n• Xe cao cấp: +100,000đ\n\n📍 **Địa điểm phổ biến**\n• Sân bay Tân Sơn Nhất: 200,000đ\n• Bến Thành: 150,000đ\n• Bitexco: 180,000đ\n\n🔔 **Đặt xe**\n• Gọi lễ tân (Phím 0)\n• Nói rõ: Điểm đi, điểm đến, giờ\n• Xe sẵn sàng trong 10 phút\n\nBạn cần gọi taxi không?",
        topic: "taxi_details"
      };
    }

    // If user is asking for more details and bot just asked about a topic
    if (isAffirmativeResponse(message)) {
      if (lastTopic === "room_info") {
        return {
          text: "Dưới đây là chi tiết về các loại phòng:\n\n🛏️ **Phòng Đơn (Single)**\n• Diện tích: 25m²\n• Giường đơn\n• Giá: 500,000đ/đêm\n\n🛏️ **Phòng Đôi (Double)**\n• Diện tích: 35m²\n• Giường đôi\n• Giá: 800,000đ/đêm\n\n👨‍👩‍👧‍👦 **Phòng Gia Đình (Family)**\n• Diện tích: 50m²\n• 2 giường đôi + 1 giường đơn\n• Giá: 1,200,000đ/đêm\n\n✨ **Phòng Suite**\n• Diện tích: 65m²\n• Khu vực khách + phòng ngủ\n• Giá: 1,800,000đ/đêm\n\nTất cả phòng có: WiFi, TV, AC, Tủ lạnh, Phòng tắm hiện đại.\n\nBạn có muốn đặt phòng nào không?",
          topic: "room_details"
        };
      }
      if (lastTopic === "service_info") {
        return {
          text: "Chi tiết các dịch vụ:\n\n🧹 **Dọn phòng hàng ngày** - Miễn phí\n\n🍽️ **Dịch vụ phòng ăn** - 24/7\n• Thực đơn đa dạng\n• Giao phòng nhanh\n\n👕 **Giặt ủi**\n• Giặt khô: 50,000đ/kg\n• Ủi: 30,000đ/kg\n\n🚕 **Taxi/Đưa đón**\n• Sân bay: 200,000đ\n• Thành phố: Giá cước\n\n📶 **WiFi** - Miễn phí (100Mbps)\n\nBạn cần dịch vụ nào?",
          topic: "service_details"
        };
      }
      if (lastTopic === "booking_info") {
        return {
          text: "Quy trình đặt phòng chi tiết:\n\n📝 **Bước 1: Chọn ngày**\n• Chọn ngày check-in\n• Chọn ngày check-out\n• Số đêm sẽ tự tính\n\n🛏️ **Bước 2: Chọn phòng**\n• Xem danh sách phòng trống\n• Xem hình ảnh phòng\n• Chọn loại phòng phù hợp\n\n👤 **Bước 3: Thông tin khách**\n• Họ tên đầy đủ\n• Số điện thoại\n• Email\n• Quốc tịch\n\n💳 **Bước 4: Thanh toán**\n• Thẻ tín dụng\n• Chuyển khoản\n• Thanh toán tại quầy\n\nBạn muốn bắt đầu đặt phòng không?",
          topic: "booking_details"
        };
      }
      if (lastTopic === "payment_info") {
        return {
          text: "Chi tiết về thanh toán:\n\n💳 **Phương thức thanh toán**\n• Thẻ tín dụng (VISA, Mastercard)\n• Thẻ ghi nợ\n• Chuyển khoản ngân hàng\n• Ví điện tử (Momo, Zalo Pay)\n• Tiền mặt tại quầy\n\n📄 **Hóa đơn**\n• Cấp hóa đơn chi tiết\n• Ghi rõ từng dịch vụ\n• Gửi qua email\n\n💰 **Chính sách giá**\n• Không phí ẩn\n• Giá hiển thị bao gồm thuế\n• Hỗ trợ giảm giá theo nhóm\n\nCó thêm câu hỏi về thanh toán không?",
          topic: "payment_details"
        };
      }
      if (lastTopic === "maintenance_info") {
        return {
          text: "Hỗ trợ bảo trì & sửa chữa:\n\n🔧 **Các vấn đề thường gặp**\n• Điều hòa không lạnh\n• Nước nóng không có\n• Đèn bị hỏng\n• Phụ kiện vỡ\n\n📞 **Cách yêu cầu**\n• Gọi lễ tân: Phím 0\n• Gửi yêu cầu qua ứng dụng\n• Gọi: 0123-456-789\n\n⏱️ **Thời gian xử lý**\n• Sự cố khẩn cấp: 10 phút\n• Bảo trì thông thường: 15 phút\n• Yêu cầu đặc biệt: 1 giờ\n\n✅ **Đảm bảo**\n• Miễn phí sửa chữa do khách sạn\n• Xử lý hỏng hóc do khách: Chi phí thực tế\n\nBạn gặp vấn đề gì không?",
          topic: "maintenance_details"
        };
      }
      if (lastTopic === "contact_info") {
        return {
          text: "Thông tin liên hệ & địa chỉ:\n\n📍 **Địa chỉ**\n123 Đường ABC, Thành phố\nViệt Nam\n\n📞 **Điện thoại**\n• Lễ tân: +84-123-456-789\n• Phòng: Phím 0\n• Emergency: +84-987-654-321\n\n📧 **Email**\n• Thông tin: info@hotelkhoi.vn\n• Đặt phòng: booking@hotelkhoi.vn\n• Hỗ trợ: support@hotelkhoi.vn\n\n🌐 **Website**\nwww.hotelkhoi.vn\n\n⏰ **Giờ làm việc**\n• Lễ tân: 24/7\n• Hành chính: 8:00 - 17:00\n\nGọi cho chúng tôi bất kỳ lúc nào!",
          topic: "contact_details"
        };
      }
      if (lastTopic === "cancellation_info") {
        return {
          text: "Chính sách hủy phòng chi tiết:\n\n🔄 **Điều khoản hủy**\n• Hủy 7+ ngày trước: Hoàn 100%\n• Hủy 4-7 ngày: Hoàn 50%\n• Hủy 1-3 ngày: Hoàn 0%\n• Hủy ngày check-in: Mất 1 đêm\n\n⏱️ **Thời gian xử lý**\n• Hoàn tiền: 3-5 ngày làm việc\n• Thẻ tín dụng: Lâu hơn\n\n💡 **Lưu ý**\n• Kiểm tra email xác nhận\n• Lưu mã đặt phòng\n• Liên hệ lễ tân nếu cần thay đổi\n\n❓ **Trường hợp đặc biệt**\n• Tình huống khẩn cấp: Hoàn 100%\n• Thay đổi ngày: Không phí\n• Nâng cấp phòng: Hoàn lệnh phí\n\nBạn có muốn hủy đặt phòng không?",
          topic: "cancellation_details"
        };
      }
      if (lastTopic === "checkin_info") {
        return {
          text: "Thông tin Check-in/Check-out:\n\n🔐 **Check-in**\n• Thời gian: 14:00\n• Địa điểm: Lễ tân tầng 1\n• Cần CCCD/Hộ chiếu\n• Nhân phòng phòng thẻ\n\n🔑 **Check-out**\n• Thời gian: 11:00\n• Trả chìa khóa tại lễ tân\n• Thanh toán phát sinh (nếu có)\n• Kiểm tra đồ vật cá nhân\n\n⏰ **Giờ muộn (Late Check-out)**\n• 11:00-13:00: +50,000đ\n• 13:00-17:00: +100,000đ\n• Tùy có sẵn phòng\n• Đặt trước 09:00\n\n🧳 **Giữ hành lý**\n• Miễn phí trong 7 ngày\n• Phải trả trước khi rời đi\n• Bảo quản trong kho an toàn\n\nBạn có câu hỏi gì không?",
          topic: "checkin_details"
        };
      }
    }

    // Room Information
    if (
      message.includes("phòng") ||
      message.includes("room") ||
      message.includes("loại phòng")
    ) {
      return {
        text: "Chúng tôi cung cấp các loại phòng:\n• Phòng Đơn (Single)\n• Phòng Đôi (Double)\n• Phòng Gia Đình (Family)\n• Phòng Suite\n\nMỗi phòng được trang bị đầy đủ tiện nghi hiện đại. Bạn có muốn biết thêm chi tiết không?",
        topic: "room_info"
      };
    }

    // Booking Information
    if (
      message.includes("đặt phòng") ||
      message.includes("booking") ||
      message.includes("book room")
    ) {
      return {
        text: "Để đặt phòng, bạn có thể:\n1. Chọn ngày check-in và check-out\n2. Chọn loại phòng phù hợp\n3. Nhập thông tin khách hàng\n4. Chọn phương thức thanh toán\n\nBạn muốn đặt phòng ngay bây giờ không?",
        topic: "booking_info"
      };
    }

    // Services
    if (
      message.includes("dịch vụ") ||
      message.includes("service") ||
      message.includes("sử dụng dịch vụ")
    ) {
      return {
        text: "Chúng tôi cung cấp các dịch vụ:\n• Dọn phòng hàng ngày\n• Đặt phòng ăn trong phòng\n• Giặt ủi\n• Taxi/Đưa đón\n• WiFi miễn phí\n\nBạn cần sử dụng dịch vụ nào?",
        topic: "service_info"
      };
    }

    // Billing/Payment
    if (
      message.includes("thanh toán") ||
      message.includes("payment") ||
      message.includes("hóa đơn") ||
      message.includes("invoice")
    ) {
      return {
        text: "Về thanh toán:\n• Chấp nhận Thẻ tín dụng, Debit\n• Chuyển khoản ngân hàng\n• Thanh toán tại quầy\n\nChúng tôi cung cấp hóa đơn chi tiết cho mỗi đơn đặt phòng. Bạn có câu hỏi gì không?",
        topic: "payment_info"
      };
    }

    // Check-in/Check-out
    if (
      message.includes("check-in") ||
      message.includes("check-out") ||
      message.includes("nhận phòng") ||
      message.includes("trả phòng")
    ) {
      return {
        text: "Thông tin check-in/check-out:\n• Check-in: 14:00\n• Check-out: 11:00\n• Late checkout có thể yêu cầu (tùy có sẵn)\n• Giữ hành lý: Miễn phí\n\nBạn cần hỗ trợ gì khác?",
        topic: "checkin_info"
      };
    }

    // Maintenance/Issues
    if (
      message.includes("bảo trì") ||
      message.includes("sửa chữa") ||
      message.includes("problem") ||
      message.includes("issue") ||
      message.includes("lỗi")
    ) {
      return {
        text: "Nếu bạn gặp vấn đề trong phòng:\n• Liên hệ lễ tân ngay\n• Gửi yêu cầu bảo trì\n• Chúng tôi sẽ hỗ trợ trong vòng 15 phút\n\nVấn đề của bạn là gì?",
        topic: "maintenance_info"
      };
    }

    // Contact/Location
    if (
      message.includes("liên hệ") ||
      message.includes("contact") ||
      message.includes("địa chỉ") ||
      message.includes("location")
    ) {
      return {
        text: "Liên hệ khách sạn:\n📞 Điện thoại: +84-123-456-789\n📧 Email: info@hotelkhoi.vn\n📍 Địa chỉ: 123 Đường ABC, Thành phố\n\nHãy liên hệ với chúng tôi bất kỳ lúc nào!",
        topic: "contact_info"
      };
    }

    // Cancellation
    if (
      message.includes("hủy") ||
      message.includes("cancel") ||
      message.includes("refund")
    ) {
      return {
        text: "Chính sách hủy phòng:\n• Hủy 7 ngày trước: Hoàn 100%\n• Hủy 3-7 ngày: Hoàn 50%\n• Hủy trong 3 ngày: Không hoàn\n\nBạn cần hủy đặt phòng?",
        topic: "cancellation_info"
      };
    }

    // Greeting/Help
    if (message.includes("xin chào") || message.includes("hello") || message.includes("hi")) {
      return {
        text: "Xin chào! 👋 Tôi có thể giúp bạn với các thông tin về:\n• Phòng\n• Đặt phòng\n• Dịch vụ\n• Thanh toán\n• Bảo trì\n\nBạn cần giúp gì?",
        topic: "greeting"
      };
    }

    // Default response
    return {
      text: "Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Tôi có thể giúp về:\n• Thông tin phòng\n• Đặt phòng\n• Dịch vụ\n• Thanh toán\n• Hỗ trợ kỹ thuật\n\nCó thể hãy rephrase câu hỏi?",
      topic: "default"
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: "user",
      text: input,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setLoading(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const response = getBotResponse(input);
      const botText = typeof response === 'string' ? response : response.text;
      const botTopic = typeof response === 'string' ? null : response.topic;
      
      const newBotMessage = {
        id: messages.length + 2,
        type: "bot",
        text: botText,
        topic: botTopic,
      };
      setMessages((prev) => [...prev, newBotMessage]);
      setLoading(false);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-96 h-96 shadow-lg border border-gray-200 flex flex-col mb-4">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Trợ lý khách sạn</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg whitespace-pre-wrap text-sm ${
                      message.type === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="border-t p-3 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen
            ? "bg-gray-400 hover:bg-gray-500"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatBot;
