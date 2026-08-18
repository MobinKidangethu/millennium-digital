import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  radius,
  spacing,
  useToast,
  MDBadge,
  MDButton,
  MDCard,
  MDInput,
  MDText,
} from '@/design-system';
import { bomService } from '@/features/bom';
import { useCreateRfq } from '@/features/rfq';
import { useBomWorkflowStore, useCartStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { BackorderNote } from '@/components/BackorderNote';
import { downloadTextFile, toCsv, computeBackorderSplit } from '@/utils';
import type { BomDesignRequestLink, BomLineItem, BomLineRouting, BomMatchResult, BomRfqSubmissionLink, Product } from '@/types';

type Step = 'input' | 'processing' | 'results';

const STEP_LABELS: { key: Step; label: string }[] = [
  { key: 'input', label: 'Upload BOM' },
  { key: 'processing', label: 'Component Matching' },
  { key: 'results', label: 'Request Quote' },
];

function StepIndicator({ step }: { step: Step }) {
  const idx = STEP_LABELS.findIndex((s) => s.key === step);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl }}>
      {STEP_LABELS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <View key={s.key} style={{ flexDirection: 'row', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : undefined }}>
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: done || active ? colors.brand.primary : colors.gray[100],
                }}
              >
                {done ? (
                  <Ionicons name="checkmark" size={15} color={colors.gray[0]} />
                ) : (
                  <MDText variant="caption" weight="700" style={{ color: active ? colors.gray[0] : colors.text.tertiary }}>
                    {i + 1}
                  </MDText>
                )}
              </View>
              <MDText variant="caption" weight={active ? '700' : '400'} tone={active ? 'primary' : 'tertiary'} style={{ marginTop: 4 }}>
                {s.label}
              </MDText>
            </View>
            {i < STEP_LABELS.length - 1 ? (
              <View style={{ flex: 1, height: 2, backgroundColor: done ? colors.brand.primary : colors.gray[100], marginHorizontal: spacing.sm, marginBottom: 16 }} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const MATCH_CONFIG: Record<BomMatchResult['matchType'], { label: string; tone: 'success' | 'warning' | 'error' }> = {
  exact: { label: 'Exact Match', tone: 'success' },
  alternative: { label: 'AI Recommended Alternative', tone: 'warning' },
  'ai-suggested': { label: 'AI Suggested Alternate · New Design', tone: 'warning' },
  unmatched: { label: 'No Catalog Match', tone: 'error' },
};

export function BomWorkflowContent() {
  const router = useRouter();
  const toast = useToast();
  const step = useBomWorkflowStore((s) => s.step);
  const setStep = useBomWorkflowStore((s) => s.setStep);
  const text = useBomWorkflowStore((s) => s.text);
  const setText = useBomWorkflowStore((s) => s.setText);
  const matches = useBomWorkflowStore((s) => s.matches);
  const startBomResults = useBomWorkflowStore((s) => s.startBomResults);
  const selectedExactIds = useBomWorkflowStore((s) => s.selectedExactIds);
  const toggleSelectedExact = useBomWorkflowStore((s) => s.toggleSelectedExact);
  const chosenAlternative = useBomWorkflowStore((s) => s.chosenAlternative);
  const chooseAlternativeFor = useBomWorkflowStore((s) => s.chooseAlternativeFor);
  const lineRouting = useBomWorkflowStore((s) => s.lineRouting);
  const setLineRouting = useBomWorkflowStore((s) => s.setLineRouting);
  const designRequestLinks = useBomWorkflowStore((s) => s.designRequestLinks);
  const rfqSubmissionLinks = useBomWorkflowStore((s) => s.rfqSubmissionLinks);
  const linkRfqSubmissions = useBomWorkflowStore((s) => s.linkRfqSubmissions);
  const resetBomWorkflow = useBomWorkflowStore((s) => s.resetBomWorkflow);
  const [addingToCart, setAddingToCart] = useState(false);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);
  const addToCart = useCartStore((s) => s.addItem);
  const createRfq = useCreateRfq();

  const summary = useMemo(() => bomService.summarizeMatches(matches), [matches]);

  /**
   * Every BOM line that currently resolves to a real product — an included
   * exact match, or an alternative/ai-suggested line with a chosen
   * alternative — split by the buyer's Normal Order / RFQ routing choice.
   * Design-request-linked and already-RFQ-submitted lines are excluded:
   * they follow those processes instead, unchanged.
   */
  const resolvedLines = useMemo(() => {
    const resolved: { line: BomLineItem; product: Product }[] = [];
    for (const result of matches) {
      if (designRequestLinks[result.line.id] || rfqSubmissionLinks[result.line.id]) continue;
      if (result.matchType === 'exact' && result.product && selectedExactIds.includes(result.line.id)) {
        resolved.push({ line: result.line, product: result.product });
      } else if (result.matchType === 'alternative' || result.matchType === 'ai-suggested') {
        const product = result.alternatives.find((a) => a.id === chosenAlternative[result.line.id]);
        if (product) resolved.push({ line: result.line, product });
      }
    }
    return resolved;
  }, [matches, selectedExactIds, chosenAlternative, designRequestLinks, rfqSubmissionLinks]);

  const orderLines = useMemo(
    () => resolvedLines.filter((r) => (lineRouting[r.line.id] ?? 'order') === 'order'),
    [resolvedLines, lineRouting],
  );
  const rfqLines = useMemo(
    () => resolvedLines.filter((r) => lineRouting[r.line.id] === 'rfq'),
    [resolvedLines, lineRouting],
  );

  /** Exact-match lines where the requested BOM quantity exceeds current stock — the lead-time / back-order journey. */
  const backorderCount = useMemo(
    () =>
      matches.filter(
        (r) => r.matchType === 'exact' && r.product && computeBackorderSplit(r.line.quantity, r.product.availability ?? 0).hasBackorder,
      ).length,
    [matches],
  );

  const processBom = async () => {
    const lines = bomService.parseBomText(text);
    if (lines.length === 0) {
      toast.show('Add at least one BOM line before processing.', 'warning');
      return;
    }
    setStep('processing');
    const results = await bomService.matchBomItems(lines);
    const defaultExact = results.filter((r) => r.matchType === 'exact').map((r) => r.line.id);
    const defaultAlt: Record<string, number> = {};
    results
      .filter((r) => (r.matchType === 'alternative' || r.matchType === 'ai-suggested') && r.alternatives.length > 0)
      .forEach((r) => {
        defaultAlt[r.line.id] = r.alternatives[0].id;
      });
    startBomResults(results, defaultExact, defaultAlt);
  };

  const startNewBom = () => {
    resetBomWorkflow();
    toast.show('Started a new BOM.', 'neutral');
  };

  /**
   * Sends the unmatched/new-design BOM line's context along to the Design
   * Request form so it can (a) pre-fill the part number/qty and (b) link the
   * submitted request back to this exact line via bomWorkflowStore, and
   * (c) offer a "Back to BOM" return path once submitted.
   */
  const goToDesignRequest = (result: BomMatchResult) => {
    router.push({
      pathname: '/(buyer)/design-request',
      params: {
        bomLineId: result.line.id,
        partNumber: result.line.requestedPartNumber,
        designator: result.line.designator ?? '',
        quantity: String(result.line.quantity),
        returnTo: '/(buyer)/bom',
      },
    });
  };

  const loadSample = () => {
    setText(bomService.SAMPLE_BOM_TEXT);
    toast.show('Sample BOM loaded into the editor.', 'neutral');
  };

  const downloadSample = () => {
    const ok = downloadTextFile('BOM-Template.csv', bomService.SAMPLE_BOM_CSV);
    if (!ok) toast.show('Downloads are available on the web app for this prototype.', 'neutral');
  };

  /**
   * Real file upload: opens the browser's native file picker and reads the
   * selected file's actual contents (no canned data). .csv/.txt are parsed
   * directly. .xlsx is a binary format — parsing it needs a spreadsheet
   * library the production BOM ingestion service would provide, so for
   * this prototype we're upfront that it isn't supported yet rather than
   * silently faking a result.
   */
  const pickFile = () => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      toast.show('File upload is available on the web app for this prototype.', 'neutral');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.txt,.xlsx';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (/\.xlsx$/i.test(file.name)) {
        toast.show(
          `"${file.name}" selected — .xlsx parsing needs a production BOM ingestion service. Export to .csv or paste it below for now.`,
          'warning',
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const content = String(reader.result ?? '');
        setText(content);
        const lineCount = bomService.parseBomText(content).length;
        toast.show(`"${file.name}" loaded — ${lineCount} line${lineCount === 1 ? '' : 's'} detected.`, 'success');
      };
      reader.onerror = () => toast.show(`Could not read "${file.name}".`, 'error');
      reader.readAsText(file);
    };
    input.click();
  };

  const exportResults = () => {
    const header = [
      'Designator',
      'Requested Part Number',
      'Quantity',
      'Match Type',
      'Matched Part Number',
      'Manufacturer',
      'Unit Price',
    ];
    const rows = matches.map((result) => {
      const linked = designRequestLinks[result.line.id];
      const matched =
        linked
          ? undefined
          : result.matchType === 'exact'
            ? result.product
            : result.matchType === 'alternative' || result.matchType === 'ai-suggested'
              ? result.alternatives.find((a) => a.id === chosenAlternative[result.line.id])
              : undefined;
      return [
        result.line.designator ?? '',
        result.line.requestedPartNumber,
        String(result.line.quantity),
        linked ? `Design Request Uploaded (${linked.referenceNumber})` : MATCH_CONFIG[result.matchType].label,
        matched?.manufacturerPartNumber ?? '',
        matched?.manufacturer ?? '',
        matched ? String(matched.price) : '',
      ];
    });
    const ok = downloadTextFile('BOM-Match-Results.csv', toCsv([header, ...rows]));
    if (!ok) toast.show('Downloads are available on the web app for this prototype.', 'neutral');
  };

  const addOrderLinesToCart = () => {
    if (orderLines.length === 0) {
      toast.show('No components are routed to Normal Order yet.', 'warning');
      return;
    }
    setAddingToCart(true);
    orderLines.forEach((r) => addToCart(r.product.id, r.line.quantity));
    setAddingToCart(false);
    toast.show(`${orderLines.length} component${orderLines.length === 1 ? '' : 's'} added to cart.`, 'success');
  };

  const submitRfq = () => {
    if (rfqLines.length === 0) {
      toast.show('No components are routed to RFQ yet.', 'warning');
      return;
    }
    createRfq.mutate(
      { lines: rfqLines.map((r) => ({ product: r.product, quantity: r.line.quantity })), source: 'bom' },
      {
        onSuccess: (rfq) => {
          const links: BomRfqSubmissionLink[] = rfqLines.map((r) => ({
            lineId: r.line.id,
            rfqId: rfq.id,
            rfqNumber: rfq.rfqNumber,
            submittedAt: rfq.createdAt,
          }));
          linkRfqSubmissions(links);
          setRfq(rfq);
          setQuote(null);
          router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } });
        },
      },
    );
  };

  return (
    <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h1">BOM &amp; Component Matching</MDText>
          <ProtoBadge />
        </View>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 720 }}>
          Upload a bill of materials to find exact catalog matches, see back-order / lead-time splits when a line
          exceeds current stock, get AI-suggested alternates for parts that aren't in inventory yet, and flag
          anything engineering needs to source or design — then move straight into an RFQ.
        </MDText>

        <StepIndicator step={step} />

        {step === 'input' ? (
          <MDCard padding="lg">
            <MDText variant="h4" style={{ marginBottom: spacing.sm }}>
              Paste or load a BOM
            </MDText>
            <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.md }}>
              One line per component: Designator, Part Number, Quantity.
            </MDText>
            <MDInput
              value={text}
              onChangeText={setText}
              placeholder={'Q1, IQE036N08NM6SCATMA1, 250\nD1, S07M-M3/H, 1000'}
              multiline
              style={{ marginBottom: spacing.md }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              <MDButton
                label="Upload BOM File (.csv / .txt)"
                variant="outline"
                iconLeft={<Ionicons name="cloud-upload-outline" size={16} color={colors.brand.primary} />}
                onPress={pickFile}
              />
              <MDButton
                label="Download Sample BOM (.csv)"
                variant="ghost"
                iconLeft={<Ionicons name="download-outline" size={16} color={colors.text.secondary} />}
                onPress={downloadSample}
              />
              <MDButton label="Load Sample BOM" variant="ghost" onPress={loadSample} />
              {text.trim().length > 0 ? <MDButton label="Process BOM" onPress={processBom} /> : null}
            </View>
          </MDCard>
        ) : null}

        {step === 'processing' ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['3xl'] }}>
            <ActivityIndicator color={colors.brand.primary} />
            <MDText variant="bodyMedium" style={{ marginTop: spacing.lg }}>
              Parsing BOM and matching components against the live catalog…
            </MDText>
            <MDText variant="bodySm" tone="tertiary" style={{ marginTop: spacing.xs }}>
              Checking part numbers, then part-family alternatives for anything not found exactly.
            </MDText>
          </View>
        ) : null}

        {step === 'results' ? (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
              <MDText variant="bodySm" tone="tertiary">
                Results stay here while you handle a design request — come back to this same BOM any time.
              </MDText>
              <MDButton
                label="Start New BOM"
                size="sm"
                variant="ghost"
                iconLeft={<Ionicons name="refresh-outline" size={14} color={colors.text.secondary} />}
                onPress={startNewBom}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
              <SummaryPill label="Total Lines" value={summary.total} tone="neutral" />
              <SummaryPill label="→ Normal Order" value={orderLines.length} tone="success" />
              <SummaryPill label="→ RFQ / Design Approval" value={rfqLines.length} tone="warning" />
              <SummaryPill label="Exact Matches" value={summary.exact} tone="success" />
              <SummaryPill label="Backordered · Lead Time" value={backorderCount} tone="warning" />
              <SummaryPill label="AI Recommended Alternatives" value={summary.alternative} tone="warning" />
              <SummaryPill label="AI Suggested · New Design" value={summary.aiSuggested} tone="error" />
              <SummaryPill label="No Match" value={summary.unmatched} tone="error" />
              <SummaryPill label="Design Requests Uploaded" value={Object.keys(designRequestLinks).length} tone="success" />
              <SummaryPill label="RFQ Submitted" value={Object.keys(rfqSubmissionLinks).length} tone="success" />
            </View>

            <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
              {matches.map((result) => {
                const designLink = designRequestLinks[result.line.id];
                const rfqLink = rfqSubmissionLinks[result.line.id];
                const badge = designLink
                  ? { label: `Design Request Uploaded · ${designLink.referenceNumber}`, tone: 'success' as const }
                  : rfqLink
                    ? { label: `RFQ Submitted · ${rfqLink.rfqNumber}`, tone: 'success' as const }
                    : MATCH_CONFIG[result.matchType];
                return (
                <MDCard key={result.line.id} padding="lg">
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
                    <View>
                      <MDText variant="bodyMedium">
                        {result.line.designator ? `${result.line.designator} · ` : ''}
                        {result.line.requestedPartNumber}
                      </MDText>
                      <MDText variant="caption" tone="tertiary">
                        Requested Qty {result.line.quantity}
                      </MDText>
                    </View>
                    <MDBadge label={badge.label} tone={badge.tone} />
                  </View>

                  {result.matchType === 'exact' && result.product ? (
                    rfqLink ? (
                      <RfqSubmittedNote link={rfqLink} onTrackStatus={() => router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfqLink.rfqId } })} />
                    ) : (
                    <>
                    <Pressable
                      onPress={() => toggleSelectedExact(result.line.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: selectedExactIds.includes(result.line.id) ? colors.brand.primary : colors.border,
                        backgroundColor: selectedExactIds.includes(result.line.id) ? colors.brand.primarySoft : colors.surface,
                      }}
                    >
                      <Ionicons
                        name={selectedExactIds.includes(result.line.id) ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={selectedExactIds.includes(result.line.id) ? colors.brand.primary : colors.text.tertiary}
                      />
                      <MDManufacturerLogo manufacturer={result.product.manufacturer} width={64} height={16} />
                      <View style={{ flex: 1 }}>
                        <MDText variant="bodySm" weight="600">{result.product.title}</MDText>
                        <MDStockStatus stockStatus={result.product.stockStatus} availability={result.product.availability} />
                        <BackorderNote product={result.product} quantity={result.line.quantity} size="xs" />
                      </View>
                      <MDPrice amount={result.product.price} currency={result.product.currency} size="sm" />
                    </Pressable>
                    {selectedExactIds.includes(result.line.id) ? (
                      <View style={{ marginTop: spacing.sm }}>
                        <RoutingToggle value={lineRouting[result.line.id] ?? 'order'} onChange={(r) => setLineRouting(result.line.id, r)} />
                      </View>
                    ) : null}
                    </>
                    )
                  ) : null}

                  {result.matchType === 'alternative' ? (
                    rfqLink ? (
                      <RfqSubmittedNote link={rfqLink} onTrackStatus={() => router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfqLink.rfqId } })} />
                    ) : (
                    <View style={{ gap: spacing.sm }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="sparkles" size={12} color={colors.brand.teal} />
                        <MDText variant="caption" weight="600" style={{ color: colors.brand.teal }}>
                          Our AI Recommended Alternatives
                        </MDText>
                      </View>
                      <MDText variant="caption" tone="secondary">
                        Not found exactly — same part family, choose one:
                      </MDText>
                      {result.alternatives.map((alt) => {
                        const selected = chosenAlternative[result.line.id] === alt.id;
                        return (
                          <Pressable
                            key={alt.id}
                            onPress={() => chooseAlternativeFor(result.line.id, alt.id)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing.md,
                              padding: spacing.md,
                              borderRadius: radius.md,
                              borderWidth: 1,
                              borderColor: selected ? colors.brand.primary : colors.border,
                              backgroundColor: selected ? colors.brand.primarySoft : colors.surface,
                            }}
                          >
                            <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={selected ? colors.brand.primary : colors.text.tertiary} />
                            <View style={{ flex: 1 }}>
                              <MDText variant="bodySm" weight="600">{alt.manufacturerPartNumber}</MDText>
                              <MDText variant="caption" tone="tertiary">{alt.manufacturer} · {alt.productType}</MDText>
                            </View>
                            <MDPrice amount={alt.price} currency={alt.currency} size="sm" />
                          </Pressable>
                        );
                      })}
                      {chosenAlternative[result.line.id] ? (
                        <RoutingToggle value={lineRouting[result.line.id] ?? 'rfq'} onChange={(r) => setLineRouting(result.line.id, r)} />
                      ) : null}
                    </View>
                    )
                  ) : null}

                  {result.matchType === 'ai-suggested' ? (
                    designLink ? (
                      <DesignRequestLinkedNote link={designLink} onViewRequests={() => router.push('/(buyer)/account/design-requests')} />
                    ) : rfqLink ? (
                      <RfqSubmittedNote link={rfqLink} onTrackStatus={() => router.push({ pathname: '/(buyer)/account/rfq-status/[id]', params: { id: rfqLink.rfqId } })} />
                    ) : (
                    <View style={{ gap: spacing.sm }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          gap: spacing.sm,
                          padding: spacing.md,
                          borderRadius: radius.md,
                          backgroundColor: colors.status.warningSoft,
                        }}
                      >
                        <Ionicons name="sparkles" size={14} color={colors.brand.teal} style={{ marginTop: 2 }} />
                        <MDText variant="bodySm" style={{ color: colors.status.warningStrong, flex: 1 }}>
                          Not found in inventory — this looks like a new product design.{' '}
                          {result.matchReason ?? 'Our AI suggested the closest available components below.'} Choose
                          one to proceed with for now, or submit a Design Request so engineering can source or
                          develop the exact part.
                        </MDText>
                      </View>
                      {result.alternatives.map((alt) => {
                        const selected = chosenAlternative[result.line.id] === alt.id;
                        return (
                          <Pressable
                            key={alt.id}
                            onPress={() => chooseAlternativeFor(result.line.id, alt.id)}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: spacing.md,
                              padding: spacing.md,
                              borderRadius: radius.md,
                              borderWidth: 1,
                              borderColor: selected ? colors.brand.primary : colors.border,
                              backgroundColor: selected ? colors.brand.primarySoft : colors.surface,
                            }}
                          >
                            <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={18} color={selected ? colors.brand.primary : colors.text.tertiary} />
                            <View style={{ flex: 1 }}>
                              <MDText variant="bodySm" weight="600">{alt.manufacturerPartNumber}</MDText>
                              <MDText variant="caption" tone="tertiary">{alt.manufacturer} · {alt.productType}</MDText>
                            </View>
                            <MDPrice amount={alt.price} currency={alt.currency} size="sm" />
                          </Pressable>
                        );
                      })}
                      {chosenAlternative[result.line.id] ? (
                        <RoutingToggle value={lineRouting[result.line.id] ?? 'rfq'} onChange={(r) => setLineRouting(result.line.id, r)} />
                      ) : null}
                      <MDButton
                        label="Submit Design Request Instead"
                        size="sm"
                        variant="outline"
                        iconLeft={<Ionicons name="construct-outline" size={14} color={colors.brand.primary} />}
                        onPress={() => goToDesignRequest(result)}
                      />
                    </View>
                    )
                  ) : null}

                  {result.matchType === 'unmatched' ? (
                    designLink ? (
                      <DesignRequestLinkedNote link={designLink} onViewRequests={() => router.push('/(buyer)/account/design-requests')} />
                    ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.sm,
                        padding: spacing.md,
                        borderRadius: radius.md,
                        backgroundColor: colors.status.errorSoft,
                      }}
                    >
                      <Ionicons name="alert-circle-outline" size={18} color={colors.status.errorStrong} />
                      <MDText variant="bodySm" style={{ color: colors.status.errorStrong, flex: 1 }}>
                        No catalog or family match found for this part.
                      </MDText>
                      <MDButton
                        label="Submit Design Request"
                        size="sm"
                        variant="outline"
                        onPress={() => goToDesignRequest(result)}
                      />
                    </View>
                    )
                  ) : null}
                </MDCard>
                );
              })}
            </View>

            <MDCard padding="lg" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}>
              <View>
                <MDText variant="bodyMedium">
                  {orderLines.length} → Normal Order · {rfqLines.length} → RFQ
                </MDText>
                <MDText variant="caption" tone="tertiary">
                  Normal Order lines go straight to your cart. RFQ lines get governed pricing and full fulfillment tracking in Account → RFQ Order Status.
                </MDText>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                <MDButton
                  label="Export Results (.csv)"
                  variant="outline"
                  iconLeft={<Ionicons name="download-outline" size={16} color={colors.brand.primary} />}
                  onPress={exportResults}
                />
                <MDButton
                  label={`Add to Cart (${orderLines.length})`}
                  variant="outline"
                  iconLeft={<Ionicons name="cart-outline" size={16} color={colors.brand.primary} />}
                  onPress={addOrderLinesToCart}
                  loading={addingToCart}
                  disabled={orderLines.length === 0}
                />
                <MDButton label={`Submit RFQ (${rfqLines.length})`} onPress={submitRfq} loading={createRfq.isPending} disabled={rfqLines.length === 0} />
              </View>
            </MDCard>
          </View>
        ) : null}
    </>
  );
}

