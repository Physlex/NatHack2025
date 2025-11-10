
export function formatDate(date) {
  const dateFromString = new Date(date);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Intl.DateTimeFormat('en-US', options).format(dateFromString);
}
