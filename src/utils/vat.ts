// VAT calculation utilities
export const VAT_RATE = 20; // UK VAT rate

export interface VATCalculation {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalIncVat: number;
}

export const calculateVAT = (subtotal: number, vatRate: number = VAT_RATE): VATCalculation => {
  const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100; // Round to 2 decimal places
  const totalIncVat = Math.round((subtotal + vatAmount) * 100) / 100;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatRate,
    vatAmount,
    totalIncVat
  };
};

export const formatCurrencyWithVAT = (amount: number, showVAT: boolean = false) => {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
  
  return showVAT ? `${formatted} inc VAT` : formatted;
};