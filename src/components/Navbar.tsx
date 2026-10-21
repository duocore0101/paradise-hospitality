'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, UserPlus, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [guestCount, setGuestCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadCount() {
      try {
        const res = await fetch('/api/checkins');
        const json = await res.json();
        if (json.success && json.data) {
          setGuestCount(json.data.length);
        }
      } catch (e) {
        // ignore
      }
    }
    loadCount();

    // Listen for custom checkin event to update counter live
    const handleCheckin = () => loadCount();
    window.addEventListener('guest-checked-in', handleCheckin);
    return () => window.removeEventListener('guest-checked-in', handleCheckin);
  }, []);

  return (
    <header className="navbar">
      <Link href="/" className="brand">
        <div className="brand-icon">
          <Building2 size={20} />
        </div>
        <div className="brand-text">
          <h1>Paradise Hospitality</h1>
          <p>Management System</p>
        </div>
      </Link>

      <nav className="nav-links">
        <Link
          href="/"
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
        >
          <UserPlus size={16} />
          <span>Reception / Check-In</span>
        </Link>
        <Link
          href="/admin"
          className={`nav-link ${pathname === '/admin' ? 'active' : ''}`}
        >
          <Users size={16} />
          <span>Admin Panel</span>
          {guestCount !== null && (
            <span className="badge-count" title="Total Guests Checked In">
              {guestCount}
            </span>
          )}
        </Link>
      </nav>
    </header>
  );
}
