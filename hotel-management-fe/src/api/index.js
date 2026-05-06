// Export all API modules for easier importing
export { default as settingApi } from './settingApi';
export { default as authApi } from './authApi';
export { default as customerApi } from './customerApi';
export { default as roomApi } from './roomApi';
export { default as bookingApi } from './bookingApi';
export { default as serviceApi } from './serviceApi';
export { default as invoiceApi } from './invoiceApi';
export { default as itemApi } from './itemApi';
export { default as positionApi } from './positionApi';
export { default as staffApi } from './staffApi';
export { default as accountApi } from './accountApi';
export { default as paymentMethodApi } from './paymentMethodApi';
export { default as rentalReceiptApi } from './rentalReceiptApi';
export { default as maintenanceApi } from './maintenanceApi';
export { default as serviceUsageApi } from './serviceUsageApi';
export { default as bookingHistoryApi } from './bookingHistoryApi';
export { default as serviceUsageHistoryApi } from './serviceUsageHistoryApi';
export { default as datPhongApi } from './datPhongApi';
export { default as roomTypeApi } from './roomTypeApi';
export { default as notificationApi } from './notificationApi';

export { default as stripeApi } from './stripeApi';

// Export utility functions
export {
  API_BASE_URL,
  getToken,
  getHeaders,
  handleApiError,
  apiCall,
  isLoggedIn,
  logout,
  getRole
} from './apiUtils';



