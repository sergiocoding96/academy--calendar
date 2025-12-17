import React, { useState } from 'react';

const EmotionalRoutineBuilder = () => {
  const [activeEmotion, setActiveEmotion] = useState('frustration');
  const [showModal, setShowModal] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newFeeling, setNewFeeling] = useState('');
  const [targetEmotion, setTargetEmotion] = useState('calmness');
  const [expandedScenario, setExpandedScenario] = useState(null);

  const emotions = {
    disappointment: {
      name: 'Disappointment',
      icon: '😞',
      color: 'slate',
      gradient: 'from-slate-500 to-slate-600',
      arousal: 3,
      timeline: 'Past',
      ego: 'Ego-Threatened',
      danger: 'Critical',
      description: 'Low energy withdrawal from challenge'
    },
    frustration: {
      name: 'Frustration',
      icon: '😤',
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
      arousal: 6,
      timeline: 'Past/Present',
      ego: 'Task → Ego-Pressured',
      danger: 'Moderate',
      description: 'Productive tension seeking solution'
    },
    anger: {
      name: 'Anger',
      icon: '😠',
      color: 'rose',
      gradient: 'from-rose-500 to-red-500',
      arousal: 8,
      timeline: 'Past/Present',
      ego: 'Ego-Defensive',
      danger: 'High',
      description: 'Explosive reaction to perceived injustice'
    },
    anxiety: {
      name: 'Anxiety',
      icon: '😰',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500',
      arousal: 7,
      timeline: 'Future',
      ego: 'Ego-Pressured',
      danger: 'High',
      description: 'Anticipatory fear of failure'
    },
    calmness: {
      name: 'Calmness',
      icon: '😌',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
      arousal: 4,
      timeline: 'Present',
      ego: 'Task-Focused',
      danger: 'Low',
      description: 'Centered presence and clarity'
    },
    excitement: {
      name: 'Excitement',
      icon: '😄',
      color: 'emerald',
      gradient: 'from-emerald-500 to-green-500',
      arousal: 7,
      timeline: 'Present/Future',
      ego: 'Task-Focused',
      danger: 'Low',
      description: 'Energized engagement with challenge'
    }
  };

  const [scenarios, setScenarios] = useState({
    disappointment: [
      { trigger: 'Lost first set badly', feeling: 'Deflated, wanting to give up, heavy legs', target: 'frustration' },
      { trigger: 'Parents/coach watching me lose', feeling: 'Shame, low energy, avoiding eye contact', target: 'calmness' }
    ],
    frustration: [
      { trigger: 'Break point down', feeling: 'Tight chest, rushing between points', target: 'calmness' },
      { trigger: 'Making same unforced error repeatedly', feeling: 'Self-criticism building, tension in grip', target: 'calmness' }
    ],
    anger: [
      { trigger: 'Bad line call against me', feeling: 'Burning sensation, want to argue, racing heart', target: 'calmness' },
      { trigger: 'Opponent celebrating loudly', feeling: 'Disrespected, explosive energy building', target: 'frustration' }
    ],
    anxiety: [
      { trigger: 'Serving for the match', feeling: 'Shaky hands, shallow breathing, racing thoughts', target: 'calmness' },
      { trigger: 'Match point against me', feeling: 'Tunnel vision, everything feels fast', target: 'calmness' },
      { trigger: 'Big crowd watching', feeling: 'Self-conscious, distracted by audience', target: 'excitement' }
    ],
    calmness: [
      { trigger: 'Cruising with a big lead', feeling: 'Too relaxed, losing focus, sloppy errors', target: 'excitement' }
    ],
    excitement: [
      { trigger: 'Playing a much weaker opponent', feeling: 'Overconfident, not taking it seriously', target: 'calmness' }
    ]
  });

  const [routines, setRoutines] = useState({
    disappointment: [
      'Acknowledge the feeling - don\'t suppress it',
      'Stand tall, chin up (body leads mind)',
      'Find ONE thing you\'re doing well',
      'Say: "This is data, not defeat"',
      'Commit to fighting for the NEXT point',
      'Small process goal: win the next 2 points'
    ],
    frustration: [
      'Walk slowly to your towel',
      'Wipe face deliberately (3 full seconds)',
      'One deep diaphragmatic breath (belly expands)',
      'Drop your shoulders, soft hands',
      'Say: "Next point, fresh start"',
      'Pick your target before serving/returning'
    ],
    anger: [
      'STOP - do NOT react immediately',
      'Turn away from the court',
      'Tighten fists for 5 seconds, then release completely',
      'Three slow breaths (4-7-8 pattern)',
      'Say: "I control my response"',
      'Wait 10 full seconds before next point'
    ],
    anxiety: [
      'Feel your feet firmly on the ground',
      'Slow diaphragmatic breath (belly expands on inhale)',
      'Relax shoulders, loosen grip',
      'Focus on ONE thing: the ball',
      'Say: "Trust your training"',
      'Simplify: play your highest-percentage shot'
    ],
    calmness: [
      'Stay engaged with tactical thinking',
      'Maintain consistent pre-point routine',
      'Keep intensity in your footwork',
      'Stay hungry - don\'t coast',
      'Process goal: move your feet on every ball'
    ],
    excitement: [
      'Channel energy into focused intensity',
      'Stay humble, stay hungry',
      'Commit fully to each shot',
      'Visualize executing your best points',
      'Maintain respect for opponent and match'
    ]
  });

  const [newRoutineStep, setNewRoutineStep] = useState('');

  const targetEmotions = ['calmness', 'frustration', 'excitement'];

  const addScenario = () => {
    if (newTrigger.trim() && newFeeling.trim()) {
      setScenarios(prev => ({
        ...prev,
        [activeEmotion]: [...(prev[activeEmotion] || []), {
          trigger: newTrigger.trim(),
          feeling: newFeeling.trim(),
          target: targetEmotion
        }]
      }));
      setNewTrigger('');
      setNewFeeling('');
      setTargetEmotion('calmness');
      setShowModal(false);
    }
  };

  const removeScenario = (emotionKey, index) => {
    setScenarios(prev => ({
      ...prev,
      [emotionKey]: prev[emotionKey].filter((_, i) => i !== index)
    }));
  };

  const addRoutineStep = () => {
    if (newRoutineStep.trim()) {
      setRoutines(prev => ({
        ...prev,
        [activeEmotion]: [...(prev[activeEmotion] || []), newRoutineStep.trim()]
      }));
      setNewRoutineStep('');
    }
  };

  const removeRoutineStep = (emotionKey, index) => {
    setRoutines(prev => ({
      ...prev,
      [emotionKey]: prev[emotionKey].filter((_, i) => i !== index)
    }));
  };

  const currentEmotion = emotions[activeEmotion];
  const currentScenarios = scenarios[activeEmotion] || [];
  const currentRoutine = routines[activeEmotion] || [];

  const colorMap = {
    slate: { bg: 'bg-slate-500', text: 'text-slate-400', border: 'border-slate-500', bgLight: 'bg-slate-500/10' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500', bgLight: 'bg-amber-500/10' },
    rose: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500', bgLight: 'bg-rose-500/10' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-400', border: 'border-violet-500', bgLight: 'bg-violet-500/10' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', bgLight: 'bg-blue-500/10' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500', bgLight: 'bg-emerald-500/10' }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 mb-6">
            <span className="text-xl">🎾</span>
            <span className="text-sm font-medium text-slate-300 tracking-wide">TENNIS MENTAL TRAINING</span>
          </div>
          <h1 className="text-5xl font-light text-white mb-3 tracking-tight">
            Emotional <span className="font-semibold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Routine</span> Builder
          </h1>
          <p className="text-slate-500 text-lg">
            Map your triggers • Know your feelings • Find your path back
          </p>
        </div>

        {/* Emotion Selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 p-2 rounded-2xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm">
          {Object.entries(emotions).map(([key, emotion]) => (
            <button
              key={key}
              onClick={() => setActiveEmotion(key)}
              className={`px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                activeEmotion === key 
                  ? `bg-gradient-to-r ${emotion.gradient} text-white shadow-lg shadow-${emotion.color}-500/20` 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="text-xl">{emotion.icon}</span>
              <span className="hidden sm:inline">{emotion.name}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 p-8 shadow-2xl">
          {/* Emotion Header */}
          <div className="mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentEmotion.gradient} flex items-center justify-center shadow-lg shadow-${currentEmotion.color}-500/20`}>
                <span className="text-5xl">{currentEmotion.icon}</span>
              </div>
              <div>
                <h2 className={`text-3xl font-semibold ${colorMap[currentEmotion.color].text} mb-1`}>
                  {currentEmotion.name}
                </h2>
                <p className="text-slate-400">{currentEmotion.description}</p>
              </div>
            </div>

            {/* Emotion Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Energy Level', value: `${currentEmotion.arousal}/10` },
                { label: 'Time Focus', value: currentEmotion.timeline },
                { label: 'Mind State', value: currentEmotion.ego.split(' ')[0] },
                { label: 'Risk Level', value: currentEmotion.danger }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/30">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-white font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Your Reset Routine */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm">📋</span>
                  Your Reset Routine
                </h3>
              </div>

              <div className="bg-slate-800/30 rounded-2xl p-5 border border-slate-700/30">
                <div className="space-y-3 mb-4">
                  {currentRoutine.map((step, index) => (
                    <div key={index} className="group flex items-start gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 hover:border-slate-600/50 transition-all">
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-r ${currentEmotion.gradient} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                        {index + 1}
                      </div>
                      <p className="text-slate-300 flex-1 text-sm leading-relaxed">{step}</p>
                      <button
                        onClick={() => removeRoutineStep(activeEmotion, index)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all text-lg"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Step */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRoutineStep}
                    onChange={(e) => setNewRoutineStep(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRoutineStep()}
                    placeholder="Add a routine step..."
                    className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none transition-all"
                  />
                  <button
                    onClick={addRoutineStep}
                    className={`px-5 rounded-xl bg-gradient-to-r ${currentEmotion.gradient} text-white font-semibold hover:opacity-90 transition-all`}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Trigger Scenarios */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-sm">⚡</span>
                  Trigger Scenarios
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className={`px-4 py-2 rounded-xl bg-gradient-to-r ${currentEmotion.gradient} text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center gap-2`}
                >
                  <span>+</span> Add Trigger
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {currentScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="group relative bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all overflow-hidden cursor-pointer"
                    onClick={() => setExpandedScenario(expandedScenario === index ? null : index)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xl`}>{currentEmotion.icon}</span>
                          <h4 className="text-white font-semibold">{scenario.trigger}</h4>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeScenario(activeEmotion, index);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-all text-sm px-2 py-1 rounded-lg hover:bg-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <p className="text-slate-400 text-sm italic mb-3">"{scenario.feeling}"</p>

                      {/* Pathway Visualization */}
                      <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl p-3">
                        <div className="text-center">
                          <span className="text-2xl block">{currentEmotion.icon}</span>
                          <span className={`text-xs ${colorMap[currentEmotion.color].text}`}>{currentEmotion.name}</span>
                        </div>
                        <div className={`flex-1 h-1 rounded-full bg-gradient-to-r ${currentEmotion.gradient} relative`}>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 py-0.5 rounded text-xs text-slate-400 whitespace-nowrap">
                            Use routine →
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-2xl block">{emotions[scenario.target].icon}</span>
                          <span className={`text-xs ${colorMap[emotions[scenario.target].color].text}`}>{emotions[scenario.target].name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded View */}
                    <div className={`overflow-hidden transition-all duration-300 ${expandedScenario === index ? 'max-h-96' : 'max-h-0'}`}>
                      <div className="px-4 pb-4 pt-2 border-t border-slate-700/30">
                        <p className="text-sm text-slate-400 mb-2">Your reset routine for this trigger:</p>
                        <div className="space-y-1">
                          {currentRoutine.slice(0, 4).map((step, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                              <span className={`w-5 h-5 rounded-full bg-gradient-to-r ${currentEmotion.gradient} text-white text-xs flex items-center justify-center`}>{i + 1}</span>
                              {step}
                            </div>
                          ))}
                          {currentRoutine.length > 4 && (
                            <p className="text-slate-500 text-xs ml-7">+ {currentRoutine.length - 4} more steps...</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {currentScenarios.length === 0 && (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📝</span>
                    <p className="text-slate-400">No triggers mapped yet.</p>
                    <p className="text-slate-500 text-sm">Add scenarios where you typically feel {currentEmotion.name.toLowerCase()}.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-600 text-sm">
          Based on: Attribution Theory • Circumplex Model • IZOF • Achievement Goal Theory
        </div>
      </div>

      {/* Add Scenario Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentEmotion.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl">{currentEmotion.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Add {currentEmotion.name} Trigger</h3>
                <p className="text-slate-400 text-sm">Map a new scenario</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  What triggers this emotion?
                </label>
                <input
                  type="text"
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                  placeholder="e.g., Break point down, Bad line call..."
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How does it feel in your body/mind?
                </label>
                <textarea
                  value={newFeeling}
                  onChange={(e) => setNewFeeling(e.target.value)}
                  placeholder="e.g., Tight chest, racing thoughts, burning sensation..."
                  rows={2}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-slate-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Where should you go emotionally?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {targetEmotions.map((key) => {
                    const emotion = emotions[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setTargetEmotion(key)}
                        className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                          targetEmotion === key
                            ? `bg-gradient-to-r ${emotion.gradient} border-transparent text-white`
                            : 'bg-slate-800/40 border-slate-700/30 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-2xl">{emotion.icon}</span>
                        <span className="text-xs font-medium">{emotion.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setShowModal(false);
                  setNewTrigger('');
                  setNewFeeling('');
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addScenario}
                disabled={!newTrigger.trim() || !newFeeling.trim()}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
                  newTrigger.trim() && newFeeling.trim()
                    ? `bg-gradient-to-r ${currentEmotion.gradient} text-white hover:opacity-90`
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                Add Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionalRoutineBuilder;
