function getPreviousMonthRange() {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
  const firstDayPreviousMonth = new Date(
    lastDayPreviousMonth.getFullYear(),
    lastDayPreviousMonth.getMonth(),
    1
  );
  const startDate = firstDayPreviousMonth.toISOString().split('T')[0];
  const endDate = lastDayPreviousMonth.toISOString().split('T')[0];
  return { startDate, endDate };
}

function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];
  return { startDate, endDate };
}

module.exports = { getPreviousMonthRange, getCurrentMonthRange };
