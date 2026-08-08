import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, useToast, MDBadge, MDInput, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useProductsAdmin, useUpsertProduct } from '@/features/products';
import { LOW_STOCK_THRESHOLD } from '@/features/admin';
import { MDStatsCard } from '@/components/MDStatsCard';
import type { Product } from '@/types';

type FilterTab = 'all' | 'low' | 'out';

export default function Inventory() {
  const toast = useToast();
  const { data: products, isLoading } = useProductsAdmin({});
  const upsertProduct = useUpsertProduct();
  const [tab, setTab] = useState<FilterTab>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const published = useMemo(() => (products ?? []).filter((p) => p.isPublished), [products]);
  const lowStock = published.filter((p) => p.availability > 0 && p.availability < LOW_STOCK_THRESHOLD);
  const outOfStock = published.filter((p) => p.availability === 0 || p.stockStatus.toLowerCase().includes('out'));

  const rows = tab === 'low' ? lowStock : tab === 'out' ? outOfStock : published;

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setDraftValue(String(p.availability));
  };

  const saveEdit = (p: Product) => {
    const value = Number(draftValue);
    if (Number.isNaN(value) || value < 0) {
      toast.show('Enter a valid quantity.', 'warning');
      return;
    }
    upsertProduct.mutate(
      { ...p, availability: value, stockStatus: value === 0 ? 'Out of Stock' : p.stockStatus },
      {
        onSuccess: () => {
          toast.show('Availability updated.', 'success');
          setEditingId(null);
        },
      },
    );
  };

  const columns: MDTableColumn<Product>[] = [
    {
      key: 'part',
      label: 'Part Number',
      width: 220,
      render: (p) => (
        <View>
          <MDText variant="bodySm" weight="600">
            {p.manufacturerPartNumber}
          </MDText>
          <MDText variant="caption" tone="tertiary">
            {p.manufacturer}
          </MDText>
        </View>
      ),
    },
    { key: 'status', label: 'Stock Status', width: 140, render: (p) => <MDText variant="bodySm">{p.stockStatus}</MDText> },
    {
      key: 'availability',
      label: 'Available Quantity',
      width: 220,
      render: (p) =>
        editingId === p.id ? (
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            <MDInput value={draftValue} onChangeText={setDraftValue} keyboardType="numeric" style={{ width: 100 }} />
            <Pressable onPress={() => saveEdit(p)}>
              <Ionicons name="checkmark-circle" size={22} color={colors.status.successStrong} />
            </Pressable>
            <Pressable onPress={() => setEditingId(null)}>
              <Ionicons name="close-circle" size={22} color={colors.text.tertiary} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => startEdit(p)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <MDText variant="bodySm">{p.availability.toLocaleString()}</MDText>
            <Ionicons name="pencil-outline" size={14} color={colors.text.tertiary} />
          </Pressable>
        ),
    },
    {
      key: 'flag',
      label: 'Flag',
      width: 120,
      render: (p) =>
        p.availability === 0 ? (
          <MDBadge label="Out of Stock" tone="error" />
        ) : p.availability < LOW_STOCK_THRESHOLD ? (
          <MDBadge label="Low Stock" tone="warning" />
        ) : (
          <MDBadge label="Healthy" tone="success" />
        ),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Inventory
        </MDText>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
              <MDStatsCard label="Active Products" value={String(published.length)} icon="cube-outline" />
              <MDStatsCard label="Low Stock" value={String(lowStock.length)} icon="alert-circle-outline" tone="warning" />
              <MDStatsCard label="Out of Stock" value={String(outOfStock.length)} icon="close-circle-outline" tone="error" />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
              {(['all', 'low', 'out'] as FilterTab[]).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.pill,
                    backgroundColor: tab === t ? colors.brand.primary : colors.surfaceRaised,
                    borderWidth: 1,
                    borderColor: tab === t ? colors.brand.primary : colors.border,
                  }}
                >
                  <MDText variant="bodySm" weight="600" style={{ color: tab === t ? colors.gray[0] : colors.text.secondary }}>
                    {t === 'all' ? 'All' : t === 'low' ? 'Low Stock' : 'Out of Stock'}
                  </MDText>
                </Pressable>
              ))}
            </View>

            <MDTable columns={columns} data={rows} keyExtractor={(p) => String(p.id)} emptyTitle="Nothing to show" />
          </>
        )}
      </View>
    </ScrollView>
  );
}
