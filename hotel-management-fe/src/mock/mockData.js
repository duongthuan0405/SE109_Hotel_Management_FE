//Mock Rooms
export const mockRooms = [
  { id: "R101", roomNumber: "101", type: "Standard", floor: 1, status: "available", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R102", roomNumber: "102", type: "Standard", floor: 1, status: "occupied", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R103", roomNumber: "103", type: "Standard", floor: 1, status: "cleaning", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R104", roomNumber: "104", type: "Deluxe", floor: 1, status: "available", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R105", roomNumber: "105", type: "Deluxe", floor: 1, status: "reserved", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R201", roomNumber: "201", type: "Standard", floor: 2, status: "available", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R202", roomNumber: "202", type: "Standard", floor: 2, status: "occupied", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R203", roomNumber: "203", type: "Deluxe", floor: 2, status: "available", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R204", roomNumber: "204", type: "Deluxe", floor: 2, status: "maintenance", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R205", roomNumber: "205", type: "Suite", floor: 2, status: "occupied", price: 1500000, maxGuests: 4, amenities: ["WiFi", "TV", "AC", "Mini bar", "Bathtub", "Balcony"] },
  { id: "R301", roomNumber: "301", type: "Standard", floor: 3, status: "available", price: 500000, maxGuests: 2, amenities: ["WiFi", "TV", "AC"] },
  { id: "R302", roomNumber: "302", type: "Deluxe", floor: 3, status: "available", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R303", roomNumber: "303", type: "Deluxe", floor: 3, status: "occupied", price: 800000, maxGuests: 3, amenities: ["WiFi", "TV", "AC", "Mini bar"] },
  { id: "R304", roomNumber: "304", type: "Suite", floor: 3, status: "available", price: 1500000, maxGuests: 4, amenities: ["WiFi", "TV", "AC", "Mini bar", "Bathtub", "Balcony"] },
  { id: "R305", roomNumber: "305", type: "Suite", floor: 3, status: "reserved", price: 1500000, maxGuests: 4, amenities: ["WiFi", "TV", "AC", "Mini bar", "Bathtub", "Balcony"] },
  { id: "R401", roomNumber: "401", type: "Presidential", floor: 4, status: "available", price: 3000000, maxGuests: 6, amenities: ["WiFi", "TV", "AC", "Mini bar", "Bathtub", "Balcony", "Living room", "Kitchen"] },
];

//Mock Guests
export const mockGuests = [
  { id: "G001", name: "Nguyễn Văn An", phone: "0901234567", email: "nguyenvanan@email.com", idNumber: "001234567890", address: "Hà Nội" },
  { id: "G002", name: "Trần Thị Bình", phone: "0902345678", email: "tranthibinh@email.com", idNumber: "002345678901", address: "Hồ Chí Minh" },
  { id: "G003", name: "Lê Hoàng Cường", phone: "0903456789", email: "lehoangcuong@email.com", idNumber: "003456789012", address: "Đà Nẵng" },
  { id: "G004", name: "Phạm Thị Dung", phone: "0904567890", email: "phamthidung@email.com", idNumber: "004567890123", address: "Hải Phòng" },
  { id: "G005", name: "Hoàng Văn Em", phone: "0905678901", email: "hoangvanem@email.com", idNumber: "005678901234", address: "Cần Thơ" },
  { id: "G006", name: "Võ Thị Phương", phone: "0906789012", email: "vothiphuong@email.com", idNumber: "006789012345", address: "Huế" },
  { id: "G007", name: "Đặng Văn Giang", phone: "0907890123", email: "dangvangiang@email.com", idNumber: "007890123456", address: "Nha Trang" },
  { id: "G008", name: "Bùi Thị Hà", phone: "0908901234", email: "buithiha@email.com", idNumber: "008901234567", address: "Vũng Tàu" },
];

//Mock Bookings
export const mockBookings = [
  {
    id: "B001",
    guestId: "G001",
    roomIds: ["R102"],
    checkInDate: "2025-01-15",
    checkOutDate: "2025-01-18",
    numberOfGuests: 2,
    status: "checked_in",
    totalAmount: 1500000,
    notes: "",
    createdAt: "2025-01-10",
  },
  {
    id: "B002",
    guestId: "G002",
    roomIds: ["R105"],
    checkInDate: "2025-01-20",
    checkOutDate: "2025-01-25",
    numberOfGuests: 2,
    status: "confirmed",
    totalAmount: 4000000,
    notes: "",
    createdAt: "2025-01-12",
  },
  {
    id: "B003",
    guestId: "G003",
    roomIds: ["R202"],
    checkInDate: "2025-01-14",
    checkOutDate: "2025-01-17",
    numberOfGuests: 2,
    status: "checked_in",
    totalAmount: 1500000,
    notes: "",
    createdAt: "2025-01-09",
  },
  {
    id: "B004",
    guestId: "G004",
    roomIds: ["R205"],
    checkInDate: "2025-01-16",
    checkOutDate: "2025-01-20",
    numberOfGuests: 3,
    status: "checked_in",
    totalAmount: 6000000,
    notes: "Yêu cầu tầng cao",
    createdAt: "2025-01-11",
  },
  {
    id: "B005",
    guestId: "G005",
    roomIds: ["R303"],
    checkInDate: "2025-01-17",
    checkOutDate: "2025-01-19",
    numberOfGuests: 2,
    status: "checked_in",
    totalAmount: 1600000,
    notes: "",
    createdAt: "2025-01-13",
  },
];

//Mock Services
export const mockServices = [
  { id: "S001", name: "Ăn sáng buffet", category: "Ăn uống", unitPrice: 150000, description: "Buffet sáng từ 6h-10h" },
  { id: "S002", name: "Giặt ủi", category: "Tiện ích", unitPrice: 50000, description: "Giặt ủi quần áo" },
  { id: "S003", name: "Spa massage", category: "Thư giãn", unitPrice: 500000, description: "Massage toàn thân 90 phút" },
  { id: "S004", name: "Đưa đón sân bay", category: "Di chuyển", unitPrice: 300000, description: "Đưa đón sân bay một chiều" },
  { id: "S005", name: "Thuê xe máy", category: "Di chuyển", unitPrice: 150000, description: "Thuê xe máy theo ngày" },
];

//Mock Invoices
export const mockInvoices = [
  {
    id: "INV001",
    bookingId: "B001",
    guestId: "G001",
    items: [
      { description: "Phòng 102 (3 đêm)", quantity: 3, unitPrice: 500000, total: 1500000 },
      { description: "Ăn sáng buffet", quantity: 6, unitPrice: 150000, total: 900000 },
    ],
    subtotal: 2400000,
    tax: 240000,
    discount: 0,
    total: 2640000,
    paymentStatus: "paid",
    paymentMethod: "Thẻ tín dụng",
    createdAt: "2025-01-18",
  },
];

//Mock Maintenance
export const mockMaintenanceTickets = [
  {
    id: "MT001",
    roomId: "R204",
    title: "Điều hòa không hoạt động",
    description: "Máy điều hòa không làm lạnh",
    reportedBy: "Lễ tân",
    assignedTo: "ST005",
    priority: "high",
    status: "in_progress",
    createdAt: "2025-01-15",
  },
  {
    id: "MT002",
    roomId: "R103",
    title: "Thay bóng đèn",
    description: "Đèn phòng ngủ hỏng",
    reportedBy: "Housekeeping",
    assignedTo: "ST005",
    priority: "low",
    status: "completed",
    createdAt: "2025-01-14",
    completedAt: "2025-01-14",
  },
];

//Mock Staff
export const mockStaff = [
  { id: "ST001", name: "Nguyễn Văn Quản", email: "admin@hotel.com", phone: "0911111111", status: "active" },
  { id: "ST002", name: "Trần Thị Mai", email: "manager@hotel.com", phone: "0922222222", status: "active" },
  { id: "ST003", name: "Lê Văn Tân", email: "frontdesk@hotel.com", phone: "0933333333", status: "active" },
  { id: "ST004", name: "Phạm Thị Lan", email: "housekeeping@hotel.com", phone: "0944444444", status: "active" },
  { id: "ST005", name: "Hoàng Văn Kỹ", email: "technician@hotel.com", phone: "0955555555", status: "active" },
];