/**
 * Pure freight quotation arithmetic. Values are stored in minor currency units
 * (yen, cents, fen). No currency conversion and no tax calculation occur here.
 */
export const CURRENCY_DIGITS = Object.freeze({JPY: 0, USD: 2, CNY: 2});

function digitsFor(currency) {
  if (!Object.hasOwn(CURRENCY_DIGITS, currency)) {
    throw new RangeError('Unsupported currency: ' + currency);
  }
  return CURRENCY_DIGITS[currency];
}

export function parseAmount(input, currency, {allowBlank = false} = {}) {
  const digits = digitsFor(currency);
  const raw = String(input ?? '').trim();
  if (raw === '' && allowBlank) return 0;
  const match = /^(0|[1-9]\d*)(?:\.(\d+))?$/.exec(raw);
  if (!match) throw new RangeError('Enter a nonnegative amount with digits only.');
  const fractional = match[2] ?? '';
  if (fractional.length > digits) {
    throw new RangeError(currency + ' permits a maximum of ' + digits + ' decimal places.');
  }
  const unit = 10 ** digits;
  const major = Number(match[1]);
  const minor = major * unit + Number(fractional.padEnd(digits, '0') || '0');
  if (!Number.isSafeInteger(minor)) throw new RangeError('Amount exceeds the safe calculation limit.');
  return minor;
}

function parseQuantity(input) {
  const raw = String(input ?? '').trim();
  if (!/^[1-9]\d*$/.test(raw)) throw new RangeError('Quantity must be a positive integer.');
  const qty = Number(raw);
  if (!Number.isSafeInteger(qty) || qty > 999999) {
    throw new RangeError('Quantity is out of range.');
  }
  return qty;
}

function addSafe(a, b) {
  const value = a + b;
  if (!Number.isSafeInteger(value)) throw new RangeError('Quote total exceeds the safe limit.');
  return value;
}

function multiplySafe(a, b) {
  const value = a * b;
  if (!Number.isSafeInteger(value)) throw new RangeError('Line total exceeds the safe limit.');
  return value;
}

export function calculateQuote(rows, currency, options = {}) {
  digitsFor(currency);
  if (!Array.isArray(rows) || rows.length > 50) throw new RangeError('Invalid quote lines.');
  let costMinor = 0;
  let revenueMinor = 0;
  const lines = rows.map((row) => {
    const qty = parseQuantity(row.qty);
    const costEachMinor = parseAmount(row.cost, currency, options);
    const sellEachMinor = parseAmount(row.sell, currency, options);
    const costTotalMinor = multiplySafe(costEachMinor, qty);
    const sellTotalMinor = multiplySafe(sellEachMinor, qty);
    costMinor = addSafe(costMinor, costTotalMinor);
    revenueMinor = addSafe(revenueMinor, sellTotalMinor);
    return {
      description: String(row.description ?? '').trim(),
      qty, costEachMinor, sellEachMinor, costTotalMinor, sellTotalMinor,
    };
  });
  const profitMinor = revenueMinor - costMinor;
  const marginPct = revenueMinor === 0 ? 0 : Math.round((profitMinor / revenueMinor) * 10000) / 100;
  return {lines, currency, costMinor, revenueMinor, profitMinor, marginPct};
}

export function validateQuote(rows, currency) {
  try {
    if (!Array.isArray(rows) || rows.length === 0) {
      return {ok: false, error: 'Add at least one fee line.'};
    }
    for (const row of rows) {
      if (typeof row.description !== 'string' || row.description.trim().length === 0 || row.description.length > 120) {
        return {ok: false, error: 'Each fee needs a description up to 120 characters.'};
      }
    }
    const quote = calculateQuote(rows, currency);
    return {ok: true, quote};
  } catch (error) {
    return {ok: false, error: error.message};
  }
}

export function formatMoney(minor, currency, locale = 'ja-JP') {
  const digits = digitsFor(currency);
  if (!Number.isSafeInteger(minor)) throw new RangeError('Invalid minor amount.');
  // Keep the decimal value exact: dividing a large integer by 100 loses cents.
  const absolute = String(Math.abs(minor)).padStart(digits + 1, '0');
  const decimal = (minor < 0 ? '-' : '') + (digits === 0 ? absolute :
    absolute.slice(0, -digits) + '.' + absolute.slice(-digits));
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency,
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).format(decimal);
}
