import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Polyline, Line as SvgLine, G, Text as SvgText, Circle } from 'react-native-svg';
import { useAppContext } from '../context/AppContext';

const CHART_HEIGHT = 200;
const PADDING_LEFT = 40;
const PADDING_RIGHT = 20; // increased to keep last x-tick label inside
const PADDING_TOP = 16;
const PADDING_BOTTOM = 24;

// Compute "nice" axis ticks for prettier labels (e.g., 0, 500, 1000, 1500)
function niceNumber(range: number, round: boolean) {
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / Math.pow(10, exponent);
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function niceScale(max: number, tickCount: number) {
  const niceMax = niceNumber(max, false);
  const step = niceNumber(niceMax / (tickCount - 1), true);
  const scaledMax = step * (tickCount - 1);
  const ticks = Array.from({ length: tickCount }, (_, i) => i * step);
  return { ticks, niceMax: scaledMax };
}

const SpendingTimeline: React.FC = () => {
  const { state } = useAppContext();
  const { expenses } = state;
  const [isCumulative, setIsCumulative] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  const { data, hasData, maxAmount, currentDay, monthName } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const dailyTotals: Record<number, number> = {};
    for (let d = 1; d <= daysInMonth; d++) dailyTotals[d] = 0;

    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        dailyTotals[d.getDate()] += e.amount;
      }
    });

    let cumulative = 0;
    const data = [] as { day: number; amount: number; cumulative: number }[];
    for (let d = 1; d <= daysInMonth; d++) {
      cumulative += dailyTotals[d];
      data.push({ day: d, amount: dailyTotals[d], cumulative });
    }

    const hasData = data.some((x) => x.amount > 0);
    const maxAmount = Math.max(1, ...data.map((x) => x.amount));
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return { data, hasData, maxAmount, currentDay, monthName };
  }, [expenses]);

  if (!hasData) {
    return (
      <View style={styles.cardEmpty}>
        <Text style={styles.title}>Daily Spending Timeline</Text>
        <Text style={styles.emptyLine}>No expenses recorded this month yet.</Text>
        <Text style={styles.emptySub}>Your daily spending pattern will appear here once you start adding expenses.</Text>
      </View>
    );
  }

  const innerWidth = Math.max(0, containerWidth - PADDING_LEFT - PADDING_RIGHT);
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const maxY = isCumulative ? data[data.length - 1].cumulative : Math.max(1, ...data.map((d) => d.amount));
  const { ticks: yTicks, niceMax } = useMemo(() => niceScale(maxY, 5), [maxY]);

  const points = data.map((d) => {
    const x = PADDING_LEFT + ((d.day - 1) / (data.length - 1)) * innerWidth;
    const yVal = isCumulative ? d.cumulative : d.amount;
    const y = PADDING_TOP + innerHeight - (yVal / niceMax) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <View style={styles.card} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Daily Spending Timeline</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.toggle, !isCumulative ? styles.toggleActive : null]}
            onPress={() => setIsCumulative(false)}
          >
            <Text style={[styles.toggleText, !isCumulative ? styles.toggleTextActive : null]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, isCumulative ? styles.toggleActive : null]}
            onPress={() => setIsCumulative(true)}
          >
            <Text style={[styles.toggleText, isCumulative ? styles.toggleTextActive : null]}>Cumulative</Text>
          </TouchableOpacity>
          <View style={styles.monthPill}>
            <Text style={styles.monthPillText}>{monthName}</Text>
          </View>
        </View>
      </View>

      <Svg width={containerWidth || 0} height={CHART_HEIGHT}>
        {/* Grid lines */}
        {yTicks.map((val, i) => {
          const y = PADDING_TOP + (1 - (val / niceMax)) * innerHeight;
          return (
            <SvgLine key={i} x1={PADDING_LEFT} y1={y} x2={PADDING_LEFT + innerWidth} y2={y} stroke="#f0f0f0" strokeDasharray="3 3" />
          );
        })}

        {/* Axes */}
        <SvgLine
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={PADDING_TOP + innerHeight}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <SvgLine
          x1={PADDING_LEFT}
          y1={PADDING_TOP + innerHeight}
          x2={PADDING_LEFT + innerWidth}
          y2={PADDING_TOP + innerHeight}
          stroke="#e5e7eb"
          strokeWidth={1}
        />

        {/* X-axis ticks: target ~6 labels across */}
        {data.map((d, idx) => {
          const step = Math.max(1, Math.ceil(data.length / 6));
          if (d.day % step !== 0 && d.day !== data.length) return null;
          const x = PADDING_LEFT + ((d.day - 1) / (data.length - 1)) * innerWidth;
          return (
            <G key={`x-${idx}`}>
              <SvgLine x1={x} y1={PADDING_TOP + innerHeight} x2={x} y2={PADDING_TOP + innerHeight + 4} stroke="#9ca3af" />
              <SvgText
                x={x}
                y={PADDING_TOP + innerHeight + 16}
                fill="#6b7280"
                fontSize={Platform.select({ android: 8, ios: 10, default: 10 }) as number}
                textAnchor={d.day === data.length ? 'end' : 'middle'}
                dx={d.day === data.length ? -4 : 0}
              >
                {d.day}
              </SvgText>
            </G>
          );
        })}

        {/* Y-axis labels (no currency symbol) */}
        {yTicks.map((val, i) => {
          const y = PADDING_TOP + (1 - (val / niceMax)) * innerHeight;
          const label = Math.round(val).toLocaleString();
          return (
            <SvgText key={`y-${i}`} x={PADDING_LEFT - 6} y={y + 4} fill="#6b7280" fontSize={Platform.select({ android: 8, ios: 10, default: 10 }) as number} textAnchor="end">{label}</SvgText>
          );
        })}

        {/* Line */}
        <Polyline
          points={points}
          fill="none"
          stroke={isCumulative ? '#10B981' : '#3B82F6'}
          strokeWidth={2}
        />

        {/* Today dot */}
        {(() => {
          const d = data[currentDay - 1];
          const x = PADDING_LEFT + ((d.day - 1) / (data.length - 1)) * Math.max(10, innerWidth);
          const yVal = isCumulative ? d.cumulative : d.amount;
          const y = PADDING_TOP + innerHeight - (yVal / niceMax) * innerHeight;
          return <Circle cx={x} cy={y} r={5} fill="#EF4444" />
        })()}
      </Svg>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: isCumulative ? '#10B981' : '#3B82F6' }]} />
          <Text style={styles.legendText}>{isCumulative ? 'Cumulative Spending' : 'Daily Spending'}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </View>
  );
};

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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleText: {
    fontSize: 12,
    color: '#6b7280',
  },
  toggleTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  monthPill: {
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthPillText: {
    fontSize: 12,
    color: '#6b7280',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SpendingTimeline;
