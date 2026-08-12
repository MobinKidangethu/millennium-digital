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
import { rfqService } from '@/features/rfq';
import { useBomWorkflowStore } from '@/state';
import { ProtoBadge } from '@/components/ProtoBadge';
import { MDManufacturerLogo } from '@/components/MDManufacturerLogo';
import { MDPrice } from '@/components/MDPrice';
import { MDStockStatus } from '@/components/MDStockStatus';
import { downloadTextFile, toCsv } from '@/utils';
import type { BomMatchResult } from '@/types';

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
  unmatched: { label: 'No Catalog Match', tone: 'error' },
};

export function BomWorkflowContent() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<Step>('input');
  const [text, setText] = useState('');
  const [matches, setMatches] = useState<BomMatchResult[]>([]);
  const [selectedExact, setSelectedExact] = useState<Set<string>>(new Set());
  const [chosenAlternative, setChosenAlternative] = useState<Record<string, number>>({});
  const [creatingRfq, setCreatingRfq] = useState(false);
  const setRfq = useBomWorkflowStore((s) => s.setRfq);
  const setQuote = useBomWorkflowStore((s) => s.setQuote);

  const summary = useMemo(() => bomService.summarizeMatches(matches), [matches]);

  const processBom = async () => {
    const lines = bomService.parseBomText(text);
    if (lines.length === 0) {
      toast.show('Add at least one BOM line before processing.', 'warning');
      return;
    }
    setStep('processing');
    const results = await bomService.matchBomItems(lines);
    setMatches(results);
    setSelectedExact(new Set(results.filter((r) => r.matchType === 'exact').map((r) => r.line.id)));
    const defaultAlt: Record<string, number> = {};
    results
      .filter((r) => r.matchType === 'alternative' && r.alternatives.length > 0)
      .forEach((r) => {
        defaultAlt[r.line.id] = r.alternatives[0].id;
      });
    setChosenAlternative(defaultAlt);
    setStep('results');
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
      const matched =
        result.matchType === 'exact'
          ? result.product
          : result.matchType === 'alternative'
            ? result.alternatives.find((a) => a.id === chosenAlternative[result.line.id])
            : undefined;
      return [
        result.line.designator ?? '',
        result.line.requestedPartNumber,
        String(result.line.quantity),
        MATCH_CONFIG[result.matchType].label,
        matched?.manufacturerPartNumber ?? '',
        matched?.manufacturer ?? '',
        matched ? String(matched.price) : '',
      ];
    });
    const ok = downloadTextFile('BOM-Match-Results.csv', toCsv([header, ...rows]));
    if (!ok) toast.show('Downloads are available on the web app for this prototype.', 'neutral');
  };

  const selectedLineCount =
    Array.from(selectedExact).length + Object.keys(chosenAlternative).filter((id) => matches.find((m) => m.line.id === id && m.matchType === 'alternative')).length;

  const requestQuote = async () => {
    const rfqLines: { product: import('@/types').Product; quantity: number }[] = [];
    for (const result of matches) {
      if (result.matchType === 'exact' && selectedExact.has(result.line.id) && result.product) {
        rfqLines.push({ product: result.product, quantity: result.line.quantity });
      } else if (result.matchType === 'alternative') {
        const chosenId = chosenAlternative[result.line.id];
        const product = result.alternatives.find((a) => a.id === chosenId);
        if (product) rfqLines.push({ product, quantity: result.line.quantity });
      }
    }
    if (rfqLines.length === 0) {
      toast.show('Select at least one component to request a quote.', 'warning');
      return;
    }
    setCreatingRfq(true);
    try {
      const rfq = await rfqService.createRfq(rfqLines, 'bom');
      setRfq(rfq);
      setQuote(null);
      router.push({ pathname: '/(buyer)/rfq/[id]', params: { id: rfq.id } });
    } finally {
      setCreatingRfq(false);
    }
  };

  return (
    <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
          <MDText variant="h1">BOM &amp; Component Matching</MDText>
          <ProtoBadge />
        </View>
        <MDText variant="body" tone="secondary" style={{ marginBottom: spacing.xl, maxWidth: 720 }}>
          Upload a bill of materials to find exact catalog matches, get alternative-part suggestions for close
          matches, and flag anything our engineering team needs to source — then move straight into an RFQ.
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
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl, flexWrap: 'wrap' }}>
              <SummaryPill label="Total Lines" value={summary.total} tone="neutral" />
              <SummaryPill label="Exact Matches" value={summary.exact} tone="success" />
              <SummaryPill label="AI Recommended Alternatives" value={summary.alternative} tone="warning" />
              <SummaryPill label="No Match" value={summary.unmatched} tone="error" />
            </View>

            <View style={{ gap: spacing.md, marginBottom: spacing.xl }}>
              {matches.map((result) => (
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
                    <MDBadge label={MATCH_CONFIG[result.matchType].label} tone={MATCH_CONFIG[result.matchType].tone} />
                  </View>

                  {result.matchType === 'exact' && result.product ? (
                    <Pressable
                      onPress={() =>
                        setSelectedExact((prev) => {
                          const next = new Set(prev);
                          if (next.has(result.line.id)) next.delete(result.line.id);
                          else next.add(result.line.id);
                          return next;
                        })
                      }
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        borderRadius: radius.md,
                        borderWidth: 1,
                        borderColor: selectedExact.has(result.line.id) ? colors.brand.primary : colors.border,
                        backgroundColor: selectedExact.has(result.line.id) ? colors.brand.primarySoft : colors.surface,
                      }}
                    >
                      <Ionicons
                        name={selectedExact.has(result.line.id) ? 'checkbox' : 'square-outline'}
                        size={20}
                        color={selectedExact.has(result.line.id) ? colors.brand.primary : colors.text.tertiary}
                      />
                      <MDManufacturerLogo manufacturer={result.product.manufacturer} width={64} height={16} />
                      <View style={{ flex: 1 }}>
                        <MDText variant="bodySm" weight="600">{result.product.title}</MDText>
                        <MDStockStatus stockStatus={result.product.stockStatus} availability={result.product.availability} />
                      </View>
                      <MDPrice amount={result.product.price} currency={result.product.currency} size="sm" />
                    </Pressable>
                  ) : null}

                  {result.matchType === 'alternative' ? (
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
                            onPress={() => setChosenAlternative((prev) => ({ ...prev, [result.line.id]: alt.id }))}
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
                    </View>
                  ) : null}

                  {result.matchType === 'unmatched' ? (
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
                        onPress={() => router.push('/(buyer)/design-request')}
                      />
                    </View>
                  ) : null}
                </MDCard>
              ))}
            </View>

            <MDCard padding="lg" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.md }}>
              <View>
                <MDText variant="bodyMedium">{selectedLineCount} component{selectedLineCount === 1 ? '' : 's'} selected</MDText>
                <MDText variant="caption" tone="tertiary">Governed pricing is applied once the RFQ is submitted.</MDText>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                <MDButton
                  label="Export Results (.csv)"
                  variant="outline"
                  iconLeft={<Ionicons name="download-outline" size={16} color={colors.brand.primary} />}
                  onPress={exportResults}
                />
                <MDButton label="Request Quote for Selected Items" onPress={requestQuote} loading={creatingRfq} />
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
