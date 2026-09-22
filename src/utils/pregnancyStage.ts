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

/**
 * Calculates current gestational age in weeks derived from persisted patient profile due_date.
 * Standard EDD formula: 40 weeks - Math.floor((due_date - today) / 7 days).
 */
export function calculateGestationalWeekFromDueDate(
  dueDateInput?: string | null,
  fallbackWeek: number = 24
): number {
  if (!dueDateInput || typeof dueDateInput !== 'string' || !dueDateInput.trim()) {
    return Math.max(1, Math.min(42, fallbackWeek));
  }

  const dueDate = new Date(dueDateInput.trim());
  if (isNaN(dueDate.getTime())) {
    return Math.max(1, Math.min(42, fallbackWeek));
  }

  const today = new Date();
  // Normalize both dates to midnight UTC to prevent time zone drift
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const dueUtc = Date.UTC(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffMs = dueUtc - todayUtc;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.floor(diffDays / 7);
  const gestationalWeek = 40 - weeksRemaining;

  // Clamp between week 1 and 42
  return Math.max(1, Math.min(42, gestationalWeek));
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
