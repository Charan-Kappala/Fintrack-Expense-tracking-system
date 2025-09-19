import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Rect, G, Text as SvgText, Line as SvgLine } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';
import { Category } from '../types';

const CATEGORY_COLORS: Record<Category, string> = {
  [Category.Food]: '#10B981',
  [Category.Travel]: '#3B82F6',
  [Category.Bills]: '#F97316',
  [Category.Entertainment]: '#8B5CF6',
  [Category.Shopping]: '#EC4899',
  [Category.Health]: '#F59E0B',
  [Category.Other]: '#6B7280',
};

const CHART_HEIGHT = 200;
const BAR_HEIGHT = 18;
const BAR_GAP = 10;
const LEFT_LABEL_WIDTH = 80; // Shifted left
const RIGHT_VALUE_WIDTH = 96; // reserve more room for value labels
const SAFE_RIGHT_PADDING = 36; // keep numeric labels well inside the card

const CategoryChart: React.FC = () => {
  const { state } = useAppContext();
  const [containerWidth, setContainerWidth] = useState(0);
  const { expenses } = state;

  const formatAmount = (n: number) => {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
    if (n >= 100) return `$${Math.round(n).toLocaleString()}`;
    if (Number.isInteger(n)) return `$${n}`;
    return `$${n.toFixed(2)}`;
  };

  const data = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter((expense) => {
      const d = new Date(expense.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totals: Partial<Record<Category, number>> = {};
    monthlyExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    const entries = Object.entries(totals) as [Category, number][];
    const maxVal = entries.reduce((m, [, v]) => (v > m ? v : m), 0);

    return {
      entries,
      maxVal,
    };
  }, [expenses]);

  if (data.entries.length === 0) {
    return (
      <View style={styles.cardEmpty} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}> 
        <Text style={styles.title}>Expense Breakdown</Text>
        <Text style={styles.emptyLine}>No expenses logged for this month yet.</Text>
        <Text style={styles.emptySub}>Your spending categories will appear here once you start adding expenses.</Text>
      </View>
    );
  }

  // Dynamically scale bar height/gap so all rows fit within CHART_HEIGHT
  const rows = data.entries.length;
  const rawHeight = rows * (BAR_HEIGHT + BAR_GAP) + 10;
  const fitScale = rawHeight > CHART_HEIGHT ? CHART_HEIGHT / rawHeight : 1;
  const barH = Math.max(12, Math.floor(BAR_HEIGHT * fitScale));
  const barGap = Math.max(6, Math.floor(BAR_GAP * fitScale));
  const totalHeight = Math.min(CHART_HEIGHT, rows * (barH + barGap) + 10);
  const innerChartWidth = Math.max(0, containerWidth - LEFT_LABEL_WIDTH - RIGHT_VALUE_WIDTH);

  return (
    <View style={styles.card} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <Text style={styles.title}>Expense Breakdown</Text>
      <Svg width={containerWidth || 0} height={Math.max(totalHeight, CHART_HEIGHT)}>
        {/* Subtle Y-axis line, nudged slightly left for visual balance */}
        <SvgLine
          x1={LEFT_LABEL_WIDTH - 4}
          y1={8}
          x2={LEFT_LABEL_WIDTH - 4}
          y2={Math.max(totalHeight, CHART_HEIGHT) - 8}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* Background grid lines */}
        {Array.from({ length: 3 }).map((_, i) => (
          <SvgLine
            key={i}
            x1={LEFT_LABEL_WIDTH + (i * innerChartWidth) / 2}
            y1={8}
            x2={LEFT_LABEL_WIDTH + (i * innerChartWidth) / 2}
            y2={Math.max(totalHeight, CHART_HEIGHT) - 8}
            stroke="#f3f4f6"
            strokeWidth={1}
          />
        ))}
        {data.entries.map(([category, value], idx) => {
          const y = idx * (barH + barGap) + 10;
          const w = data.maxVal > 0 ? (value / data.maxVal) * innerChartWidth : 0;
          const labelFont = Platform.select({ ios: 12, android: 10, default: 12 });
          const valueFont = Platform.select({ ios: 12, android: 8, default: 12 });
          // Always render value outside the bar, aligned to the right edge of the chart area
          const valueX = LEFT_LABEL_WIDTH + innerChartWidth + RIGHT_VALUE_WIDTH - SAFE_RIGHT_PADDING;
          const valueFill = '#374151';
          const valueAnchor = 'end';
          const categoryLabel = category.length > 12 ? category.slice(0, 11) + '…' : category;
          return (
            <G key={category}>
              {/* Left label */}
              <SvgText x={8} y={y + barH - 4} fill="#6b7280" fontSize={labelFont}>
                {categoryLabel}
              </SvgText>
              {/* Bar */}
              <Rect
                x={LEFT_LABEL_WIDTH}
                y={y}
                width={Math.max(0, Math.min(w, innerChartWidth - 10))}
                height={barH}
                rx={6}
                fill={CATEGORY_COLORS[category]}
              />
              {/* Value text */}
              <SvgText
                x={valueX}
                y={y + barH - 4}
                fill={valueFill}
                fontSize={valueFont}
                textAnchor={valueAnchor as any}
                dx={-4}
              >
                {formatAmount(value)}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardEmpty: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  emptyLine: {
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySub: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CategoryChart;
