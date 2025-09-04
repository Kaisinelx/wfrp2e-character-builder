import { useDraft, draftActions } from '../state/CharacterDraftContext';

export function AdvancementTest() {
  const { draft, dispatch } = useDraft();
  
  // Mock advancement state for testing (until real system is added)
  const mockAdvancementState = {
    characteristicAdvances: {},
    skillLevels: {},
    acquiredTalents: new Set(),
    totalXpSpent: 0
  };

  const xpUnspent = draft.xpTotal || 0;

  const handleMockAdvancement = (type: string, target: string) => {
    console.log(`Mock advancement: ${type} - ${target}`);
    // This will be replaced with real advancement actions
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 max-w-4xl">
      <h2 className="text-xl font-bold mb-4">🚀 Advancement System Test (Mock)</h2>
      
      {/* Current Draft Status */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Current Draft Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span> {draft.name}
          </div>
          <div>
            <span className="text-gray-600">Race:</span> {draft.raceId || 'None'}
          </div>
          <div>
            <span className="text-gray-600">Career:</span> {draft.careerId || 'None'}
          </div>
          <div>
            <span className="text-gray-600">XP Total:</span> {draft.xpTotal || 0}
          </div>
        </div>
      </div>

      {/* Quick Setup */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">Quick Setup</h3>
        <div className="space-x-2">
          <button 
            onClick={() => dispatch(draftActions.setRace('human'))}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Set Human Race
          </button>
          <button 
            onClick={() => dispatch(draftActions.setCareer('soldier', 0))}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Set Soldier Career
          </button>
          <button 
            onClick={() => dispatch(draftActions.setName('Test Character'))}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Set Name
          </button>
        </div>
      </div>

      {/* Mock XP Management */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-2">XP Management (Mock)</h3>
        <div className="mb-3">
          <span className="text-sm text-gray-600">Current XP:</span>
          <span className="font-mono text-lg ml-2">{xpUnspent}</span>
        </div>
        
        <div className="space-x-2">
          <button 
            onClick={() => console.log('Would set XP to 1000')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Set 1000 XP (Mock)
          </button>
          <button 
            onClick={() => console.log('Would set XP to 500')}
            className="px-3 py-1 bg-blue-400 text-white rounded text-sm"
          >
            Set 500 XP (Mock)
          </button>
        </div>
      </div>

      {/* Mock Characteristic Advances */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-3">Characteristic Advances (Mock)</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Main Characteristics</h4>
            <div className="space-y-2">
              {['weaponSkill', 'ballisticSkill', 'strength', 'toughness'].map(stat => (
                <div key={stat} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {stat.replace(/([A-Z])/g, ' $1').trim()}: 
                    <span className="font-mono ml-1">
                      {draft.stats[stat as keyof typeof draft.stats]}
                    </span>
                  </span>
                  <button
                    onClick={() => handleMockAdvancement('characteristic', stat)}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                  >
                    +5% (Mock)
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Secondary Characteristics</h4>
            <div className="space-y-2">
              {[
                ['Attacks', draft.derived.attacks],
                ['Wounds', draft.derived.wounds],
                ['Magic', draft.derived.magic]
              ].map(([name, value]) => (
                <div key={name} className="flex items-center justify-between">
                  <span className="text-sm">
                    {name}: <span className="font-mono ml-1">{value}</span>
                  </span>
                  <button
                    onClick={() => handleMockAdvancement('characteristic', name.toLowerCase())}
                    className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                  >
                    +1 (Mock)
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mock Skills */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-3">Skills (Mock)</h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Dodge Blow</span>
            <div className="space-x-2">
              <button
                onClick={() => handleMockAdvancement('skill_acquire', 'Dodge Blow')}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                Acquire (Mock)
              </button>
              <button
                onClick={() => handleMockAdvancement('skill_improve', 'Dodge Blow +10%')}
                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
              >
                +10% (Mock)
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Strike Mighty Blow</span>
            <button
              onClick={() => handleMockAdvancement('talent', 'Strike Mighty Blow')}
              className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
            >
              Acquire Talent (Mock)
            </button>
          </div>
        </div>
      </div>

      {/* Current Skills & Talents */}
      <div className="mb-6 p-4 bg-white rounded border">
        <h3 className="font-semibold mb-3">Current Skills & Talents</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
            {draft.skills.length > 0 ? (
              <div className="space-y-1">
                {draft.skills.map((skill, idx) => (
                  <div key={idx} className="text-sm">
                    {skill.spec ? `${skill.name} (${skill.spec})` : skill.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No skills yet</div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Talents</h4>
            {draft.talents.length > 0 ? (
              <div className="space-y-1">
                {draft.talents.map((talent, idx) => (
                  <div key={idx} className="text-sm">
                    {talent.spec ? `${talent.name} (${talent.spec})` : talent.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No talents yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Development Controls */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2 text-yellow-800">🔧 Development Controls</h3>
        <div className="space-x-2">
          <button
            onClick={() => console.log('Draft state:', draft)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
          >
            Log Draft State
          </button>
          <button
            onClick={() => dispatch(draftActions.reset())}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Reset Draft
          </button>
        </div>
      </div>

      {/* Integration Notes */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2 text-blue-800">📝 Integration Notes</h3>
        <div className="text-sm text-blue-700">
          <p className="mb-2">This is a simplified test component that works with your current architecture.</p>
          <p className="mb-2">To add the full advancement system:</p>
          <ul className="list-disc ml-4 space-y-1">
            <li>Add advancement properties to Draft interface in CharacterDraftContext</li>
            <li>Add advancement action types to the reducer</li>
            <li>Add advancement actions to draftActions</li>
            <li>Create the careers barrel import path</li>
            <li>Add the advancement system types and logic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}