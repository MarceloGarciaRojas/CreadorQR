export type QRContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'phone' | 'whatsapp' | 'calendar';

export interface WifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  jobTitle: string;
  website: string;
  address: string;
}

export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

export interface PhoneData {
  phoneNumber: string;
}

export interface WhatsAppData {
  phoneNumber: string;
  message: string;
}

export interface CalendarData {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
}

export type ModuleShape = 'square' | 'rounded' | 'dots' | 'smooth';
export type EyeShape = 'square' | 'rounded' | 'circle';

export interface QRStyleOptions {
  fgColor: string;
  bgColor: string;
  eyeColor: string;
  moduleShape: ModuleShape;
  eyeShape: EyeShape;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  // Opciones del Logo central
  logoDataUrl?: string;
  logoSizePercent: number; // 10 a 30
  logoBgColor: string;
  logoBgShape: 'circle' | 'square' | 'rounded' | 'none';
  logoPadding: number;
}

export interface ScannedQRItem {
  id: string;
  content: string;
  type: string;
  scannedAt: number;
  note?: string;
}

export interface SavedQRCodeItem {
  id: string;
  title: string;
  content: string;
  contentType: QRContentType;
  styles: QRStyleOptions;
  createdAt: number;
  previewDataUrl: string;
}
