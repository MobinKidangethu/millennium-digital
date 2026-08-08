import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

/**
 * Category name -> icon component, keyed by normalized (lowercased)
 * category name as it appears in products.json. All 7 categories present
 * in the catalog have a matching icon in assets/icons/categories/ — all
 * are .svg, transformed to React components by react-native-svg-transformer.
 */
export const CATEGORY_ICONS: Record<string, ComponentType<SvgProps>> = {
  semiconductors: require('../../assets/icons/categories/semiconductors.svg'),
  sensors: require('../../assets/icons/categories/sensors.svg'),
  'tools & supplies': require('../../assets/icons/categories/tools-supplies.svg'),
  'passive components': require('../../assets/icons/categories/passive-components.svg'),
  'wire & cable': require('../../assets/icons/categories/wire-cable.svg'),
  connectors: require('../../assets/icons/categories/connectors.svg'),
  'embedded solutions': require('../../assets/icons/categories/embedded-solutions.svg'),
};
