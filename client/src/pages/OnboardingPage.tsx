import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Mountain, User, GraduationCap, 
  Book, Plus, Sun, Sunrise, Moon, Sunset, Coffee, 
  Bed, AlertTriangle, Briefcase, Users, Loader2
} from 'lucide-react';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../hooks/useAuthStore';
import '../styles/pages/OnboardingPage.css';

interface Course {
  name: string;
  credits: number;
}

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    year: 1,
    major: '',
    courses: [] as Course[],
    targetGPA: 3.5,
    studyPreference: 'afternoon',
    breakPreference: 'medium',
    sleepHours: 7,
    stressLevel: 3,
    commitments: {
      prayerReminders: false,
      familyTime: false,
      partTimeJob: false,
    }
  });

  const handleNext = async () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await userApi.completeOnboarding(formData);
      updateUser(data.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / 6) * 100;

  return (
    <div className="onboarding-container force-default-theme">
      <div className="onboarding-card">
        <header className="onboarding-logo-header">
          <Mountain size={28} color="var(--active-accent)" />
          <span>Clamber</span>
        </header>

        <div className="onboarding-progress-bar">
          <div className="progress-fill" style={{ '--progress': `${progress}%` } as React.CSSProperties}></div>
        </div>

        {error && <div className="onboard-error">{error}</div>}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <StepStudentInfo data={formData} setData={setFormData} />}
            {step === 2 && <StepCourses data={formData} setData={setFormData} />}
            {step === 3 && <StepGPAGoals data={formData} setData={setFormData} />}
            {step === 4 && <StepStudyRoutine data={formData} setData={setFormData} />}
            {step === 5 && <StepWellness data={formData} setData={setFormData} />}
            {step === 6 && <StepCommitments data={formData} setData={setFormData} />}
          </motion.div>
        </AnimatePresence>

        <div className="step-footer">
          <button className={`btn-onboard-back ${step === 1 ? 'hidden' : ''}`} onClick={handleBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <span className="step-indicator">{step} of 6</span>
          <button className="btn-onboard-continue" onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : (
              <>{step === 6 ? 'Finish' : 'Continue'} <ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>
      <div className="skip-link" onClick={() => handleFinish()}>Skip onboarding for now</div>
    </div>
  );
};

// --- Step Components ---

const StepStudentInfo = ({ data, setData }: any) => (
  <>
    <h2 className="onboarding-title">Student Info</h2>
    <p className="onboarding-subtitle">Tell us about yourself</p>
    <div>
      <label className="onboard-label">What's your full name?</label>
      <div className="onboard-input-group">
        <User size={18} className="onboard-input-icon" />
        <input 
          className="onboard-input with-icon" 
          placeholder="Ahmed Khan" 
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
      </div>
      
      <label className="onboard-label">Which year are you in?</label>
      <select 
        className="onboard-input" 
        value={data.year}
        onChange={(e) => setData({ ...data, year: parseInt(e.target.value) })}
      >
        <option value="1">Freshman (1st Year)</option>
        <option value="2">Sophomore (2nd Year)</option>
        <option value="3">Junior (3rd Year)</option>
        <option value="4">Senior (4th Year)</option>
      </select>

      <label className="onboard-label">What's your major?</label>
      <div className="onboard-input-group">
        <GraduationCap size={18} className="onboard-input-icon" />
        <input 
          className="onboard-input with-icon" 
          placeholder="Computer Science" 
          value={data.major}
          onChange={(e) => setData({ ...data, major: e.target.value })}
        />
      </div>
    </div>
  </>
);

const StepCourses = ({ data, setData }: any) => {
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(3);

  const addCourse = () => {
    if (!courseName) return;
    setData({
      ...data,
      courses: [...data.courses, { name: courseName, credits }]
    });
    setCourseName('');
    setCredits(3);
  };

  const removeCourse = (index: number) => {
    const newCourses = [...data.courses];
    newCourses.splice(index, 1);
    setData({ ...data, courses: newCourses });
  };

  return (
    <>
      <h2 className="onboarding-title">Courses</h2>
      <p className="onboarding-subtitle">Add your current courses</p>
      
      <div className="course-list-scroll">
        <label className="onboard-label">Your Courses ({data.courses.length})</label>
        {data.courses.map((c: any, i: number) => (
          <div key={i} className="added-course-item">
            <div className="course-info">
              <h5>{c.name}</h5>
              <p>{c.credits} credit hours</p>
            </div>
            <button onClick={() => removeCourse(i)} className="btn-remove-course">Remove</button>
          </div>
        ))}
      </div>

      <div className="add-course-section">
        <h6 className="add-course-title">
          <Plus size={16} /> Add New Course
        </h6>
        <label className="onboard-label">Course Name</label>
        <input 
          className="onboard-input" 
          placeholder="e.g., Introduction to CS" 
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <label className="onboard-label">Credit Hours</label>
        <div className="credit-hour-selector">
          <button onClick={() => setCredits(Math.max(1, credits - 1))} className="btn-credit-adjust">-</button>
          <div className="credit-display">
            <span className="credit-number">{credits}</span>
            <div className="credit-label">credit hours</div>
          </div>
          <button onClick={() => setCredits(Math.min(6, credits + 1))} className="btn-credit-adjust">+</button>
        </div>
        <button 
          onClick={addCourse}
          className="btn-add-course-confirm"
        >
          + Add Course
        </button>
      </div>
    </>
  );
};

