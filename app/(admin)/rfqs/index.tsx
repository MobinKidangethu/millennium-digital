import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing, MDBadge, MDInput, MDPagination, MDSkeleton, MDTable, MDText, type MDTableColumn } from '@/design-system';
import { useRfqs } from '@/features/rfq';
import { RFQ_STAGES, RFQ_STAGE_LABEL, RFQ_STATUS_TONE } from '@/constants/rfqLifecycle';
import type { Rfq, RfqStatus } from '@/types';

const STATUS_TABS: (RfqStatus | 'all')[] = ['all', ...RFQ_STAGES.map((s) => s.key), 'cancelled'];
const PAGE_SIZE = 10;

const SOURCE_LABEL: Record<string, string> = {
  bom: 'BOM Component Matching',
  'ai-search': 'AI Engineering Search',
  manual: 'Manual Request',
  cart: 'Cart',
};

export default function AdminRfqs() {
  const router = useRouter();
  const { data: rfqs, isLoading } = useRfqs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RfqStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!rfqs) return [];
    let result = rfqs;
    if (statusFilter !== 'all') result = result.filter((r) => r.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) result = result.filter((r) => r.rfqNumber.toLowerCase().includes(q));
    return result;
  }, [rfqs, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search, rfqs]);

  const columns: MDTableColumn<Rfq>[] = [
    { key: 'rfq', label: 'RFQ', width: 160, render: (r) => <MDText variant="bodySm" weight="600">{r.rfqNumber}</MDText> },
    { key: 'source', label: 'Source', width: 180, render: (r) => <MDText variant="bodySm">{SOURCE_LABEL[r.source] ?? r.source}</MDText> },
    {
      key: 'date',
      label: 'Submitted',
      width: 120,
      render: (r) => <MDText variant="bodySm">{new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</MDText>,
    },
    { key: 'lines', label: 'Lines', width: 70, render: (r) => <MDText variant="bodySm">{r.lines.length}</MDText> },
    { key: 'status', label: 'Stage', width: 220, render: (r) => <MDBadge label={RFQ_STAGE_LABEL[r.status]} tone={RFQ_STATUS_TONE[r.status]} /> },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          RFQs
        </MDText>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.lg, maxWidth: 640 }}>
          Advance each RFQ through sales/procurement/fulfillment. Buyers see this same progress in Account → RFQ
          Order Status.
        </MDText>

        <MDInput value={search} onChangeText={setSearch} placeholder="Search by RFQ number…" style={{ maxWidth: 420, marginBottom: spacing.lg }} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {STATUS_TABS.map((status) => (
              <Pressable
                key={status}
                onPress={() => setStatusFilter(status)}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  backgroundColor: statusFilter === status ? colors.brand.primary : colors.surfaceRaised,
                  borderWidth: 1,
                  borderColor: statusFilter === status ? colors.brand.primary : colors.border,
                }}
              >
                <MDText variant="bodySm" weight="600" style={{ color: statusFilter === status ? colors.gray[0] : colors.text.secondary }}>
                  {status === 'all' ? 'All' : RFQ_STAGE_LABEL[status]}
                </MDText>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {isLoading ? (
          <MDSkeleton height={400} />
        ) : (
          <>
            <MDTable
              columns={columns}
              data={paged}
              keyExtractor={(r) => r.id}
              onRowPress={(r) => router.push({ pathname: '/(admin)/rfqs/[id]', params: { id: r.id } })}
              emptyTitle="No RFQs found"
            />
            <MDPagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </View>
    </ScrollView>
  );
}
