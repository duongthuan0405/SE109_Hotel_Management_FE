import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import { AppLayout } from "./components/AppLayout";
import { CustomerLayout } from "./components/CustomerLayout";
import ChatBot from "./components/ChatBot";


// Pages
import Login from "./pages/Login";


// Admin pages
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Guests from "./pages/Guests";
import Invoices from "./pages/Invoices";
import Services from "./pages/Services";
import Staff from "./pages/Staff";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Maintenance from "./pages/Maintenance";
import Calendar from "./pages/Calendar";


// Customer pages
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerBooking from "./pages/customer/CustomerBooking";
import CustomerMyBookings from "./pages/customer/CustomerMyBookings";
import CustomerServices from "./pages/customer/CustomerServices";
import CustomerPayment from "./pages/customer/CustomerPayment";
import CustomerHistory from "./pages/customer/CustomerHistory";
import CustomerProfile from "./pages/customer/CustomerProfile";
import BookingSuccess from "./pages/customer/BookingSuccess";
import BookingCancel from "./pages/customer/BookingCancel";


const queryClient = new QueryClient();


/* =======================
   PROTECTED ROUTE (ROLE)
======================= */
const ProtectedRoute = ({ children, allowRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


  if (!token) return <Navigate to="/login" replace />;


  if (allowRoles && !allowRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }


  return children;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ===== LOGIN ===== */}
          <Route path="/login" element={<Login />} />


          {/* ===== ADMIN ===== */}
          <Route path="/" element={<Navigate to="/login" replace />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                allowRoles={[
                  "Admin",
                  "Manager",
                  "Receptionist",
                ]}
              >
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/rooms"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "MaintenanceStaff"]}>
                <AppLayout>
                  <Rooms />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/bookings"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "Receptionist"]}>
                <AppLayout>
                  <Bookings />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "Receptionist"]}>
                <AppLayout>
                  <Calendar />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/guests"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "Receptionist"]}>
                <AppLayout>
                  <Guests />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/invoices"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "Receptionist"]}>
                <AppLayout>
                  <Invoices />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/services"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "MaintenanceStaff"]}>
                <AppLayout>
                  <Services />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/maintenance"
            element={
              <ProtectedRoute allowRoles={["Admin", "Manager", "MaintenanceStaff"]}>
                <AppLayout>
                  <Maintenance />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/staff"
            element={
              <ProtectedRoute allowRoles={["Admin"]}>
                <AppLayout>
                  <Staff />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/settings"
            element={
              <ProtectedRoute allowRoles={["Admin"]}>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/reports"
            element={
              <ProtectedRoute allowRoles={["Admin"]}>
                <AppLayout>
                  <Reports />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/profile"
            element={
              <ProtectedRoute
                allowRoles={[
                  "Admin",
                  "Manager",
                  "Receptionist",
                ]}
              >
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />


          {/* ===== CUSTOMER ===== */}
          <Route path="/customer/register" element={<CustomerRegister />} />


          <Route
            path="/customer"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerDashboard />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />


          <Route
            path="/customer/booking"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerBooking />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/booking/success"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <BookingSuccess />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/booking/cancel"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <BookingCancel />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/my-bookings"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerMyBookings />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/services"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerServices />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/payment"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerPayment />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/history"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerHistory />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowRoles={["Customer"]}>
                <CustomerLayout>
                  <CustomerProfile />
                </CustomerLayout>
              </ProtectedRoute>
            }
          />


          {/* ===== FALLBACK ===== */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={5000} />
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;



