/**
 * TasksPage: Comprehensive task management interface.
 * Supports table and calendar views with advanced filtering and real-time updates.
 */
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { 
  Plus, CheckCircle2, Circle,
  Loader2, Search, Calendar, List
} from 'lucide-react';

import QuickAddTask from '../components/shared/QuickAddTask';
import TaskCalendar from '../components/tasks/TaskCalendar';
import { taskApi } from '../api/taskApi';
import { playSound } from '../utils/sound';
import '../styles/pages/TasksPage.css';

interface NotionTask {
  _id: string;
  title: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<NotionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<NotionTask | null>(null);
  const [view, setView] = useState<'table' | 'calendar'>('table');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await taskApi.getTasks();
      setTasks(data.data);
    } catch (err) {
      console.error('Tasks fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Clamber - Master Tasks';
    fetchTasks();
  }, [fetchTasks]);

  const handleUpdateTask = async (id: string, updates: Partial<NotionTask>) => {
    if (updates.status === 'Done') playSound('complete');
    setTasks(prev => prev.map(t => t._id === id ? { ...t, ...updates } : t));
    try {
      await taskApi.updateTask(id, updates);
    } catch (err) {
      console.error('Task update failed', err);
      fetchTasks(true);
    }
  };

  const handleAddTask = async (task: any) => {
    try {
      await taskApi.createTask(task);
      fetchTasks(true);
      setIsAddingTask(false);
    } catch (err) {
      console.error('Task creation failed', err);
    }
  };

  const handleEditSubmit = async (taskData: any) => {
    if (!editingTask) return;
    try {
      await handleUpdateTask(editingTask._id, taskData);
      setEditingTask(null);
    } catch (err) {
      console.error('Task edit failed', err);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                           t.subject?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'All' ? t.status !== 'Done' : t.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, filterStatus, filterPriority]);

  // Initial mount is instant.

  return (
    <div className="tasks-board-container">
      <header className="board-header">
        <div className="tasks-header-left">
          <h1>Your Tasks</h1>
        </div>
        <div className="tasks-header-right">
          <div className="view-toggle-pills">
            <button className={`view-pill ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>
              <List size={16} /> <span>List</span>
            </button>
            <button className={`view-pill ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
              <Calendar size={16} /> <span>Calendar</span>
            </button>
          </div>
          
          <div className="filter-group">
            <select className="filter-pill" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">Active Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Completed</option>
            </select>
            <select className="filter-pill" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="search-pill">
            <Search size={16} />
            <input placeholder="Filter tasks..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn-add-primary btn-shine" onClick={() => setIsAddingTask(true)}>
            <Plus size={18} /> New Task
          </button>
        </div>
      </header>

      {view === 'table' ? (
        <div className="notion-table-wrapper">
          <table className="notion-task-table">
            <thead>
              <tr>
                <th className="cell-title">Name</th>
                <th className="cell-date">Due Date</th>
                <th className="cell-subject">Subject</th>
                <th className="cell-status">Status</th>
                <th className="cell-priority">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table-row">
                    <div className="empty-state-content">
                      <CheckCircle2 size={32} color="var(--color-silver)" />
                      <p>You're all caught up! No active tasks.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <TaskRow key={task._id} task={task} onUpdate={handleUpdateTask} onEdit={setEditingTask} />
                ))
              )}
            </tbody>
          </table>
          <div className="table-add-row" onClick={() => setIsAddingTask(true)}>
            <Plus size={16} /> Add new row
          </div>
        </div>
      ) : (
        <TaskCalendar tasks={tasks} onEditTask={setEditingTask} />
      )}

      {(isAddingTask || editingTask) && (
        <div className="modal-overlay" onClick={() => { setIsAddingTask(false); setEditingTask(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <QuickAddTask 
              initialData={editingTask || undefined}
              onClose={() => { setIsAddingTask(false); setEditingTask(null); }} 
              onAdd={handleAddTask}
              onUpdate={handleEditSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const TaskRow = memo(({ task, onUpdate, onEdit }: any) => (
  <tr className="notion-row">
    <td className="cell-title" onClick={() => onEdit(task)}>
      <div className="title-cell-content">
        <button 
          className="btn-mark-done" 
          onClick={(e) => { e.stopPropagation(); onUpdate(task._id, { status: 'Done' }); }}
        >
          <Circle size={16} />
        </button>
        <input 
          type="text" 
          className="task-title-input" 
          value={task.title} 
          onChange={(e) => onUpdate(task._id, { title: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Task name"
        />
      </div>
    </td>
    <td className="cell-date">
      {task.dueDate ? (
        <span className="date-pill">
          <Calendar size={14} style={{ marginRight: 6 }} />
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </span>
      ) : (
        <span className="no-date">-</span>
      )}
    </td>
    <td className="cell-subject">
      <input 
        type="text" 
        className="subject-tag-input" 
        value={task.subject || ''} 
        onChange={(e) => onUpdate(task._id, { subject: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="General"
      />
    </td>
    <td className="cell-status">
      <div className="custom-select-wrapper status-select">
        <select 
          value={task.status} 
          onChange={e => onUpdate(task._id, { status: e.target.value })}
          className={`status-pill ${(task.status || 'Not Started').replace(' ', '-').toLowerCase()}`}
        >
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
    </td>
    <td className="cell-priority">
      <div className="custom-select-wrapper priority-select">
        <select 
          value={task.priority} 
          onChange={e => onUpdate(task._id, { priority: e.target.value })}
          className={`priority-pill ${(task.priority || 'Medium').toLowerCase()}`}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
    </td>
  </tr>
));

export default TasksPage;

