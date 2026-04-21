'use client'

import { Flame, Check } from 'lucide-react'
import {
  calculateStreakStats,
  getCurrentWeekDates,
  isDateCompleted,
} from '@/lib/streak'

interface StreakCalendarProps {
  completedDates: string[]
  currentStreak?: number
  longestStreak?: number
}

export default function StreakCalendar({
  completedDates,
  currentStreak: overrideCurrentStreak,
  longestStreak: overrideLongestStreak,
}: StreakCalendarProps) {
  const stats = calculateStreakStats(completedDates)
  const currentStreak = overrideCurrentStreak ?? stats.currentStreak
  const longestStreak = overrideLongestStreak ?? stats.longestStreak
  const weekDates = getCurrentWeekDates()
  const completedWeek = weekDates.map((d) => ({
    ...d,
    isCompleted: isDateCompleted(d.date, completedDates),
  }))

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-b from-orange-400 to-yellow-300 rounded-2xl p-8 text-center">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-8 h-8 text-orange-600 fill-orange-600" />
          <h2 className="text-5xl font-bold text-white">{currentStreak}</h2>
        </div>
        <p className="text-white text-lg font-semibold">day streak</p>
      </div>

      {/* Motivational message */}
      <div className="mb-8">
        <p className="text-white text-center font-semibold">
          You're on a streak! Can you reach day {currentStreak + 1}?
        </p>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
        <h3 className="text-gray-800 font-semibold text-lg mb-4 text-left">
          Weekly progress
        </h3>

        {/* Days of week with checkmarks */}
        <div className="flex justify-between mb-4">
          {completedWeek.map((day) => (
            <div key={day.day} className="flex flex-col items-center gap-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  day.isCompleted
                    ? 'bg-green-100 border-2 border-green-500'
                    : 'bg-gray-100 border-2 border-gray-300'
                }`}
              >
                {day.isCompleted ? (
                  <Check className="w-6 h-6 text-green-600" strokeWidth={3} />
                ) : (
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                )}
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {day.day}
              </span>
            </div>
          ))}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 text-center mt-4">
          A streak counts how many days you&apos;ve completed a lesson in a row
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white bg-opacity-90 rounded-lg p-3">
          <p className="text-gray-600 text-xs font-medium mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
        </div>
        <div className="bg-white bg-opacity-90 rounded-lg p-3">
          <p className="text-gray-600 text-xs font-medium mb-1">Best Streak</p>
          <p className="text-2xl font-bold text-orange-600">{longestStreak}</p>
        </div>
      </div>

      {/* Action button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
        Continue Learning
      </button>
    </div>
  )
}
