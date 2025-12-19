'use client'

import { useState, useMemo, useCallback } from 'react'
import { Users, Shuffle, ChevronDown, Check, Lock, X, AlertTriangle, Sparkles, RefreshCw, Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  demoUTRPlayers,
  generateScheduleOptions,
  togglePlayerAvailability,
  updatePlayerConstraint,
  getDirectionColor,
  type UTRPlayer,
  type ScheduleOption,
  type GeneratedMatchup,
  type TimeSlot,
  type Surface,
} from '@/lib/demo-data/utr-players'

type WorkflowStep = 'constraints' | 'review' | 'finalize'

export default function UTRMatchupsPage() {
  const [players, setPlayers] = useState<UTRPlayer[]>(demoUTRPlayers)
  const [scheduleOptions, setScheduleOptions] = useState<ScheduleOption[] | null>(null)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null)
  const [lockedMatchups, setLockedMatchups] = useState<Set<string>>(new Set())
  const [rejectedMatchups, setRejectedMatchups] = useState<Set<string>>(new Set())
  const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('constraints')

  const availablePlayers = useMemo(() => players.filter(p => p.available), [players])

  const selectedSchedule = useMemo(() => {
    if (!scheduleOptions || !selectedScheduleId) return null
    return scheduleOptions.find(s => s.id === selectedScheduleId) || null
  }, [scheduleOptions, selectedScheduleId])

  const handleTogglePlayer = useCallback((playerId: string) => {
    setPlayers(prev => togglePlayerAvailability(playerId, prev))
    setScheduleOptions(null)
    setWorkflowStep('constraints')
  }, [])

  const handleUpdateConstraint = useCallback((
    playerId: string,
    field: 'timeSlot' | 'surfaceConstraint',
    value: TimeSlot | Surface
  ) => {
    setPlayers(prev => updatePlayerConstraint(playerId, prev, field, value))
    setScheduleOptions(null)
    setWorkflowStep('constraints')
  }, [])

  const handleGenerateMatchups = useCallback(() => {
    const options = generateScheduleOptions(players, 3)
    setScheduleOptions(options)
    setSelectedScheduleId(options[0]?.id || null)
    setLockedMatchups(new Set())
    setRejectedMatchups(new Set())
    setWorkflowStep('review')
  }, [players])

  const handleSelectSchedule = useCallback((scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    setLockedMatchups(new Set())
    setRejectedMatchups(new Set())
  }, [])

  const handleLockMatchup = useCallback((matchupId: string) => {
    setLockedMatchups(prev => {
      const next = new Set(prev)
      next.add(matchupId)
      return next
    })
    setRejectedMatchups(prev => {
      const next = new Set(prev)
      next.delete(matchupId)
      return next
    })
  }, [])

  const handleRejectMatchup = useCallback((matchupId: string) => {
    setRejectedMatchups(prev => {
      const next = new Set(prev)
      next.add(matchupId)
      return next
    })
    setLockedMatchups(prev => {
      const next = new Set(prev)
      next.delete(matchupId)
      return next
    })
  }, [])

  const handleRemixRejected = useCallback(() => {
    // Re-generate schedule options, keeping locked matches in mind
    const newOptions = generateScheduleOptions(players, 3)
    setScheduleOptions(newOptions)
    setSelectedScheduleId(newOptions[0]?.id || null)
    setRejectedMatchups(new Set())
  }, [players])

  const handleFinalize = useCallback(() => {
    setWorkflowStep('finalize')
  }, [])

  const pendingMatchups = selectedSchedule?.matchups.filter(
    m => !lockedMatchups.has(m.id) && !rejectedMatchups.has(m.id)
  ) || []

  const allDecided = selectedSchedule && pendingMatchups.length === 0

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">UTR Friday Matchups</h1>
          </div>
          <p className="text-stone-600">Generate balanced practice matchups based on UTR ratings and constraints</p>

          {/* Workflow Steps */}
          <div className="flex items-center gap-2 mt-6">
            {(['constraints', 'review', 'finalize'] as const).map((step, idx) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  workflowStep === step
                    ? "bg-blue-500 text-white"
                    : workflowStep === 'finalize' || (workflowStep === 'review' && idx === 0)
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-100 text-stone-500"
                )}>
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
                    {idx + 1}
                  </span>
                  {step === 'constraints' && 'Set Constraints'}
                  {step === 'review' && 'Review Matchups'}
                  {step === 'finalize' && 'Finalized'}
                </div>
                {idx < 2 && <div className="w-8 h-0.5 bg-stone-200 mx-1" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {workflowStep === 'constraints' && (
          <div className="space-y-6">
            {/* Player Selection with Constraints */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-stone-800">Available Players & Constraints</h2>
                  <p className="text-sm text-stone-500 mt-1">
                    Select players and set their time/surface preferences
                  </p>
                </div>
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {availablePlayers.length} selected
                </span>
              </div>

              <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                {[...players].sort((a, b) => b.utr - a.utr).map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onToggle={() => handleTogglePlayer(player.id)}
                    onUpdateConstraint={(field, value) => handleUpdateConstraint(player.id, field, value)}
                  />
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateMatchups}
              disabled={availablePlayers.length < 2}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all",
                availablePlayers.length >= 2
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              )}
            >
              <Sparkles className="w-5 h-5" />
              Generate Matchup Options
              {availablePlayers.length >= 2 && (
                <span className="text-blue-200 text-sm ml-2">({Math.floor(availablePlayers.length / 2)} matches)</span>
              )}
            </button>
          </div>
        )}

        {workflowStep === 'review' && scheduleOptions && (
          <div className="space-y-6">
            {/* Schedule Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheduleOptions.map((option) => (
                <ScheduleOptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedScheduleId === option.id}
                  onSelect={() => handleSelectSchedule(option.id)}
                />
              ))}
            </div>

            {/* Selected Schedule Details */}
            {selectedSchedule && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                    <Shuffle className="w-5 h-5 text-blue-500" />
                    Matchups ({selectedSchedule.matchups.length})
                  </h3>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" /> {lockedMatchups.size} locked
                    </span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                      <X className="w-3 h-3" /> {rejectedMatchups.size} rejected
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedSchedule.matchups.map((matchup) => (
                    <MatchupCard
                      key={matchup.id}
                      matchup={matchup}
                      isLocked={lockedMatchups.has(matchup.id)}
                      isRejected={rejectedMatchups.has(matchup.id)}
                      onLock={() => handleLockMatchup(matchup.id)}
                      onReject={() => handleRejectMatchup(matchup.id)}
                    />
                  ))}
                </div>

                {/* Unmatched Players */}
                {selectedSchedule.unmatchedPlayers.length > 0 && (
                  <div className="bg-stone-100 rounded-xl p-4">
                    <h4 className="font-medium text-stone-600 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Unmatched Players ({selectedSchedule.unmatchedPlayers.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSchedule.unmatchedPlayers.map((player) => (
                        <span
                          key={player.id}
                          className="px-3 py-1 bg-white rounded-full text-sm text-stone-600 border border-stone-200"
                        >
                          {player.name} ({player.utr})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setWorkflowStep('constraints')}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Back to Constraints
                  </button>
                  {rejectedMatchups.size > 0 && (
                    <button
                      onClick={handleRemixRejected}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Remix Rejected
                    </button>
                  )}
                  <button
                    onClick={handleFinalize}
                    disabled={!allDecided}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                      allDecided
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-stone-200 text-stone-400 cursor-not-allowed"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    {allDecided ? 'Finalize Schedule' : `${pendingMatchups.length} matchups pending`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {workflowStep === 'finalize' && selectedSchedule && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">Schedule Finalized!</h2>
              <p className="text-green-600">
                {lockedMatchups.size} matchups confirmed for Friday practice session
              </p>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-800 mb-4">Final Schedule</h3>
              <div className="space-y-3">
                {selectedSchedule.matchups
                  .filter(m => lockedMatchups.has(m.id))
                  .map((matchup) => (
                    <FinalMatchupCard key={matchup.id} matchup={matchup} />
                  ))}
              </div>
            </div>

            <button
              onClick={() => {
                setWorkflowStep('constraints')
                setScheduleOptions(null)
                setLockedMatchups(new Set())
                setRejectedMatchups(new Set())
              }}
              className="w-full px-4 py-3 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
            >
              Start New Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function PlayerRow({
  player,
  onToggle,
  onUpdateConstraint,
}: {
  player: UTRPlayer
  onToggle: () => void
  onUpdateConstraint: (field: 'timeSlot' | 'surfaceConstraint', value: TimeSlot | Surface) => void
}) {
  return (
    <div className={cn(
      "flex items-center gap-4 px-4 py-3 transition-colors",
      player.available ? "bg-white" : "bg-stone-50"
    )}>
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={cn(
          "w-6 h-6 rounded flex items-center justify-center border-2 transition-colors",
          player.available
            ? "bg-blue-500 border-blue-500"
            : "bg-white border-stone-300 hover:border-stone-400"
        )}
      >
        {player.available && <Check className="w-4 h-4 text-white" />}
      </button>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium",
            player.available ? "text-stone-800" : "text-stone-400"
          )}>
            {player.name}
          </span>
          <span className={cn(
            "text-sm font-bold",
            player.available ? "text-blue-600" : "text-stone-400"
          )}>
            {player.utr.toFixed(2)}
          </span>
          {player.recentOpponents.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded">
              {player.recentOpponents.length} recent
            </span>
          )}
        </div>
        <div className="text-xs text-stone-400">
          Age {player.age} | Coach: {player.leadCoach}
        </div>
      </div>

      {/* Constraints */}
      {player.available && (
        <div className="flex items-center gap-2">
          {/* Time Constraint */}
          <div className="relative">
            <select
              value={player.timeSlot}
              onChange={(e) => onUpdateConstraint('timeSlot', e.target.value as TimeSlot)}
              className="appearance-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any Time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
            <Clock className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
          </div>

          {/* Surface Constraint */}
          <div className="relative">
            <select
              value={player.surfaceConstraint}
              onChange={(e) => onUpdateConstraint('surfaceConstraint', e.target.value as Surface)}
              className="appearance-none bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="any">Any Surface</option>
              <option value="hard">Hard</option>
              <option value="clay">Clay</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-400 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: ScheduleOption
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "p-4 rounded-xl border-2 text-left transition-all",
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-stone-200 bg-white hover:border-stone-300"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-600">Option {option.id.split('-')[1]}</span>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", option.scoreColor)} />
          <span className={cn(
            "text-lg font-bold",
            option.scoreLabel === 'excellent' ? 'text-green-600' :
            option.scoreLabel === 'good' ? 'text-blue-600' :
            option.scoreLabel === 'ok' ? 'text-orange-600' : 'text-red-600'
          )}>
            {option.score}
          </span>
        </div>
      </div>

      <div className="text-xs text-stone-500 space-y-1">
        <div className="flex justify-between">
          <span>UTR Balance</span>
          <span className="font-medium text-stone-700">{option.breakdown.utrBalance}%</span>
        </div>
        <div className="flex justify-between">
          <span>Recent Avoidance</span>
          <span className="font-medium text-stone-700">{option.breakdown.recentAvoidance}%</span>
        </div>
        <div className="flex justify-between">
          <span>Coach Match</span>
          <span className="font-medium text-stone-700">{option.breakdown.coachCoverage}%</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-500">
        {option.matchups.length} matches | {option.unmatchedPlayers.length} unmatched
      </div>
    </button>
  )
}

function MatchupCard({
  matchup,
  isLocked,
  isRejected,
  onLock,
  onReject,
}: {
  matchup: GeneratedMatchup
  isLocked: boolean
  isRejected: boolean
  onLock: () => void
  onReject: () => void
}) {
  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      isLocked ? "bg-green-50 border-green-300" :
      isRejected ? "bg-red-50 border-red-300 opacity-60" :
      matchup.isRecentMatch ? "bg-stone-100 border-stone-300" :
      matchup.qualityColor
    )}>
      <div className="flex items-center justify-between">
        {/* Match Info */}
        <div className="flex items-center gap-4 flex-1">
          {/* Player 1 */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                getDirectionColor(matchup.player1Direction)
              )}>
                {matchup.player1Direction === 'up' ? 'Playing Up' : matchup.player1Direction === 'down' ? 'Playing Down' : 'Equal'}
              </span>
            </div>
            <div className="font-bold text-stone-800">{matchup.player1.name}</div>
            <div className="text-xl font-bold text-blue-600">{matchup.player1.utr.toFixed(2)}</div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2",
              matchup.isRecentMatch ? "bg-stone-200 border-stone-400 text-stone-600" : "bg-white border-current"
            )}>
              VS
            </div>
            {matchup.isRecentMatch && (
              <span className="text-xs text-stone-500 mt-1">Recent</span>
            )}
          </div>

          {/* Player 2 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium",
                getDirectionColor(matchup.player2Direction)
              )}>
                {matchup.player2Direction === 'up' ? 'Playing Up' : matchup.player2Direction === 'down' ? 'Playing Down' : 'Equal'}
              </span>
            </div>
            <div className="font-bold text-stone-800">{matchup.player2.name}</div>
            <div className="text-xl font-bold text-blue-600">{matchup.player2.utr.toFixed(2)}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onLock}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isLocked
                ? "bg-green-500 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-green-100 hover:text-green-600"
            )}
          >
            <Lock className="w-5 h-5" />
          </button>
          <button
            onClick={onReject}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isRejected
                ? "bg-red-500 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-red-100 hover:text-red-600"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Match Details */}
      <div className="mt-3 pt-3 border-t border-current border-opacity-20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-stone-600">
          <span>{matchup.court}</span>
          <span>{matchup.timeSlot === 'morning' ? 'AM' : matchup.timeSlot === 'afternoon' ? 'PM' : 'Flex'}</span>
          <span className="capitalize">{matchup.surface}</span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" /> {matchup.assignedCoach}
          </span>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full font-medium capitalize",
          matchup.quality === 'excellent' ? 'bg-green-100 text-green-700' :
          matchup.quality === 'good' ? 'bg-blue-100 text-blue-700' :
          matchup.quality === 'stretch' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        )}>
          {matchup.quality}
        </span>
      </div>
    </div>
  )
}

function FinalMatchupCard({ matchup }: { matchup: GeneratedMatchup }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
      <div className="flex-1 flex items-center justify-between">
        <div>
          <div className="font-medium text-stone-800">{matchup.player1.name}</div>
          <div className="text-sm text-blue-600 font-bold">{matchup.player1.utr.toFixed(2)}</div>
        </div>
        <div className="text-stone-400 font-bold">vs</div>
        <div className="text-right">
          <div className="font-medium text-stone-800">{matchup.player2.name}</div>
          <div className="text-sm text-blue-600 font-bold">{matchup.player2.utr.toFixed(2)}</div>
        </div>
      </div>
      <div className="text-xs text-stone-500 text-right">
        <div>{matchup.court}</div>
        <div>{matchup.timeSlot === 'morning' ? 'Morning' : 'Afternoon'}</div>
        <div className="text-stone-400">{matchup.assignedCoach}</div>
      </div>
    </div>
  )
}
