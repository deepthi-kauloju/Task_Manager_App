import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { addTask, updateTask } from '../store/tasksSlice';
import { Task, Priority, Subtask } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

const priorityOptions: { value: Priority; label: string; color: string; }[] = [
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500' },
];


const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description);
      setIsCompleted(taskToEdit.isCompleted);
      setDueDate(taskToEdit.dueDate ? taskToEdit.dueDate.split('T')[0] : '');
      setPriority(taskToEdit.priority || 'medium');
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setIsCompleted(false);
      setDueDate('');
      setPriority('medium');
      setSubtasks([]);
    }
    setNewSubtaskTitle('');
  }, [taskToEdit, isOpen]);
  
  const handleAddSubtask = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
        const newSubtask: Subtask = {
            id: `subtask_${Date.now()}`,
            title: newSubtaskTitle.trim(),
            isCompleted: false,
        };
        setSubtasks([...subtasks, newSubtask]);
        setNewSubtaskTitle('');
    }
  };
  
  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Title cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (taskToEdit) {
        const taskPayload: Partial<Task> = {
          title,
          description,
          isCompleted,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          subtasks,
        };

        if (isCompleted && !taskToEdit.isCompleted) {
          taskPayload.completedAt = new Date().toISOString();
        } else if (!isCompleted && taskToEdit.isCompleted) {
          taskPayload.completedAt = undefined;
        }

        await dispatch(updateTask({ id: taskToEdit.id, updates: taskPayload })).unwrap();
        toast.success('Task updated successfully!');
      } else {
        const taskPayload = {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          priority,
          subtasks,
        };
        await dispatch(addTask(taskPayload)).unwrap();
        toast.success('Task added successfully!');
      }
      onClose();
    } catch (error) {
      toast.error(taskToEdit ? 'Failed to update task.' : 'Failed to add task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
            onClick={onClose}
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center p-6 border-b dark:border-slate-700">
              <h2 className="text-xl font-bold">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                ></textarea>
              </div>
               <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                <div className="mt-2 flex gap-3">
                    {priorityOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPriority(option.value)}
                          className={`flex-1 px-3 py-2 text-sm rounded-md transition-all border-2 ${
                            priority === option.value
                              ? `${option.color} text-white border-transparent`
                              : 'bg-transparent dark:text-gray-200 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {option.label}
                        </button>
                    ))}
                </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks</label>
                <div className="mt-2 space-y-2">
                    {subtasks.map(subtask => (
                        <div key={subtask.id} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 p-2 rounded-md">
                           <span className="flex-1 text-sm">{subtask.title}</span>
                           <button type="button" onClick={() => handleDeleteSubtask(subtask.id)} className="p-1 text-gray-400 hover:text-red-500">
                               <FiTrash2 size={16}/>
                           </button>
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex gap-2">
                    <input
                        type="text"
                        value={newSubtaskTitle}
                        onChange={e => setNewSubtaskTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddSubtask(e)}
                        placeholder="Add a new subtask..."
                        className="flex-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                    />
                    <button type="button" onClick={handleAddSubtask} className="px-3 py-2 bg-violet-100 text-violet-600 dark:bg-slate-600 dark:text-gray-200 rounded-md hover:bg-violet-200 dark:hover:bg-slate-500">
                        <FiPlus />
                    </button>
                </div>
               </div>

              {taskToEdit && (
                <div className="flex items-center">
                  <input
                    id="isCompleted"
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => setIsCompleted(e.target.checked)}
                    className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                    Mark as completed
                  </label>
                </div>
              )}
             </div>
              <div className="flex justify-end gap-3 p-6 border-t dark:border-slate-700">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-600 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 disabled:bg-violet-400 transition-colors">
                  {isSubmitting ? 'Saving...' : (taskToEdit ? 'Save Changes' : 'Add Task')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;