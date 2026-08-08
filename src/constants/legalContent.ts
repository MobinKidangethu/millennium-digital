export interface LegalPageContent {
  title: string;
  body: string[];
}

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  about: {
    title: 'About Millennium Digital',
    body: [
      'Millennium Digital is a technical distributor of genuine electronic components, serving engineers, procurement teams, and manufacturers who need reliable parts with clear technical documentation.',
      'We work directly with verified manufacturers to provide accurate part information, real-time availability, and dependable order fulfillment.',
    ],
  },
  contact: {
    title: 'Contact Us',
    body: [
      'Our team is available to help with product questions, bulk orders, and account support.',
      'Reach us using the contact details in the footer, or visit the Help Center for common questions.',
    ],
  },
  shipping: {
    title: 'Shipping Information',
    body: [
      'Orders are processed and shipped based on the shipping method selected at checkout.',
      'Estimated delivery windows are shown on the order confirmation and order tracking pages.',
    ],
  },
  returns: {
    title: 'Returns & Cancellations',
    body: [
      'If a component arrives damaged or does not match your order, contact support to arrange a return or replacement.',
      'Orders can be cancelled prior to shipment from your Order History page.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Millennium Digital collects only the account, order, and shipping information required to process your purchases and provide support.',
      'This is a prototype application — no data entered here is used for any purpose beyond demonstrating the product experience.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'Use of this site is subject to standard terms of purchase, including accurate account information and timely payment for orders placed.',
      'This is a prototype application intended to demonstrate the Millennium Digital product experience.',
    ],
  },
};
