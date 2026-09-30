/**
 * HI MUMMA - CANONICAL PREGNANCY STAGE & WEEK CALCULATION UTILITY
 * Sole product source of truth based on the HI MUMMA APP BLUEPRINT.
 *
 * Canonical Blueprint Boundaries:
 * - First Trimester: Weeks 1–12
 * - Second Trimester: Weeks 13–27
 * - Third Trimester: Weeks 28–40+
 * - Delivery
 * - Postpartum: 42 days (6 weeks)
 */

export interface PregnancyStageInfo {
  trimesterNumber: 1 | 2 | 3;
  trimesterName: 'First Trimester' | 'Second Trimester' | 'Third Trimester';
  weekRangeText: string;
  isFirstTrimester: boolean;
  isSecondTrimester: boolean;
  isThirdTrimester: boolean;
}

export interface GestationalAge {
  weeks: number;
  days: number;
  totalDays: number;
  hasValidDate: boolean;
  formattedLong: string;
  formattedShort: string;
}

/**
 * Formats gestational weeks and days cleanly into "32 weeks 2 days" or "32w 2d".
 * Handles singular ("1 week", "1 day") vs plural ("32 weeks", "2 days", "0 days").
 */
export function formatGestationalAge(
  weeks: number,
  days: number = 0,
  format: 'long' | 'short' = 'long'
): string {
  const safeWeeks = Math.max(0, weeks);
  const safeDays = Math.max(0, Math.min(6, days));
  if (format === 'short') {
    return `${safeWeeks}w ${safeDays}d`;
  }
  const weekText = `${safeWeeks} ${safeWeeks === 1 ? 'week' : 'weeks'}`;
  const dayText = `${safeDays} ${safeDays === 1 ? 'day' : 'days'}`;
  return `${weekText} ${dayText}`;
}

/**
 * Calculates current gestational age (Period of Gestation - POG) in weeks and days
 * derived from the patient's expected due date (EDD).
 * Standard EDD formula: 40 weeks (280 days) - (due_date - today).
 * Completed weeks = floor(total gestational days / 7)
 * Additional days = total gestational days % 7
 */
export function calculateGestationalAgeFromDueDate(
  dueDateInput?: string | null,
  fallbackWeek: number = 24,
  fallbackDays: number = 0
): GestationalAge {
  if (!dueDateInput || typeof dueDateInput !== 'string' || !dueDateInput.trim()) {
    const clampedWeek = Math.max(1, Math.min(42, fallbackWeek));
    const clampedDays = Math.max(0, Math.min(6, fallbackDays));
    return {
      weeks: clampedWeek,
      days: clampedDays,
      totalDays: clampedWeek * 7 + clampedDays,
      hasValidDate: false,
      formattedLong: formatGestationalAge(clampedWeek, clampedDays, 'long'),
      formattedShort: formatGestationalAge(clampedWeek, clampedDays, 'short')
    };
  }

  const dueDate = new Date(dueDateInput.trim());
  if (isNaN(dueDate.getTime())) {
    const clampedWeek = Math.max(1, Math.min(42, fallbackWeek));
    const clampedDays = Math.max(0, Math.min(6, fallbackDays));
    return {
      weeks: clampedWeek,
      days: clampedDays,
      totalDays: clampedWeek * 7 + clampedDays,
      hasValidDate: false,
      formattedLong: formatGestationalAge(clampedWeek, clampedDays, 'long'),
      formattedShort: formatGestationalAge(clampedWeek, clampedDays, 'short')
    };
  }

  const today = new Date();
  // Normalize both dates to midnight UTC to prevent time zone drift
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueUtc = Date.UTC(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate());

  const diffMs = dueUtc - todayUtc;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // 280 days total EDD window (40 weeks)
  const totalGestationalDays = 280 - diffDays;

  // Handle early pre-conception or extreme future due date bounds
  if (totalGestationalDays <= 0) {
    return {
      weeks: 1,
      days: 0,
      totalDays: 7,
      hasValidDate: true,
      formattedLong: formatGestationalAge(1, 0, 'long'),
      formattedShort: formatGestationalAge(1, 0, 'short')
    };
  }

  // Calculate completed weeks and additional days
  let weeks = Math.floor(totalGestationalDays / 7);
  let days = totalGestationalDays % 7;
  if (days < 0) {
    days += 7;
  }

  const clampedWeek = Math.max(1, Math.min(42, weeks));
  const finalDays = (weeks >= 42) ? 6 : Math.max(0, Math.min(6, days));

  return {
    weeks: clampedWeek,
    days: finalDays,
    totalDays: clampedWeek * 7 + finalDays,
    hasValidDate: true,
    formattedLong: formatGestationalAge(clampedWeek, finalDays, 'long'),
    formattedShort: formatGestationalAge(clampedWeek, finalDays, 'short')
  };
}

/**
 * Calculates current gestational week number derived from due_date.
 */
export function calculateGestationalWeekFromDueDate(
  dueDateInput?: string | null,
  fallbackWeek: number = 24
): number {
  return calculateGestationalAgeFromDueDate(dueDateInput, fallbackWeek).weeks;
}

/**
 * Canonical Trimester boundary calculator per HI MUMMA Blueprint:
 * - First trimester: weeks 1–12
 * - Second trimester: weeks 13–27
 * - Third trimester: weeks 28–40+
 */
export function getTrimesterNumber(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

/**
 * Returns full canonical stage metadata for a given week.
 */
export function getPregnancyStageInfo(week: number): PregnancyStageInfo {
  const trimesterNumber = getTrimesterNumber(week);

  if (trimesterNumber === 1) {
    return {
      trimesterNumber: 1,
      trimesterName: 'First Trimester',
      weekRangeText: 'Weeks 1–12',
      isFirstTrimester: true,
      isSecondTrimester: false,
      isThirdTrimester: false
    };
  } else if (trimesterNumber === 2) {
    return {
      trimesterNumber: 2,
      trimesterName: 'Second Trimester',
      weekRangeText: 'Weeks 13–27',
      isFirstTrimester: false,
      isSecondTrimester: true,
      isThirdTrimester: false
    };
  } else {
    return {
      trimesterNumber: 3,
      trimesterName: 'Third Trimester',
      weekRangeText: 'Weeks 28–40+',
      isFirstTrimester: false,
      isSecondTrimester: false,
      isThirdTrimester: true
    };
  }
}
