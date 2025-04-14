export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDate = (date) => {
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '';
  }
};

export const formatMonth = (monthStr) => {
  try {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    if (!year || !month) return '';
    
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  } catch (error) {
    console.error('Error formatting month:', error);
    return monthStr || '';
  }
}; 