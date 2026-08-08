import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  useToast,
  MDBadge,
  MDButton,
  MDInput,
  MDPagination,
  MDSkeleton,
  MDTable,
  MDText,
  type MDTableColumn,
} from '@/design-system';
import { useDeleteProduct, useProductsAdmin, useSetProductPublished } from '@/features/products';
import { resolveProductImage } from '@/utils';
import { formatPrice } from '@/utils';
import type { Product } from '@/types';

const PAGE_SIZE = 12;

export default function AdminProducts() {
  const router = useRouter();
  const toast = useToast();
  const { data: products, isLoading } = useProductsAdmin({});
  const setPublished = useSetProductPublished();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.manufacturerPartNumber.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q),
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const allSelected = pageItems.every((p) => selected.has(p.id));
    setSelected((prev) => {
      const next = new Set(prev);
      pageItems.forEach((p) => (allSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });
  };

  const bulkSetPublished = (isPublished: boolean) => {
    selected.forEach((id) => setPublished.mutate({ id, isPublished }));
    toast.show(`${selected.size} product(s) ${isPublished ? 'published' : 'unpublished'}.`, 'success');
    setSelected(new Set());
  };

  const bulkDelete = () => {
    selected.forEach((id) => deleteProduct.mutate(id));
    toast.show(`${selected.size} product(s) deleted.`, 'success');
    setSelected(new Set());
  };

  const columns: MDTableColumn<Product>[] = [
    {
      key: 'select',
      label: '',
      width: 40,
      render: (p) => (
        <Pressable onPress={() => toggleSelect(p.id)}>
          <Checkbox checked={selected.has(p.id)} />
        </Pressable>
      ),
    },
    {
      key: 'image',
      label: '',
      width: 56,
      render: (p) => {
        const source = resolveProductImage(p.image);
        return source ? (
          <Image source={source} style={{ width: 36, height: 36 }} resizeMode="contain" />
        ) : (
          <View style={{ width: 36, height: 36, backgroundColor: colors.gray[100], borderRadius: radius.sm }} />
        );
      },
    },
    {
      key: 'part',
      label: 'Part Number',
      width: 200,
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
    { key: 'category', label: 'Category', width: 140, render: (p) => <MDText variant="bodySm">{p.category}</MDText> },
    { key: 'price', label: 'Price', width: 100, render: (p) => <MDText variant="bodySm">{formatPrice(p.price, p.currency)}</MDText> },
    {
      key: 'stock',
      label: 'Stock',
      width: 100,
      render: (p) => <MDText variant="bodySm">{p.availability.toLocaleString()}</MDText>,
    },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      render: (p) => <MDBadge label={p.isPublished ? 'Published' : 'Draft'} tone={p.isPublished ? 'success' : 'neutral'} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 220,
      render: (p) => (
        <View style={{ flexDirection: 'row', gap: spacing.xs }}>
          <MDButton
            label="Edit"
            size="sm"
            variant="outline"
            onPress={() => router.push({ pathname: '/(admin)/products/[id]/edit', params: { id: String(p.id) } })}
          />
          <MDButton
            label={p.isPublished ? 'Unpublish' : 'Publish'}
            size="sm"
            variant="ghost"
            onPress={() => setPublished.mutate({ id: p.id, isPublished: !p.isPublished })}
          />
        </View>
      ),
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl }}>
          <MDText variant="h1">Products</MDText>
          <MDButton
            label="Add Product"
            iconLeft={<Ionicons name="add" size={16} color={colors.gray[0]} />}
            onPress={() => router.push('/(admin)/products/new')}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
          <MDInput
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by part number, manufacturer, or title…"
            style={{ flex: 1, maxWidth: 420 }}
          />
          <MDText variant="bodySm" tone="secondary">
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </MDText>
        </View>

        {selected.size > 0 ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <MDText variant="bodySm" weight="600">
              {selected.size} selected
            </MDText>
            <MDButton label="Publish" size="sm" variant="outline" onPress={() => bulkSetPublished(true)} />
            <MDButton label="Unpublish" size="sm" variant="outline" onPress={() => bulkSetPublished(false)} />
            <MDButton label="Delete" size="sm" variant="danger" onPress={bulkDelete} />
          </View>
        ) : (
          <Pressable onPress={toggleSelectAllOnPage} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <Checkbox checked={pageItems.length > 0 && pageItems.every((p) => selected.has(p.id))} />
            <MDText variant="bodySm" tone="secondary">
              Select all on page
            </MDText>
          </Pressable>
        )}

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : (
          <>
            <MDTable
              columns={columns}
              data={pageItems}
              keyExtractor={(p) => String(p.id)}
              emptyTitle="No products match your search"
            />
            <MDPagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View
      style={{
        width: 18,
        height: 18,
        borderRadius: radius.sm - 2,
        borderWidth: 1.5,
        borderColor: checked ? colors.brand.primary : colors.borderStrong,
        backgroundColor: checked ? colors.brand.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Ionicons name="checkmark" size={13} color={colors.gray[0]} /> : null}
    </View>
  );
}
