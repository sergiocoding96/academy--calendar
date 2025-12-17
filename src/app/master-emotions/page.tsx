'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '@/components/ui/navigation'

type ViewType = 'overview' | 'circumplex' | 'timeline' | 'arousal' | 'controllability' | 'ego'
type EmotionKey = 'disappointment' | 'frustration' | 'anger' | 'anxiety' | 'calmness' | 'excitement'

interface Emotion {
  name: string
  icon: string
  color: string
  gradient: string
  arousal: number
  valence: number
  timeline: string
  ego: string
  controllability: string
  danger: string
  description: string
}

const emotions: Record<EmotionKey, Emotion> = {
  disappointment: {
    name: 'Disappointment',
    icon: '😞',
    color: '#78716c',
    gradient: 'from-stone-500 to-stone-600',
    arousal: 3,
    valence: 2,
    timeline: 'Past',
    ego: 'Ego-Threatened',
    controllability: 'Internal + Uncontrollable',
    danger: 'Critical',
    description: 'Low energy withdrawal from challenge'
  },
  frustration: {
    name: 'Frustration',
    icon: '😤',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-500',
    arousal: 6,
    valence: 3,
    timeline: 'Past/Present',
    ego: 'Task → Ego-Pressured',
    controllability: 'Internal + Controllable',
    danger: 'Moderate',
    description: 'Productive tension seeking solution'
  },
  anger: {
    name: 'Anger',
    icon: '😠',
    color: '#ef4444',
    gradient: 'from-rose-500 to-red-500',
    arousal: 8,
    valence: 2,
    timeline: 'Past/Present',
    ego: 'Ego-Defensive',
    controllability: 'Internal + Uncontrollable',
    danger: 'Moderate-High',
    description: 'Explosive reaction to perceived injustice'
  },
  anxiety: {
    name: 'Anxiety',
    icon: '😰',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-500',
    arousal: 7,
    valence: 3,
    timeline: 'Future',
    ego: 'Ego-Pressured',
    controllability: 'Internal + Uncontrollable',
    danger: 'High',
    description: 'Anticipatory fear of failure'
  },
  calmness: {
    name: 'Calmness',
    icon: '😌',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-500',
    arousal: 4,
    valence: 7,
    timeline: 'Present',
    ego: 'Task-Focused',
    controllability: 'Internal + Controllable',
    danger: 'Low',
    description: 'Centered presence and clarity'
  },
  excitement: {
    name: 'Excitement',
    icon: '😄',
    color: '#10b981',
    gradient: 'from-emerald-500 to-green-500',
    arousal: 7,
    valence: 8,
    timeline: 'Present/Future',
    ego: 'Task-Focused',
    controllability: 'Internal + Controllable',
    danger: 'Low',
    description: 'Energized engagement with challenge'
  }
}

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <div className="text-4xl mb-3">{icon}</div>
      <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-2">{title}</h2>
      <p className="text-stone-500 max-w-xl mx-auto">{subtitle}</p>
    </div>
  )
}

