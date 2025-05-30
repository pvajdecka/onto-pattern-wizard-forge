
// Centralized API configuration
const getBackendUrl = () => {
  // Check if we're in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Production - use HTTPS with same domain
  if (window.location.protocol === 'https:') {
    return `https://${window.location.hostname}:8000`;
  }
  
  // Fallback to relative URLs for same-server deployment
  return '';
};

export const API_CONFIG = {
  BACKEND_URL: getBackendUrl()
};
