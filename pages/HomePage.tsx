import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
// FIX: Import Variants type from framer-motion to explicitly type animation variants.
import { motion, Variants } from 'framer-motion';
import { FiCheckCircle, FiLogIn, FiSun, FiMoon, FiCheck } from 'react-icons/fi';
import { RootState } from '../store';
import { useTheme } from '../hooks/useTheme';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// FIX: Explicitly typing itemVariants with Variants solves the type inference issue where 'spring' was being inferred as a generic string instead of a valid AnimationGeneratorType.
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

const features = [
  'Organize tasks with ease',
  'Set priorities and due dates',
  'Track progress with analytics',
  'Modern, clean user interface',
];

const SnapshotCard = ({ theme }: { theme: 'light' | 'dark' }) => {
  const isDark = theme === 'dark';
  return (
    <div className={`rounded-xl shadow-2xl overflow-hidden ring-1 ${isDark ? 'ring-slate-700 bg-slate-800' : 'ring-gray-200/50 bg-white'}`}>
      {/* Browser Header */}
      <div className={`p-3 flex items-center gap-2 ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      
      {/* App Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Tasks</h3>
          <div className={`px-4 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>3 Active</div>
        </div>
        
        {/* Mock Task 1 */}
        <div className={`p-4 rounded-lg flex items-center gap-4 border-l-4 border-violet-500 ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
          <div className={`w-5 h-5 rounded border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="block w-3 h-3 rounded-full bg-yellow-500 flex-shrink-0"></span>
                <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Develop Backend Routes</p>
            </div>
          </div>
        </div>
        
        {/* Mock Task 2 (Completed) */}
        <div className={`p-4 rounded-lg flex items-center gap-4 border-l-4 border-green-500 ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
          <div className="w-5 h-5 rounded bg-violet-500 flex items-center justify-center">
             <FiCheck className="w-3 h-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="block w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <p className={`font-medium line-through truncate ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Finish UI Design</p>
            </div>
          </div>
        </div>

        {/* Mock Task 3 (Overdue) */}
         <div className={`p-4 rounded-lg flex items-center gap-4 border-l-4 border-red-500 ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
          <div className={`w-5 h-5 rounded border-2 ${isDark ? 'border-gray-600' : 'border-gray-300'}`}></div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="block w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
              <p className={`font-medium truncate ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Review PR from a colleague</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AnalyticsSnapshotCard = ({ theme }: { theme: 'light' | 'dark' }) => {
  const isDark = theme === 'dark';
  const mockWeeklyData = [
    { onTime: 40, late: 10 }, { onTime: 60, late: 0 }, { onTime: 80, late: 20 },
    { onTime: 50, late: 10 }, { onTime: 90, late: 0 }, { onTime: 70, late: 15 },
    { onTime: 30, late: 5 },
  ];
  const maxValue = 100;

  return (
    <div className={`rounded-xl shadow-2xl overflow-hidden ring-1 ${isDark ? 'ring-slate-700 bg-slate-800' : 'ring-gray-200/50 bg-white'}`}>
      {/* Browser Header */}
      <div className={`p-3 flex items-center gap-2 ${isDark ? 'bg-slate-700/50' : 'bg-gray-100'}`}>
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      
      {/* App Content */}
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</h3>
          <div className={`px-4 py-1 rounded-full text-sm font-semibold ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'}`}>Dashboard</div>
        </div>
        
        {/* Mock Stat Cards */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completion</p>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>85.7%</p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>On-Time</p>
            <p className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-500'}`}>92.3%</p>
          </div>
          <div>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Overdue</p>
            <p className={`text-xl font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>1</p>
          </div>
        </div>

        {/* Mock Bar Chart */}
        <div>
          <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Weekly Activity</p>
          <div className="flex justify-between items-end h-24 space-x-1.5">
            {mockWeeklyData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className="w-full bg-green-400 dark:bg-green-500 rounded-t-sm"
                  style={{ height: `${(item.onTime / maxValue) * 100}%` }}
                ></div>
                <div
                  className="w-full bg-amber-400 dark:bg-amber-500"
                  style={{ height: `${(item.late / maxValue) * 100}%` }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 font-sans overflow-x-hidden">
       <div className="absolute top-0 right-0 p-4 z-20">
         <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
      </div>

      <main className="relative">
        <motion.div
          className="container mx-auto px-4 flex flex-col items-center justify-center min-h-screen text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-violet-200/50 via-transparent to-transparent dark:from-violet-900/30 dark:via-transparent dark:to-transparent opacity-50 -z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 40%, 0 70%)' }}></motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-extrabold mb-4 z-10"
            variants={itemVariants}
          >
            <span className="text-violet-500">Task</span>Manager
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-8 z-10"
            variants={itemVariants}
          >
            The simple, elegant, and powerful way to manage your tasks and boost your productivity.
          </motion.p>
          
          <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mb-10 text-left z-10" variants={itemVariants}>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="z-10">
            <Link
              to="/login"
              className="flex items-center justify-center bg-violet-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-violet-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500 focus:ring-opacity-50"
            >
              <FiLogIn className="mr-2" />
              Get Started
            </Link>
          </motion.div>
        </motion.div>
      </main>

      <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, amount: 0.5 }}
             transition={{ duration: 0.5 }}
             className="text-4xl font-extrabold mb-12"
          >
             A Peek Inside
          </motion.h2>

          <motion.div 
            className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <SnapshotCard theme="light" />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <AnalyticsSnapshotCard theme="dark" />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;