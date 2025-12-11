/**
 * CSV Import Script for Tournaments
 *
 * This script parses the tournament schedule CSV and imports tournaments into Supabase.
 * Run with: npx ts-node scripts/import-tournaments.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Tournament type mapping based on keywords
function getTournamentType(name: string): string {
  const lowerName = name.toLowerCase()
  if (lowerName.includes('itf') || lowerName.includes('te ')) {
    return 'international'
  }
  if (lowerName.includes('marca') || lowerName.includes('nadal') || lowerName.includes('warriors')) {
    return 'national'
  }
  return 'proximity'
}

// Category mapping from row labels
const CATEGORY_ROWS: Record<number, string> = {
  17: 'U18', // ITF Pro
  18: 'U18', // ITF Pro 2
  19: 'U18', // ITF Junior U18
  20: 'U18',
  21: 'U18',
  22: 'U16', // TE 16
  23: 'U16',
  24: 'U14', // TE 14
  25: 'U14',
  26: 'U12', // TE 12
  27: 'U12',
  32: 'Adults', // Regional Absoluto
  33: 'U18', // Regional U18
  34: 'U16', // Regional U16
  35: 'U14', // Regional U14
  36: 'U12', // Regional U12
  38: 'Adults', // IBP Men
  40: 'Adults', // IBP Women
  41: 'U18', // IBP Junior
  43: 'Mixed', // Local
  44: 'Mixed',
  46: 'U18', // Marca 18
  47: 'U16', // Marca 16
  48: 'U14', // Marca 14
  49: 'U12', // Marca 12
  50: 'U16', // Nadal 16
  51: 'U14', // Nadal 14
  52: 'U12', // Nadal 12
  53: 'U16', // Warriors Cadete
  54: 'U14', // Warriors Infantil
  55: 'U12', // Warriors Alevin
  56: 'U10', // Warriors Benjamin
}

// Week to date mapping for 2025
function getWeekDates(weekNumber: number, year: number = 2025): { start: string; end: string } {
  const jan1 = new Date(year, 0, 1)
  const daysToFirstMonday = (8 - jan1.getDay()) % 7
  const firstMonday = new Date(year, 0, 1 + daysToFirstMonday)

  const weekStart = new Date(firstMonday)
  weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return {
    start: weekStart.toISOString().split('T')[0],
    end: weekEnd.toISOString().split('T')[0],
  }
}

// Parse tournament entry from cell
interface TournamentEntry {
  name: string
  coach?: string
  location?: string
}

function parseTournamentCell(cell: string): TournamentEntry | null {
  if (!cell || cell.trim() === '') return null

  const trimmed = cell.trim()

  // Check for coach assignment (e.g., "PORTIMAO J30 TOM P")
  const coachPatterns = ['TOM P', 'JOE D', 'SERGIO', 'TOMY', 'ANDRIS', 'REECE', 'BILLY', 'KATE', 'SOPHIE']
  let coach: string | undefined
  let name = trimmed

  for (const coachName of coachPatterns) {
    if (trimmed.toUpperCase().includes(coachName)) {
      coach = coachName
      name = trimmed.replace(new RegExp(coachName, 'gi'), '').trim()
      break
    }
  }

  // Clean up name
  name = name.replace(/\s+/g, ' ').trim()

  if (name.length < 2) return null

  return { name, coach }
}

// Main import function
async function importTournaments(csvPath: string) {
  console.log(`Importing tournaments from ${csvPath}`)

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n')

  // Get coach IDs
  const { data: coaches } = await supabase.from('coaches').select('id, name')
  const coachMap = new Map(coaches?.map(c => [c.name.toUpperCase(), c.id]) || [])

  // Track inserted tournaments to avoid duplicates
  const insertedTournaments = new Set<string>()

  // Process each tournament row
  for (const [rowIndex, category] of Object.entries(CATEGORY_ROWS)) {
    const row = parseInt(rowIndex)
    if (row >= lines.length) continue

    const cells = lines[row].split(',')

    // Process each week column (columns 8 onwards, alternating week/weekend)
    for (let weekNum = 1; weekNum <= 52; weekNum++) {
      // Column calculation: starts at column 8, each week has 2 columns (week, weekend)
      const weekColIndex = 8 + (weekNum - 1) * 2
      const weekendColIndex = weekColIndex + 1

      const weekCell = cells[weekColIndex]?.trim() || ''
      const weekendCell = cells[weekendColIndex]?.trim() || ''

      // Process week tournament
      for (const cellContent of [weekCell, weekendCell]) {
        const entry = parseTournamentCell(cellContent)
        if (!entry) continue

        // Create unique key to prevent duplicates
        const uniqueKey = `${entry.name}-${weekNum}-${category}`
        if (insertedTournaments.has(uniqueKey)) continue
        insertedTournaments.add(uniqueKey)

        const { start, end } = getWeekDates(weekNum)

        // Insert tournament
        const { data: tournament, error } = await supabase
          .from('tournaments')
          .insert({
            name: entry.name,
            location: entry.name, // Use name as location placeholder
            start_date: start,
            end_date: end,
            category,
            tournament_type: getTournamentType(entry.name),
            status: 'upcoming',
          })
          .select('id')
          .single()

        if (error) {
          console.error(`Error inserting tournament ${entry.name}:`, error)
          continue
        }

        // Assign coach if specified
        if (entry.coach && tournament) {
          const coachId = coachMap.get(entry.coach.toUpperCase())
          if (coachId) {
            await supabase.from('tournament_assignments').insert({
              tournament_id: tournament.id,
              coach_id: coachId,
              role: 'coach',
              status: 'confirmed',
            })
          }
        }

        console.log(`Imported: ${entry.name} (Week ${weekNum}, ${category})`)
      }
    }
  }

  console.log('Tournament import completed!')
}

// Run import
const csvFile = path.join(__dirname, '../data/MASTER Tournament Schedule 25-26 - Sept-Dec 2025.csv')
importTournaments(csvFile).catch(console.error)
