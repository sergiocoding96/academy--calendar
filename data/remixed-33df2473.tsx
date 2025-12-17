import React, { useState } from 'react';

const tournamentData = {
  "Week 1": {
    dates: "Jan 1 – Jan 7",
    categories: {
      "U12/U14": [],
      "U16/U18": [],
      "Adults": []
    }
  },
  "Week 2": {
    dates: "Jan 8 – Jan 14",
    categories: {
      "U12/U14": [],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "Local Open", location: "Marbella/Estepona", zone: 1 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Local Money Tournament", location: "Costa del Sol Circuit", zone: 1 }
      ]
    }
  },
  "Week 3": {
    dates: "Jan 15 – Jan 21",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Andalusian Regional Qualifiers", location: "Seville/Málaga", zone: 2 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "FAT Federated Tournament", location: "Jerez/Cádiz", zone: 2 },
        { type: "B", label: "National", name: "ITF J100 Manacor", location: "Rafa Nadal Academy", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "IBP Satélite", location: "Andalucía", zone: 2 }
      ]
    }
  },
  "Week 4": {
    dates: "Jan 22 – Jan 28",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Local Open Sotogrande", location: "Octogono/SotoTennis", zone: 1 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "Provincial Open", location: "Club Tenis Málaga", zone: 1 },
        { type: "B", label: "National", name: "ITF J100 Manacor", location: "Rafa Nadal Academy", zone: 4 },
        { type: "C", label: "International", name: "ITF J60 Cairo", location: "Egypt", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Open Nacional", location: "Sevilla/Córdoba", zone: 2 }
      ]
    }
  },
  "Week 5": {
    dates: "Feb 2 – Feb 8",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "RPT Sevilla Qualifying", location: "Blas Infante", zone: 2 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "RPT Sevilla Qualifying", location: "Blas Infante", zone: 2 },
        { type: "B", label: "National", name: "ITF J100 Manacor", location: "Rafa Nadal Academy", zone: 4 },
        { type: "C", label: "International", name: "ITF J60 Hammamet", location: "Tunisia", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "ITF M15 Javea", location: "Alicante", zone: 3 },
        { type: "B", label: "National", name: "ITF W15 Manacor", location: "Mallorca", zone: 4 }
      ]
    }
  },
  "Week 6": {
    dates: "Feb 9 – Feb 15",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "RPT Sevilla Challenge", location: "Blas Infante", zone: 2, highlight: true },
        { type: "B", label: "National", name: "Rafa Nadal Tour Sevilla", location: "Rio Grande", zone: 2 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "RPT Sevilla Challenge", location: "Blas Infante", zone: 2, highlight: true },
        { type: "B", label: "National", name: "ITF J60 Manacor", location: "Mallorca", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Open de Invierno", location: "Málaga", zone: 1 },
        { type: "B", label: "National", name: "ITF M15 Vale do Lobo", location: "Portugal (Algarve)", zone: 3 }
      ]
    }
  },
  "Week 7": {
    dates: "Feb 16 – Feb 22",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Rafa Nadal Tour Sevilla", location: "Rio Grande", zone: 2, highlight: true }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "Local Training Block", location: "Sotogrande", zone: 1 },
        { type: "B", label: "National", name: "ITF J30 Vila do Conde", location: "Portugal", zone: 3 },
        { type: "C", label: "International", name: "ITF J100 Cairo", location: "Egypt", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Open Local", location: "Algeciras/La Línea", zone: 1 },
        { type: "B", label: "National", name: "ITF M15 Vila Real", location: "Portugal", zone: 3 }
      ]
    }
  },
  "Week 8": {
    dates: "Mar 2 – Mar 8",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Provincial Team Championships", location: "Cádiz/Málaga", zone: 1 },
        { type: "B", label: "National", name: "Warriors Tour Sevilla", location: "Blas Infante", zone: 2 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "RPT Marbella Slam", location: "Puente Romano", zone: 1, highlight: true },
        { type: "B", label: "National", name: "ITF J60 Sousse", location: "Tunisia", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "ITF M15/W15 Portugal", location: "Faro/Loulé", zone: 3 },
        { type: "B", label: "National", name: "ITF M15 Torello", location: "Catalonia", zone: 4 }
      ]
    }
  },
  "Week 9": {
    dates: "Mar 9 – Mar 15",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Warriors Tour Sevilla", location: "Blas Infante", zone: 2 },
        { type: "B", label: "National", name: "RPT Madrid Challenge", location: "Club Race", zone: 4 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "Warriors Tour Sevilla", location: "Blas Infante", zone: 2 },
        { type: "B", label: "National", name: "RPT Madrid Challenge", location: "Club Race", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Open de Primavera", location: "Cádiz", zone: 1 },
        { type: "B", label: "National", name: "ITF M15 Quinta do Lago", location: "Portugal (Algarve)", zone: 3 }
      ]
    }
  },
  "Week 10": {
    dates: "Mar 16 – Mar 22",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "Local Club Open", location: "Octogono/La Reserva", zone: 1 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "RPT Valencia Slam", location: "Carlet", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "Open Semana Santa", location: "Andalucía", zone: 2 },
        { type: "B", label: "National", name: "ITF M15 Badalona", location: "Barcelona", zone: 4 }
      ]
    }
  },
  "Week 11": {
    dates: "Mar 30 – Apr 5",
    categories: {
      "U12/U14": [
        { type: "A", label: "Proximity", name: "RPT Valencia Challenge", location: "Valencia Tennis Center", zone: 4 },
        { type: "B", label: "National", name: "Warriors Tour Alicante", location: "Ferrero Academy", zone: 4 }
      ],
      "U16/U18": [
        { type: "A", label: "Proximity", name: "TE U16 Portimao", location: "Portugal", zone: 3, highlight: true },
        { type: "B", label: "National", name: "RPT Valencia Challenge", location: "Valencia", zone: 4 },
        { type: "C", label: "International", name: "ITF J60 Telde", location: "Gran Canaria", zone: 4 }
      ],
      "Adults": [
        { type: "A", label: "Proximity", name: "ITF M15 Reus", location: "Catalonia", zone: 4 },
        { type: "B", label: "National", name: "Open Nacional Linares", location: "Jaén", zone: 3 }
      ]
    }
  }
};

