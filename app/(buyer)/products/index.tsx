import { ScrollView, View } from 'react-native';
import { colors, spacing, layout } from '@/design-system';
import { ProductCatalogView } from '@/components/ProductCatalogView';

export default function ProductCatalog() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ maxWidth: layout.maxContentWidth, width: '100%', alignSelf: 'center', padding: spacing.xl }}>
        <ProductCatalogView title="All Products" description="Browse the full Millennium Digital catalog." />
      </View>
    </ScrollView>
  );
}
