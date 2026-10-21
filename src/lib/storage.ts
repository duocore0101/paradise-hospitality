import fs from 'fs';
import path from 'path';
import { GuestRegistration } from '@/types/checkin';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'checkins.json');

// Ensure directory exists
function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    // Initial sample guest to make client demo immediately interactive
    const initialData: GuestRegistration[] = [
      {
        id: 'chk-045',
        srNo: '045',
        date: new Date().toISOString().split('T')[0],
        name: 'Rahul Sharma',
        address: '42 MG Road, Bangalore, Karnataka',
        mobile: '+91 98765 43210',
        checkInDate: new Date().toISOString().split('T')[0],
        checkInTime: '12:30 PM',
        checkOutDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        checkOutTime: '11:00 AM',
        adults: 2,
        children: 1,
        nightsStay: 2,
        vehicleNo: 'KA-01-AB-1234',
        nationality: 'Indian',
        email: 'rahul.sharma@example.com',
        roomNo: '204',
        advanceAmount: 3000,
        receiptNo: 'REC-1089',
        checkoutAgreement: true,
        status: 'Checked In',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ];
    fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export function getCheckins(): GuestRegistration[] {
  try {
    ensureDataFile();
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as GuestRegistration[];
  } catch (error) {
    console.error('Error reading checkins:', error);
    return [];
  }
}

export function saveCheckin(registration: GuestRegistration): GuestRegistration[] {
  ensureDataFile();
  const list = getCheckins();
  // Prepend so the newest check-in is at the top
  const updated = [registration, ...list];
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function updateCheckin(id: string, updates: Partial<GuestRegistration>): GuestRegistration[] {
  ensureDataFile();
  const list = getCheckins();
  const updated = list.map((item) => (item.id === id ? { ...item, ...updates } : item));
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

