import { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getMondayOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function formatCollapsedLabel(date: Date, today: Date) {
  const monthLabel = MONTH_LABELS[date.getMonth()].toLowerCase();
  return isSameDay(date, today)
    ? `Hoy, ${date.getDate()} de ${monthLabel}`
    : `${date.getDate()} de ${monthLabel}`;
}

interface DateNavigatorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function DateNavigator({ selectedDate, onSelectDate }: DateNavigatorProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(() => getMondayOfWeek(selectedDate));
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekAnchor, index));

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: Spacing.three,
          paddingVertical: Spacing.two,
          paddingHorizontal: Spacing.three,
        }}
      >
        <TouchableOpacity onPress={() => onSelectDate(addDays(selectedDate, -1))} hitSlop={8}>
          <ChevronLeft color={theme.text} size={18} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setExpanded((value) => !value)}>
          <ThemedText type="smallBold">{formatCollapsedLabel(selectedDate, today)}</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onSelectDate(addDays(selectedDate, 1))} hitSlop={8}>
          <ChevronRight color={theme.text} size={18} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: Spacing.three,
            padding: Spacing.three,
            marginTop: Spacing.two,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={() => setWeekAnchor((current) => addDays(current, -7))} hitSlop={8}>
              <ChevronLeft color={theme.text} size={18} />
            </TouchableOpacity>

            <ThemedText type="small" themeColor="textSecondary">
              {MONTH_LABELS[weekAnchor.getMonth()]} {weekAnchor.getFullYear()}
            </ThemedText>

            <TouchableOpacity onPress={() => setWeekAnchor((current) => addDays(current, 7))} hitSlop={8}>
              <ChevronRight color={theme.text} size={18} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.three }}>
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  onPress={() => {
                    onSelectDate(day);
                    setExpanded(false);
                  }}
                  style={{ alignItems: 'center' }}
                >
                  <ThemedText type="small" themeColor="textSecondary">{DAY_LABELS[index]}</ThemedText>

                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      marginTop: Spacing.one,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected ? theme.accent : 'transparent',
                    }}
                  >
                    <ThemedText type="smallBold" style={{ color: isSelected ? '#000' : theme.text }}>
                      {day.getDate()}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}