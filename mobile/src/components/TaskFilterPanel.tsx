import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppIcon } from './AppIcon';
import { BouncePressable } from './BouncePressable';
import { PrimaryButton } from './PrimaryButton';
import { colors, spacing } from '../theme/colors';
import { Priority, TaskSort, TaskStatus } from '../types';

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Everything', value: 'all' },
  { label: 'To do', value: 'open' },
  { label: 'Done', value: 'completed' },
  { label: 'Overdue', value: 'overdue' },
];
const priorityOptions: { label: string; value: Priority | 'all' }[] = [
  { label: 'Any priority', value: 'all' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];
const sortOptions: { label: string; value: TaskSort }[] = [
  { label: 'Smart order', value: 'smart' },
  { label: 'Due date', value: 'deadline' },
  { label: 'Recently added', value: 'created' },
];

interface Props {
  visible: boolean;
  activeCount: number;
  status: TaskStatus;
  priority: Priority | 'all';
  sort: TaskSort;
  category: string | null;
  categories: string[];
  resultCount: number;
  onStatusChange: (value: TaskStatus) => void;
  onPriorityChange: (value: Priority | 'all') => void;
  onSortChange: (value: TaskSort) => void;
  onCategoryChange: (value: string | null) => void;
  onReset: () => void;
  onOpen: () => void;
  onClose: () => void;
}

export function TaskFilterPanel({
  visible,
  activeCount,
  status,
  priority,
  sort,
  category,
  categories,
  resultCount,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onCategoryChange,
  onReset,
  onOpen,
  onClose,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    rise.setValue(28);
    const entrance = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(rise, {
        toValue: 0,
        speed: 16,
        bounciness: 7,
        useNativeDriver: true,
      }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [opacity, rise, visible]);

  return (
    <>
      <BouncePressable
        accessibilityRole="button"
        accessibilityLabel={
          activeCount ? `Filters, ${activeCount} active` : 'Filters'
        }
        onPress={onOpen}
        style={styles.trigger}
      >
        <AppIcon name="filter" size={18} color={colors.accent} />
        <View style={styles.triggerCopy}>
          <Text style={styles.triggerTitle}>Filters & order</Text>
          <Text style={styles.triggerSubtitle}>
            {activeCount ? `${activeCount} active` : 'Everything in your plan'}
          </Text>
        </View>
        {activeCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{activeCount}</Text>
          </View>
        )}
        <AppIcon name="arrowRight" size={15} color={colors.muted} />
      </BouncePressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close filters"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
          <Animated.View
            style={[
              styles.sheet,
              { opacity, transform: [{ translateY: rise }] },
            ]}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.headerMark}>
                <AppIcon name="filter" size={18} color={colors.accent} />
              </View>
              <View style={styles.sheetHeadingCopy}>
                <Text style={styles.eyebrow}>MAKE IT YOURS</Text>
                <Text style={styles.sheetTitle}>Filters & order</Text>
              </View>
              <BouncePressable
                accessibilityRole="button"
                accessibilityLabel="Reset filters"
                onPress={onReset}
                style={styles.resetButton}
              >
                <Text style={styles.resetText}>Reset</Text>
              </BouncePressable>
              <BouncePressable
                accessibilityRole="button"
                accessibilityLabel="Close filters"
                onPress={onClose}
                style={styles.closeButton}
              >
                <AppIcon name="close" size={15} color={colors.muted} />
              </BouncePressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.optionsContent}
            >
              <FilterGroup
                label="SHOW"
                options={statusOptions}
                value={status}
                onChange={onStatusChange}
              />
              <FilterGroup
                label="PRIORITY"
                options={priorityOptions}
                value={priority}
                onChange={onPriorityChange}
              />
              <FilterGroup
                label="SORT BY"
                options={sortOptions}
                value={sort}
                onChange={onSortChange}
              />
              {categories.length > 0 && (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>CATEGORY</Text>
                  <View style={styles.chipRow}>
                    <OptionChip
                      label="All"
                      selected={category === null}
                      onPress={() => onCategoryChange(null)}
                    />
                    {categories.map(item => (
                      <OptionChip
                        key={item}
                        label={item}
                        selected={category === item}
                        onPress={() =>
                          onCategoryChange(category === item ? null : item)
                        }
                      />
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            <PrimaryButton
              compact
              label={`Show ${resultCount} ${
                resultCount === 1 ? 'task' : 'tasks'
              }`}
              onPress={onClose}
              style={styles.applyButton}
            />
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(option => (
          <OptionChip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </View>
    </View>
  );
}

function OptionChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <BouncePressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </BouncePressable>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 12,
  },
  triggerCopy: { flex: 1 },
  triggerTitle: { color: colors.text, fontSize: 12, fontWeight: '800' },
  triggerSubtitle: { color: colors.muted, fontSize: 10, marginTop: 3 },
  countBadge: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 243, 107, 0.14)',
  },
  countText: { color: colors.accent, fontSize: 10, fontWeight: '900' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(3, 8, 16, 0.74)',
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '82%',
    alignSelf: 'center',
    padding: spacing.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    elevation: 18,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  headerMark: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 243, 107, 0.12)',
  },
  sheetHeadingCopy: { flex: 1 },
  eyebrow: {
    color: colors.accent,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.25,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  resetButton: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  resetText: { color: colors.blue, fontSize: 11, fontWeight: '800' },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
  },
  optionsContent: { paddingTop: 15, paddingBottom: 8, gap: 13 },
  group: { gap: 8 },
  groupLabel: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    fontWeight: '900',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: 'rgba(184, 243, 107, 0.48)',
    backgroundColor: 'rgba(184, 243, 107, 0.12)',
  },
  chipText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  chipTextSelected: { color: colors.accent },
  applyButton: { marginTop: 8 },
});
