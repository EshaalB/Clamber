/**
 * BurnoutPage: Mental well-being and academic workload analysis.
 * Monitors risk levels, provides personalized recovery advice, and tracks baseline wellness metrics.
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, Calendar, Moon, Activity, 
  Loader2
} from 'lucide-react';

import { analyticsApi } from '../api/analyticsApi';
import '../styles/pages/BurnoutPage.css';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BurnoutPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(7);
  const [submittingCheckin, setSubmittingCheckin] = useState(false);
  const [checkin, setCheckin] = useState({ sleepHours: 7, stressLevel: 50 });

  const fetchBurnout = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data: res } = await analyticsApi.getBurnoutScore(period);
      setData(res.data);
    } catch (err) {
      console.error('Burnout score fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    document.title = 'Clamber - Well-being Analysis';
    fetchBurnout();
  }, [fetchBurnout]);

  const submitWeeklyCheckin = async () => {
    try {
      setSubmittingCheckin(true);
      await analyticsApi.recordAnalytics({
        sleepHours: checkin.sleepHours,
        stressLevel: checkin.stressLevel,
        studyHours: 0,
      });
      await fetchBurnout(true);
    } catch (err) {
      console.error('Weekly check-in failed', err);
    } finally {
      setSubmittingCheckin(false);
    }
  };

  const trend = data?.trend || [];
  const chartData = React.useMemo(() => {
    return trend.map((t: any) => ({
      ...t,
      dateLabel: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: t.score || 0
    }));
  }, [trend]);

  if (loading && !data) {
    return (
      <div className="burnout-container loading-state">
        <Loader2 className="spin" size={48} color="var(--active-accent)" />
      </div>
    );
  }

  const score = data?.score || 0;
  const riskLevel = data?.riskLevel || 'Low';
  const factors = data?.factors || { workload: 0, sleepQuality: 0, deadlinePressure: 0 };

  return (
    <div className="burnout-board-container">
      <header className="board-header">
        <div className="header-left-group">
          <h1>Wellbeing & Burnout</h1>
          <p>Tracking your academic pulse and mental workload</p>
        </div>
        <div className="header-actions-group">
          <div className="period-pills">
            {( [7, 30, 90] as const).map(p => (
              <button key={p} className={`period-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}D</button>
            ))}
          </div>
        </div>
      </header>

      <main className="burnout-bento-grid">
        <section className="bento-card card-standard risk-gauge-card">
          <header className="gauge-header-v2">
            <h3>Burnout Risk Index</h3>
            <p>Based on current activity and reporting</p>
          </header>
          
          <div className="gauge-container">
            <div className="gauge-svg-wrapper">
              <svg width="200" height="120" viewBox="0 0 160 100">
                <path d="M20 80 A 60 60 0 0 1 140 80" fill="none" stroke="var(--bg-secondary)" strokeWidth="12" strokeLinecap="round" />
                <motion.path 
                  d="M20 80 A 60 60 0 0 1 140 80" 
                  fill="none" 
                  stroke={getRiskColor(riskLevel)} 
                  strokeWidth="12" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: score / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="gauge-content">
                <span className="score-number">{score}</span>
                <span className="score-total">SCORE</span>
              </div>
            </div>
          </div>

          <span className={`risk-badge ${riskLevel.toLowerCase()}`}>
            <AlertTriangle size={14} /> {riskLevel} Risk Level
          </span>

          <p className="risk-description">
            {riskLevel === 'High' ? 'Critical stress levels detected. Take an immediate break.' : 
             riskLevel === 'Medium' ? 'Moderate stress levels detected. Consider reducing workload.' : 
             'Your mental workload is well-balanced.'}
          </p>

          {data?.crisisPrompt && (
            <div className="crisis-alert">
              <div className="crisis-header">
                <AlertTriangle size={16} />
                <strong>{data.crisisPrompt.title}</strong>
              </div>
              <p>{data.crisisPrompt.text}</p>
              <div className="crisis-links">
                {(data.crisisPrompt.contacts || []).map((contact: any, i: number) => (
                  <a key={i} href={contact.url} target="_blank" rel="noreferrer" className="crisis-btn">{contact.label}</a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="bento-card card-standard wellness-form-card">
          <header className="card-header">
            <h3>Weekly Check-In</h3>
            <Moon size={18} />
          </header>
          <p className="card-subtitle">Self-report baseline metrics for accurate risk assessment.</p>
          
          <div className="checkin-form">
            <div className="input-group">
              <div className="input-header">
                <label>Avg Sleep Hours</label>
                <span className="input-value">{checkin.sleepHours}h</span>
              </div>
              <input 
                type="range" min="0" max="12" step="0.5" value={checkin.sleepHours}
                onChange={(e) => setCheckin((prev) => ({ ...prev, sleepHours: Number(e.target.value) }))}
              />
            </div>

            <div className="input-group">
              <div className="input-header">
                <label>Stress Level</label>
                <span className="input-value">{checkin.stressLevel}%</span>
              </div>
              <input 
                type="range" min="0" max="100" value={checkin.stressLevel}
                onChange={(e) => setCheckin((prev) => ({ ...prev, stressLevel: Number(e.target.value) }))}
              />
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={submitWeeklyCheckin} disabled={submittingCheckin}>
              {submittingCheckin ? <Loader2 className="spin" size={16} /> : 'Record Wellness Check'}
            </button>
          </div>
        </section>

        <section className="bento-card card-standard factors-card">
          <header className="card-header"><h3>Contributing Factors</h3></header>
          <div className="factors-grid">
            <FactorItem label="Workload" value={`${factors.workload}/100`} percent={factors.workload} color="var(--icon-peach)" icon={<Calendar size={16} />} />
            <FactorItem label="Sleep Quality" value={`${factors.sleepQuality}/100`} percent={factors.sleepQuality} color="var(--icon-lavender)" icon={<Moon size={16} />} />
            <FactorItem label="Stress" value={`${factors.stressLevel || 0}/100`} percent={factors.stressLevel || 0} color="var(--icon-pink)" icon={<Activity size={16} />} />
            <FactorItem label="Deadlines" value={`${factors.deadlinePressure}/100`} percent={factors.deadlinePressure} color="var(--icon-blue)" icon={<AlertTriangle size={16} />} />
          </div>
        </section>

        <section className="bento-card card-standard trend-card">
          <header className="card-header">
            <h3>Burnout Trend</h3>
            <div className="period-pills">
              {( [7, 30, 90] as const).map(p => (
                <button key={p} className={`period-pill ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>{p}D</button>
              ))}
            </div>
          </header>
          <div className="trend-viz" style={{ minHeight: '220px', width: '100%', marginTop: '16px' }}>
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--active-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--active-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis 
                    dataKey="dateLabel" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }} 
                    domain={[0, 100]} 
                    width={30}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
                    itemStyle={{ color: 'var(--text-main)', fontWeight: 700 }}
                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--active-accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    name="Burnout Risk" 
                    dot={{ r: 3, fill: 'var(--active-accent)', strokeWidth: 0 }} 
                    activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--active-accent)' }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-trend-msg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-disabled)', fontSize: '14px' }}>
                <p>No activity data available for this period.</p>
              </div>
            )}
          </div>
          <footer className="trend-footer">
            <Activity size={14} />
            <span>{trend.some((t: any) => t.highLoadWeek) ? 'High-load period detected.' : 'Stable workload trend.'}</span>
          </footer>
        </section>

        <section className="bento-card card-standard warnings-card">
          <header className="card-header">
            <h3>Status Warnings</h3>
            <AlertTriangle size={18} color="var(--color-warning-text)" />
          </header>
          <div className="warnings-list">
            {(data.warnings || []).length > 0 ? (
              data.warnings.map((w: string, i: number) => (
                <div key={i} className="warning-item">
                  <div className="warning-icon"><AlertTriangle size={14} /></div>
                  <p>{w}</p>
                </div>
              ))
            ) : (
              <div className="system-green">
                <Activity size={32} color="var(--color-success-text)" />
                <p>System Normal. No critical health warnings detected.</p>
              </div>
            )}
          </div>
        </section>

        <section className="bento-card card-standard advice-card">
          <header className="card-header"><h3>Personalized Advice</h3></header>
          <div className="advice-list">
            {(data.suggestions || []).length > 0 ? (
              data.suggestions.map((item: string, i: number) => (
                <div key={i} className="advice-item">
                  <div className="advice-dot"></div>
                  <p>{item}</p>
                </div>
              ))
            ) : (
              <p className="no-advice">Keep maintaining your current routine!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const FactorItem = memo(({ label, value, percent, color, icon }: any) => (
  <div className="factor-item">
    <div className="factor-header">
      <div className="factor-lbl">
        <span className="icon-box" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>{icon}</span>
        {label}
      </div>
      <span className="factor-val">{value}</span>
    </div>
    <div className="factor-bar-track">
      <motion.div 
        className="factor-bar-fill" style={{ backgroundColor: color }}
        initial={{ width: 0 }} animate={{ width: `${percent}%` }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  </div>
));

const getRiskColor = (level: string) => {
  switch (level) {
    case 'High': return 'var(--color-error-text)';
    case 'Medium': return 'var(--color-warning-text)';
    default: return 'var(--color-success-text)';
  }
};



export default BurnoutPage;
