// Mock data for guest user demo experience

export const MOCK_SESSIONS = [
  {
    id: '1',
    date: getDateString(0), // Today
    start_time: '09:00',
    end_time: '10:30',
    session_type: 'individual_training',
    court: { name: 'Court 1' },
    coach: { name: 'Coach Martinez' },
  },
  {
    id: '2',
    date: getDateString(1), // Tomorrow
    start_time: '14:00',
    end_time: '15:30',
    session_type: 'group_training',
    court: { name: 'Court 3' },
    coach: { name: 'Coach Garcia' },
  },
  {
    id: '3',
    date: getDateString(2),
    start_time: '10:00',
    end_time: '11:30',
    session_type: 'match_play',
    court: { name: 'Court 2' },
    coach: { name: 'Coach Martinez' },
  },
  {
    id: '4',
    date: getDateString(4),
    start_time: '16:00',
    end_time: '17:30',
    session_type: 'fitness',
    court: { name: 'Gym' },
    coach: { name: 'Coach Rodriguez' },
  },
]

export const MOCK_TOURNAMENTS = [
  {
    id: '1',
    name: 'Junior Open Championship',
    start_date: getDateString(14),
    end_date: getDateString(17),
    location: 'Barcelona Tennis Club',
    surface: 'clay',
    category: 'U16',
  },
  {
    id: '2',
    name: 'Regional Masters Series',
    start_date: getDateString(30),
    end_date: getDateString(33),
    location: 'Valencia Sports Center',
    surface: 'hard',
    category: 'U18',
  },
  {
    id: '3',
    name: 'Summer Cup',
    start_date: getDateString(45),
    end_date: getDateString(47),
    location: 'Madrid Tennis Academy',
    surface: 'hard',
    category: 'Open',
  },
]

export const MOCK_GOALS = [
  {
    id: '1',
    title: 'Improve first serve percentage',
    goal_type: 'practice',
    target_value: 70,
    current_value: 58,
    target_unit: '%',
    status: 'active',
    target_date: getDateString(30),
  },
  {
    id: '2',
    title: 'Run 5K under 25 minutes',
    goal_type: 'conditioning',
    target_value: 25,
    current_value: 27,
    target_unit: 'minutes',
    status: 'active',
    target_date: getDateString(60),
  },
  {
    id: '3',
    title: 'Increase backhand consistency',
    goal_type: 'practice',
    target_value: 80,
    current_value: 80,
    target_unit: '%',
    status: 'completed',
    target_date: getDateString(-10),
  },
]

export const MOCK_MATCH_RESULTS = [
  {
    id: '1',
    opponent_name: 'Carlos Vega',
    round: 'Final',
    match_date: getDateString(-7),
    result: 'win',
    score: '6-4, 7-5',
    holds: 10,
    breaks: 3,
  },
  {
    id: '2',
    opponent_name: 'Miguel Santos',
    round: 'Semi-final',
    match_date: getDateString(-8),
    result: 'win',
    score: '6-2, 6-3',
    holds: 8,
    breaks: 4,
  },
  {
    id: '3',
    opponent_name: 'Pablo Ruiz',
    round: 'Quarter-final',
    match_date: getDateString(-9),
    result: 'win',
    score: '6-4, 4-6, 6-2',
    holds: 12,
    breaks: 5,
  },
  {
    id: '4',
    opponent_name: 'David Torres',
    round: 'Final',
    match_date: getDateString(-21),
    result: 'loss',
    score: '4-6, 6-7',
    holds: 7,
    breaks: 1,
  },
  {
    id: '5',
    opponent_name: 'Luis Gomez',
    round: 'Semi-final',
    match_date: getDateString(-22),
    result: 'win',
    score: '6-3, 6-4',
    holds: 9,
    breaks: 3,
  },
]

export const MOCK_FITNESS_LOGS = [
  {
    id: '1',
    log_date: getDateString(-1),
    category: 'strength',
    exercise_name: 'Squats',
    sets: 4,
    reps: 12,
    weight_kg: 60,
    rpe: 7,
  },
  {
    id: '2',
    log_date: getDateString(-1),
    category: 'conditioning',
    exercise_name: 'Sprint intervals',
    duration_seconds: 1800,
    rpe: 8,
  },
  {
    id: '3',
    log_date: getDateString(-3),
    category: 'flexibility',
    exercise_name: 'Yoga session',
    duration_seconds: 2700,
    rpe: 5,
  },
]

