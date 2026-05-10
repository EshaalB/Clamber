/**
 * GradePlannerPage: Advanced academic projection and target tracking.
 * Calculates required averages and manages assessment breakdowns to maintain target GPAs.
 */
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Target, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { courseApi } from '../api/courseApi';
import { userApi } from '../api/userApi';
import { useAuthStore } from '../hooks/useAuthStore';
import '../styles/pages/GradePlannerPage.css';

const GradePlannerPage: React.FC = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [gpaData, setGpaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [coursesRes, gpaRes] = await Promise.all([
        courseApi.getCourses(),
        courseApi.getGPA()
      ]);
      setCourses(coursesRes.data.data);
      setGpaData(gpaRes.data.data);
    } catch (err) {
      console.error('Grade planner fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Clamber - Grade Planner';
    fetchData();
  }, [fetchData]);

  const projectedGPA = useMemo(() => {
    if (!courses.length) return 0;
    const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
    const totalPoints = courses.reduce((acc, c) => {
      const targetPct = c.targetGrade || 80;
      let gpa = 1.0;
      if (targetPct >= 90) gpa = 4.0;
      else if (targetPct >= 80) gpa = 3.3;
      else if (targetPct >= 70) gpa = 2.7;
      else if (targetPct >= 60) gpa = 2.0;
      return acc + (gpa * c.credits);
    }, 0);
    return totalCredits > 0 ? (totalPoints / totalCredits) : 0;
  }, [courses]);

  // Initial mount is instant.

  const currentGPA = gpaData?.currentGPA || 0;
  const targetGPA = user?.targetGPA || 3.5;

  return (
    <div className="grade-planner-container">
      <header className="planner-header">
        <div className="header-left-group">
          <h1>Reverse Grade Planner</h1>
          <p>Break down your courses and see exactly what you need to score</p>
        </div>
      </header>

      <section className="planner-summary-row">
        <div className="planner-summary-card">
          <div className="card-lbl">Current GPA</div>
          <div className="card-val">
            <input 
              type="number" step="0.01" min="0" max="4" 
              value={currentGPA} 
              onChange={async (e) => {
                const val = parseFloat(e.target.value);
                setGpaData({ ...gpaData, currentGPA: val });
                await userApi.updateProfile({ currentGPA: val });
              }}
              className="gpa-edit-input"
            />
          </div>
          <div className="gpa-progress-track">
            <div className="gpa-progress-fill" style={{ width: `${(currentGPA / 4) * 100}%` }}></div>
          </div>
        </div>
        <div className="planner-summary-card">
          <div className="card-lbl">Projected GPA</div>
          <div className="card-val highlight-blue">{projectedGPA.toFixed(2)}</div>
          <div className="card-subtext">Based on your target grades</div>
        </div>
        <div className="planner-summary-card">
          <div className="card-lbl">Personal Goal</div>
          <div className="card-val">{targetGPA.toFixed(2)}</div>
          <div className="card-subtext">Set in onboarding</div>
        </div>
      </section>

      <div className="course-plans-list">
        {courses.map(course => (
          <CourseDetailCard key={course._id} course={course} onUpdate={() => fetchData(true)} />
        ))}
        {courses.length === 0 && (
          <div className="empty-state-card">
            <Target size={48} strokeWidth={1} color="var(--text-disabled)" />
            <p>Your academic map is empty. Add your courses to start planning your grades.</p>
            <button className="btn-primary btn-shine" onClick={() => window.location.href='/settings'}>
              Go to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CourseDetailCard = memo(({ course, onUpdate }: { course: any, onUpdate: () => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ name: '', type: 'Assignment', weight: 10, grade: '' });

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedAssessments = [...(course.assessments || []), { 
        ...newAssessment, 
        grade: newAssessment.grade === '' ? null : Number(newAssessment.grade) 
      }];
      await courseApi.updateCourse(course._id, { assessments: updatedAssessments });
      onUpdate();
      setIsAdding(false);
      setNewAssessment({ name: '', type: 'Assignment', weight: 10, grade: '' });
    } catch (err) {
      console.error('Assessment add failed', err);
    }
  };

  const handleDeleteAssessment = async (index: number) => {
    try {
      const updatedAssessments = course.assessments.filter((_: any, i: number) => i !== index);
      await courseApi.updateCourse(course._id, { assessments: updatedAssessments });
      onUpdate();
    } catch (err) {
      console.error('Assessment delete failed', err);
    }
  };

  return (
    <div className={`course-detail-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="card-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="course-info">
          <h3>{course.name} <span className="credits">{course.credits} Cr</span></h3>
          <div className="status-row">
            <span className={`status-pill ${course.status.toLowerCase().replace(' ', '-')}`}>{course.status}</span>
            <span className="grade-summary">Current: <strong>{course.currentGrade}%</strong></span>
          </div>
        </div>
        <div className="course-header-actions">
          <div className="circular-progress" style={{ borderColor: getStatusColor(course.status) }}>
            {course.currentGrade}%
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="card-body">
          <div className="assessment-list">
            <h4>Assessments Breakdown</h4>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Weight</th>
                  <th>Grade</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {course.assessments?.map((as: any, idx: number) => (
                  <tr key={idx}>
                    <td>{as.name}</td>
                    <td><span className="type-tag">{as.type}</span></td>
                    <td>{as.weight}%</td>
                    <td>{as.grade !== null ? `${as.grade}%` : <span className="pending">Pending</span>}</td>
                    <td>
                      <button className="btn-icon-delete" onClick={() => handleDeleteAssessment(idx)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!isAdding ? (
              <button className="btn-add-inline" onClick={() => setIsAdding(true)}>
                <Plus size={14} /> Add Component
              </button>
            ) : (
              <form className="add-assessment-form" onSubmit={handleAddAssessment}>
                <input placeholder="Name" value={newAssessment.name} onChange={e => setNewAssessment({...newAssessment, name: e.target.value})} required />
                <select value={newAssessment.type} onChange={e => setNewAssessment({...newAssessment, type: e.target.value})}>
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                </select>
                <input type="number" placeholder="Weight %" value={newAssessment.weight} onChange={e => setNewAssessment({...newAssessment, weight: Number(e.target.value)})} required />
                <input type="number" placeholder="Grade % (optional)" value={newAssessment.grade} onChange={e => setNewAssessment({...newAssessment, grade: e.target.value})} />
                <div className="form-btns">
                  <button type="submit" className="btn-save">Save</button>
                  <button type="button" className="btn-cancel" onClick={() => setIsAdding(false)}>Cancel</button>
                </div>
              </form>
            )}
          </div>

          {course.revisedTarget && (
            <div className="recovery-mode-banner">
              <Flame size={20} />
              <div className="banner-content">
                <strong>Academic Recovery Mode Active</strong>
                <p>Original target {course.targetGrade}% is unreachable. Your revised realistic target is <strong>{course.revisedTarget}%</strong>.</p>
              </div>
            </div>
          )}

          <div className="required-avg-box" data-unreachable={!!course.revisedTarget}>
            <Target size={20} />
            <div className="box-content">
              <span>Required average on remaining assessments to hit <strong>{course.targetGrade}%</strong>:</span>
              <span className="req-val">{course.requiredAverage > 100 ? 'Unreachable' : `${course.requiredAverage}%`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'At Risk': return '#ef4444';
    case 'Slight Risk': return '#f5b89a';
    case 'On Track': return '#98d4bb';
    default: return '#7cb9e8';
  }
};

export default GradePlannerPage;
