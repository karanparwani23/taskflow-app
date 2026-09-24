import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Alert,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { PrimaryButton } from '../components/PrimaryButton';
import { BouncePressable } from '../components/BouncePressable';
import { AppIcon } from '../components/AppIcon';
import { SignOutSheet } from '../components/SignOutSheet';
import { TaskFilterPanel } from '../components/TaskFilterPanel';
import { WeeklyProgress } from '../components/WeeklyProgress';
import { signOut } from '../features/auth/authSlice';
import {
  clearTaskError,
  editTask,
  fetchTasks,
  removeTask,
} from '../features/tasks/tasksSlice';
import { orderTasks } from '../features/tasks/taskOrdering';
import { colors, spacing } from '../theme/colors';
import { Priority, Task, TaskSort, TaskStatus } from '../types';
import { RootStackParamList } from '../navigation/types';

function isOverdue(task: Task): boolean {
  return !task.completed && new Date(task.deadline).getTime() < Date.now();
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function shortTime(value: string): string {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function taskDayKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

function taskDayHeading(value: string): string {
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  if (day.getTime() === today.getTime())
    return `TODAY  ·  ${dateLabel.toUpperCase()}`;
  if (day.getTime() === tomorrow.getTime())
    return `TOMORROW  ·  ${dateLabel.toUpperCase()}`;
  return dateLabel.toUpperCase();
}

export function TaskListScreen() {
  const dispatch = useAppDispatch();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const { items, loading, error } = useAppSelector(state => state.tasks);
  const [status, setStatus] = useState<TaskStatus>('all');
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [sort, setSort] = useState<TaskSort>('smart');
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [signOutVisible, setSignOutVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchTasks({ status: 'all', sort: 'smart' }));
  }, [dispatch]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map(task => task.category)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [items],
  );

  const visibleTasks = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const filtered = items.filter(task => {
      if (status === 'open' && task.completed) return false;
      if (status === 'completed' && !task.completed) return false;
      if (status === 'overdue' && !isOverdue(task)) return false;
      if (priority !== 'all' && task.priority !== priority) return false;
      if (category && task.category !== category) return false;
      if (searchTerm) {
        const searchable = [
          task.title,
          task.description,
          task.category ?? '',
          ...task.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(searchTerm)) return false;
      }
      return true;
    });
    const ordered = orderTasks(filtered, sort);
    const byDay = new Map<string, Task[]>();
    for (const task of ordered) {
      const key = taskDayKey(task.deadline);
      byDay.set(key, [...(byDay.get(key) ?? []), task]);
    }
    return [...byDay.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .flatMap(([, dayTasks]) => dayTasks);
  }, [items, search, status, priority, category, sort]);

  const openCount = items.filter(task => !task.completed).length;
  const completedCount = items.filter(task => task.completed).length;
  const dueTodayCount = items.filter(task => {
    if (task.completed) return false;
    return new Date(task.deadline).toDateString() === new Date().toDateString();
  }).length;
  const activeFilterCount =
    Number(status !== 'all') +
    Number(priority !== 'all') +
    Number(sort !== 'smart') +
    Number(category !== null);

  const toggle = (task: Task) => {
    dispatch(editTask({ id: task.id, input: { completed: !task.completed } }));
  };

  const confirmDelete = (task: Task) => {
    Alert.alert('Delete this task?', 'This action cannot be undone.', [
      { text: 'Keep task', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(removeTask(task.id)),
      },
    ]);
  };

  const renderTask: ListRenderItem<Task> = ({ item, index }) => {
    const previous = visibleTasks[index - 1];
    const showDayHeading =
      !previous || taskDayKey(previous.deadline) !== taskDayKey(item.deadline);
    return (
      <TaskCard
        task={item}
        index={index}
        dayHeading={showDayHeading ? taskDayHeading(item.deadline) : undefined}
        onToggle={() => toggle(item)}
        onEdit={() => navigation.navigate('TaskForm', { task: item })}
        onDelete={() => confirmDelete(item)}
      />
    );
  };

  const header = (
    <View>
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <AppIcon name="check" size={18} color={colors.accentInk} />
          </View>
          <Text style={styles.brandName}>taskflow</Text>
        </View>
        <BouncePressable
          accessibilityRole="button"
          accessibilityLabel="Account options"
          accessibilityHint="Opens the stay or sign out options"
          onPress={() => setSignOutVisible(true)}
          style={styles.profile}
        >
          <Text style={styles.profileText}>
            {(user?.email?.[0] ?? 'T').toUpperCase()}
          </Text>
        </BouncePressable>
      </View>

      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.todayLabel}>
            {new Date().toLocaleDateString(undefined, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.greeting}>A little progress,</Text>
          <Text style={styles.greetingSecond}>a lot of momentum.</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <BouncePressable
          accessibilityRole="button"
          accessibilityLabel="Create a new task"
          onPress={() => navigation.navigate('TaskForm')}
          style={styles.addCircle}
        >
          <AppIcon name="plus" size={25} color={colors.accentInk} />
        </BouncePressable>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryPrimary]}>
          <Text style={styles.summaryCaption}>IN MOTION</Text>
          <Text style={styles.summaryNumberPrimary}>{openCount}</Text>
          <Text style={styles.summarySubPrimary}>tasks to focus on</Text>
        </View>
        <View style={styles.summaryCard}>
          <View style={styles.summaryLine}>
            <View
              style={[styles.summaryDot, { backgroundColor: colors.warning }]}
            />
            <Text style={styles.summaryCaption}>DUE TODAY</Text>
          </View>
          <Text style={styles.summaryNumber}>{dueTodayCount}</Text>
          <View style={styles.summaryFoot}>
            <Text style={styles.summaryFootText}>
              ✦ {completedCount} completed
            </Text>
          </View>
        </View>
      </View>

      <WeeklyProgress tasks={items} />

      <View style={styles.searchWrap}>
        <AppIcon name="search" size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search tasks"
          placeholder="Find a task, tag or category"
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable
            accessibilityLabel="Clear search"
            onPress={() => setSearch('')}
          >
            <AppIcon name="close" size={14} color={colors.muted} />
          </Pressable>
        )}
      </View>

      <TaskFilterPanel
        visible={filtersVisible}
        activeCount={activeFilterCount}
        status={status}
        priority={priority}
        sort={sort}
        category={category}
        categories={categories}
        resultCount={visibleTasks.length}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSortChange={setSort}
        onCategoryChange={setCategory}
        onReset={() => {
          setStatus('all');
          setPriority('all');
          setSort('smart');
          setCategory(null);
        }}
        onOpen={() => setFiltersVisible(true)}
        onClose={() => setFiltersVisible(false)}
      />

      <View style={styles.listHeading}>
        <View>
          <Text style={styles.listTitle}>Your tasks</Text>
          <Text style={styles.listCount}>
            {visibleTasks.length} {visibleTasks.length === 1 ? 'item' : 'items'}
            {status === 'all' ? '' : ' · ' + status}
          </Text>
        </View>
        <Text style={styles.smartHint}>PRIORITY + TIME</Text>
      </View>
      {error && (
        <Pressable
          style={styles.errorBanner}
          onPress={() => dispatch(clearTaskError())}
        >
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorDismiss}>×</Text>
        </Pressable>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={visibleTasks}
        keyExtractor={task => task.id}
        renderItem={renderTask}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyMark}>
              <Text style={styles.emptyMarkText}>✦</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {items.length === 0 ? 'A fresh start.' : 'Nothing on this list.'}
            </Text>
            <Text style={styles.emptyCopy}>
              {items.length === 0
                ? 'Add a task, give it a deadline, and let the day take shape.'
                : 'Try a different filter or add a new task to your plan.'}
            </Text>
            {items.length === 0 && (
              <PrimaryButton
                compact
                label="Create your first task"
                onPress={() => navigation.navigate('TaskForm')}
                style={styles.emptyButton}
              />
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={TaskSeparator}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              dispatch(fetchTasks({ status: 'all', sort: 'smart' }));
            }}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
      <SignOutSheet
        visible={signOutVisible}
        email={user?.email}
        onStay={() => setSignOutVisible(false)}
        onSignOut={() => dispatch(signOut())}
      />
    </SafeAreaView>
  );
}

