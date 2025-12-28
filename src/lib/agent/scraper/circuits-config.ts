/**
 * Circuit Configurations - All tournament circuits with fetch method and URLs
 *
 * Generated from testing on 2025-12-28
 * HTTP = Free, fast
 * Scrapfly = Reliable, costs credits (for JS-heavy sites)
 */

import { registerCircuit, type CircuitConfig } from './circuit-scraper'

export interface CircuitInfo {
  id: string
  name: string
  url: string
  needsScrapfly: boolean
  categories: string[]
  country: string
  notes?: string
}

/**
 * All configured circuits
 */
export const CIRCUITS: CircuitInfo[] = [
  // === HTTP WORKS (Free) ===
  {
    id: 'rafa_nadal_tour',
    name: 'Rafa Nadal Tour',
    url: 'https://rafanadaltour.com/en/tournaments',
    needsScrapfly: false,
    categories: ['U12', 'U14', 'U16'],
    country: 'Spain',
    notes: 'Junior circuit with U12, U14, U16 categories. Good data quality.',
  },
  {
    id: 'warriors_tour_2026',
    name: 'Warriors Tour 2026',
    url: 'https://warriorstour.org/torneos-2026/',
    needsScrapfly: false,
    categories: ['U10', 'U12', 'U14', 'U16', 'U18'],
    country: 'Spain',
    notes: 'Full junior circuit. Calendar page with all 2026 events.',
  },
  {
    id: 'warriors_tour_main',
    name: 'Warriors Tour',
    url: 'https://warriorstour.org/',
    needsScrapfly: false,
    categories: ['U10', 'U12', 'U14', 'U16', 'U18'],
    country: 'Spain',
    notes: 'Main page with current/upcoming tournaments.',
  },
  {
    id: 'rpt_circuit',
    name: 'RPT MARCA Jóvenes Promesas U16',
    url: 'https://rptenis.org/30-circuito-nacional-rpt-marca-jovenes-promesas-u16-by-wilson/',
    needsScrapfly: false,
    categories: ['U12', 'U14', 'U16', 'U18'],
    country: 'Spain',
    notes: 'National circuit by Wilson. Excellent data with 30+ tournaments.',
  },
  {
    id: 'fat_andalucia',
    name: 'FAT Andalucía',
    url: 'https://fatcom.fatenis.com/fatcom/public/main/home.php?op=1',
    needsScrapfly: false,
    categories: ['U10', 'U12', 'U14', 'U16', 'U18', 'Adults'],
    country: 'Spain',
    notes: 'Andalusian Tennis Federation. Regional tournaments.',
  },

  // === NEEDS SCRAPFLY (JavaScript rendered) ===
  {
    id: 'ibp_young_tour',
    name: 'IBP Young Tour',
    url: 'https://ibptenis.es/circuito-young-tour/',
    needsScrapfly: true,
    categories: ['U12', 'U14', 'U16'],
    country: 'Spain',
    notes: 'JS-rendered page. Requires Scrapfly with render_js.',
  },
  {
    id: 'ibp_pro',
    name: 'IBP Pro Circuit',
    url: 'https://ibptenis.es/circuito-pro/',
    needsScrapfly: true,
    categories: ['Adults'],
    country: 'Spain',
    notes: 'JS-rendered page. Requires Scrapfly with render_js.',
  },
  {
    id: 'itf_mens',
    name: 'ITF Men\'s World Tennis Tour',
    url: 'https://www.itftennis.com/en/tournament-calendar/mens-world-tennis-tour-calendar/?categories=All&startdate=2025-12',
    needsScrapfly: true,
    categories: ['Adults'],
    country: 'International',
    notes: 'Heavy JS site with anti-bot protection.',
  },
  {
    id: 'itf_womens',
    name: 'ITF Women\'s World Tennis Tour',
    url: 'https://www.itftennis.com/en/tournament-calendar/womens-world-tennis-tour-calendar/?categories=All&startdate=2025-12',
    needsScrapfly: true,
    categories: ['Adults'],
    country: 'International',
    notes: 'Heavy JS site with anti-bot protection.',
  },
  {
    id: 'itf_juniors',
    name: 'ITF World Tennis Tour Juniors',
    url: 'https://www.itftennis.com/en/tournament-calendar/world-tennis-tour-juniors-calendar/?categories=All&startdate=2026-02',
    needsScrapfly: true,
    categories: ['U18'],
    country: 'International',
    notes: 'Junior ITF tournaments. Heavy JS.',
  },
  {
    id: 'itf_masters',
    name: 'ITF World Tennis Masters Tour',
    url: 'https://www.itftennis.com/en/tournament-calendar/world-tennis-masters-tour-calendar/',
    needsScrapfly: true,
    categories: ['Veterans'],
    country: 'International',
    notes: 'Veterans/Masters tournaments.',
  },
  {
    id: 'tennis_europe',
    name: 'Tennis Europe',
    url: 'https://www.tenniseurope.org/tournaments/?id=0&st=64',
    needsScrapfly: true,
    categories: ['U12', 'U14', 'U16'],
    country: 'Europe',
    notes: 'European junior circuit. JS-rendered.',
  },
]

