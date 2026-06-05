export const TENDER_CATEGORIES = [
  'Construction & Civil Works',
  'Building Maintenance & Facilities',
  'Electrical, Energy & Power',
  'Water & Sanitation',
  'Roads & Transport Infrastructure',
  'IT & Digital Services',
  'Telecommunications & Connectivity',
  'Security Services',
  'Cleaning & Hygiene',
  'Waste Management & Recycling',
  'Healthcare & Medical',
  'Laboratory & Scientific',
  'Health & Safety',
  'Education & Training',
  'Professional Consulting',
  'Engineering & Technical Services',
  'Financial, Audit & Accounting',
  'Legal Services',
  'Human Resources & Recruitment',
  'Insurance & Risk Services',
  'Transport, Logistics & Courier',
  'Fleet, Vehicles & Plant',
  'Office Supplies, Furniture & Equipment',
  'Printing, Branding & Publishing',
  'Events, Marketing & Communications',
  'Catering & Food Services',
  'Agriculture, Forestry & Fisheries',
  'Environmental Services',
  'Manufacturing & Industrial Supplies',
] as const;

export type TenderCategory = (typeof TENDER_CATEGORIES)[number];

export const GENERIC_TENDER_CATEGORIES = new Set([
  'general',
  'goods',
  'services',
  'works',
]);

export const LEGACY_TENDER_CATEGORY_ALIASES: Record<string, TenderCategory> = {
  Construction: 'Construction & Civil Works',
  'IT & Technology': 'IT & Digital Services',
  'Medical & Healthcare': 'Healthcare & Medical',
  Security: 'Security Services',
  'Waste Management': 'Waste Management & Recycling',
  Catering: 'Catering & Food Services',
  Cleaning: 'Cleaning & Hygiene',
  'Transport & Logistics': 'Transport, Logistics & Courier',
};

