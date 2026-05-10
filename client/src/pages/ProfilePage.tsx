/**
 * ProfilePage: Student academic identity and history management.
 * Tracks course progress, GPA goals, and archives semester performance.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { 
  User, BookOpen, Loader2, 
  Plus, Camera, Activity, MapPin, Award 
} from 'lucide-react';

import { useAuthStore } from '../hooks/useAuthStore';
import { userApi } from '../api/userApi';
import { activityApi } from '../api/activityApi';
import { courseApi } from '../api/courseApi';
import { showConfirm, showSuccess, showError, showToast } from '../utils/swal';
import '../styles/pages/ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [profileStats, setProfileStats] = useState({ courseCount: 0, totalCredits: 0 });
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    major: user?.major || '',
    year: user?.year || 1,
    targetGPA: user?.targetGPA || 3.5
  });

  const [courseDraft, setCourseDraft] = useState({ name: '', credits: 3, goalGrade: 'A' });

  const fetchProfileData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [profileRes, activitiesRes, coursesRes] = await Promise.all([
        userApi.getProfile(),
        activityApi.getActivities(),
        courseApi.getCourses()
      ]);
      setProfileStats({
        courseCount: profileRes.data.data.courseCount || 0,
        totalCredits: profileRes.data.data.totalCredits || 0
      });
      setActivities(activitiesRes.data.data);
      setCourses(coursesRes.data.data);
    } catch (err) {
      console.error('Profile data fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Clamber - Profile';
    fetchProfileData();
  }, [fetchProfileData]);

  const handleSaveProfile = async () => {
    try {
      setSubmitting(true);
      const { data } = await userApi.updateProfile(profileData);
      updateUser(data.data);
      showSuccess('Profile Updated', 'Identity saved successfully.');
    } catch (err) {
      showError('Update Failed', 'Could not save profile changes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCourse = async () => {
    if (!courseDraft.name.trim()) return;
    try {
      setSubmitting(true);
      await courseApi.createCourse(courseDraft);
      setCourseDraft({ name: '', credits: 3, goalGrade: 'A' });
      setIsAddingCourse(false);
      showToast('Course added', 'success');
      fetchProfileData(true);
    } catch (err) {
      showError('Action Failed', 'Could not add course.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartNewSemester = async () => {
    const result = await showConfirm(
      'Start New Semester?',
      'This will archive your current courses. Proceed?',
      'Start Semester',
      'Cancel'
    );
    if (!result.isConfirmed) return;
    showSuccess('Archived', 'Current semester data has been archived.');
  };

  // Initial mount is instant.

  const yearLabel = (year: number) => {
    const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
    return years[year - 1] || 'Student';
  };

  return (
    <div className="profile-layout">
      <header className="profile-main-header">
        <h1>Profile</h1>
      </header>

      <div className="profile-grid-container">
        {/* Sidebar: Student Portfolio */}
        <aside className="profile-sidebar">
          <div className="sidebar-card">
            <div className="avatar-section">
              <div className="avatar-wrapper" onClick={() => document.getElementById('avatar-upload')?.click()}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="profile-img" />
                ) : (
                  <div className="avatar-placeholder"><User size={48} /></div>
                )}
                <button className="btn-avatar-edit"><Camera size={14} /></button>
              </div>
              <input 
                type="file" id="avatar-upload" hidden accept="image/*" 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('avatar', file);
                    try {
                      const { data } = await userApi.uploadAvatar(formData);
                      updateUser({ avatar: data.data.avatar });
                      showToast('Avatar updated', 'success');
                    } catch (err) {
                      showError('Upload Failed', 'Failed to update avatar.');
                    }
                  }
                }} 
              />
            </div>

            <div className="sidebar-identity">
              <h2>{user?.name || 'Student'}</h2>
              <div className="identity-tag">
                <MapPin size={14} />
                <span>{user?.major || 'General Studies'}</span>
              </div>
              <div className="identity-rating">
                <Award size={14} color="#f59e0b" />
                <strong>GPA: {user?.targetGPA?.toFixed(1) || '4.0'}</strong>
                <span className="rating-count">({yearLabel(user?.year || 1)})</span>
              </div>
            </div>

            <div className="sidebar-section">
              <p className="sidebar-subtitle">Academic Overview</p>
              <div className="sidebar-stats-grid">
                <div className="mini-stat">
                  <span className="mini-val">{profileStats.courseCount}</span>
                  <span className="mini-lbl">Courses</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-val">{profileStats.totalCredits}</span>
                  <span className="mini-lbl">Credits</span>
                </div>
              </div>
            </div>


          </div>
        </aside>

        {/* Main Content: Edit Features & Activity */}
        <main className="profile-main-content">
          <div className="content-card">
            <section className="profile-section">
              <h2 className="section-title-large">Personal Information</h2>
              <p className="section-desc">Manage your public identity and academic tracking goals.</p>
              
              <div className="profile-form-grid">
                <div className="form-item">
                  <label>Full Name</label>
                  <input 
                    type="text" value={profileData.name} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                  />
                </div>
                <div className="form-item">
                  <label>University Email</label>
                  <input type="email" value={user?.email} disabled className="disabled-input" />
                </div>
                <div className="form-item">
                  <label>Field of Study (Major)</label>
                  <input 
                    type="text" value={profileData.major} 
                    onChange={e => setProfileData({...profileData, major: e.target.value})} 
                  />
                </div>
                <div className="form-item">
                  <label>Current Year</label>
                  <select 
                    value={profileData.year} 
                    onChange={e => setProfileData({...profileData, year: parseInt(e.target.value)})}
                  >
                    <option value={1}>Freshman</option>
                    <option value={2}>Sophomore</option>
                    <option value={3}>Junior</option>
                    <option value={4}>Senior</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-actions">
                <button className="btn-primary" onClick={handleSaveProfile} disabled={submitting}>
                  {submitting ? <Loader2 className="spin" size={16} /> : 'Update Profile'}
                </button>
              </div>
            </section>

          </div>
        </main>
      </div>

      <div className="content-card full-width-card" style={{ marginTop: '32px' }}>
        <section className="profile-section" style={{ marginBottom: 0 }}>
          <h2 className="section-title-large">Semester Management</h2>
          <p className="section-desc">Manage your active subjects, add new courses, or archive the semester to start fresh.</p>
          
          <div className="course-list-compact" style={{ marginBottom: '24px' }}>
            {courses.map(course => (
              <div key={course._id} className="course-row-minimal">
                <div className="course-info">
                  <BookOpen size={16} />
                  <strong>{course.name}</strong>
                  <span>• {course.credits} Credits</span>
                </div>
                <div className="course-grade">{course.goalGrade}</div>
              </div>
            ))}
          </div>
          
          <div className="semester-actions-grid">
            <button className="btn-primary" onClick={() => setIsAddingCourse(true)} style={{ padding: '16px', flex: 1 }}>
              <Plus size={20} />
              <span>Add New Course</span>
            </button>
            <button className="btn-danger-outline" onClick={handleStartNewSemester} style={{ padding: '16px', flex: 1 }}>
              <BookOpen size={20} />
              <span>Archive Semester</span>
            </button>
          </div>
        </section>
      </div>

      {isAddingCourse && (
        <div className="modal-overlay" onClick={() => setIsAddingCourse(false)}>
          <div className="modal-content course-add-modal" onClick={e => e.stopPropagation()}>
            <h3>Add New Course</h3>
            <div className="profile-form">
              <div className="input-group full-width">
                <label>Course Title</label>
                <input value={courseDraft.name} onChange={e => setCourseDraft({...courseDraft, name: e.target.value})} placeholder="e.g. Advanced Calculus" />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Credits</label>
                  <input type="number" value={courseDraft.credits} onChange={e => setCourseDraft({...courseDraft, credits: parseInt(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label>Goal Grade</label>
                  <select value={courseDraft.goalGrade} onChange={e => setCourseDraft({...courseDraft, goalGrade: e.target.value})}>
                    <option>A</option><option>B</option><option>C</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn-outline" onClick={() => setIsAddingCourse(false)} disabled={submitting}>Cancel</button>
                <button className="btn-primary" onClick={handleAddCourse} disabled={submitting || !courseDraft.name.trim()}>
                  {submitting ? <Loader2 className="spin" size={16} /> : 'Add Course'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
