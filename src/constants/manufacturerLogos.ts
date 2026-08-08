import type { ComponentType } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import InfineonLogo from '../../assets/logos/manufacturers/infineon.svg';
import RenesasLogo from '../../assets/logos/manufacturers/renesas.svg';
import TeConnectivityLogo from '../../assets/logos/manufacturers/te-connectivity-logo.svg';
import AnalogDevicesLogo from '../../assets/logos/manufacturers/analog-devices.svg';
import NxpLogo from '../../assets/logos/manufacturers/nxp.svg';
import StMicroelectronicsLogo from '../../assets/logos/manufacturers/stmicroelectronics.svg';

import vishayLogo from '../../assets/logos/manufacturers/vishay.png';
import melexisLogo from '../../assets/logos/manufacturers/Melexis.png';
import littelfuseLogo from '../../assets/logos/manufacturers/littlefuse.webp';
import toshibaLogo from '../../assets/logos/manufacturers/toshiba.jpg';
import qorvoLogo from '../../assets/logos/manufacturers/qorvo.png';
import ixysLogo from '../../assets/logos/manufacturers/ixys.webp';
import hartlandLogo from '../../assets/logos/manufacturers/HartlandLogo.png';
import microchipLogo from '../../assets/logos/manufacturers/microchip.png';
import texasInstrumentsLogo from '../../assets/logos/manufacturers/texas-instruments.webp';

/**
 * Manufacturer name -> logo asset, keyed by normalized manufacturer name
 * (lowercased, trimmed). The `manufacturerLogo` path strings inside
 * products.json do not resolve to real files on disk (verified), so
 * this registry is built directly from the actual files in
 * assets/logos/manufacturers/ instead of trusting that field.
 *
 * Raster (png/jpg/webp) and SVG logos are kept in separate maps rather
 * than one mixed map with a `typeof` runtime check — on react-native-web,
 * a raster require()/import resolves to an asset *object* (not the
 * plain numeric module id you get on native), so "is it a number" is
 * not a reliable way to tell a raster source from an SVG component
 * across platforms. Two maps + a discriminated resolver result avoids
 * that footgun entirely.
 *
 * Every manufacturer present in the current catalog is covered.
 * Manufacturers with no product yet (and no admin-supplied logo) fall
 * back to an initials badge — see resolveManufacturerLogo().
 */
export const MANUFACTURER_LOGO_RASTER: Record<string, ImageSourcePropType> = {
  vishay: vishayLogo,
  'vishay semiconductors': vishayLogo,
  melexis: melexisLogo,
  littelfuse: littelfuseLogo,
  toshiba: toshibaLogo,
  qorvo: qorvoLogo,
  ixys: ixysLogo,
  'hartland controls': hartlandLogo,
  microchip: microchipLogo,
  'texas instruments': texasInstrumentsLogo,
};

export const MANUFACTURER_LOGO_SVG: Record<string, ComponentType<SvgProps>> = {
  'infineon technologies': InfineonLogo,
  'renesas electronics': RenesasLogo,
  'te connectivity': TeConnectivityLogo,
  'analog devices': AnalogDevicesLogo,
  nxp: NxpLogo,
  stmicroelectronics: StMicroelectronicsLogo,
};
