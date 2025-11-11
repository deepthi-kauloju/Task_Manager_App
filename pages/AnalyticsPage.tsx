import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import Spinner from '../components/common/Spinner';
import { FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiPieChart } from 'react-icons/fi';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
    </div>
  </div>
);

interface BarChartProps {
  title: string;
  data: { label: string; onTime: number; late: number }[];
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d.onTime + d.late));
    return max === 0 ? 1 : max;
  }, [data]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>
      <div className="flex justify-between items-end h-64 space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
             <div className="relative w-full flex flex-col items-center justify-end h-full">
               <div
                  className="w-full bg-green-400 dark:bg-green-500 rounded-t-md transition-all duration-300"
                  style={{ height: `${(item.onTime / maxValue) * 100}%` }}
                ></div>
                <div
                  className="w-full bg-amber-400 dark:bg-amber-500 transition-all duration-300"
                  style={{ height: `${(item.late / maxValue) * 100}%` }}
                ></div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 w-32 whitespace-nowrap bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none transform -translate-x-1/2 left-1/2">
                   <p className="font-bold text-center mb-1">{item.label}</p>
                   <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>On-time: {item.onTime}</p>
                   <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>Late: {item.late}</p>
                   <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                </div>
             </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-green-400 mr-2"></span>On-time</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-amber-400 mr-2"></span>Late</div>
      </div>
    </div>
  );
};


const AnalyticsPage: React.FC = () => {
  const { items: tasks, loading } = useSelector((state: RootState) => state.tasks);

  const analyticsData = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    const completedTasks = tasks.filter(t => t.isCompleted && t.completedAt);
    
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    const completedWithDueDate = completedTasks.filter(t => t.dueDate);
    const onTimeTasks = completedWithDueDate.filter(t => new Date(t.completedAt!) <= new Date(t.dueDate!));
    const onTimeRate = completedWithDueDate.length > 0 ? (onTimeTasks.length / completedWithDueDate.length) * 100 : 0;

    const overdueTasks = tasks.filter(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date());

    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const tasksOnDay = completedTasks.filter(t => {
        const completedDate = new Date(t.completedAt!);
        return completedDate >= dayStart && completedDate <= dayEnd;
      });
      const onTime = tasksOnDay.filter(t => t.dueDate && new Date(t.completedAt!) <= new Date(t.dueDate!)).length;
      
      return { label: d.toLocaleDateString('en-US', { weekday: 'short' }), onTime, late: tasksOnDay.length - onTime };
    }).reverse();

    const monthlyData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setDate(1); 
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const tasksInMonth = completedTasks.filter(t => {
        const completedDate = new Date(t.completedAt!);
        return completedDate >= monthStart && completedDate <= monthEnd;
      });
      const onTime = tasksInMonth.filter(t => t.dueDate && new Date(t.completedAt!) <= new Date(t.dueDate!)).length;

      return { label: d.toLocaleDateString('en-US', { month: 'short' }), onTime, late: tasksInMonth.length - onTime };
    }).reverse();

    return {
      completionRate,
      onTimeRate,
      overdueCount: overdueTasks.length,
      weeklyData,
      monthlyData,
    };
  }, [tasks]);

  if (loading === 'pending' || loading === 'idle') {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  if (!analyticsData) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
        <FiPieChart className="mx-auto text-5xl mb-4" />
        <h2 className="text-xl font-semibold">Not enough data</h2>
        <p>Complete some tasks to see your analytics!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<FiPieChart size={24} className="text-blue-800"/>} title="Completion Rate" value={`${analyticsData.completionRate.toFixed(1)}%`} color="bg-blue-100 dark:bg-blue-500/20" />
        <StatCard icon={<FiCheckCircle size={24} className="text-green-800"/>} title="On-Time Completion" value={`${analyticsData.onTimeRate.toFixed(1)}%`} color="bg-green-100 dark:bg-green-500/20" />
        <StatCard icon={<FiAlertTriangle size={24} className="text-red-800"/>} title="Tasks Overdue" value={`${analyticsData.overdueCount}`} color="bg-red-100 dark:bg-red-500/20" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <BarChart title="Weekly Activity (Last 7 Days)" data={analyticsData.weeklyData} />
         <BarChart title="Monthly Performance (Last 6 Months)" data={analyticsData.monthlyData} />
      </div>

    </motion.div>
  );
};

export default AnalyticsPage;
