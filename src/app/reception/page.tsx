'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Mail,
  Home,
  Car,
  Globe,
  FileText,
  UploadCloud,
  Check,
  ShieldCheck,
  FileCheck,
  PenTool,
  Eraser,
  Printer,
  Sparkles,
  Hotel,
  AlertCircle,
  Eye,
  Trash2,
  Share2,
  CreditCard,
  BedDouble,
  Compass,
  Zap,
  Info,
  LogOut,
  Search,
  UserCheck,
  DoorClosed,
  RefreshCw,
  X,
  UserPlus,
  LayoutGrid,
  List,
  Receipt,
  Edit3,
  Plus,
  Calculator,
  Tag,
  DollarSign,
  Utensils,
  Coins
} from 'lucide-react';
import { GuestRegistration, BillingItem } from '@/types/checkin';
import { HOTELS_PORTFOLIO } from '@/data/hotels';

interface CheckinFormData {
  srNo: string;
  hotelId: string;
  hotelName: string;
  date: string;
  leadSource: string;
  name: string;
  mobile: string;
  email: string;
  nationality: string;
  address: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  nightsStay: number;
  adults: number;
  children: number;
  vehicleNo: string;
  idProofType: string;
  idProofNumber: string;
  idProofFile: string;
  idProofFileName: string;
  idProofFileType: string;
  roomNo: string;
  advanceAmount: string | number;
  paymentMethod: string;
  receiptNo: string;
  checkoutAgreement: boolean;
  signature: string;
}

const ID_TYPES = [
  'Aadhaar Card',
  'Passport',
  'Driving License',
  'Voter ID Card',
  'National ID (Overseas)'
];

const AVAILABLE_ROOMS = [
  { no: '101', type: 'Deluxe', rate: 2500 },
  { no: '102', type: 'Deluxe', rate: 2500 },
  { no: '201', type: 'Super Deluxe', rate: 3500 },
  { no: '204', type: 'Super Deluxe', rate: 4500 },
  { no: '301', type: 'Executive Suite', rate: 6500 },
  { no: '302', type: 'Executive Suite', rate: 6500 },
  { no: '401', type: 'Presidential Suite', rate: 12500 },
  { no: '402', type: 'Presidential Suite', rate: 12500 },
];

const CHARGE_CATEGORIES = [
  'Food & Beverage',
  'Laundry',
  'Spa & Wellness',
  'Minibar',
  'Transportation',
  'Miscellaneous'
];

function ReceptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: 'checkin' | 'checkout' | 'billing' =
    tabParam === 'checkout' ? 'checkout' :
    tabParam === 'billing' ? 'billing' : 'checkin';

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Check-In State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ name: string; roomNo: string; srNo: string; leadSource: string; signature?: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<CheckinFormData>({
    srNo: '051',
    hotelId: 'treebo-jp-cottage',
    hotelName: 'Treebo Jp Cottage',
    date: today,
    leadSource: 'Walk-in Direct',
    name: '',
    mobile: '',
    email: '',
    nationality: 'Indian',
    address: '',
    checkInDate: today,
    checkInTime: '12:00 PM',
    checkOutDate: tomorrow,
    checkOutTime: '11:00 AM',
    nightsStay: 1,
    adults: 1,
    children: 0,
    vehicleNo: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    idProofFile: '',
    idProofFileName: '',
    idProofFileType: '',
    roomNo: '',
    advanceAmount: '',
    paymentMethod: 'UPI / QR Code',
    receiptNo: 'REC-051',
    checkoutAgreement: true,
    signature: '',
  });

  // Check-Out & Directory State
  const [allCheckins, setAllCheckins] = useState<GuestRegistration[]>([]);
  const [checkoutSearch, setCheckoutSearch] = useState('');
  const [checkoutView, setCheckoutView] = useState<'cards' | 'table'>('cards');
  const [selectedForCheckout, setSelectedForCheckout] = useState<GuestRegistration | null>(null);
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loadingCheckins, setLoadingCheckins] = useState(false);

  // Edit Guest Modal State
  const [editingGuest, setEditingGuest] = useState<GuestRegistration | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<GuestRegistration>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Billing & Invoicing State
  const [selectedBillingGuestId, setSelectedBillingGuestId] = useState<string>('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [newCharge, setNewCharge] = useState<{ category: string; description: string; amount: string }>({
    category: 'Food & Beverage',
    description: '',
    amount: '',
  });
  const [taxRateSetting, setTaxRateSetting] = useState<number>(12); // 12% or 18% GST
  const [discountInput, setDiscountInput] = useState<number>(0);
  const [paymentMethodSelected, setPaymentMethodSelected] = useState<string>('UPI / QR Code');

  // Canvas ref for signature pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Fetch checkins list
  const fetchCheckinsList = async () => {
    setLoadingCheckins(true);
    try {
      const res = await fetch('/api/checkins', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        let list: GuestRegistration[] = json.data;

        // Sync with browser localStorage backup to safeguard against fresh serverless cold-starts
        try {
          if (typeof window !== 'undefined') {
            const cachedStr = localStorage.getItem('paradise_guest_checkins_backup');
            if (cachedStr) {
              const cachedList: GuestRegistration[] = JSON.parse(cachedStr);
              if (Array.isArray(cachedList) && cachedList.length > 0) {
                const serverIds = new Set(list.map((g) => g.id));
                const localOnly = cachedList.filter((g) => !serverIds.has(g.id));
                if (localOnly.length > 0) {
                  list = [...localOnly, ...list];
                }
              }
            }
            localStorage.setItem('paradise_guest_checkins_backup', JSON.stringify(list));
          }
        } catch (e) {
          // ignore localStorage errors
        }

        setAllCheckins(list);
        if (!selectedBillingGuestId && list.length > 0) {
          const firstInHouse = list.find((g: GuestRegistration) => g.status === 'Checked In');
          if (firstInHouse) setSelectedBillingGuestId(firstInHouse.id);
        }
        if (json.nextSrNo) {
          setFormData((prev) => ({
            ...prev,
            srNo: json.nextSrNo,
            receiptNo: `REC-${json.nextSrNo}`,
          }));
        }
      }
    } catch (err) {
      // Local fallback from browser storage if network glitch
      try {
        if (typeof window !== 'undefined') {
          const cachedStr = localStorage.getItem('paradise_guest_checkins_backup');
          if (cachedStr) {
            const cachedList: GuestRegistration[] = JSON.parse(cachedStr);
            if (Array.isArray(cachedList) && cachedList.length > 0) {
              setAllCheckins(cachedList);
            }
          }
        }
      } catch (e) {
        // ignore
      }
    } finally {
      setLoadingCheckins(false);
    }
  };

  useEffect(() => {
    fetchCheckinsList();
  }, [activeTab]);

  // Filter in-house guests
  const inHouseGuests = useMemo(() => {
    const list = allCheckins.filter((g) => g.status === 'Checked In');
    if (!checkoutSearch.trim()) return list;
    const query = checkoutSearch.toLowerCase();
    return list.filter(
      (g) =>
        g.roomNo?.toLowerCase().includes(query) ||
        g.name?.toLowerCase().includes(query) ||
        g.mobile?.toLowerCase().includes(query) ||
        g.srNo?.toLowerCase().includes(query)
    );
  }, [allCheckins, checkoutSearch]);

  const inHouseTotalCount = useMemo(() => {
    return allCheckins.filter((g) => g.status === 'Checked In').length;
  }, [allCheckins]);

  // Active Billing Guest
  const activeBillingGuest = useMemo(() => {
    return allCheckins.find((g) => g.id === selectedBillingGuestId) || inHouseGuests[0] || allCheckins[0] || null;
  }, [allCheckins, selectedBillingGuestId, inHouseGuests]);

  // Billing Calculation for active selected guest
  const billingCalculations = useMemo(() => {
    if (!activeBillingGuest) {
      return {
        roomRate: 3500,
        nights: 1,
        roomTotal: 0,
        itemsTotal: 0,
        subtotal: 0,
        gstPercent: 12,
        gstAmount: 0,
        cgst: 0,
        sgst: 0,
        grandTotal: 0,
        advance: 0,
        netPayable: 0,
      };
    }

    const roomRate = activeBillingGuest.roomRate || (AVAILABLE_ROOMS.find((r) => r.no === activeBillingGuest.roomNo)?.rate || 3500);
    const nights = Number(activeBillingGuest.nightsStay) || 1;
    const roomTotal = roomRate * nights;

    const itemsTotal = (activeBillingGuest.billingItems || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const subtotal = roomTotal + itemsTotal - (discountInput || 0);

    const gstPercent = taxRateSetting || 12;
    const gstAmount = Math.round((subtotal * gstPercent) / 100);
    const cgst = Math.round(gstAmount / 2);
    const sgst = Math.round(gstAmount / 2);

    const grandTotal = subtotal + gstAmount;
    const advance = Number(activeBillingGuest.advanceAmount || 0);
    const netPayable = Math.max(grandTotal - advance, 0);

    return {
      roomRate,
      nights,
      roomTotal,
      itemsTotal,
      subtotal,
      gstPercent,
      gstAmount,
      cgst,
      sgst,
      grandTotal,
      advance,
      netPayable,
    };
  }, [activeBillingGuest, taxRateSetting, discountInput]);

  // Open Edit Guest Modal
  const handleOpenEditGuest = (guest: GuestRegistration) => {
    setEditingGuest(guest);
    setEditFormData({ ...guest });
  };

  // Save Edited Guest details
  const handleSaveEditGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    setEditSaving(true);
    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGuest.id,
          ...editFormData,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setAllCheckins((prev) =>
          prev.map((item) => (item.id === editingGuest.id ? { ...item, ...editFormData } : item))
        );
        setEditingGuest(null);
        setToastMessage(`Guest details for Room ${editFormData.roomNo || editingGuest.roomNo} updated successfully!`);
        setTimeout(() => setToastMessage(null), 5000);
      } else {
        alert(result.message || 'Error updating guest record.');
      }
    } catch (err) {
      alert('Network error while updating guest.');
    } finally {
      setEditSaving(false);
    }
  };

  // Add new Charge Item to active guest folio
  const handleAddNewCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBillingGuest || !newCharge.description || !newCharge.amount) return;

    const newItem: BillingItem = {
      id: 'chg-' + Date.now(),
      category: newCharge.category as any,
      description: newCharge.description.trim(),
      amount: parseFloat(newCharge.amount) || 0,
      date: new Date().toISOString().split('T')[0],
    };

    const currentItems = activeBillingGuest.billingItems || [];
    const updatedItems = [...currentItems, newItem];

    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBillingGuest.id,
          billingItems: updatedItems,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setAllCheckins((prev) =>
          prev.map((item) => (item.id === activeBillingGuest.id ? { ...item, billingItems: updatedItems } : item))
        );
        setShowAddChargeModal(false);
        setNewCharge({ category: 'Food & Beverage', description: '', amount: '' });
        setToastMessage(`Charge of ₹${newItem.amount} added to Room ${activeBillingGuest.roomNo} folio.`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      alert('Failed to add charge to guest bill.');
    }
  };

  // Remove charge item from folio
  const handleDeleteChargeItem = async (itemId: string) => {
    if (!activeBillingGuest) return;
    const currentItems = activeBillingGuest.billingItems || [];
    const updatedItems = currentItems.filter((i) => i.id !== itemId);

    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBillingGuest.id,
          billingItems: updatedItems,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setAllCheckins((prev) =>
          prev.map((item) => (item.id === activeBillingGuest.id ? { ...item, billingItems: updatedItems } : item))
        );
      }
    } catch (err) {
      alert('Failed to remove charge item.');
    }
  };

  // Settle Bill / Mark Paid
  const handleSettleBill = async () => {
    if (!activeBillingGuest) return;
    const invNum = activeBillingGuest.invoiceNumber || `PH-INV-${activeBillingGuest.srNo}-${Date.now().toString().slice(-4)}`;

    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeBillingGuest.id,
          paymentStatus: 'Paid',
          paymentMethod: paymentMethodSelected,
          invoiceNumber: invNum,
          discountAmount: discountInput,
          taxRate: taxRateSetting,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setAllCheckins((prev) =>
          prev.map((item) =>
            item.id === activeBillingGuest.id
              ? {
                  ...item,
                  paymentStatus: 'Paid',
                  paymentMethod: paymentMethodSelected,
                  invoiceNumber: invNum,
                  discountAmount: discountInput,
                  taxRate: taxRateSetting,
                }
              : item
          )
        );
        setToastMessage(`Folio for Room ${activeBillingGuest.roomNo} settled and marked PAID in full!`);
        setTimeout(() => setToastMessage(null), 5000);
      }
    } catch (err) {
      alert('Error settling bill.');
    }
  };

  // Handle Guest Check-Out API Call
  const handleConfirmCheckout = async (guest: GuestRegistration) => {
    setCheckoutProcessing(true);
    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guest.id, status: 'Checked Out' }),
      });
      const result = await res.json();

      if (result.success) {
        setAllCheckins((prev) =>
          prev.map((item) => (item.id === guest.id ? { ...item, status: 'Checked Out' } : item))
        );
        setSelectedForCheckout(null);
        setToastMessage(`Room ${guest.roomNo} (${guest.name}) has been checked out successfully!`);
        setTimeout(() => setToastMessage(null), 6000);
        window.dispatchEvent(new Event('guest-checked-in'));
      }
    } catch (err) {
      alert('Network error while processing checkout.');
    } finally {
      setCheckoutProcessing(false);
    }
  };

  // Auto calculate nights
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate).getTime();
      const end = new Date(formData.checkOutDate).getTime();
      const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24));
      if (diffDays > 0) {
        setFormData((prev) => ({ ...prev, nightsStay: diffDays }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Signature canvas setup
  useEffect(() => {
    if (activeTab === 'checkin' && currentStep === 4 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (formData.signature) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
            setHasSignature(true);
          };
          img.src = formData.signature;
        }
      }
    }
  }, [activeTab, currentStep, formData.signature]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQuickDemoFill = () => {
    const sampleAadhaar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><rect y="0" width="400" height="30" fill="%23059669"/><text x="20" y="20" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION</text><rect x="30" y="55" width="80" height="100" rx="6" fill="%23e2e8f0"/><circle cx="70" cy="90" r="22" fill="%2394a3b8"/><path d="M45 140 Q70 120 95 140" fill="%2394a3b8"/><text x="130" y="75" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f172a">VIKRAM MALHOTRA</text><text x="130" y="98" font-family="sans-serif" font-size="11" fill="%2364748b">DOB: 18/06/1990 | Gender: M</text><text x="130" y="120" font-family="sans-serif" font-size="11" fill="%2364748b">Aadhaar No: XXXX-XXXX-4589</text><rect x="130" y="140" width="180" height="20" rx="4" fill="%23ecfdf5"/><text x="140" y="154" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23059669">VERIFIED CITIZEN RECORD</text></svg>`;

    setFormData((prev) => ({
      ...prev,
      name: 'Vikram Malhotra',
      leadSource: 'MakeMyTrip',
      mobile: '+91 98200 45678',
      email: 'vikram.malhotra@luxury.com',
      nationality: 'Indian',
      address: '24 Marine Drive, Nariman Point, Mumbai',
      checkInDate: today,
      checkInTime: '01:30 PM',
      checkOutDate: tomorrow,
      checkOutTime: '11:00 AM',
      adults: 2,
      children: 0,
      nightsStay: 1,
      vehicleNo: 'MH-01-AB-9988',
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-4589',
      idProofFile: sampleAadhaar,
      idProofFileName: 'aadhaar_vikram_malhotra.svg',
      idProofFileType: 'image',
      roomNo: '204',
      advanceAmount: '5000',
      receiptNo: `REC-${prev.srNo}`,
      checkoutAgreement: true,
    }));
    setErrorMsg('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (!isPdf && !isImage) {
      setErrorMsg('Please upload a valid image file (JPG, PNG) or PDF document.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        idProofFile: reader.result as string,
        idProofFileName: file.name,
        idProofFileType: isPdf ? 'pdf' : 'image',
      }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSampleIdUpload = () => {
    const sampleAadhaar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240"><rect width="400" height="240" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><rect y="0" width="400" height="30" fill="%23059669"/><text x="20" y="20" fill="white" font-family="sans-serif" font-size="12" font-weight="bold">GOVERNMENT OF INDIA • UNIQUE IDENTIFICATION</text><rect x="30" y="55" width="80" height="100" rx="6" fill="%23e2e8f0"/><circle cx="70" cy="90" r="22" fill="%2394a3b8"/><path d="M45 140 Q70 120 95 140" fill="%2394a3b8"/><text x="130" y="75" font-family="sans-serif" font-size="14" font-weight="bold" fill="%230f172a">${formData.name || 'GUEST IDENTIFICATION'}</text><text x="130" y="98" font-family="sans-serif" font-size="11" fill="%2364748b">DOB: 15/08/1992 | Gender: M</text><text x="130" y="120" font-family="sans-serif" font-size="11" fill="%2364748b">Aadhaar No: XXXX-XXXX-8924</text><rect x="130" y="140" width="180" height="20" rx="4" fill="%23ecfdf5"/><text x="140" y="154" font-family="sans-serif" font-size="10" font-weight="bold" fill="%23059669">VERIFIED CITIZEN RECORD</text></svg>`;

    setFormData((prev) => ({
      ...prev,
      idProofType: 'Aadhaar Card',
      idProofNumber: 'XXXX-XXXX-8924',
      idProofFile: sampleAadhaar,
      idProofFileName: 'aadhaar_card_verified.svg',
      idProofFileType: 'image',
    }));
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFormData((prev) => ({
        ...prev,
        signature: canvas.toDataURL('image/png'),
      }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
      setFormData((prev) => ({ ...prev, signature: '' }));
    }
  };

  const adoptSampleSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 34px "Playfair Display", "Brush Script MT", cursive';
    ctx.fillStyle = '#0f172a';
    const displayName = formData.name || 'Rahul Sharma';
    ctx.fillText(displayName, 30, 80);

    ctx.beginPath();
    ctx.moveTo(25, 95);
    ctx.bezierCurveTo(90, 85, 200, 115, 280, 92);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e3a8a';
    ctx.stroke();

    setHasSignature(true);
    setFormData((prev) => ({
      ...prev,
      signature: canvas.toDataURL('image/png'),
    }));
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.name.trim()) {
        setErrorMsg('Please enter Guest Full Name.');
        return false;
      }
      if (!formData.mobile.trim()) {
        setErrorMsg('Please enter Guest Mobile Phone Number.');
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!formData.checkInDate || !formData.checkOutDate) {
        setErrorMsg('Please select valid check-in and check-out dates.');
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!formData.idProofType) {
        setErrorMsg('Please select Government ID Type.');
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!formData.roomNo.trim()) {
        setErrorMsg('Please assign a room number for the guest.');
        return false;
      }
      if (!formData.checkoutAgreement) {
        setErrorMsg('Please acknowledge the hotel check-out policy.');
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (result.success) {
        // Save to browser localStorage backup immediately
        try {
          if (typeof window !== 'undefined') {
            const cachedStr = localStorage.getItem('paradise_guest_checkins_backup');
            const cachedList: GuestRegistration[] = cachedStr ? JSON.parse(cachedStr) : [];
            const newRec = result.record || {
              ...formData,
              id: 'chk-' + Date.now(),
              status: 'Checked In',
              createdAt: new Date().toISOString(),
            };
            const updated = [newRec, ...cachedList.filter((c) => c.id !== newRec.id)];
            localStorage.setItem('paradise_guest_checkins_backup', JSON.stringify(updated));
          }
        } catch (e) {
          // ignore localStorage error
        }

        setSuccessData({
          name: formData.name,
          roomNo: formData.roomNo,
          srNo: formData.srNo,
          leadSource: formData.leadSource,
          signature: formData.signature,
        });

        fetchCheckinsList();
        window.dispatchEvent(new Event('guest-checked-in'));

        const nextNum = String(parseInt(formData.srNo.replace(/\D/g, '') || '0', 10) + 1).padStart(3, '0');
        setFormData({
          srNo: nextNum,
          hotelId: formData.hotelId || 'treebo-jp-cottage',
          hotelName: formData.hotelName || 'Treebo Jp Cottage',
          date: today,
          leadSource: 'Walk-in Direct',
          name: '',
          mobile: '',
          email: '',
          nationality: 'Indian',
          address: '',
          checkInDate: today,
          checkInTime: '12:00 PM',
          checkOutDate: tomorrow,
          checkOutTime: '11:00 AM',
          nightsStay: 1,
          adults: 1,
          children: 0,
          vehicleNo: '',
          idProofType: 'Aadhaar Card',
          idProofNumber: '',
          idProofFile: '',
          idProofFileName: '',
          idProofFileType: '',
          roomNo: '',
          advanceAmount: '',
          paymentMethod: 'UPI / QR Code',
          receiptNo: `REC-${nextNum}`,
          checkoutAgreement: true,
          signature: '',
        });

        setCurrentStep(1);
        setHasSignature(false);
      } else {
        setErrorMsg(result.message || 'Error saving check-in.');
      }
    } catch (err) {
      setErrorMsg('Network error. Unable to record guest check-in.');
    } finally {
      setLoading(false);
    }
  };

  const stepItems = [
    { num: 1, title: 'Guest Identity & Source', desc: 'Guest profile, lead channel & contact details' },
    { num: 2, title: 'Stay Itinerary & Stayers', desc: 'Check-in/out dates, guests & vehicle details' },
    { num: 3, title: 'Government ID Proof', desc: 'Upload photo or PDF of government identification' },
    { num: 4, title: 'Room, Billing & Signature', desc: 'Room allocation, advance amount & guest signature' },
  ];

  const progressPercentage = Math.round((currentStep / 4) * 100);

  return (
    <main className="main-container multi-step-page">
      {/* Front Desk Modern Executive Header Banner */}
      <div className="desk-top-banner-luxury">
        <div className="banner-left-brand">
          <div className="banner-gold-crest">
            <Hotel size={22} />
          </div>
          <div className="banner-title-block">
            <div className="banner-status-tag">
              <span className="live-dot" />
              <span>
                {activeTab === 'checkin' && 'LIVE FRONT DESK TERMINAL • CHECK-IN & REGISTRATION'}
                {activeTab === 'checkout' && 'LIVE FRONT DESK TERMINAL • IN-HOUSE GUESTS & CHECK-OUT'}
                {activeTab === 'billing' && 'LIVE FRONT DESK TERMINAL • BILLING, FOLIOS & TAX INVOICES'}
              </span>
            </div>
            <h1>
              {activeTab === 'checkin' && 'Guest Registration & Room Allocation'}
              {activeTab === 'checkout' && 'In-House Guests & Departure Desk'}
              {activeTab === 'billing' && 'Hotel Billing, Room Folios & Invoices'}
            </h1>
            <p>
              {activeTab === 'checkin' && 'Paradise Hospitality Hotel & Luxury Suites • Multi-Step Digital Check-In Form'}
              {activeTab === 'checkout' && 'Paradise Hospitality Hotel & Luxury Suites • Room Key Return & Departure Processing'}
              {activeTab === 'billing' && 'Paradise Hospitality Hotel & Luxury Suites • Room Tariffs, Extra Services & Official Tax Invoices'}
            </p>
          </div>
        </div>

        <div className="banner-right-actions">
          {activeTab === 'checkin' && (
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="btn-demo-autofill"
              title="Instant 1-Click Prefill of realistic guest data for fast prototype testing"
            >
              <Zap size={14} className="text-amber-400" />
              <span>⚡ Quick Demo Fill</span>
            </button>
          )}

          <Link href="/" className="btn-portal-exit" title="Exit to Public Website">
            <Home size={14} />
            <span>Hotel Website / Logout</span>
          </Link>
        </div>
      </div>

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="alert-success-luxury">
          <div className="alert-icon-wrap">
            <CheckCircle2 size={24} />
          </div>
          <div className="alert-text-body">
            <strong>Operation Successful!</strong>
            <p>{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="toast-dismiss"
            style={{ color: '#ffffff', opacity: 0.8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: GUEST REGISTRATION / CHECK-IN                                      */}
      {/* ========================================================================= */}
      {activeTab === 'checkin' && (
        <>
          {successData && (
            <div className="alert-success-luxury">
              <div className="alert-icon-wrap">
                <CheckCircle2 size={24} />
              </div>
              <div className="alert-text-body">
                <strong>Guest Registered &amp; Checked In Successfully!</strong>
                <p>
                  <strong>{successData.name}</strong> assigned to Room <strong>{successData.roomNo}</strong> (Slip #{successData.srNo} • Channel: {successData.leadSource}).
                  {successData.signature && <span> Official digital signature recorded.</span>}
                </p>
              </div>
              <button
                onClick={() => setSuccessData(null)}
                className="btn-alert-action"
              >
                <span>Register Next Guest</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="form-error-toast-luxury">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} className="toast-dismiss">✕</button>
            </div>
          )}

          <div className="stepper-card-luxury">
            {/* LEFT SIDEBAR: TIMELINE STEPPER */}
            <aside className="stepper-sidebar-luxury">
              <div className="stepper-header-luxury">
                <div className="stepper-tag-row">
                  <span className="stepper-title-badge">REGISTRATION FLOW</span>
                  <span className="stepper-percentage-badge">{progressPercentage}% DONE</span>
                </div>
                <div className="stepper-progress-bar-track">
                  <div 
                    className="stepper-progress-bar-fill"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="stepper-counter-text">
                  Step <strong>{currentStep}</strong> of <strong>4</strong>
                </div>
              </div>

              <div className="stepper-items-track">
                {stepItems.map((step, index) => {
                  const isCompleted = currentStep > step.num;
                  const isActive = currentStep === step.num;

                  return (
                    <div 
                      key={step.num} 
                      className={`stepper-item-row-luxury ${isActive ? 'row-active' : ''}`}
                    >
                      <div className="stepper-node-col">
                        <div
                          className={`stepper-node-circle ${
                            isCompleted ? 'node-completed' : isActive ? 'node-active' : 'node-pending'
                          }`}
                          onClick={() => { if (isCompleted) setCurrentStep(step.num); }}
                          title={isCompleted ? 'Click to revisit' : undefined}
                          style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                        >
                          {isCompleted ? (
                            <div className="node-check-icon"><Check size={14} strokeWidth={3} /></div>
                          ) : isActive ? (
                            <div className="node-active-ring-box"><span className="node-active-dot" /></div>
                          ) : (
                            <div className="node-pending-ring" />
                          )}
                        </div>

                        {index < stepItems.length - 1 && (
                          <div className={`stepper-connector-line ${currentStep > step.num ? 'connector-done' : ''}`} />
                        )}
                      </div>

                      <div
                        className={`stepper-label-content ${isActive ? 'label-active' : ''}`}
                        onClick={() => { if (isCompleted) setCurrentStep(step.num); }}
                        style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                      >
                        <div className="stepper-step-number">STEP 0{step.num}</div>
                        <h3 className="stepper-title">{step.title}</h3>
                        <p className="stepper-desc">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="stepper-summary-card-luxury">
                <div className="summary-card-header">
                  <Sparkles size={13} className="text-amber-500" />
                  <span>TERMINAL STATUS</span>
                </div>
                <div className="summary-info-grid">
                  <div className="summary-row">
                    <span>Slip Number:</span>
                    <strong className="text-blue">#{formData.srNo}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Channel:</span>
                    <strong className="text-emerald">{formData.leadSource}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Room:</span>
                    <strong className="text-amber">{formData.roomNo ? `Room ${formData.roomNo}` : 'Pending'}</strong>
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT STEP PANEL */}
            <section className="stepper-panel-luxury">
              <div className="step-panel-header-luxury">
                <div>
                  <div className="step-counter-pill">
                    <span>STEP {currentStep} OF 4</span>
                  </div>
                  <h2 className="step-title-luxury">{stepItems[currentStep - 1].title}</h2>
                  <p className="step-desc-luxury">{stepItems[currentStep - 1].desc}</p>
                </div>

                <div className="step-header-meta-badge">
                  <div className="meta-badge-item">
                    <Calendar size={13} />
                    <span>Date: <strong>{formData.date}</strong></span>
                  </div>
                  <div className="meta-badge-sep" />
                  <div className="meta-badge-item">
                    <FileText size={13} />
                    <span>Sr. No: <strong>#{formData.srNo}</strong></span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="step-form-body-luxury">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <div className="step-pane-animated">
                    <div className="form-field-group" style={{ marginBottom: '1.15rem' }}>
                      <label htmlFor="hotelId" className="field-label-luxury">
                        <Hotel size={14} className="field-icon-blue" />
                        <span>Select Hotel Property <span className="star-required">*</span></span>
                      </label>
                      <select
                        id="hotelId"
                        name="hotelId"
                        value={formData.hotelId}
                        onChange={(e) => {
                          const chosen = HOTELS_PORTFOLIO.find((h) => h.id === e.target.value);
                          setFormData({
                            ...formData,
                            hotelId: e.target.value,
                            hotelName: chosen ? chosen.name : 'Treebo Jp Cottage',
                          });
                        }}
                        className="select-field-luxury"
                      >
                        {HOTELS_PORTFOLIO.map((h) => (
                          <option key={h.id} value={h.id}>
                            🏨 {h.name} ({h.location}, {h.city})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label htmlFor="name" className="field-label-luxury">
                          <User size={14} className="field-icon-blue" />
                          <span>Guest Full Name <span className="star-required">*</span></span>
                        </label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          className="input-field-luxury"
                          required
                          autoFocus
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="leadSource" className="field-label-luxury">
                          <Compass size={14} className="field-icon-blue" />
                          <span>Lead Acquisition Source <span className="star-required">*</span></span>
                        </label>
                        <select
                          id="leadSource"
                          name="leadSource"
                          value={formData.leadSource}
                          onChange={handleChange}
                          className="select-field-luxury"
                        >
                          <option value="Walk-in Direct">🚪 Walk-in Direct (Front Desk)</option>
                          <option value="Booking.com">🌐 Booking.com (OTA)</option>
                          <option value="MakeMyTrip">🇮🇳 MakeMyTrip (OTA)</option>
                          <option value="Agoda">🌏 Agoda (Global OTA)</option>
                          <option value="Airbnb">🏡 Airbnb (Vacation Rental)</option>
                          <option value="Website Direct">✨ Website Direct (Paradise Portal)</option>
                          <option value="Corporate Partner">🏢 Corporate Partner (Business)</option>
                          <option value="Phone Call / Direct">📞 Phone Call / Direct Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label htmlFor="mobile" className="field-label-luxury">
                          <Phone size={14} className="field-icon-blue" />
                          <span>Mobile Phone Number <span className="star-required">*</span></span>
                        </label>
                        <input
                          id="mobile"
                          type="tel"
                          name="mobile"
                          placeholder="e.g. +91 98765 43210"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="input-field-luxury"
                          required
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="email" className="field-label-luxury">
                          <Mail size={14} className="field-icon-blue" />
                          <span>Email Address</span>
                        </label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          placeholder="guest@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label htmlFor="nationality" className="field-label-luxury">
                          <Globe size={14} className="field-icon-blue" />
                          <span>Nationality</span>
                        </label>
                        <input
                          id="nationality"
                          type="text"
                          name="nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          placeholder="e.g. Indian / American"
                          className="input-field-luxury"
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="address" className="field-label-luxury">
                          <MapPin size={14} className="field-icon-blue" />
                          <span>Residential City &amp; Address</span>
                        </label>
                        <input
                          id="address"
                          type="text"
                          name="address"
                          placeholder="e.g. 42 MG Road, Bangalore, Karnataka"
                          value={formData.address}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>
                    </div>

                    <div className="form-info-tip-luxury">
                      <Info size={16} />
                      <span>
                        Guest profiles are automatically synchronized with Executive Hub for instant occupancy &amp; folio tracking.
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="step-pane-animated">
                    <div className="itinerary-banner-luxury">
                      <div className="itinerary-icon-wrap">
                        <Calendar size={20} />
                      </div>
                      <div className="itinerary-text">
                        <strong>Total Duration: {formData.nightsStay} Night{formData.nightsStay > 1 ? 's' : ''} Stay</strong>
                        <span>Check-in: {formData.checkInDate} ({formData.checkInTime}) ➔ Check-out: {formData.checkOutDate} ({formData.checkOutTime})</span>
                      </div>
                    </div>

                    <div className="form-grid-4" style={{ marginTop: '1.25rem' }}>
                      <div className="form-field-group">
                        <label htmlFor="checkInDate" className="field-label-luxury">
                          <Calendar size={14} /> Check In Date
                        </label>
                        <input
                          id="checkInDate"
                          type="date"
                          name="checkInDate"
                          value={formData.checkInDate}
                          onChange={handleChange}
                          className="input-field-luxury"
                          required
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="checkInTime" className="field-label-luxury">
                          <Clock size={14} /> Check In Time
                        </label>
                        <input
                          id="checkInTime"
                          type="text"
                          name="checkInTime"
                          value={formData.checkInTime}
                          onChange={handleChange}
                          placeholder="12:00 PM"
                          className="input-field-luxury"
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="checkOutDate" className="field-label-luxury">
                          <Calendar size={14} /> Check Out Date
                        </label>
                        <input
                          id="checkOutDate"
                          type="date"
                          name="checkOutDate"
                          value={formData.checkOutDate}
                          onChange={handleChange}
                          className="input-field-luxury"
                          required
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="checkOutTime" className="field-label-luxury">
                          <Clock size={14} /> Check Out Time
                        </label>
                        <input
                          id="checkOutTime"
                          type="text"
                          name="checkOutTime"
                          value={formData.checkOutTime}
                          onChange={handleChange}
                          placeholder="11:00 AM"
                          className="input-field-luxury"
                        />
                      </div>
                    </div>

                    <div className="form-grid-3">
                      <div className="form-field-group">
                        <label htmlFor="adults" className="field-label-luxury">
                          <User size={14} /> Adults (12+ yrs)
                        </label>
                        <input
                          id="adults"
                          type="number"
                          name="adults"
                          min={1}
                          max={10}
                          value={formData.adults}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="children" className="field-label-luxury">
                          <User size={14} /> Children
                        </label>
                        <input
                          id="children"
                          type="number"
                          name="children"
                          min={0}
                          max={8}
                          value={formData.children}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="vehicleNo" className="field-label-luxury">
                          <Car size={14} /> Vehicle No.
                        </label>
                        <input
                          id="vehicleNo"
                          type="text"
                          name="vehicleNo"
                          placeholder="e.g. MH-02-CD-5678"
                          value={formData.vehicleNo}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="step-pane-animated">
                    <div className="form-grid-2">
                      <div className="form-field-group">
                        <label htmlFor="idProofType" className="field-label-luxury">
                          <ShieldCheck size={14} className="field-icon-blue" />
                          <span>Government ID Type <span className="star-required">*</span></span>
                        </label>
                        <select
                          id="idProofType"
                          name="idProofType"
                          value={formData.idProofType}
                          onChange={handleChange}
                          className="select-field-luxury"
                        >
                          {ID_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-field-group">
                        <label htmlFor="idProofNumber" className="field-label-luxury">
                          <FileText size={14} className="field-icon-blue" />
                          <span>ID Document Number</span>
                        </label>
                        <input
                          id="idProofNumber"
                          type="text"
                          name="idProofNumber"
                          placeholder="e.g. XXXX-XXXX-1234 or Passport Number"
                          value={formData.idProofNumber}
                          onChange={handleChange}
                          className="input-field-luxury"
                        />
                      </div>
                    </div>

                    <div className="id-upload-card-luxury">
                      <div className="upload-header-row">
                        <div>
                          <h4 className="upload-title">Official Document Attachment</h4>
                          <p className="upload-sub">Attach photo (JPG, PNG) or verified PDF for compliance:</p>
                        </div>
                      </div>

                      {!formData.idProofFile ? (
                        <div className="dropzone-box-luxury">
                          <div className="dropzone-crest">
                            <UploadCloud size={32} />
                          </div>
                          <div className="dropzone-text-block">
                            <strong>Drag &amp; Drop photo or PDF file here</strong>
                            <span>Supports JPG, PNG, WEBP, and PDF files up to 5MB</span>
                          </div>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileUpload}
                            className="file-hidden-input"
                            id="gov-id-file"
                          />
                          <label htmlFor="gov-id-file" className="btn-browse-luxury">
                            Browse Device Files
                          </label>

                          <div className="sample-id-quick-row">
                            <span>Or test prototype immediately:</span>
                            <button
                              type="button"
                              onClick={handleSampleIdUpload}
                              className="btn-sample-id-luxury"
                            >
                              ⚡ Attach Verified Sample Aadhaar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="file-preview-card-luxury">
                          <div className="file-thumbnail-luxury">
                            {formData.idProofFileType === 'pdf' ? (
                              <div className="pdf-badge-box">
                                <FileText size={32} className="text-red-500" />
                                <span>PDF ATTACHMENT</span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={formData.idProofFile}
                                alt="Government ID"
                                className="id-preview-image"
                              />
                            )}
                          </div>

                          <div className="file-meta-luxury">
                            <div className="verified-chip">
                              <CheckCircle2 size={13} />
                              <span>DOCUMENT VERIFIED</span>
                            </div>
                            <h4 className="file-title">{formData.idProofFileName || 'id_document'}</h4>
                            <p className="file-specs">{formData.idProofType} • {formData.idProofFileType.toUpperCase()}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  idProofFile: '',
                                  idProofFileName: '',
                                  idProofFileType: '',
                                }));
                              }}
                              className="btn-remove-attachment"
                            >
                              <Trash2 size={13} />
                              <span>Remove &amp; Re-upload</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="step-pane-animated">
                    <div className="office-card-luxury">
                      <div className="office-tag-title">
                        <Hotel size={15} />
                        <span>FOR FRONT DESK / OFFICE ALLOCATION</span>
                      </div>

                      <div className="form-grid-3" style={{ marginTop: '0.85rem' }}>
                        <div className="form-field-group">
                          <label htmlFor="roomNo" className="field-label-luxury">
                            <BedDouble size={14} /> Assigned Room No. <span className="star-required">*</span>
                          </label>
                          <input
                            id="roomNo"
                            type="text"
                            name="roomNo"
                            placeholder="e.g. 101, 204"
                            value={formData.roomNo}
                            onChange={handleChange}
                            className="input-field-luxury"
                            required
                            autoFocus
                          />
                          <div className="room-chips-row">
                            {AVAILABLE_ROOMS.map((r) => (
                              <button
                                type="button"
                                key={r.no}
                                onClick={() => setFormData({ ...formData, roomNo: r.no })}
                                className={`room-chip-luxury ${formData.roomNo === r.no ? 'active' : ''}`}
                              >
                                Rm {r.no}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="form-field-group">
                          <label htmlFor="advanceAmount" className="field-label-luxury">
                            <CreditCard size={14} /> Advance Paid (₹)
                          </label>
                          <input
                            id="advanceAmount"
                            type="number"
                            name="advanceAmount"
                            placeholder="e.g. 5000"
                            value={formData.advanceAmount}
                            onChange={handleChange}
                            className="input-field-luxury"
                          />
                        </div>

                        <div className="form-field-group">
                          <label htmlFor="receiptNo" className="field-label-luxury">
                            <FileText size={14} /> Receipt / Voucher No.
                          </label>
                          <input
                            id="receiptNo"
                            type="text"
                            name="receiptNo"
                            value={formData.receiptNo}
                            onChange={handleChange}
                            className="input-field-luxury"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="signature-card-luxury">
                      <div className="signature-card-header">
                        <div>
                          <div className="sig-header-title">
                            <PenTool size={15} className="text-blue" />
                            <span>Guest Digital Signature <span className="star-required">*</span></span>
                          </div>
                          <p className="sig-header-desc">
                            Please draw guest signature using mouse, touchscreen, or stylus:
                          </p>
                        </div>

                        <div className="signature-tools">
                          <button
                            type="button"
                            onClick={clearSignature}
                            className="btn-sig-action"
                          >
                            <Eraser size={14} />
                            <span>Clear</span>
                          </button>
                          <button
                            type="button"
                            onClick={adoptSampleSignature}
                            className="btn-sig-action text-blue font-bold"
                          >
                            <Sparkles size={14} />
                            <span>Auto-Sign</span>
                          </button>
                        </div>
                      </div>

                      <div className="canvas-frame-luxury">
                        <canvas
                          ref={canvasRef}
                          width={540}
                          height={130}
                          className="canvas-drawing-area"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        {!hasSignature && (
                          <div className="canvas-watermark">
                            <span>Sign here on the dotted line ✍️</span>
                          </div>
                        )}
                      </div>

                      {hasSignature && (
                        <div className="signature-confirmed-note">
                          <CheckCircle2 size={14} />
                          <span>Signature captured digitally and will be printed on the official registration slip.</span>
                        </div>
                      )}
                    </div>

                    <div className="agreement-row-luxury">
                      <input
                        type="checkbox"
                        id="checkoutAgreement"
                        name="checkoutAgreement"
                        checked={formData.checkoutAgreement}
                        onChange={handleChange}
                        required
                      />
                      <label htmlFor="checkoutAgreement">
                        I acknowledge that official checkout is <strong>11:00 AM</strong>. Stay extension is subject to hotel availability and standard tariff.
                      </label>
                    </div>
                  </div>
                )}

                {/* FOOTER */}
                <div className="step-footer-luxury">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="btn-step-prev-luxury"
                      >
                        <ArrowLeft size={16} />
                        <span>Previous Step</span>
                      </button>
                    )}
                  </div>

                  <div>
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="btn-step-next-luxury"
                      >
                        <span>Proceed to Step 0{currentStep + 1}</span>
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-step-submit-luxury"
                      >
                        <CheckCircle2 size={18} />
                        <span>{loading ? 'Completing Registration...' : 'Complete Check-In & Generate Slip'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </section>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IN-HOUSE GUESTS, DIRECTORY & CHECK-OUT CENTER                      */}
      {/* ========================================================================= */}
      {activeTab === 'checkout' && (
        <div className="checkout-center-container">
          <div className="checkout-controls-bar">
            <div className="checkout-search-wrap">
              <Search size={18} className="search-icon-muted" />
              <input
                type="text"
                placeholder="Search by Room No (e.g. 204), Guest Name, Mobile, or Slip #..."
                value={checkoutSearch}
                onChange={(e) => setCheckoutSearch(e.target.value)}
                className="checkout-search-input"
                autoFocus
              />
              {checkoutSearch && (
                <button
                  type="button"
                  onClick={() => setCheckoutSearch('')}
                  className="search-clear-btn"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="checkout-bar-actions">
              <div className="view-toggle-pill">
                <button
                  type="button"
                  onClick={() => setCheckoutView('cards')}
                  className={`view-toggle-btn ${checkoutView === 'cards' ? 'active' : ''}`}
                  title="Card Grid View"
                >
                  <LayoutGrid size={15} />
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutView('table')}
                  className={`view-toggle-btn ${checkoutView === 'table' ? 'active' : ''}`}
                  title="Tabular Data View"
                >
                  <List size={15} />
                  <span>Table</span>
                </button>
              </div>

              <button
                type="button"
                onClick={fetchCheckinsList}
                className="btn-checkout-refresh"
                title="Refresh In-House Guest Directory"
              >
                <RefreshCw size={15} className={loadingCheckins ? 'animate-spin' : ''} />
                <span>Refresh List</span>
              </button>
            </div>
          </div>

          {loadingCheckins ? (
            <div className="checkout-empty-state">
              <RefreshCw size={28} className="animate-spin text-muted" />
              <p>Loading in-house guest roster...</p>
            </div>
          ) : inHouseGuests.length === 0 ? (
            <div className="checkout-empty-state">
              <DoorClosed size={48} className="text-muted" />
              <h3>No In-House Guests Found</h3>
              <p>
                {checkoutSearch
                  ? `No active guests matching "${checkoutSearch}".`
                  : 'All rooms are currently vacant or checked out.'}
              </p>
              <button
                type="button"
                onClick={() => router.push('/reception?tab=checkin')}
                className="btn-primary"
                style={{ marginTop: '1rem' }}
              >
                <UserPlus size={16} />
                <span>Register New Guest Check-In</span>
              </button>
            </div>
          ) : checkoutView === 'table' ? (
            <div className="inhouse-table-card">
              <table className="inhouse-modern-table">
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Slip #</th>
                    <th>Guest Profile</th>
                    <th>Mobile</th>
                    <th>Check-In</th>
                    <th>Expected Out</th>
                    <th>Advance Paid</th>
                    <th>Source Channel</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inHouseGuests.map((guest) => {
                    const initials = guest.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <tr key={guest.id} className="inhouse-table-row">
                        <td>
                          <div className="table-room-pill">
                            <BedDouble size={14} />
                            <span>Room {guest.roomNo}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-slip-num">#{guest.srNo}</span>
                        </td>
                        <td>
                          <div className="table-guest-cell">
                            <div className="table-avatar-sm">{initials}</div>
                            <div>
                              <strong className="table-guest-name">{guest.name}</strong>
                              <div className="table-guest-meta">{guest.nationality || 'Indian'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="table-mobile-text">{guest.mobile}</span>
                        </td>
                        <td>
                          <div className="table-date-col">
                            <span className="table-date-main">{guest.checkInDate}</span>
                            <span className="table-time-sub">{guest.checkInTime || '12:00 PM'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-date-col">
                            <span className="table-date-main">{guest.checkOutDate || 'TBD'}</span>
                            <span className="table-time-sub">{guest.nightsStay} Night{Number(guest.nightsStay) > 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-advance-col">
                            <strong className="text-emerald">
                              ₹{Number(guest.advanceAmount || 0).toLocaleString('en-IN')}
                            </strong>
                            <span className="table-receipt-sub">{guest.receiptNo || 'Voucher'}</span>
                          </div>
                        </td>
                        <td>
                          <span className="table-channel-chip">{guest.leadSource || 'Walk-in'}</span>
                        </td>
                        <td>
                          <span className="inhouse-status-pill">
                            <span className="pulsing-green-dot" />
                            <span>In-House</span>
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditGuest(guest)}
                              className="btn-table-edit"
                              title="Edit Guest Details"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBillingGuestId(guest.id);
                                router.push('/reception?tab=billing');
                              }}
                              className="btn-table-billing"
                              title="View & Settle Folio"
                            >
                              <Receipt size={13} />
                              <span>Folio</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedForCheckout(guest)}
                              className="btn-table-checkout"
                              title={`Check out Room ${guest.roomNo}`}
                            >
                              <LogOut size={13} />
                              <span>Check Out</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="inhouse-cards-grid">
              {inHouseGuests.map((guest) => {
                const initials = guest.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={guest.id} className="inhouse-guest-card">
                    <div className="inhouse-card-top">
                      <div className="inhouse-room-badge">
                        <BedDouble size={16} />
                        <span>Room {guest.roomNo}</span>
                      </div>
                      <div className="inhouse-status-indicator">
                        <span className="pulsing-green-dot" />
                        <span>IN-HOUSE</span>
                      </div>
                    </div>

                    <div className="inhouse-guest-profile">
                      <div className="inhouse-avatar">{initials}</div>
                      <div className="inhouse-guest-info">
                        <h3 className="inhouse-guest-name">{guest.name}</h3>
                        <div className="inhouse-guest-meta">
                          <span>Slip #{guest.srNo}</span>
                          <span className="dot-sep">•</span>
                          <span className="inhouse-channel-badge">{guest.leadSource || 'Direct Walk-in'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="inhouse-details-grid">
                      <div className="inhouse-detail-item">
                        <span className="detail-label">Check-In:</span>
                        <strong className="detail-value">{guest.checkInDate}</strong>
                        <span className="detail-sub">{guest.checkInTime || '12:00 PM'}</span>
                      </div>

                      <div className="inhouse-detail-item">
                        <span className="detail-label">Expected Out:</span>
                        <strong className="detail-value">{guest.checkOutDate || 'TBD'}</strong>
                        <span className="detail-sub">{guest.nightsStay} Night{Number(guest.nightsStay) > 1 ? 's' : ''}</span>
                      </div>

                      <div className="inhouse-detail-item">
                        <span className="detail-label">Advance Paid:</span>
                        <strong className="detail-value text-emerald">
                          ₹{Number(guest.advanceAmount || 0).toLocaleString('en-IN')}
                        </strong>
                        <span className="detail-sub">{guest.receiptNo || 'Voucher'}</span>
                      </div>

                      <div className="inhouse-detail-item">
                        <span className="detail-label">Mobile Contact:</span>
                        <strong className="detail-value">{guest.mobile}</strong>
                        <span className="detail-sub">{guest.nationality || 'Indian'}</span>
                      </div>
                    </div>

                    <div className="inhouse-card-actions-row">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGuest(guest)}
                        className="btn-card-edit"
                        title="Edit Guest Details"
                      >
                        <Edit3 size={14} />
                        <span>Edit Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBillingGuestId(guest.id);
                          router.push('/reception?tab=billing');
                        }}
                        className="btn-card-billing"
                        title="View & Settle Folio"
                      >
                        <Receipt size={14} />
                        <span>Billing Folio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedForCheckout(guest)}
                        className="btn-card-checkout"
                        title="Proceed to Room Check-Out"
                      >
                        <LogOut size={15} />
                        <span>Check Out</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOTEL BILLING, FOLIOS & INVOICE SYSTEM                             */}
      {/* ========================================================================= */}
      {activeTab === 'billing' && (
        <div className="billing-center-container">
          {/* Top Billing KPI Cards */}
          <div className="billing-kpis-grid">
            <div className="billing-kpi-card card-navy">
              <div className="kpi-icon-wrap">
                <Receipt size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Active Folios</span>
                <strong className="kpi-val">{inHouseTotalCount} Rooms Occupied</strong>
              </div>
            </div>

            <div className="billing-kpi-card card-emerald">
              <div className="kpi-icon-wrap">
                <Coins size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Advance Collected</span>
                <strong className="kpi-val">
                  ₹{allCheckins
                    .filter((g) => g.status === 'Checked In')
                    .reduce((sum, g) => sum + Number(g.advanceAmount || 0), 0)
                    .toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="billing-kpi-card card-blue">
              <div className="kpi-icon-wrap">
                <CreditCard size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Active Folio Value</span>
                <strong className="kpi-val">
                  ₹{billingCalculations.grandTotal.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            <div className="billing-kpi-card card-amber">
              <div className="kpi-icon-wrap">
                <Calculator size={20} />
              </div>
              <div className="kpi-info">
                <span className="kpi-label">Folio Balance Due</span>
                <strong className="kpi-val">
                  ₹{billingCalculations.netPayable.toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>

          {/* Active Folio Workspace */}
          <div className="billing-workspace-grid">
            {/* Left: Occupied Rooms / Folio List */}
            <aside className="billing-rooms-sidebar">
              <div className="rooms-sidebar-header">
                <h4>In-House Guest Folios</h4>
                <span>{inHouseGuests.length} Available</span>
              </div>

              <div className="rooms-list-scroll">
                {inHouseGuests.map((g) => {
                  const isSelected = activeBillingGuest?.id === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedBillingGuestId(g.id)}
                      className={`billing-room-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="room-item-top">
                        <span className="room-badge-num">Room {g.roomNo}</span>
                        <span className={`room-payment-tag ${g.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                          {g.paymentStatus === 'Paid' ? 'PAID' : 'PENDING'}
                        </span>
                      </div>
                      <h4 className="room-guest-name">{g.name}</h4>
                      <div className="room-guest-sub">
                        <span>Slip #{g.srNo}</span>
                        <span>•</span>
                        <span>{g.nightsStay} Nights</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Right: Detailed Guest Folio & Charges */}
            <section className="billing-folio-panel">
              {activeBillingGuest ? (
                <>
                  {/* Folio Header */}
                  <div className="folio-panel-header">
                    <div className="folio-header-main">
                      <div className="folio-room-tag">
                        <BedDouble size={18} />
                        <span>ROOM {activeBillingGuest.roomNo} FOLIO</span>
                      </div>
                      <h3 className="folio-guest-title">{activeBillingGuest.name}</h3>
                      <p className="folio-guest-meta">
                        Mobile: {activeBillingGuest.mobile} • Channel: <strong>{activeBillingGuest.leadSource || 'Direct'}</strong> • Slip #{activeBillingGuest.srNo}
                      </p>
                    </div>

                    <div className="folio-header-actions">
                      <button
                        type="button"
                        onClick={() => setShowAddChargeModal(true)}
                        className="btn-add-charge-header"
                      >
                        <Plus size={15} />
                        <span>Add Charge / Service</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowInvoiceModal(true)}
                        className="btn-view-invoice-header"
                      >
                        <Printer size={15} />
                        <span>Print Tax Invoice</span>
                      </button>
                    </div>
                  </div>

                  {/* Stay Itinerary Bar */}
                  <div className="folio-itinerary-bar">
                    <div className="itinerary-metric">
                      <span>CHECK-IN:</span>
                      <strong>{activeBillingGuest.checkInDate} ({activeBillingGuest.checkInTime || '12:00 PM'})</strong>
                    </div>
                    <div className="itinerary-metric">
                      <span>CHECK-OUT:</span>
                      <strong>{activeBillingGuest.checkOutDate || today} ({activeBillingGuest.checkOutTime || '11:00 AM'})</strong>
                    </div>
                    <div className="itinerary-metric">
                      <span>BILLED NIGHTS:</span>
                      <strong>{billingCalculations.nights} Night{billingCalculations.nights > 1 ? 's' : ''}</strong>
                    </div>
                    <div className="itinerary-metric">
                      <span>ROOM TARIFF:</span>
                      <strong>₹{billingCalculations.roomRate.toLocaleString('en-IN')} / night</strong>
                    </div>
                  </div>

                  {/* Charges & Service Table */}
                  <div className="folio-charges-card">
                    <div className="charges-card-header">
                      <h4>Itemized Charges &amp; Consumption</h4>
                      <button
                        type="button"
                        onClick={() => setShowAddChargeModal(true)}
                        className="btn-inline-add"
                      >
                        <Plus size={13} />
                        <span>Add Item</span>
                      </button>
                    </div>

                    <table className="charges-table">
                      <thead>
                        <tr>
                          <th>Item / Service</th>
                          <th>Category</th>
                          <th>Date</th>
                          <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Base Room Tariff */}
                        <tr>
                          <td>
                            <strong>Standard Room Tariff ({billingCalculations.nights} Nights × ₹{billingCalculations.roomRate.toLocaleString('en-IN')})</strong>
                            <div className="charge-note">Room {activeBillingGuest.roomNo} Lodging Accommodation</div>
                          </td>
                          <td>
                            <span className="category-pill tariff">Room Tariff</span>
                          </td>
                          <td>{activeBillingGuest.checkInDate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>
                            ₹{billingCalculations.roomTotal.toLocaleString('en-IN')}
                          </td>
                          <td></td>
                        </tr>

                        {/* Extra Billing Items */}
                        {(activeBillingGuest.billingItems || []).map((item) => (
                          <tr key={item.id}>
                            <td>
                              <strong>{item.description}</strong>
                            </td>
                            <td>
                              <span className="category-pill service">{item.category}</span>
                            </td>
                            <td>{item.date}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              ₹{Number(item.amount).toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleDeleteChargeItem(item.id)}
                                className="btn-del-item"
                                title="Remove charge"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Accounting & Settlement Summary Card */}
                  <div className="folio-settlement-grid">
                    {/* Tax & Discount Controls */}
                    <div className="settlement-controls-box">
                      <h4>Taxes &amp; Concessions</h4>
                      <div className="control-row">
                        <label>GST / Luxury Tax Category:</label>
                        <select
                          value={taxRateSetting}
                          onChange={(e) => setTaxRateSetting(Number(e.target.value))}
                          className="select-tax-input"
                        >
                          <option value={12}>12% GST (Standard Room &lt; ₹7,500) • 6% CGST + 6% SGST</option>
                          <option value={18}>18% GST (Luxury Suite &gt; ₹7,500) • 9% CGST + 9% SGST</option>
                          <option value={0}>0% Tax Exempt (Diplomatic / Corporate Zero)</option>
                        </select>
                      </div>

                      <div className="control-row" style={{ marginTop: '0.85rem' }}>
                        <label>Promotional Discount / Manager Rebate (₹):</label>
                        <input
                          type="number"
                          placeholder="e.g. 500"
                          value={discountInput || ''}
                          onChange={(e) => setDiscountInput(Number(e.target.value) || 0)}
                          className="input-discount-field"
                        />
                      </div>

                      <div className="control-row" style={{ marginTop: '0.85rem' }}>
                        <label>Settlement Payment Method:</label>
                        <select
                          value={paymentMethodSelected}
                          onChange={(e) => setPaymentMethodSelected(e.target.value)}
                          className="select-tax-input"
                        >
                          <option value="UPI / QR Code">📱 UPI / QR Code (GooglePay, PhonePe, Paytm)</option>
                          <option value="Credit / Debit Card">💳 Credit / Debit Card Terminal (POS)</option>
                          <option value="Cash">💵 Cash at Front Desk</option>
                          <option value="Corporate Direct Billing">🏢 Corporate Account Direct Billing</option>
                        </select>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="settlement-totals-box">
                      <h4>Folio Accounting Summary</h4>
                      <div className="total-line">
                        <span>Lodging Room Tariff:</span>
                        <strong>₹{billingCalculations.roomTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="total-line">
                        <span>Services &amp; Consumption:</span>
                        <strong>₹{billingCalculations.itemsTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      {discountInput > 0 && (
                        <div className="total-line text-emerald">
                          <span>Less Discount / Rebate:</span>
                          <strong>- ₹{discountInput.toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      <div className="total-line">
                        <span>Taxable Subtotal:</span>
                        <strong>₹{billingCalculations.subtotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="total-line">
                        <span>CGST ({taxRateSetting / 2}%):</span>
                        <span>₹{billingCalculations.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="total-line">
                        <span>SGST ({taxRateSetting / 2}%):</span>
                        <span>₹{billingCalculations.sgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="total-line divider-line">
                        <span>Total Invoice Amount:</span>
                        <strong>₹{billingCalculations.grandTotal.toLocaleString('en-IN')}</strong>
                      </div>
                      <div className="total-line text-emerald">
                        <span>Less Advance Deposit:</span>
                        <strong>- ₹{billingCalculations.advance.toLocaleString('en-IN')} ({activeBillingGuest.receiptNo || 'Voucher'})</strong>
                      </div>

                      <div className="net-payable-highlight">
                        <div>
                          <span className="net-label">NET BALANCE DUE</span>
                          <div className="net-amount">
                            ₹{billingCalculations.netPayable.toLocaleString('en-IN')}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSettleBill}
                          className="btn-settle-folio"
                        >
                          <CheckCircle2 size={16} />
                          <span>Settle &amp; Mark Paid</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="checkout-empty-state">
                  <Receipt size={36} className="text-muted" />
                  <h4>Select a guest room from the sidebar to inspect billing folio.</h4>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT GUEST PROFILE & STAY DETAILS                                */}
      {/* ========================================================================= */}
      {editingGuest && (
        <div className="modal-overlay" onClick={() => setEditingGuest(null)}>
          <div className="edit-guest-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div className="modal-header-icon-title">
                <div className="edit-crest-wrap">
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 className="edit-modal-title">Edit Guest Details &amp; Room Assignment</h3>
                  <p className="edit-modal-sub">
                    Slip #{editingGuest.srNo} • Room <strong>{editingGuest.roomNo}</strong> • {editingGuest.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="btn-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGuest} className="edit-modal-form">
              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <User size={14} className="field-icon-blue" />
                    <span>Guest Full Name *</span>
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="input-field-luxury"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <Compass size={14} className="field-icon-blue" />
                    <span>Lead Acquisition Source *</span>
                  </label>
                  <select
                    value={editFormData.leadSource || 'Walk-in Direct'}
                    onChange={(e) => setEditFormData({ ...editFormData, leadSource: e.target.value })}
                    className="select-field-luxury"
                  >
                    <option value="Walk-in Direct">🚪 Walk-in Direct (Front Desk)</option>
                    <option value="Booking.com">🌐 Booking.com (OTA)</option>
                    <option value="MakeMyTrip">🇮🇳 MakeMyTrip (OTA)</option>
                    <option value="Agoda">🌏 Agoda (Global OTA)</option>
                    <option value="Airbnb">🏡 Airbnb (Vacation Rental)</option>
                    <option value="Website Direct">✨ Website Direct (Paradise Portal)</option>
                    <option value="Corporate Partner">🏢 Corporate Partner (Business)</option>
                    <option value="Phone Call / Direct">📞 Phone Call / Direct Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <Phone size={14} className="field-icon-blue" />
                    <span>Mobile Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={editFormData.mobile || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="input-field-luxury"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <Mail size={14} className="field-icon-blue" />
                    <span>Email Address</span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="input-field-luxury"
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <BedDouble size={14} /> Assigned Room No. *
                  </label>
                  <input
                    type="text"
                    value={editFormData.roomNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, roomNo: e.target.value })}
                    className="input-field-luxury"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <CreditCard size={14} /> Advance Paid (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.advanceAmount ?? ''}
                    onChange={(e) => setEditFormData({ ...editFormData, advanceAmount: Number(e.target.value) || 0 })}
                    className="input-field-luxury"
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <FileText size={14} /> Receipt / Voucher No.
                  </label>
                  <input
                    type="text"
                    value={editFormData.receiptNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, receiptNo: e.target.value })}
                    className="input-field-luxury"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <Calendar size={14} /> Check In Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.checkInDate || today}
                    onChange={(e) => setEditFormData({ ...editFormData, checkInDate: e.target.value })}
                    className="input-field-luxury"
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">
                    <Calendar size={14} /> Check Out Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.checkOutDate || tomorrow}
                    onChange={(e) => setEditFormData({ ...editFormData, checkOutDate: e.target.value })}
                    className="input-field-luxury"
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-field-group">
                  <label className="field-label-luxury">Adults</label>
                  <input
                    type="number"
                    value={editFormData.adults ?? 1}
                    onChange={(e) => setEditFormData({ ...editFormData, adults: Number(e.target.value) || 1 })}
                    className="input-field-luxury"
                    min={1}
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">Children</label>
                  <input
                    type="number"
                    value={editFormData.children ?? 0}
                    onChange={(e) => setEditFormData({ ...editFormData, children: Number(e.target.value) || 0 })}
                    className="input-field-luxury"
                    min={0}
                  />
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">Vehicle Registration</label>
                  <input
                    type="text"
                    value={editFormData.vehicleNo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, vehicleNo: e.target.value })}
                    className="input-field-luxury"
                    placeholder="e.g. MH-02-CD-5678"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field-group">
                  <label className="field-label-luxury">Govt ID Type</label>
                  <select
                    value={editFormData.idProofType || 'Aadhaar Card'}
                    onChange={(e) => setEditFormData({ ...editFormData, idProofType: e.target.value })}
                    className="select-field-luxury"
                  >
                    {ID_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field-group">
                  <label className="field-label-luxury">ID Document Number</label>
                  <input
                    type="text"
                    value={editFormData.idProofNumber || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, idProofNumber: e.target.value })}
                    className="input-field-luxury"
                    placeholder="e.g. XXXX-XXXX-1234"
                  />
                </div>
              </div>

              <div className="edit-modal-footer">
                <button
                  type="button"
                  onClick={() => setEditingGuest(null)}
                  className="btn-cancel-checkout"
                  disabled={editSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-save-edit"
                  disabled={editSaving}
                >
                  <CheckCircle2 size={16} />
                  <span>{editSaving ? 'Saving Changes...' : 'Save & Update Guest Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW CHARGE TO ROOM FOLIO                                      */}
      {/* ========================================================================= */}
      {showAddChargeModal && activeBillingGuest && (
        <div className="modal-overlay" onClick={() => setShowAddChargeModal(false)}>
          <div className="add-charge-modal" onClick={(e) => e.stopPropagation()}>
            <div className="add-charge-header">
              <div className="charge-title-box">
                <div className="charge-icon-pill">
                  <Plus size={18} />
                </div>
                <div>
                  <h4>Add Consumption / Service Charge</h4>
                  <p>Room <strong>{activeBillingGuest.roomNo}</strong> • {activeBillingGuest.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddChargeModal(false)}
                className="btn-modal-close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewCharge} className="add-charge-form">
              <div className="form-field-group">
                <label className="field-label-luxury">Service Category *</label>
                <select
                  value={newCharge.category}
                  onChange={(e) => setNewCharge({ ...newCharge, category: e.target.value })}
                  className="select-field-luxury"
                >
                  {CHARGE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-field-group" style={{ marginTop: '0.85rem' }}>
                <label className="field-label-luxury">Description / Item Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dinner Room Service - The Paradise Bistro"
                  value={newCharge.description}
                  onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
                  className="input-field-luxury"
                  required
                  autoFocus
                />
              </div>

              <div className="form-field-group" style={{ marginTop: '0.85rem' }}>
                <label className="field-label-luxury">Charge Amount (₹) *</label>
                <input
                  type="number"
                  placeholder="e.g. 1250"
                  value={newCharge.amount}
                  onChange={(e) => setNewCharge({ ...newCharge, amount: e.target.value })}
                  className="input-field-luxury"
                  required
                />
              </div>

              <div className="charge-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddChargeModal(false)}
                  className="btn-cancel-checkout"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save-charge"
                >
                  <Plus size={15} />
                  <span>Add Charge to Folio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: OFFICIAL TAX INVOICE & HOTEL BILL                                */}
      {/* ========================================================================= */}
      {showInvoiceModal && activeBillingGuest && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="invoice-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="invoice-modal-bar">
              <span className="invoice-bar-title">Official Tax Invoice • Paradise Hospitality</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-invoice-print"
                >
                  <Printer size={15} />
                  <span>Print Tax Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="btn-modal-close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Paper Body */}
            <div className="invoice-paper-body">
              {/* Hotel Header */}
              <div className="invoice-paper-header">
                <div className="invoice-hotel-brand">
                  <h2>PARADISE HOSPITALITY</h2>
                  <p>5-STAR LUXURY RESORT &amp; EXECUTIVE SUITES</p>
                  <span>108 Ocean Boulevard, Paradise Bay • Phone: +91 (022) 8800-PARADISE</span>
                  <span>GSTIN: 27AAAAA1234A1Z5 • State Code: 27 (Maharashtra)</span>
                </div>
                <div className="invoice-meta-col">
                  <div className="invoice-title-pill">TAX INVOICE</div>
                  <div className="invoice-detail-row">
                    <span>Invoice No:</span>
                    <strong>{activeBillingGuest.invoiceNumber || `PH-INV-2026-${activeBillingGuest.srNo}`}</strong>
                  </div>
                  <div className="invoice-detail-row">
                    <span>Invoice Date:</span>
                    <strong>{today}</strong>
                  </div>
                  <div className="invoice-detail-row">
                    <span>SAC / HSN Code:</span>
                    <strong>9963 (Hotel Services)</strong>
                  </div>
                </div>
              </div>

              {/* Guest & Room Details Grid */}
              <div className="invoice-guest-box">
                <div className="invoice-guest-col">
                  <span className="box-section-tag">BILLED TO (GUEST)</span>
                  <div className="guest-invoice-name">{activeBillingGuest.name}</div>
                  <div className="guest-invoice-sub">Mobile: {activeBillingGuest.mobile}</div>
                  <div className="guest-invoice-sub">Email: {activeBillingGuest.email || 'N/A'}</div>
                  <div className="guest-invoice-sub">Address: {activeBillingGuest.address || 'On File'}</div>
                  <div className="guest-invoice-sub">ID: {activeBillingGuest.idProofType} ({activeBillingGuest.idProofNumber || 'Verified'})</div>
                </div>

                <div className="invoice-room-col">
                  <span className="box-section-tag">STAY PARTICULARS</span>
                  <div className="guest-invoice-sub">Assigned Room: <strong>Room {activeBillingGuest.roomNo}</strong></div>
                  <div className="guest-invoice-sub">Registration Slip: <strong>#{activeBillingGuest.srNo}</strong></div>
                  <div className="guest-invoice-sub">Check-In: <strong>{activeBillingGuest.checkInDate} ({activeBillingGuest.checkInTime || '12:00 PM'})</strong></div>
                  <div className="guest-invoice-sub">Check-Out: <strong>{activeBillingGuest.checkOutDate || today} ({activeBillingGuest.checkOutTime || '11:00 AM'})</strong></div>
                  <div className="guest-invoice-sub">Total Nights: <strong>{billingCalculations.nights} Night{billingCalculations.nights > 1 ? 's' : ''}</strong></div>
                </div>
              </div>

              {/* Itemized Invoice Table */}
              <table className="invoice-items-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Service Particulars</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Qty / Nights</th>
                    <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ textAlign: 'right' }}>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>
                      <strong>Room Accommodation Tariff - Room {activeBillingGuest.roomNo}</strong>
                      <div className="item-subnote">Luxury Stay Suite Charges</div>
                    </td>
                    <td>Lodging</td>
                    <td style={{ textAlign: 'center' }}>{billingCalculations.nights}</td>
                    <td style={{ textAlign: 'right' }}>₹{billingCalculations.roomRate.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{billingCalculations.roomTotal.toLocaleString('en-IN')}</td>
                  </tr>

                  {(activeBillingGuest.billingItems || []).map((item, idx) => (
                    <tr key={item.id}>
                      <td>{idx + 2}</td>
                      <td>
                        <strong>{item.description}</strong>
                        <div className="item-subnote">Billed on {item.date}</div>
                      </td>
                      <td>{item.category}</td>
                      <td style={{ textAlign: 'center' }}>1</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(item.amount).toLocaleString('en-IN')}</td>
                      <td style={{ textAlign: 'right' }}>₹{Number(item.amount).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Breakdown */}
              <div className="invoice-totals-wrapper">
                <div className="invoice-payment-method-box">
                  <span className="payment-box-title">PAYMENT RECONCILIATION</span>
                  <div className="payment-box-row">
                    <span>Payment Mode:</span>
                    <strong>{activeBillingGuest.paymentMethod || paymentMethodSelected}</strong>
                  </div>
                  <div className="payment-box-row">
                    <span>Advance Deposit Receipt:</span>
                    <strong>{activeBillingGuest.receiptNo || 'VOUCHER-SETTLED'}</strong>
                  </div>
                  <div className="payment-box-row">
                    <span>Folio Status:</span>
                    <strong className="text-emerald">PAID &amp; SETTLED IN FULL</strong>
                  </div>
                </div>

                <div className="invoice-amounts-box">
                  <div className="inv-line">
                    <span>Taxable Value:</span>
                    <strong>₹{billingCalculations.subtotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="inv-line">
                    <span>CGST ({taxRateSetting / 2}%):</span>
                    <span>₹{billingCalculations.cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="inv-line">
                    <span>SGST ({taxRateSetting / 2}%):</span>
                    <span>₹{billingCalculations.sgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="inv-line inv-total-bold">
                    <span>Grand Total:</span>
                    <strong>₹{billingCalculations.grandTotal.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="inv-line text-emerald">
                    <span>Less Advance Received:</span>
                    <strong>- ₹{billingCalculations.advance.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="inv-line inv-net-due">
                    <span>Net Amount Due / Paid:</span>
                    <strong>₹{billingCalculations.netPayable.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Invoice Signatures */}
              <div className="invoice-signatures-row">
                <div className="signature-col">
                  {activeBillingGuest.signature ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeBillingGuest.signature}
                      alt="Guest Signature"
                      style={{ maxHeight: '42px', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ height: '42px' }} />
                  )}
                  <div className="sig-line">Guest Signature</div>
                </div>

                <div className="signature-col">
                  <div style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', fontFamily: 'serif' }}>
                    Paradise Front Desk Authority
                  </div>
                  <div className="sig-line">Authorized Signatory &amp; Cashier</div>
                </div>
              </div>

              <div className="invoice-terms-footer">
                Thank you for choosing Paradise Hospitality! Check-out time is strictly 11:00 AM. Computer-generated official tax invoice.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CHECK-OUT DEPARTURE CONFIRMATION MODAL                            */}
      {/* ========================================================================= */}
      {selectedForCheckout && (
        <div className="modal-overlay" onClick={() => setSelectedForCheckout(null)}>
          <div className="checkout-modal-luxury" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div className="modal-title-left">
                <div className="modal-crest-icon">
                  <LogOut size={22} />
                </div>
                <div>
                  <h3 className="modal-checkout-heading">Confirm Guest Check-Out</h3>
                  <p className="modal-checkout-sub">
                    Paradise Hospitality • Room <strong>{selectedForCheckout.roomNo}</strong> Departure
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedForCheckout(null)}
                className="btn-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="checkout-modal-body">
              <div className="checkout-summary-highlight">
                <div className="highlight-room-col">
                  <span className="highlight-tag">ROOM NUMBER</span>
                  <div className="highlight-room-num">{selectedForCheckout.roomNo}</div>
                </div>
                <div className="highlight-info-col">
                  <h4 className="highlight-guest-name">{selectedForCheckout.name}</h4>
                  <p className="highlight-contact">
                    Mobile: {selectedForCheckout.mobile} • Slip #{selectedForCheckout.srNo}
                  </p>
                  <div className="highlight-dates">
                    Stay: {selectedForCheckout.checkInDate} ➔ {selectedForCheckout.checkOutDate || today} ({selectedForCheckout.nightsStay} Nights)
                  </div>
                </div>
              </div>

              <div className="settlement-breakdown-card">
                <div className="breakdown-row">
                  <span>Advance Deposit Received:</span>
                  <strong className="text-emerald">
                    ₹{Number(selectedForCheckout.advanceAmount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div className="breakdown-row">
                  <span>Receipt Voucher Number:</span>
                  <span>{selectedForCheckout.receiptNo || 'REC-SETTLED'}</span>
                </div>
                <div className="breakdown-row">
                  <span>Channel Source:</span>
                  <span>{selectedForCheckout.leadSource || 'Walk-in'}</span>
                </div>
                <div className="breakdown-row total-row">
                  <span>Final Folio Balance Status:</span>
                  <strong className="text-blue">PAID &amp; SETTLED</strong>
                </div>
              </div>

              <div className="checkout-checklist-card">
                <div className="checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Physical room key cards collected at front desk</span>
                </div>
                <div className="checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Minibar, room amenities &amp; inventory verified</span>
                </div>
                <div className="checklist-item">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Digital folio archived &amp; room released for housekeeping</span>
                </div>
              </div>
            </div>

            <div className="checkout-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedForCheckout(null)}
                className="btn-cancel-checkout"
                disabled={checkoutProcessing}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleConfirmCheckout(selectedForCheckout)}
                className="btn-confirm-checkout"
                disabled={checkoutProcessing}
              >
                <LogOut size={16} />
                <span>{checkoutProcessing ? 'Releasing Room...' : `Confirm Check-Out & Release Room ${selectedForCheckout.roomNo}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ReceptionPage() {
  return (
    <Suspense
      fallback={
        <main className="main-container multi-step-page">
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
            <div className="pulsing-green-dot" style={{ margin: '0 auto 0.75rem' }} />
            <strong>Loading Paradise Hospitality Reception Terminal...</strong>
          </div>
        </main>
      }
    >
      <ReceptionContent />
    </Suspense>
  );
}
