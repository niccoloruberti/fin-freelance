// Aliquote INPS per anno fiscale.
// Fonti: circolari INPS annuali (tipicamente febbraio).
// Aggiornare ogni anno aggiungendo una nuova entry.

export interface InpsRatesForYear {
  gestione_separata: {
    rate: number;    // aliquota IVS + ISCRO (es. 0.2607)
    ceiling: number; // massimale contributivo annuo (€)
  };
  artigiani_commercianti: {
    rate: number;         // aliquota IVS eccedente il minimale
    minimum: number;      // contributo fisso minimo annuo (€)
    minThreshold: number; // reddito minimale (€)
  };
  cassa_professionale: {
    rate: number; // aliquota integrativa indicativa (varia per cassa)
  };
}

// Fonti per anno:
// 2024: circ. INPS n. 25 del 06/02/2024
// 2025: circ. INPS n. 26 del 12/02/2025
// 2026: circ. INPS n. 8  del 03/02/2026
export const INPS_RATES: Record<number, InpsRatesForYear> = {
  2024: {
    gestione_separata: {
      rate: 0.2635,   // 26.35% (IVS 25% + 0.72% + 0.35% ISCRO)
      ceiling: 119650,
    },
    artigiani_commercianti: {
      rate: 0.2400,
      minimum: 4292.15,
      minThreshold: 17504,
    },
    cassa_professionale: {
      rate: 0.04,
    },
  },
  2025: {
    gestione_separata: {
      rate: 0.2607,   // 26.07%
      ceiling: 120607,
    },
    artigiani_commercianti: {
      rate: 0.2448,
      minimum: 4427.04,
      minThreshold: 18415,
    },
    cassa_professionale: {
      rate: 0.04,
    },
  },
  2026: {
    gestione_separata: {
      rate: 0.2607,
      ceiling: 122295,
    },
    artigiani_commercianti: {
      rate: 0.2448,
      minimum: 4521.36,
      minThreshold: 18808,
    },
    cassa_professionale: {
      rate: 0.04,
    },
  },
};

/**
 * Restituisce le aliquote INPS per l'anno richiesto.
 * Se l'anno non è presente, usa l'anno più recente disponibile come fallback.
 */
export function getInpsRatesForYear(year: number): InpsRatesForYear {
  if (INPS_RATES[year]) {
    return INPS_RATES[year];
  }
  const availableYears = Object.keys(INPS_RATES).map(Number).sort((a, b) => b - a);
  return INPS_RATES[availableYears[0]];
}
