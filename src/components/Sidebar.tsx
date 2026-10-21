'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { 
  Building2, 
  UserPlus, 
  Users, 
  Menu, 
  X, 
  ShieldCheck, 
  Hotel,
  LayoutDashboard,
  Sparkles,
  BedDouble,
  Home,
  LogOut,
  Receipt,
  CreditCard
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'checkin';

  const [inHouseCount, setInHouseCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch('/api/checkins');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setTotalCount(json.data.length);
          const activeInHouse = json.data.filter((g: any) => g.status === 'Checked In').length;
          setInHouseCount(activeInHouse);
        }
      } catch (e) {
        // ignore
      }
    }
    loadCount();

    const handleCheckin = () => loadCount();
    window.addEventListener('guest-checked-in', handleCheckin);
    return () => window.removeEventListener('guest-checked-in', handleCheckin);
  }, []);

  // Close mobile sidebar on route or tab change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, currentTab]);

  // Role-specific navigation items:
  // On reception, do NOT show Admin button.
  // On admin, do NOT show Reception button.
  const isReception = pathname?.startsWith('/reception');

  const navItems = isReception
    ? [
        {
          id: 'checkin',
          label: 'Guest Check-In',
          href: '/reception?tab=checkin',
          icon: UserPlus,
          description: 'Register & allocate room',
          isActive: currentTab === 'checkin' || !searchParams.get('tab'),
        },
        {
          id: 'checkout',
          label: 'Guest Check-Out',
          href: '/reception?tab=checkout',
          icon: LogOut,
          description: 'In-house guests & departure',
          badge: inHouseCount !== null ? `${inHouseCount} In-House` : null,
          isActive: currentTab === 'checkout',
        },
        {
          id: 'billing',
          label: 'Billing & Invoicing',
          href: '/reception?tab=billing',
          icon: Receipt,
          description: 'Folios, taxes & payments',
          isActive: currentTab === 'billing',
        },
        {
          id: 'website',
          label: 'Hotel Website',
          href: '/',
          icon: Home,
          description: 'Exit to public website & portal',
          isActive: pathname === '/',
        },
      ]
    : [
        {
          id: 'admin',
          label: 'Executive Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          description: 'Rooms, KPIs & records',
          badge: totalCount !== null ? `${totalCount} Records` : null,
          isActive: pathname === '/admin',
        },
        {
          id: 'website',
          label: 'Hotel Website',
          href: '/',
          icon: Home,
          description: 'Exit to public website & portal',
          isActive: pathname === '/',
        },
      ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div className="mobile-brand">
          <div className="brand-icon-sm">
            <Hotel size={18} />
          </div>
          <span className="mobile-brand-title">Paradise Hospitality</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="mobile-toggle-btn"
          aria-label="Toggle Navigation Menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Container */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Area */}
        <div className="sidebar-brand-wrapper">
          <Link href={isReception ? '/reception' : '/admin'} className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Hotel size={22} />
            </div>
            <div className="sidebar-brand-text">
              <h2>Paradise Hospitality</h2>
              <span>{isReception ? 'FRONT DESK RECEPTION' : 'HOTEL & LUXURY SUITES'}</span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="sidebar-nav-container">
          <div className="sidebar-section-title">
            {isReception ? 'FRONT DESK TERMINAL' : 'CORE MANAGEMENT'}
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                >
                  <div className="nav-item-icon">
                    <Icon size={19} />
                  </div>
                  <div className="nav-item-content">
                    <span className="nav-item-label">{item.label}</span>
                    <span className="nav-item-desc">{item.description}</span>
                  </div>
                  {item.badge && (
                    <span className="nav-item-badge" title="Total Guests">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-quick-status">
            <div className="quick-status-header">
              <Sparkles size={14} className="text-amber" />
              <span>PROPERTY STATUS</span>
            </div>
            <div className="quick-status-body">
              <div className="status-row">
                <span>Rooms:</span>
                <strong>18 Total Units</strong>
              </div>
              <div className="status-row">
                <span>Rating:</span>
                <span className="text-amber">★★★★★ 5-Star</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="sidebar-footer">
          <div className="system-status-card">
            <div className="status-indicator-dot" />
            <div className="status-info">
              <span className="status-title">{isReception ? 'Reception Desk Live' : 'Executive Hub Live'}</span>
              <span className="status-sub">Paradise Hospitality PMS v2.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