/**
 * Get circuits that work with HTTP (free)
 */
export function getHttpCircuits(): CircuitInfo[] {
  return CIRCUITS.filter(c => !c.needsScrapfly)
}

/**
 * Get circuits that need Scrapfly
 */
export function getScrapflyCircuits(): CircuitInfo[] {
  return CIRCUITS.filter(c => c.needsScrapfly)
}

/**
 * Get circuits by category
 */
export function getCircuitsByCategory(category: string): CircuitInfo[] {
  return CIRCUITS.filter(c => c.categories.includes(category))
}

/**
 * Get circuit by ID
 */
export function getCircuitById(id: string): CircuitInfo | undefined {
  return CIRCUITS.find(c => c.id === id)
}

/**
 * Register all circuits with the scraper
 */
export function registerAllCircuits(): void {
  for (const circuit of CIRCUITS) {
    registerCircuit({
      id: circuit.id,
      name: circuit.name,
      calendarUrl: circuit.url,
      needsScrapfly: circuit.needsScrapfly,
      selectors: getSelectorsForCircuit(circuit.id),
    })
  }
  console.log(`[Circuits] Registered ${CIRCUITS.length} circuits`)
}

/**
 * Get custom selectors for known circuits
 */
function getSelectorsForCircuit(circuitId: string): CircuitConfig['selectors'] {
  // Default selectors work for most sites
  const defaultSelectors: CircuitConfig['selectors'] = {
    tournamentCard: '.tournament-card, .event-card, .torneo, article, tr',
    name: 'h3, h4, .title, .nombre, a',
    dates: '.date, .fecha, time',
    location: '.location, .sede, .ciudad',
    category: '.category, .categoria',
  }

  // Custom selectors for specific circuits
  const customSelectors: Record<string, CircuitConfig['selectors']> = {
    rafa_nadal_tour: {
      tournamentCard: '.tournament-card, .torneo-item',
      name: 'h3, .tournament-name',
      dates: '.dates, .fecha',
      location: '.location, .sede',
      category: '.categories',
    },
    rpt_circuit: {
      tournamentCard: 'tr, .tournament-row',
      name: 'td:first-child, .nombre',
      dates: 'td:nth-child(2), .fecha',
      location: 'td:nth-child(3), .sede',
      category: 'td:nth-child(4), .categoria',
    },
    itf_mens: {
      tournamentCard: '.tournament-card, [data-tournament]',
      name: '.tournament-name, h3',
      dates: '.date-range, .dates',
      location: '.location, .venue',
      category: '.category, .grade',
    },
  }

  return customSelectors[circuitId] || defaultSelectors
}

/**
 * Summary statistics
 */
export function getCircuitStats(): {
  total: number
  httpCount: number
  scrapflyCount: number
  byCountry: Record<string, number>
} {
  const httpCount = CIRCUITS.filter(c => !c.needsScrapfly).length
  const scrapflyCount = CIRCUITS.filter(c => c.needsScrapfly).length

  const byCountry: Record<string, number> = {}
  for (const c of CIRCUITS) {
    byCountry[c.country] = (byCountry[c.country] || 0) + 1
  }

  return {
    total: CIRCUITS.length,
    httpCount,
    scrapflyCount,
    byCountry,
  }
}
