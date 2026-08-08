import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, useToast, MDEmptyState, MDText } from '@/design-system';
import { useProductAdmin, useUpsertProduct } from '@/features/products';
import { EMPTY_PRODUCT_FORM, ProductForm, type ProductFormValues } from '@/components/ProductForm';
import { formValuesToProduct, productToFormValues } from '@/features/products/adminHelpers';

export default function EditProduct() {
  const router = useRouter();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Number(id);
  const { data: product, isLoading } = useProductAdmin(productId);
  const upsertProduct = useUpsertProduct();
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
        <MDEmptyState title="Product not found" actionLabel="Back to Products" onAction={() => router.push('/(admin)/products')} />
      </View>
    );
  }

  const handleSubmit = () => {
    upsertProduct.mutate(formValuesToProduct(values, productId), {
      onSuccess: () => {
        toast.show('Product updated.', 'success');
        router.push('/(admin)/products');
      },
      onError: () => toast.show('Something went wrong. Please try again.', 'error'),
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ padding: spacing.xl, maxWidth: 800 }}>
        <MDText variant="h1" style={{ marginBottom: spacing.xl }}>
          Edit Product
        </MDText>
        <ProductForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          onPreview={() => router.push({ pathname: '/(admin)/products/[id]/preview', params: { id: String(productId) } })}
          submitLabel="Save Changes"
          submitting={upsertProduct.isPending}
        />
      </View>
    </ScrollView>
  );
}
