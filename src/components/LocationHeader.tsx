import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { PressableScale } from './PressableScale';
import { colors, radius, spacing } from '../theme';

interface LocationHeaderProps {
  etaLabel: string;
  addressLabel: string;
  addressDetail: string;
  onAddressPress: () => void;
  onAvatarPress: () => void;
  /** Initials shown in the avatar chip. */
  initials: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Delivery promise + saved address + account entry point.
 * Sits on the brand-coloured header, so everything here is inverse-on-primary.
 */
export const LocationHeader = React.memo(function LocationHeader({
  etaLabel,
  addressLabel,
  addressDetail,
  onAddressPress,
  onAvatarPress,
  initials,
  style,
}: LocationHeaderProps) {
  return (
    <View style={[styles.row, style]}>
      <PressableScale
        onPress={onAddressPress}
        scaleTo={0.98}
        haptic="none"
        accessibilityRole="button"
        accessibilityLabel={`Delivering to ${addressLabel}, ${addressDetail}. Change address`}
        style={styles.addressBlock}
      >
        <View style={styles.etaRow}>
          <Ionicons name="flash" size={15} color={colors.textInverse} />
          <AppText variant="heading2" color="textInverse" style={styles.eta}>
            {etaLabel}
          </AppText>
        </View>

        <View style={styles.addressRow}>
          <AppText variant="bodySmall" numberOfLines={1} style={styles.addressText}>
            <AppText variant="bodySmall" style={styles.addressLabel}>
              {addressLabel}
            </AppText>
            {'  •  '}
            {addressDetail}
          </AppText>
          <Ionicons name="chevron-down" size={14} color={colors.textInverse} style={styles.chevron} />
        </View>
      </PressableScale>

      <PressableScale
        onPress={onAvatarPress}
        scaleTo={0.9}
        accessibilityRole="button"
        accessibilityLabel="Open your profile"
        style={styles.avatar}
      >
        <AppText variant="bodyStrong" color="textInverse">
          {initials}
        </AppText>
      </PressableScale>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  addressBlock: { flex: 1, marginRight: spacing.lg },
  etaRow: { flexDirection: 'row', alignItems: 'center' },
  eta: { marginLeft: spacing.xs },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  addressText: { color: 'rgba(255,255,255,0.86)', flexShrink: 1 },
  addressLabel: { color: colors.textInverse, fontWeight: '700' },
  chevron: { marginLeft: spacing.xs },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
