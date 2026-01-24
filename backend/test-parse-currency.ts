// Test script for parseCurrencyToNumber function
// Replicating the logic from AIItineraryService.parseCurrencyToNumber

function parseCurrencyToNumber(currencyString: string | number): number {
  if (typeof currencyString === 'number') {
    return currencyString
  }

  if (typeof currencyString === 'string') {
    // Handle strings with calculations like "₹ 800 + ₹ 6,000 = ₹ 6,800"
    // First, check if there's an equals sign and extract the final result
    const equalsMatch = currencyString.match(/=\s*[^0-9]*([0-9,]+\.?[0-9]*)/)
    if (equalsMatch) {
      const cleaned = equalsMatch[1].replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed)) {
        return parsed
      }
    }

    // Fallback: extract all numbers and take the last one (usually the total)
    const numberMatches = currencyString.match(/[0-9,]+\.?[0-9]*/g)
    if (numberMatches && numberMatches.length > 0) {
      // Take the last number found (usually the total)
      const lastNumber = numberMatches[numberMatches.length - 1]
      const cleaned = lastNumber.replace(/,/g, '')
      const parsed = parseFloat(cleaned)
      if (!isNaN(parsed)) {
        return parsed
      }
    }

    // Final fallback: Remove currency symbols and extract first number
    const cleaned = currencyString.replace(/[^\d.,-]/g, '').replace(/,/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  return 0
}

console.log('Testing parseCurrencyToNumber function:');

// Test cases
const testCases = [
  // Original cases
  '₹ 800',
  '₹ 6,000',
  '₹ 6,800',
  // New cases with calculation strings
  '₹ 800 + ₹ 6,000 = ₹ 6,800',
  '₹ 1,200 + ₹ 2,500 = ₹ 3,700',
  '₹ 500 + ₹ 1,000 + ₹ 2,000 = ₹ 3,500',
  // Edge cases
  '₹ 800 = ₹ 800',
  '₹ 6,800',
  '800',
  '₹ 6,800.50',
  // Invalid cases
  'Not a number',
  '',
];

testCases.forEach((testCase, index) => {
  try {
    const result = parseCurrencyToNumber(testCase);
    console.log(`Test ${index + 1}: "${testCase}" -> ${result}`);
  } catch (error) {
    console.log(`Test ${index + 1}: "${testCase}" -> Error: ${(error as Error).message}`);
  }
});
