import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radius, spacing, useToast, MDBadge, MDEmptyState, MDText } from '@/design-system';
import { useProductAdmin, useUpsertProduct } from '@/features/products';
import { useAuthStore, useGovernanceStore } from '@/state';
import { GOVERNANCE_STAGE_DESCRIPTION, GOVERNANCE_STAGE_LABEL } from '@/features/governance/service';
import { GovernanceTracker } from '@/components/GovernanceTracker';
import { EMPTY_PRODUCT_FORM, ProductForm, type ProductFormValues } from '@/components/ProductForm';
import { formValuesToProduct, productToFormValues } from '@/features/products/adminHelpers';

export default function SellerEditProduct() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const { data: product, isLoading } = useProductAdmin(productId);
  const upsertProduct = useUpsertProduct();
  const getRecord = useGovernanceStore((s) => s.getRecord);
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);

  useEffect(() => {
    if (product) setValues(productToFormValues(product));
  }, [product]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState title="Product not found" actionLabel="Back to My Products" onAction={() => router.push('/(seller)/products')} />
      </View>
    );
  }

  if (!manufacturers.includes(product.manufacturer)) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface }}>
        <MDEmptyState
          title="Not your listing"
          description="This product belongs to a different brand and isn't editable from your seller console."
          actionLabel="Back to My Products"
          onAction={() => router.push('/(seller)/products')}
        />
      </View>
    );
  }

  const governance = getRecord('product', String(productId));

  const handleSubmit = () => {
    upsertProduct.mutate(formValuesToProduct(values, productId), {
      onSuccess: () => {
        toast.show('Product updated.', 'success');
        router.push('/(seller)/products');
      },
      onError: () => toast.show('Something went wrong. Please try again.', 'error'),
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 800 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.lg }}>
          Edit Product
        </MDText>

        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.xl,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, flexWrap: 'wrap', gap: spacing.sm }}>
            <MDText variant="bodyMedium" weight="700">
              Governance Status
            </MDText>
            <MDBadge label={GOVERNANCE_STAGE_LABEL[governance.stage]} tone={governance.stage === 'published' ? 'success' : 'brand'} />
          </View>
          <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.md }}>
            {GOVERNANCE_STAGE_DESCRIPTION[governance.stage]}
          </MDText>
          <GovernanceTracker stage={governance.stage} compact />
          <MDText variant="caption" tone="tertiary" style={{ marginTop: spacing.sm }}>
            Submit for review from My Products — this page only edits product details.
          </MDText>
        </View>

        <ProductForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          submitting={upsertProduct.isPending}
          manufacturerOptions={manufacturers}
          hidePublishToggle
        />
      </View>
    </ScrollView>
  );
}