const StepGPAGoals = ({ data, setData }: any) => {
  return (
    <>
      <h2 className="onboarding-title">GPA Goals</h2>
      <p className="onboarding-subtitle">Set your target GPA</p>
      
      <div className="gpa-display-section">
        <div className="gpa-display-label">Target GPA</div>
        <div className="gpa-display-value">{data.targetGPA.toFixed(1)}</div>
      </div>

      <label className="onboard-label">Choose a predefined goal</label>
      <div className="gpa-btns">
        {[2.5, 3.0, 3.5, 4.0].map(val => (
          <button 
            key={val} 
            className={`gpa-btn ${data.targetGPA === val ? 'selected' : ''}`} 
            onClick={() => setData({ ...data, targetGPA: val })}
          >
            {val.toFixed(1)}
          </button>
        ))}
      </div>

      <label className="onboard-label">Custom GPA</label>
      <input 
        type="number" 
        step="0.1" 
        min="0" 
        max="4"
        className="onboard-input" 
        placeholder="Enter custom GPA (0.00 - 4.00)" 
        value={data.targetGPA}
        onChange={(e) => setData({ ...data, targetGPA: parseFloat(e.target.value) || 0 })}
      />
    </>
  );
};

const StepStudyRoutine = ({ data, setData }: any) => {
  return (
    <>
      <h2 className="onboarding-title">Study Routine</h2>
      <p className="onboarding-subtitle">Define your study preference</p>

      <label className="onboard-label">When do you prefer to study?</label>
      <div className="choice-grid">
        {[
          { id: 'morning', icon: Sunrise, title: 'Early Morning', desc: '6:00 AM - 12:00 PM' },
          { id: 'afternoon', icon: Sun, title: 'Afternoon', desc: '12:00 PM - 6:00 PM' },
          { id: 'evening', icon: Sunset, title: 'Evening', desc: '6:00 PM - 10:00 PM' },
          { id: 'night', icon: Moon, title: 'Late Night', desc: '10:00 PM - 2:00 AM' },
        ].map(item => (
          <div 
            key={item.id} 
            className={`choice-card ${data.studyPreference === item.id ? 'selected' : ''}`} 
            onClick={() => setData({ ...data, studyPreference: item.id })}
          >
            <item.icon size={20} />
            <h5>{item.title}</h5>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>

      <label className="onboard-label">Break preference</label>
      <div className="choice-grid grid-4">
        {[
          { id: 'none', icon: AlertTriangle, title: 'No Breaks' },
          { id: 'short', icon: Coffee, title: 'Short' },
          { id: 'medium', icon: Book, title: 'Medium' },
          { id: 'long', icon: Bed, title: 'Long' },
        ].map(item => (
          <div 
            key={item.id} 
            className={`choice-card compact ${data.breakPreference === item.id ? 'selected' : ''}`} 
            onClick={() => setData({ ...data, breakPreference: item.id })} 
          >
            <item.icon size={16} />
            <h5 className="choice-title-compact">{item.title}</h5>
          </div>
        ))}
      </div>
    </>
  );
};

const StepWellness = ({ data, setData }: any) => {
  return (
    <>
      <h2 className="onboarding-title">Wellness</h2>
      <p className="onboarding-subtitle">Sleep & stress baseline</p>
      <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
        Wellness inputs are used for risk estimation only and are not a clinical assessment.
      </p>

      <label className="onboard-label">Average sleep hours per night</label>
      <div className="sleep-range-container">
        <input 
          type="range" 
          min="4" 
          max="12" 
          value={data.sleepHours} 
          onChange={(e) => setData({ ...data, sleepHours: parseInt(e.target.value) })}
          className="onboard-range-input"
        />
        <div className="sleep-value-badge">{data.sleepHours}h</div>
      </div>

      <label className="onboard-label">Current stress level</label>
      <div className="stress-selector">
        {[1, 2, 3, 4, 5].map(lv => (
          <button 
            key={lv} 
            className={`stress-btn ${data.stressLevel === lv ? 'selected' : ''}`} 
            onClick={() => setData({ ...data, stressLevel: lv })}
          >
            {lv}
          </button>
        ))}
      </div>
      <div className="stress-labels">
        <span>Low Stress</span>
        <span>High Stress</span>
      </div>
    </>
  );
};

const StepCommitments = ({ data, setData }: any) => {
  const toggle = (field: string) => {
    setData({
      ...data,
      commitments: {
        ...data.commitments,
        [field]: !data.commitments[field as keyof typeof data.commitments]
      }
    });
  };

  return (
    <>
      <h2 className="onboarding-title">Commitments</h2>
      <p className="onboarding-subtitle">Prayer times & personal</p>

      {[
        { id: 'prayerReminders', icon: Moon, color: '#0ea5e9', bg: '#e0f2fe', title: 'Prayer time reminders', desc: 'Block study time around prayer schedules' },
        { id: 'familyTime', icon: Users, color: '#6b7280', bg: '#f3f4f6', title: 'Family commitments', desc: 'Reserve time for family responsibilities' },
        { id: 'partTimeJob', icon: Briefcase, color: '#6b7280', bg: '#f3f4f6', title: 'Part-time job', desc: 'Account for work hours in your schedule' },
      ].map(item => (
        <div 
          key={item.id} 
          className={`option-list-item ${data.commitments[item.id as keyof typeof data.commitments] ? 'selected' : ''} ${item.id}`}
          onClick={() => toggle(item.id)}
        >
          <div className="option-icon-box"><item.icon size={20} /></div>
          <div className="option-text">
            <h5>{item.title}</h5>
            <p>{item.desc}</p>
          </div>
          <div className="option-check"></div>
        </div>
      ))}
    </>
  );
};

export default OnboardingPage;
