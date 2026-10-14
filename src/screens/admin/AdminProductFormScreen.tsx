import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { AppText, Button, Input, PressableScale, ProductImage } from '../../components';
import { useAdmin } from '../../context/AdminContext';
import { pickAndUploadProductImages } from '../../services/uploadService';
import { rupeesToPaise, paiseToRupees } from '../../utils/price';
import { colors, layout, radius, spacing } from '../../theme';
import type { AdminStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'ProductForm'>;

const MAX_IMAGES = 6;

interface FormState {
  name: string;
  description: string;
  priceRupees: string;
  images: string[];
  categoryId: string | null;
}

const EMPTY: FormState = { name: '', description: '', priceRupees: '', images: [], categoryId: null };

export function AdminProductFormScreen({ navigation, route }: Props) {
  const editingId = route.params?.productId;
  const { products, categories, saveProduct, setInventoryFor, activeStore } = useAdmin();
  const existing = editingId ? products.find((p) => p.id === editingId) : undefined;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stockQty, setStockQty] = useState<string>('');

  useEffect(() => {
    if (!existing) return;
    const images = existing.images?.length ? existing.images : existing.image_url ? [existing.image_url] : [];
    setForm({
      name: existing.name,
      description: existing.description ?? '',
      priceRupees: String(paiseToRupees(existing.price)),
      images,
      categoryId: existing.category_id ?? null,
    });
    setStockQty(String(existing.quantity ?? 0));
  }, [existing]);

  const addPhotos = useCallback(async () => {
    const remaining = MAX_IMAGES - form.images.length;
    if (remaining <= 0) {
      Alert.alert('Limit reached', `You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    setIsUploading(true);
    try {
      const urls = await pickAndUploadProductImages(remaining);
      if (urls.length) setForm((prev) => ({ ...prev, images: [...prev.images, ...urls].slice(0, MAX_IMAGES) }));
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setIsUploading(false);
    }
  }, [form.images.length]);

  const removeImage = useCallback((url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));
  }, []);

  const makeCover = useCallback((url: string) => {
    setForm((prev) => ({ ...prev, images: [url, ...prev.images.filter((u) => u !== url)] }));
  }, []);

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
    if (!existing && !activeStore) {
      Alert.alert('No store selected', 'Pick an active store before adding a product.');
      return;
    }
    setIsSubmitting(true);
    try {
      const saved = await saveProduct(
        {
          name: form.name.trim(),
          description: form.description.trim() || null,
          price: rupeesToPaise(priceRupees),
          images: form.images,
          image_url: form.images[0] ?? null,
          category_id: form.categoryId,
        },
        existing?.id,
      );
      if (activeStore && stockQty.trim() !== '') {
        const parsedStock = Number(stockQty);
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
  }, [activeStore, existing, form, navigation, saveProduct, setInventoryFor, stockQty]);

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
            PHOTOS · {form.images.length}/{MAX_IMAGES}
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
            keyboardShouldPersistTaps="handled"
          >
            {form.images.map((url, index) => (
              <Animated.View
                key={url}
                entering={FadeIn.duration(180)}
                exiting={FadeOut.duration(140)}
                layout={LinearTransition.duration(200)}
                style={styles.thumbWrap}
              >
                <PressableScale onPress={() => makeCover(url)} scaleTo={0.95} haptic="light">
                  <ProductImage uri={url} fallbackText={form.name || '?'} size={96} radiusToken="lg" />
                </PressableScale>
                {index === 0 ? (
                  <View style={styles.coverBadge}>
                    <AppText variant="overline" style={styles.coverBadgeText}>
                      COVER
                    </AppText>
                  </View>
                ) : null}
                <PressableScale onPress={() => removeImage(url)} scaleTo={0.85} haptic="medium" style={styles.removeBtn}>
                  <Ionicons name="close" size={14} color={colors.background} />
                </PressableScale>
              </Animated.View>
            ))}
            {form.images.length < MAX_IMAGES ? (
              <Animated.View layout={LinearTransition.duration(200)}>
                <PressableScale onPress={addPhotos} scaleTo={0.95} haptic="light" style={styles.addTile} disabled={isUploading}>
                  <Ionicons name={isUploading ? 'cloud-upload-outline' : 'add'} size={26} color={colors.primary} />
                  <AppText variant="caption" color="primary" style={styles.addTileLabel}>
                    {isUploading ? 'Uploading…' : 'Add photos'}
                  </AppText>
                </PressableScale>
              </Animated.View>
            ) : null}
          </ScrollView>
          <AppText variant="caption" color="textTertiary" style={styles.hint}>
            Tap a photo to make it the cover. First image is shown on the storefront.
          </AppText>

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
              <Input label="Stock quantity" value={stockQty} onChangeText={setStockQty} keyboardType="number-pad" placeholder="e.g. 50" />
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
  thumbStrip: { gap: spacing.md, paddingVertical: spacing.xs, paddingRight: spacing.md },
  thumbWrap: { position: 'relative' },
  coverBadge: {
    position: 'absolute',
    left: spacing.xs,
    bottom: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 1,
  },
  coverBadgeText: { color: colors.background, fontSize: 9 },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  addTileLabel: { marginTop: spacing.xxs },
  categoryChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: colors.canvas },
  categoryChipActive: { backgroundColor: colors.primarySoft },
  hint: { marginTop: spacing.sm },
  submit: { marginTop: spacing.xl },
});
