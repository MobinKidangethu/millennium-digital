import type { Product } from '@/types';
import type { ProductFormValues } from '@/components/ProductForm';

export function productToFormValues(product: Product): ProductFormValues {
  return {
    manufacturer: product.manufacturer,
    manufacturerPartNumber: product.manufacturerPartNumber,
    mdPartNumber: product.mdPartNumber,
    title: product.title,
    description: product.description,
    category: product.category,
    productType: product.productType,
    technology: product.technology,
    mountingStyle: product.mountingStyle,
    package: product.package,
    price: String(product.price),
    currency: product.currency,
    availability: String(product.availability),
    stockStatus: product.stockStatus,
    stockType: product.stockType,
    quantity: String(product.quantity),
    rohs: product.rohs,
    rohsLabel: product.rohsLabel,
    lifecycle: product.lifecycle,
    datasheet: product.datasheet,
    productUrl: product.productUrl,
    image: product.image,
    tags: product.tags,
    isPublished: product.isPublished,
  };
}

export function formValuesToProduct(values: ProductFormValues, id?: number): Omit<Product, 'id'> & { id?: number } {
  return {
    id,
    manufacturer: values.manufacturer,
    manufacturerPartNumber: values.manufacturerPartNumber,
    mdPartNumber: values.mdPartNumber,
    manufacturerLogo: '',
    title: values.title || values.manufacturerPartNumber,
    description: values.description,
    category: values.category,
    productType: values.productType,
    technology: values.technology,
    mountingStyle: values.mountingStyle,
    package: values.package,
    price: Number(values.price) || 0,
    currency: values.currency,
    availability: Number(values.availability) || 0,
    stockStatus: values.stockStatus,
    stockType: values.stockType,
    quantity: Number(values.quantity) || 1,
    rohs: values.rohs,
    rohsLabel: values.rohsLabel,
    lifecycle: values.lifecycle,
    datasheet: values.datasheet,
    productUrl: values.productUrl,
    image: values.image,
    tags: values.tags,
    isPublished: values.isPublished,
    manufacturerSlug: '',
    partSlug: '',
  };
}
