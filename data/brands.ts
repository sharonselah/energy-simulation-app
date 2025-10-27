export type AttributeValue = string | number | undefined;

export type DeviceBrandModel = {
  size: string;
  wattage: number;
  model?: string;
} & {
  [key: string]: AttributeValue;
};

export interface DeviceBrand {
  name: string;
  models: DeviceBrandModel[];
}

export type GenericSizeOption = {
  label: string;
  wattage: number;
} & {
  [key: string]: AttributeValue;
};

export interface DeviceBrandEntry {
  brands: DeviceBrand[];
  generic_sizes?: GenericSizeOption[];
  note?: string;
}

export interface BrandsMetadata {
  source: string;
  note?: string;
  currency: string;
  last_updated: string;
}

export const BRAND_CATALOG: Record<string, DeviceBrandEntry> = {
  "Electric Pressure Cooker": {
    "brands": [
      {
        "name": "Sayona",
        "models": [
          {
            "size": "6L",
            "model": "SPC-100",
            "wattage": 1000
          }
        ]
      },
      {
        "name": "Von",
        "models": [
          {
            "size": "6L",
            "model": "VSCP60MMX",
            "wattage": 1000
          }
        ]
      },
      {
        "name": "Ramtons",
        "models": [
          {
            "size": "6L",
            "model": "RM/582",
            "wattage": 1100
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "5L",
        "wattage": 800
      },
      {
        "label": "6L",
        "wattage": 1000
      },
      {
        "label": "12L",
        "wattage": 1600
      }
    ]
  },
  "Induction Cooker": {
    "brands": [
      {
        "name": "Ramtons",
        "models": [
          {
            "size": "Single burner",
            "model": "RM/381",
            "wattage": 2000,
            "range": "200-2000W adjustable"
          }
        ]
      },
      {
        "name": "Von",
        "models": [
          {
            "size": "Single burner",
            "model": "HPTC-11CW",
            "wattage": 1200,
            "note": "Coil cooker"
          }
        ]
      },
      {
        "name": "Nunix",
        "models": [
          {
            "size": "Single burner",
            "model": "IFC-01",
            "wattage": 1600
          },
          {
            "size": "Double burner",
            "model": "GI-004",
            "wattage": 3000,
            "note": "Infrared cooker"
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "Single burner (Low)",
        "wattage": 1200
      },
      {
        "label": "Single burner (Medium)",
        "wattage": 1600
      },
      {
        "label": "Single burner (High)",
        "wattage": 2000
      },
      {
        "label": "Double burner",
        "wattage": 3000
      },
      {
        "label": "Four zone (commercial)",
        "wattage": 14000
      }
    ]
  },
  "LED Bulb": {
    "brands": [
      {
        "name": "Philips",
        "models": [
          {
            "size": "5W",
            "wattage": 5,
            "lumens": 500
          },
          {
            "size": "9W",
            "wattage": 9,
            "lumens": 900
          },
          {
            "size": "12W",
            "wattage": 12,
            "lumens": 1200
          }
        ]
      },
      {
        "name": "Lumitek",
        "models": [
          {
            "size": "5W",
            "wattage": 5,
            "lumens": 500
          },
          {
            "size": "9W",
            "wattage": 9,
            "lumens": 900
          },
          {
            "size": "12W",
            "wattage": 12,
            "lumens": 1200
          }
        ]
      },
      {
        "name": "Tronic",
        "models": [
          {
            "size": "5W",
            "wattage": 5,
            "lumens": 500
          },
          {
            "size": "9W",
            "wattage": 9,
            "lumens": 900
          },
          {
            "size": "12W",
            "wattage": 12,
            "lumens": 1200
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "5W",
        "wattage": 5,
        "lumens": 500
      },
      {
        "label": "7W",
        "wattage": 7,
        "lumens": 700
      },
      {
        "label": "9W",
        "wattage": 9,
        "lumens": 900
      },
      {
        "label": "12W",
        "wattage": 12,
        "lumens": 1200
      },
      {
        "label": "15W",
        "wattage": 15,
        "lumens": 1500
      }
    ]
  },
  "Refrigerator": {
    "brands": [
      {
        "name": "LG",
        "models": [
          {
            "size": "100-150L Mini",
            "wattage": 70,
            "type": "Single door"
          },
          {
            "size": "200-250L",
            "wattage": 110,
            "type": "Double door"
          },
          {
            "size": "300-400L",
            "wattage": 150,
            "type": "Double door/French door"
          },
          {
            "size": "600L+",
            "wattage": 200,
            "type": "Side-by-side"
          }
        ]
      },
      {
        "name": "Ramtons",
        "models": [
          {
            "size": "126L",
            "model": "RF/173",
            "wattage": 90,
            "type": "Double door"
          },
          {
            "size": "200L",
            "wattage": 110,
            "type": "Double door"
          },
          {
            "size": "300L",
            "wattage": 140,
            "type": "Double door"
          }
        ]
      },
      {
        "name": "Samsung",
        "models": [
          {
            "size": "100-150L Mini",
            "wattage": 75,
            "type": "Single door"
          },
          {
            "size": "200-300L",
            "wattage": 120,
            "type": "Double door"
          },
          {
            "size": "400L+",
            "wattage": 180,
            "type": "French door/Side-by-side"
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "100L Mini (Single door)",
        "wattage": 70
      },
      {
        "label": "150L Small (Single/Double door)",
        "wattage": 90
      },
      {
        "label": "200L Medium (Double door)",
        "wattage": 120
      },
      {
        "label": "300L Large (Double door)",
        "wattage": 150
      },
      {
        "label": "400L+ Extra Large (Side-by-side)",
        "wattage": 200
      }
    ],
    "note": "Actual consumption is typically 40-50% of rated wattage due to compressor cycling"
  },
  "Smart TV": {
    "brands": [
      {
        "name": "Sony",
        "models": [
          {
            "size": "32 inch",
            "wattage": 50,
            "type": "HD/Full HD LED"
          },
          {
            "size": "43 inch",
            "wattage": 96,
            "type": "Full HD/4K LED"
          },
          {
            "size": "55 inch",
            "wattage": 103,
            "type": "4K LED"
          },
          {
            "size": "65 inch",
            "wattage": 150,
            "type": "4K LED"
          }
        ]
      },
      {
        "name": "Samsung",
        "models": [
          {
            "size": "32 inch",
            "wattage": 40,
            "type": "HD/Full HD LED"
          },
          {
            "size": "43 inch",
            "wattage": 80,
            "type": "4K QLED/LED"
          },
          {
            "size": "55 inch",
            "wattage": 102,
            "type": "4K QLED"
          },
          {
            "size": "65 inch",
            "wattage": 143,
            "type": "4K QLED"
          }
        ]
      },
      {
        "name": "LG",
        "models": [
          {
            "size": "32 inch",
            "wattage": 35,
            "type": "HD/Full HD LED"
          },
          {
            "size": "43 inch",
            "wattage": 110,
            "type": "4K LED"
          },
          {
            "size": "55 inch",
            "wattage": 100,
            "type": "4K OLED"
          },
          {
            "size": "65 inch",
            "wattage": 150,
            "type": "4K OLED"
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "24 inch",
        "wattage": 25
      },
      {
        "label": "32 inch",
        "wattage": 45
      },
      {
        "label": "43 inch",
        "wattage": 85
      },
      {
        "label": "50 inch",
        "wattage": 95
      },
      {
        "label": "55 inch",
        "wattage": 105
      },
      {
        "label": "65 inch",
        "wattage": 145
      },
      {
        "label": "75 inch",
        "wattage": 180
      }
    ],
    "note": "Actual power consumption varies by 30-40% based on brightness, content, and settings"
  },
  "Electric Fan": {
    "brands": [
      {
        "name": "Ramtons",
        "models": [
          {
            "size": "16 inch Stand",
            "model": "RM/572",
            "wattage": 40
          },
          {
            "size": "16 inch Stand",
            "model": "RM/159",
            "wattage": 50
          },
          {
            "size": "16 inch Wall",
            "model": "RM/683",
            "wattage": 55
          },
          {
            "size": "Ceiling Fan",
            "model": "RM/420",
            "wattage": 75
          }
        ]
      },
      {
        "name": "Von",
        "models": [
          {
            "size": "12 inch Table",
            "wattage": 35
          },
          {
            "size": "16 inch Stand",
            "wattage": 50
          },
          {
            "size": "16 inch Wall",
            "wattage": 60
          }
        ]
      },
      {
        "name": "Tronic",
        "models": [
          {
            "size": "12 inch Table",
            "wattage": 40
          },
          {
            "size": "16 inch Stand",
            "wattage": 50
          },
          {
            "size": "16 inch Wall",
            "wattage": 55
          }
        ]
      }
    ],
    "generic_sizes": [
      {
        "label": "12 inch Table fan",
        "wattage": 40
      },
      {
        "label": "16 inch Stand fan",
        "wattage": 50
      },
      {
        "label": "16 inch Wall fan",
        "wattage": 60
      },
      {
        "label": "18 inch Industrial fan",
        "wattage": 100
      },
      {
        "label": "Ceiling fan (48 inch)",
        "wattage": 75
      }
    ]
  }
};

export const BRAND_METADATA: BrandsMetadata = {
  "source": "Kenya market research 2024-2025",
  "note": "Wattages are based on manufacturer specifications and market research. Actual power consumption may vary by +/-10% depending on usage conditions, voltage fluctuations, and specific model variations.",
  "currency": "KES",
  "last_updated": "2025-10-27"
};

export type BrandCatalogKey = keyof typeof BRAND_CATALOG;

export interface BrandsData {
  catalog: typeof BRAND_CATALOG;
  metadata: BrandsMetadata;
}

export const BRANDS_DATA: BrandsData = {
  catalog: BRAND_CATALOG,
  metadata: BRAND_METADATA,
};

export default BRANDS_DATA;


