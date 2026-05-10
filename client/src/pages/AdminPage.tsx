import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Settings, 
  Trash2, Plus, Search, Download, 
  Loader2, Activity, CheckCircle, 
  AlertCircle, Database, FileText, 
  BarChart3, ExternalLink, Ban, 
  RefreshCcw, Bell
} from 'lucide-react';
import { adminApi } from '../api/adminApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { showConfirm, showSuccess, showError, showToast } from '../utils/swal';
import '../styles/pages/AdminPage.css';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'logs'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, logsRes, settingsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(search),
        adminApi.getLogs(),
        adminApi.getSystemSettings()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setLogs(logsRes.data.data);
      setSystemSettings(settingsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
      showError('Fetch Error', 'Could not load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Clamber - System Administration';
    fetchData();
  }, [search]);

  const handleBulkVerify = async () => {
    if (selectedUsers.length === 0) return;
    const res = await showConfirm('Verify Selected?', `Manually verify ${selectedUsers.length} users?`);
    if (!res.isConfirmed) return;
    
    try {
      await adminApi.bulkVerify(selectedUsers);
      showToast('Bulk verification complete', 'success');
      fetchData();
      setSelectedUsers([]);
    } catch (err) {
      showError('Action Failed', 'Could not verify users.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    const res = await showConfirm('Delete Selected?', `Permanently delete ${selectedUsers.length} users? This is irreversible.`);
    if (!res.isConfirmed) return;
    
    try {
      await adminApi.bulkDelete(selectedUsers);
      showToast('Bulk deletion complete', 'success');
      fetchData();
      setSelectedUsers([]);
    } catch (err) {
      showError('Action Failed', 'Could not delete users.');
    }
  };

  const handleUpdateSystem = async (updates: any) => {
    try {
      const { data } = await adminApi.updateSystemSettings(updates);
      setSystemSettings(data.data);
      showToast('System settings updated', 'success');
    } catch (err) {
      showError('Update Failed', 'Could not save system settings.');
    }
  };

  const COLORS = ['#7CB9E8', '#A0CED9', '#FAD2E1', '#E2ECE9'];

  if (loading && !stats) {
    return (
      <div className="admin-loading-screen">
        <Loader2 className="spin" size={48} color="var(--active-accent)" />
        <p>Initializing Secure Admin Terminal...</p>
      </div>
    );
  }

  return (
    <div className="admin-master-container">
      <header className="admin-masthead">
        <div className="masthead-info">
          <h1>Clamber Command Center</h1>
          <p>Root-level access to system metrics, users, and global configurations.</p>
        </div>
        <nav className="admin-tab-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <BarChart3 size={18} /> Overview
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={18} /> User Directory
          </button>
          <button className={activeTab === 'system' ? 'active' : ''} onClick={() => setActiveTab('system')}>
            <Settings size={18} /> System Settings
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
            <FileText size={18} /> Security Logs
          </button>
        </nav>
      </header>

      <main className="admin-content-hub">
        {activeTab === 'overview' && (
          <div className="tab-pane animate-fade-in">
            <div className="stats-bento-grid">
              <AdminStatCard icon={<Users size={18} />} label="Total Registered" value={stats?.totalUsers} color="blue" />
              <AdminStatCard icon={<ShieldCheck size={18} />} label="Verified Advisors" value={stats?.advisors} color="lavender" />
              <AdminStatCard icon={<CheckCircle />} label="Tasks Processed" value={stats?.totalTasks} color="mint" />
              <AdminStatCard icon={<Activity />} label="Server Status" value="Operational" color="peach" />
            </div>

            <div className="admin-visual-grid">
              <div className="admin-visual-card">
                <h3>User Base Composition</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Students', value: stats?.activeStudents || 0 },
                          { name: 'Advisors', value: stats?.advisors || 0 }
                        ]}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill={COLORS[0]} />
                        <Cell fill={COLORS[1]} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="admin-visual-card">
                <h3>System Growth</h3>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={[
                      { name: 'Jan', val: 400 }, { name: 'Feb', val: 600 },
                      { name: 'Mar', val: 500 }, { name: 'Apr', val: 900 },
                      { name: 'May', val: 1200 }
                    ]}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--active-accent)" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="var(--active-accent)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="val" stroke="var(--active-accent)" fillOpacity={1} fill="url(#colorVal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-pane animate-fade-in">
            <div className="user-management-hub">
              <div className="hub-actions-bar">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="bulk-actions">
                  {selectedUsers.length > 0 && (
                    <>
                      <button className="btn-bulk verify" onClick={handleBulkVerify}>Verify ({selectedUsers.length})</button>
                      <button className="btn-bulk delete" onClick={handleBulkDelete}>Delete ({selectedUsers.length})</button>
                    </>
                  )}
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-premium-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" onChange={(e) => {
                        if (e.target.checked) setSelectedUsers(users.map(u => u._id));
                        else setSelectedUsers([]);
                      }} /></th>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className={selectedUsers.includes(u._id) ? 'selected' : ''}>
                        <td>
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.includes(u._id)}
                            onChange={() => {
                              setSelectedUsers(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]);
                            }}
                          />
                        </td>
                        <td>
                          <div className="user-profile-cell">
                            <div className="initial-avatar">{u.name.charAt(0)}</div>
                            <div className="info">
                              <strong>{u.name}</strong>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className={`badge-role ${u.role}`}>{u.role}</span></td>
                        <td>
                          <span className={`badge-status ${u.isVerified ? 'verified' : 'pending'}`}>
                            {u.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>
                          <div className="row-actions">
                            <button title="Reset Password" onClick={() => adminApi.resetPassword(u._id).then(() => showToast('Password reset', 'info'))}><RefreshCcw size={14} /></button>
                            <button title="Delete" className="danger" onClick={() => adminApi.deleteUser(u._id).then(() => fetchData())}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="tab-pane animate-fade-in">
            <div className="system-settings-grid">
              <div className="settings-card-premium">
                <div className="card-head">
                  <Ban size={20} />
                  <h3>Maintenance Mode</h3>
                </div>
                <p>Restrict application access to administrators only during system updates.</p>
                <div className={`toggle-switch ${systemSettings?.maintenanceMode ? 'active' : ''}`} 
                     onClick={() => handleUpdateSystem({ maintenanceMode: !systemSettings?.maintenanceMode })}>
                  <div className="knob"></div>
                </div>
              </div>

              <div className="settings-card-premium">
                <div className="card-head">
                  <Bell size={20} />
                  <h3>Global Announcement</h3>
                </div>
                <p>Broadcast a system-wide message to all logged-in users.</p>
                <textarea 
                  value={systemSettings?.globalMessage || ''}
                  onChange={(e) => setSystemSettings({...systemSettings, globalMessage: e.target.value})}
                  onBlur={(e) => handleUpdateSystem({ globalMessage: e.target.value })}
                  placeholder="Enter message..."
                />
              </div>

              <div className="settings-card-premium">
                <div className="card-head">
                  <Plus size={20} />
                  <h3>Public Registration</h3>
                </div>
                <p>Toggle whether new users can create accounts on the platform.</p>
                <div className={`toggle-switch ${systemSettings?.registrationOpen ? 'active' : ''}`} 
                     onClick={() => handleUpdateSystem({ registrationOpen: !systemSettings?.registrationOpen })}>
                  <div className="knob"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="tab-pane animate-fade-in">
            <div className="audit-trail-container">
              <div className="trail-header">
                <h3>Security & Audit Trail</h3>
                <button className="btn-refresh" onClick={fetchData}><RefreshCcw size={14} /> Refresh</button>
              </div>
              <div className="trail-list">
                {logs.map((log, i) => (
                  <div key={log._id || i} className="trail-item">
                    <div className="time">{new Date(log.createdAt).toLocaleTimeString()}</div>
                    <div className="user-ref">{log.userId?.name || 'System'}</div>
                    <div className={`action-type ${log.action.toLowerCase()}`}>{log.action}</div>
                    <div className="details">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const AdminStatCard = ({ icon, label, value, color }: any) => (
  <div className={`admin-stat-bento ${color}`}>
    <div className="icon-box">{icon}</div>
    <div className="text-box">
      <span className="lbl">{label}</span>
      <span className="val">{value}</span>
    </div>
  </div>
);

export default AdminPage;
