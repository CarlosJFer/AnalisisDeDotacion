import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell
} from 'recharts';

const CustomBarChart = ({ data = [], xKey, barKey, title, barLabel }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + (item[barKey] || 0), 0),
    [data, barKey]
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: 8,
            border: '1px solid #ccc',
            fontFamily: 'sans-serif'
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0 }}>Valor: {value}</p>
          <p style={{ margin: 0 }}>Porcentaje: {percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const legendFormatter = (value) => {
    const friendly = barLabel || value;
    return <span style={{ fontSize: 12, fontWeight: 500 }}>{friendly}</span>;
  };

  return (
    <div style={{ width: '100%', height: 300, margin: '24px 0' }}>
      <h3 style={{ textAlign: 'center', fontFamily: 'sans-serif', fontWeight: 600 }}>
        {title}
      </h3>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8884d8" stopOpacity={1} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={legendFormatter} wrapperStyle={{ fontSize: '12px' }} />
          <Bar
            dataKey={barKey}
            isAnimationActive
            animationDuration={800}
            style={{ cursor: 'pointer' }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  index === activeIndex
                    ? 'url(#barGradientHover)'
                    : 'url(#barGradient)'
                }
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomBarChart;
