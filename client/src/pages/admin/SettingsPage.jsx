import { useState, useEffect } from 'react';
import { settingsService } from '../../services';
import { Spinner, EmptyState } from '../../components/UI';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newBlocked, setNewBlocked] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsService.getSettings();
      setSettings(res.data.data || res.data);
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      toast.success('Restaurant settings updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addBlockedDate = async () => {
    if (!newBlocked) return;
    try {
      await settingsService.addBlockedDate(newBlocked);
      toast.success('Blocked date added');
      setNewBlocked('');
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add date');
    }
  };

  const removeBlocked = async (date) => {
    if (!window.confirm(`Unblock date ${date}?`)) return;
    try {
      await settingsService.removeBlockedDate(date);
      toast.success('Blocked date removed');
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove date');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-0.5">
            Configure restaurant name, reservation hours, slot durations, and closure dates
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
        >
          <span>💾</span>
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* General Information */}
      <section className="card">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>🏛️</span>
          <span>Restaurant Profile</span>
        </h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Restaurant Brand Name</label>
            <input
              type="text"
              value={settings.restaurantName || ''}
              onChange={e => setSettings({ ...settings, restaurantName: e.target.value })}
              className="form-input"
              placeholder="e.g. Aromatic"
            />
          </div>
        </div>
      </section>

      {/* Reservation Hours & Slot Duration */}
      <section className="card">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>🕒</span>
          <span>Operating Hours & Booking Slots</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Opening Time</label>
            <input
              type="time"
              value={settings.openingTime || '10:00'}
              onChange={e => setSettings({ ...settings, openingTime: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Closing Time</label>
            <input
              type="time"
              value={settings.closingTime || '22:00'}
              onChange={e => setSettings({ ...settings, closingTime: e.target.value })}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Slot Duration (Minutes)</label>
            <input
              type="number"
              min={15}
              max={240}
              step={15}
              value={settings.slotDurationMinutes || 60}
              onChange={e => setSettings({ ...settings, slotDurationMinutes: parseInt(e.target.value) || 60 })}
              className="form-input"
            />
          </div>
        </div>
      </section>

      {/* Capacity & Advance Window */}
      <section className="card">
        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span>📅</span>
          <span>Booking Constraints</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Advance Booking Window (Days ahead)</label>
            <input
              type="number"
              min={1}
              max={365}
              value={settings.advanceBookingDays ?? 30}
              onChange={e => setSettings({ ...settings, advanceBookingDays: parseInt(e.target.value) || 30 })}
              className="form-input"
            />
            <p className="text-[11px] text-slate-400 mt-1">Maximum number of days customers can book in advance.</p>
          </div>
          <div>
            <label className="form-label">Max Guests Allowed Per Table</label>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.maxGuestsPerTable ?? 10}
              onChange={e => setSettings({ ...settings, maxGuestsPerTable: parseInt(e.target.value) || 10 })}
              className="form-input"
            />
          </div>
        </div>
      </section>

      {/* Blocked Dates / Holiday Closures */}
      <section className="card">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <span>🚫</span>
          <span>Blocked Dates & Special Holidays</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Customers will not be allowed to book tables on these blocked dates.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={newBlocked}
            onChange={e => setNewBlocked(e.target.value)}
            className="form-input sm:max-w-xs !py-2.5"
          />
          <button
            type="button"
            onClick={addBlockedDate}
            className="btn-primary text-xs !py-2.5 !px-4"
          >
            + Block Date
          </button>
        </div>

        {!settings.blockedDates || settings.blockedDates.length === 0 ? (
          <EmptyState icon="🏖️" title="No blocked dates" description="The restaurant is open every day during normal hours." />
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {settings.blockedDates.map(d => (
              <div key={d} className="flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📅</span>
                  <span className="text-sm font-semibold text-slate-800">{d}</span>
                  <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Closed
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeBlocked(d)}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Remove ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary text-sm py-3 px-8 shadow-md shadow-[#d85d85]/25"
        >
          {saving ? 'Saving Changes...' : 'Save All Settings ✓'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