export const MOCK_SESSION_RATINGS = [
  {
    id: '1',
    session_date: getDateString(-1),
    overall_rating: 4,
    effort_rating: 5,
    technique_rating: 4,
    attitude_rating: 5,
    tactical_rating: 3,
    duration_minutes: 90,
    intensity_level: 7,
  },
  {
    id: '2',
    session_date: getDateString(-3),
    overall_rating: 5,
    effort_rating: 5,
    technique_rating: 4,
    attitude_rating: 5,
    tactical_rating: 4,
    duration_minutes: 120,
    intensity_level: 8,
  },
  {
    id: '3',
    session_date: getDateString(-5),
    overall_rating: 3,
    effort_rating: 4,
    technique_rating: 3,
    attitude_rating: 4,
    tactical_rating: 3,
    duration_minutes: 90,
    intensity_level: 6,
  },
]

// Helper function to get date strings relative to today (uses local timezone)
function getDateString(daysFromToday: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)
  // Use local date formatting to match date-fns format()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Stats calculations for guest user
export const MOCK_STATS = {
  wins: 4,
  losses: 1,
  winRate: '80.0',
  totalHolds: 46,
  totalBreaks: 16,
  weeklyTrainingHours: '8.5',
  averageIntensity: '7.2',
  goalsCompleted: 1,
  goalsTotal: 3,
  goalCompletionRate: '33',
}

// Mock data for coach view
export const MOCK_PLAYERS = [
  {
    id: 'player-1',
    name: 'Carlos Martinez',
    email: 'carlos@example.com',
    age: 16,
    level: 'Advanced',
  },
  {
    id: 'player-2',
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    age: 14,
    level: 'Intermediate',
  },
  {
    id: 'player-3',
    name: 'Miguel Santos',
    email: 'miguel@example.com',
    age: 17,
    level: 'Advanced',
  },
  {
    id: 'player-4',
    name: 'Elena Garcia',
    email: 'elena@example.com',
    age: 15,
    level: 'Intermediate',
  },
  {
    id: 'player-5',
    name: 'Pablo Ruiz',
    email: 'pablo@example.com',
    age: 16,
    level: 'Advanced',
  },
]

export const MOCK_TODAY_SESSIONS = [
  {
    id: 'session-1',
    start_time: '09:00',
    end_time: '10:30',
    session_type: 'individual_training',
    court: { name: 'Court 1' },
    players: [{ name: 'Carlos Martinez' }],
  },
  {
    id: 'session-2',
    start_time: '11:00',
    end_time: '12:30',
    session_type: 'group_training',
    court: { name: 'Court 2' },
    players: [{ name: 'Sofia Rodriguez' }, { name: 'Elena Garcia' }],
  },
  {
    id: 'session-3',
    start_time: '15:00',
    end_time: '16:30',
    session_type: 'match_play',
    court: { name: 'Court 1' },
    players: [{ name: 'Miguel Santos' }, { name: 'Pablo Ruiz' }],
  },
]

export const MOCK_COACH_STATS = {
  playersCount: 5,
  todaySessionsCount: 3,
  weekSessionsCount: 12,
}

