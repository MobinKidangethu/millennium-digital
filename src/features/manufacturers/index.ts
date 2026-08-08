/**
 * Manufacturers are a derived view over the product catalog (there's no
 * independent manufacturer entity yet), so this just re-exposes the
 * manufacturer hooks from the products feature under their own import
 * path — see src/features/products/service.ts for the derivation logic.
 */
export {
  useManufacturers,
  useManufacturer,
} from '../products/hooks';
