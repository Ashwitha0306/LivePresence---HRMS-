import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ProductivityHeatmap = ({ 
  records = [], 
  selectedDate = new Date(), 
  maxHours = 8 
}) => {
  // Heatmap data preparation
  const getHeatmapData = () => {
    const daysInMonth = new Date(
      selectedDate.getFullYear(), 
      selectedDate.getMonth() + 1, 
      0
    ).getDate();
    
    const heatmapData = Array(daysInMonth).fill(0);
    
    records.forEach(record => {
      const recordDate = new Date(record.date);
      if (
        recordDate.getMonth() === selectedDate.getMonth() && 
        recordDate.getFullYear() === selectedDate.getFullYear() &&
        record.total_hours
      ) {
        const day = recordDate.getDate();
        heatmapData[day - 1] = parseFloat(record.total_hours);
      }
    });

    return heatmapData.map((hours, index) => ({
      day: index + 1,
      hours,
      date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), index + 1).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      isToday: new Date().getDate() === index + 1 && 
               new Date().getMonth() === selectedDate.getMonth() && 
               new Date().getFullYear() === selectedDate.getFullYear()
    }));
  };

  const heatmapData = getHeatmapData();
  const calculatedMaxHours = Math.max(...heatmapData.map(d => d.hours), maxHours);
  const monthName = selectedDate?.toLocaleString?.('default', { month: 'long', year: 'numeric' });
  const totalHours = heatmapData.reduce((sum, day) => sum + day.hours, 0);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm"
        >
          <p className="font-semibold text-sm">{data.date}</p>
          <p className={`text-lg font-bold ${data.hours > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
            {data.hours > 0 ? `${data.hours}h` : 'No data'}
          </p>
          {data.isToday && (
            <div className="flex items-center mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
              <span className="text-xs text-blue-500">Today</span>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  // Custom active dot
  const renderActiveDot = (props) => {
    const { cx, cy, payload } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={payload.isToday ? 8 : 6} 
                fill={payload.isToday ? "#3B82F6" : "#059669"} 
                stroke="#fff" 
                strokeWidth={2} />
      </g>
    );
  };

  // Custom axis tick
  const renderCustomTick = ({ x, y, payload }) => {
    const isToday = new Date().getDate() === payload.value && 
                   new Date().getMonth() === selectedDate.getMonth() && 
                   new Date().getFullYear() === selectedDate.getFullYear();
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text 
          x={0} 
          y={0} 
          dy={16} 
          textAnchor="middle" 
          fill={isToday ? "#3B82F6" : "#6B7280"}
          className="text-xs font-medium"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  const renderMountainChart = () => {
    return (
      <div className="h-72 w-full mt-2 relative">
        {/* Mountain shadow effect */}
        <div className="absolute inset-0 top-10 bg-gradient-to-t from-gray-100 to-transparent dark:from-gray-900 dark:to-transparent opacity-30 rounded-b-lg"></div>
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={heatmapData}
            margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="80%" stopColor="#10B981" stopOpacity={0.2}/>
                <stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="day" 
              tick={renderCustomTick}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(heatmapData.length / 5)}
            />
            <YAxis 
              domain={[0, calculatedMaxHours * 1.2]} 
              hide 
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{
                stroke: '#D1D5DB',
                strokeWidth: 1,
                strokeDasharray: '4 4',
              }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorProductivity)"
              activeDot={renderActiveDot}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="p-6 rounded-2xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-400 dark:to-emerald-500"
          >
            Productivity Mountain
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-500 dark:text-gray-400"
          >
            {monthName}
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400">Low</span>
          <div className="flex space-x-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((percentage, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.1 }}
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: `rgba(16, 185, 129, ${percentage})`,
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">High</span>
        </motion.div>
      </div>
      
      {renderMountainChart()}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 flex items-center justify-between text-sm"
      >
        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
          <span className="text-gray-500 dark:text-gray-400">Today</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="font-medium text-green-600 dark:text-green-400">
              {totalHours.toFixed(1)}h
            </p>
          </div>
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-600"></div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Peak</p>
            <p className="font-medium text-emerald-600 dark:text-emerald-400">
              {calculatedMaxHours}h
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

ProductivityHeatmap.propTypes = {
  records: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    total_hours: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  selectedDate: PropTypes.instanceOf(Date),
  maxHours: PropTypes.number
};

ProductivityHeatmap.defaultProps = {
  records: [],
  selectedDate: new Date(),
  maxHours: 8
};

export default ProductivityHeatmap;