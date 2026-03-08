export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  certificationNumber: string;
  standard: string;
  status: 'verified' | 'warning' | 'expired' | 'not-found';
  validUntil?: string;
  safetyLevel: 'high' | 'medium' | 'low';
  safetyChecklist: string[];
  description: string;
}

export interface ProductCategory {
  name: string;
  bisRequired: boolean;
  relevantStandard: string;
  safetyTips: string[];
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Steelbird SB-42 Helmet',
    manufacturer: 'Steelbird Hi-Tech India Ltd',
    category: 'Helmets',
    certificationNumber: 'CM/L-1234567',
    standard: 'IS 4151:2015',
    status: 'verified',
    validUntil: '2027-06-15',
    safetyLevel: 'high',
    safetyChecklist: [
      'ISI mark clearly visible',
      'Weight between 1.2-1.5 kg',
      'Strong chin strap with secure buckle',
      'Manufacturing date within 5 years',
      'Proper ventilation holes',
      'Inner padding intact'
    ],
    description: 'Full face helmet certified for two-wheeler use'
  },
  {
    id: '2',
    name: 'Prestige Popular Plus Pressure Cooker',
    manufacturer: 'TTK Prestige Ltd',
    category: 'Pressure Cookers',
    certificationNumber: 'CM/L-7654321',
    standard: 'IS 2347:2017',
    status: 'verified',
    validUntil: '2026-12-31',
    safetyLevel: 'high',
    safetyChecklist: [
      'ISI mark on body and lid',
      'Safety valve functioning',
      'Gasket in good condition',
      'Pressure indicator working',
      'Handle securely attached',
      'No visible dents or damage'
    ],
    description: 'Aluminum pressure cooker for domestic use'
  },
  {
    id: '3',
    name: 'Havells Electric Iron',
    manufacturer: 'Havells India Ltd',
    category: 'Electric Appliances',
    certificationNumber: 'CM/L-9876543',
    standard: 'IS 302-2-3:2009',
    status: 'verified',
    validUntil: '2025-08-20',
    safetyLevel: 'high',
    safetyChecklist: [
      'ISI mark present',
      'Automatic shut-off feature',
      'Proper heat insulation',
      'Cord in good condition',
      'Temperature control working',
      'No exposed wires'
    ],
    description: 'Steam iron with automatic temperature control'
  },
  {
    id: '4',
    name: 'Generic Wire Extension',
    manufacturer: 'Unknown',
    category: 'Electrical Wires',
    certificationNumber: 'FAKE-12345',
    standard: 'IS 694:2010',
    status: 'not-found',
    safetyLevel: 'low',
    safetyChecklist: [
      '⚠ Certification not found in database',
      '⚠ Manufacturer not verified',
      '⚠ Avoid using this product',
      'Report to authorities'
    ],
    description: 'Unverified electrical extension cord'
  },
  {
    id: '5',
    name: 'Finolex Electrical Cable',
    manufacturer: 'Finolex Cables Ltd',
    category: 'Electrical Wires',
    certificationNumber: 'CM/L-5432109',
    standard: 'IS 694:2010',
    status: 'verified',
    validUntil: '2028-03-15',
    safetyLevel: 'high',
    safetyChecklist: [
      'ISI mark on cable sheath',
      'Proper conductor size mentioned',
      'Insulation intact throughout',
      'No visible damage or cuts',
      'Appropriate for load capacity',
      'Fire retardant certification'
    ],
    description: 'PVC insulated copper conductor cable'
  },
  {
    id: '6',
    name: 'Local Market Charger',
    manufacturer: 'Unregistered',
    category: 'Chargers',
    certificationNumber: 'ISI-FAKE',
    standard: 'IS 13252',
    status: 'not-found',
    safetyLevel: 'low',
    safetyChecklist: [
      '⚠ Fake certification detected',
      '⚠ No BIS registration found',
      '⚠ Risk of electrical fire',
      'Do not use this product'
    ],
    description: 'Uncertified mobile charger'
  }
];

export const productCategories: ProductCategory[] = [
  {
    name: 'Helmets',
    bisRequired: true,
    relevantStandard: 'IS 4151:2015',
    safetyTips: [
      'Always buy ISI certified helmets',
      'Check manufacturing date - replace after 5 years',
      'Ensure proper fit and chin strap security',
      'Avoid helmets with visible damage'
    ]
  },
  {
    name: 'Pressure Cookers',
    bisRequired: true,
    relevantStandard: 'IS 2347:2017',
    safetyTips: [
      'Check ISI mark on both body and lid',
      'Replace gasket regularly',
      'Never overfill the cooker',
      'Maintain safety valve properly'
    ]
  },
  {
    name: 'Electrical Wires',
    bisRequired: true,
    relevantStandard: 'IS 694:2010',
    safetyTips: [
      'Use only ISI marked wires',
      'Choose appropriate wire gauge for load',
      'Check for fire retardant certification',
      'Replace damaged wires immediately'
    ]
  },
  {
    name: 'LPG Cylinders',
    bisRequired: true,
    relevantStandard: 'IS 3196:2012',
    safetyTips: [
      'Check seal and cap integrity',
      'Verify company embossing',
      'Never accept damaged cylinders',
      'Check test date on cylinder'
    ]
  },
  {
    name: 'Electric Appliances',
    bisRequired: true,
    relevantStandard: 'IS 302 Series',
    safetyTips: [
      'Look for ISI mark before purchase',
      'Check power cord condition',
      'Use surge protectors',
      'Follow wattage guidelines'
    ]
  },
  {
    name: 'Toys',
    bisRequired: true,
    relevantStandard: 'IS 9873:2019',
    safetyTips: [
      'Buy only ISI certified toys',
      'Check age appropriateness',
      'Avoid small detachable parts for young children',
      'Check for sharp edges'
    ]
  }
];

export function searchProducts(query: string): Product[] {
  const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
  return mockProducts.filter(p => {
    const searchable = `${p.name} ${p.certificationNumber} ${p.manufacturer} ${p.category}`.toLowerCase();
    return queryWords.every(word => searchable.includes(word));
  });
}

export function getProductByNumber(certNumber: string): Product | undefined {
  return mockProducts.find(
    p => p.certificationNumber.toLowerCase() === certNumber.toLowerCase()
  );
}

export function getCategoryInfo(categoryName: string): ProductCategory | undefined {
  return productCategories.find(
    c => c.name.toLowerCase() === categoryName.toLowerCase()
  );
}