function TaskCard({
  task,
  index,
  dayHeading,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  dayHeading?: string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const entrance = useRef(new Animated.Value(0)).current;
  const checkPop = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const overdue = isOverdue(task);
  const priorityColor =
    task.priority === 'high'
      ? colors.danger
      : task.priority === 'medium'
      ? colors.warning
      : colors.blue;

  useEffect(() => {
    const intro = Animated.sequence([
      Animated.delay(Math.min(index * 55, 330)),
      Animated.spring(entrance, {
        toValue: 1,
        speed: 13,
        bounciness: 8,
        useNativeDriver: true,
      }),
    ]);
    intro.start();
    return () => intro.stop();
  }, [entrance, index]);

  useEffect(() => {
    Animated.spring(checkPop, {
      toValue: task.completed ? 1 : 0,
      speed: 22,
      bounciness: 13,
      useNativeDriver: true,
    }).start();
  }, [checkPop, task.completed]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
          {
            scale: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [0.97, 1],
            }),
          },
        ],
      }}
    >
      {dayHeading && (
        <View style={styles.dayHeadingWrap}>
          <Text style={styles.dayHeading}>{dayHeading}</Text>
          <View style={styles.dayRule} />
        </View>
      )}
      <View style={[styles.taskCard, task.completed && styles.taskCardDone]}>
        <View
          pointerEvents="none"
          style={[styles.priorityEdge, { backgroundColor: priorityColor }]}
        />
        <BouncePressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityLabel={
            (task.completed ? 'Mark incomplete: ' : 'Complete: ') + task.title
          }
          onPress={onToggle}
          style={[styles.check, task.completed && styles.checkDone]}
        >
          <Animated.Text
            style={[
              styles.checkGlyph,
              {
                opacity: checkPop,
                transform: [
                  {
                    scale: checkPop.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            ✓
          </Animated.Text>
        </BouncePressable>

        <View style={styles.taskBody}>
          <Pressable accessibilityRole="button" onPress={onEdit}>
            <View style={styles.taskTopline}>
              <Text
                numberOfLines={2}
                style={[
                  styles.taskTitle,
                  task.completed && styles.taskTitleDone,
                ]}
              >
                {task.title}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityColor + '1C' },
                ]}
              >
                <View
                  style={[
                    styles.priorityBadgeDot,
                    { backgroundColor: priorityColor },
                  ]}
                />
                <Text
                  style={[styles.priorityBadgeText, { color: priorityColor }]}
                >
                  {task.priority}
                </Text>
              </View>
            </View>
            {!!task.description && (
              <Text numberOfLines={2} style={styles.taskDescription}>
                {task.description}
              </Text>
            )}
            <View style={styles.taskMeta}>
              <AppIcon
                name="calendar"
                size={12}
                color={overdue ? colors.danger : colors.muted}
              />
              <Text style={[styles.deadline, overdue && styles.overdue]}>
                {overdue ? 'OVERDUE · ' : 'DUE '}
                {shortDate(task.deadline)} · {shortTime(task.deadline)}
              </Text>
              {!!task.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{task.category}</Text>
                </View>
              )}
            </View>
            {task.tags.length > 0 && (
              <View style={styles.tagRow}>
                {task.tags.slice(0, 3).map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
          <View style={styles.taskActions}>
            <BouncePressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${task.title}`}
              onPress={onEdit}
              style={styles.action}
            >
              <AppIcon name="edit" size={12} color={colors.blue} />
              <Text style={styles.actionEdit}>Edit</Text>
            </BouncePressable>
            <BouncePressable
              accessibilityRole="button"
              accessibilityLabel={`Delete ${task.title}`}
              onPress={onDelete}
              style={styles.action}
            >
              <AppIcon name="delete" size={12} color={colors.muted} />
              <Text style={styles.actionDelete}>Delete</Text>
            </BouncePressable>
            <Text style={styles.scheduled}>
              SCHEDULED {shortDate(task.scheduledAt)} ·{' '}
              {shortTime(task.scheduledAt)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: spacing.md, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingBottom: 20,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  profile: {
    width: 37,
    height: 37,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(184, 243, 107, 0.45)',
    backgroundColor: 'rgba(184, 243, 107, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { color: colors.accent, fontWeight: '800', fontSize: 15 },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headingCopy: { flex: 1 },
  todayLabel: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  greeting: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginTop: 8,
  },
  greetingSecond: {
    color: colors.accent,
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  email: { color: colors.muted, fontSize: 12, marginTop: 9 },
  addCircle: {
    width: 54,
    height: 54,
    borderRadius: 19,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
    marginTop: 21,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minHeight: 116,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  summaryPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  summaryCaption: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '800',
  },
  summaryNumber: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    marginTop: 7,
  },
  summaryNumberPrimary: {
    color: colors.accentInk,
    fontSize: 31,
    fontWeight: '800',
    marginTop: 7,
  },
  summarySubPrimary: {
    color: '#3D5427',
    fontSize: 11,
    fontWeight: '600',
    marginTop: -1,
  },
  summaryLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  summaryDot: { width: 6, height: 6, borderRadius: 4 },
  summaryFoot: { marginTop: 1 },
  summaryFootText: { color: colors.success, fontSize: 11, fontWeight: '700' },
  searchWrap: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 13,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 10,
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 21,
    marginBottom: 12,
  },
  listTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  listCount: { color: colors.muted, fontSize: 11, marginTop: 3 },
  smartHint: {
    color: colors.muted,
    fontSize: 8,
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 2,
  },
  errorBanner: {
    borderWidth: 1,
    borderColor: 'rgba(255, 125, 129, 0.35)',
    backgroundColor: 'rgba(255, 125, 129, 0.1)',
    borderRadius: 12,
    padding: 11,
    flexDirection: 'row',
    marginBottom: 10,
  },
  errorText: { color: colors.danger, fontSize: 12, lineHeight: 17, flex: 1 },
  errorDismiss: {
    color: colors.danger,
    fontSize: 19,
    marginLeft: 8,
    marginTop: -4,
  },
  separator: { height: 9 },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 31,
    paddingBottom: 45,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  emptyMark: {
    width: 43,
    height: 43,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184, 243, 107, 0.12)',
  },
  emptyMarkText: { color: colors.accent, fontSize: 22 },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 13,
  },
  emptyCopy: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  emptyButton: { marginTop: 17 },
  dayHeadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 5,
    marginBottom: 9,
  },
  dayHeading: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.15,
  },
  dayRule: { flex: 1, height: 1, backgroundColor: colors.border },
  taskCard: {
    position: 'relative',
    flexDirection: 'row',
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 11,
  },
  priorityEdge: {
    position: 'absolute',
    left: 0,
    top: 13,
    bottom: 13,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  taskCardDone: { opacity: 0.72 },
  check: {
    width: 22,
    height: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#71849A',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkGlyph: {
    color: colors.accentInk,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '900',
  },
  taskBody: { flex: 1, minWidth: 0 },
  taskTopline: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  taskTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
    flex: 1,
  },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.muted },
  taskDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
  },
  priorityBadgeDot: { width: 5, height: 5, borderRadius: 4 },
  priorityBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 9,
  },
  deadline: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  overdue: { color: colors.danger },
  categoryBadge: {
    backgroundColor: 'rgba(121, 184, 255, 0.11)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: { color: colors.blue, fontSize: 9, fontWeight: '700' },
  tagRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 8 },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.elevated,
  },
  tagText: { color: colors.muted, fontSize: 8, fontWeight: '700' },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
    gap: 13,
  },
  action: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionEdit: { color: colors.blue, fontSize: 10, fontWeight: '700' },
  actionDelete: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  scheduled: {
    color: '#72839A',
    fontSize: 8,
    letterSpacing: 0.7,
    flex: 1,
    textAlign: 'right',
  },
});

function TaskSeparator() {
  return <View style={styles.separator} />;
}
