/**
 * Categories are a derived view over the product catalog (there's no
 * independent category entity yet), so this just re-exposes the
 * category hooks from the products feature under their own import
 * path — see src/features/products/service.ts for the derivation logic.
 */
export {
  useCategories,
  useCategory,
} from '../products/hooks';