const CATEGORY_SEARCH_KEYWORDS: Record<TenderCategory, string[]> = {
  'Construction & Civil Works': [
    'construction',
    'civil works',
    'building works',
    'renovation',
    'refurbishment',
    'alterations',
    'cidb',
    'roofing',
    'built environment',
  ],
  'Building Maintenance & Facilities': [
    'facility management',
    'facilities management',
    'building maintenance',
    'repairs and maintenance',
    'plumbing',
    'painting',
    'carpentry',
    'gardening',
    'landscaping',
    'grounds maintenance',
  ],
  'Electrical, Energy & Power': [
    'electrical',
    'electricity',
    'power',
    'generator',
    'solar',
    'photovoltaic',
    'inverter',
    'battery',
    'ups',
    'substation',
    'transformer',
    'lighting',
    'hvac',
  ],
  'Water & Sanitation': [
    'water',
    'sanitation',
    'sewer',
    'sewage',
    'wastewater',
    'stormwater',
    'drainage',
    'borehole',
    'reservoir',
    'reticulation',
  ],
  'Roads & Transport Infrastructure': [
    'road',
    'roads',
    'pothole',
    'bridge',
    'traffic signal',
    'streetlight',
    'sidewalk',
    'pavement',
    'asphalt',
    'rail',
    'runway',
  ],
  'IT & Digital Services': [
    'it',
    'ict',
    'software',
    'application',
    'system',
    'digital',
    'information technology',
    'database',
    'data',
    'cyber',
    'firewall',
    'server',
    'cloud',
    'endpoint',
    'backup',
    'computer',
    'laptop',
    'desktop',
    'printer',
    'scanner',
    'website',
    'portal',
    'erp',
    'sage',
    'license',
    'licence',
  ],
  'Telecommunications & Connectivity': [
    'telecommunications',
    'telecom',
    'fibre',
    'fiber',
    'broadband',
    'internet',
    'connectivity',
    'wifi',
    'wi-fi',
    'apn',
    'voip',
    'telephone',
    'pbx',
    'radio communication',
    'network switch',
  ],
  'Security Services': [
    'security',
    'guarding',
    'guards',
    'surveillance',
    'cctv',
    'access control',
    'alarm',
    'armed response',
    'fencing',
    'perimeter',
  ],
  'Cleaning & Hygiene': [
    'cleaning',
    'janitorial',
    'housekeeping',
    'washroom hygiene',
    'sanitary bins',
    'hygiene services',
    'cleaning chemicals',
    'cleaning consumables',
  ],
  'Waste Management & Recycling': [
    'waste',
    'refuse',
    'landfill',
    'recycling',
    'recyclable',
    'hazardous waste',
    'medical waste',
    'wastewater',
    'tyres',
  ],
  'Healthcare & Medical': [
    'medical',
    'healthcare',
    'pharmaceutical',
    'medicine',
    'clinic',
    'hospital',
    'ambulance',
    'patient',
    'nursing',
    'dental',
    'vaccine',
    'clinical',
  ],
  'Laboratory & Scientific': [
    'laboratory',
    'laboratories',
    'scientific',
    'microscope',
    'spectrometer',
    'chromatography',
    'centrifuge',
    'analyser',
    'analyzer',
    'reagents',
    'calibration',
  ],
  'Health & Safety': [
    'occupational health',
    'health and safety',
    'safety',
    'risk assessment',
    'hygiene survey',
    'ppe',
    'personal protective',
    'first aid',
    'fire blankets',
    'biohazard',
  ],
  'Education & Training': [
    'training',
    'workshop',
    'facilitation',
    'facilitator',
    'learnership',
    'education',
    'skills development',
    'curriculum',
    'e-learning',
    'student accommodation',
  ],
  'Professional Consulting': [
    'consulting',
    'consultant',
    'consultancy',
    'professional services',
    'advisory',
    'strategy',
    'feasibility study',
    'project management',
    'business plan',
    'research study',
  ],
  'Engineering & Technical Services': [
    'engineering',
    'technical services',
    'mechanical engineering',
    'electrical engineering',
    'quantity surveying',
    'architectural',
    'architect',
    'town planning',
    'geotechnical',
    'land survey',
  ],
  'Financial, Audit & Accounting': [
    'audit',
    'auditing',
    'accounting',
    'bookkeeping',
    'financial services',
    'financial statements',
    'tax',
    'payroll',
    'valuation',
    'asset register',
  ],
  'Legal Services': [
    'legal',
    'attorney',
    'law firm',
    'litigation',
    'conveyancing',
    'forensic investigation',
    'compliance review',
  ],
  'Human Resources & Recruitment': [
    'recruitment',
    'human resources',
    'hr services',
    'employee wellness',
    'background checks',
    'psychometric',
    'labour relations',
  ],
  'Insurance & Risk Services': [
    'insurance',
    'brokerage',
    'risk management',
    'risk services',
    'public liability',
    'short term insurance',
  ],
  'Transport, Logistics & Courier': [
    'transport',
    'transportation',
    'logistics',
    'courier',
    'freight',
    'delivery services',
    'shipping',
    'warehousing',
    'storage',
    'distribution',
  ],
  'Fleet, Vehicles & Plant': [
    'vehicle',
    'vehicles',
    'fleet',
    'truck',
    'trailer',
    'bakkie',
    'bus',
    'tractor',
    'plant hire',
    'yellow plant',
    'earthmoving',
    'forklift',
    'grader',
    'tlb',
  ],
  'Office Supplies, Furniture & Equipment': [
    'office supplies',
    'office equipment',
    'office furniture',
    'stationery',
    'chairs',
    'desks',
    'boardroom',
    'furniture',
    'appliances',
    'toner',
    'paper',
    'filing cabinets',
  ],
  'Printing, Branding & Publishing': [
    'printing',
    'publishing',
    'editor',
    'copy editor',
    'brochure',
    'branding',
    'signage',
    'billboard',
    'advertising',
    'promotional items',
  ],
  'Events, Marketing & Communications': [
    'event management',
    'event services',
    'marketing',
    'communications',
    'media services',
    'public relations',
    'campaign',
    'exhibition',
    'conference',
    'venue',
  ],
  'Catering & Food Services': [
    'catering',
    'food',
    'nutrition',
    'refreshments',
    'meals',
    'beverages',
    'kitchen',
    'groceries',
    'feeding scheme',
  ],
  'Agriculture, Forestry & Fisheries': [
    'agriculture',
    'farming',
    'forestry',
    'fisheries',
    'aquaculture',
    'livestock',
    'irrigation',
    'animal feed',
    'seedlings',
    'marine living resources',
  ],
  'Environmental Services': [
    'environmental',
    'eia',
    'environmental impact',
    'biodiversity',
    'conservation',
    'climate',
    'emissions',
    'green procurement',
    'sustainable',
    'sustainability',
  ],
  'Manufacturing & Industrial Supplies': [
    'industrial',
    'manufacturing',
    'machinery',
    'tools',
    'spares',
    'bearings',
    'mechanical seals',
    'cnc',
    'steel',
    'consumables',
    'raw materials',
  ],
};

