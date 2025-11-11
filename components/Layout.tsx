import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu, FiPlus } from 'react-icons/fi';
import Sidebar from './Sidebar';
import Header from './Header';
import AddTaskModal from './AddTaskModal';

const Layout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 md:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-gray-500 focus:outline-none"
          >
            <FiMenu size={24} />
          </button>
          <Header />
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 bg-violet-500 hover:bg-violet-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50"
        aria-label="Add new task"
      >
        <FiPlus size={24} />
      </button>

      <AddTaskModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default Layout;
