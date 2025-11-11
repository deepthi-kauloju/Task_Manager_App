import React, { useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchTasks } from '../store/tasksSlice';
import TaskItem from './TaskItem';
import Spinner from './common/Spinner';
import { FiClipboard } from 'react-icons/fi';
import { SortType } from '../types';

const TaskList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    items: tasks, 
    loading: loadingStatus, 
    filter, 
    sort, 
    searchQuery 
  } = useSelector((state: RootState) => state.tasks);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);


  useEffect(() => {
    // Fetch tasks only if authenticated and they haven't been fetched yet
    if (isAuthenticated && loadingStatus === 'idle') {
      dispatch(fetchTasks());
    }
  }, [loadingStatus, dispatch, isAuthenticated]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filtering
    if (filter === 'completed') {
      result = result.filter(task => task.isCompleted);
    } else if (filter === 'pending') {
      result = result.filter(task => !task.isCompleted);
    }

    // Searching
    if (searchQuery) {
      result = result.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
    result.sort((a, b) => {
      const typedSort = sort as SortType;
      if (typedSort.startsWith('date-')) {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return typedSort === 'date-asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (typedSort.startsWith('due-date-')) {
        const hasDueA = !!a.dueDate;
        const hasDueB = !!b.dueDate;

        if (hasDueA && !hasDueB) return -1; // Tasks with due date come first
        if (!hasDueA && hasDueB) return 1;  // Tasks without due date come last
        if (!hasDueA && !hasDueB) return 0; // Both without due date, keep order

        const dateA = new Date(a.dueDate!).getTime();
        const dateB = new Date(b.dueDate!).getTime();
        
        return typedSort === 'due-date-asc' ? dateA - dateB : dateB - dateA;
      }

      // Default fallback sort
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    
    return result;
  }, [tasks, filter, sort, searchQuery]);

  const isLoading = loadingStatus === 'pending' || loadingStatus === 'idle';

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        <FiClipboard className="mx-auto text-5xl mb-4" />
        <h2 className="text-xl font-semibold">No tasks yet</h2>
        <p>Click the "+" button to add your first task!</p>
      </div>
    );
  }

  if (filteredAndSortedTasks.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        <FiClipboard className="mx-auto text-5xl mb-4" />
        <h2 className="text-xl font-semibold">No tasks match your criteria</h2>
        <p>Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {filteredAndSortedTasks.map(task => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <TaskItem task={task} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;