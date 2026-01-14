const API_URL = import.meta.env.MODE === 'development'
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000')
  : '';

export default API_URL;
