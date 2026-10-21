'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Hotel,
  KeyRound,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  Sparkles,
  Star,
  Coffee,
  Utensils,
  Wifi,
  Car,
  Clock,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
  Menu,
  BedDouble,
  Compass,
  Award,
  Waves,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function ParadiseHospitalityPage() {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState<'admin' | 'reception' | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [booking, setBooking] = useState({
    checkIn: today,
    checkOut: tomorrow,
    suiteType: 'Presidential Ocean Suite',
    guests: '2 Guests',
  });
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Close modal with ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLoginModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFastLogin = (role: 'admin' | 'reception') => {
    setIsLoggingIn(role);
    setTimeout(() => {
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/reception');
      }
    }, 200);
  };

  const handleBookingCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingToast(`Inquiry for ${booking.suiteType} (${booking.guests}) received! Our concierge will confirm availability.`);
    setTimeout(() => setBookingToast(null), 5000);
  };

  const suites = [
    {
      id: 'presidential',
      title: 'Presidential Ocean Suite',
      price: '₹12,500',
      period: 'per night',
      badge: 'Most Luxurious',
      tagline: 'Panoramic views with private infinity plunge pool & jacuzzi',
      amenities: ['Private Balcony', 'Butler Service', 'King Master Bed', 'Complimentary Champagne'],
      accent: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
    },
    {
      id: 'penthouse',
      title: 'Royal Executive Penthouse',
      price: '₹8,500',
      period: 'per night',
      badge: 'Executive Choice',
      tagline: 'High-floor tranquility tailored for discerning leaders & dignitaries',
      amenities: ['Executive Lounge', 'High-Speed Wi-Fi', 'Marble Bath', 'Workstation'],
      accent: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    },
    {
      id: 'cliffside',
      title: 'Royal Cliffside Villa',
      price: '₹14,200',
      period: 'per night',
      badge: 'Ultra Exclusive',
      tagline: 'Private clifftop panorama with heated plunge pool & sundeck',
      amenities: ['Private Plunge Pool', 'Helipad Access', 'Dedicated Chef', 'Sunset Terrace'],
      accent: 'linear-gradient(135deg, #3b0764 0%, #581c87 100%)',
    },
    {
      id: 'garden',
      title: 'Deluxe Garden Sanctuary',
      price: '₹4,800',
      period: 'per night',
      badge: 'Popular',
      tagline: 'Surrounded by lush botanicals with open-air rain shower',
      amenities: ['Garden Patio', 'Artisanal Breakfast', 'Twin or King Bed', 'Smart Climate'],
      accent: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
    },
    {
      id: 'heritage',
      title: 'Grand Heritage Suite',
      price: '₹6,200',
      period: 'per night',
      badge: 'Heritage Charm',
      tagline: 'Classic architectural opulence paired with ultra-modern luxury',
      amenities: ['Handcrafted Teak Décor', 'Deep Soak Tub', 'Evening High Tea', 'Valet Service'],
      accent: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
    },
    {
      id: 'lagoon',
      title: 'Azure Lagoon Pavilion',
      price: '₹9,800',
      period: 'per night',
      badge: 'Scenic Haven',
      tagline: 'Suspended above tranquil waters with glass floor viewing & jacuzzi',
      amenities: ['Overwater Deck', 'Glass Flooring', 'Marine Lagoon View', 'Spa Hydrotherapy'],
      accent: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)',
    },
  ];

  const amenities = [
    { icon: Utensils, title: 'Michelin-Curated Dining', desc: 'Savor gourmet global cuisines prepared by acclaimed master chefs.' },
    { icon: Waves, title: 'Infinity Sunset Pool', desc: 'Heated panoramic infinity pool overlooking scenic horizons.' },
    { icon: Sparkles, title: 'Serenity Spa & Wellness', desc: 'Ayurvedic treatments, aromatherapy, steam bath, and holistic rejuvenation.' },
    { icon: Clock, title: '24/7 Dedicated Butler', desc: 'Attentive round-the-clock concierge and personalized room service.' },
    { icon: Wifi, title: 'Ultra-Fast Fiber Wi-Fi', desc: 'Seamless high-speed enterprise connectivity throughout the entire estate.' },
    { icon: Car, title: 'Valet & Chauffeur Fleet', desc: 'Airport transfers and private luxury chauffeur service upon request.' },
  ];

  return (
    <div className="paradise-public-page">
      {/* Top Notification Announcement Bar */}
      <div className="paradise-top-bar">
        <div className="paradise-container top-bar-content">
          <div className="top-bar-left">
            <span className="badge-gold">5-STAR RESORT</span>
            <span className="top-bar-text">Welcome to <strong>Paradise Hospitality</strong> — Luxury Suites, Resort &amp; Spa</span>
          </div>
          <div className="top-bar-right">
            <span className="prototype-pill">⚡ Prototype Quick Access</span>
            <button
              onClick={() => setShowLoginModal(true)}
              className="top-bar-login-link"
              title="Fast prototype staff login"
            >
              <KeyRound size={13} />
              <span>Staff Login (Admin / Reception)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Luxury Navigation Bar */}
      <header className="paradise-navbar">
        <div className="paradise-container navbar-inner">
          {/* Brand Logo */}
          <Link href="/" className="paradise-brand">
            <div className="brand-logo-icon">
              <Hotel size={24} />
            </div>
            <div className="brand-titles">
              <span className="brand-main">PARADISE</span>
              <span className="brand-sub">HOSPITALITY</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav-links">
            <a href="#overview" className="nav-item-link">Overview</a>
            <a href="#suites" className="nav-item-link">Suites &amp; Villas</a>
            <a href="#amenities" className="nav-item-link">Amenities</a>
            <a href="#dining" className="nav-item-link">Fine Dining</a>
            <a href="#contact" className="nav-item-link">Contact</a>
          </nav>

          {/* Navbar Right Actions */}
          <div className="navbar-actions">
            {/* Primary Login Button (Opens Modal with 2 Buttons: Admin & Reception) */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn-paradise-login"
              id="navbar-login-btn"
            >
              <KeyRound size={16} />
              <span>Login</span>
            </button>

            <a href="#booking" className="btn-paradise-book">
              <span>Book Stay</span>
              <ArrowRight size={14} />
            </a>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-nav-toggle"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown-menu">
            <a href="#overview" onClick={() => setMobileMenuOpen(false)}>Overview</a>
            <a href="#suites" onClick={() => setMobileMenuOpen(false)}>Suites &amp; Villas</a>
            <a href="#amenities" onClick={() => setMobileMenuOpen(false)}>Amenities</a>
            <a href="#dining" onClick={() => setMobileMenuOpen(false)}>Dining</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <div className="mobile-dropdown-divider" />
            <a
              href="#booking"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-book-stay-link"
            >
              <BedDouble size={16} />
              <span>Book Your Luxury Stay</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLoginModal(true);
              }}
              className="mobile-login-btn"
            >
              <KeyRound size={16} />
              <span>Portal Login (Admin / Reception)</span>
            </button>
          </div>
        )}
      </header>

      {/* Booking Toast Alert */}
      {bookingToast && (
        <div className="paradise-toast-banner">
          <CheckCircle2 size={18} />
          <span>{bookingToast}</span>
          <button onClick={() => setBookingToast(null)} className="toast-dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section id="overview" className="paradise-hero">
        <div className="hero-backdrop-glow" />
        <div className="paradise-container hero-container">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <Sparkles size={14} className="text-amber-400" />
              <span>WORLD-CLASS 5-STAR HOSPITALITY</span>
            </div>

            <h1 className="hero-headline">
              Where Elegance Meets <br />
              <span className="hero-gradient-text">Serene Luxury</span>
            </h1>

            <p className="hero-description">
              Welcome to <strong>Paradise Hospitality</strong>. Experience the zenith of refined living with
              bespoke suites, Michelin-standard culinary craft, and 24/7 personalized concierge service tailored to your every desire.
            </p>

            <div className="hero-cta-group">
              <a href="#suites" className="btn-hero-primary">
                <span>Explore Luxury Suites</span>
                <ChevronRight size={16} />
              </a>

              {/* Fast Login Button in Hero */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn-hero-secondary"
              >
                <Lock size={16} />
                <span>Staff &amp; Portal Login</span>
              </button>
            </div>

            {/* Quick Hero Stats */}
            <div className="hero-stats-row">
              <div className="stat-box">
                <span className="stat-number">18</span>
                <span className="stat-label">Luxury Suites</span>
              </div>
              <div className="stat-sep" />
              <div className="stat-box">
                <span className="stat-number">4.95 ★</span>
                <span className="stat-label">Guest Rating</span>
              </div>
              <div className="stat-sep" />
              <div className="stat-box">
                <span className="stat-number">24 / 7</span>
                <span className="stat-label">Personal Butler</span>
              </div>
              <div className="stat-sep" />
              <div className="stat-box">
                <span className="stat-number">100%</span>
                <span className="stat-label">Discretion &amp; Comfort</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* QUICK RESERVATION BAR                                                     */}
      {/* ========================================================================= */}
      <section id="booking" className="paradise-container reservation-bar-wrapper">
        <div className="reservation-card">
          <div className="reservation-header">
            <h3>Plan Your Stay at Paradise</h3>
            <span className="reservation-tag">Best Rate Guarantee Online</span>
          </div>

          <form onSubmit={handleBookingCheck} className="reservation-form">
            <div className="res-field">
              <label>
                <Calendar size={14} /> Check-In
              </label>
              <input
                type="date"
                value={booking.checkIn}
                onChange={(e) => setBooking({ ...booking, checkIn: e.target.value })}
                required
              />
            </div>

            <div className="res-field">
              <label>
                <Calendar size={14} /> Check-Out
              </label>
              <input
                type="date"
                value={booking.checkOut}
                onChange={(e) => setBooking({ ...booking, checkOut: e.target.value })}
                required
              />
            </div>

            <div className="res-field">
              <label>
                <BedDouble size={14} /> Suite Type
              </label>
              <select
                value={booking.suiteType}
                onChange={(e) => setBooking({ ...booking, suiteType: e.target.value })}
              >
                <option value="Presidential Ocean Suite">Presidential Ocean Suite</option>
                <option value="Royal Executive Penthouse">Royal Executive Penthouse</option>
                <option value="Royal Cliffside Villa">Royal Cliffside Villa</option>
                <option value="Deluxe Garden Sanctuary">Deluxe Garden Sanctuary</option>
                <option value="Grand Heritage Suite">Grand Heritage Suite</option>
                <option value="Azure Lagoon Pavilion">Azure Lagoon Pavilion</option>
              </select>
            </div>

            <div className="res-field">
              <label>
                <Users size={14} /> Guests
              </label>
              <select
                value={booking.guests}
                onChange={(e) => setBooking({ ...booking, guests: e.target.value })}
              >
                <option value="1 Guest">1 Guest</option>
                <option value="2 Guests">2 Guests</option>
                <option value="3 Guests">3 Guests</option>
                <option value="4+ Family Suite">4+ Family Suite</option>
              </select>
            </div>

            <button type="submit" className="btn-res-submit">
              <span>Check Rates</span>
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURED SUITES & VILLAS                                                  */}
      {/* ========================================================================= */}
      <section id="suites" className="paradise-section">
        <div className="paradise-container">
          <div className="section-header-center">
            <div className="section-pill">ACCOMMODATIONS</div>
            <h2 className="section-title">Bespoke Suites Crafted for Royalty</h2>
            <p className="section-subtitle">
              Each private sanctuary at Paradise Hospitality is engineered with lavish Italian marble,
              acoustic soundproofing, and custom artisan furnishings.
            </p>
          </div>

          <div className="suites-grid">
            {suites.map((suite) => (
              <div key={suite.id} className="suite-card">
                <div className="suite-card-top" style={{ background: suite.accent }}>
                  <span className="suite-badge-pill">{suite.badge}</span>
                  <h3 className="suite-card-title">{suite.title}</h3>
                  <p className="suite-card-tagline">{suite.tagline}</p>
                </div>

                <div className="suite-card-body">
                  <div className="suite-price-row">
                    <div>
                      <span className="suite-price-num">{suite.price}</span>
                      <span className="suite-price-period"> / {suite.period}</span>
                    </div>
                    <div className="suite-rating">
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span>5.0</span>
                    </div>
                  </div>

                  <ul className="suite-amenities-list">
                    {suite.amenities.map((item, idx) => (
                      <li key={idx}>
                        <CheckCircle2 size={15} className="amenity-check" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => {
                      setBooking({ ...booking, suiteType: suite.title });
                      const el = document.getElementById('booking');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn-suite-reserve"
                  >
                    <span>Select Suite</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RESORT AMENITIES                                                          */}
      {/* ========================================================================= */}
      <section id="amenities" className="paradise-section bg-light-section">
        <div className="paradise-container">
          <div className="section-header-center">
            <div className="section-pill">EXPERIENCES &amp; COMFORT</div>
            <h2 className="section-title">World-Class Signature Amenities</h2>
            <p className="section-subtitle">
              From dawn to dusk, indulge in unparalleled curated services tailored to your personal schedule.
            </p>
          </div>

          <div className="amenities-grid">
            {amenities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="amenity-card">
                  <div className="amenity-icon-box">
                    <Icon size={22} />
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PROTOTYPE MANAGEMENT CALLOUT BANNER                                       */}
      {/* ========================================================================= */}
      <section className="paradise-container management-callout-section">
        <div className="management-callout-card">
          <div className="callout-left">
            <div className="callout-badge">
              <Sparkles size={14} />
              <span>HOTEL MANAGEMENT PORTAL</span>
            </div>
            <h3>Looking for Admin or Reception Operations?</h3>
            <p>
              As this is a prototype demonstration, you can instantly log in to the 
              <strong> Executive Admin Hub</strong> or the <strong>Front Desk Reception Desk</strong> without typing credentials.
            </p>
          </div>

          <div className="callout-buttons">
            <button
              onClick={() => handleFastLogin('admin')}
              className="btn-callout-admin"
              disabled={isLoggingIn !== null}
            >
              <ShieldCheck size={18} />
              <span>Admin Login</span>
            </button>

            <button
              onClick={() => handleFastLogin('reception')}
              className="btn-callout-reception"
              disabled={isLoggingIn !== null}
            >
              <UserCheck size={18} />
              <span>Reception Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CONTACT & FOOTER                                                          */}
      {/* ========================================================================= */}
      <footer id="contact" className="paradise-footer">
        <div className="paradise-container footer-grid">
          <div className="footer-col-brand">
            <div className="footer-brand">
              <Hotel size={22} />
              <span>PARADISE HOSPITALITY</span>
            </div>
            <p className="footer-desc">
              Exquisite 5-Star Hotel, Resort &amp; Luxury Suites. Unrivaled hospitality engineered with grace and precision.
            </p>
            <div className="footer-contact-details">
              <div><MapPin size={14} /> 108 Ocean Boulevard, Paradise Bay</div>
              <div><Phone size={14} /> +91 (022) 8800-PARADISE</div>
              <div><Mail size={14} /> concierge@paradisehospitality.com</div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul>
              <li><a href="#overview">Overview</a></li>
              <li><a href="#suites">Suites &amp; Villas</a></li>
              <li><a href="#amenities">Resort Amenities</a></li>
              <li><a href="#booking">Book A Stay</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Management System</h4>
            <ul>
              <li>
                <button onClick={() => handleFastLogin('admin')} className="footer-link-btn">
                  Admin Dashboard →
                </button>
              </li>
              <li>
                <button onClick={() => handleFastLogin('reception')} className="footer-link-btn">
                  Reception Check-In →
                </button>
              </li>
              <li>
                <button onClick={() => setShowLoginModal(true)} className="footer-link-btn text-amber">
                  ⚡ Quick Role Selector
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="paradise-container footer-bottom-inner">
            <p>© {new Date().getFullYear()} Paradise Hospitality. All Rights Reserved. Luxury Hotel PMS Prototype.</p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="footer-bottom-login-btn"
            >
              <Lock size={12} />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* FAST PROTOTYPE LOGIN MODAL (TRIGGERED BY LOGIN BUTTON)                    */}
      {/* ========================================================================= */}
      {showLoginModal && (
        <div
          className="login-modal-overlay"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="login-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="login-modal-header">
              <div className="login-modal-title-box">
                <div className="modal-shield-icon">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="modal-title">Paradise Hospitality Portal</h3>
                  <p className="modal-sub">Prototype Fast Access • Select Role to Login</p>
                </div>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="btn-modal-close"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Explainer Note */}
            <div className="prototype-instant-banner">
              <Sparkles size={15} />
              <span>
                <strong>Instant Prototype Mode:</strong> Click below to log in directly into either station without entering credentials.
              </span>
            </div>

            {/* Two Fast Login Action Buttons */}
            <div className="login-cards-container">
              {/* BUTTON 1: ADMIN LOGIN */}
              <button
                type="button"
                onClick={() => handleFastLogin('admin')}
                className={`login-choice-card admin-card ${isLoggingIn === 'admin' ? 'logging-in' : ''}`}
                id="btn-admin-login"
                disabled={isLoggingIn !== null}
              >
                <div className="choice-icon-wrap admin-icon">
                  <ShieldCheck size={28} />
                </div>
                <div className="choice-info">
                  <div className="choice-header-row">
                    <h4>Admin Login</h4>
                    <span className="choice-badge admin-badge">Executive Hub</span>
                  </div>
                  <p className="choice-desc">
                    Access executive analytics, 18-room live matrix, financial KPI counters, and the complete guest database.
                  </p>
                  <div className="choice-action-arrow">
                    <span>{isLoggingIn === 'admin' ? 'Logging in...' : 'Enter Admin Dashboard'}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </button>

              {/* BUTTON 2: RECEPTION LOGIN */}
              <button
                type="button"
                onClick={() => handleFastLogin('reception')}
                className={`login-choice-card reception-card ${isLoggingIn === 'reception' ? 'logging-in' : ''}`}
                id="btn-reception-login"
                disabled={isLoggingIn !== null}
              >
                <div className="choice-icon-wrap reception-icon">
                  <UserCheck size={28} />
                </div>
                <div className="choice-info">
                  <div className="choice-header-row">
                    <h4>Reception Login</h4>
                    <span className="choice-badge reception-badge">Front Desk</span>
                  </div>
                  <p className="choice-desc">
                    Access guest registration, fast check-in workflow, serial number assignment, and printable physical slips.
                  </p>
                  <div className="choice-action-arrow">
                    <span>{isLoggingIn === 'reception' ? 'Logging in...' : 'Enter Reception Desk'}</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </button>
            </div>

            {/* Modal Footer Note */}
            <div className="login-modal-footer">
              <Lock size={13} />
              <span>Protected Prototype Session • Paradise Hospitality PMS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