type CategoryRule = {
  category: TenderCategory;
  priority: number;
  patterns: RegExp[];
  excludes?: RegExp[];
};

const categoryRules: CategoryRule[] = [
  {
    category: 'IT & Digital Services',
    priority: 100,
    patterns: [
      /\b(software|application|system\s+(?:implementation|support|maintenance)|ict|i\.?t\.?(?:&n)?|information\s+technology|digital|database|data\s+(?:management|migration|analytics|analysis)|cyber|firewall|server|cloud|endpoint|backup\s+tapes?|computer|laptop|desktop|printer|scanner|website|portal|sage|erp|licen[cs]e)\b/i,
    ],
  },
  {
    category: 'Telecommunications & Connectivity',
    priority: 98,
    patterns: [
      /\b(telecom(?:munications)?|fibre|fiber|broadband|internet|connectivity|wifi|wi-fi|apn|voip|telephone|pbx|radio\s+communication|aruba|access\s+points?|wireless\s+aps?|network\s+switches?|switches)\b/i,
    ],
  },
  {
    category: 'Cleaning & Hygiene',
    priority: 96,
    patterns: [
      /\b(cleaning\s+(?:services?|materials?|consumables?|chemicals?|equipment|supplies)|(?:office|building|facility|facilities|carpet|window|ablution|high\s+pressure)\s+cleaning|cleaning\s+(?:of|for)|janitorial|housekeeping|washroom\s+hygiene|hygiene\s+services?|sanitary\s+bins?)\b/i,
    ],
  },
  {
    category: 'Waste Management & Recycling',
    priority: 94,
    patterns: [
      /\b(waste|refuse|landfill|recycling|recyclable|tyres?|shred|granulat(?:e|ing)|sewerage|hazard(?:ous)?\s+waste|medical\s+waste|wastewater)\b/i,
    ],
  },
  {
    category: 'Health & Safety',
    priority: 92,
    patterns: [
      /\b(occupational\s+health|health\s+and\s+safety|safety\s+consult(?:ing|ant)|risk\s+assessment|hygiene\s+survey|ppe|personal\s+protective|first\s+aid|fire\s+blankets?|biohazard|safety\s+cabinet)\b/i,
    ],
  },
  {
    category: 'Security Services',
    priority: 90,
    patterns: [
      /\b(security|guarding|guards?|surveillance|cctv|access\s+control|alarm|armed\s+response|fencing|perimeter\s+fence|magnetic\s+locks?)\b/i,
    ],
  },
  {
    category: 'Healthcare & Medical',
    priority: 88,
    patterns: [
      /\b(medical|healthcare|pharmaceutical|medicine|clinic|hospital|ambulance|patient|nursing|dental|vaccine|clinical|health\s+services?)\b/i,
    ],
  },
  {
    category: 'Laboratory & Scientific',
    priority: 87,
    patterns: [
      /\b(laborator(?:y|ies)|scientific|microscope|spectrometer|chromatography|centrifuge|analy[sz]er|reagents?|calibration|research\s+equipment)\b/i,
    ],
  },
  {
    category: 'Electrical, Energy & Power',
    priority: 86,
    patterns: [
      /\b(electrical|electricity|power\s+supply|generator|solar|photovoltaic|inverter|battery|ups|substation|transformer|lighting|hvac|air\s*conditioning|refrigeration)\b/i,
    ],
  },
  {
    category: 'Water & Sanitation',
    priority: 84,
    patterns: [
      /\b(water\s+(?:supply|treatment|meter|network|pipeline|pump|reticulation)|sanitation|sewer|sewage|wastewater|stormwater|drainage|borehole|reservoir)\b/i,
    ],
  },
  {
    category: 'Roads & Transport Infrastructure',
    priority: 83,
    patterns: [
      /\b(road|roads|pothole|bridge|traffic\s+signal|streetlight|sidewalk|pavement|asphalt|tar|gravel\s+road|rail|airfield|runway|transport\s+infrastructure)\b/i,
    ],
  },
  {
    category: 'Construction & Civil Works',
    priority: 82,
    patterns: [
      /\b(construction|civil\s+(?:works?|engineering)|building\s+(?:works?|construction)|fit[- ]?out|renovation|refurbishment|alterations?|roof|cidb|built\s+environment|construction\s+monitoring)\b/i,
    ],
  },
  {
    category: 'Building Maintenance & Facilities',
    priority: 80,
    patterns: [
      /\b(facilit(?:y|ies)\s+(?:management|maintenance)|building\s+maintenance|repairs?\s+and\s+maintenance|gardening|landscap(?:e|ing)|grounds?\s+maintenance|plumbing|painting|carpentry|shadeports?|parking\s+bays?)\b/i,
    ],
  },
  {
    category: 'Transport, Logistics & Courier',
    priority: 78,
    patterns: [
      /\b(transport(?:ation)?|logistics|courier|freight|delivery\s+services?|shipping|warehousing|storage|distribution|haulage)\b/i,
    ],
  },
  {
    category: 'Fleet, Vehicles & Plant',
    priority: 76,
    patterns: [
      /\b(vehicle|vehicles|fleet|truck|trailer|bakkie|bus|tractor|plant\s+(?:hire|equipment)|yellow\s+plant|earthmoving|forklift|grader|tlb|leasing\s+of\s+(?:vehicles?|trailers?))\b/i,
    ],
  },
  {
    category: 'Catering & Food Services',
    priority: 74,
    patterns: [
      /\b(catering|food|nutrition|refreshments|meals?|beverages?|kitchen|groceries|feeding\s+scheme)\b/i,
    ],
  },
  {
    category: 'Education & Training',
    priority: 72,
    patterns: [
      /\b(training|workshop|facilitat(?:or|ion)|learnership|education|skills\s+development|curriculum|e[- ]?learning|student\s+accommodation)\b/i,
    ],
  },
  {
    category: 'Financial, Audit & Accounting',
    priority: 70,
    patterns: [
      /\b(audit(?:ors?|ing)?|accounting|bookkeeping|financial\s+(?:system|services?|statements?)|tax|payroll|valuation|asset\s+register)\b/i,
    ],
  },
  {
    category: 'Legal Services',
    priority: 68,
    patterns: [
      /\b(legal|attorneys?|law\s+firm|litigation|conveyancing|forensic\s+investigation|compliance\s+review)\b/i,
    ],
  },
  {
    category: 'Human Resources & Recruitment',
    priority: 66,
    patterns: [
      /\b(recruitment|human\s+resources?|hr\s+services?|employee\s+wellness|background\s+checks?|psychometric|labour\s+relations)\b/i,
    ],
  },
  {
    category: 'Insurance & Risk Services',
    priority: 64,
    patterns: [
      /\b(insurance|brokerage|risk\s+(?:management|services?)|public\s+liability|short[- ]term\s+insurance|cover\s+for)\b/i,
    ],
  },
  {
    category: 'Professional Consulting',
    priority: 62,
    patterns: [
      /\b(consult(?:ant|ing|ancy)|professional\s+services?|advisory|strategy|feasibility\s+study|project\s+management|business\s+plan|research\s+study)\b/i,
    ],
  },
  {
    category: 'Engineering & Technical Services',
    priority: 60,
    patterns: [
      /\b(engineering|technical\s+services?|mechanical\s+engineering|electrical\s+engineering|quantity\s+survey(?:or|ing)|architect(?:ural|s)?|town\s+planning|geotechnical|land\s+survey)\b/i,
    ],
  },
  {
    category: 'Office Supplies, Furniture & Equipment',
    priority: 58,
    patterns: [
      /\b(office\s+(?:supplies|equipment|furniture)|stationery|chairs?|desks?|boardroom|furniture|appliances?|fridges?|printers?|toner|paper|filing\s+cabinets?)\b/i,
    ],
  },
  {
    category: 'Printing, Branding & Publishing',
    priority: 56,
    patterns: [
      /\b(print(?:ing)?|publishing|editor|copy\s+editor|brochures?|branding|signage|billboards?|advert(?:ising|s)?|promotional\s+items?)\b/i,
    ],
  },
  {
    category: 'Events, Marketing & Communications',
    priority: 54,
    patterns: [
      /\b(event\s+(?:management|services?)|marketing|communications?|media\s+services?|public\s+relations|campaign|exhibition|conference|venue)\b/i,
    ],
  },
  {
    category: 'Agriculture, Forestry & Fisheries',
    priority: 52,
    patterns: [
      /\b(agriculture|farming|forestry|fisheries|aquaculture|livestock|irrigation|animal\s+feed|seedlings?|marine\s+living\s+resources)\b/i,
    ],
  },
  {
    category: 'Environmental Services',
    priority: 50,
    patterns: [
      /\b(environmental|eia|environmental\s+impact|biodiversity|conservation|climate|emissions?|green\s+procurement|sustainab(?:le|ility))\b/i,
    ],
  },
  {
    category: 'Manufacturing & Industrial Supplies',
    priority: 48,
    patterns: [
      /\b(industrial|manufacturing|machinery|tools?|spares?|bearings?|mechanical\s+seals?|cnc|steel|consumables?|raw\s+materials?)\b/i,
    ],
  },
];

