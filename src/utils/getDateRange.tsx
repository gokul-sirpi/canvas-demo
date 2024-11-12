export function getDateRange(): { startDate: string; endDate: string } {
  // Get current date as end date
  const endDate = new Date();

  // Calculate start date as 30 days before current date
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  // Helper function to format date in YYYY-MM-DDTHH:mm:ss±hh:mm
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Get timezone offset in hours and minutes
    const timezoneOffset = -date.getTimezoneOffset();
    const offsetHours = String(
      Math.abs(Math.floor(timezoneOffset / 60))
    ).padStart(2, '0');
    const offsetMinutes = String(Math.abs(timezoneOffset % 60)).padStart(
      2,
      '0'
    );
    const offsetSign = timezoneOffset >= 0 ? '+' : '-';

    // Format in YYYY-MM-DDTHH:mm:ss±hh:mm
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
  };

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}
