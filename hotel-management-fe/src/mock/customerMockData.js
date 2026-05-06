export const mockCustomerAccounts = [
  {
    id: "CA001",
    email: "nguyenvanan@email.com",
    password: "customer123",
    guestId: "G001",
    name: "Nguyễn Văn An",
    phone: "0901234567",
    idNumber: "001234567890",
    address: "123 Hoàng Hoa Thám, Hà Nội",
    createdAt: "2025-01-05",
  },
  {
    id: "CA002",
    email: "tranthibinh@email.com",
    password: "customer123",
    guestId: "G002",
    name: "Trần Thị Bình",
    phone: "0902345678",
    idNumber: "002345678901",
    address: "456 Nguyễn Huệ, Hồ Chí Minh",
    createdAt: "2025-01-08",
  },
];

// Online Bookings (from customer portal)
export const mockOnlineBookings = [
  {
    id: "OB001",
    customerId: "CA001",
    roomType: "Standard",
    numberOfGuests: 2,
    checkInDate: "2025-02-01",
    checkOutDate: "2025-02-04",
    status: "pending",
    totalAmount: 1500000,
    depositPaid: 500000,
    source: "online",
    createdAt: "2025-01-18T15:00:00",
    notes: "Muốn phòng view biển nếu có",
  },
  {
    id: "OB002",
    customerId: "CA002",
    roomType: "Deluxe",
    numberOfGuests: 3,
    checkInDate: "2025-02-10",
    checkOutDate: "2025-02-15",
    status: "confirmed",
    totalAmount: 4000000,
    depositPaid: 1000000,
    source: "online",
    createdAt: "2025-01-17T11:00:00",
    notes: "",
  },
];

// Customer Service Requests
export const mockServiceRequests = [
  {
    id: "SR001",
    customerId: "CA001",
    bookingId: "B001",
    serviceType: "room_service",
    serviceName: "Phục vụ phòng",
    description: "Đặt bữa sáng lên phòng lúc 7h",
    status: "completed",
    assignedStaff: "ST004",
    amount: 150000,
    createdAt: "2025-01-16T07:00:00",
    completedAt: "2025-01-16T07:30:00",
  },
  {
    id: "SR002",
    customerId: "CA001",
    bookingId: "B001",
    serviceType: "laundry",
    serviceName: "Giặt ủi",
    description: "Giặt 3 áo sơ mi, 2 quần tây",
    status: "in_progress",
    assignedStaff: "ST004",
    amount: 250000,
    createdAt: "2025-01-17T09:00:00",
  },
  {
    id: "SR003",
    customerId: "CA002",
    bookingId: "B002",
    serviceType: "airport_transfer",
    serviceName: "Đưa đón sân bay",
    description: "Đón sân bay Tân Sơn Nhất, 15h ngày 20/01",
    status: "pending",
    assignedStaff: null,
    amount: 300000,
    createdAt: "2025-01-18T10:00:00",
  },
  {
    id: "SR004",
    customerId: "CA002",
    bookingId: "B002",
    serviceType: "spa",
    serviceName: "Spa & Massage",
    description: "Massage toàn thân 90 phút, 2 người",
    status: "pending",
    assignedStaff: null,
    amount: 1000000,
    createdAt: "2025-01-18T14:00:00",
  },
  {
    id: "SR005",
    customerId: "CA001",
    bookingId: "B001",
    serviceType: "vehicle_rental",
    serviceName: "Thuê xe máy",
    description: "Thuê 1 xe máy từ 16/01 đến 18/01",
    status: "completed",
    assignedStaff: "ST003",
    amount: 450000,
    createdAt: "2025-01-16T08:00:00",
    completedAt: "2025-01-16T08:30:00",
  },
];

// Các dịch vụ
export const serviceTypes = [
  { id: "room_service", name: "Phục vụ phòng", icon: "Utensils", description: "Đặt đồ ăn, thức uống giao tận phòng" },
  { id: "laundry", name: "Giặt ủi", icon: "Shirt", description: "Dịch vụ giặt ủi quần áo" },
  { id: "airport_transfer", name: "Đưa đón sân bay", icon: "Plane", description: "Dịch vụ đón/đưa sân bay" },
  { id: "vehicle_rental", name: "Thuê xe", icon: "Car", description: "Thuê xe máy hoặc ô tô" },
  { id: "spa", name: "Spa & Massage", icon: "Sparkles", description: "Dịch vụ spa, massage thư giãn" },
];

// Khách hàng thanh toán
export const mockCustomerPayments = [
  {
    id: "PAY001",
    customerId: "CA001",
    bookingId: "B001",
    type: "deposit",
    amount: 500000,
    method: "bank_transfer",
    status: "completed",
    createdAt: "2025-01-10T10:00:00",
  },
  {
    id: "PAY002",
    customerId: "CA001",
    bookingId: "B001",
    type: "full_payment",
    amount: 2140000,
    method: "credit_card",
    status: "completed",
    createdAt: "2025-01-18T09:00:00",
  },
  {
    id: "PAY003",
    customerId: "CA002",
    bookingId: "B002",
    type: "deposit",
    amount: 1000000,
    method: "cash",
    status: "completed",
    createdAt: "2025-01-12T14:00:00",
  },
];

// Hình thức thanh toán
export const paymentMethods = [
  { id: "cash", name: "Tiền mặt", description: "Thanh toán tại quầy lễ tân" },
  { id: "bank_transfer", name: "Chuyển khoản ngân hàng", description: "Chuyển khoản qua tài khoản ngân hàng" },
  { id: "credit_card", name: "Thẻ tín dụng/ghi nợ", description: "Visa, Mastercard, JCB" },
  { id: "momo", name: "Ví MoMo", description: "Thanh toán qua ví điện tử MoMo" },
  { id: "vnpay", name: "VNPay", description: "Thanh toán qua VNPay QR" },
];