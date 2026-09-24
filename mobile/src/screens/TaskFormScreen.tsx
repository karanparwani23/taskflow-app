import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { DateTimeField } from '../components/DateTimeField';
import { BouncePressable } from '../components/BouncePressable';
import { PrimaryButton } from '../components/PrimaryButton';
import {
  clearTaskError,
  addTask,
  editTask,
} from '../features/tasks/tasksSlice';
import { colors, spacing } from '../theme/colors';
import { Priority, TaskInput } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;
const priorities: Priority[] = ['low', 'medium', 'high'];

export function TaskFormScreen({ navigation, route }: Props) {
  const dispatch = useAppDispatch();
  const task = route.params?.task;
  const { saving, error } = useAppSelector(state => state.tasks);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [scheduledAt, setScheduledAt] = useState(
    task?.scheduledAt ?? new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  );
  const [deadline, setDeadline] = useState(
    task?.deadline ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  );
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? 'medium',
  );
  const [category, setCategory] = useState(task?.category ?? '');
  const [tags, setTags] = useState(task?.tags.join(', ') ?? '');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearTaskError());
  }, [dispatch]);

  const save = async () => {
    setLocalError('');
    if (!title.trim()) {
      setLocalError('Give your task a title before saving.');
      return;
    }
    if (new Date(deadline).getTime() < new Date(scheduledAt).getTime()) {
      setLocalError('The deadline needs to be after the scheduled time.');
      return;
    }

    const input: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      scheduledAt,
      deadline,
      priority,
      category: category.trim() || undefined,
      tags: tags
        .split(',')
        .map(tag => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    };

    try {
      if (task) {
        await dispatch(editTask({ id: task.id, input })).unwrap();
      } else {
        await dispatch(addTask(input)).unwrap();
      }
      navigation.goBack();
    } catch {
      // The rejected action exposes a message through the task slice.
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <BouncePressable
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>‹</Text>
          </BouncePressable>
          <View>
            <Text style={styles.eyebrow}>
              {task ? 'REFINE YOUR PLAN' : 'MAKE IT HAPPEN'}
            </Text>
            <Text style={styles.heading}>
              {task ? 'Edit task' : 'New task'}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.fieldLabel}>Task title</Text>
          <TextInput
            accessibilityLabel="Task title"
            autoFocus={!task}
            maxLength={120}
            placeholder="What needs to get done?"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            accessibilityLabel="Task description"
            maxLength={2000}
            multiline
            numberOfLines={4}
            placeholder="Add a few details or a next step..."
            placeholderTextColor={colors.muted}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.description]}
          />

          <View style={styles.dateGrid}>
            <View style={styles.dateCell}>
              <DateTimeField
                label="Scheduled"
                value={scheduledAt}
                onChange={setScheduledAt}
              />
            </View>
            <View style={styles.dateCell}>
              <DateTimeField
                label="Deadline"
                value={deadline}
                onChange={setDeadline}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Priority</Text>
          <View style={styles.priorityRow}>
            {priorities.map(item => {
              const active = priority === item;
              return (
                <BouncePressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  key={item}
                  onPress={() => setPriority(item)}
                  style={[
                    styles.priorityChip,
                    active && styles.prioritySelected,
                  ]}
                >
                  <View style={[styles.priorityDot, styles[item]]} />
                  <Text
                    style={[
                      styles.priorityText,
                      active && styles.priorityTextSelected,
                    ]}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </BouncePressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Category</Text>
          <TextInput
            accessibilityLabel="Category"
            maxLength={32}
            placeholder="Work, personal, learning..."
            placeholderTextColor={colors.muted}
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Tags</Text>
          <TextInput
            accessibilityLabel="Tags"
            maxLength={200}
            placeholder="Comma separated, e.g. planning, focus"
            placeholderTextColor={colors.muted}
            value={tags}
            onChangeText={setTags}
            style={styles.input}
          />

          {(localError || error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}
          <PrimaryButton
            label={task ? 'Save changes' : 'Add to my tasks'}
            busy={saving}
            onPress={save}
            style={styles.saveButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeText: {
    color: colors.text,
    fontSize: 33,
    lineHeight: 37,
    marginTop: -5,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  heading: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },
  headerSpacer: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: 9 },
  fieldLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },
  input: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 14,
  },
  description: { minHeight: 102, paddingTop: 14 },
  dateGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: 5 },
  dateCell: { flex: 1 },
  priorityRow: { flexDirection: 'row', gap: spacing.sm },
  priorityChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  prioritySelected: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(184, 243, 107, 0.10)',
  },
  priorityDot: { width: 7, height: 7, borderRadius: 5 },
  low: { backgroundColor: colors.blue },
  medium: { backgroundColor: colors.warning },
  high: { backgroundColor: colors.danger },
  priorityText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  priorityTextSelected: { color: colors.text },
  errorBox: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 125, 129, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 125, 129, 0.35)',
    padding: 12,
    marginTop: 6,
  },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  saveButton: { marginTop: 12 },
});
