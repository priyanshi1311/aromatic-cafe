import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { bookingService, tableService, settingsService } from '../../services';
import toast from 'react-hot-toast';
import { Spinner } from '../../components/UI';

const STEPS = [
  { id: 0, title: 'Date & Table', icon: '🌸' },
  { id: 1, title: 'Guest Details', icon: '👤' },
  { id: 2, title: 'Confirm Ticket', icon: '✨' },
];

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTableId = searchParams.get('table');
  const packageParam = searchParams.get('package');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [tables, setTables] = useState([]);
  const [slots, setSlots] = useState([]);
  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: todayStr, timeSlot: '', tableId: preselectedTableId || '',
    guests: 2, name: '', phone: '', email: '',
    specialRequests: packageParam ? `[Package Inquiry] ${packageParam}` : '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const [sRes, tRes] = await Promise.all([
          settingsService.getPublicSettings(), tableService.getPublicTables(),
        ]);
        setSettings(sRes.data.data);
        const tblList = tRes.data.data || [];
        setTables(tblList);
        if (preselectedTableId) {
          const matched = tblList.find(t => t._id === preselectedTableId);
          if (matched) {
            setForm(f => ({ ...f, tableId: matched._id, guests: Math.min(matched.capacity || 2, 2) }));
          }
        }
      } catch { toast.error('Failed to load cafe details'); }
    })();
  }, [preselectedTableId]);

  const fetchSlots = useCallback(async (date, guests) => {
    if (!date) return;
    setSlotsLoading(true);
    try {
      const res = await bookingService.getSlots(date, guests);
      const fetched = res.data.slots || [];
      setSlots(fetched);
      setForm(f => ({
        ...f,
        timeSlot: fetched.find(s => s.time === f.timeSlot && s.available) ? f.timeSlot : '',
        tableId: f.tableId || preselectedTableId || '',
      }));
    } catch { toast.error('Could not load time slots'); setSlots([]); }
    finally { setSlotsLoading(false); }
  }, [preselectedTableId]);

  useEffect(() => { fetchSlots(todayStr, form.guests); }, [fetchSlots, todayStr, form.guests]);

  const handleChange = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: '' }));
  };
  const handleDateChange = d => { handleChange('date', d); fetchSlots(d, form.guests); };
  const handleGuestsChange = g => { handleChange('guests', g); if (form.date) fetchSlots(form.date, g); };
  const getPresetDate = days => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().split('T')[0]; };

  const maxDate = settings ? (() => {
    const d = new Date(); d.setDate(d.getDate() + (settings.advanceBookingDays || 30));
    return d.toISOString().split('T')[0];
  })() : '';

  const validateStep0 = () => {
    const e = {};
    if (!form.date) e.date = 'Please select a dining date';
    if (!form.timeSlot) e.timeSlot = 'Please select a time slot';
    if (!form.tableId) e.tableId = 'Please select a seating table';
    if (!form.guests || form.guests < 1) e.guests = 'Please select guest count';
    setErrors(e); return !Object.keys(e).length;
  };
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[+\d\s\-()]{7,15}$/.test(form.phone)) e.phone = 'Please enter a valid phone number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email';
    setErrors(e); return !Object.keys(e).length;
  };
  const handleNext = () => {
    if (step === 0 && validateStep0()) { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (step === 1 && validateStep1()) { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await bookingService.createBooking({
        name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim(),
        guests: parseInt(form.guests), date: form.date, timeSlot: form.timeSlot,
        tableId: form.tableId, specialRequests: form.specialRequests.trim(),
      });
      toast.success('Your table is reserved! 🌸');
      navigate(`/booking/success/${res.data.data.bookingId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setLoading(false); }
  };

  const selectedSlot = slots.find(s => s.time === form.timeSlot);
  const availableTables = selectedSlot?.tableIds || [];
  const selectedTable = tables.find(t => t._id === form.tableId);
  const restaurantName = settings?.restaurantName || 'Aromatic';
  const fmtDate = form.date ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';

  /* ─────────────── RENDER ─────────────── */
  return (
    <div className="page-wrapper font-sans" style={{ background: '#fdf8f5' }}>
      {/* ── NAV BAR ── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255, 250, 247, 0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1.5px solid #f3d7df',
        }}
      >
        <div className="page-container" style={{ height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #fce7ec 0%, #fdf2f4 100%)',
                border: '1.5px solid #f3d7df',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🌸
            </div>
            <div>
              <div className="font-serif" style={{ fontWeight: 800, color: '#1e293b', fontSize: 17, lineHeight: 1.1 }}>
                {restaurantName}
              </div>
              <div style={{ fontSize: 10, color: '#b83a65', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                Table & Party Reservation
              </div>
            </div>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link
              to="/"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                background: '#ffffff',
                border: '1px solid #f3d7df',
                padding: '6px 14px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              ← Back to Cafe
            </Link>
            <Link
              to="/admin/login"
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#64748b',
                background: '#ffffff',
                border: '1px solid #f3d7df',
                padding: '6px 14px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              Staff 🔐
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO BANNER ── */}
      <div style={{ width: '100%', borderBottom: '1px solid #f3d7df', background: 'linear-gradient(180deg, #fce7ec 0%, #fdf8f5 100%)' }}>
        <div className="page-container" style={{ paddingTop: 32, paddingBottom: 32 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: '#ffffff',
                    color: '#b83a65',
                    border: '1px solid #f3d7df',
                  }}
                >
                  <span>🌸</span> Live Floral Cafe Seating
                </span>
              </div>
              <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 900, color: '#1e293b', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Reserve Your Table in Bloom
              </h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
                Choose your seating under the cherry blossom canopy, select your time slot, and get instant confirmed ticket vouchers.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#475569' }}>
              {[
                { icon: '🕒', text: `Open: ${settings?.openingTime || '08:30'} – ${settings?.closingTime || '22:00'}` },
                { icon: '⚡', text: 'Instant Confirmed Ticket' },
                { icon: '🥂', text: 'Complimentary Table Setup' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ffffff', border: '1px solid #f3d7df', padding: '7px 14px', borderRadius: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <span>{item.icon}</span><span style={{ fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT (2 columns on desktop) ── */}
      <div className="page-container" style={{ flex: 1, paddingTop: 32, paddingBottom: 48 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32, alignItems: 'start' }}>

          {/* ── STEP INDICATOR ── */}
          <div className="section-card" style={{ padding: '12px 18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {STEPS.map((s, i) => {
                const done = i < step, cur = i === step;
                return (
                  <div
                    key={s.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 14,
                      background: cur ? '#fce7ec' : done ? '#ffffff' : 'transparent',
                      border: cur ? '1.5px solid #d85d85' : done ? '1px solid #f3d7df' : '1px solid transparent',
                      opacity: !cur && !done ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#fff',
                        background: done ? '#059669' : cur ? '#d85d85' : '#cbd5e1',
                        flexShrink: 0,
                      }}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cur ? '#b83a65' : done ? '#1e293b' : '#94a3b8' }}>
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── STEPS CONTAINER ── */}
          <div className="booking-2col-grid">
            
            {/* LEFT: Form steps */}
            <div className="booking-main-col" style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>

              {/* ===== STEP 0 ===== */}
              {step === 0 && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  {/* Package Inquiry Banner */}
                  {packageParam && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #fff0f5 0%, #fdf8f5 100%)',
                        border: '1.5px solid #d85d85',
                        borderRadius: 18,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        boxShadow: '0 4px 14px rgba(216,93,133,0.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: 'linear-gradient(135deg, #d85d85 0%, #b83a65 100%)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        >
                          🎉
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#b83a65', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            Event / Celebration Package
                          </p>
                          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b' }}>
                            {packageParam}
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                            Package request attached to your reservation notes
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR Scanned Banner */}
                  {selectedTable && preselectedTableId && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #fce7ec 0%, #fdf2f4 100%)',
                        border: '1.5px solid #d85d85',
                        borderRadius: 18,
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        boxShadow: '0 4px 14px rgba(216,93,133,0.1)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: '#d85d85',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 22,
                            flexShrink: 0,
                          }}
                        >
                          📱
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#b83a65' }}>
                            QR Scanned · Table {selectedTable.tableNumber} Pre-Selected!
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                            Seating: <strong>{selectedTable.location || 'Salon Rose'}</strong> · Up to {selectedTable.capacity} guests. Select date & time below to confirm.
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '5px 12px',
                          background: '#d85d85',
                          color: '#fff',
                          borderRadius: 9999,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 6px rgba(216,93,133,0.25)',
                        }}
                      >
                        Table Locked ✓
                      </span>
                    </div>
                  )}

                  {/* Sitting at a table quick selector */}
                  {!preselectedTableId && (
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #f3d7df',
                        borderRadius: 16,
                        padding: '14px 18px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>📱</span>
                        <div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#b83a65' }}>
                            Seated at a cafe table right now?
                          </span>
                          <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>
                            Pick your table number to lock it for this booking:
                          </span>
                        </div>
                      </div>
                      <select
                        value={form.tableId}
                        onChange={e => {
                          const tid = e.target.value;
                          const tbl = tables.find(t => t._id === tid);
                          setForm(f => ({
                            ...f,
                            tableId: tid,
                            guests: tbl?.capacity ? Math.min(tbl.capacity, f.guests) : f.guests,
                          }));
                          if (tid) toast.success(`Table locked! 🌸`);
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: 10,
                          border: '1.5px solid #f3d7df',
                          fontSize: 12,
                          fontWeight: 700,
                          background: '#fdf8f5',
                          color: '#1e293b',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">-- Select Table (Optional) --</option>
                        {tables.map(t => (
                          <option key={t._id} value={t._id}>
                            Table {t.tableNumber} ({t.location || 'Salon Rose'} · {t.capacity} Guests)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Guests */}
                  <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>
                          👥 1. Party Size
                        </h3>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>How many guests will be dining?</p>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '4px 12px',
                          background: '#fce7ec',
                          color: '#b83a65',
                          borderRadius: 9999,
                          border: '1px solid #f3d7df',
                        }}
                      >
                        {form.guests} {form.guests === 1 ? 'Guest' : 'Guests'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {[1, 2, 3, 4, 5, 6, 8, 10].map(n => {
                        const isSel = form.guests === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            onClick={() => handleGuestsChange(n)}
                            style={{
                              padding: '10px 18px',
                              borderRadius: 12,
                              fontSize: 13,
                              fontWeight: 700,
                              border: isSel ? '2px solid #d85d85' : '1.5px solid #f3d7df',
                              background: isSel ? '#d85d85' : '#ffffff',
                              color: isSel ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              boxShadow: isSel ? '0 4px 12px rgba(216,93,133,0.25)' : 'none',
                            }}
                          >
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </button>
                        );
                      })}
                    </div>
                    {errors.guests && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 8 }}>{errors.guests}</p>}
                  </div>

                  {/* Date */}
                  <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>
                          📅 2. Date
                        </h3>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>When would you like to visit?</p>
                      </div>
                      {fmtDate && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#b83a65', background: '#fce7ec', padding: '4px 10px', borderRadius: 8, border: '1px solid #f3d7df' }}>
                          {fmtDate}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                      {[{ label: 'Today', days: 0 }, { label: 'Tomorrow', days: 1 }, { label: 'In 2 Days', days: 2 }, { label: 'Weekend', days: (6 - new Date().getDay() + 7) % 7 || 7 }].map(p => {
                        const dv = getPresetDate(p.days);
                        const sel = form.date === dv;
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => handleDateChange(dv)}
                            style={{
                              padding: '7px 14px',
                              borderRadius: 10,
                              fontSize: 12,
                              fontWeight: 600,
                              border: sel ? '1.5px solid #d85d85' : '1px solid #f3d7df',
                              background: sel ? '#d85d85' : '#ffffff',
                              color: sel ? '#ffffff' : '#475569',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                            }}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="date"
                      min={todayStr}
                      max={maxDate}
                      value={form.date}
                      onChange={e => handleDateChange(e.target.value)}
                      className="form-input"
                    />
                    {errors.date && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 6 }}>{errors.date}</p>}
                    {settings?.blockedDates?.includes(form.date) && (
                      <p style={{ color: '#e11d48', fontSize: 12, marginTop: 6 }}>⚠️ The cafe is closed on this date.</p>
                    )}
                  </div>

                  {/* Time Slots */}
                  <div className="section-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>
                          🕐 3. Time Slot
                        </h3>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Available seating for {form.guests} guests</p>
                      </div>
                      {slotsLoading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#d85d85' }}>
                          <Spinner size="sm" /> Checking...
                        </div>
                      )}
                    </div>

                    {slotsLoading ? (
                      <div style={{ padding: '44px 0', textAlign: 'center', background: '#fdf8f5', borderRadius: 14, border: '1px dashed #f3d7df' }}>
                        <Spinner size="md" className="mx-auto mb-2" />
                        <p style={{ fontSize: 12, color: '#64748b' }}>Checking cafe availability...</p>
                      </div>
                    ) : slots.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', background: '#fdf8f5', borderRadius: 14, border: '1px dashed #f3d7df' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>No slots available</p>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Try a different date or guest count.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
                        {slots.map(s => {
                          const sel = form.timeSlot === s.time;
                          return (
                            <button
                              key={s.time}
                              type="button"
                              onClick={() => s.available && handleChange('timeSlot', s.time)}
                              disabled={!s.available}
                              style={{
                                padding: '14px 8px',
                                borderRadius: 14,
                                border: sel ? '2px solid #d85d85' : '1.5px solid #f3d7df',
                                background: sel ? '#d85d85' : s.available ? '#ffffff' : '#f8fafc',
                                color: sel ? '#ffffff' : s.available ? '#1e293b' : '#94a3b8',
                                textAlign: 'center',
                                cursor: s.available ? 'pointer' : 'not-allowed',
                                opacity: s.available ? 1 : 0.5,
                                transition: 'all 0.15s',
                                boxShadow: sel ? '0 4px 14px rgba(216,93,133,0.25)' : 'none',
                              }}
                            >
                              <div style={{ fontSize: 15, fontWeight: 800 }}>{s.time}</div>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  marginTop: 4,
                                  color: sel ? 'rgba(255,255,255,0.9)' : s.available ? '#b83a65' : '#94a3b8',
                                }}
                              >
                                {s.available ? `${s.availableCount} tables` : 'Full'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.timeSlot && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 8 }}>{errors.timeSlot}</p>}
                  </div>

                  {/* Table Selection */}
                  {form.timeSlot && (
                    <div className="section-card animate-fade-in">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#1e293b' }}>
                            🌸 4. Choose Table
                          </h3>
                          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>For {form.timeSlot} on {fmtDate}</p>
                        </div>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{availableTables.length} tables open</span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                        {availableTables.map(tbl => {
                          const sel = form.tableId === tbl.id;
                          const info = tables.find(t => t._id === tbl.id);
                          return (
                            <button
                              key={tbl.id}
                              type="button"
                              onClick={() => handleChange('tableId', tbl.id)}
                              style={{
                                padding: 16,
                                borderRadius: 16,
                                border: sel ? '2px solid #d85d85' : '1.5px solid #f3d7df',
                                background: sel ? '#fce7ec' : '#ffffff',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                                boxShadow: sel ? '0 4px 14px rgba(216,93,133,0.15)' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: '#1e293b', fontSize: 15 }}>
                                  Table {tbl.tableNumber}
                                </span>
                                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: '#fdf8f5', color: '#b83a65', border: '1px solid #f3d7df' }}>
                                  {info?.location || 'Salon Rose'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: 12, color: '#64748b' }}>
                                <span>👥 Up to {tbl.capacity} Guests</span>
                                {sel && <span style={{ color: '#b83a65', fontWeight: 700 }}>Selected ✓</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.tableId && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 8 }}>{errors.tableId}</p>}
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px 0',
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    Continue to Guest Details →
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b' }}>
                    ✨ No account required · Free cancellation anytime
                  </p>
                </div>
              )}

              {/* ===== STEP 1 ===== */}
              {step === 1 && (
                <div className="section-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                      Guest Contact Details
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      We will send your confirmed reservation ticket here.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Priya Sharma"
                        value={form.name}
                        onChange={e => handleChange('name', e.target.value)}
                        className="form-input"
                      />
                      {errors.name && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                    </div>

                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 9876543210"
                        value={form.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        className="form-input"
                      />
                      {errors.phone && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="form-label">Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="e.g. priya@gmail.com"
                        value={form.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className="form-input"
                      />
                      {errors.email && <p style={{ color: '#e11d48', fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
                    </div>

                    <div>
                      <label className="form-label">Special Occasion or Request (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Birthday celebration cake, anniversary setup, quiet corner table, high chair..."
                        value={form.specialRequests}
                        onChange={e => handleChange('specialRequests', e.target.value)}
                        className="form-input"
                        style={{ resize: 'vertical' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid #f3d7df' }}>
                    <button
                      type="button"
                      onClick={() => setStep(0)}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary"
                      style={{ flex: 1, padding: '13px 0', fontSize: 14 }}
                    >
                      Review & Confirm →
                    </button>
                  </div>
                </div>
              )}

              {/* ===== STEP 2 ===== */}
              {step === 2 && (
                <div className="section-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>
                      Review & Confirm Ticket
                    </h2>
                    <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Verify your details before confirming your table.
                    </p>
                  </div>

                  <div style={{ borderRadius: 18, border: '1.5px solid #f3d7df', background: '#fdf8f5', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1.5px solid #f3d7df', background: '#fce7ec' }}>
                      <div>
                        <span style={{ fontSize: 10, color: '#b83a65', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          AESTHETIC RESERVATION
                        </span>
                        <h4 className="font-serif" style={{ fontWeight: 800, color: '#1e293b', fontSize: 17 }}>
                          {restaurantName}
                        </h4>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 9999, background: '#ffffff', color: '#b83a65', border: '1px solid #f3d7df' }}>
                        Ready to Lock
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 0 }}>
                      {[
                        { label: 'Date', value: fmtDate || form.date, color: '#1e293b' },
                        { label: 'Time', value: form.timeSlot, color: '#b83a65' },
                        { label: 'Guests', value: `${form.guests} ${form.guests === 1 ? 'Guest' : 'Guests'}`, color: '#1e293b' },
                        { label: 'Seating Table', value: selectedTable ? `Table ${selectedTable.tableNumber} (${selectedTable.location || 'Salon Rose'})` : '—', color: '#1e293b' },
                      ].map((item, i) => (
                        <div key={i} style={{ padding: '14px 20px', borderBottom: i < 2 ? '1px solid #f3d7df' : 'none', borderRight: i % 2 === 0 ? '1px solid #f3d7df' : 'none' }}>
                          <span style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 2 }}>{item.label}</span>
                          <strong style={{ fontSize: 14, color: item.color, fontWeight: 700 }}>{item.value}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid #f3d7df', fontSize: 12 }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Guest Name: </span>
                        <strong style={{ color: '#1e293b' }}>{form.name}</strong> · {form.phone}
                      </div>
                      {form.email && <div style={{ marginTop: 4 }}><span style={{ color: '#64748b' }}>Email: </span>{form.email}</div>}
                      {form.specialRequests && (
                        <div style={{ marginTop: 6, fontStyle: 'italic', color: '#b83a65' }}>
                          "{form.specialRequests}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '14px 16px', borderRadius: 14, background: '#fff9ea', border: '1px solid #fde68a', display: 'flex', gap: 10, alignItems: 'start', fontSize: 12, color: '#92400e' }}>
                    <span style={{ fontSize: 16 }}>📌</span>
                    <span>Your table is reserved for 15 minutes past your booking time. Present your confirmation upon arrival.</span>
                  </div>

                  <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid #f3d7df' }}>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="btn-secondary"
                      style={{ flex: 1, padding: '14px 0', fontSize: 14 }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="btn-primary"
                      style={{
                        flex: 1,
                        padding: '14px 0',
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="border-t-white" /> Confirming...
                        </>
                      ) : (
                        <>Confirm Reservation 🌸</>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Sticky Summary (desktop only) */}
            <div className="booking-sidebar-col" style={{ position: 'sticky', top: 88 }}>
              <div className="section-card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1.5px solid #f3d7df' }}>
                  <h3 className="font-serif" style={{ fontWeight: 800, color: '#1e293b', fontSize: 17 }}>
                    Booking Summary
                  </h3>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#b83a65', background: '#fce7ec', padding: '4px 10px', borderRadius: 9999, border: '1px solid #f3d7df' }}>
                    Step {step + 1}/3
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 12 }}>
                  {[
                    { icon: '📅', label: 'Date', value: fmtDate || form.date, ok: !!form.date },
                    { icon: '🕐', label: 'Time', value: form.timeSlot || 'Not selected', ok: !!form.timeSlot },
                    { icon: '👥', label: 'Guests', value: `${form.guests} ${form.guests === 1 ? 'Guest' : 'Guests'}`, ok: true },
                    { icon: '🌸', label: 'Table', value: selectedTable ? `Table ${selectedTable.tableNumber}` : 'Not selected', ok: !!selectedTable },
                  ].map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {r.icon} {r.label}
                      </span>
                      <span style={{ fontWeight: 700, color: r.ok ? '#1e293b' : '#94a3b8' }}>
                        {r.value}
                      </span>
                    </div>
                  ))}

                  {form.name && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f3d7df' }}>
                      <span style={{ color: '#64748b' }}>👤 Guest</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {form.name}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ background: '#fdf8f5', borderRadius: 14, padding: 14, border: '1px solid #f3d7df', fontSize: 11, color: '#475569', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Instant Confirmed Ticket', 'No prepayment needed', 'Free cancellation anytime'].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#d85d85', fontWeight: 800 }}>✓</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={step < 2 ? handleNext : handleSubmit}
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {step === 0 ? 'Continue →' : step === 1 ? 'Review & Confirm →' : loading ? <><Spinner size="sm" className="border-t-white" /> Confirming...</> : 'Confirm Reservation 🌸'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #f3d7df', background: '#ffffff', padding: '20px 0' }}>
        <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#64748b' }}>
          <span>© {new Date().getFullYear()} {restaurantName} · Cafe & Restaurant</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Home</Link>
            <Link to="/admin/login" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>Staff Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
