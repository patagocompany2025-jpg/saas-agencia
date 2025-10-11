// Tipos de moedas suportadas (mesma configuração da calculadora)
export const CURRENCIES = {
  USD: { name: 'Dólar Americano', symbol: '$', rate: 1 },
  EUR: { name: 'Euro', symbol: '€', rate: 0.85 },
  GBP: { name: 'Libra Esterlina', symbol: '£', rate: 0.73 },
  ARS: { name: 'Peso Argentino', symbol: '$', rate: 1000 },
  BRL: { name: 'Real Brasileiro', symbol: 'R$', rate: 5.2 },
  BTC: { name: 'Bitcoin', symbol: '₿', rate: 0.000023 },
  CAD: { name: 'Dólar Canadense', symbol: 'C$', rate: 1.35 },
  AUD: { name: 'Dólar Australiano', symbol: 'A$', rate: 1.52 },
  CHF: { name: 'Franco Suíço', symbol: 'CHF', rate: 0.88 },
  JPY: { name: 'Iene Japonês', symbol: '¥', rate: 150 }
};

export type CurrencyCode = keyof typeof CURRENCIES;

/**
 * Formata um número como moeda baseado no código da moeda
 * @param value - Valor numérico a ser formatado
 * @param currencyCode - Código da moeda (ex: 'BRL', 'USD', 'EUR')
 * @returns String formatada com símbolo e valor
 */
export function formatCurrency(value: number, currencyCode: CurrencyCode = 'BRL'): string {
  const currency = CURRENCIES[currencyCode];

  if (!currency) {
    return `R$ ${value.toFixed(2)}`;
  }

  // Bitcoin tem formatação especial com 8 casas decimais
  if (currencyCode === 'BTC') {
    return `${currency.symbol}${value.toFixed(8)}`;
  }

  // Formato brasileiro (ponto para milhares, vírgula para decimais)
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${currency.symbol} ${formatted}`;
}

/**
 * Remove formatação de uma string monetária e retorna o número
 * @param formattedValue - String formatada (ex: "R$ 1.000,00")
 * @returns Número sem formatação
 */
export function parseCurrency(formattedValue: string): number {
  // Remove símbolos de moeda, espaços e letras
  let cleaned = formattedValue.replace(/[^\d,.-]/g, '');

  // Detectar se usa vírgula como decimal (formato brasileiro)
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');

  if (hasComma && hasDot) {
    // Se tem ambos, vírgula é decimal (ex: 1.000,50)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (hasComma) {
    // Se tem apenas vírgula, é decimal (ex: 1000,50)
    cleaned = cleaned.replace(',', '.');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Aplica máscara monetária enquanto o usuário digita
 * @param value - Valor digitado
 * @param currencyCode - Código da moeda
 * @returns String formatada
 */
export function applyCurrencyMask(value: string, currencyCode: CurrencyCode = 'BRL'): string {
  const currency = CURRENCIES[currencyCode];

  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');

  if (!numbers) {
    return '';
  }

  // Converte para número com centavos
  const numberValue = parseInt(numbers, 10) / 100;

  // Bitcoin usa 8 casas decimais
  if (currencyCode === 'BTC') {
    return `${currency.symbol}${numberValue.toFixed(8)}`;
  }

  // Formato brasileiro
  const formatted = numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${currency.symbol} ${formatted}`;
}

/**
 * Converte valor entre moedas
 * @param value - Valor na moeda de origem
 * @param fromCurrency - Código da moeda de origem
 * @param toCurrency - Código da moeda de destino
 * @returns Valor convertido
 */
export function convertCurrency(
  value: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  const from = CURRENCIES[fromCurrency];
  const to = CURRENCIES[toCurrency];

  if (!from || !to) {
    return value;
  }

  // Converter para USD primeiro (moeda base)
  const valueInUSD = value / from.rate;

  // Converter de USD para moeda de destino
  return valueInUSD * to.rate;
}

/**
 * Retorna opções do select de moedas
 * @returns Array de opções para dropdown
 */
export function getCurrencyOptions(): Array<{ value: CurrencyCode; label: string }> {
  return Object.entries(CURRENCIES).map(([code, currency]) => ({
    value: code as CurrencyCode,
    label: `${currency.symbol} ${currency.name} (${code})`
  }));
}
