export const getPreviousMonthRange = () => {
    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayPreviousMonth = new Date(firstDayCurrentMonth - 1);
    const firstDayPreviousMonth = new Date(
        lastDayPreviousMonth.getFullYear(),
        lastDayPreviousMonth.getMonth(),
        1
    );
    const format = (d) => d.toLocaleDateString('es-AR');
    return {
        start: format(firstDayPreviousMonth),
        end: format(lastDayPreviousMonth),
    };
};
