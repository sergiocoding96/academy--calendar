import React, { useState } from 'react';

const TennisAnalysisDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const matchData = {
    player: "Nikolai Tingstad",
    opponent: "Opponent",
    location: "Grenada",
    date: "October 24, 2025",
    surface: "Hard",
    level: "National",
    result: "LOSS",
    actualScore: "6-0, 2-6, 6-9 TB",
    totalPoints: { nikolai: 54, opponent: 51 },
  };

  const setData = [
    { set: 1, nikolaiPts: 24, oppPts: 8, nikolaiGames: 6, oppGames: 0, winner: 'nikolai', ues: 1, dfs: 2, firstServe: 73, attackConversion: 85 },
    { set: 2, nikolaiPts: 24, oppPts: 33, nikolaiGames: 2, oppGames: 6, winner: 'opponent', ues: 10, dfs: 7, firstServe: 56, attackConversion: 38 },
    { set: 3, nikolaiPts: 6, oppPts: 10, nikolaiGames: 6, oppGames: 9, winner: 'opponent', ues: 6, dfs: 0, firstServe: 88, isTiebreak: true, attackConversion: 38 },
  ];

  const StatCard = ({ title, value, subtitle, error, reported, actual, small }: any) => (
    <div className={`relative p-${small ? '3' : '4'} rounded-xl ${error ? 'bg-red-900/30 border border-red-500/50' : 'bg-slate-800/50 border border-slate-700/50'} backdrop-blur`}>
      {error && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
          ERR
        </div>
      )}
      <div className="text-slate-400 text-sm font-medium">{title}</div>
      {error ? (
        <div className="mt-1">
          <div className="flex items-center gap-2">
            <span className="text-red-400 line-through text-lg">{reported}</span>
            <span className="text-green-400 text-2xl font-bold">{actual}</span>
          </div>
        </div>
      ) : (
        <div className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-white mt-1`}>{value}</div>
      )}
      {subtitle && <div className="text-slate-500 text-xs mt-1">{subtitle}</div>}
    </div>
  );

  const SetBar = ({ set, data }: any) => {
    const total = data.nikolaiPts + data.oppPts;
    const nikolaiWidth = (data.nikolaiPts / total) * 100;
    
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className={`font-bold ${data.winner === 'nikolai' ? 'text-emerald-400' : 'text-slate-400'}`}>
            {data.isTiebreak ? 'TB' : `Set ${set}`}: {data.nikolaiGames}
          </span>
          <span className={`font-bold ${data.winner === 'opponent' ? 'text-red-400' : 'text-slate-400'}`}>
            {data.oppGames}
          </span>
        </div>
        <div className="h-8 bg-slate-700 rounded-lg overflow-hidden flex">
          <div 
            className={`h-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${data.winner === 'nikolai' ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' : 'bg-gradient-to-r from-slate-600 to-slate-500'}`}
            style={{ width: `${nikolaiWidth}%` }}
          >
            {data.nikolaiPts}
          </div>
          <div 
            className={`h-full flex items-center justify-center text-xs font-bold ${data.winner === 'opponent' ? 'bg-gradient-to-r from-red-600 to-red-500' : 'bg-gradient-to-r from-slate-500 to-slate-400'}`}
            style={{ width: `${100 - nikolaiWidth}%` }}
          >
            {data.oppPts}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>UE: {data.ues} | DF: {data.dfs}</span>
          <span>1st Serve: {data.firstServe}%</span>
        </div>
      </div>
    );
  };

  const MomentumChart = () => (
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-lg font-bold text-white mb-4">Momentum Swings</h3>
      <div className="space-y-4">
        <div>
          <div className="text-emerald-400 text-sm font-medium mb-2">Set 1 - Nikolai Dominant</div>
          <div className="flex gap-1 flex-wrap">
            {[4, 6, 3, 3, 3, 3, 4, 3].map((streak, i) => (
              <div key={i} className="bg-emerald-500/80 rounded px-2 py-1 text-xs font-bold text-white">
                +{streak}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-red-400 text-sm font-medium mb-2">Sets 2-3 - Opponent Runs</div>
          <div className="flex gap-1 flex-wrap">
            {[3, 6, 5, 6].map((streak, i) => (
              <div key={i} className="bg-red-500/80 rounded px-2 py-1 text-xs font-bold text-white">
                +{streak}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ value, max = 100, color = 'emerald', showValue = true }: any) => {
    const colors: any = {
      emerald: 'bg-emerald-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
    };
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${colors[color]} rounded-full transition-all`} style={{ width: `${(value/max)*100}%` }}></div>
        </div>
        {showValue && <span className={`text-${color}-400 font-bold text-sm w-12 text-right`}>{value}%</span>}
      </div>
    );
  };

  const InsightSection = ({ title, icon, children, color = 'slate' }: any) => {
    const borderColors: any = {
      slate: 'border-slate-700/50',
      emerald: 'border-emerald-500/30',
      red: 'border-red-500/30',
      yellow: 'border-yellow-500/30',
      blue: 'border-blue-500/30',
    };
    return (
      <div className={`bg-slate-800/30 rounded-2xl p-5 border ${borderColors[color]}`}>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h3>
        {children}
      </div>
    );
  };

  const ComparisonRow = ({ label, set1, set23, highlight }: any) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${highlight ? 'bg-red-500/10' : 'bg-slate-700/30'}`}>
      <span className="text-slate-300 text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-emerald-400 font-bold">{set1}</span>
        <span className="text-slate-500">→</span>
        <span className={`font-bold ${highlight ? 'text-red-400' : 'text-red-400'}`}>{set23}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Match Analysis: {matchData.player}
            </h1>
            <p className="text-slate-400 mt-1">
              vs {matchData.opponent} • {matchData.location} • {matchData.date} • {matchData.surface}
            </p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <div className="text-slate-400 text-sm">Actual Result</div>
            <div className="text-2xl font-black text-red-400">{matchData.result}</div>
            <div className="text-emerald-400 font-mono font-bold">{matchData.actualScore}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'errors', 'insights', 'serve', 'return'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                  Set-by-Set Breakdown
                </h2>
                {setData.map((data, i) => (
                  <SetBar key={i} set={i + 1} data={data} />
                ))}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard title="Total Points" value={`${matchData.totalPoints.nikolai}-${matchData.totalPoints.opponent}`} subtitle="Won 51.4%" />
                <StatCard title="Winners" value="7" subtitle="5 GS, 1 Vol, 1 Drop" />
                <StatCard title="Unforced Errors" value="17" subtitle="16 from attacking" />
                <StatCard title="Double Faults" value="9" subtitle="7 in Set 2" />
              </div>

              <MomentumChart />
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/50">
                <h3 className="font-bold text-white mb-3">The Tale of Two Players</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <div className="text-emerald-400 font-bold">Set 1: Clinical</div>
                    <div className="text-slate-300">24-8 points, 1 UE, 85% attack conversion</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <div className="text-red-400 font-bold">Sets 2-3: Collapse</div>
                    <div className="text-slate-300">30-43 points, 16 UEs, 38% attack conversion</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-700/50">
                <div className="text-slate-400 text-sm mb-2">Key Stat</div>
                <div className="text-3xl font-black text-red-400">16.7%</div>
                <div className="text-white font-medium">Deuce Points Won</div>
                <div className="text-slate-500 text-sm mt-1">Only 1 of 6 deuce points converted</div>
              </div>
            </div>
          </div>
        )}

        {/* Errors Tab - Simplified */}
        {activeTab === 'errors' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-red-900/20 to-slate-900/50 rounded-2xl p-6 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h2 className="text-xl font-bold text-red-400">Report Data Errors</h2>
                  <p className="text-slate-400 text-sm">1 critical error + 1 data tracking discrepancy</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/40 flex justify-between items-center">
                  <span className="text-slate-300">Match Result</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 line-through text-sm">0-6, 6-2, 10-6</span>
                    <span className="text-emerald-400 font-bold">6-0, 2-6, 6-9</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/40 flex justify-between items-center">
                  <span className="text-slate-300">Service Games</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 line-through text-sm">11 played</span>
                    <span className="text-emerald-400 font-bold">5 tracked in data</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-sm text-slate-400">
                <strong className="text-emerald-400">Verified Correct:</strong> 2nd Serve Win % (30%) and Return vs 2nd Serve (82.4%) are both accurate when counting DFs appropriately.
              </div>

              <div className="mt-3 p-3 bg-slate-800/50 rounded-lg text-sm text-slate-400">
                <strong className="text-white">Impact:</strong> The inverted match result completely changes the narrative — from "comeback victory" to "collapse under pressure."
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab - Comprehensive */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            {/* The Collapse */}
            <InsightSection title="The Attacking Conversion Collapse" icon="🔴" color="red">
              <p className="text-slate-400 text-sm mb-4">The most significant finding: Nikolai's ability to convert attacking positions completely evaporated after Set 1.</p>
              <div className="space-y-2">
                <ComparisonRow label="Attacking Conversion" set1="85%" set23="38%" highlight />
                <ComparisonRow label="Unforced Errors" set1="1 (3.1%)" set23="16 (21.9%)" highlight />
                <ComparisonRow label="1st Serve %" set1="73%" set23="62%" />
                <ComparisonRow label="Double Faults" set1="2" set23="7" highlight />
              </div>
              <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-sm text-slate-300">
                  <strong className="text-red-400">Key Insight:</strong> 16 of 17 unforced errors came from <em>attacking positions</em>. 
                  Nikolai isn't making errors under pressure from the opponent — he's making errors when he <em>has control</em> of the point.
                </p>
              </div>
            </InsightSection>

            {/* Pressure Points */}
            <div className="grid md:grid-cols-2 gap-6">
              <InsightSection title="Pressure Point Performance" icon="💎" color="yellow">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                    <span className="text-slate-300">Deuce Points (serving)</span>
                    <span className="text-red-400 font-bold text-xl">16.7%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">30-30 Points (all)</span>
                    <span className="text-emerald-400 font-bold">75%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Service Game Points</span>
                    <span className="text-emerald-400 font-bold">80%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                    <span className="text-slate-300">Break Points Converting</span>
                    <span className="text-red-400 font-bold">25%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Break Points Saving</span>
                    <span className="text-emerald-400 font-bold">66.7%</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">Good at closing service games but crumbles at extended deuce situations.</p>
              </InsightSection>

              <InsightSection title="Return Under Pressure" icon="🎯" color="red">
                <div className="space-y-3">
                  <div className="text-slate-400 text-sm mb-2">Return Win % by Set</div>
                  <div className="flex justify-between items-center p-3 bg-emerald-500/10 rounded-lg">
                    <span className="text-slate-300">Set 1</span>
                    <span className="text-emerald-400 font-bold text-xl">70.6%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                    <span className="text-slate-300">Set 2</span>
                    <span className="text-red-400 font-bold text-xl">39.1%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg">
                    <span className="text-slate-300">Set 3 (TB)</span>
                    <span className="text-red-400 font-bold text-xl">37.5%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-700">
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded">
                      <span className="text-slate-400 text-sm">Break Points (1/4)</span>
                      <span className="text-red-400 font-bold">25%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-slate-700/30 rounded mt-1">
                      <span className="text-slate-400 text-sm">30-30 Returning (2/3)</span>
                      <span className="text-emerald-400 font-bold">66.7%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-red-500/10 rounded-lg border border-red-500/30">
                  <p className="text-xs text-slate-300">
                    <strong className="text-red-400">Verdict:</strong> Return game collapsed alongside everything else. From 70.6% in Set 1 to 37-39% in Sets 2-3.
                  </p>
                </div>
              </InsightSection>
            </div>

            {/* Tiebreak Deep Dive */}
            <InsightSection title="Tiebreak Breakdown (Set 3)" icon="⚡" color="red">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                  <div className="text-red-400 text-2xl font-black">37.5%</div>
                  <div className="text-slate-400 text-sm">Points on Serve (3/8)</div>
                </div>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                  <div className="text-red-400 text-2xl font-black">37.5%</div>
                  <div className="text-slate-400 text-sm">Points on Return (3/8)</div>
                </div>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                  <div className="text-red-400 text-2xl font-black">6 UEs</div>
                  <div className="text-slate-400 text-sm">in 16 points</div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-slate-400 text-sm mb-2">Point-by-Point</div>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-1">
                  {[
                    { score: '0-0', server: 'opp', winner: 'opp', type: 'FE' },
                    { score: '0-1', server: 'nik', winner: 'opp', type: 'FE' },
                    { score: '0-2', server: 'nik', winner: 'opp', type: 'UE' },
                    { score: '0-3', server: 'opp', winner: 'nik', type: 'W' },
                    { score: '1-3', server: 'opp', winner: 'opp', type: 'UE' },
                    { score: '1-4', server: 'nik', winner: 'opp', type: 'UE' },
                    { score: '1-5', server: 'nik', winner: 'nik', type: 'RE' },
                    { score: '1-5', server: 'opp', winner: 'nik', type: 'RW' },
                    { score: '3-5', server: 'opp', winner: 'nik', type: 'FE' },
                    { score: '4-5', server: 'nik', winner: 'opp', type: 'UE' },
                    { score: '4-6', server: 'nik', winner: 'nik', type: 'FE' },
                    { score: '5-6', server: 'opp', winner: 'opp', type: 'W' },
                    { score: '5-7', server: 'opp', winner: 'opp', type: 'UE' },
                    { score: '5-8', server: 'nik', winner: 'opp', type: 'UE' },
                    { score: '5-9', server: 'nik', winner: 'nik', type: 'W' },
                    { score: '6-9', server: 'opp', winner: 'opp', type: 'W' },
                  ].map((pt, i) => (
                    <div key={i} className={`p-1.5 rounded text-center text-xs ${pt.winner === 'nik' ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-red-500/20 border border-red-500/40'}`}>
                      <div className={`font-bold ${pt.winner === 'nik' ? 'text-emerald-400' : 'text-red-400'}`}>{pt.score}</div>
                      <div className="text-slate-500 text-xs">{pt.type}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-2 text-xs text-slate-500">
                  <span>W = Winner</span>
                  <span>UE = Unforced Error</span>
                  <span>FE = Forced Error</span>
                  <span>RW = Return Winner</span>
                  <span>RE = Return Error (opp)</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-slate-400 text-sm mb-2">Nikolai's TB Stats</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Winners</span>
                      <span className="text-emerald-400 font-bold">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">FE Caused</span>
                      <span className="text-emerald-400 font-bold">2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">UEs</span>
                      <span className="text-red-400 font-bold">6</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">FE Received</span>
                      <span className="text-red-400 font-bold">2</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <div className="text-red-400 font-bold text-sm mb-1">Key Moments Lost</div>
                  <ul className="text-slate-400 text-xs space-y-1">
                    <li>• 0-3 down after first 4 points</li>
                    <li>• UE at 4-5 (could've leveled)</li>
                    <li>• UE at 5-8 (last chance gone)</li>
                    <li>• 6 UEs in 16 points = match losing</li>
                  </ul>
                </div>
              </div>
            </InsightSection>

              <InsightSection title="Rally Length Sweet Spots" icon="📊" color="blue">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Short (≤4 shots)</span>
                      <span className="text-slate-300">51.4%</span>
                    </div>
                    <ProgressBar value={51.4} color="yellow" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Medium (5-8 shots)</span>
                      <span className="text-red-400">45.0%</span>
                    </div>
                    <ProgressBar value={45} color="red" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Long (9+ shots)</span>
                      <span className="text-emerald-400">61.5%</span>
                    </div>
                    <ProgressBar value={61.5} color="emerald" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <p className="text-sm text-slate-300">
                    <strong className="text-blue-400">Weakness:</strong> The 4-5 shot "transition zone" is where Nikolai tries to end points prematurely and makes errors.
                  </p>
                </div>
              </InsightSection>
            </div>

            {/* FH vs BH */}
            <InsightSection title="Forehand vs Backhand: Counter-Intuitive Finding" icon="🎾" color="emerald">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                  <div className="text-slate-400 text-sm mb-1">Forehand</div>
                  <div className="text-3xl font-black text-red-400">49.1%</div>
                  <div className="text-slate-500 text-sm">80.9% of rallies</div>
                </div>
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center">
                  <div className="text-slate-400 text-sm mb-1">Backhand</div>
                  <div className="text-3xl font-black text-emerald-400">61.5%</div>
                  <div className="text-slate-500 text-sm">19.1% of rallies</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Ball 3 FH (first ground after serve)</span>
                  <span className="text-red-400 font-bold">43.8%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-slate-300">Ball 3 BH (first ground after serve)</span>
                  <span className="text-emerald-400 font-bold">100%</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">
                The opponent is successfully targeting Nikolai's forehand side. When forced to use the backhand, he's actually more compact and consistent.
              </p>
            </InsightSection>

            {/* Return & Serve Positioning */}
            <div className="grid md:grid-cols-2 gap-6">
              <InsightSection title="Return Position Problem" icon="📍" color="yellow">
                <div className="mb-4">
                  <div className="text-slate-400 text-sm mb-2">vs 1st Serve Position → Win Rate</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <span className="text-slate-300 text-sm">Very Deep</span>
                      <span className="text-red-400 font-bold">20.0%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <span className="text-slate-300 text-sm">Deep</span>
                      <span className="text-red-400 font-bold">28.6%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                      <span className="text-slate-300 text-sm">Behind Baseline</span>
                      <span className="text-emerald-400 font-bold">50.0%</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                  <p className="text-sm text-slate-300">
                    <strong className="text-yellow-400">Fix:</strong> Step inside the baseline on 1st serve returns. Moving in doubles win rate.
                  </p>
                </div>
              </InsightSection>

              <InsightSection title="Court Side Differential" icon="🎯" color="slate">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center">
                    <div className="text-emerald-400 text-2xl font-black">58.1%</div>
                    <div className="text-slate-400 text-sm">Deuce Side</div>
                  </div>
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                    <div className="text-red-400 text-2xl font-black">46.2%</div>
                    <div className="text-slate-400 text-sm">Ad Side</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">
                  12% performance gap suggests serve placement weakness or mental pressure on Ad court (break point scenarios).
                </p>
              </InsightSection>
            </div>

            {/* Serve Direction Analysis */}
            <InsightSection title="Serve Direction Analysis" icon="📈" color="slate">
              {/* Court Diagram */}
              <div className="mb-6 p-4 bg-slate-900/50 rounded-xl">
                <div className="text-slate-400 text-sm mb-3 text-center">Service Box Zones</div>
                <div className="flex justify-center gap-4">
                  {/* Deuce Court */}
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">DEUCE COURT</div>
                    <div className="grid grid-cols-3 gap-1 border-2 border-slate-600 rounded p-2 bg-emerald-900/20">
                      <div className="w-12 h-12 bg-slate-700/50 rounded flex flex-col items-center justify-center">
                        <span className="text-emerald-400 font-bold text-xs">1</span>
                        <span className="text-slate-400 text-xs">Wide</span>
                      </div>
                      <div className="w-12 h-12 bg-slate-700/50 rounded flex flex-col items-center justify-center">
                        <span className="text-emerald-400 font-bold text-xs">2</span>
                        <span className="text-slate-400 text-xs">Body</span>
                      </div>
                      <div className="w-12 h-12 bg-emerald-500/30 rounded flex flex-col items-center justify-center border border-emerald-500/50">
                        <span className="text-emerald-400 font-bold text-xs">3</span>
                        <span className="text-slate-300 text-xs">T</span>
                      </div>
                    </div>
                  </div>
                  {/* Net */}
                  <div className="flex items-center">
                    <div className="w-1 h-16 bg-slate-500 rounded"></div>
                  </div>
                  {/* Ad Court */}
                  <div className="text-center">
                    <div className="text-xs text-slate-500 mb-1">AD COURT</div>
                    <div className="grid grid-cols-3 gap-1 border-2 border-slate-600 rounded p-2 bg-red-900/20">
                      <div className="w-12 h-12 bg-slate-700/50 rounded flex flex-col items-center justify-center">
                        <span className="text-slate-400 font-bold text-xs">4</span>
                        <span className="text-slate-400 text-xs">T</span>
                      </div>
                      <div className="w-12 h-12 bg-red-500/30 rounded flex flex-col items-center justify-center border border-red-500/50">
                        <span className="text-red-400 font-bold text-xs">5</span>
                        <span className="text-slate-300 text-xs">Body</span>
                      </div>
                      <div className="w-12 h-12 bg-slate-700/50 rounded flex flex-col items-center justify-center">
                        <span className="text-slate-400 font-bold text-xs">6</span>
                        <span className="text-slate-400 text-xs">Wide</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2 text-xs text-slate-500">↑ SERVER ↑</div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-emerald-400 font-medium mb-3">Best Directions (1st Serve)</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono">3</span>
                        <span className="text-slate-300 text-sm">Deuce T</span>
                      </div>
                      <span className="text-emerald-400 font-bold">75% (8)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono">2</span>
                        <span className="text-slate-300 text-sm">Deuce Body</span>
                      </div>
                      <span className="text-emerald-400 font-bold">71% (7)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs font-mono">6</span>
                        <span className="text-slate-300 text-sm">Ad Wide</span>
                      </div>
                      <span className="text-emerald-400 font-bold">67% (9)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-red-400 font-medium mb-3">Worst Directions</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded text-xs font-mono">5</span>
                        <span className="text-slate-300 text-sm">Ad Body</span>
                      </div>
                      <span className="text-red-400 font-bold">45% (11)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded text-xs font-mono">2L</span>
                        <span className="text-slate-300 text-sm">Deuce Body (long)</span>
                      </div>
                      <span className="text-red-400 font-bold">40% (5)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                      <div className="flex items-center gap-2">
                        <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded text-xs font-mono">3L</span>
                        <span className="text-slate-300 text-sm">2nd Serve T (long)</span>
                      </div>
                      <span className="text-red-400 font-bold">0% (4)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-sm text-slate-300">
                  <strong className="text-yellow-400">Tactical Takeaway:</strong> Over-reliance on Ad Body (5) — most used serve but lowest conversion. 
                  Opponent reads this well. Increase T serves on Deuce (3) and Wide on Ad (6).
                </p>
              </div>
            </InsightSection>

            {/* Double Fault Analysis */}
            <InsightSection title="The Double Fault Problem" icon="💀" color="red">
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-slate-300">2</div>
                  <div className="text-slate-500 text-sm">Set 1 DFs</div>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg text-center border border-red-500/40">
                  <div className="text-2xl font-bold text-red-400">7</div>
                  <div className="text-red-300 text-sm">Set 2 DFs</div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-slate-300">0</div>
                  <div className="text-slate-500 text-sm">Set 3 DFs</div>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-slate-400 text-sm mb-2">Set 2 DF Game Scores (when they happened)</div>
                <div className="flex flex-wrap gap-2">
                  {['0-15', '15-40', '15-30', '40-40', '30-00', '40-40', '40-A'].map((score, i) => (
                    <span key={i} className="bg-red-500/30 text-red-300 px-3 py-1 rounded-full text-sm font-mono">
                      {score}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                <p className="text-sm text-slate-300">
                  <strong className="text-red-400">Pattern:</strong> Under scoreboard pressure, the second serve completely abandoned Nikolai. 
                  These weren't random failures — they came at break points, deuce situations, and key moments. This is a mental pressure response.
                </p>
              </div>
            </InsightSection>

            {/* Opponent Patterns */}
            <InsightSection title="Opponent Exploitable Weaknesses" icon="🔍" color="emerald">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-slate-400 text-sm mb-2">Opponent's Weak Serve Directions</div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                    <span className="text-slate-300 text-sm">Wide serves</span>
                    <span className="text-emerald-400 font-bold">P1 won 80%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                    <span className="text-slate-300 text-sm">Net 3 serves</span>
                    <span className="text-emerald-400 font-bold">P1 won 100%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                    <span className="text-slate-300 text-sm">Net 5 serves</span>
                    <span className="text-emerald-400 font-bold">P1 won 100%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-slate-400 text-sm mb-2">Opponent Vulnerability</div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                    <span className="text-slate-300 text-sm">vs 2nd Serve</span>
                    <span className="text-emerald-400 font-bold">P1 won 73%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded">
                    <span className="text-slate-300 text-sm">Net Approaches</span>
                    <span className="text-emerald-400 font-bold">Only 50% success</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-500/10 rounded">
                    <span className="text-slate-300 text-sm">Serve to Pos 1</span>
                    <span className="text-red-400 font-bold">Opp won 87.5%</span>
                  </div>
                </div>
              </div>
            </InsightSection>

            {/* Shot Count Detail */}
            <InsightSection title="Shot Count Performance" icon="📉" color="blue">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
                {[
                  { shots: 2, pct: 47, color: 'yellow' },
                  { shots: 3, pct: 64, color: 'emerald' },
                  { shots: 4, pct: 33, color: 'red' },
                  { shots: 5, pct: 33, color: 'red' },
                  { shots: 6, pct: 100, color: 'emerald' },
                  { shots: '7-8', pct: 38, color: 'red' },
                  { shots: '9+', pct: 62, color: 'emerald' },
                ].map((item, i) => (
                  <div key={i} className={`p-2 rounded-lg text-center bg-${item.color}-500/10 border border-${item.color}-500/30`}>
                    <div className={`text-lg font-bold text-${item.color}-400`}>{item.pct}%</div>
                    <div className="text-xs text-slate-500">{item.shots}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400">
                Excellent at 3-shot patterns (serve patterns) and 6+ shot rallies (grinding). Struggles in the 4-5 and 7-8 shot range where he's trying to end points too early.
              </p>
            </InsightSection>

            {/* Point Duration */}
            <InsightSection title="Point Duration Insight" icon="⏱️" color="slate">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-slate-700/30 rounded-lg text-center">
                  <div className="text-xl font-bold text-slate-300">10.6s</div>
                  <div className="text-slate-500 text-sm">Avg Point</div>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <div className="text-xl font-bold text-emerald-400">11.0s</div>
                  <div className="text-slate-500 text-sm">When P1 Wins</div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg text-center">
                  <div className="text-xl font-bold text-red-400">10.2s</div>
                  <div className="text-slate-500 text-sm">When Opp Wins</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Nikolai's game is built for grinding and extended exchanges. He shouldn't be trying to shorten points — he wins more when rallies extend.
              </p>
            </InsightSection>

            {/* Net Game */}
            <InsightSection title="Net Game Analysis" icon="🏐" color="slate">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-slate-400 text-sm">P1 Net Approaches</div>
                  <div className="text-2xl font-bold text-white">9 <span className="text-emerald-400 text-lg">55.6% won</span></div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-slate-400 text-sm">Opponent Approaches</div>
                  <div className="text-2xl font-bold text-white">8 <span className="text-yellow-400 text-lg">50% won</span></div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Most winners (5/7) came from groundstrokes, only 1 volley winner and 1 drop volley. Net play is underutilized — only 9 approaches in 105 points.
              </p>
            </InsightSection>

            {/* Training Priorities */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-emerald-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎯</span>
                Training Priorities
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="text-red-400 font-bold mb-2">1. Second Serve Rebuild</div>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Practice under-pressure scenarios</li>
                    <li>• Target 70%+ in percentage</li>
                    <li>• Add kick serve variation</li>
                    <li>• Eliminate "Long 3" direction</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                  <div className="text-orange-400 font-bold mb-2">2. Shot Selection</div>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Don't over-hit from attacking positions</li>
                    <li>• Use the 9+ rally strength</li>
                    <li>• Patience is a weapon</li>
                    <li>• Build points to 6+ shots</li>
                  </ul>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold mb-2">3. Mental Reset</div>
                  <ul className="text-slate-400 text-sm space-y-1">
                    <li>• Set 1→2 collapse was mental</li>
                    <li>• Maintain intensity after winning</li>
                    <li>• Deuce point rituals</li>
                    <li>• DF trigger awareness</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Final Verdict */}
            <div className="bg-slate-900/80 rounded-2xl p-6 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <h2 className="text-xl font-bold">Final Verdict</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                This was a <span className="text-emerald-400 font-bold">winnable match</span> that Tingstad gave away. 
                The Set 1 dominance (24-8 points, 85% attacking conversion) proves the capability exists. The breakdown in Sets 2-3 was primarily 
                <span className="text-red-400 font-bold"> self-inflicted</span> — double faults at critical moments, 
                unforced errors from winning positions, and an inability to reset mentally after losing momentum.
              </p>
              <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                <p className="text-white font-medium italic text-lg">
                  "The opponent didn't outplay Tingstad — Tingstad outplayed himself."
                </p>
              </div>
              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <div className="text-emerald-400 font-bold text-sm">Player Profile</div>
                  <p className="text-slate-400 text-sm mt-1">Baseline grinder with solid rally tolerance. Best in extended exchanges and 3-shot serve patterns.</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <div className="text-red-400 font-bold text-sm">Priority Issue</div>
                  <p className="text-slate-400 text-sm mt-1">Significant mental fragility under pressure. Not fitness, not technique — competitive mindset.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Serve Tab */}
        {activeTab === 'serve' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4">1st Serve Analysis</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300">1st Serve In</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64.9%' }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold">64.9%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300">1st Serve Points Won</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '64.9%' }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold">64.9%</span>
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-slate-400 text-sm mb-2">Best Serve Directions</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                      <div className="text-emerald-400 font-bold">75%</div>
                      <div className="text-xs text-slate-400">Deuce T</div>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                      <div className="text-emerald-400 font-bold">71%</div>
                      <div className="text-xs text-slate-400">Deuce Body</div>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                      <div className="text-emerald-400 font-bold">67%</div>
                      <div className="text-xs text-slate-400">Ad Wide</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4">2nd Serve Analysis</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300">2nd Serve In</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: '55%' }}></div>
                    </div>
                    <span className="text-yellow-400 font-bold">55.0%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300">2nd Serve Points Won</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-red-400 font-bold">30.0%</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400">
                  6 won / 20 attempts (includes 9 DFs as losses)
                </div>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="text-red-400 font-bold text-lg mb-2">9 Double Faults</div>
                  <div className="text-slate-400 text-sm">
                    <div>• Set 1: 2 DFs</div>
                    <div>• Set 2: <span className="text-red-400 font-bold">7 DFs</span></div>
                    <div>• Set 3: 0 DFs</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4">Court Side Performance (Serving)</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center">
                  <div className="text-emerald-400 text-3xl font-black">58.1%</div>
                  <div className="text-slate-400">Deuce Side</div>
                </div>
                <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30 text-center">
                  <div className="text-red-400 text-3xl font-black">46.2%</div>
                  <div className="text-slate-400">Ad Side</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Return Tab */}
        {activeTab === 'return' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4">Return Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-xl">
                  <span className="text-slate-300">vs 1st Serve</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: '32.3%' }}></div>
                    </div>
                    <span className="text-red-400 font-bold">32.3%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-500/10 rounded-xl">
                  <span className="text-slate-300">vs 2nd Serve</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-600 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82.4%' }}></div>
                    </div>
                    <span className="text-emerald-400 font-bold">82.4%</span>
                  </div>
                </div>
                <div className="p-2 bg-slate-700/30 rounded text-xs text-slate-400">
                  14/17 (includes 6 opponent DFs as free points)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                    <div className="text-emerald-400 font-bold">1</div>
                    <div className="text-xs text-slate-400">Return Winners</div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-lg text-center">
                    <div className="text-red-400 font-bold">9</div>
                    <div className="text-xs text-slate-400">Return Errors</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-xl font-bold mb-4">Return Position Analysis</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-700/30 rounded-xl">
                  <div className="text-slate-400 text-sm mb-3">vs 1st Serve Position → Win %</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Deep</span>
                      <span className="text-red-400 font-bold">28.6%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Very Deep</span>
                      <span className="text-red-400 font-bold">20.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Behind Baseline</span>
                      <span className="text-emerald-400 font-bold">50.0%</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <div className="text-yellow-400 font-bold mb-1">⚡ Tactical Insight</div>
                  <div className="text-slate-300 text-sm">
                    Standing too far back on 1st serve returns. Moving inside the baseline doubles win rate.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          Analysis generated from raw CSV data • {matchData.totalPoints.nikolai + matchData.totalPoints.opponent} total points analyzed
        </div>
      </div>
    </div>
  );
};

export default TennisAnalysisDashboard;
