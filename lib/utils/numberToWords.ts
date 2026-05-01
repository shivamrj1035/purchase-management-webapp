/**
 * Convert a number to Indian number words
 * Supports crores, lakhs, thousands, hundreds
 * Example: 5025000 -> "Fifty Lakh Twenty Five Thousand"
 */

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertLessThanThousand(num: number): string {
  if (num === 0) return '';
  
  let result = '';
  
  if (num >= 100) {
    result += ones[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  
  if (num >= 20) {
    result += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  
  if (num > 0) {
    result += ones[num] + ' ';
  }
  
  return result.trim();
}

export function numberToIndianWords(num: number | string): string {
  // Convert to number and handle empty/invalid values
  const amount = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(amount) || amount === 0 || num === '' || num === null || num === undefined) {
    return '';
  }

  // Handle negative numbers
  if (amount < 0) {
    return 'Negative ' + numberToIndianWords(Math.abs(amount));
  }

  // Split into integer and decimal parts
  const parts = amount.toString().split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts[1] ? parseInt(parts[1].substring(0, 2)) : 0;

  if (integerPart === 0 && decimalPart === 0) {
    return '';
  }

  let result = '';

  // Crores (10,000,000)
  if (integerPart >= 10000000) {
    const crores = Math.floor(integerPart / 10000000);
    result += convertLessThanThousand(crores) + ' Crore ';
  }

  // Lakhs (100,000)
  const remainder1 = integerPart % 10000000;
  if (remainder1 >= 100000) {
    const lakhs = Math.floor(remainder1 / 100000);
    result += convertLessThanThousand(lakhs) + ' Lakh ';
  }

  // Thousands (1,000)
  const remainder2 = remainder1 % 100000;
  if (remainder2 >= 1000) {
    const thousands = Math.floor(remainder2 / 1000);
    result += convertLessThanThousand(thousands) + ' Thousand ';
  }

  // Hundreds and below
  const remainder3 = remainder2 % 1000;
  if (remainder3 > 0) {
    result += convertLessThanThousand(remainder3);
  }

  result = result.trim();

  // Add decimal part (paise)
  if (decimalPart > 0) {
    result += ' and ' + convertLessThanThousand(decimalPart) + ' Paise';
  }

  return result + ' Rupees';
}

/**
 * Format amount with Indian currency notation and words
 * Example: "₹50,25,000 (Fifty Lakh Twenty Five Thousand Rupees)"
 */
export function formatAmountWithWords(num: number | string): string {
  const amount = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(amount) || amount === 0 || num === '' || num === null || num === undefined) {
    return '';
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);

  const words = numberToIndianWords(amount);
  
  return words ? `${formatted} (${words})` : formatted;
}
