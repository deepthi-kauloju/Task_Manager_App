import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { RootState } from '../store';
import { Task, Priority } from '../types';
import AddTaskModal from '../components/AddTaskModal';
import Spinner from '../components/common/Spinner';

const priorityConfig: Record<Priority, { color: string; label: string }> = {
    low: { color: 'bg-blue-500', label: 'Low Priority' },
    medium: { color: 'bg-yellow-500', label: 'Medium Priority' },
    high: { color: 'bg-red-500', label: 'High Priority' },
};

const CalendarPage: React.FC = () => {
  const { items: tasks, loading } = useSelector((state: RootState) => state.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toDateString();
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)?.push(task);
      }
    });
    return map;
  }, [tasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  }

  if (loading === 'pending' || loading === 'idle') {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg shadow-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><FiChevronLeft /></button>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700"><FiChevronRight /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md border-transparent dark:border-transparent"></div>)}
          
          {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
            const day = dayIndex + 1;
            const date = new Date(year, month, day);
            const dateKey = date.toDateString();
            const isToday = dateKey === today.toDateString();
            const tasksForDay = tasksByDate.get(dateKey) || [];

            return (
              <div key={day} className={`border rounded-md p-2 h-24 sm:h-32 flex flex-col overflow-hidden ${isToday ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10' : 'border-gray-200 dark:border-slate-700'}`}>
                <span className={`font-bold ${isToday ? 'text-violet-600' : 'text-gray-700 dark:text-gray-300'}`}>{day}</span>
                <div className="mt-1 space-y-1 overflow-y-auto text-xs pr-1">
                  {tasksForDay.map(task => (
                    <button 
                      key={task.id} 
                      onClick={() => handleTaskClick(task)}
                      className={`w-full text-left p-1 rounded-md flex items-center transition-colors ${task.isCompleted ? 'bg-green-100 dark:bg-green-500/20 hover:bg-green-200' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${priorityConfig[task.priority || 'medium'].color} mr-1.5 flex-shrink-0`}></span>
                      <span className={`truncate ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {selectedTask && (
        <AddTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          taskToEdit={selectedTask}
        />
      )}
    </>
  );
};

export default CalendarPage;
