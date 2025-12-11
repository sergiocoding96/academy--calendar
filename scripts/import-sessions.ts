/**
 * CSV Import Script for Daily Sessions
 *
 * This script parses the daily operations CSV and imports sessions into Supabase.
 * Run with: npx ts-node scripts/import-sessions.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase configuration - use environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// Court mapping from CSV columns to database
const COURT_COLUMNS: Record<number, string> = {
  1: 'HC 1',
  3: 'HC 2',
  5: 'Clay 1',
  7: 'Clay 2',
  9: 'Clay 3',
  11: 'HC 3',
}

// Time parsing helper
function parseTime(row: number): string {
  const baseHour = 7
  const halfHourOffset = Math.floor((row - 4) / 2)
  const isHalfHour = (row - 4) % 2 === 1

  const hour = baseHour + Math.floor(halfHourOffset)
  const minutes = isHalfHour ? '30' : '00'

  return `${hour.toString().padStart(2, '0')}:${minutes}`
}

// Main import function
async function importSessions(csvPath: string, date: string) {
  console.log(`Importing sessions from ${csvPath} for date ${date}`)

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvContent.split('\n')

  // Get court IDs from database
  const { data: courts } = await supabase.from('courts').select('id, name')
  const courtMap = new Map(courts?.map(c => [c.name, c.id]) || [])

  // Get coach IDs from database
  const { data: coaches } = await supabase.from('coaches').select('id, name')
  const coachMap = new Map(coaches?.map(c => [c.name.toLowerCase(), c.id]) || [])

  // Get or create players
  const playerMap = new Map<string, string>()

  async function getOrCreatePlayer(name: string): Promise<string | null> {
    if (!name || name.trim() === '') return null

    const normalizedName = name.trim()

    if (playerMap.has(normalizedName)) {
      return playerMap.get(normalizedName)!
    }

    // Check if player exists
    const { data: existing } = await supabase
      .from('players')
      .select('id')
      .ilike('name', normalizedName)
      .single()

    if (existing) {
      playerMap.set(normalizedName, existing.id)
      return existing.id
    }

    // Create new player
    const { data: newPlayer, error } = await supabase
      .from('players')
      .insert({ name: normalizedName, status: 'active' })
      .select('id')
      .single()

    if (error) {
      console.error(`Error creating player ${normalizedName}:`, error)
      return null
    }

    playerMap.set(normalizedName, newPlayer.id)
    return newPlayer.id
  }

  // Process each row (starting from row 4 which is 7:00)
  for (let rowIndex = 4; rowIndex < lines.length; rowIndex++) {
    const row = lines[rowIndex]
    if (!row.trim()) continue

    const cells = row.split(',')
    const timeSlot = parseTime(rowIndex)

    // Process each court column
    for (const [colIndex, courtName] of Object.entries(COURT_COLUMNS)) {
      const col = parseInt(colIndex)
      const coachCell = cells[col]?.trim() || ''
      const playerCell = cells[col + 1]?.trim() || ''

      if (!coachCell && !playerCell) continue

      // Determine if this is a private session
      const isPrivate = playerCell.toLowerCase().includes('private')

      // Find coach ID
      let coachId: string | null = null
      for (const [coachName, id] of coachMap) {
        if (coachCell.toLowerCase().includes(coachName)) {
          coachId = id
          break
        }
      }

      // Get court ID
      const courtId = courtMap.get(courtName) || null

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          date,
          start_time: timeSlot,
          end_time: `${parseInt(timeSlot.split(':')[0])}:${timeSlot.split(':')[1] === '00' ? '30' : '00'}`,
          court_id: courtId,
          coach_id: coachId,
          session_type: isPrivate ? 'private' : 'training',
          is_private: isPrivate,
        })
        .select('id')
        .single()

      if (sessionError) {
        console.error(`Error creating session:`, sessionError)
        continue
      }

      // Add players to session
      const playerNames = playerCell
        .replace(/private/gi, '')
        .split(/[,&]/)
        .map(p => p.trim())
        .filter(p => p.length > 0)

      for (const playerName of playerNames) {
        const playerId = await getOrCreatePlayer(playerName)
        if (playerId && session) {
          await supabase.from('session_players').insert({
            session_id: session.id,
            player_id: playerId,
            status: 'confirmed',
          })
        }
      }
    }
  }

  console.log('Import completed!')
}

// Run import
const csvFile = path.join(__dirname, '../data/Wk 49 20251201 - Wed, Dec 3.csv')
const sessionDate = '2025-12-03' // Wednesday, Dec 3

importSessions(csvFile, sessionDate).catch(console.error)
