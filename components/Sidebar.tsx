import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiX, FiCheckSquare, FiSquare, FiClipboard, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setFilter } from '../store/tasksSlice';
import { FilterType } from '../types';
import { FILTERS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const FilterIcon = ({ filter }: { filter: FilterType }) => {
  switch (filter) {
    case 'all':
      return <FiClipboard className="mr-3" />;
    case 'completed':
      return <FiCheckSquare className="mr-3" />;
    case 'pending':
      return <FiSquare className="mr-3" />;
    default:
      return null;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch<AppDispatch>();
  const filter = useSelector((state: RootState) => state.tasks.filter);

  const handleFilterChange = (newFilter: FilterType) => {
    dispatch(setFilter(newFilter));
    setIsOpen(false);
  };
  
  return (
    <>
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-slate-800 shadow-xl transform transition-transform md:relative md:translate-x-0 md:shadow-none md:border-r md:border-gray-200 dark:md:border-slate-700 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-violet-500">TaskManager</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-500 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <nav className="p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Filters</h2>
          <ul>
            {FILTERS.map(f => (
              <li key={f.value}>
                <button
                  onClick={() => handleFilterChange(f.value)}
                  className={`flex items-center w-full px-4 py-2 my-1 text-left rounded-lg transition-colors duration-200 ${
                    filter === f.value
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <FilterIcon filter={f.value} />
                  <span>{f.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
         <nav className="px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Analysis</h2>
          <ul>
            <li>
              <NavLink
                to="/app/analytics"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 my-1 text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`
                }
              >
                <FiTrendingUp className="mr-3" />
                <span>Analytics</span>
              </NavLink>
            </li>
             <li>
              <NavLink
                to="/app/calendar"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center w-full px-4 py-2 my-1 text-left rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300'
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`
                }
              >
                <FiCalendar className="mr-3" />
                <span>Calendar</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;