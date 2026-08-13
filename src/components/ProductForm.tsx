import { useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, MDButton, MDInput, MDSwitch, MDText } from '@/design-system';
import { PRODUCT_IMAGES } from '@/constants/productImages';
import type { ProductTag } from '@/types';

export interface ProductFormValues {
  manufacturer: string;
  manufacturerPartNumber: string;
  mdPartNumber: string;
  title: string;
  description: string;
  category: string;
  productType: string;
  technology: string;
  mountingStyle: string;
  package: string;
  price: string;
  currency: string;
  availability: string;
  stockStatus: string;
  stockType: string;
  quantity: string;
  rohs: boolean;
  rohsLabel: string;
  lifecycle: string;
  datasheet: string;
  productUrl: string;
  image: string;
  tags: ProductTag[];
  isPublished: boolean;
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  manufacturer: '',
  manufacturerPartNumber: '',
  mdPartNumber: '',
  title: '',
  description: '',
  category: 'Evaluation Board',
  productType: '',
  technology: 'Si',
  mountingStyle: 'SMD/SMT',
  package: '',
  price: '',
  currency: 'INR',
  availability: '0',
  stockStatus: 'In Stock',
  stockType: 'Stock',
  quantity: '1',
  rohs: true,
  rohsLabel: 'RoHS Compliant',
  lifecycle: 'New Product',
  datasheet: '',
  productUrl: '',
  image: Object.keys(PRODUCT_IMAGES)[0],
  tags: [],
  isPublished: true,
};

const ALL_TAGS: ProductTag[] = ['new', 'featured', 'best-seller'];

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg }}>
      <MDText variant="h4" style={{ marginBottom: spacing.md }}>
        {title}
      </MDText>
      <View style={{ gap: spacing.md }}>{children}</View>
    </View>
  );
}

interface ProductFormProps {
  values: ProductFormValues;
  onChange: (values: ProductFormValues) => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
  onPreview?: () => void;
  submitLabel: string;
  submitting?: boolean;
  /**
   * Restrict the Manufacturer field to a fixed set of brands (rendered as
   * selectable chips instead of free text) — used by the seller console so
   * a seller can only create/edit listings under their own authorized
   * brand(s), never someone else's manufacturer name.
   */
  manufacturerOptions?: string[];
  /**
   * Hide the raw isPublished switch — used by the seller console, where
   * going live is a Maker-Checker governance decision (see
   * GovernanceTracker), not a toggle the seller controls directly.
   */
  hidePublishToggle?: boolean;
}

