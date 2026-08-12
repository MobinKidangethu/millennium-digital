/**
 * Default shipping countries for the address form, each with its real
 * states/provinces where that country actually has first-level administrative
 * divisions. Countries without a `states` list (e.g. Singapore, UAE-city
 * concepts aside) fall back to a free-text State/Province field in the UI.
 *
 * India is first/default since Millennium Digital ships domestically by
 * default; the rest cover the manufacturer/supplier countries already
 * referenced elsewhere in the app (line card brands, international
 * shipping carriers) plus common B2B electronics trade destinations.
 */
export interface CountryOption {
  name: string;
  code: string;
  states?: string[];
}

const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia',
];

const CANADA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
  'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec',
  'Saskatchewan', 'Yukon',
];

const AUSTRALIA_STATES = [
  'New South Wales', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia',
  'Australian Capital Territory', 'Northern Territory',
];

const NETHERLANDS_PROVINCES = [
  'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant',
  'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland',
];

const GERMANY_STATES = [
  'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse',
  'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate',
  'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia',
];

const UAE_EMIRATES = [
  'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain',
];

export const COUNTRIES: CountryOption[] = [
  { name: 'India', code: 'IN', states: INDIA_STATES },
  { name: 'United States', code: 'US', states: US_STATES },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'Netherlands', code: 'NL', states: NETHERLANDS_PROVINCES },
  { name: 'Germany', code: 'DE', states: GERMANY_STATES },
  { name: 'France', code: 'FR' },
  { name: 'Italy', code: 'IT' },
  { name: 'Canada', code: 'CA', states: CANADA_PROVINCES },
  { name: 'Australia', code: 'AU', states: AUSTRALIA_STATES },
  { name: 'United Arab Emirates', code: 'AE', states: UAE_EMIRATES },
  { name: 'Singapore', code: 'SG' },
  { name: 'China', code: 'CN' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Vietnam', code: 'VN' },
  { name: 'Israel', code: 'IL' },
  { name: 'Mexico', code: 'MX' },
];

export function getCountryByName(name: string): CountryOption | undefined {
  return COUNTRIES.find((c) => c.name === name);
}

export function isIndia(countryName: string): boolean {
  return countryName.trim().toLowerCase() === 'india';
}
