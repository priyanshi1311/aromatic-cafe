import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../../services';
import { Spinner } from '../../components/UI';
import { StatusBadge } from '../../components/Badge';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await bookingService.getBookingConfirmation(bookingId);
        setBooking(res.data.data);
      } catch {
        setError('Booking not found');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [bookingId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8f5' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 16, fontSize: 14, color: '#64748b' }}>Retrieving your cafe ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px', textAlign: 'center', background: '#fdf8f5' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fff1f2', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>❌</div>
        <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Reservation Not Found</h2>
        <p style={{ fontSize: 14, color: '#64748b', maxWidth: 360, lineHeight: 1.7 }}>
          {error || 'We could not retrieve this reservation. Please check your booking ID.'}
        </p>
        <Link to="/book" className="btn-primary" style={{ textDecoration: 'none', marginTop: 8 }}>
          Make a New Reservation
        </Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper font-sans" style={{ background: '#fdf8f5' }}>
      {/* NAV */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(255, 250, 247, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid #f3d7df' }}>
        <div className="page-container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #fce7ec, #fdf2f4)', border: '1.5px solid #f3d7df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🌸
            </div>
            <span className="font-serif" style={{ fontWeight: 800, color: '#1e293b', fontSize: 18 }}>Aromatic</span>
          </Link>
          <Link to="/book" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', borderRadius: 10, textDecoration: 'none' }}>
            Book Another Table
          </Link>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '48px 0 64px' }}>
        <div className="page-container-sm" style={{ maxWidth: 640 }}>

          {/* Success Badge */}
          <div className="animate-fade-in" style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fce7ec', border: '2px solid #f3d7df', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(216,93,133,0.15)' }}>
              🌸
            </div>
            <div style={{ display: 'inline-block', padding: '4px 16px', borderRadius: 9999, background: '#fce7ec', border: '1px solid #f3d7df', color: '#b83a65', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Reservation Confirmed
            </div>
            <h1 className="font-serif" style={{ fontSize: 34, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.025em', lineHeight: 1.15 }}>
              Your Table is Reserved! ✨
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
              We look forward to welcoming you to our cherry blossom sanctuary.
            </p>
          </div>

          {/* Booking Card */}
          <div style={{ background: '#ffffff', borderRadius: 24, border: '1.5px solid #f3d7df', boxShadow: '0 12px 40px rgba(216,93,133,0.08)', overflow: 'hidden', marginBottom: 24 }} className="animate-fade-in">
            {/* Rose gradient header */}
            <div style={{ background: 'linear-gradient(135deg, #d85d85 0%, #b83a65 100%)', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Booking Reference Voucher
                </p>
                <p style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 24, color: '#ffffff', letterSpacing: '0.06em' }}>
                  {booking.bookingId}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '6px 14px', borderRadius: 10 }}>
                <StatusBadge status={booking.status} />
              </div>
            </div>

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', borderBottom: '1px solid #fce7ec' }}>
              {[
                { label: 'Guest Name', value: booking.customerName, icon: '👤' },
                { label: 'Phone', value: booking.customerPhone || '—', icon: '📞' },
                { label: 'Date', value: booking.date, icon: '📅' },
                { label: 'Time Slot', value: booking.timeSlot, icon: '🕐', accent: true },
                { label: 'Seating Table', value: `Table ${booking.tableNumber}`, icon: '🌸' },
                { label: 'Party Size', value: `${booking.guests} ${booking.guests === 1 ? 'Guest' : 'Guests'}`, icon: '👥' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '18px 24px', borderBottom: i < 4 ? '1px solid #fce7ec' : 'none', borderRight: i % 2 === 0 ? '1px solid #fce7ec' : 'none' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{item.icon}</span> {item.label}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: item.accent ? '#b83a65' : '#1e293b' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #fce7ec' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>📝 Special Requests & Occasion</div>
                <p style={{ fontSize: 13, color: '#b83a65', fontStyle: 'italic', background: '#fdf8f5', padding: '10px 14px', borderRadius: 10, border: '1px solid #f3d7df' }}>
                  "{booking.specialRequests}"
                </p>
              </div>
            )}

            {/* Bottom strip */}
            <div style={{ padding: '16px 24px', background: '#fdf8f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⏱️</span> Please arrive 5–10 minutes before your reservation slot.
              </span>
              <button onClick={() => window.print()} style={{ fontSize: 12, fontWeight: 700, color: '#b83a65', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                Print Cafe Pass 🖨️
              </button>
            </div>
          </div>

          {/* Info tip */}
          <div style={{ padding: '16px 20px', borderRadius: 16, background: '#fff9ea', border: '1.5px solid #fde68a', display: 'flex', gap: 12, alignItems: 'start', marginBottom: 28 }}>
            <span style={{ fontSize: 20 }}>💡</span>
            <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
              <strong>Arrival Tip:</strong> Show this booking reference on your phone upon arrival. Our host will escort you directly to your reserved dining table.
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <a
              href={`https://wa.me/918077049464?text=${encodeURIComponent(
                `*New Reservation Alert — Aromatic Cafe & Restaurant*\n\n` +
                `Hello Aromatic Team,\n` +
                `I have made a table reservation with the following details:\n\n` +
                `🌸 Guest Name: ${booking.customerName}\n` +
                `📞 Guest Phone: ${booking.customerPhone || '—'}\n` +
                `📅 Date: ${booking.date}\n` +
                `🕐 Time Slot: ${booking.timeSlot}\n` +
                `🪑 Table: Table ${booking.tableNumber}\n` +
                `👥 Party Size: ${booking.guests} Guests\n` +
                `🎫 Booking ID: ${booking.bookingId}\n` +
                (booking.specialRequests ? `📝 Special Request: ${booking.specialRequests}\n` : '') +
                `\nDigital Pass Link: ${window.location.href}\n\nPlease confirm my reservation.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 20px',
                borderRadius: 14,
                background: '#25D366',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.25)',
              }}
            >
              <span>💬</span>
              <span>Send to Restaurant WhatsApp</span>
            </a>
            <Link to="/book" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', textDecoration: 'none', fontSize: 14 }}>
              Book Another Table 🌸
            </Link>
            <Link to="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 20px', textDecoration: 'none', fontSize: 14 }}>
              Return to Cafe Home
            </Link>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #f3d7df', background: '#ffffff', padding: '20px 0', textAlign: 'center', fontSize: 12, color: '#64748b' }}>
        Aromatic · Need to adjust your reservation? Call / WhatsApp us at +91 8077049464
      </footer>
    </div>
  );
};

export default BookingSuccess;
