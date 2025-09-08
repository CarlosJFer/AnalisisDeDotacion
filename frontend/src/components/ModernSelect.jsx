import React from 'react';

const ModernSelect = ({ className = '', children, ...rest }) => (
  <select
    className={[
      'px-3 py-2 rounded-lg border shadow-sm',
      'focus:outline-none focus:ring-2 focus:ring-emerald-500/70',
      'transition-colors',
      'bg-white text-slate-900 border-slate-300',
      'dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600',
      className,
    ].join(' ')}
    {...rest}
  >
    {children}
  </select>
);

export default ModernSelect;
