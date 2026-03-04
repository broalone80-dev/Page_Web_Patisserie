import React from 'react';

/**
 * Format price in cents to currency (XAF)
 */
export const formatPrice = (cents: number): string => {
  return (cents / 100).toLocaleString('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Format cents to standard amount
 */
export const centsToAmount = (cents: number): number => {
  return cents / 100;
};

/**
 * Format amount to cents
 */
export const amountToCents = (amount: number): number => {
  return Math.round(amount * 100);
};
