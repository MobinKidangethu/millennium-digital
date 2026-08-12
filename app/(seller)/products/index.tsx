import { useMemo, useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  MDBadge,
  MDButton,
  MDEmptyState,
  MDInput,
  MDPagination,
  MDSkeleton,
  MDTable,
  MDText,
  type MDTableColumn,
} from '@/design-system';
import { useSellerProducts } from '@/features/sellers';
import { useAuthStore, useCurrencyStore, useGovernanceStore } from '@/state';
import { GOVERNANCE_STAGE_LABEL } from '@/features/governance/service';
import { resolveProductImage, formatDisplayPrice } from '@/utils';
import type { GovernanceStage, Product } from '@/types';

const PAGE_SIZE = 10;

function stageTone(stage: GovernanceStage): 'success' | 'brand' | 'neutral' | 'warning' {
  if (stage === 'published') return 'success';
  if (stage === 'draft') return 'neutral';
  return 'brand';
}

export default function SellerProducts() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const { data: products, isLoading } = useSellerProducts(manufacturers);
  const getRecord = useGovernanceStore((s) => s.getRecord);
  const advance = useGovernanceStore((s) => s.advance);
  const displayCurrency = useCurrencyStore((s) => s.currency);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  // Bumping this forces a re-render after a governance advance (the store
  // mutation itself doesn't change `products`, only the per-row stage read).
  const [, forceRerender] = useState(0);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.manufacturerPartNumber.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdvance = (product: Product) => {
    advance('product', String(product.id), 'Maker');
    forceRerender((n) => n + 1);
  };

  const columns: MDTableColumn<Product>[] = [
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
          <MDText variant="caption" tone="tertiary" numberOfLines={1}>
            {p.title}
          </MDText>
        </View>
      ),
    },
    { key: 'category', label: 'Category', width: 140, render: (p) => <MDText variant="bodySm">{p.category}</MDText> },
    { key: 'price', label: 'Price', width: 100, render: (p) => <MDText variant="bodySm">{formatDisplayPrice(p.price, p.currency, displayCurrency)}</MDText> },
    { key: 'stock', label: 'Stock', width: 90, render: (p) => <MDText variant="bodySm">{p.availability.toLocaleString()}</MDText> },
    {
      key: 'status',
      label: 'Governance Status',
      width: 200,
      render: (p) => {
        const stage = getRecord('product', String(p.id)).stage;
        return <MDBadge label={GOVERNANCE_STAGE_LABEL[stage]} tone={stageTone(stage)} />;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 260,
      render: (p) => {
        const stage = getRecord('product', String(p.id)).stage;
        return (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' }}>
            <MDButton
              label="Edit"
              size="sm"
              variant="outline"
              onPress={() => router.push({ pathname: '/(seller)/products/[id]/edit', params: { id: String(p.id) } })}
            />
            {stage === 'draft' ? (
              <MDButton label="Submit for Review" size="sm" onPress={() => handleAdvance(p)} />
            ) : stage === 'submitted' ? (
              <MDButton label="Confirm Ready for Review" size="sm" onPress={() => handleAdvance(p)} />
            ) : stage === 'published' ? null : (
              <MDText variant="caption" tone="tertiary">
                Awaiting Millennium Digital review
              </MDText>
            )}
          </View>
        );
      },
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
          <MDText variant="h1">My Products</MDText>
          <MDButton
            label="Add Product"
            iconLeft={<Ionicons name="add" size={16} color={colors.gray[0]} />}
            onPress={() => router.push('/(seller)/products/new')}
          />
        </View>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg }}>
          Listings for {manufacturers.join(', ') || 'your brand'}. New and edited listings go live only after
          Maker-Checker review — see status per product below.
        </MDText>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
          <MDInput
            value={search}
            onChangeText={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search by part number or title…"
            style={{ flex: 1, maxWidth: 420 }}
          />
          <MDText variant="bodySm" tone="secondary">
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </MDText>
        </View>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : filtered.length === 0 ? (
          <MDEmptyState
            icon={<Ionicons name="cube-outline" size={40} color={colors.text.tertiary} />}
            title="No products yet"
            description="Add your first product listing to start selling on Millennium Digital."
            actionLabel="Add Product"
            onAction={() => router.push('/(seller)/products/new')}
          />
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
