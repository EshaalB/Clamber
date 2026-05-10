/**
 * AnalyticsPage: Academic and wellbeing performance visualization.
 * Tracks stress trends, sleep patterns, and productivity metrics using Recharts.
 */
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Activity, Moon, CheckCircle2, 
  Clock, Download, FileText, Loader2
} from 'lucide-react';

import { analyticsApi } from '../api/analyticsApi';
import '../styles/pages/AnalyticsPage.css';

import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchAnalytics = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await analyticsApi.getAnalytics(days);
      setData(data.data);
    } catch (err) {
      console.error('Analytics fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const summary = useMemo(() => data?.summary || { avgStress: 0, avgSleep: 0, totalTasks: 0, totalStudy: 0 }, [data?.summary]);
  const history = useMemo(() => data?.history || [], [data?.history]);
  const insights = useMemo(() => data?.insights || [], [data?.insights]);

  const chartData = useMemo(() => history.map((item: any) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
  })), [history]);

  const handleExportCsv = useCallback(() => {
    const rows = [
      ['date', 'stressLevel', 'sleepHours', 'tasksCompleted', 'studyHours', 'burnoutScore'],
      ...history.map((item: any) => [
        new Date(item.date).toISOString(),
        item.stressLevel,
        item.sleepHours,
        item.tasksCompleted,
        item.studyHours,
        item.burnoutScore || '',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clamber-analytics-${days}d.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [history, days]);

  const handleExportPdf = useCallback(() => {
    window.print();
  }, []);

  if (loading && !data) {
    return (
      <div className="analytics-container loading-state">
        <Loader2 className="spin" size={48} color="var(--active-accent)" />
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div className="header-left-group">
          <h1>Mental Health Analytics</h1>
          <p>Track your wellbeing patterns over time</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline" onClick={handleExportCsv}><Download size={16} /> Export CSV</button>
          <button className="btn-primary" onClick={handleExportPdf}><FileText size={16} /> Export PDF</button>
        </div>
      </header>

      <section className="analytics-summary-row">
        <AnalyticCard label="Avg Stress" value={`${Math.round(summary.avgStress)}/100`} icon={<Activity size={20} color="#f5b89a" />} />
        <AnalyticCard label="Avg Sleep" value={`${summary.avgSleep.toFixed(1)}h/night`} icon={<Moon size={20} color="#b4a7d6" />} />
        <AnalyticCard label="Tasks Done" value={`${summary.totalTasks} in period`} icon={<CheckCircle2 size={20} color="#7cb9e8" />} />
        <AnalyticCard label="Study Hours" value={`${summary.totalStudy}h total`} icon={<Clock size={20} color="#98d4bb" />} />
      </section>

      <section className="large-chart-card">
        <header className="chart-header">
          <h3>Stress Trends</h3>
          <div className="tab-group">
            {[7, 30, 90].map(d => (
              <button key={d} className={`tab ${days === d ? 'active' : ''}`} onClick={() => setDays(d)}>{d} Days</button>
            ))}
          </div>
        </header>
        <div className="stress-trend-chart">
          {history.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={12} tick={{fill: 'var(--text-muted)'}} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="stressLevel" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorStress)" dot={{ r: 4, fill: 'var(--bg-card)', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-msg">Need more data to show trend</div>
          )}
        </div>
      </section>

      <section className="analytics-bottom-grid">
        <div className="small-chart-card">
          <h3>Sleep Pattern</h3>
          <div className="bar-chart-visual">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-7)}>
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} fontSize={10} tick={{fill: 'var(--text-muted)'}} />
                <Tooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{ borderRadius: '10px' }} />
                <Bar dataKey="sleepHours" fill="#b4a7d6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="small-chart-card">
          <h3>Productivity</h3>
          <div className="bar-chart-visual">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-7)}>
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} fontSize={10} tick={{fill: 'var(--text-muted)'}} />
                <Tooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{ borderRadius: '10px' }} />
                <Bar dataKey="tasksCompleted" fill="#7cb9e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="correlation-card">
        <h3>Intelligence Insights</h3>
        <div className="correlation-info">
          {insights.length > 0 ? insights.map((insight: string, idx: number) => (
            <div key={idx} className="insight-row">
              <div className="insight-dot"></div>
              <p>{insight}</p>
            </div>
          )) : (
            <p>Gathering more data to provide deep psychological insights...</p>
          )}
        </div>
      </section>
    </div>
  );
};

const AnalyticCard = memo(({ label, value, icon }: any) => (
  <div className="analytic-card">
    <div className="card-top">
      {icon}
      <span className="card-lbl">{label}</span>
    </div>
    <div className="card-val">{value}</div>
  </div>
));

export default AnalyticsPage;
