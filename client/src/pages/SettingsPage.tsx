/**
 * SettingsPage: User configuration and preference management.
 * Handles theme personalization, notification settings, and data privacy controls.
 */
import React, { useMemo, useState, useCallback, memo, useEffect } from 'react';
import { 
  Sun, Moon, Bell, Shield, Download, 
  Trash2, ChevronRight, Loader2, Plus, Calendar, Volume2
} from 'lucide-react';

import { useSettingsStore } from '../hooks/useSettingsStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { userApi } from '../api/userApi';
import { showConfirm, showSuccess, showError, showToast } from '../utils/swal';
import { playSound } from '../utils/sound';
import '../styles/pages/SettingsPage.css';

const SettingsPage: React.FC = () => {
  const { theme, setTheme, accentColor, setAccentColor } = useSettingsStore();
  const { user, updateUser, logout } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState<string | null>(null);
  const [blockedDraft, setBlockedDraft] = useState({ dayOfWeek: 1, startTime: '18:00', endTime: '20:00', label: 'Family time' });

  useEffect(() => {
    document.title = 'Clamber - Settings';
  }, []);

  const handleUpdateSettings = useCallback(async (key: string, updates: Record<string, any>) => {
    setIsSyncing(key);
    try {
      const { data } = await userApi.updateSettings(updates);
      updateUser({ settings: data.data.settings });
      showToast('Settings synced', 'success');
    } catch (err) {
      console.error('Settings sync failed', err);
      showError('Sync Error', 'Failed to save preferences.');
    } finally {
      setIsSyncing(null);
    }
  }, [updateUser]);

  const handleExportData = useCallback(async () => {
    try {
      const { data } = await userApi.exportData();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'clamber-personal-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Data export failed', err);
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    const result = await showConfirm(
      'Are you sure?',
      'CRITICAL: This will permanently delete your account and all data.',
      'Delete Permanently',
      'Cancel'
    );
    if (!result.isConfirmed) return;
    setLoading(true);
    try {
      await userApi.deleteAccount();
      await showSuccess('Account Deleted', 'Your data has been removed.');
      logout();
      window.location.href = '/';
    } catch (err) {
      showError('Delete Failed', 'Failed to delete account.');
      setLoading(false);
    }
  }, [logout]);

  const notifications = useMemo(() => user?.settings?.notifications || {}, [user?.settings?.notifications]);
  const blockedPeriods = useMemo(() => user?.settings?.blockedTimePeriods || [], [user?.settings?.blockedTimePeriods]);
  const prayerTimes = useMemo(() => user?.settings?.prayerTimes || { mode: 'auto', location: '' }, [user?.settings?.prayerTimes]);

  return (
    <div className="settings-board-container">
      <header className="board-header">
        <div className="header-left-group">
          <h1>Settings & Preferences</h1>
          <p>Tailor Clamber to your academic lifestyle and schedule.</p>
        </div>
        {isSyncing && <div className="sync-indicator"><Loader2 size={14} className="spin" /> Syncing...</div>}
      </header>

      <div className="settings-sections">
        <section className="settings-card">
          <div className="section-head"><Sun size={18} /> Personalization</div>
          <div className="setting-block">
            <label>Interface Theme</label>
            <div className="theme-selector">
              <div 
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { setTheme('light'); handleUpdateSettings('theme', { theme: 'light' }); }}
              >
                <Sun size={16} />
                <div className="theme-info"><strong>Light</strong><span>Clean & Bright</span></div>
              </div>
              <div 
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { setTheme('dark'); handleUpdateSettings('theme', { theme: 'dark' }); }}
              >
                <Moon size={16} />
                <div className="theme-info"><strong>Dark</strong><span>Midnight Mode</span></div>
              </div>
            </div>
          </div>
          <div className="setting-block">
            <label>Brand Accent</label>
            <div className="accent-grid">
              {[
                { color: 'var(--accent-blue-deep)', label: 'Classic' },
                { color: 'var(--accent-lavender-deep)', label: 'Royal' },
                { color: 'var(--accent-mint-deep)', label: 'Emerald' },
                { color: 'var(--accent-peach-deep)', label: 'Amber' },
                { color: 'var(--accent-pink-deep)', label: 'Rose' },
              ].map(opt => (
                <AccentOption 
                  key={opt.color} color={opt.color} label={opt.label} active={accentColor === opt.color} 
                  onClick={() => { setAccentColor(opt.color); handleUpdateSettings('accent', { accentColor: opt.color }); }}
                />
              ))}
            </div>
          </div>
        </section>

        {user?.role !== 'advisor' && (
          <section className="settings-card">
            <div className="section-head"><Bell size={18} /> Intelligent Alerts</div>
            <div className="setting-list">
              <ToggleItem 
                label="Proactive Task Reminders" sub="Nudges for upcoming high-priority tasks" 
                active={notifications.taskReminders} 
                onToggle={() => handleUpdateSettings('notif', { notifications: { ...notifications, taskReminders: !notifications.taskReminders } })}
              />
              <ToggleItem 
                label="Burnout Prevention" sub="Alerts when academic load hits critical levels" 
                active={notifications.burnoutAlerts} 
                onToggle={() => handleUpdateSettings('notif', { notifications: { ...notifications, burnoutAlerts: !notifications.burnoutAlerts } })}
              />
              <div className="divider" />
              <div className="section-subhead"><Volume2 size={16} /> Audio Preferences</div>
              <ToggleItem 
                label="Enable Sound Effects" sub="Play subtle cues for app interactions" 
                active={user?.settings?.soundEnabled} 
                onToggle={() => handleUpdateSettings('sound', { soundEnabled: !user?.settings?.soundEnabled })}
              />
              <div className="setting-block mt-12">
                <label className="sub-label">Interface Volume</label>
                <div className="volume-control-flex">
                  <input 
                    type="range" min="0" max="1" step="0.1" 
                    value={user?.settings?.volume || 0.5} 
                    style={{ '--range-progress': `${(user?.settings?.volume || 0.5) * 100}%` } as React.CSSProperties}
                    onChange={(e) => handleUpdateSettings('volume', { volume: parseFloat(e.target.value) })}
                  />
                  <button className="btn-test-sound" onClick={() => playSound('success')}>Test</button>
                </div>
              </div>
              <ToggleItem
                label="Grade Milestone Tracker" sub="Updates when target grades are achievable"
                active={notifications.gradeMilestones}
                onToggle={() => handleUpdateSettings('notif', { notifications: { ...notifications, gradeMilestones: !notifications.gradeMilestones } })}
              />
            </div>
          </section>
        )}

        {user?.role !== 'advisor' && (
          <section className="settings-card">
            <div className="section-head"><Calendar size={18} /> Schedule Optimization</div>
            <div className="setting-list">
              <ToggleItem
                label="Prayer Time Integration" sub="Automatically block prayer windows"
                active={prayerTimes.mode === 'auto'}
                onToggle={() => handleUpdateSettings('prayer', { prayerTimes: { ...prayerTimes, mode: prayerTimes.mode === 'auto' ? 'manual' : 'auto' } })}
              />
              
              {prayerTimes.mode === 'auto' ? (
                <div className="input-group full-width">
                  <label>Base Location (for prayer times)</label>
                  <div className="input-with-action">
                    <input
                      value={prayerTimes.location || ''}
                      onChange={(e) => handleUpdateSettings('prayer-loc', { prayerTimes: { ...prayerTimes, location: e.target.value } })}
                      placeholder="Enter city (e.g. Islamabad)"
                    />
                  </div>
                </div>
              ) : (
                <div className="manual-times-grid">
                  {['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].map((name) => (
                    <div key={name} className="input-group">
                      <label>{name.toUpperCase()}</label>
                      <input
                        type="time" value={(prayerTimes as any)?.[name] || ''}
                        onChange={(e) => handleUpdateSettings('prayer-manual', { prayerTimes: { ...prayerTimes, [name]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="blocked-times-section">
                <label className="sub-label">Recurring Blocked Periods</label>
                <div className="blocked-form-inline">
                  <select value={blockedDraft.dayOfWeek} onChange={(e) => setBlockedDraft({ ...blockedDraft, dayOfWeek: Number(e.target.value) })}>
                    <option value={0}>Sun</option><option value={1}>Mon</option><option value={2}>Tue</option>
                    <option value={3}>Wed</option><option value={4}>Thu</option><option value={5}>Fri</option><option value={6}>Sat</option>
                  </select>
                  <input type="time" value={blockedDraft.startTime} onChange={(e) => setBlockedDraft({ ...blockedDraft, startTime: e.target.value })} />
                  <span>to</span>
                  <input type="time" value={blockedDraft.endTime} onChange={(e) => setBlockedDraft({ ...blockedDraft, endTime: e.target.value })} />
                  <button className="btn-add-block" onClick={() => handleUpdateSettings('blocked', { blockedTimePeriods: [...blockedPeriods, blockedDraft] })}><Plus size={14} /></button>
                </div>
                
                <div className="blocked-periods-list">
                  {blockedPeriods.map((bp: any, idx: number) => (
                    <div key={idx} className="blocked-period-tag">
                      {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][bp.dayOfWeek]} {bp.startTime}-{bp.endTime}
                      <button onClick={() => handleUpdateSettings('blocked-rem', { blockedTimePeriods: blockedPeriods.filter((_, i) => i !== idx) })}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="settings-card danger-zone">
          <div className="section-head"><Shield size={18} /> Privacy & Data Control</div>
          <div className="setting-list">
            <div onClick={handleExportData} className="action-row">
              <ActionItem icon={<Download size={18} />} label="Download Personal Data Archive" />
            </div>
            <div onClick={handleDeleteAccount} className="action-row danger">
              <ActionItem icon={loading ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />} label="Delete Account Permanently" danger />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const AccentOption = memo(({ color, label, active, onClick }: any) => (
  <div className={`accent-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="accent-circle" style={{ '--circle-color': color } as React.CSSProperties}></div>
    <span>{label}</span>
  </div>
));

const ToggleItem = memo(({ label, sub, active, onToggle }: any) => (
  <div className="toggle-item-wrapper" onClick={onToggle}>
    <div className="item-info">
      <strong>{label}</strong>
      <span>{sub}</span>
    </div>
    <div className={`switch ${active ? 'active' : ''}`}>
      <div className="dot"></div>
    </div>
  </div>
));

const ActionItem = memo(({ icon, label, danger }: any) => (
  <div className={`action-item ${danger ? 'danger' : ''}`}>
    <div className="action-lbl">{icon} {label}</div>
    <ChevronRight size={18} />
  </div>
));

export default SettingsPage;
