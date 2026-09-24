import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { Task } from '../types';

interface Props {
  tasks: Task[];
}

export function WeeklyProgress({ tasks }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    const key = dateKey(date);
    const due = tasks.filter(task => dateKey(new Date(task.deadline)) === key);
    return { date, due, completed: due.filter(task => task.completed).length };
  });
  const total = days.reduce((sum, day) => sum + day.due.length, 0);
  const completed = days.reduce((sum, day) => sum + day.completed, 0);
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <Text style={styles.title}>NEXT 7 DAYS</Text>
        <Text style={styles.summary}>
          {completed}/{total} complete
        </Text>
      </View>
      <View style={styles.days}>
        {days.map((day, index) => {
          const todayCell = index === 0;
          return (
            <View key={dateKey(day.date)} style={styles.day}>
              <Text style={[styles.weekday, todayCell && styles.weekdayToday]}>
                {day.date
                  .toLocaleDateString(undefined, { weekday: 'short' })
                  .toUpperCase()}
              </Text>
              <View
                style={[
                  styles.dateBadge,
                  todayCell && styles.dateBadgeToday,
                  day.due.length > 0 && !todayCell && styles.dateBadgeHasTasks,
                ]}
              >
                <Text
                  style={[
                    styles.dateNumber,
                    todayCell && styles.dateNumberToday,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
              </View>
              <Text style={styles.taskCount}>
                {day.due.length > 0 ? day.due.length : '·'}
              </Text>
            </View>
          );
        })}
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={`${completed} of ${total} tasks completed in the next seven days`}
        accessibilityValue={{ min: 0, max: 100, now: progress }}
        style={styles.progressTrack}
      >
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },
  title: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.35,
  },
  summary: { color: colors.accent, fontSize: 10, fontWeight: '800' },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', flex: 1, gap: 4 },
  weekday: { color: '#708198', fontSize: 8, fontWeight: '800' },
  weekdayToday: { color: colors.accent },
  dateBadge: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dateBadgeToday: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dateBadgeHasTasks: { borderColor: 'rgba(121, 184, 255, 0.35)' },
  dateNumber: { color: colors.text, fontSize: 11, fontWeight: '800' },
  dateNumberToday: { color: colors.accentInk },
  taskCount: { color: colors.muted, fontSize: 8, lineHeight: 9 },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: colors.elevated,
    marginTop: 9,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
});