const optionConfig = {
  A: { 
    gradient: 'from-rose-600 via-red-600 to-red-700',
    glow: 'shadow-red-500/30',
    accent: '#dc2626',
    label: 'PROXIMITY'
  },
  B: { 
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    glow: 'shadow-slate-500/30',
    accent: '#475569',
    label: 'NATIONAL'
  },
  C: { 
    gradient: 'from-amber-500 via-orange-500 to-orange-600',
    glow: 'shadow-orange-500/30',
    accent: '#f59e0b',
    label: 'INTERNATIONAL'
  }
};

export default function TennisCalendar() {
  const [selectedWeek, setSelectedWeek] = useState("Week 4");
  const [selectedCategory, setSelectedCategory] = useState("U16/U18");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const weeks = Object.keys(tournamentData);
  const categories = ["U12/U14", "U16/U18", "Adults"];
  
  const currentWeekData = tournamentData[selectedWeek as keyof typeof tournamentData];
  const tournaments = currentWeekData?.categories[selectedCategory as keyof typeof currentWeekData.categories] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-red-100/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 bg-orange-100/20 rounded-full blur-3xl" />
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900 via-red-800 to-red-900" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-8">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-12 bg-gradient-to-b from-red-400 to-red-600 rounded-full" />
                <div>
                  <h1 
                    className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-red-400 to-orange-400"
                    style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.08em' }}
                  >
                    SOTOTENNIS
                  </h1>
                  <p className="text-red-300/70 text-xs tracking-widest uppercase">Inspiring Tennis Excellence</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 
                className="text-xl md:text-2xl font-bold text-white"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Tournament Calendar
              </h2>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className="text-red-200/80 text-sm">2026</span>
                <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded text-red-200 text-xs font-medium">
                  BETA
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8">
        {/* Week Timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-stone-500 text-sm font-medium tracking-wide uppercase">Select Week</span>
          </div>
          
          <div className="relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-stone-300 to-transparent -translate-y-1/2" />
            <div className="flex overflow-x-auto gap-3 pb-2 relative scrollbar-hide">
              {weeks.map((week, idx) => {
                const weekNum = week.replace("Week ", "");
                const isSelected = selectedWeek === week;
                const hasEvents = Object.values(tournamentData[week as keyof typeof tournamentData].categories).some(cat => cat.length > 0);
                
                return (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={`relative flex-shrink-0 group transition-all duration-300 ${
                      isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                    }`}
                  >
                    <div className={`
                      w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300
                      ${isSelected 
                        ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-xl shadow-red-500/30' 
                        : hasEvents 
                          ? 'bg-white border border-stone-200 hover:border-red-300 hover:shadow-lg shadow-sm' 
                          : 'bg-stone-100 border border-stone-200 opacity-50'
                      }
                    `}>
                      <span 
                        className={`text-[10px] font-bold tracking-[0.2em] ${isSelected ? 'text-red-200' : 'text-stone-400'}`}
                      >
                        WEEK
                      </span>
                      <span 
                        className={`text-xl font-black tracking-wide ${isSelected ? 'text-white' : 'text-stone-700'}`}
                        style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.05em' }}
                      >
                        {weekNum}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xl shadow-stone-200/50">
          {/* Week Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-50 via-white to-orange-50" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative px-6 py-6 flex items-center justify-between border-b border-stone-100">
              <div>
                <h3 
                  className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-700 via-red-600 to-red-700"
                  style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: '0.12em' }}
                >
                  {selectedWeek.replace("Week ", "W E E K   ").toUpperCase()}
                </h3>
                <p className="text-red-500 font-semibold mt-1">{currentWeekData.dates}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-stone-600 text-sm font-medium">Q1 2026</span>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/50">
            <div className="flex gap-2">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = currentWeekData.categories[cat as keyof typeof currentWeekData.categories]?.length || 0;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`
                      relative flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25' 
                        : 'text-stone-500 hover:text-stone-700 hover:bg-white hover:shadow-md'
                      }
                    `}
                  >
                    <span className="relative z-10">{cat}</span>
                    {count > 0 && (
                      <span className={`
                        absolute top-1.5 right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold
                        ${isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}
                      `}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tournament List */}
          <div className="p-6 bg-gradient-to-b from-white to-stone-50">
            {tournaments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-stone-500 font-medium">No tournaments this week</p>
                <p className="text-stone-400 text-sm mt-1">Check other categories or weeks</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tournaments.map((tournament, idx) => {
                  const config = optionConfig[tournament.type as keyof typeof optionConfig];
                  const isHovered = hoveredCard === idx;
                  
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredCard(idx)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`
                        group relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer
                        ${isHovered ? 'scale-[1.02] shadow-2xl' : 'shadow-lg'}
                        ${(tournament as { highlight?: boolean }).highlight ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-white' : ''}
                      `}
                    >
                      {/* Card gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient}`} />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20" />
                      
                      {/* Shine effect on hover */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                        transition-transform duration-700 -skew-x-12
                        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
                      `} />

                      {/* Content */}
                      <div className="relative p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Type badge */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs font-bold tracking-wider">
                                {config.label}
                              </span>
                              {(tournament as { highlight?: boolean }).highlight && (
                                <span className="px-3 py-1 bg-yellow-400/90 rounded-lg text-yellow-900 text-xs font-bold flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  PRIORITY
                                </span>
                              )}
                            </div>

                            {/* Tournament name */}
                            <h4 
                              className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight"
                              style={{ fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {tournament.name}
                            </h4>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-white/80">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="font-medium">{tournament.location}</span>
                            </div>
                          </div>

                          {/* Arrow indicator */}
                          <div className={`
                            w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center
                            transition-all duration-300
                            ${isHovered ? 'bg-white/20 translate-x-1' : ''}
                          `}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-full border border-stone-200 shadow-sm">
            {Object.entries(optionConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient}`} />
                <span className="text-stone-500 text-xs font-medium tracking-wide">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Custom font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
