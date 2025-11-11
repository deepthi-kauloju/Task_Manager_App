import React from 'react';
import { FiSearch, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { RootState, AppDispatch } from '../store';
import { setSearchQuery, setSort } from '../store/tasksSlice';
import { logout } from '../store/authSlice';
import { SORTS } from '../constants';
import IconButton from './common/IconButton';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { searchQuery, sort } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-4 w-full">
      <div className="relative flex-1 max-w-xs">
        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => dispatch(setSearchQuery(e.target.value))}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <select
        value={sort}
        onChange={e => dispatch(setSort(e.target.value as any))}
        className="px-4 py-2 bg-gray-100 dark:bg-slate-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
      >
        {SORTS.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      <IconButton icon={<FiLogOut/>} onClick={handleLogout} tooltip="Logout" />

      {user && (
         <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
         </div>
      )}
    </div>
  );
};

export default Header;