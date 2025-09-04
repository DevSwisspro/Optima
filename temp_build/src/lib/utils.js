import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount, currency = 'CHF') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `0 ${currency}`
  }
  
  const num = Number(amount)
  
  // Formatage avec séparateur de milliers et gestion des décimales
  const formattedNumber = num.toLocaleString('fr-CH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  })
  
  return `${formattedNumber} ${currency}`
}