// Mock data for Session Grid (calendar view)
export const MOCK_CALENDAR_SESSIONS = [
  {
    id: 'cal-session-1',
    date: getDateString(0),
    start_time: '09:00',
    end_time: '10:30',
    session_type: 'individual_training',
    court_id: 'hc1',
    coach: { name: 'Tom P' },
    court: { name: 'HC 1' },
    players: [{ name: 'Carlos Martinez' }],
    is_private: false,
  },
  {
    id: 'cal-session-2',
    date: getDateString(0),
    start_time: '09:00',
    end_time: '10:30',
    session_type: 'group_training',
    court_id: 'clay1',
    coach: { name: 'Andris' },
    court: { name: 'Clay 1' },
    players: [{ name: 'Sofia Rodriguez' }, { name: 'Elena Garcia' }],
    is_private: false,
  },
  {
    id: 'cal-session-3',
    date: getDateString(0),
    start_time: '11:00',
    end_time: '12:30',
    session_type: 'match_play',
    court_id: 'hc2',
    coach: { name: 'Sergio' },
    court: { name: 'HC 2' },
    players: [{ name: 'Miguel Santos' }, { name: 'Pablo Ruiz' }],
    is_private: false,
  },
  {
    id: 'cal-session-4',
    date: getDateString(0),
    start_time: '14:00',
    end_time: '15:30',
    session_type: 'individual_training',
    court_id: 'clay2',
    coach: { name: 'Tomy' },
    court: { name: 'Clay 2' },
    players: [{ name: 'Carlos Martinez' }],
    is_private: true,
  },
  {
    id: 'cal-session-5',
    date: getDateString(0),
    start_time: '16:00',
    end_time: '17:30',
    session_type: 'group_training',
    court_id: 'hc1',
    coach: { name: 'DK' },
    court: { name: 'HC 1' },
    players: [{ name: 'Sofia Rodriguez' }, { name: 'Miguel Santos' }, { name: 'Elena Garcia' }],
    is_private: false,
  },
  {
    id: 'cal-session-6',
    date: getDateString(1),
    start_time: '10:00',
    end_time: '11:30',
    session_type: 'individual_training',
    court_id: 'clay3',
    coach: { name: 'Joe D' },
    court: { name: 'Clay 3' },
    players: [{ name: 'Pablo Ruiz' }],
    is_private: false,
  },
]

// Mock data for Tournament Calendar
export const MOCK_CALENDAR_TOURNAMENTS = [
  {
    id: 'tour-0',
    name: 'Winter Training Cup',
    start_date: getDateString(0), // Current week - starts today
    end_date: getDateString(3),
    location: 'SotoTennis Academy',
    tournament_type: 'proximity',
    category: 'U16',
    level: 'Grade 4',
    assignments: [
      { role: 'coach', coach: { name: 'Coach Martinez' } },
      { role: 'player', player: { name: 'Carlos Martinez' } },
      { role: 'player', player: { name: 'Miguel Santos' } },
    ],
  },
  {
    id: 'tour-1',
    name: 'Junior Open Championship',
    start_date: getDateString(7),
    end_date: getDateString(10),
    location: 'Barcelona Tennis Club',
    tournament_type: 'proximity',
    category: 'U16',
    level: 'Grade 3',
    assignments: [
      { role: 'coach', coach: { name: 'Coach Martinez' } },
      { role: 'player', player: { name: 'Carlos Martinez' } },
      { role: 'player', player: { name: 'Sofia Rodriguez' } },
    ],
  },
  {
    id: 'tour-2',
    name: 'Regional Masters Series',
    start_date: getDateString(14),
    end_date: getDateString(17),
    location: 'Valencia Sports Center',
    tournament_type: 'national',
    category: 'U18',
    level: 'Grade 2',
    assignments: [
      { role: 'coach', coach: { name: 'Coach Garcia' } },
      { role: 'player', player: { name: 'Miguel Santos' } },
      { role: 'player', player: { name: 'Pablo Ruiz' } },
      { role: 'player', player: { name: 'Elena Garcia' } },
    ],
  },
  {
    id: 'tour-3',
    name: 'International Youth Cup',
    start_date: getDateString(21),
    end_date: getDateString(25),
    location: 'Madrid Tennis Academy',
    tournament_type: 'international',
    category: 'U16',
    level: 'Grade 1',
    assignments: [
      { role: 'coach', coach: { name: 'Coach Martinez' } },
      { role: 'player', player: { name: 'Carlos Martinez' } },
    ],
  },
  {
    id: 'tour-4',
    name: 'Summer Cup',
    start_date: getDateString(7),
    end_date: getDateString(9),
    location: 'Seville Tennis Center',
    tournament_type: 'proximity',
    category: 'U14',
    level: 'Grade 4',
    assignments: [
      { role: 'player', player: { name: 'Sofia Rodriguez' } },
    ],
  },
  {
    id: 'tour-5',
    name: 'Adults Championship',
    start_date: getDateString(14),
    end_date: getDateString(16),
    location: 'Malaga Sports Complex',
    tournament_type: 'national',
    category: 'Adults',
    level: 'Open',
    assignments: [],
  },
]
