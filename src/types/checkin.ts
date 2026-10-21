export interface BillingItem {
  id: string;
  category: 'Room Tariff' | 'Food & Beverage' | 'Laundry' | 'Spa & Wellness' | 'Minibar' | 'Transportation' | 'Miscellaneous';
  description: string;
  amount: number;
  date: string;
}

export interface GuestRegistration {
  id: string;
  srNo: string;
  date: string;
  
  // Hotel Property Assignment
  hotelId?: string;
  hotelName?: string;

  // Lead & Source Information
  leadSource?: string;

  // Guest Details
  name: string;
  address: string;
  mobile: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  adults: number | string;
  children: number | string;
  nightsStay: number | string;
  vehicleNo: string;
  nationality: string;
  email: string;

  // Verification & Government ID Proof
  idProofType?: string;
  idProofNumber?: string;
  idProofFile?: string;
  idProofFileName?: string;

  // Office Use & Billing
  roomNo: string;
  roomRate?: number;
  advanceAmount: number | string;
  receiptNo: string;
  checkoutAgreement: boolean;

  // Comprehensive Hotel Billing Folio
  billingItems?: BillingItem[];
  discountAmount?: number;
  taxRate?: number; // e.g. 12% or 18% GST
  paymentMethod?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Partially Paid';
  invoiceNumber?: string;

  // Digital Signature
  signature?: string;
  signedAt?: string;

  // System fields
  status: 'Checked In' | 'Checked Out';
  createdAt: string;
}
