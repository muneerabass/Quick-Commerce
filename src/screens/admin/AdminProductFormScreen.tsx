import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppText, Button, Input, PressableScale, ProductImage } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { pickAndUploadProductImage } from '../../services/uploadService';
import { rupeesToPaise, paiseToRupees } from '../../utils/price';
import { colors, layout, radius, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'ProductForm'>;

interface FormState {
  name: string;
  description: string;
  priceRupees: string;
  imageUrl: string;
  categoryId: string | null;
}

const EMPTY: FormState = { name: '', description: '', priceRupees: '', imageUrl: '', categoryId: null };

export function AdminProductFormScreen({ navigation, route }: Props) {
  const editingId = route.params?.productId;
  const { products, categories, saveProduct, setInventoryFor, activeStore } = useAdmin();
  const existing = editingId ? products.find((p) => p.id === editingId) : undefined;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stockRupees, setStockRupees] = useState<string>('');

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      description: existing.description ?? '',
      priceRupees: String(paiseToRupees(existing.price)),
      imageUrl: existing.image_url ?? '',
      categoryId: existing.category_id ?? null,
    });
    setStockRupees(String(existing.quantity ?? 0));
  }, [existing]);

  const handleSubmit = useCallback(async () => {
    if (!form.name.trim() || !form.priceRupees.trim()) {
      Alert.alert('Missing fields', 'Please fill in name and price.');
      return;
    }
    const priceRupees = Number(form.priceRupees);
    if (Number.isNaN(priceRupees) || priceRupees < 0) {
      Alert.alert('Invalid price', 'Price must be a non-negative number.');
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await saveProduct(
        {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: rupeesToPaise(priceRupees),
          image_url: form.imageUrl.trim() || null,
          category_id: form.categoryId,
        },
        existing?.id,
      );
      if (activeStore && stockRupees.trim() !== '') {
        const parsedStock = Number(stockRupees);
        if (!Number.isNaN(parsedStock) && parsedStock >= 0) {
          await setInventoryFor(saved.id, Math.round(parsedStock));
        }
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save product', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeStore, existing?.id, form, navigation, saveProduct, setInventoryFor, stockRupees]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <PressableScale onPress={() => navigation.goBack()} scaleTo={0.9} haptic="none" style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
        <AppText variant="heading2" style={styles.title}>
          {existing ? 'Edit product' : 'Add product'}
        </AppText>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Input label="Name" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="e.g. Toned Milk 1L" />
          <Input label="Description" value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="Optional" />
          <Input label="Price (₹)" value={form.priceRupees} onChangeText={(v) => setForm({ ...form, priceRupees: v })} keyboardType="decimal-pad" />

          <AppText variant="captionStrong" color="textSecondary" style={styles.label}>
            IMAGE
          </AppText>
          <View style={styles.imageRow}>
            <ProductImage uri={form.imageUrl || null} fallbackText={form.name || '?'} size={88} radiusToken="md" />
            <View style={styles.imageActions}>
              <Button
                label={form.imageUrl ? 'Replace image' : 'Pick from library'}
                variant="secondary"
                size="sm"
                icon="image-outline"
                onPress={async () => {
                  setIsUploading(true);
                  try {
                    const url = await pickAndUploadProductImage();
                    if (url) setForm((prev) => ({ ...prev, imageUrl: url }));
                  } catch (error) {
                    Alert.alert('Upload failed', error instanceof Error ? error.message : 'Try again.');
                  } finally {
                    setIsUploading(false);
                  }
                }}
                loading={isUploading}
              />
              {form.imageUrl ? (
                <Button
                  label="Clear"
                  variant="ghost"
                  size="sm"
                  onPress={() => setForm((prev) => ({ ...prev, imageUrl: '' }))}
                />
              ) : null}
            </View>
          </View>
          <Input
            label="Image URL (or paste)"
            value={form.imageUrl}
            onChangeText={(v) => setForm({ ...form, imageUrl: v })}
            placeholder="https://… (auto-filled after upload)"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <AppText variant="captionStrong" color="textSecondary" style={styles.label}>
            CATEGORY
          </AppText>
          <View style={styles.categoryWrap}>
            <PressableScale
              onPress={() => setForm({ ...form, categoryId: null })}
              scaleTo={0.96}
              haptic="none"
              style={[styles.categoryChip, !form.categoryId && styles.categoryChipActive]}
            >
              <AppText variant="caption" color={!form.categoryId ? 'primary' : 'textSecondary'}>
                Uncategorised
              </AppText>
            </PressableScale>
            {categories.map((cat) => (
              <PressableScale
                key={cat.id}
                onPress={() => setForm({ ...form, categoryId: cat.id })}
                scaleTo={0.96}
                haptic="none"
                style={[styles.categoryChip, form.categoryId === cat.id && styles.categoryChipActive]}
              >
                <AppText variant="caption" color={form.categoryId === cat.id ? 'primary' : 'textSecondary'}>
                  {cat.name}
                </AppText>
              </PressableScale>
            ))}
          </View>

          {activeStore ? (
            <>
              <AppText variant="captionStrong" color="textSecondary" style={styles.label}>
                INVENTORY · {activeStore.name}
              </AppText>
              <Input label="Stock quantity" value={stockRupees} onChangeText={setStockRupees} keyboardType="number-pad" placeholder="e.g. 50" />
            </>
          ) : (
            <AppText variant="caption" color="textTertiary" style={styles.hint}>
              Pick an active store to set inventory for this product.
            </AppText>
          )}

          <Button label={existing ? 'Save changes' : 'Create product'} onPress={handleSubmit} loading={isSubmitting} style={styles.submit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: layout.gutter, paddingVertical: spacing.lg },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  title: { flex: 1 },
  content: { paddingHorizontal: layout.gutter, paddingBottom: spacing.xxxl },
  label: { marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: 1 },
  categoryWrap: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  imageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  imageActions: { flex: 1, gap: spacing.sm },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.canvas },
  categoryChipActive: { backgroundColor: colors.primarySoft },
  hint: { marginTop: spacing.md },
  submit: { marginTop: spacing.xl },
});
