import React from 'react';
import AdminCard from './AdminCard.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

const ToolCard = ({ title, description, icon, route, color, bgColor }) => {
  const { isDarkMode } = useTheme();
  return (
    <AdminCard
      title={title}
      description={description}
      icon={icon}
      link={route}
      color={color}
      bgColor={bgColor}
      isDarkMode={isDarkMode}
    />
  );
};

export default React.memo(ToolCard);
