'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GuestRegistration } from '@/types/checkin';
import { HOTELS_PORTFOLIO, HotelProperty, HotelRoom } from '@/data/hotels';
import { 
  Users, 
  DoorClosed, 
  DoorOpen,
  IndianRupee, 
  Search, 
  Eye, 
  X, 
  Printer, 
  RefreshCw, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Car, 
  Globe,
  Clock,
  ArrowUpRight,
  Download,
  BedDouble,
  Sparkles,
  Filter,
  LogOut,
  Check,
  TrendingUp,
  BarChart3,
  Layers,
  Building2,
  CalendarCheck,
  ShieldCheck,
  CheckCircle2,
  Home,
  ArrowLeft,
  ChevronRight,
  Star,
  Hotel,
  Award,
  Wallet,
  Percent,
  Activity,
  UserCheck,
  FileText
} from 'lucide-react';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hotelQueryParam = searchParams.get('hotel');

  const [checkins, setCheckins] = useState<GuestRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Checked In' | 'Checked Out'>('All');
  const [activeTab, setActiveTab] = useState<'rooms' | 'guests' | 'analytics'>('rooms');
  const [floorFilter, setFloorFilter] = useState<number | 'All'>('All');
  const [selectedGuest, setSelectedGuest] = useState<GuestRegistration | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [timeString, setTimeString] = useState<string>('');
  const [portfolioSearch, setPortfolioSearch] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>('All');
  const [roomStatusFilter, setRoomStatusFilter] = useState<'All' | 'Available' | 'Occupied'>('All');
  const [roomSearchQuery, setRoomSearchQuery] = useState<string>('');

  // Currently selected hotel property (or null for the 6-cards portfolio view)
  const selectedHotel = useMemo(() => {
    if (!hotelQueryParam) return null;
    return HOTELS_PORTFOLIO.find((h) => h.id === hotelQueryParam) || null;
  }, [hotelQueryParam]);

  // Clock ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' • ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCheckins = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkins');
      const json = await res.json();
      if (json.success && json.data) {
        setCheckins(json.data);
      }
    } catch (err) {
      console.error('Failed to load checkins', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle checkout status
  const handleToggleStatus = async (guest: GuestRegistration) => {
    const newStatus = guest.status === 'Checked In' ? 'Checked Out' : 'Checked In';
    setUpdatingId(guest.id);
    try {
      const res = await fetch('/api/checkins', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guest.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCheckins((prev) =>
          prev.map((c) => (c.id === guest.id ? { ...c, status: newStatus } : c))
        );
        showToast(`Guest ${guest.name} marked as ${newStatus}!`);
        window.dispatchEvent(new Event('guest-checked-in'));
      }
    } catch (err) {
      showToast('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Portfolio-level Hotel Stats for all 6 properties
  const portfolioStats = useMemo(() => {
    return HOTELS_PORTFOLIO.map((hotel) => {
      const hotelGuests = checkins.filter(
        (c) => c.hotelId === hotel.id || (!c.hotelId && hotel.id === 'treebo-jp-cottage')
      );
      const inHouseCount = hotelGuests.filter((c) => c.status === 'Checked In').length;
      const totalRooms = hotel.rooms.length;
      const occupancyRate = totalRooms > 0 ? Math.round((inHouseCount / totalRooms) * 100) : 0;
      const totalAdvance = hotelGuests.reduce((sum, c) => sum + (Number(c.advanceAmount) || 0), 0);

      return {
        hotel,
        hotelGuests,
        inHouseCount,
        totalRooms,
        occupancyRate,
        totalAdvance,
      };
    });
  }, [checkins]);

  // Aggregate Portfolio Totals
  const portfolioTotals = useMemo(() => {
    const totalProperties = HOTELS_PORTFOLIO.length;
    const totalRooms = HOTELS_PORTFOLIO.reduce((sum, h) => sum + h.rooms.length, 0);
    const totalInHouse = portfolioStats.reduce((sum, s) => sum + s.inHouseCount, 0);
    const totalAdvance = portfolioStats.reduce((sum, s) => sum + s.totalAdvance, 0);
    const avgOccupancy = totalRooms > 0 ? Math.round((totalInHouse / totalRooms) * 100) : 0;
    return {
      totalProperties,
      totalRooms,
      totalInHouse,
      totalAdvance,
      avgOccupancy,
    };
  }, [portfolioStats]);

  // Filtered Hotels in Portfolio View
  const filteredHotels = useMemo(() => {
    return portfolioStats.filter(({ hotel }) => {
      const q = portfolioSearch.toLowerCase().trim();
      const matchesSearch =
        hotel.name.toLowerCase().includes(q) ||
        hotel.location.toLowerCase().includes(q) ||
        hotel.city.toLowerCase().includes(q) ||
        hotel.category.toLowerCase().includes(q);

      const matchesCity = cityFilter === 'All' || hotel.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [portfolioStats, portfolioSearch, cityFilter]);

  // Hotel-specific records (when a hotel is selected)
  const currentHotelCheckins = useMemo(() => {
    if (!selectedHotel) return [];
    return checkins.filter(
      (c) => c.hotelId === selectedHotel.id || (!c.hotelId && selectedHotel.id === 'treebo-jp-cottage')
    );
  }, [checkins, selectedHotel]);

  // Filter checkins for selected hotel
  const filteredHotelCheckins = useMemo(() => {
    return currentHotelCheckins.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.roomNo.toLowerCase().includes(q) ||
        item.mobile.toLowerCase().includes(q) ||
        item.srNo.toLowerCase().includes(q) ||
        (item.email && item.email.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [currentHotelCheckins, searchQuery, statusFilter]);

  // Active Occupied map for selected hotel: roomNo -> guest
  const occupiedRoomMap = useMemo(() => {
    const map = new Map<string, GuestRegistration>();
    currentHotelCheckins.forEach((c) => {
      if (c.status === 'Checked In') {
        map.set(String(c.roomNo).trim(), c);
      }
    });
    return map;
  }, [currentHotelCheckins]);

  // Rooms for the selected hotel
  const hotelRooms = useMemo(() => {
    if (!selectedHotel) return [];
    const list = [...selectedHotel.rooms];
    // Include any custom room assigned
    currentHotelCheckins.forEach((c) => {
      const exists = list.some((r) => r.roomNo === c.roomNo);
      if (!exists && c.roomNo) {
        list.push({
          roomNo: c.roomNo,
          floor: parseInt(c.roomNo[0]) || 1,
          type: 'Deluxe',
          rate: 3200,
        });
      }
    });
    return list.sort((a, b) => a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true }));
  }, [selectedHotel, currentHotelCheckins]);

  // Stats for the selected hotel
  const hotelTotalGuests = currentHotelCheckins.length;
  const hotelActiveCheckedIn = currentHotelCheckins.filter((c) => c.status === 'Checked In').length;
  const hotelTotalOccupiedRooms = occupiedRoomMap.size;
  const hotelTotalRoomsCount = hotelRooms.length;
  const hotelTotalAvailableRooms = Math.max(0, hotelTotalRoomsCount - hotelTotalOccupiedRooms);
  const hotelOccupancyRate =
    hotelTotalRoomsCount > 0 ? Math.round((hotelTotalOccupiedRooms / hotelTotalRoomsCount) * 100) : 0;
  const hotelTotalAdvance = currentHotelCheckins.reduce(
    (sum, c) => sum + (Number(c.advanceAmount) || 0),
    0
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const hotelDueCheckoutsToday = currentHotelCheckins.filter(
    (c) => c.status === 'Checked In' && c.checkOutDate === todayStr
  ).length;

  // Filter rooms by floor, type, status, and search query for selected hotel
  const displayedHotelRooms = useMemo(() => {
    return hotelRooms.filter((r) => {
      if (floorFilter !== 'All' && r.floor !== floorFilter) return false;
      if (roomTypeFilter !== 'All' && r.type !== roomTypeFilter) return false;
      const occupant = occupiedRoomMap.get(r.roomNo);
      const isOccupied = !!occupant;
      if (roomStatusFilter === 'Occupied' && !isOccupied) return false;
      if (roomStatusFilter === 'Available' && isOccupied) return false;
      if (roomSearchQuery.trim()) {
        const q = roomSearchQuery.toLowerCase().trim();
        const matchesRoom = r.roomNo.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
        const matchesGuest = occupant && occupant.name.toLowerCase().includes(q);
        if (!matchesRoom && !matchesGuest) return false;
      }
      return true;
    });
  }, [hotelRooms, floorFilter, roomTypeFilter, roomStatusFilter, roomSearchQuery, occupiedRoomMap]);

  // Executive Hospitality Analytics & Insights calculations
  const analyticsMetrics = useMemo(() => {
    const totalRooms = hotelTotalRoomsCount;
    const occupiedCount = hotelTotalOccupiedRooms;
    const availableCount = hotelTotalAvailableRooms;
    const occupancyRate = hotelOccupancyRate;
    const totalAdvance = hotelTotalAdvance;

    const avgTariff = hotelRooms.length > 0
      ? Math.round(hotelRooms.reduce((sum, r) => sum + r.rate, 0) / hotelRooms.length)
      : 0;

    const occupiedRates = Array.from(occupiedRoomMap.values()).map((g) => {
      const room = hotelRooms.find((r) => r.roomNo === g.roomNo);
      return room ? room.rate : (Number(g.advanceAmount) || avgTariff);
    });
    const adr = occupiedRates.length > 0
      ? Math.round(occupiedRates.reduce((a, b) => a + b, 0) / occupiedRates.length)
      : avgTariff;

    const revPar = Math.round(adr * (occupancyRate / 100));

    const inHouseGuests = currentHotelCheckins.filter((c) => c.status === 'Checked In');
    const totalAdults = inHouseGuests.reduce((sum, g) => sum + (Number(g.adults) || 1), 0);
    const totalChildren = inHouseGuests.reduce((sum, g) => sum + (Number(g.children) || 0), 0);
    const totalInHouseGuestsCount = totalAdults + totalChildren;

    const avgStay = currentHotelCheckins.length > 0
      ? (currentHotelCheckins.reduce((sum, g) => sum + (Number(g.nightsStay) || 1), 0) / currentHotelCheckins.length).toFixed(1)
      : '1.0';

    const sourceCounts: Record<string, number> = {};
    currentHotelCheckins.forEach((g) => {
      const src = g.leadSource?.trim() || 'Direct Walk-in';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    const totalChannelBookings = currentHotelCheckins.length || 1;
    const directCount = sourceCounts['Direct Walk-in'] || sourceCounts['Direct Walk-In'] || sourceCounts['Front Desk'] || 0;
    const otaCount = Math.max(0, currentHotelCheckins.length - directCount);

    const tierOrder = ['Deluxe', 'Super Deluxe', 'Executive Suite', 'Presidential Suite'];
    const tierMap: Record<string, { total: number; occupied: number; rates: number[] }> = {
      'Deluxe': { total: 0, occupied: 0, rates: [] },
      'Super Deluxe': { total: 0, occupied: 0, rates: [] },
      'Executive Suite': { total: 0, occupied: 0, rates: [] },
      'Presidential Suite': { total: 0, occupied: 0, rates: [] },
    };

    hotelRooms.forEach((r) => {
      if (!tierMap[r.type]) {
        tierMap[r.type] = { total: 0, occupied: 0, rates: [] };
      }
      tierMap[r.type].total += 1;
      tierMap[r.type].rates.push(r.rate);
      if (occupiedRoomMap.has(r.roomNo)) {
        tierMap[r.type].occupied += 1;
      }
    });

    return {
      totalRooms,
      occupiedCount,
      availableCount,
      occupancyRate,
      totalAdvance,
      avgTariff,
      adr,
      revPar,
      totalAdults,
      totalChildren,
      totalInHouseGuestsCount,
      avgStay,
      sourceCounts,
      totalChannelBookings,
      directCount,
      otaCount,
      tierMap,
      tierOrder
    };
  }, [hotelTotalRoomsCount, hotelTotalOccupiedRooms, hotelTotalAvailableRooms, hotelOccupancyRate, hotelTotalAdvance, hotelRooms, occupiedRoomMap, currentHotelCheckins]);

  // Navigation helpers
  const handleSelectHotel = (hotelId: string | null) => {
    if (hotelId) {
      router.push(`/admin?hotel=${hotelId}`);
    } else {
      router.push('/admin');
    }
  };

  // Export CSV for current view
  const handleExportCSV = () => {
    const exportList = selectedHotel ? currentHotelCheckins : checkins;
    if (exportList.length === 0) {
      showToast('No records to export.');
      return;
    }
    const headers = [
      'Hotel Name',
      'Sr No',
      'Guest Name',
      'Mobile',
      'Email',
      'Room No',
      'Check In Date',
      'Check In Time',
      'Check Out Date',
      'Check Out Time',
      'Nights',
      'Advance (INR)',
      'Receipt No',
      'Status',
    ];

    const rows = exportList.map((c) => [
      `"${c.hotelName || selectedHotel?.name || 'Paradise Hospitality'}"`,
      `"${c.srNo}"`,
      `"${c.name}"`,
      `"${c.mobile}"`,
      `"${c.email || ''}"`,
      `"${c.roomNo}"`,
      `"${c.checkInDate}"`,
      `"${c.checkInTime}"`,
      `"${c.checkOutDate}"`,
      `"${c.checkOutTime}"`,
      `"${c.nightsStay}"`,
      `"${c.advanceAmount}"`,
      `"${c.receiptNo}"`,
      `"${c.status}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${selectedHotel ? selectedHotel.id : 'paradise-all-hotels'}-guests-${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Guest report downloaded successfully (CSV)!');
  };

  return (
    <main className="dashboard-wrapper">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="modern-toast">
          <CheckCircle2 size={18} className="toast-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW A: 6-HOTELS PORTFOLIO OVERVIEW (When no hotel is selected)           */}
      {/* ========================================================================= */}
      {!selectedHotel ? (
        <>
          {/* Top Multi-Property Portfolio Banner */}
          <header className="portfolio-hero">
            <div className="portfolio-hero-left">
              <div className="portfolio-crest-gold">
                <Hotel size={28} />
              </div>
              <div>
                <div className="portfolio-hero-badge">
                  <span className="live-pulse" />
                  <span>PARADISE HOSPITALITY GROUP • MULTI-PROPERTY PORTFOLIO</span>
                </div>
                <h1 className="portfolio-hero-title">Executive Hotel Operations Portfolio</h1>
                <p className="portfolio-hero-sub">
                  <Clock size={15} />
                  <span>{timeString || 'Live Clock Active'}</span>
                  <span>•</span>
                  <span>Central command overlooking 6 premier hotels &amp; luxury resorts</span>
                </p>
              </div>
            </div>

            <div className="hero-actions">
              <Link 
                href="/" 
                className="btn-action-glass"
                title="Go to Hotel Public Website"
                style={{ textDecoration: 'none' }}
              >
                <Home size={16} />
                <span>Hotel Website</span>
              </Link>

              <button 
                onClick={fetchCheckins} 
                className="btn-action-glass"
                title="Refresh Live Data"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button 
                onClick={handleExportCSV} 
                className="btn-action-glass"
                title="Download Group Guests CSV Report"
              >
                <Download size={16} />
                <span>Group CSV</span>
              </button>
            </div>
          </header>

          {/* Group Portfolio Summary KPI Cards */}
          <section className="portfolio-overview-kpis">
            <div className="portfolio-kpi-card">
              <div className="portfolio-kpi-icon" style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                <Building2 size={22} />
              </div>
              <div>
                <span className="portfolio-kpi-label">Active Properties</span>
                <strong className="portfolio-kpi-value">{portfolioTotals.totalProperties} Hotels</strong>
              </div>
            </div>

            <div className="portfolio-kpi-card">
              <div className="portfolio-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <BedDouble size={22} />
              </div>
              <div>
                <span className="portfolio-kpi-label">Portfolio Inventory</span>
                <strong className="portfolio-kpi-value">{portfolioTotals.totalRooms} Rooms</strong>
              </div>
            </div>

            <div className="portfolio-kpi-card">
              <div className="portfolio-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Users size={22} />
              </div>
              <div>
                <span className="portfolio-kpi-label">In-House Guests</span>
                <strong className="portfolio-kpi-value">{portfolioTotals.totalInHouse} Active</strong>
              </div>
            </div>

            <div className="portfolio-kpi-card">
              <div className="portfolio-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <IndianRupee size={22} />
              </div>
              <div>
                <span className="portfolio-kpi-label">Group Advance Collected</span>
                <strong className="portfolio-kpi-value">₹{portfolioTotals.totalAdvance.toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </section>

          {/* Section Heading & Filter Bar */}
          <div className="portfolio-section-title-row">
            <div>
              <h2>Select a Hotel to Manage ({filteredHotels.length} Properties)</h2>
              <p>Click on any of your 6 hotels to inspect room status, guests, billing &amp; operations:</p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search filter */}
              <div className="search-input-box" style={{ width: '250px' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search hotel, city..."
                  value={portfolioSearch}
                  onChange={(e) => setPortfolioSearch(e.target.value)}
                  className="search-field"
                />
              </div>

              {/* City filter */}
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="hotel-switcher-select"
              >
                <option value="All">All Cities</option>
                <option value="Mahabaleshwar">Mahabaleshwar</option>
                <option value="Pune">Pune</option>
                <option value="Lonavala">Lonavala</option>
              </select>
            </div>
          </div>

          {/* 6 HOTEL CARDS GRID */}
          <section className="portfolio-hotels-grid">
            {filteredHotels.map(({ hotel, inHouseCount, totalRooms, occupancyRate, totalAdvance }) => (
              <div
                key={hotel.id}
                className="hotel-property-card"
                onClick={() => handleSelectHotel(hotel.id)}
              >
                {/* Card Gradient Header */}
                <div
                  className="hotel-card-header"
                  style={{ background: hotel.accentGradient }}
                >
                  <span className="hotel-card-category-pill">{hotel.category}</span>
                  <div className="hotel-card-rating-chip">
                    <Star size={12} fill="#fbbf24" strokeWidth={0} />
                    <span>{hotel.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="hotel-card-body">
                  <h3 className="hotel-card-name">{hotel.name}</h3>
                  <div className="hotel-card-location">
                    <MapPin size={13} className="text-blue" />
                    <span>{hotel.location}, {hotel.city}</span>
                  </div>
                  <p className="hotel-card-tagline">{hotel.tagline}</p>

                  {/* 4 Mini Metrics */}
                  <div className="hotel-card-metrics-grid">
                    <div className="metric-cell">
                      <span>Total Rooms</span>
                      <strong>{totalRooms}</strong>
                    </div>
                    <div className="metric-cell">
                      <span>In-House</span>
                      <strong className="text-emerald">{inHouseCount}</strong>
                    </div>
                    <div className="metric-cell">
                      <span>Occupancy</span>
                      <strong>{occupancyRate}%</strong>
                    </div>
                    <div className="metric-cell">
                      <span>Advance</span>
                      <strong>₹{totalAdvance.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Occupancy Progress Bar */}
                  <div className="hotel-occupancy-bar-wrap">
                    <div className="hotel-occupancy-label-row">
                      <span>Live Occupancy Status</span>
                      <span>{inHouseCount} of {totalRooms} rooms booked</span>
                    </div>
                    <div className="hotel-occupancy-track">
                      <div
                        className="hotel-occupancy-fill"
                        style={{
                          width: `${Math.min(100, Math.max(6, occupancyRate))}%`,
                          background: occupancyRate > 60 ? '#10b981' : '#3b82f6',
                        }}
                      />
                    </div>
                  </div>

                  {/* Amenities tags */}
                  <div className="hotel-amenities-tags">
                    {hotel.amenities.slice(0, 4).map((amenity) => (
                      <span key={amenity} className="amenity-chip">
                        {amenity}
                      </span>
                    ))}
                  </div>

                  {/* Card Action Button */}
                  <button
                    type="button"
                    className="btn-open-hotel-card"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectHotel(hotel.id);
                    }}
                  >
                    <span>Manage {hotel.code} Dashboard</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </section>
        </>
      ) : (
        /* ========================================================================= */
        /* VIEW B: INDIVIDUAL HOTEL DASHBOARD (When admin clicked a hotel)            */
        /* ========================================================================= */
        <>
          {/* Top Switcher & Return Bar */}
          <div className="hotel-view-top-bar">
            <div className="hotel-view-nav-left">
              <button
                type="button"
                onClick={() => handleSelectHotel(null)}
                className="btn-back-portfolio"
              >
                <ArrowLeft size={15} />
                <span>All 6 Hotels Portfolio</span>
              </button>

              <div
                className="hotel-active-badge-pill"
                style={{ background: selectedHotel.accentGradient }}
              >
                <span>{selectedHotel.code}</span>
                <span>•</span>
                <span>{selectedHotel.name}</span>
                <span>•</span>
                <span>{selectedHotel.city}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#64748b' }}>
                Switch Property:
              </span>
              <select
                value={selectedHotel.id}
                onChange={(e) => {
                  if (e.target.value === 'all') handleSelectHotel(null);
                  else handleSelectHotel(e.target.value);
                }}
                className="hotel-switcher-select"
              >
                <option value="all">📂 View All 6 Hotels</option>
                {HOTELS_PORTFOLIO.map((h) => (
                  <option key={h.id} value={h.id}>
                    🏨 {h.name} ({h.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hotel Specific Hero Header */}
          <header className="modern-dashboard-hero">
            <div className="hero-left">
              <div className="hero-badge">
                <span className="live-pulse" />
                <span>{selectedHotel.code} LIVE • {selectedHotel.category}</span>
              </div>
              <h1 className="hero-title">{selectedHotel.name}</h1>
              <p className="hero-subtitle">
                <MapPin size={15} />
                <span>{selectedHotel.location}, {selectedHotel.city}</span>
                <span className="bullet-sep">•</span>
                <Phone size={14} />
                <span>{selectedHotel.phone}</span>
                <span className="bullet-sep">•</span>
                <Clock size={14} />
                <span>{timeString || 'Live Clock Active'}</span>
              </p>
            </div>

            <div className="hero-actions">
              <button 
                onClick={fetchCheckins} 
                className="btn-action-glass"
                title="Refresh Live Data"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>

              <button 
                onClick={handleExportCSV} 
                className="btn-action-glass"
                title="Download Hotel Guests CSV"
              >
                <Download size={16} />
                <span>Export CSV</span>
              </button>

              <Link href="/reception?tab=checkin" className="btn-action-glow">
                <PlusCircle size={18} />
                <span>New Check-In</span>
              </Link>
            </div>
          </header>

          {/* Hotel Specific KPI Cards Grid */}
          <section className="kpi-cards-grid">
            {/* Card 1: Total Registered Guests */}
            <div className="kpi-card card-blue">
              <div className="kpi-card-header">
                <div className="kpi-icon-pill icon-blue">
                  <Users size={22} />
                </div>
                <span className="kpi-tag tag-blue">Hotel Base</span>
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{hotelTotalGuests}</span>
                <span className="kpi-label">Registered Guests</span>
              </div>
              <div className="kpi-footer">
                <span className="kpi-subtext">
                  <strong className="text-emerald">{hotelActiveCheckedIn}</strong> in-house currently
                </span>
              </div>
            </div>

            {/* Card 2: Occupancy Rate */}
            <div className="kpi-card card-purple">
              <div className="kpi-card-header">
                <div className="kpi-icon-pill icon-purple">
                  <Building2 size={22} />
                </div>
                <span className="kpi-tag tag-purple">{hotelOccupancyRate}% Occupancy</span>
              </div>
              <div className="kpi-data">
                <span className="kpi-value">
                  {hotelTotalOccupiedRooms} <span className="kpi-value-denom">/ {hotelTotalRoomsCount}</span>
                </span>
                <span className="kpi-label">Rooms Occupied</span>
              </div>
              <div className="kpi-footer">
                <div className="mini-progress-track">
                  <div 
                    className="mini-progress-bar" 
                    style={{ width: `${Math.min(100, Math.max(8, hotelOccupancyRate))}%` }} 
                  />
                </div>
                <span className="kpi-subtext text-muted">
                  {hotelTotalAvailableRooms} rooms available
                </span>
              </div>
            </div>

            {/* Card 3: Total Advance Revenue */}
            <div className="kpi-card card-emerald">
              <div className="kpi-card-header">
                <div className="kpi-icon-pill icon-emerald">
                  <IndianRupee size={22} />
                </div>
                <span className="kpi-tag tag-emerald">Hotel Realized</span>
              </div>
              <div className="kpi-data">
                <span className="kpi-value">₹{hotelTotalAdvance.toLocaleString('en-IN')}</span>
                <span className="kpi-label">Advance Revenue</span>
              </div>
              <div className="kpi-footer">
                <span className="kpi-subtext">
                  <TrendingUp size={13} className="text-emerald" style={{ display: 'inline', marginRight: 4 }} />
                  Recorded advance deposits
                </span>
              </div>
            </div>

            {/* Card 4: Operations & Checkouts */}
            <div className="kpi-card card-amber">
              <div className="kpi-card-header">
                <div className="kpi-icon-pill icon-amber">
                  <CalendarCheck size={22} />
                </div>
                <span className="kpi-tag tag-amber">Daily Agenda</span>
              </div>
              <div className="kpi-data">
                <span className="kpi-value">{hotelDueCheckoutsToday}</span>
                <span className="kpi-label">Check-Outs Due Today</span>
              </div>
              <div className="kpi-footer">
                <span className="kpi-subtext">
                  Standard checkout: <strong>11:00 AM</strong>
                </span>
              </div>
            </div>
          </section>

          {/* Navigation Tabs Bar for Selected Hotel */}
          <section className="dashboard-tabs-bar">
            <div className="tabs-pill-container">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`tab-item-btn ${activeTab === 'rooms' ? 'active' : ''}`}
              >
                <BedDouble size={17} />
                <span>Room Status Matrix</span>
                <span className="tab-counter">{hotelTotalRoomsCount}</span>
              </button>

              <button
                onClick={() => setActiveTab('guests')}
                className={`tab-item-btn ${activeTab === 'guests' ? 'active' : ''}`}
              >
                <Users size={17} />
                <span>Hotel Guests</span>
                <span className="tab-counter">{currentHotelCheckins.length}</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`tab-item-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              >
                <BarChart3 size={17} />
                <span>Analytics &amp; Insights</span>
              </button>
            </div>

            <div className="tab-context-badge">
              <Building2 size={14} style={{ color: '#1e3a8a' }} />
              <span>MANAGING: {selectedHotel.name.toUpperCase()}</span>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* TAB 1: ROOM STATUS MATRIX                                                */}
          {/* ========================================================================= */}
          {activeTab === 'rooms' && (
            <section className="dashboard-content-section">
              {/* Filter controls toolbar */}
              <div className="matrix-toolbar">
                <div className="matrix-toolbar-row-top">
                  <div className="matrix-filters-group">
                    <span className="filter-label-styled">
                      <Layers size={13} />
                      <span>Floor:</span>
                    </span>
                    <div className="pill-group">
                      {(['All', 1, 2, 3] as const).map((floor) => {
                        const count = floor === 'All' 
                          ? hotelRooms.length 
                          : hotelRooms.filter(r => r.floor === floor).length;
                        return (
                          <button
                            key={floor}
                            onClick={() => setFloorFilter(floor)}
                            className={`pill-btn ${floorFilter === floor ? 'active' : ''}`}
                          >
                            {floor === 'All' ? 'All Floors' : `Floor ${floor}`} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <span className="filter-label-styled" style={{ marginLeft: '0.5rem' }}>
                      <Filter size={13} />
                      <span>Status:</span>
                    </span>
                    <div className="pill-group">
                      {(['All', 'Available', 'Occupied'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setRoomStatusFilter(st)}
                          className={`pill-btn ${roomStatusFilter === st ? 'active' : ''}`}
                        >
                          {st === 'All' ? 'All Rooms' : st}
                        </button>
                      ))}
                    </div>

                    <span className="filter-label-styled" style={{ marginLeft: '0.5rem' }}>
                      <Award size={13} />
                      <span>Tier:</span>
                    </span>
                    <div className="pill-group">
                      {['All', 'Deluxe', 'Super Deluxe', 'Executive Suite', 'Presidential Suite'].map((tier) => (
                        <button
                          key={tier}
                          onClick={() => setRoomTypeFilter(tier)}
                          className={`pill-btn ${roomTypeFilter === tier ? 'active' : ''}`}
                        >
                          {tier === 'All' ? 'All Tiers' : tier.replace(' Suite', '')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="matrix-search-box">
                    <Search size={14} style={{ color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search room no or guest..."
                      value={roomSearchQuery}
                      onChange={(e) => setRoomSearchQuery(e.target.value)}
                    />
                    {roomSearchQuery && (
                      <button 
                        onClick={() => setRoomSearchQuery('')} 
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="matrix-legend-strip">
                  <div className="matrix-legend-chip">
                    <span className="pulse-indicator occupied" />
                    <span>Occupied ({hotelTotalOccupiedRooms})</span>
                  </div>
                  <div className="matrix-legend-chip">
                    <span className="pulse-indicator available" />
                    <span>Available &amp; Ready ({hotelTotalAvailableRooms})</span>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.775rem', color: '#64748b' }}>
                    Showing <strong>{displayedHotelRooms.length}</strong> of {hotelRooms.length} rooms
                  </div>
                </div>
              </div>

              {/* Rooms Grid */}
              {displayedHotelRooms.length === 0 ? (
                <div className="guests-directory-card">
                  <div className="table-empty-container">
                    <div className="table-empty-icon">
                      <BedDouble size={26} />
                    </div>
                    <h4 className="table-empty-title">No rooms match your filter criteria</h4>
                    <p className="table-empty-desc">
                      Try clearing the floor, status, or search filters to view all rooms in {selectedHotel.name}.
                    </p>
                    <button
                      onClick={() => {
                        setFloorFilter('All');
                        setRoomStatusFilter('All');
                        setRoomTypeFilter('All');
                        setRoomSearchQuery('');
                      }}
                      className="pill-btn active"
                      style={{ marginTop: '0.5rem', padding: '0.5rem 1.25rem' }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rooms-luxury-grid">
                  {displayedHotelRooms.map((room) => {
                    const occupant = occupiedRoomMap.get(room.roomNo);
                    const isOccupied = !!occupant;

                    const tierClass = 
                      room.type === 'Presidential Suite' ? 'tier-presidential-suite' :
                      room.type === 'Executive Suite' ? 'tier-executive-suite' :
                      room.type === 'Super Deluxe' ? 'tier-super-deluxe' : 'tier-deluxe';

                    return (
                      <div
                        key={room.roomNo}
                        className={`room-luxury-card ${isOccupied ? 'is-occupied' : 'is-vacant'}`}
                        onClick={() => occupant && setSelectedGuest(occupant)}
                        style={{ cursor: occupant ? 'pointer' : 'default' }}
                      >
                        <div className="room-card-head">
                          <div className="room-identifier-box">
                            <span className="room-badge-label">Room</span>
                            <span className="room-number-display">{room.roomNo}</span>
                            <span className="room-floor-tag">Floor {room.floor}</span>
                          </div>

                          <span className={`status-pill-luxury ${isOccupied ? 'occupied' : 'available'}`}>
                            <span className="status-pill-dot" />
                            <span>{isOccupied ? 'Occupied' : 'Available'}</span>
                          </span>
                        </div>

                        <div className="room-card-content">
                          <div className="room-type-and-price">
                            <span className={`room-tier-badge ${tierClass}`}>{room.type}</span>
                            <div className="room-tariff-figure">
                              ₹{room.rate.toLocaleString('en-IN')} <span>/ night</span>
                            </div>
                          </div>

                          {isOccupied && occupant ? (
                            <div className="occupant-luxury-box">
                              <div className="occupant-avatar-circle">
                                {occupant.name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="occupant-details-meta">
                                <span className="occupant-guest-name">{occupant.name}</span>
                                <div className="occupant-sub-meta">
                                  <span className="slip-tag-mini">#{occupant.srNo}</span>
                                  <span>•</span>
                                  <span>{occupant.nightsStay} Night{Number(occupant.nightsStay) > 1 ? 's' : ''} ({occupant.adults}A)</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="vacant-luxury-banner">
                              <Sparkles size={18} className="vacant-clean-icon" />
                              <div className="vacant-text-wrap">
                                <span className="vacant-text-title">Housekeeping Verified</span>
                                <span className="vacant-text-sub">Sanitized &amp; Ready for Instant Check-In</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="room-card-actions-row">
                          {isOccupied && occupant ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedGuest(occupant);
                                }}
                                className="btn-luxury-view-slip"
                                title="View Registration Voucher"
                              >
                                <Eye size={14} />
                                <span>View Slip</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(occupant);
                                }}
                                className="btn-luxury-checkout"
                                disabled={updatingId === occupant.id}
                                title="Check Out Guest"
                              >
                                <LogOut size={14} />
                                <span>Check Out</span>
                              </button>
                            </>
                          ) : (
                            <Link
                              href={`/reception?tab=checkin&room=${room.roomNo}&hotel=${selectedHotel.id}`}
                              className="btn-luxury-book"
                            >
                              <PlusCircle size={15} />
                              <span>Book Room {room.roomNo}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HOTEL GUESTS DIRECTORY                                            */}
          {/* ========================================================================= */}
          {activeTab === 'guests' && (
            <section className="dashboard-content-section">
              <div className="guests-directory-card">
                {/* Directory Header Toolbar */}
                <div className="directory-toolbar">
                  <div className="search-field-luxury">
                    <Search size={18} style={{ color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search by guest name, mobile, room no or slip number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="directory-actions-right">
                    <div className="status-filter-pills">
                      {(['All', 'Checked In', 'Checked Out'] as const).map((st) => {
                        const count = st === 'All'
                          ? currentHotelCheckins.length
                          : currentHotelCheckins.filter(c => c.status === st).length;
                        return (
                          <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`status-filter-btn ${statusFilter === st ? 'active' : ''}`}
                          >
                            {st} ({count})
                          </button>
                        );
                      })}
                    </div>

                    <button onClick={handleExportCSV} className="btn-export-luxury" title="Export CSV Report">
                      <Download size={15} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Modern Data Table */}
                <div className="table-scroll-container">
                  <table className="table-luxury">
                    <thead>
                      <tr>
                        <th>Slip #</th>
                        <th>Guest Details</th>
                        <th>Room &amp; Tier</th>
                        <th>Stay Itinerary</th>
                        <th>Lead Channel</th>
                        <th>Advance &amp; Voucher</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHotelCheckins.length === 0 ? (
                        <tr>
                          <td colSpan={8}>
                            <div className="table-empty-container">
                              <div className="table-empty-icon">
                                <Users size={28} />
                              </div>
                              <h4 className="table-empty-title">No guest records found for {selectedHotel.name}</h4>
                              <p className="table-empty-desc">
                                We couldn't find any check-in registrations matching your search or status criteria.
                              </p>
                              {searchQuery && (
                                <button
                                  onClick={() => setSearchQuery('')}
                                  className="pill-btn active"
                                  style={{ marginTop: '0.5rem', padding: '0.45rem 1.15rem' }}
                                >
                                  Clear Search Query
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredHotelCheckins.map((guest) => {
                          const isCheckedIn = guest.status === 'Checked In';
                          const matchedRoom = hotelRooms.find((r) => r.roomNo === guest.roomNo);

                          return (
                            <tr key={guest.id} className={isCheckedIn ? 'row-inhouse' : 'row-completed'}>
                              <td>
                                <span className="slip-code-pill">#{guest.srNo}</span>
                              </td>
                              <td>
                                <div className="guest-cell-wrapper">
                                  <div className="guest-avatar-luxury">
                                    {guest.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="guest-name-luxury">{guest.name}</div>
                                    <div className="guest-contact-luxury">
                                      <span>📞 {guest.mobile}</span>
                                      {guest.email && <span>• ✉️ {guest.email}</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span className="room-badge-table">
                                    <BedDouble size={13} style={{ color: '#1e3a8a' }} />
                                    <span>Room {guest.roomNo}</span>
                                  </span>
                                  {matchedRoom && (
                                    <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 600 }}>
                                      {matchedRoom.type} (Fl {matchedRoom.floor})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="stay-itinerary-cell">
                                  <span className="stay-dates-range">
                                    <span>{guest.checkInDate}</span>
                                    <span>➔</span>
                                    <span>{guest.checkOutDate || 'TBD'}</span>
                                  </span>
                                  <span className="stay-duration-tag">
                                    {guest.nightsStay} Night{Number(guest.nightsStay) > 1 ? 's' : ''} • {guest.adults}A, {guest.children}C
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className="lead-channel-chip">
                                  {guest.leadSource || 'Direct Walk-in'}
                                </span>
                              </td>
                              <td>
                                <div className="advance-amount-cell">
                                  <span className="advance-amount-figure">
                                    ₹{Number(guest.advanceAmount || 0).toLocaleString('en-IN')}
                                  </span>
                                  <span className="advance-voucher-id">
                                    {guest.receiptNo || 'VOUCHER-AUTO'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span className={`status-pill-luxury ${isCheckedIn ? 'available' : 'occupied'}`} style={{ fontSize: '0.7rem' }}>
                                  <span className="status-pill-dot" />
                                  <span>{guest.status}</span>
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <div className="table-actions-group">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedGuest(guest)}
                                    className="btn-table-slip"
                                    title="View Registration Voucher"
                                  >
                                    <Eye size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatus(guest)}
                                    className={`btn-table-status-action ${isCheckedIn ? 'checkout' : 'reopen'}`}
                                    disabled={updatingId === guest.id}
                                    title={isCheckedIn ? 'Check Out Guest' : 'Re-open Stay'}
                                  >
                                    <LogOut size={13} />
                                    <span>{isCheckedIn ? 'Check Out' : 'Re-open'}</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HOTEL ANALYTICS & INSIGHTS                                         */}
          {/* ========================================================================= */}
          {activeTab === 'analytics' && (
            <section className="dashboard-content-section">
              {/* Top 4 KPI Metrics */}
              <div className="analytics-hero-grid">
                {/* Metric 1: Real-time Occupancy */}
                <div className="analytics-stat-card stat-card-occupancy">
                  <div className="stat-card-header">
                    <div className="stat-icon-badge stat-icon-blue">
                      <Building2 size={22} />
                    </div>
                    <span className="stat-tag-pill tag-blue">Real-Time</span>
                  </div>
                  <div className="stat-main-metric">
                    <span className="stat-metric-number">{analyticsMetrics.occupancyRate}%</span>
                    <span className="stat-metric-caption">Property Occupancy</span>
                  </div>
                  <div className="stat-card-footer">
                    <div className="progress-track-luxury">
                      <div 
                        className="progress-fill-blue" 
                        style={{ width: `${Math.min(100, Math.max(6, analyticsMetrics.occupancyRate))}%` }} 
                      />
                    </div>
                    <div className="stat-detail-row">
                      <span>Occupied: <strong>{analyticsMetrics.occupiedCount} Keys</strong></span>
                      <span>Vacant: <strong>{analyticsMetrics.availableCount} Keys</strong></span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Revenue & Collections */}
                <div className="analytics-stat-card stat-card-revenue">
                  <div className="stat-card-header">
                    <div className="stat-icon-badge stat-icon-emerald">
                      <IndianRupee size={22} />
                    </div>
                    <span className="stat-tag-pill tag-emerald">Deposits</span>
                  </div>
                  <div className="stat-main-metric">
                    <span className="stat-metric-number">₹{analyticsMetrics.totalAdvance.toLocaleString('en-IN')}</span>
                    <span className="stat-metric-caption">Realized Advance</span>
                  </div>
                  <div className="stat-card-footer">
                    <div className="stat-detail-row">
                      <span>Average Daily Rate (ADR):</span>
                      <strong>₹{analyticsMetrics.adr.toLocaleString('en-IN')} / night</strong>
                    </div>
                    <div className="stat-detail-row">
                      <span>RevPAR Yield:</span>
                      <strong>₹{analyticsMetrics.revPar.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Metric 3: In-House Guest Census */}
                <div className="analytics-stat-card stat-card-capacity">
                  <div className="stat-card-header">
                    <div className="stat-icon-badge stat-icon-purple">
                      <Users size={22} />
                    </div>
                    <span className="stat-tag-pill tag-purple">In-House</span>
                  </div>
                  <div className="stat-main-metric">
                    <span className="stat-metric-number">{analyticsMetrics.totalInHouseGuestsCount}</span>
                    <span className="stat-metric-caption">Guests In-House</span>
                  </div>
                  <div className="stat-card-footer">
                    <div className="stat-detail-row">
                      <span>Adults / Children:</span>
                      <strong>{analyticsMetrics.totalAdults} Adults, {analyticsMetrics.totalChildren} Kids</strong>
                    </div>
                    <div className="stat-detail-row">
                      <span>Avg Stay Duration:</span>
                      <strong>{analyticsMetrics.avgStay} Nights</strong>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Operational Turnover */}
                <div className="analytics-stat-card stat-card-channels">
                  <div className="stat-card-header">
                    <div className="stat-icon-badge stat-icon-amber">
                      <CalendarCheck size={22} />
                    </div>
                    <span className="stat-tag-pill tag-amber">Daily Agenda</span>
                  </div>
                  <div className="stat-main-metric">
                    <span className="stat-metric-number">{hotelDueCheckoutsToday}</span>
                    <span className="stat-metric-caption">Check-Outs Due Today</span>
                  </div>
                  <div className="stat-card-footer">
                    <div className="stat-detail-row">
                      <span>Standard Checkout:</span>
                      <strong>11:00 AM</strong>
                    </div>
                    <div className="stat-detail-row">
                      <span>Standard Check-in:</span>
                      <strong>12:00 PM</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Analytical Breakdown */}
              <div className="analytics-two-col">
                {/* Left Panel: Booking Channel & Lead Sources */}
                <div className="analytics-panel-card">
                  <div className="panel-header-luxury">
                    <div className="panel-title-group">
                      <div className="stat-icon-badge stat-icon-blue" style={{ width: 36, height: 36 }}>
                        <Globe size={18} />
                      </div>
                      <div>
                        <h3>Booking Channels &amp; Demand Sources</h3>
                        <p>Distribution between Direct Front Desk and OTA Platforms</p>
                      </div>
                    </div>
                  </div>

                  <div className="channels-breakdown-list">
                    {Object.entries(analyticsMetrics.sourceCounts).length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No reservation source records available yet.</p>
                    ) : (
                      Object.entries(analyticsMetrics.sourceCounts).map(([channel, count]) => {
                        const pct = Math.round((count / analyticsMetrics.totalChannelBookings) * 100);
                        const isOta = !channel.toLowerCase().includes('walk-in') && !channel.toLowerCase().includes('front desk');

                        return (
                          <div key={channel} className="channel-progress-item">
                            <div className="channel-meta-row">
                              <span className="channel-name">
                                {isOta ? '🌐' : '🏨'} {channel}
                              </span>
                              <span className="channel-stats-text">
                                {count} Booking{count > 1 ? 's' : ''} • {pct}%
                              </span>
                            </div>
                            <div className="channel-bar-bg">
                              <div
                                className="channel-bar-fill"
                                style={{
                                  width: `${pct}%`,
                                  background: isOta ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #10b981, #34d399)'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Panel: Room Tier Breakdown & Inventory Yield */}
                <div className="analytics-panel-card">
                  <div className="panel-header-luxury">
                    <div className="panel-title-group">
                      <div className="stat-icon-badge stat-icon-purple" style={{ width: 36, height: 36 }}>
                        <BedDouble size={18} />
                      </div>
                      <div>
                        <h3>Room Inventory &amp; Tier Yield</h3>
                        <p>Occupancy and pricing breakdown by suite category</p>
                      </div>
                    </div>
                  </div>

                  <table className="tier-yield-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Keys</th>
                        <th>Occupied</th>
                        <th>Occupancy</th>
                        <th>Base Tariff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsMetrics.tierOrder.map((tierName) => {
                        const data = analyticsMetrics.tierMap[tierName] || { total: 0, occupied: 0, rates: [] };
                        if (data.total === 0) return null;
                        const occPct = Math.round((data.occupied / data.total) * 100);
                        const minRate = data.rates.length > 0 ? Math.min(...data.rates) : 0;
                        const maxRate = data.rates.length > 0 ? Math.max(...data.rates) : 0;
                        const rateDisplay = minRate === maxRate ? `₹${minRate.toLocaleString('en-IN')}` : `₹${minRate.toLocaleString('en-IN')} - ₹${maxRate.toLocaleString('en-IN')}`;

                        return (
                          <tr key={tierName}>
                            <td className="tier-title-cell">
                              <span>{tierName}</span>
                            </td>
                            <td><strong>{data.total}</strong></td>
                            <td>
                              <span style={{ color: data.occupied > 0 ? '#e11d48' : '#64748b', fontWeight: 700 }}>
                                {data.occupied}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: occPct > 0 ? '#2563eb' : '#64748b' }}>
                                {occPct}%
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>{rateDisplay}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Operational Banner */}
              <div className="operations-banner-card">
                <div className="operations-banner-left">
                  <div className="operations-banner-title">
                    <ShieldCheck size={20} style={{ color: '#34d399' }} />
                    <span>Hospitality Standard &amp; Housekeeping Operations</span>
                  </div>
                  <p className="operations-banner-sub">
                    Live operational synchronization across {selectedHotel.name} front desk, housekeeping &amp; billing terminals.
                  </p>
                </div>

                <div className="operations-chips-group">
                  <div className="ops-chip">
                    <span className="ops-chip-label">Clean &amp; Ready</span>
                    <span className="ops-chip-val">{analyticsMetrics.availableCount} Rooms</span>
                  </div>
                  <div className="ops-chip">
                    <span className="ops-chip-label">In-House Folios</span>
                    <span className="ops-chip-val">{analyticsMetrics.occupiedCount} Active</span>
                  </div>
                  <div className="ops-chip">
                    <span className="ops-chip-label">Property Rating</span>
                    <span className="ops-chip-val">★ {selectedHotel.rating} / 5.0</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW OFFICIAL GUEST REGISTRATION SLIP                              */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL: VIEW OFFICIAL GUEST REGISTRATION SLIP                              */}
      {/* ========================================================================= */}
      {selectedGuest && (() => {
        const guestHotel = (selectedGuest.hotelId ? HOTELS_PORTFOLIO.find(h => h.id === selectedGuest.hotelId) : null) || selectedHotel || HOTELS_PORTFOLIO[0];
        const guestRoom = guestHotel?.rooms.find(r => r.roomNo === selectedGuest.roomNo);

        return (
          <div className="modal-overlay" onClick={() => setSelectedGuest(null)}>
            <div className="modern-slip-modal" onClick={(e) => e.stopPropagation()}>
              {/* Modal Top Sticky Header */}
              <div className="modal-top-bar">
                <div className="modal-bar-title">
                  <FileText size={18} style={{ color: '#1e3a8a' }} />
                  <span>Guest Registration Card</span>
                  <span className="slip-voucher-pill">SLIP #{selectedGuest.srNo}</span>
                </div>

                <div className="modal-actions-right">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-print-slip"
                    title="Print Registration Card"
                  >
                    <Printer size={15} />
                    <span>Print Slip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGuest(null)}
                    className="btn-modal-close"
                    title="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Printable Registration Slip Body */}
              <div className="slip-printable-body">
                <div className="slip-paper-card">
                  {/* Luxury Hotel Letterhead */}
                  <div className="slip-letterhead">
                    <div className="slip-hotel-left">
                      <div className="slip-hotel-crest">
                        {guestHotel.code || 'PH'}
                      </div>
                      <div className="slip-hotel-details">
                        <h2>{guestHotel.name}</h2>
                        <p>★★★★★ • {guestHotel.category.toUpperCase()}</p>
                        <span>{guestHotel.location}, {guestHotel.city} • Tel: {guestHotel.phone}</span>
                      </div>
                    </div>

                    <div className="slip-stamp-box">
                      <span className="slip-stamp-title">OFFICIAL REGISTRATION</span>
                      <span className="slip-stamp-sr">#{selectedGuest.srNo}</span>
                      <span className="slip-stamp-date">{selectedGuest.date}</span>
                    </div>
                  </div>

                  {/* Title Banner */}
                  <div className="slip-title-banner">
                    <span>GUEST REGISTRATION CARD &amp; STAY VOUCHER</span>
                  </div>

                  {/* Structured Details Sections */}
                  <div className="slip-data-content">
                    {/* Section 1: Guest Information */}
                    <div className="slip-section-panel">
                      <div className="slip-section-head">
                        <Users size={14} />
                        <span>Guest Particulars</span>
                      </div>

                      <div className="slip-grid-2">
                        <div className="slip-row">
                          <strong>Registration No. :</strong>
                          <span className="highlight-text">#{selectedGuest.srNo}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Registration Date :</strong>
                          <span>{selectedGuest.date}</span>
                        </div>
                        <div className="slip-row full-width">
                          <strong>Guest Full Name :</strong>
                          <span className="guest-name-callout">{selectedGuest.name}</span>
                        </div>
                        <div className="slip-row full-width">
                          <strong>Residential Address :</strong>
                          <span>{selectedGuest.address || 'Address On File with Front Desk'}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Contact Mobile :</strong>
                          <span>{selectedGuest.mobile}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Email Address :</strong>
                          <span>{selectedGuest.email || '—'}</span>
                        </div>
                        <div className="slip-row full-width">
                          <strong>Identity Document :</strong>
                          <span>
                            {selectedGuest.idProofType || 'Aadhaar Card'} • {selectedGuest.idProofNumber || 'ID-VERIFIED-PHYSICAL'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Reservation & Stay Details */}
                    <div className="slip-section-panel">
                      <div className="slip-section-head">
                        <BedDouble size={14} />
                        <span>Stay &amp; Reservation Details</span>
                      </div>

                      <div className="slip-grid-2">
                        <div className="slip-row">
                          <strong>Assigned Room :</strong>
                          <span style={{ color: '#1e3a8a', fontWeight: 800 }}>
                            Room {selectedGuest.roomNo} {guestRoom ? `(${guestRoom.type} • Floor ${guestRoom.floor})` : ''}
                          </span>
                        </div>
                        <div className="slip-row">
                          <strong>Booking Channel :</strong>
                          <span className="badge-source-slip">{selectedGuest.leadSource || 'Direct Walk-in'}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Check-In Timestamp :</strong>
                          <span>{selectedGuest.checkInDate} at {selectedGuest.checkInTime || '12:00 PM'}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Check-Out Date :</strong>
                          <span>{selectedGuest.checkOutDate || 'TBD'} by {selectedGuest.checkOutTime || '11:00 AM'}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Length of Stay :</strong>
                          <span>{selectedGuest.nightsStay} Night{Number(selectedGuest.nightsStay) > 1 ? 's' : ''}</span>
                        </div>
                        <div className="slip-row">
                          <strong>Guest Census :</strong>
                          <span>{selectedGuest.adults} Adults, {selectedGuest.children} Children</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Office Use & Financial Settlement */}
                    <div className="slip-office-box">
                      <div className="slip-office-title">FOR FRONT DESK &amp; AUDIT USE ONLY</div>

                      <div className="slip-office-grid">
                        <div>
                          <span className="office-field-label">Assigned Room</span>
                          <div className="office-field-val room-highlight">
                            Room {selectedGuest.roomNo}
                          </div>
                        </div>
                        <div>
                          <span className="office-field-label">Advance Deposited</span>
                          <div className="office-field-val advance-highlight">
                            ₹{Number(selectedGuest.advanceAmount || 0).toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div>
                          <span className="office-field-label">Receipt Voucher Ref</span>
                          <div className="office-field-val" style={{ fontFamily: 'monospace' }}>
                            {selectedGuest.receiptNo || 'VOUCHER-AUTO'}
                          </div>
                        </div>
                      </div>

                      <div className="slip-agreement-text">
                        ✓ I agree to release <strong>Room No. {selectedGuest.roomNo}</strong> by 11:00 AM on the Check-Out Date ({selectedGuest.checkOutDate || 'Scheduled Departure'}). I agree to abide by all resort rules &amp; hotel policies.
                      </div>

                      {/* Signatures */}
                      <div className="slip-signature-box">
                        <div className="slip-sig-inner">
                          {selectedGuest.signature ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selectedGuest.signature}
                              alt="Guest Signature"
                              className="slip-sig-image"
                            />
                          ) : (
                            <div className="slip-sig-placeholder">
                              {selectedGuest.name}
                            </div>
                          )}
                          <div className="slip-sig-line">
                            <span>Guest Signature</span>
                            {selectedGuest.signedAt && (
                              <span className="slip-sig-date">Signed on {new Date(selectedGuest.signedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="slip-sig-inner">
                          <div className="slip-manager-sign">
                            {guestHotel.name}
                          </div>
                          <div className="slip-sig-line">
                            <span>Authorized Front Desk Officer</span>
                            <span className="slip-sig-date">Verified &amp; Key Issued</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Notice */}
                    <div className="slip-footer-notice">
                      Thank you for choosing {guestHotel.name}. For Concierge or Room Service assistance, please dial 9 from your room intercom.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="dashboard-wrapper">
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <div className="pulsing-green-dot" style={{ margin: '0 auto 0.75rem' }} />
            <strong>Loading Paradise Hospitality Multi-Hotel Operations Hub...</strong>
          </div>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