function OverviewView({ hoveredEmotion, setHoveredEmotion }: { hoveredEmotion: EmotionKey | null; setHoveredEmotion: (e: EmotionKey | null) => void }) {
  return (
    <div>
      <SectionTitle
        icon="🎾"
        title="Your Emotional Toolkit"
        subtitle="Understanding these six emotions will help you stay in control on court"
      />

      {/* Emotion Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {(Object.entries(emotions) as [EmotionKey, Emotion][]).map(([key, emotion]) => (
          <div
            key={key}
            onMouseEnter={() => setHoveredEmotion(key)}
            onMouseLeave={() => setHoveredEmotion(null)}
            className={`rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer ${
              hoveredEmotion === key
                ? `bg-gradient-to-br ${emotion.gradient} text-white border-transparent shadow-xl -translate-y-2`
                : 'bg-white border-stone-100 hover:border-stone-200'
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl md:text-5xl">{emotion.icon}</div>
              <div>
                <h3 className={`text-lg font-bold ${hoveredEmotion === key ? 'text-white' : ''}`} style={{ color: hoveredEmotion === key ? 'white' : emotion.color }}>
                  {emotion.name}
                </h3>
                <p className={`text-sm ${hoveredEmotion === key ? 'text-white/80' : 'text-stone-500'}`}>
                  {emotion.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Energy', value: `${emotion.arousal}/10` },
                { label: 'Timeline', value: emotion.timeline },
                { label: 'Risk Level', value: emotion.danger },
                { label: 'Focus', value: emotion.ego.split(' ')[0] }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg ${
                    hoveredEmotion === key ? 'bg-white/20' : 'bg-stone-50'
                  }`}
                >
                  <div className={`text-xs font-semibold uppercase tracking-wide ${hoveredEmotion === key ? 'text-white/70' : 'text-stone-400'}`}>
                    {item.label}
                  </div>
                  <div className={`text-sm font-semibold ${hoveredEmotion === key ? 'text-white' : 'text-stone-700'}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: '🔴',
            title: 'Watch Out For',
            emotion: 'Disappointment',
            desc: 'It makes you want to give up',
            bgClass: 'bg-red-50',
            borderClass: 'border-red-200',
            titleColor: 'text-red-600'
          },
          {
            icon: '🎯',
            title: 'Your Target Zone',
            emotion: 'Calm + Excited',
            desc: 'This is where you play your best',
            bgClass: 'bg-emerald-50',
            borderClass: 'border-emerald-200',
            titleColor: 'text-emerald-600'
          },
          {
            icon: '⚡',
            title: 'Act Fast',
            emotion: 'Frustration Building',
            desc: 'You have 2-3 points to reset',
            bgClass: 'bg-amber-50',
            borderClass: 'border-amber-200',
            titleColor: 'text-amber-600'
          }
        ].map((insight, i) => (
          <div key={i} className={`${insight.bgClass} rounded-2xl p-5 border ${insight.borderClass}`}>
            <div className="text-3xl mb-3">{insight.icon}</div>
            <h4 className={`font-bold ${insight.titleColor} mb-1`}>{insight.title}</h4>
            <div className="font-semibold text-stone-700 mb-1">{insight.emotion}</div>
            <div className="text-sm text-stone-500">{insight.desc}</div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div className="bg-stone-800 rounded-2xl p-6 md:p-8 text-white">
        <h3 className="text-lg font-bold mb-5 flex items-center gap-3">
          <span>🎯</span> Quick Reset Guide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { state: '😞 Feeling flat?', action: 'Jump, pump your fist, stand tall', color: '#78716c' },
            { state: '😤 Getting frustrated?', action: 'Pick ONE thing to focus on', color: '#f59e0b' },
            { state: '😠 😰 Too intense?', action: 'Walk to towel, breathe deep', color: '#ef4444' },
            { state: '😌 😄 Feeling good?', action: 'Stay in the moment, trust it', color: '#10b981' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4" style={{ borderLeft: `4px solid ${item.color}` }}>
              <div className="font-semibold mb-1">{item.state}</div>
              <div className="text-sm text-white/70">{item.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CircumplexView({ hoveredEmotion, setHoveredEmotion }: { hoveredEmotion: EmotionKey | null; setHoveredEmotion: (e: EmotionKey | null) => void }) {
  const getPosition = (arousal: number, valence: number) => {
    const x = ((valence - 1) / 9) * 100
    const y = 100 - ((arousal - 1) / 9) * 100
    return { left: `${x}%`, top: `${y}%` }
  }

  return (
    <div>
      <SectionTitle
        icon="🎯"
        title="The Emotion Map"
        subtitle="Find where you are, then move toward the Peak Zone"
      />

      <div className="grid gap-8">
        {/* Main Grid */}
        <div className="relative w-full max-w-lg mx-auto">
          <div
            className="relative w-full rounded-2xl border-4 border-stone-200 overflow-hidden"
            style={{
              paddingBottom: '100%',
              background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 25%, #d1fae5 50%, #dbeafe 75%, #e0e7ff 100%)'
            }}
          >
            {/* Grid Lines */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px),
                  linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%'
              }}
            />

            {/* Axes */}
            <div className="absolute left-1/2 top-[5%] bottom-[5%] w-0.5 bg-stone-300 -translate-x-1/2" />
            <div className="absolute left-[5%] right-[5%] top-1/2 h-0.5 bg-stone-300 -translate-y-1/2" />

            {/* Peak Zone */}
            <div
              className="absolute border-4 border-dashed border-emerald-500 rounded-full flex items-center justify-center"
              style={{
                left: '55%',
                top: '30%',
                width: '35%',
                height: '35%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(16, 185, 129, 0.15)'
              }}
            >
              <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                PEAK ZONE
              </span>
            </div>

            {/* Emotions */}
            {(Object.entries(emotions) as [EmotionKey, Emotion][]).map(([key, emotion]) => (
              <div
                key={key}
                onMouseEnter={() => setHoveredEmotion(key)}
                onMouseLeave={() => setHoveredEmotion(null)}
                className={`absolute transition-all duration-300 cursor-pointer ${
                  hoveredEmotion === key ? 'scale-110 z-10' : 'z-0'
                }`}
                style={{
                  ...getPosition(emotion.arousal, emotion.valence),
                  transform: `translate(-50%, -50%) ${hoveredEmotion === key ? 'scale(1.1)' : 'scale(1)'}`
                }}
              >
                <div
                  className={`bg-white rounded-xl px-2 md:px-4 py-2 md:py-3 text-center border-2 transition-all ${
                    hoveredEmotion === key ? 'shadow-xl' : 'shadow-md'
                  }`}
                  style={{ borderColor: emotion.color }}
                >
                  <div className="text-xl md:text-3xl mb-1">{emotion.icon}</div>
                  <div className="text-xs font-bold whitespace-nowrap" style={{ color: emotion.color }}>
                    {emotion.name}
                  </div>
                </div>
              </div>
            ))}

            {/* Labels */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-stone-500 tracking-wide">
              HIGH ENERGY
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-bold text-stone-500 tracking-wide">
              LOW ENERGY
            </div>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] md:text-xs font-bold text-stone-500 tracking-wide">
              NEGATIVE
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 rotate-90 text-[10px] md:text-xs font-bold text-stone-500 tracking-wide">
              POSITIVE
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-2xl p-5 border-l-4 border-emerald-500">
            <div className="font-bold text-emerald-700 mb-2">✓ Your Target: Peak Zone</div>
            <div className="text-sm text-emerald-600">Medium energy (4-7) + feeling good = your best tennis. This is where you want to be!</div>
          </div>
          <div className="bg-red-50 rounded-2xl p-5 border-l-4 border-red-500">
            <div className="font-bold text-red-700 mb-2">✗ Danger Zones</div>
            <div className="text-sm text-red-600">Too high + negative (anger/anxiety) or too low + negative (disappointment) = trouble. Time to reset!</div>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-5">
            <div className="font-bold text-indigo-700 mb-2">🧭 How to Move</div>
            <div className="text-sm text-indigo-600 space-y-1">
              <div>• <strong>Too high?</strong> → Diaphragmatic breathing at the towel</div>
              <div>• <strong>Too low?</strong> → Physical activation (jump, fist pump)</div>
              <div>• <strong>Too negative?</strong> → Deal with it, let it go, next point</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineView() {
  return (
    <div>
      <SectionTitle
        icon="⏰"
        title="Where Is Your Mind?"
        subtitle="Champions stay in the present. Are you stuck in the past or worried about the future?"
      />

      {/* Timeline Visual */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-0 mb-10 px-4">
        {[
          { label: 'PAST', sub: 'Mistakes', icon: '⏮️', color: '#ef4444', bad: true },
          { label: 'PRESENT', sub: 'This Point', icon: '⏺️', color: '#10b981', bad: false },
          { label: 'FUTURE', sub: 'What If...', icon: '⏭️', color: '#f59e0b', bad: true }
        ].map((item, i) => (
          <React.Fragment key={i}>
            <div
              className={`relative text-center px-6 md:px-10 py-6 md:py-8 rounded-2xl border-4 ${
                item.bad
                  ? 'bg-opacity-10 border-opacity-40'
                  : 'shadow-lg scale-105 z-10'
              }`}
              style={{
                background: item.bad ? `${item.color}15` : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                borderColor: item.color
              }}
            >
              <div className="text-3xl md:text-4xl mb-2">{item.icon}</div>
              <div className="text-lg md:text-xl font-bold" style={{ color: item.color }}>{item.label}</div>
              <div className="text-sm text-stone-500">{item.sub}</div>
              {!item.bad && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: item.color }}
                >
                  BE HERE
                </div>
              )}
            </div>
            {i < 2 && (
              <div className="hidden md:block w-12 md:w-16 h-1 rounded-full bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${['#ef4444', '#10b981', '#f59e0b'][i]}, ${['#10b981', '#f59e0b'][i] || '#f59e0b'})` }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Emotion Timeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Past Column */}
        <div>
          <h4 className="text-center font-bold text-red-500 mb-4">⬅️ Stuck in the Past</h4>
          {(Object.entries(emotions) as [EmotionKey, Emotion][])
            .filter(([, e]) => e.timeline.includes('Past') && !e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div key={key} className="bg-white rounded-2xl p-4 border-2 border-stone-100 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emotion.icon}</span>
                  <div>
                    <div className="font-bold" style={{ color: emotion.color }}>{emotion.name}</div>
                    <div className="text-xs text-stone-400">&quot;I can&apos;t believe I missed that&quot;</div>
                  </div>
                </div>
              </div>
            ))}
          <div className="bg-red-50 rounded-xl p-4 text-sm text-red-800">
            <strong>The trap:</strong> Replaying errors steals energy from the next point
          </div>
        </div>

        {/* Present Column */}
        <div>
          <h4 className="text-center font-bold text-emerald-500 mb-4">🎯 In the Present</h4>
          {(Object.entries(emotions) as [EmotionKey, Emotion][])
            .filter(([, e]) => e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div
                key={key}
                className={`rounded-2xl p-4 border-2 mb-3 ${
                  emotion.valence >= 6
                    ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-md'
                    : 'bg-white border-stone-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emotion.icon}</span>
                  <div>
                    <div className="font-bold" style={{ color: emotion.color }}>{emotion.name}</div>
                    <div className="text-xs text-stone-500">
                      {emotion.valence >= 6 ? '"This point, right now"' : '"What just happened?"'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800">
            <strong>The goal:</strong> All your attention on what you can control RIGHT NOW
          </div>
        </div>

        {/* Future Column */}
        <div>
          <h4 className="text-center font-bold text-amber-500 mb-4">Future Worry ➡️</h4>
          {(Object.entries(emotions) as [EmotionKey, Emotion][])
            .filter(([, e]) => e.timeline.includes('Future') && !e.timeline.includes('Present'))
            .map(([key, emotion]) => (
              <div key={key} className="bg-white rounded-2xl p-4 border-2 border-stone-100 mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{emotion.icon}</span>
                  <div>
                    <div className="font-bold" style={{ color: emotion.color }}>{emotion.name}</div>
                    <div className="text-xs text-stone-400">&quot;What if I lose this?&quot;</div>
                  </div>
                </div>
              </div>
            ))}
          <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
            <strong>The trap:</strong> You can&apos;t control the future—only this moment
          </div>
        </div>
      </div>

      {/* Reset Cue */}
      <div className="mt-8 bg-stone-800 rounded-2xl p-6 md:p-8 text-center text-white">
        <div className="text-xs font-semibold text-stone-400 mb-2">YOUR RESET PHRASE</div>
        <div className="text-2xl md:text-3xl font-bold mb-2">&quot;NEXT POINT&quot; or &quot;THIS BALL ONLY&quot;</div>
        <p className="text-white/70">Say it out loud when you catch yourself in the past or future</p>
      </div>
    </div>
  )
}

function ArousalView() {
  return (
    <div>
      <SectionTitle
        icon="⚡"
        title="Your Energy Level"
        subtitle="Too low and you'll go flat. Too high and you'll lose control. Find your sweet spot at 4-7."
      />

      {/* Main Scale */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative mb-12">
          {/* Scale Bar */}
          <div
            className="h-12 rounded-full relative shadow-lg"
            style={{ background: 'linear-gradient(90deg, #3B82F6 0%, #10B981 35%, #10B981 65%, #F59E0B 80%, #EF4444 100%)' }}
          >
            {/* Peak Zone Overlay */}
            <div className="absolute rounded-full border-4 border-emerald-500" style={{ left: '30%', width: '40%', top: '-4px', bottom: '-4px' }} />
            {/* Peak Label */}
            <div className="absolute left-1/2 -top-10 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg whitespace-nowrap">
              YOUR SWEET SPOT
            </div>
          </div>

          {/* Scale Numbers */}
          <div className="flex justify-between mt-4 px-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <div
                key={n}
                className={`w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full font-bold text-xs md:text-sm ${
                  n >= 4 && n <= 7 ? 'bg-emerald-500 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {n}
              </div>
            ))}
          </div>

          {/* Zone Labels */}
          <div className="flex justify-between mt-4 text-xs md:text-sm text-stone-500">
            <div className="text-center w-[30%]">
              <strong className="text-blue-500">Too Low</strong><br />Flat, giving up
            </div>
            <div className="text-center w-[40%]">
              <strong className="text-emerald-500">Just Right</strong><br />Alert &amp; focused
            </div>
            <div className="text-center w-[30%]">
              <strong className="text-red-500">Too High</strong><br />Out of control
            </div>
          </div>
        </div>
      </div>

      {/* Emotion Bars */}
      <div className="space-y-3 mb-8">
        {(Object.entries(emotions) as [EmotionKey, Emotion][])
          .sort((a, b) => a[1].arousal - b[1].arousal)
          .map(([key, emotion]) => (
            <div key={key} className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
              <div className="text-3xl md:text-4xl">{emotion.icon}</div>
              <div className="min-w-[90px]">
                <div className="font-bold" style={{ color: emotion.color }}>{emotion.name}</div>
                <div className="text-xs text-stone-400">Level {emotion.arousal}/10</div>
              </div>
              <div className="flex-1 min-w-[150px]">
                <div className="h-5 bg-stone-100 rounded-full overflow-hidden relative">
                  {/* Peak Zone Indicator */}
                  <div className="absolute h-full bg-emerald-100 border-l-2 border-r-2 border-emerald-400 border-dashed" style={{ left: '30%', width: '40%' }} />
                  {/* Fill Bar */}
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${emotion.gradient} transition-all`}
                    style={{ width: `${emotion.arousal * 10}%` }}
                  />
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  emotion.arousal >= 4 && emotion.arousal <= 7
                    ? 'bg-emerald-100 text-emerald-600'
                    : emotion.arousal < 4
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {emotion.arousal >= 4 && emotion.arousal <= 7 ? 'GOOD' : emotion.arousal < 4 ? 'LOW' : 'HIGH'}
              </div>
            </div>
          ))}
      </div>

      {/* Regulation Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-l-4 border-blue-500">
          <h4 className="font-bold text-blue-700 mb-4">⬆️ Energy Too Low? (1-3)</h4>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Jump up and down, pump your fist</li>
            <li>• Stand tall with power pose</li>
            <li>• Say something strong to yourself</li>
            <li>• Quick feet, stay moving</li>
            <li>• Deep breath OUT with energy</li>
          </ul>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-l-4 border-red-500">
          <h4 className="font-bold text-red-700 mb-4">⬇️ Energy Too High? (8-10)</h4>
          <ul className="text-red-800 space-y-2 text-sm">
            <li>• <strong>Walk to your towel</strong> (take your time)</li>
            <li>• <strong>Diaphragmatic breathing</strong> (belly expands)</li>
            <li>• <strong>Tighten muscles, then relax</strong></li>
            <li>• Soft eyes, drop your shoulders</li>
            <li>• Deal with the emotion, then let it go</li>
          </ul>
        </div>
      </div>

      {/* The Towel Ritual */}
      <div className="mt-6 bg-stone-800 rounded-2xl p-6 text-white">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <span>🧺</span> The Towel Reset (When You&apos;re Too High)
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { step: '1', text: 'Walk slowly to towel' },
            { step: '2', text: 'Wipe face deliberately' },
            { step: '3', text: 'Deep belly breaths' },
            { step: '4', text: 'Let the emotion go' },
            { step: '5', text: 'Back to present' }
          ].map((item, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
              <div className="bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold">
                {item.step}
              </div>
              <div className="text-sm">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ControllabilityView() {
  return (
    <div>
      <SectionTitle
        icon="🎮"
        title="What Can You Control?"
        subtitle="Frustration is useful when you believe you CAN fix it. It becomes destructive when you feel helpless."
      />

      {/* The Critical Pathway */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 md:p-10 text-white text-center mb-8">
        <h3 className="text-lg md:text-xl font-semibold mb-6">🚨 The Danger Zone: When Frustration Turns to Anger</h3>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <div className="bg-white/20 rounded-2xl p-5 md:p-6">
            <div className="text-3xl md:text-4xl mb-2">😤</div>
            <div className="font-bold">FRUSTRATION</div>
            <div className="bg-emerald-500 px-3 py-1 rounded-full text-xs mt-2">&quot;I can fix this&quot;</div>
          </div>

          <div className="text-center">
            <div className="text-2xl md:text-3xl">⚡</div>
            <div className="text-xs opacity-80">2-3 bad<br />points</div>
          </div>

          <div className="bg-white/20 rounded-2xl p-5 md:p-6">
            <div className="text-3xl md:text-4xl mb-2">😠</div>
            <div className="font-bold">ANGER</div>
            <div className="bg-red-500 px-3 py-1 rounded-full text-xs mt-2">&quot;I can&apos;t do this&quot;</div>
          </div>
        </div>

        <p className="mt-6 opacity-90 max-w-lg mx-auto">
          You have <strong>2-3 points</strong> to reset before frustration becomes destructive. Act fast!
        </p>
      </div>

      {/* Two States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-2xl p-6 border-4 border-emerald-400">
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">✓ USEFUL</span>
          <h4 className="text-xl font-bold text-emerald-700 mt-4 mb-3">&quot;I Can Fix This&quot;</h4>
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="text-3xl mb-2">😤</div>
            <div className="font-bold text-amber-500">Frustration</div>
            <div className="text-sm text-stone-500 mt-1">&quot;I know what to do, I&apos;m just not doing it&quot;</div>
          </div>
          <div className="text-emerald-700 text-sm">
            <strong>Stay here!</strong> This feeling drives improvement. Pick ONE thing to adjust and commit to it.
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border-4 border-red-400">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">✗ DESTRUCTIVE</span>
          <h4 className="text-xl font-bold text-red-700 mt-4 mb-3">&quot;I Can&apos;t Do This&quot;</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {[emotions.anger, emotions.anxiety, emotions.disappointment].map((e, i) => (
              <div key={i} className="bg-white rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="text-2xl">{e.icon}</span>
                <span className="font-semibold text-sm" style={{ color: e.color }}>{e.name}</span>
              </div>
            ))}
          </div>
          <div className="text-red-700 text-sm">
            <strong>Danger!</strong> When you feel helpless, you stop trying. Time for a full reset at the towel.
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-amber-50 rounded-2xl p-6 border-4 border-amber-400">
        <h4 className="font-bold text-amber-700 mb-4">⚡ Your 2-3 Point Action Plan</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { num: '1', title: 'Notice it early', desc: '"I\'m getting frustrated"' },
            { num: '2', title: 'Pick ONE thing', desc: '"I\'ll focus on my toss"' },
            { num: '3', title: 'Commit fully', desc: '"Just this one adjustment"' },
            { num: '4', title: 'Let results go', desc: '"Process over outcome"' }
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center">
              <div className="bg-amber-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                {step.num}
              </div>
              <div className="font-bold text-amber-700 text-sm mb-1">{step.title}</div>
              <div className="text-amber-600 text-xs">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EgoView() {
  return (
    <div>
      <SectionTitle
        icon="🧠"
        title="Judging vs Doing"
        subtitle="When you're evaluating yourself, you're not playing tennis. When you're playing tennis, there's no room for judgment."
      />

      {/* Two Modes Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
            ✓ WHERE YOU WANT TO BE
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2">DOING Mode</h3>
          <p className="opacity-85 mb-4">Your mind is on the ball, not on yourself</p>
          <div className="text-4xl mb-4 text-center">😌 😄</div>
          <div className="bg-white/15 rounded-xl p-4">
            <div className="font-semibold mb-2">Your mind is asking:</div>
            <ul className="space-y-1 text-sm">
              <li>• &quot;Where&apos;s my target?&quot;</li>
              <li>• &quot;Split step, ready&quot;</li>
              <li>• &quot;Watch the ball&quot;</li>
              <li>• &quot;Next ball, next point&quot;</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 md:p-8 text-white">
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold inline-block mb-4">
            ✗ THE TRAP
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-2">JUDGING Mode</h3>
          <p className="opacity-85 mb-4">Your mind is on yourself, not on the ball</p>
          <div className="text-4xl mb-4 text-center">😰 😠 😞</div>
          <div className="bg-white/15 rounded-xl p-4">
            <div className="font-semibold mb-2">Your mind is asking:</div>
            <ul className="space-y-1 text-sm">
              <li>• &quot;Am I playing well?&quot;</li>
              <li>• &quot;What&apos;s the score?&quot;</li>
              <li>• &quot;What do they think of me?&quot;</li>
              <li>• &quot;Why can&apos;t I do this?&quot;</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Self-Check */}
      <div className="bg-stone-50 rounded-2xl p-6 mb-6">
        <h4 className="font-bold text-stone-700 mb-4">🔍 Quick Self-Check Between Points</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-400">
            <div className="font-bold text-red-700 mb-2">🚫 If you&apos;re thinking about...</div>
            <div className="text-red-600 text-sm">The score, yourself, your opponent, what others think</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-400">
            <div className="font-bold text-emerald-700 mb-2">✓ You should be thinking about...</div>
            <div className="text-emerald-600 text-sm">The ball, your target, your feet, your breath</div>
          </div>
        </div>
      </div>

      {/* The Reset */}
      <div className="bg-stone-800 rounded-2xl p-6 md:p-8 text-white text-center">
        <div className="text-xs font-semibold text-stone-400 mb-2">THE SIMPLE QUESTION</div>
        <div className="text-2xl md:text-3xl font-bold mb-4">&quot;Am I JUDGING or DOING?&quot;</div>
        <p className="text-white/70 max-w-lg mx-auto mb-6">
          Ask yourself this between points. If you&apos;re judging, say &quot;NEXT BALL&quot; and get back to doing.
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-4 md:gap-6 bg-white/10 rounded-xl px-6 py-4">
          <div>
            <div className="text-red-400 font-bold">JUDGING</div>
            <div className="text-xs opacity-70">Score, self, others</div>
          </div>
          <div className="text-2xl">→</div>
          <div>
            <div className="text-emerald-400 font-bold">DOING</div>
            <div className="text-xs opacity-70">Ball, target, feet</div>
          </div>
        </div>
      </div>

      {/* The Full Reset Process */}
      <div className="mt-6 bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-300">
        <h4 className="font-bold text-indigo-700 mb-4">🔄 The Complete Reset Process</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { num: '1', title: 'Notice', desc: 'Catch yourself judging' },
            { num: '2', title: 'Accept', desc: 'Feel the emotion fully' },
            { num: '3', title: 'Release', desc: 'Let it go at the towel' },
            { num: '4', title: 'Refocus', desc: 'Back to THIS point' }
          ].map((step, i) => (
            <div key={i} className="bg-white rounded-xl p-4 text-center">
              <div className="bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                {step.num}
              </div>
              <div className="font-bold text-indigo-700 text-sm mb-1">{step.title}</div>
              <div className="text-indigo-500 text-xs">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const views: { id: ViewType; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '📋' },
  { id: 'circumplex', label: 'Map', icon: '🎯' },
  { id: 'timeline', label: 'Time', icon: '⏰' },
  { id: 'arousal', label: 'Energy', icon: '⚡' },
  { id: 'controllability', label: 'Control', icon: '🎮' },
  { id: 'ego', label: 'Focus', icon: '🧠' }
]

export default function MasterYourEmotions() {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionKey | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView hoveredEmotion={hoveredEmotion} setHoveredEmotion={setHoveredEmotion} />
      case 'circumplex':
        return <CircumplexView hoveredEmotion={hoveredEmotion} setHoveredEmotion={setHoveredEmotion} />
      case 'timeline':
        return <TimelineView />
      case 'arousal':
        return <ArousalView />
      case 'controllability':
        return <ControllabilityView />
      case 'ego':
        return <EgoView />
      default:
        return <OverviewView hoveredEmotion={hoveredEmotion} setHoveredEmotion={setHoveredEmotion} />
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-stone-800 via-stone-700 to-stone-600 p-4 md:p-6">
        <div
          className={`max-w-5xl mx-auto transition-all duration-500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
          }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
            <span className="text-xl">🎾</span>
            <span className="text-white/80 font-medium text-sm">Tennis Mental Game</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">Master Your Emotions</h1>
          <p className="text-white/60">Control your mind, control the match</p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {views.map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                activeView === view.id
                  ? 'bg-white text-stone-800 shadow-lg scale-105'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <span>{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-2xl min-h-[500px]">
          {renderView()}
        </div>

        {/* Footer */}
        <div className="text-center p-6 text-white/40 text-xs md:text-sm">
          Based on sports psychology research: Attribution Theory • Circumplex Model • IZOF • Achievement Goal Theory
        </div>
        </div>
      </div>
    </>
  )
}
