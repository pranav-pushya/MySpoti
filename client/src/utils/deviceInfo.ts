/**
 * Utility to identify and name the current device for Spotify Connect style cross-device sync.
 */

export interface LocalDeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
}

export const getLocalDeviceInfo = (): LocalDeviceInfo => {
  // 1. Persistent Device ID
  let deviceId = localStorage.getItem('myspoti_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem('myspoti_device_id', deviceId);
  }

  // 2. Detect Device Type & OS
  const ua = window.navigator.userAgent.toLowerCase();
  const width = window.innerWidth;

  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  let deviceName = 'Desktop Web';

  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua) || (width >= 640 && width <= 1024 && 'ontouchstart' in window)) {
    deviceType = 'tablet';
    if (/ipad/i.test(ua)) {
      deviceName = 'iPad';
    } else if (/android/i.test(ua)) {
      deviceName = 'Android Tablet';
    } else {
      deviceName = 'Tablet Device';
    }
  } else if (/iphone|ipod|android.*mobile|mobile/i.test(ua) || width < 640) {
    deviceType = 'mobile';
    if (/iphone/i.test(ua)) {
      deviceName = 'iPhone';
    } else if (/android/i.test(ua)) {
      deviceName = 'Android Phone';
    } else {
      deviceName = 'Mobile Device';
    }
  } else {
    deviceType = 'desktop';
    if (/macintosh|mac os x/i.test(ua)) {
      deviceName = 'MacBook';
    } else if (/windows/i.test(ua)) {
      deviceName = 'Windows PC';
    } else if (/linux/i.test(ua)) {
      deviceName = 'Linux PC';
    } else {
      deviceName = 'Web Browser';
    }
  }

  return { deviceId, deviceName, deviceType };
};
