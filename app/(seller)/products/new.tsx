import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, useToast, MDText } from '@/design-system';
import { useUpsertProduct } from '@/features/products';
import { useAuthStore } from '@/state';
import { EMPTY_PRODUCT_FORM, ProductForm, type ProductFormValues } from '@/components/ProductForm';
import { formValuesToProduct } from '@/features/products/adminHelpers';

export default function SellerNewProduct() {
  const router = useRouter();
  const toast = useToast();
  const session = useAuthStore((s) => s.session);
  const manufacturers = session?.user.sellerManufacturers ?? [];
  const upsertProduct = useUpsertProduct();
  const [values, setValues] = useState<ProductFormValues>({
    ...EMPTY_PRODUCT_FORM,
    manufacturer: manufacturers[0] ?? '',
    isPublished: false,
  });

  const handleSubmit = () => {
    if (!values.manufacturer || !values.manufacturerPartNumber || !values.price) {
      toast.show('Manufacturer, part number, and price are required.', 'warning');
      return;
    }
    upsertProduct.mutate(formValuesToProduct({ ...values, isPublished: false }), {
      onSuccess: () => {
        toast.show('Draft saved — submit it for review from My Products.', 'success');
        router.push('/(seller)/products');
      },
      onError: () => toast.show('Something went wrong. Please try again.', 'error'),
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 800 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xs }}>
          Add Product
        </MDText>
        <MDText variant="bodySm" tone="secondary" style={{ marginBottom: spacing.xl }}>
          New listings are saved as a draft. Submit for review from My Products once you're ready — it goes
          live only after Maker-Checker validation.
        </MDText>
        <ProductForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel="Save Draft"
          submitting={upsertProduct.isPending}
          manufacturerOptions={manufacturers}
          hidePublishToggle
        />
      </View>
    </ScrollView>
  );
}