export default function BomWorkflow() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: 960, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <BomWorkflowContent />
      </View>
    </ScrollView>
  );
}

/**
 * Buyer-controlled destination for one resolved BOM line — defaults come
 * from bomWorkflowStore.startBomResults (exact -> order, alternative/
 * ai-suggested -> rfq) but the buyer can flip any line either way before
 * submitting. "Normal Order" lines skip RFQ entirely and go straight to
 * cart/checkout; "RFQ" lines get governed pricing and the full
 * sales/procurement/fulfillment stepper tracked in Account -> RFQ Order Status.
 */
function RoutingToggle({ value, onChange }: { value: BomLineRouting; onChange: (routing: BomLineRouting) => void }) {
  return (
    <View style={{ flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', alignSelf: 'flex-start' }}>
      {(['order', 'rfq'] as BomLineRouting[]).map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: 6,
              backgroundColor: active ? colors.brand.primary : 'transparent',
            }}
          >
            <MDText variant="caption" weight="700" style={{ color: active ? colors.gray[0] : colors.text.secondary }}>
              {option === 'order' ? 'Normal Order' : 'RFQ'}
            </MDText>
          </Pressable>
        );
      })}
    </View>
  );
}

function SummaryPill({ label, value, tone }: { label: string; value: number; tone: 'neutral' | 'success' | 'warning' | 'error' }) {
  const toneColor =
    tone === 'success' ? colors.status.successStrong : tone === 'warning' ? colors.status.warningStrong : tone === 'error' ? colors.status.errorStrong : colors.text.primary;
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minWidth: 140 }}>
      <MDText variant="h3" style={{ color: toneColor }}>{value}</MDText>
      <MDText variant="caption" tone="tertiary">{label}</MDText>
    </View>
  );
}

