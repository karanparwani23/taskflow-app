import React, { useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { BouncePressable } from './BouncePressable';
import { AppIcon } from './AppIcon';
import { colors, spacing } from '../theme/colors';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DateTimeField({ label, value, onChange }: Props) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  const pendingDate = useRef(new Date(value));
  const date = new Date(value);

  const openPicker = () => {
    pendingDate.current = new Date(value);
    setMode('date');
  };

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || !selected || !mode) {
      setMode(null);
      return;
    }

    const next = new Date(pendingDate.current);
    if (mode === 'date') {
      next.setFullYear(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
      );
      pendingDate.current = next;
      onChange(next.toISOString());
      setMode(null);
      setTimeout(() => setMode('time'), 180);
      return;
    }

    next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    pendingDate.current = next;
    onChange(next.toISOString());
    setMode(null);
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <BouncePressable onPress={openPicker} style={styles.button}>
        <View style={styles.icon}>
          <AppIcon name="calendar" size={20} color={colors.accent} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.date}>
            {date.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.time}>
            {date.toLocaleTimeString(undefined, {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </Text>
        </View>
        <Text style={styles.change}>Change</Text>
      </BouncePressable>
      {mode && (
        <DateTimePicker
          value={pendingDate.current}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  button: {
    minHeight: 64,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { width: 34 },
  copy: { flex: 1 },
  date: { color: colors.text, fontSize: 14, fontWeight: '700' },
  time: { color: colors.muted, fontSize: 12, marginTop: 3 },
  change: { color: colors.blue, fontSize: 12, fontWeight: '700' },
});
