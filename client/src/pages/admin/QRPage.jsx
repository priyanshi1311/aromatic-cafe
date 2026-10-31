import { useEffect, useState } from 'react';
import { tableService, settingsService } from '../../services';
import { Spinner } from '../../components/UI';
import { QRCode } from 'react-qrcode-logo';
import toast from 'react-hot-toast';

const QRPage = () => {
  const [tables, setTables] = useState([]);
  const [restaurantQR, setRestaurantQR] = useState('');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterLocation, setFilterLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tblRes, restRes, setRes] = await Promise.all([
        tableService.getTables(),
        tableService.getRestaurantQR(),
        settingsService.getPublicSettings(),
      ]);
      setTables(tblRes.data.data || []);
      setRestaurantQR(restRes.data.bookingUrl || `${window.location.origin}/book`);
      setSettings(setRes.data.data);
    } catch {
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const downloadQR = (canvasId, filename) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      toast.error('Could not find QR canvas. Please try again.');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `${filename}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded ${filename}.png`);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} booking link!`);
  };

  const locations = ['all', ...new Set(tables.map(t => t.location).filter(Boolean))];

  const filteredTables = tables.filter(t => {
    const matchesLoc = filterLocation === 'all' || t.location === filterLocation;
    const matchesSearch = !searchQuery || 
      `table ${t.tableNumber}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.location && t.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLoc && matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const restaurantName = settings?.restaurantName || 'Restaurant';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
              QR Code Center
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Download or print high-resolution QR stands for tables, entrance, and flyers.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              background: '#d85d85',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px rgba(217,119,6,0.25)',
            }}
          >
            <span>🖨️</span>
            <span>Print Standees</span>
          </button>
        </div>
      </div>

      {/* ── HOW IT WORKS GUIDE BANNER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          border: '1.5px solid #fde68a',
          borderRadius: 16,
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            How QR Table Booking Works
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(253,230,138,0.7)' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>1️⃣ 🖨️ Print or Save</div>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5, margin: 0 }}>
              Download the QR code image for each table and place it on physical table stands.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(253,230,138,0.7)' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>2️⃣ 📱 Customer Scans</div>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5, margin: 0 }}>
              Customer uses phone camera or Google Lens to scan the table QR code.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(253,230,138,0.7)' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>3️⃣ ⚡ Auto-Selected Table</div>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5, margin: 0 }}>
              The booking page opens directly with that specific table pre-selected for them.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(253,230,138,0.7)' }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>4️⃣ 🍽️ Quick Booking</div>
            <p style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5, margin: 0 }}>
              Guest enters name & phone number. Confirmation shows instantly on your Admin live!
            </p>
          </div>
        </div>
      </div>

      {/* ── GENERAL RESTAURANT ENTRANCE QR ── */}
      <section
        style={{
          background: '#fff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 32 }}>
          <div
            style={{
              padding: 16,
              background: '#f8fafc',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <QRCode
              id="restaurant-qr-canvas"
              value={restaurantQR}
              size={180}
              bgColor="#ffffff"
              fgColor="#0f172a"
              qrStyle="squares"
            />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 8, letterSpacing: '0.05em' }}>
              RESTAURANT PORTAL
            </span>
          </div>

          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#92400e',
                  background: '#fffbeb',
                  padding: '4px 10px',
                  borderRadius: 9999,
                  border: '1px solid #fde68a',
                }}
              >
                Entrance & Social Media QR
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginTop: 8 }}>
                General Reservation QR Code
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 4, maxWidth: 520 }}>
                Display this at your reception desk, restaurant entrance, website, or Instagram/WhatsApp flyers. Customers who scan this can browse all tables and select their preferred slot.
              </p>
            </div>

            <div style={{ fontSize: 12, color: '#64748b', wordBreak: 'break-all', background: '#f8fafc', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              🔗 <strong>Target Link:</strong> {restaurantQR}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => downloadQR('restaurant-qr-canvas', `${restaurantName.replace(/\s+/g, '_')}_General_QR`)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#0f172a',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>💾</span>
                <span>Download PNG</span>
              </button>
              <button
                type="button"
                onClick={() => copyToClipboard(restaurantQR, 'General')}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#f8fafc',
                  color: '#334155',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>📋</span>
                <span>Copy Link</span>
              </button>
              <a
                href={restaurantQR}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: '#fffbeb',
                  color: '#92400e',
                  fontSize: 12,
                  fontWeight: 600,
                  border: '1px solid #fde68a',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>↗️</span>
                <span>Test Link</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TABLE-SPECIFIC QR CODES ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
              Individual Table QR Codes ({tables.length})
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              Scanning any of these immediately links directly to that table.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <input
              type="text"
              placeholder="Search table or area..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                outline: 'none',
                minWidth: 180,
              }}
            />
            <select
              value={filterLocation}
              onChange={e => setFilterLocation(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                background: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc === 'all' ? 'All Areas' : loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* QR Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}
        >
          {filteredTables.map(t => {
            const tableBookingUrl = `${window.location.origin}/book?table=${t._id}&token=${t.qrToken || ''}`;
            const canvasId = `table-qr-canvas-${t._id}`;

            return (
              <div
                key={t._id}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 16,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12,
                    paddingBottom: 10,
                    borderBottom: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🪑</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>
                      Table {t.tableNumber}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {t.location || 'Main Hall'}
                  </span>
                </div>

                {/* QR Canvas */}
                <div
                  style={{
                    padding: 12,
                    background: '#f8fafc',
                    borderRadius: 14,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <QRCode
                    id={canvasId}
                    value={tableBookingUrl}
                    size={140}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                    qrStyle="squares"
                  />
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 6, letterSpacing: '0.04em' }}>
                    SCAN FOR TABLE {t.tableNumber}
                  </div>
                </div>

                {/* Info */}
                <div style={{ width: '100%', textAlign: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
                    👥 Capacity: {t.capacity} Guests
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#94a3b8',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginTop: 4,
                    }}
                    title={tableBookingUrl}
                  >
                    {tableBookingUrl}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => downloadQR(canvasId, `Table_${t.tableNumber}_QR`)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 8,
                      background: '#0f172a',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>💾</span>
                    <span>Download</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(tableBookingUrl, `Table ${t.tableNumber}`)}
                    style={{
                      padding: '8px 0',
                      borderRadius: 8,
                      background: '#f8fafc',
                      color: '#334155',
                      fontSize: 11,
                      fontWeight: 600,
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <span>📋</span>
                    <span>Copy Link</span>
                  </button>
                </div>

                <a
                  href={tableBookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#d85d85',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>↗️</span>
                  <span>Open & Test Customer View</span>
                </a>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default QRPage;
