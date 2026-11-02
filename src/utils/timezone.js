import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import tzlookup from 'tz-lookup';

dayjs.extend(utc);
dayjs.extend(timezone);

// Fallback zone when lat/lon can't be resolved (app is Argentina-focused).
const DEFAULT_TIMEZONE = 'America/Argentina/Buenos_Aires';

/**
 * Resolve the IANA timezone for a geographic coordinate.
 * Uses tz-lookup (offline, DST/political-zone aware), e.g. (-36, -62) =>
 * "America/Argentina/Buenos_Aires" (UTC-3). Returns a safe default on failure.
 */
export const getTimeZone = (lat, lon) => {
  try {
    if (typeof lat === 'number' && typeof lon === 'number') {
      return tzlookup(lat, lon);
    }
  } catch (err) {
    console.warn('Could not resolve timezone for', { lat, lon }, err);
  }
  return DEFAULT_TIMEZONE;
};

/**
 * Parse a (UTC) API timestamp and express it in the field's timezone.
 * Using dayjs.utc() avoids the ambiguity of new Date() for strings
 * without an explicit offset.
 */
export const inZone = (time, tz) => dayjs.utc(time).tz(tz || DEFAULT_TIMEZONE);

// Formatting helpers that reproduce the shapes the UI uses, but in `tz`.
export const formatDateTime = (time, tz) =>
  inZone(time, tz).format('DD/MM/YYYY HH:mm');

export const formatTime = (time, tz) => inZone(time, tz).format('HH:mm');

export const formatDateShort = (time, tz) => inZone(time, tz).format('DD/MM');

export const formatDateShortYear = (time, tz) =>
  inZone(time, tz).format('DD/MM/YY');

/**
 * The field-local calendar date (YYYY-MM-DD) for a timestamp — used to filter
 * samples to a single local day.
 */
export const localDateKey = (time, tz) => inZone(time, tz).format('YYYY-MM-DD');

/**
 * Given a picked calendar day (a JS Date, interpreted by its Y/M/D) and the
 * field timezone, return the UTC date range (start_date/end_date, YYYY-MM-DD)
 * that covers the full field-local day. For negative offsets this can span two
 * UTC dates. `pickedDay` is the local day key used to filter the response.
 */
export const getUtcDateRangeForLocalDay = (date, tz) => {
  const zone = tz || DEFAULT_TIMEZONE;
  const pickedDay = dayjs(date).format('YYYY-MM-DD');
  const startDate = dayjs.tz(`${pickedDay} 00:00`, zone).utc().format('YYYY-MM-DD');
  const endDate = dayjs.tz(`${pickedDay} 23:59`, zone).utc().format('YYYY-MM-DD');
  return { startDate, endDate, pickedDay };
};

/**
 * A short label for the current UTC offset of a zone, e.g. "UTC-3".
 * Uses a reference instant so DST is reflected for the relevant day.
 */
export const getOffsetLabel = (tz, reference) => {
  const d = reference ? dayjs.utc(reference).tz(tz) : dayjs().tz(tz || DEFAULT_TIMEZONE);
  const offsetMinutes = d.utcOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return minutes === 0
    ? `UTC${sign}${hours}`
    : `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
};
