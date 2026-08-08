import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

/**
 * Manufacturer name -> logo asset, keyed by normalized manufacturer name
 * (lowercased, trimmed). The `manufacturerLogo` path strings inside
 * products.json do not resolve to real files on disk (verified), so
 * this registry is built directly from the actual files in
 * assets/logos/manufacturers/ instead of trusting that field.
 *
 * Values are `number` for raster files (png/jpg/webp, a Metro asset id)
 * or a React component for `.svg` files (transformed by
 * react-native-svg-transformer) — MDManufacturerLogo renders either.
 *
 * Every manufacturer present in the current catalog is covered.
 * Manufacturers with no product yet (and no admin-supplied logo) fall
 * back to an initials badge — see resolveManufacturerLogo().
 */
export const MANUFACTURER_LOGOS: Record<string, number | ComponentType<SvgProps>> = {
  'infineon technologies': require('../../assets/logos/manufacturers/infineon.svg'),
  vishay: require('../../assets/logos/manufacturers/vishay.png'),
  'vishay semiconductors': require('../../assets/logos/manufacturers/vishay.png'),
  melexis: require('../../assets/logos/manufacturers/Melexis.png'),
  littelfuse: require('../../assets/logos/manufacturers/littlefuse.webp'),
  toshiba: require('../../assets/logos/manufacturers/toshiba.jpg'),
  'renesas electronics': require('../../assets/logos/manufacturers/renesas.svg'),
  qorvo: require('../../assets/logos/manufacturers/qorvo.png'),
  ixys: require('../../assets/logos/manufacturers/ixys.webp'),
  'hartland controls': require('../../assets/logos/manufacturers/HartlandLogo.png'),
  'te connectivity': require('../../assets/logos/manufacturers/te-connectivity-logo.svg'),
  'analog devices': require('../../assets/logos/manufacturers/analog-devices.svg'),

  // Present in /assets/logos/manufacturers but not yet in the product
  // catalog — kept so the registry doesn't need edits when new products
  // for these manufacturers are added.
  microchip: require('../../assets/logos/manufacturers/microchip.png'),
  nxp: require('../../assets/logos/manufacturers/nxp.svg'),
  stmicroelectronics: require('../../assets/logos/manufacturers/stmicroelectronics.svg'),
  'texas instruments': require('../../assets/logos/manufacturers/texas-instruments.webp'),
};
