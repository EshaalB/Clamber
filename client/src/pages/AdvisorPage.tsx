import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Mail, ExternalLink, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { advisorApi } from '../api/advisorApi';
import '../styles/pages/AdvisorPage.css';



const AdvisorPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    document.title = 'Clamber - Advisor Portal';
    const load = async () => {
      try {
        const { data } = await advisorApi.getDashboard();
        setRows(data.data || []);
      } catch (err) {
        console.error('Failed to load advisor dashboard', err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Initial mount is instant.

  return (
    <div className="advisor-container">
      <header className="advisor-header">
        <div className="header-text">
          <h1>Advisor Support Portal</h1>
          <p>Monitor anonymized student risk levels and provide proactive support.</p>
        </div>
      </header>

      <section className="advisor-stats-overview">
        <div className="advisor-stat-card">
          <span className="stat-label">Monitored Students</span>
          <div className="stat-value">
            <Users size={20} className="inline-icon" /> {rows.length}
          </div>
        </div>
        <div className="advisor-stat-card">
          <span className="stat-label">High Risk Alerts</span>
          <div className="stat-value" style={{ color: '#ef4444' }}>
            <AlertCircle size={20} className="inline-icon" /> {rows.filter(r => r.riskLevel === 'High').length}
          </div>
        </div>
        <div className="advisor-stat-card">
          <span className="stat-label">Wellness Baseline</span>
          <div className="stat-value" style={{ color: '#10b981' }}>
            <CheckCircle size={20} className="inline-icon" /> 84%
          </div>
        </div>
      </section>

      <div className="advisor-table-wrapper">
        <table className="advisor-table">
          <thead>
            <tr>
              <th>Student Alias</th>
              <th>Risk Level</th>
              <th>Burnout Index</th>
              <th>Workload</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.studentAlias}>
                <td>
                  <span className="student-alias">{row.studentAlias}</span>
                </td>
                <td>
                  <span className={`risk-pill ${row.riskLevel.toLowerCase()}`}>
                    {row.riskLevel}
                  </span>
                </td>
                <td>
                  <span className="burnout-score">{row.burnoutScore}/100</span>
                </td>
                <td>
                  <div className="workload-info">
                    {row.workloadSummary?.overdueTasks} overdue • {row.workloadSummary?.incompleteTasks} active
                  </div>
                </td>
                <td>
                  <div className="action-group" style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-action btn-reach-out" title="Send anonymous support resource">
                      <Mail size={14} />
                    </button>
                    <button className="btn-action" title="View historical trend">
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-disabled)' }}>
                  No students have granted access to their metrics yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.some(r => r.riskLevel === 'High') && (
        <div className="advisor-alert-box" style={{ marginTop: '24px', padding: '16px', background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShieldAlert color="#ef4444" size={24} />
          <div>
            <h4 style={{ color: '#c53030', margin: 0 }}>Active High-Risk Alert</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#742a2a' }}>
              Multiple students are showing critical burnout metrics. We recommend reviewing student workloads and sending resource prompts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvisorPage;