export function inferTenderCategory(text: string): TenderCategory | undefined {
  const cleaned = normaliseCategoryText(text);
  const matches = categoryRules
    .map((rule) => ({
      rule,
      score: rule.patterns.reduce(
        (total, pattern) => total + (pattern.test(cleaned) ? 1 : 0),
        0,
      ),
    }))
    .filter(({ rule, score }) => {
      if (score === 0) return false;
      return !(rule.excludes || []).some((pattern) => pattern.test(cleaned));
    })
    .sort((a, b) => b.score - a.score || b.rule.priority - a.rule.priority);

  return matches[0]?.rule.category;
}

export function inferTenderCategoryFromSearchText(
  text: string,
): TenderCategory | undefined {
  const direct = inferTenderCategory(text);
  if (direct) return direct;

  const cleaned = normaliseCategoryText(text).toLowerCase();
  if (!cleaned) return undefined;

  const words = new Set(cleaned.split(/[^a-z0-9]+/).filter(Boolean));
  const matches = TENDER_CATEGORIES.map((category) => {
    const score = getTenderCategorySearchKeywords(category).reduce(
      (total, keyword) => {
        const normalizedKeyword = keyword.toLowerCase();
        if (normalizedKeyword === cleaned) return total + 3;
        if (normalizedKeyword.includes(' ')) {
          return cleaned.includes(normalizedKeyword) ? total + 2 : total;
        }
        return words.has(normalizedKeyword) ? total + 1 : total;
      },
      0,
    );

    return { category, score };
  })
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        getCategoryPriority(b.category) - getCategoryPriority(a.category),
    );

  return matches[0]?.category;
}

export function isGenericTenderCategory(category?: string | null) {
  return GENERIC_TENDER_CATEGORIES.has((category || '').trim().toLowerCase());
}

export function normaliseTenderCategory(
  category?: string | null,
): TenderCategory | null {
  const cleanCategory = (category || '').trim();
  if (!cleanCategory || isGenericTenderCategory(cleanCategory)) return null;
  return LEGACY_TENDER_CATEGORY_ALIASES[cleanCategory] || null;
}

export function getTenderCategorySearchKeywords(
  category?: string | null,
): string[] {
  const cleanCategory = (category || '').trim();
  const normalised = (TENDER_CATEGORIES as readonly string[]).includes(
    cleanCategory,
  )
    ? (cleanCategory as TenderCategory)
    : normaliseTenderCategory(cleanCategory);

  if (!normalised) return [];
  return [...new Set([normalised, ...CATEGORY_SEARCH_KEYWORDS[normalised]])];
}

export function buildTenderCategorySearchText(category?: string | null) {
  return getTenderCategorySearchKeywords(category).join(' ');
}

function normaliseCategoryText(text: string) {
  return text.replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function getCategoryPriority(category: TenderCategory) {
  return (
    categoryRules.find((rule) => rule.category === category)?.priority || 0
  );
}
