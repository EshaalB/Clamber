import React, { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/components/QuickAddTask.css';

interface QuickAddTaskProps {
  onAdd?: (task: {
    title: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
    subject: string;
  }) => void;
  onUpdate?: (task: {
    title: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
    subject: string;
  }) => void;
  onClose?: () => void;
  initialData?: {
    title: string;
    dueDate: string;
    status: 'Not Started' | 'In Progress' | 'Done';
    priority: 'High' | 'Medium' | 'Low';
    subject: string;
  };
}

const QuickAddTask: React.FC<QuickAddTaskProps> = ({ onAdd, onUpdate, onClose, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '');
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Done'>(initialData?.status || 'Not Started');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(initialData?.priority || 'Medium');
  const [subject, setSubject] = useState(initialData?.subject || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData = { 
      title: title.trim(), 
      dueDate, 
      status, 
      priority, 
      subject: subject.trim() || 'General' 
    };

    if (initialData && onUpdate) {
      onUpdate(taskData);
    } else {
      onAdd?.(taskData);
    }

    if (!initialData) {
      setTitle('');
      setDueDate('');
      setStatus('Not Started');
      setPriority('Medium');
      setSubject('');
    }
  };

  return (
    <div className="quick-add-container">
      <div className="quick-add-header">
        <h3>{initialData ? 'Edit Task' : 'Add New Task'}</h3>
        {onClose && <button type="button" onClick={onClose} className="btn-close"><X size={18} /></button>}
      </div>

      <form onSubmit={handleSubmit}>
        <label className="form-label">Task Title *</label>
        <input 
          type="text" 
          className="quick-add-input" 
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input 
              type="date"
              className={`quick-add-input ${!dueDate ? 'placeholder' : ''}`}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input 
              type="text"
              className="quick-add-input"
              placeholder="e.g. Data Structures"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="quick-add-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select 
              className="quick-add-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="quick-add-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-submit-task" disabled={!title.trim()}>
            {initialData ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuickAddTask;