export function ProductForm({
  values,
  onChange,
  onSubmit,
  onSaveDraft,
  onPreview,
  submitLabel,
  submitting,
  manufacturerOptions,
  hidePublishToggle,
}: ProductFormProps) {
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
    onChange({ ...values, [key]: value });

  const toggleTag = (tag: ProductTag) => {
    set('tags', values.tags.includes(tag) ? values.tags.filter((t) => t !== tag) : [...values.tags, tag]);
  };

  return (
    <ScrollView>
      <Section title="Basic Information">
        <MDInput label="Product Title" value={values.title} onChangeText={(v) => set('title', v)} />
        <MDInput label="Description" value={values.description} onChangeText={(v) => set('description', v)} multiline />
      </Section>

      <Section title="Product Identification">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Manufacturer Part Number" value={values.manufacturerPartNumber} onChangeText={(v) => set('manufacturerPartNumber', v)} style={{ flex: 1 }} />
          <MDInput label="MD Part Number" value={values.mdPartNumber} onChangeText={(v) => set('mdPartNumber', v)} style={{ flex: 1 }} />
        </View>
      </Section>

      <Section title="Manufacturer & Classification">
        {manufacturerOptions ? (
          <View>
            <MDText variant="bodySm" weight="600" style={{ marginBottom: spacing.xs }}>
              Manufacturer
            </MDText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {manufacturerOptions.map((option) => {
                const selected = values.manufacturer === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => set('manufacturer', option)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      borderWidth: 1,
                      borderColor: selected ? colors.brand.primary : colors.border,
                      backgroundColor: selected ? colors.brand.primarySoft : 'transparent',
                    }}
                  >
                    <MDText variant="bodySm" weight={selected ? '700' : '400'} style={{ color: selected ? colors.brand.primary : colors.text.secondary }}>
                      {option}
                    </MDText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : (
          <MDInput label="Manufacturer" value={values.manufacturer} onChangeText={(v) => set('manufacturer', v)} placeholder="e.g. Infineon Technologies" />
        )}
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Category" value={values.category} onChangeText={(v) => set('category', v)} style={{ flex: 1 }} />
          <MDInput label="Product Type" value={values.productType} onChangeText={(v) => set('productType', v)} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Technology" value={values.technology} onChangeText={(v) => set('technology', v)} style={{ flex: 1 }} />
          <MDInput label="Mounting Style" value={values.mountingStyle} onChangeText={(v) => set('mountingStyle', v)} style={{ flex: 1 }} />
          <MDInput label="Package" value={values.package} onChangeText={(v) => set('package', v)} style={{ flex: 1 }} />
        </View>
      </Section>

      <Section title="Pricing & Inventory">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Price" value={values.price} onChangeText={(v) => set('price', v)} keyboardType="numeric" style={{ flex: 1 }} />
          <MDInput label="Currency" value={values.currency} onChangeText={(v) => set('currency', v)} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Available Quantity" value={values.availability} onChangeText={(v) => set('availability', v)} keyboardType="numeric" style={{ flex: 1 }} />
          <MDInput label="Stock Status" value={values.stockStatus} onChangeText={(v) => set('stockStatus', v)} style={{ flex: 1 }} />
          <MDInput label="Stock Type" value={values.stockType} onChangeText={(v) => set('stockType', v)} style={{ flex: 1 }} />
        </View>
      </Section>

      <Section title="Compliance">
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <MDInput label="Lifecycle" value={values.lifecycle} onChangeText={(v) => set('lifecycle', v)} style={{ flex: 1 }} />
          <MDInput label="RoHS Label" value={values.rohsLabel} onChangeText={(v) => set('rohsLabel', v)} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <MDSwitch value={values.rohs} onValueChange={(v) => set('rohs', v)} accessibilityLabel="RoHS compliant" />
          <MDText variant="bodySm">RoHS Compliant</MDText>
        </View>
      </Section>

      <Section title="Documents">
        <MDInput label="Datasheet URL" value={values.datasheet} onChangeText={(v) => set('datasheet', v)} autoCapitalize="none" />
        <MDInput label="Product URL" value={values.productUrl} onChangeText={(v) => set('productUrl', v)} autoCapitalize="none" />
      </Section>

      <Section title="Media">
        <MDText variant="bodySm" tone="secondary">
          Choose a product image from the media library.
        </MDText>
        <Pressable
          onPress={() => setImagePickerOpen((v) => !v)}
          style={{ width: 96, height: 96, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}
        >
          <Image source={PRODUCT_IMAGES[values.image]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </Pressable>
        {imagePickerOpen ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm }}>
            {Object.keys(PRODUCT_IMAGES).map((key) => (
              <Pressable
                key={key}
                onPress={() => {
                  set('image', key);
                  setImagePickerOpen(false);
                }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: radius.sm,
                  overflow: 'hidden',
                  borderWidth: key === values.image ? 2 : 1,
                  borderColor: key === values.image ? colors.brand.primary : colors.border,
                }}
              >
                <Image source={PRODUCT_IMAGES[key]} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              </Pressable>
            ))}
          </View>
        ) : null}
      </Section>

      <Section title="Tags & Publishing">
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {ALL_TAGS.map((tag) => {
            const selected = values.tags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  borderWidth: 1,
                  borderColor: selected ? colors.brand.primary : colors.border,
                  backgroundColor: selected ? colors.brand.primarySoft : 'transparent',
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                }}
              >
                {selected ? <Ionicons name="checkmark" size={12} color={colors.brand.primary} /> : null}
                <MDText variant="caption" weight="600" style={{ color: selected ? colors.brand.primary : colors.text.secondary }}>
                  {tag}
                </MDText>
              </Pressable>
            );
          })}
        </View>

        {!hidePublishToggle ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <MDSwitch value={values.isPublished} onValueChange={(v) => set('isPublished', v)} accessibilityLabel="Published" />
            <MDText variant="bodySm">{values.isPublished ? 'Published — visible to buyers' : 'Unpublished — hidden from buyers'}</MDText>
          </View>
        ) : (
          <MDText variant="bodySm" tone="secondary">
            Going live requires Maker-Checker review — submit this listing for review from My Products once saved.
          </MDText>
        )}
      </Section>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing['3xl'] }}>
        {onSaveDraft ? <MDButton label="Save Draft" variant="outline" onPress={onSaveDraft} /> : null}
        {onPreview ? <MDButton label="Preview" variant="ghost" onPress={onPreview} /> : null}
        <MDButton label={submitLabel} onPress={onSubmit} loading={submitting} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}
