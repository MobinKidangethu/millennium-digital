import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import SemiconductorsIcon from '../../assets/icons/categories/semiconductors.svg';
import SensorsIcon from '../../assets/icons/categories/sensors.svg';
import ToolsSuppliesIcon from '../../assets/icons/categories/tools-supplies.svg';
import PassiveComponentsIcon from '../../assets/icons/categories/passive-components.svg';
import WireCableIcon from '../../assets/icons/categories/wire-cable.svg';
import ConnectorsIcon from '../../assets/icons/categories/connectors.svg';
import EmbeddedSolutionsIcon from '../../assets/icons/categories/embedded-solutions.svg';

/**
 * Category name -> icon component, keyed by normalized (lowercased)
 * category name as it appears in products.json. All 7 categories present
 * in the catalog have a matching icon in assets/icons/categories/ — all
 * are .svg, imported (not require()'d) so react-native-svg-transformer's
 * default export unwraps correctly under Babel's ESM interop.
 */
export const CATEGORY_ICONS: Record<string, ComponentType<SvgProps>> = {
  semiconductors: SemiconductorsIcon,
  sensors: SensorsIcon,
  'tools & supplies': ToolsSuppliesIcon,
  'passive components': PassiveComponentsIcon,
  'wire & cable': WireCableIcon,
  connectors: ConnectorsIcon,
  'embedded solutions': EmbeddedSolutionsIcon,
};