/**
 * Replaces the alternate-picker/"Submit Design Request" controls on a BOM
 * line once a Design Request has actually been submitted for it — makes it
 * explicit that this part number now follows the design-request process
 * (tracked via reference number in My Design Requests) and will NOT be
 * added to the cart/RFQ from this BOM run.
 */
function DesignRequestLinkedNote({ link, onViewRequests }: { link: BomDesignRequestLink; onViewRequests: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.status.successSoft,
      }}
    >
      <Ionicons name="checkmark-circle-outline" size={16} color={colors.status.successStrong} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <MDText variant="bodySm" weight="600" style={{ color: colors.status.successStrong }}>
          Design Request {link.referenceNumber} submitted
        </MDText>
        <MDText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
          This part number follows the design-request process from here — it's excluded from the cart/RFQ for this
          BOM. Track its status in My Design Requests.
        </MDText>
      </View>
      <MDButton label="Track Status" size="sm" variant="ghost" onPress={onViewRequests} />
    </View>
  );
}

/**
 * Replaces the routing controls on a BOM line once it has actually been
 * submitted in an RFQ — makes it explicit this part number is now tracked
 * through the RFQ fulfillment pipeline (Account -> RFQ Order Status) and
 * won't be re-submitted from this BOM run.
 */
function RfqSubmittedNote({ link, onTrackStatus }: { link: BomRfqSubmissionLink; onTrackStatus: () => void }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        padding: spacing.md,
        borderRadius: radius.md,
        backgroundColor: colors.status.successSoft,
      }}
    >
      <Ionicons name="checkmark-circle-outline" size={16} color={colors.status.successStrong} style={{ marginTop: 2 }} />
      <View style={{ flex: 1 }}>
        <MDText variant="bodySm" weight="600" style={{ color: colors.status.successStrong }}>
          Submitted in RFQ {link.rfqNumber}
        </MDText>
        <MDText variant="caption" tone="secondary" style={{ marginTop: 2 }}>
          This component now follows the RFQ fulfillment pipeline — track sales/procurement/shipment progress in
          Account → RFQ Order Status.
        </MDText>
      </View>
      <MDButton label="Track Status" size="sm" variant="ghost" onPress={onTrackStatus} />
    </View>
  );
}
