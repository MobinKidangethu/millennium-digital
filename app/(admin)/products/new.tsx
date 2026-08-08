import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, useToast, MDText } from '@/design-system';
import { useUpsertProduct } from '@/features/products';
import { EMPTY_PRODUCT_FORM, ProductForm, type ProductFormValues } from '@/components/ProductForm';
import { formValuesToProduct } from '@/features/products/adminHelpers';

export default function NewProduct() {
  const router = useRouter();
  const toast = useToast();
  const upsertProduct = useUpsertProduct();
  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);

  const handleSubmit = (publish: boolean) => {
    if (!values.manufacturer || !values.manufacturerPartNumber || !values.price) {
      toast.show('Manufacturer, part number, and price are required.', 'warning');
      return;
    }
    upsertProduct.mutate(formValuesToProduct({ ...values, isPublished: publish }), {
      onSuccess: () => {
        toast.show(publish ? 'Product published.' : 'Draft saved.', 'success');
        router.push('/(admin)/products');
      },
      onError: () => toast.show('Something went wrong. Please try again.', 'error'),
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 800 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Add Product
        </MDText>
        <ProductForm
          values={values}
          onChange={setValues}
          onSubmit={() => handleSubmit(true)}
          onSaveDraft={() => handleSubmit(false)}
          submitLabel="Publish Product"
          submitting={upsertProduct.isPending}
        />
      </View>
    </ScrollView>
  );
}
