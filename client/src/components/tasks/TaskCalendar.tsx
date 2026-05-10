import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import '../../styles/components/TaskCalendar.css';

interface Task {
  _id: string;
  title: string;
  dueDate: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
}

interface TaskCalendarProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({ tasks, onEditTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getTasksForDate = (day: number) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const renderDays = () => {
    const cells = [];
    
    // Previous month days
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push(
        <div key={`prev-${i}`} className="calendar-day day-outer">
          <span className="day-number muted">{prevMonthDays - i}</span>
        </div>
      );
    }

    // Current month days
    for (let d = 1; d <= days; d++) {
      const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      const dayTasks = getTasksForDate(d);

      cells.push(
        <div key={`curr-${d}`} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <span className="day-number">{d}</span>
          <div className="day-tasks">
            {dayTasks.map(task => (
              <div 
                key={task._id} 
                className={`calendar-task-pill priority-${task.priority.toLowerCase()}`}
                onClick={() => onEditTask(task)}
              >
                <span className="task-pill-subject">{task.subject}</span>
                <span className="task-pill-title">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Next month days
    const totalCells = cells.length;
    const remaining = 42 - totalCells; // 6 rows of 7
    for (let i = 1; i <= remaining; i++) {
      cells.push(
        <div key={`next-${i}`} className="calendar-day day-outer">
          <span className="day-number muted">{i}</span>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="task-calendar-container">
      <div className="calendar-controls-bar">
        <div className="calendar-info">
          <h2>{monthNames[month]} {year}</h2>
          <button className="btn-today" onClick={goToToday}>Today</button>
        </div>
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button className="nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>
      
      <div className="calendar-wrapper">
        <div className="calendar-weekdays-header">
          {weekDays.map(day => <div key={day} className="weekday-name">{day}</div>)}
        </div>
        <div className="calendar-grid-body">
          {renderDays()}
        </div>
      </div>
    </div>
  );
};

export default TaskCalendar;
