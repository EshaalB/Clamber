import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../../styles/components/DashboardCalendar.css';

interface CalendarProps {
  events?: { date: string; color: string }[];
}

const DashboardCalendar: React.FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const renderDays = () => {
    const cells = [];
    // Empty cells for previous month
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    // Days of current month
    for (let d = 1; d <= days; d++) {
      const isToday = d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
      
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateString);

      cells.push(
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <span>{d}</span>
          <div className="event-dots">
            {dayEvents.slice(0, 3).map((e, i) => (
              <span key={i} className="dot" style={{ backgroundColor: e.color }}></span>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  return (
    <div className="dashboard-calendar">
      <div className="calendar-header">
        <h3>{monthNames[month]} {year}</h3>
        <div className="calendar-controls">
          <button onClick={prevMonth}><ChevronLeft size={16} /></button>
          <button onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="calendar-weekdays">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="calendar-grid">
        {renderDays()}
      </div>
    </div>
  );
};

export default DashboardCalendar;
