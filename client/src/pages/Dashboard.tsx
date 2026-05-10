/**
 * Dashboard: Central control center for student productivity.
 * Manages task tracking, focus sessions, and wellness monitoring.
 */
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, GraduationCap, Target, Activity, 
  Loader2, Moon, ChevronRight, Heart
} from 'lucide-react';

import { useAuthStore } from '../hooks/useAuthStore';
import { taskApi } from '../api/taskApi';
import { activityApi } from '../api/activityApi';
import { analyticsApi } from '../api/analyticsApi';
import { courseApi } from '../api/courseApi';

import PomodoroTimer from '../components/shared/PomodoroTimer';
import QuickAddTask from '../components/shared/QuickAddTask';
import '../styles/pages/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showWellnessPrompt, setShowWellnessPrompt] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [courseCount, setCourseCount] = useState(0);
  const [burnoutScore, setBurnoutScore] = useState(0);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wellnessData, setWellnessData] = useState({ sleepHours: 7, stressLevel: 3 });

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [statsRes, activityRes, coursesRes, burnoutRes] = await Promise.all([
        taskApi.getTaskStats(),
        activityApi.getActivities(),
        courseApi.getCourses(),
        analyticsApi.getBurnoutScore(7).catch(() => ({ data: { data: { score: 0 } } }))
      ]);
      setStats(statsRes.data.data);
      setActivities(activityRes.data.data);
      setCourseCount(coursesRes.data.data.length);
      setBurnoutScore(burnoutRes.data.data.score || 0);
      
      if (user?.lastWellnessUpdate) {
        const lastUpdate = new Date(user.lastWellnessUpdate);
        const diffDays = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
        const hasShownInSession = sessionStorage.getItem('clamber_wellness_prompt_shown');
        
        if (diffDays > 7 && !hasShownInSession) {
          setShowWellnessPrompt(true);
          sessionStorage.setItem('clamber_wellness_prompt_shown', 'true');
        }
      }
    } catch (err) {
      console.error('Dashboard data fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, [user?.lastWellnessUpdate]);

  useEffect(() => {
    document.title = 'Clamber - Dashboard';
    fetchData();
  }, [fetchData]);

  const [submittingWellness, setSubmittingWellness] = useState(false);

  const handleWellnessSubmit = async () => {
    try {
      setSubmittingWellness(true);
      await analyticsApi.recordAnalytics({
        sleepHours: wellnessData.sleepHours,
        stressLevel: wellnessData.stressLevel * 20,
        studyHours: 4 // Defaulting to 4h for check-in
      });
      await fetchData(true);
      setShowWellnessPrompt(false);
    } catch (err) {
      console.error('Wellness update failed', err);
    } finally {
      setSubmittingWellness(false);
    }
  };

  const firstName = useMemo(() => (user?.name || 'Student').split(' ')[0], [user?.name]);

  // No longer returning a full-page loader here to keep navigation instant.
  // The layout will render immediately and data will pop in.

  return (
    <div className="dashboard-board-container">
      <header className="board-header">
        <div className="header-left-group">
          <h1>Good morning, {firstName}!</h1>
          <p>You've completed {stats?.completionRate || 0}% of your goals this week.</p>
        </div>
        <div className="header-actions-group">
          <button className="btn-primary" onClick={() => setIsAddingTask(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </header>

      <main className="dashboard-main-content">
        <div className="dashboard-left-col">
          <section className="dashboard-hero">
            <div className="hero-stats-internal">
              <StatCard label="Courses" value={courseCount} sub="Active" icon={<GraduationCap size={20} />} color="var(--icon-mint)" bg="var(--accent-mint)" />
              <StatCard label="Tasks" value={stats?.todaysTasks?.length || 0} sub="Today" icon={<Target size={20} />} color="var(--icon-blue)" bg="var(--accent-blue)" />
              <StatCard label="Burnout" value={burnoutScore} sub="/ 100" icon={<Activity size={20} />} color="var(--icon-pink)" bg="var(--accent-pink)" />
            </div>

            <div className="hero-actions">
              <button className="hero-btn primary btn-shine" onClick={() => navigate('/tasks')}>
                View My Progress <ChevronRight size={16} />
              </button>
              <button className="hero-btn secondary" onClick={() => setShowWellnessPrompt(true)}>
                <Heart size={16} /> Wellness Check
              </button>
            </div>
          </section>

          <div className="dashboard-panel focus-panel">
            <header className="panel-header">
              <h3>Today's Study Plan</h3>
              <div className="panel-header-actions">
                <button className="btn-icon" onClick={() => setIsAddingTask(true)}><Plus size={16} /></button>
              </div>
            </header>
            <div className="task-list">
              {!loading && (stats?.todaysTasks || []).length === 0 && (
                <div className="empty-state">
                  <p>All caught up! Time to relax.</p>
                </div>
              )}
              {(stats?.todaysTasks || []).map((t: any) => (
                <TaskEntry 
                  key={t._id}
                  title={t.title} 
                  course={t.subject} 
                  priority={t.priority} 
                  time={t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Flexible'} 
                />
              ))}
              {loading && (stats?.todaysTasks || []).length === 0 && (
                <div className="loader-centered" style={{ minHeight: '100px' }}>
                  <Loader2 className="spin" size={24} color="var(--active-accent)" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-right-col">
          <div className="dashboard-panel card-standard timer-panel">
            <header className="panel-header">
              <h3>Focus Timer</h3>
            </header>
            <PomodoroTimer />
          </div>

          <div className="dashboard-panel card-standard upcoming-panel">
            <header className="panel-header">
              <h3>Upcoming Events</h3>
              <button className="see-all" onClick={() => navigate('/tasks')}>View All</button>
            </header>
            <div className="upcoming-list">
              {stats?.upcomingDeadlines?.slice(0, 5).map((t: any) => (
                <div key={t._id} className="upcoming-item">
                  <div className="upcoming-date">
                    <span className="day">{new Date(t.dueDate).getDate()}</span>
                    <span className="month">{new Date(t.dueDate).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <div className="upcoming-details">
                    <h5>{t.title}</h5>
                    <p>{t.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-panel card-standard activity-panel">
            <header className="panel-header">
              <h3>Activity</h3>
            </header>
            <div className="activity-list">
              {activities.slice(0, 3).map((a: any) => (
                <div key={a._id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <p className="activity-title">{a.title}</p>
                    <span className="activity-meta">{new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showWellnessPrompt && (
        <div className="modal-overlay">
          <div className="modal-content wellness-modal">
            <header className="modal-header">
              <Moon size={24} color="var(--active-accent)" />
              <h2>Weekly Wellness Pulse</h2>
            </header>
            <p>How have you been feeling this week? This helps Clamber adjust your workload.</p>
            
            <div className="form-group">
              <label>Average Sleep Hours: {wellnessData.sleepHours}h</label>
              <input 
                type="range" min="4" max="12" 
                value={wellnessData.sleepHours} 
                onChange={e => setWellnessData({...wellnessData, sleepHours: parseInt(e.target.value)})}
              />
            </div>

            <div className="form-group stress-selector">
              <label>Stress Level (1-5): <span className="value-badge">{wellnessData.stressLevel}</span></label>
              <div className="stress-pills">
                {[1,2,3,4,5].map(v => (
                  <button 
                    key={v} 
                    className={`stress-pill ${wellnessData.stressLevel === v ? 'active' : ''}`}
                    onClick={() => setWellnessData({...wellnessData, stressLevel: v})}
                  >
                    <span className="pill-number">{v}</span>
                    <span className="pill-label">{['Low', 'Mild', 'Mod', 'High', 'Extr'][v-1]}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary full-width" onClick={handleWellnessSubmit} disabled={submittingWellness}>
              {submittingWellness ? <Loader2 className="spin" size={16} /> : 'Update Baseline'}
            </button>
            <button className="btn-outline full-width mt-8" onClick={() => setShowWellnessPrompt(false)}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      {isAddingTask && (
        <div className="modal-overlay" onClick={() => setIsAddingTask(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <QuickAddTask 
              onClose={() => setIsAddingTask(false)} 
              onAdd={async (t: any) => {
                await taskApi.createTask(t);
                setIsAddingTask(false);
                fetchData(true);
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = memo(({ label, value, sub, icon, color, bg }: any) => (
  <div className="hero-stat-card">
    <div className="stat-icon-wrapper" style={{ '--icon-bg': bg, '--icon-color': color } as React.CSSProperties}>{icon}</div>
    <div className="stat-data">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value} <small>{sub}</small></span>
    </div>
  </div>
));

const TaskEntry = memo(({ title, course, priority, time }: any) => (
  <div className="task-row">
    <div className="task-status-circle" data-priority={priority}></div>
    <div className="task-main">
      <h4>{title}</h4>
      <p>{course}</p>
    </div>
    <div className="task-time-badge">{time}</div>
  </div>
));

export default Dashboard;
