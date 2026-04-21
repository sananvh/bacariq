/**
 * Streak utility functions for tracking user daily learning progress
 */

/**
 * Get today's date as a date string (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

/**
 * Get yesterday's date as a date string
 */
export function getYesterdayDate(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

/**
 * Get the date for a specific number of days ago
 */
export function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

/**
 * Calculate streak statistics from a list of completed dates
 */
export function calculateStreakStats(completedDates: string[]): {
  currentStreak: number
  longestStreak: number
  lastCompletedDate: string | null
} {
  if (!completedDates || completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null }
  }

  // Sort dates in descending order (most recent first)
  const sortedDates = [...completedDates].sort().reverse()
  const today = getTodayDate()
  const yesterday = getYesterdayDate()

  // Calculate current streak
  let currentStreak = 0
  let checkDate = today

  // Check if today is completed, if not check yesterday
  if (!sortedDates.includes(today) && sortedDates.includes(yesterday)) {
    checkDate = yesterday
  }

  for (const date of sortedDates) {
    if (date === checkDate) {
      currentStreak++
      // Move check date back by one day
      const dateObj = new Date(checkDate)
      dateObj.setDate(dateObj.getDate() - 1)
      checkDate = dateObj.toISOString().split('T')[0]
    } else {
      break
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 0; i < sortedDates.length - 1; i++) {
    const currentDate = new Date(sortedDates[i])
    const nextDate = new Date(sortedDates[i + 1])

    const dayDiff =
      (currentDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24)

    if (dayDiff === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: sortedDates[0] || null,
  }
}

/**
 * Get the current week's dates (Monday to Sunday)
 */
export function getCurrentWeekDates(): Array<{
  date: string
  day: string
  dayIndex: number
}> {
  const today = new Date()
  const dayOfWeek = today.getDay()
  // JavaScript's getDay() returns 0 for Sunday, 1 for Monday, etc.
  // We want Monday = 0, so we adjust
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekDates = []

  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - mondayOffset + i)
    const dateStr = date.toISOString().split('T')[0]

    weekDates.push({
      date: dateStr,
      day: daysOfWeek[i],
      dayIndex: i,
    })
  }

  return weekDates
}

/**
 * Check if a date string is in the completed dates array
 */
export function isDateCompleted(date: string, completedDates: string[]): boolean {
  return completedDates.includes(date)
}

/**
 * Get all completed dates for current week
 */
export function getCompletedWeekDates(
  completedDates: string[]
): Record<string, boolean> {
  const weekDates = getCurrentWeekDates()
  const result: Record<string, boolean> = {}

  weekDates.forEach(({ date, day }) => {
    result[day] = isDateCompleted(date, completedDates)
  })

  return result
}
