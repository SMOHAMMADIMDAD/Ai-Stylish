// lib/config.ts
export const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://127.0.0.1:8000';

  const hostname = window.location.hostname;

  // Running locally on PC
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }

  // Running on mobile via local Wi-Fi
  return 'http://192.168.31.169:8000'; // your PC IP (change if needed)
};
