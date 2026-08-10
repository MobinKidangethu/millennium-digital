/**
 * Millennium Semiconductors' real, published distributor line card —
 * sourced from https://www.millenniumsemi.com/line-card/ (fetched
 * 2026-08-10), including each brand's real logo image as hosted on that
 * site. This is the client's actual authorized-brand network, not
 * invented data.
 *
 * This is intentionally kept separate from the `Manufacturer` type used
 * elsewhere in the app (src/types/product.ts), which is derived strictly
 * from products.json — most of these ~89 brands don't have SKUs loaded
 * into the prototype catalog yet. Where a brand here does overlap with a
 * manufacturer already in the live catalog (see findCatalogMatch in the
 * Manufacturers screen), the UI links through to that manufacturer's real
 * product page; everything else renders as a static, honestly-labeled
 * "sourced on request" tile — no fake product counts or dead-end links.
 *
 * Logos are hotlinked from millenniumsemi.com's own media library (same
 * pattern already used for the homepage segment imagery) rather than
 * downloaded/rehosted — if a given logo fails to load, LineCardTile falls
 * back to an initials badge, same graceful-degradation pattern as
 * MDManufacturerLogo elsewhere in the app.
 */
export interface LineCardBrand {
  name: string;
  logoUrl: string;
}

export const LINE_CARD_BRANDS: LineCardBrand[] = [
  { name: 'Megahunt', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2026/06/Megahunt-Logo-1.png' },
  { name: 'IndieSemiC', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2025/07/Indiesemic-Logo.png' },
  { name: 'Next Biometrics', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2025/06/Next-Biometrics-logo-190-150.jpg' },
  { name: 'ATP Electronics', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2025/05/ATP-Electronics-Logo.jpg' },
  { name: 'JonDeTech', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2025/01/Jondetech.png' },
  { name: 'Shibaura', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2024/12/Shibaura-Logo-190-150-e1735623567606.jpg' },
  { name: 'MoMagic', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2024/12/MoMagic-logo1.png' },
  { name: 'Rectron', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/10/Rectron-Logo.jpg' },
  { name: 'PARA LIGHT', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/10/Para-Light-Logo.jpg' },
  { name: 'KDS', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/10/KDS-Logo-MS.jpg' },
  { name: 'Kemet', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/Kemet-1.webp' },
  { name: 'Abracon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/Abracon-New-Image.png' },
  { name: 'Renesas', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/Renesas.webp' },
  { name: 'XTX', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/XTX.webp' },
  { name: 'Raytac', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/Raytac-1-1.webp' },
  { name: 'Hannstar', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/07/Hannstar.webp' },
  { name: 'Viitorsemi', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/06/viitorsemi.webp' },
  { name: 'On-Bright', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/06/on-bright-2.webp' },
  { name: 'PSA Inpaq Technology', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/06/PSA-inpaq.webp' },
  { name: 'Thakor Electronics Limited', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Thakor-electronics.webp' },
  { name: 'Kyocera AVX', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/kyocera-avx-1.webp' },
  { name: 'Pulse Electronics', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Untitled-design-3-1.png' },
  { name: 'Yangzhou Yangjie', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/yangzhou-yangjie.webp' },
  { name: 'Wuxi Compul', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Wuxi-2.webp' },
  { name: 'JJM', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/JJM-Logo-190-150-1.jpg' },
  { name: 'Qixing', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Qixing-1.webp' },
  { name: 'Chogori', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Chogori.webp' },
  { name: 'Cyntec', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Cyntec.webp' },
  { name: 'Linkcom', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Linkcom-1.webp' },
  { name: 'Momentive', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Untitled-design-5.png' },
  { name: 'Azoteq', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Azoteq-1.webp' },
  { name: 'Lantronix', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2023/05/Lantronix.webp' },
  { name: 'Littelfuse', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Littelfuse-1.webp' },
  { name: 'Infineon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Infineon.webp' },
  { name: 'Quectel', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Quectel-1.webp' },
  { name: 'Melexis', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Melexis-1.webp' },
  { name: 'Elmos', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/elmos.webp' },
  { name: 'Nuvoton', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Nuvoton-1.webp' },
  { name: 'Nordic', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Nordic.webp' },
  { name: 'MPS', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/MPS.webp' },
  { name: 'Rohm', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Rohm.webp' },
  { name: 'Semtech', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/semtech-3.webp' },
  { name: 'Taiwan Semiconductor', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Taiwan-semi.webp' },
  { name: 'Silan', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/silan.webp' },
  { name: 'Tuya', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Tuya-1.webp' },
  { name: 'Winbond', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Winbond-1.webp' },
  { name: 'Bosch', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Bosch-1.webp' },
  { name: 'Digi', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Digi-1.webp' },
  { name: 'UTC', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/UTC.webp' },
  { name: 'e-peas', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/e-peas.webp' },
  { name: 'Panjit', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Panjit-1.webp' },
  { name: 'Everlight', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Everlight.webp' },
  { name: 'Truly', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/truly.webp' },
  { name: 'Vango', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/vango.webp' },
  { name: 'Avdisplay', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Avdisplay.webp' },
  { name: 'Sanken', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Sanken-2.webp' },
  { name: 'Inventronics', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Inventronics.webp' },
  { name: 'Emis India', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Emis.webp' },
  { name: 'Phison', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Phison.webp' },
  { name: 'Holitech', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Holitech.webp' },
  { name: 'Omnivision', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Omnivision-1.webp' },
  { name: 'Will Semi', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/will-semi.webp' },
  { name: 'Nationstar', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Nationstar.webp' },
  { name: 'Dominant', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Dominant.webp' },
  { name: 'Panasonic', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Panasonic-1.webp' },
  { name: 'ASJ', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/ASJ-1.webp' },
  { name: 'Delta', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Delta.webp' },
  { name: 'Edison', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Edison.webp' },
  { name: 'Yageo', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Yageo.webp' },
  { name: 'Chilisin', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Chilisin.webp' },
  { name: 'Rubycon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Rubycon.webp' },
  { name: 'TDK', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/TDK-1.webp' },
  { name: 'Isabellenhutte', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Isabellenhutte-1.webp' },
  { name: 'Hornby Electronics', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Hornby-electronics.webp' },
  { name: 'Weidy', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Weidy.webp' },
  { name: 'SS-Magnet', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/ss-magnet.webp' },
  { name: 'Sunon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Sunon.webp' },
  { name: 'PSA Walsin Technology', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/PSA-Walsin.webp' },
  { name: 'Ymin', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Ymin-2.webp' },
  { name: 'Fenghua', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Fenghua.webp' },
  { name: 'Enfalion', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Enfalion-1.webp' },
  { name: 'NDF', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/NDF.webp' },
  { name: 'Pchicon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Pchicon-1.webp' },
  { name: 'Ucon', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/ucon.webp' },
  { name: 'Laird Technologies', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Laird-Technologies-1.webp' },
  { name: 'Hongfa', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Hongfa-1.webp' },
  { name: 'TE Connectivity', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/TE-Connectivity-2.webp' },
  { name: 'GCT', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/gct-2.webp' },
  { name: 'Conquer', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/Conquer.webp' },
  { name: 'Hao Yueh', logoUrl: 'https://www.millenniumsemi.com/wp-content/uploads/2022/12/hag.webp' },
];
