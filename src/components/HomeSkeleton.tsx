import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Skeleton } from './Skeleton';
import { layout, radius, spacing } from '../theme';

const RAIL_CARDS = [0, 1, 2];

function RailSkeleton() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Skeleton width={168} height={18} />
        <Skeleton width={52} height={13} />
      </View>

      <View style={styles.rail}>
        {RAIL_CARDS.map((i) => (
          <View key={i} style={[styles.card, { width: layout.productCardWidth }]}>
            <Skeleton
              width="100%"
              height={layout.productImageHeight + spacing.xl}
              borderRadius={radius.sm}
            />
            <Skeleton width="85%" height={12} style={styles.line} />
            <Skeleton width="55%" height={12} style={styles.line} />
            <View style={styles.cardFooter}>
              <Skeleton width={48} height={16} />
              <Skeleton width={62} height={30} borderRadius={radius.sm} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/**
 * Mirrors the real Home layout so the transition from loading to loaded does not
 * shift anything on screen.
 */
export function HomeSkeleton() {
  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <Skeleton width="100%" height={62} borderRadius={radius.md} style={styles.banner} />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Skeleton width={120} height={18} />
        </View>
        <View style={styles.rail}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={{ width: layout.categoryTileWidth }}>
              <Skeleton
                width={layout.categoryTileWidth}
                height={layout.categoryTileWidth}
                borderRadius={radius.md}
              />
              <Skeleton width="80%" height={11} style={styles.line} />
            </View>
          ))}
        </View>
      </View>

      <RailSkeleton />
      <RailSkeleton />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxxl },
  banner: { marginHorizontal: layout.gutter, marginBottom: spacing.xxl },
  section: { marginBottom: spacing.xxl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.gutter,
    marginBottom: spacing.lg,
  },
  rail: { flexDirection: 'row', paddingHorizontal: layout.gutter, gap: spacing.md },
  card: { gap: spacing.sm },
  line: { marginTop: spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
