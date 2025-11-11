import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiChevronDown, FiChevronUp, FiCalendar, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { toggleTaskCompletion, deleteTask as deleteTaskAction, updateTask } from '../store/tasksSlice';
import { Task, Priority } from '../types';
import IconButton from './common/IconButton';
import AddTaskModal from './AddTaskModal';

interface TaskItemProps {
  task: Task;
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
    low: { color: 'bg-blue-500', label: 'Low Priority' },
    medium: { color: 'bg-yellow-500', label: 'Medium Priority' },
    high: { color: 'bg-red-500', label: 'High Priority' },
};


const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expansion when clicking checkbox
    try {
      await dispatch(toggleTaskCompletion(task.id)).unwrap();
      toast.success(task.isCompleted ? 'Task marked as pending.' : 'Task completed!');
    } catch {
      toast.error('Failed to update task.');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTaskAction(task.id)).unwrap();
        toast.success('Task deleted.');
      } catch {
        toast.error('Failed to delete task.');
      }
    }
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditModalOpen(true);
  }
  
  const handleSubtaskToggle = async (subtaskId: string) => {
    const newSubtasks = task.subtasks?.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
    ) || [];

    const allSubtasksCompleted = newSubtasks.length > 0 && newSubtasks.every(s => s.isCompleted);
    
    const updates: Partial<Task> = { subtasks: newSubtasks };

    // Auto-update parent task status if it's not already in the desired state
    if (allSubtasksCompleted && !task.isCompleted) {
        updates.isCompleted = true;
        updates.completedAt = new Date().toISOString();
        toast.success('All subtasks completed, task marked as complete!');
    } else if (!allSubtasksCompleted && task.isCompleted) {
        updates.isCompleted = false;
        updates.completedAt = undefined;
    }

    try {
        await dispatch(updateTask({ id: task.id, updates })).unwrap();
    } catch {
        toast.error("Failed to update subtask.");
    }
  };


  const isOverdue = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();
  const statusColor = task.isCompleted ? 'border-green-500' : isOverdue ? 'border-red-500' : 'border-violet-500';
  const statusBgColor = task.isCompleted ? 'bg-green-50/50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-800';

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const hasSubtasks = totalSubtasks > 0;

  return (
    <>
      <motion.div
        layout
        className={`rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border-l-4 ${statusColor} ${statusBgColor} hover:scale-[1.01]`}
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.99 }}
      >
        <div className="p-4 flex items-start gap-4 cursor-pointer">
          <div className="pt-1" onClick={handleToggle}>
            <input
              type="checkbox"
              checked={task.isCompleted}
              readOnly
              className="h-6 w-6 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 cursor-pointer transition-all"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
               {task.priority && (
                  <div className="relative group flex-shrink-0">
                      <span className={`block w-3 h-3 rounded-full ${priorityConfig[task.priority].color}`}></span>
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {priorityConfig[task.priority].label}
                           <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                      </div>
                  </div>
              )}
              <h3 className={`font-semibold text-lg transition-all duration-300 truncate ${task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {task.title}
              </h3>
            </div>
            
            <div className="space-y-2 mt-1">
              <div className="flex items-center space-x-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </p>
                {task.dueDate && (
                  <p className={`text-xs flex items-center ${
                      isOverdue ? 'text-red-500 font-semibold' : 'text-gray-400 dark:text-gray-500'
                  }`}>
                      <FiCalendar className="mr-1" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {hasSubtasks && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5">
                    <motion.div
                      className="bg-violet-500 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    ></motion.div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {completedSubtasks}/{totalSubtasks}
                  </span>
                </div>
              )}
            </div>

          </div>
          <div className="flex items-center gap-1">
            <IconButton icon={<FiEdit />} onClick={handleEditClick} tooltip="Edit Task" />
            <IconButton icon={<FiTrash2 />} onClick={handleDelete} tooltip="Delete Task" className="text-red-500 hover:text-red-700" />
            <IconButton
              icon={isExpanded ? <FiChevronUp /> : <FiChevronDown />}
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              tooltip={isExpanded ? "Collapse" : "Expand"}
            />
          </div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="pl-10 border-t border-gray-200 dark:border-slate-700 pt-3">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words mb-3">{task.description || 'No description provided.'}</p>
                  
                  {hasSubtasks && (
                    <div className="space-y-2" onClick={e => e.stopPropagation()}>
                       <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Subtasks</h4>
                       {task.subtasks?.map(subtask => (
                         <div key={subtask.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700/50">
                           <input
                             type="checkbox"
                             checked={subtask.isCompleted}
                             onChange={() => handleSubtaskToggle(subtask.id)}
                             className="h-5 w-5 rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500 cursor-pointer"
                           />
                           <span className={`flex-1 ${subtask.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                             {subtask.title}
                           </span>
                         </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {isEditModalOpen && (
        <AddTaskModal
          isOpen={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          taskToEdit={task}
        />
      )}
    </>
  );
};

export default TaskItem;