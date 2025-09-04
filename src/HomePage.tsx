import { useState } from 'react';
import { rollD10, rollCharacteristicsByRace } from './utils/dice';
import CharacterWizard from './components/CharacterWizard';
import { useDraft, draftActions } from './state/CharacterDraftContext';
import { WFRP_RACES } from './data/races';
import { getCareerById, BASIC_CAREERS } from './data/basic_careers';
// Remove the problematic ADVANCED_CAREERS import for now
// import { ADVANCED_CAREERS } from './data/advanced_careers';

// Add type imports
import type { SkillChoice, TalentChoice } from './data/races';

function HomePage() {
  const [testRoll, setTestRoll] = useState<number | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  
const { draft, lastGeneration, dispatch } = useDraft();

  const handleTestRoll = () => {
    const roll = rollD10();
    setTestRoll(roll);
  };
  
  const createQuickCharacter = (raceId: string, careerId?: string) => {
  dispatch(draftActions.reset());
  dispatch(draftActions.setRace(raceId));
  dispatch(draftActions.setName(`${raceId.charAt(0).toUpperCase() + raceId.slice(1)} Character`));

    // career (look in BASIC_CAREERS only for now)
     if (careerId) {
    const career = getCareerById(careerId); // ← Using your barrel!
    const magicFloor = career?.magicFloor ?? 0;
    dispatch(draftActions.setCareer(careerId, magicFloor));
  }

    // one roll gives you everything
   const rolled = rollCharacteristicsByRace(raceId);

    // set stats
    dispatch(draftActions.setStats({
      weaponSkill: rolled.weaponSkill,
      ballisticSkill: rolled.ballisticSkill,
      strength: rolled.strength,
      toughness: rolled.toughness,
      agility: rolled.agility,
      intelligence: rolled.intelligence,
      willPower: rolled.willPower,
      fellowship: rolled.fellowship,
    }));

    // set fate & wounds (table-driven)
  dispatch(draftActions.applyRolledDerived(rolled.wounds, rolled.fate, rolled.rolls));

    setShowSheet(true);
  };

  const handleWizardComplete = () => {
    setShowWizard(false);
    setShowSheet(true);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  const handleBackToBuilder = () => {
    setShowSheet(false);
    setShowWizard(false);
  };

  // Helper function to render skill/talent names
  const renderSkillName = (skill: SkillChoice): string => {
    return skill.spec ? `${skill.name} (${skill.spec})` : skill.name;
  };

  const renderTalentName = (talent: TalentChoice): string => {
    return talent.spec ? `${talent.name} (${talent.spec})` : talent.name;
  };

  // Inline CharacterSheet component that reads from context
const CharacterSheetInline = () => {
  const race = WFRP_RACES.find(r => r.id === draft.raceId);
  const career = getCareerById(draft.careerId || '');

    return (
      <div className="sheet mx-auto max-w-4xl p-6">
        {/* Header */}
        <header className="mb-6 pb-4 border-b-2 border-[#8b1538]">
          <h1 className="font-display text-4xl text-[#8b1538] mb-2">{draft.name}</h1>
          <div className="flex gap-4 text-lg">
            <span><strong>Race:</strong> {race?.name || '—'}</span>
            <span><strong>Career:</strong> {career?.name || '—'}</span>
            {career?.isMagicalCareer && (
              <span className="text-purple-600"><strong>✨ Magical:</strong> Magic = {draft.derived.magic}</span>
            )}
          </div>
        </header>

        {/* Main Characteristics */}
        <section className="mb-6">
          <h2 className="font-display text-2xl text-[#8b1538] mb-3">Main Characteristics</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[
              ['WS', draft.stats.weaponSkill],
              ['BS', draft.stats.ballisticSkill],
              ['S', draft.stats.strength],
              ['T', draft.stats.toughness],
              ['Ag', draft.stats.agility],
              ['Int', draft.stats.intelligence],
              ['WP', draft.stats.willPower],
              ['Fel', draft.stats.fellowship]
            ].map(([key, value]) => (
              <div key={key} className="card-gothic text-center p-3">
                <div className="text-sm font-semibold text-[#8b1538] mb-1">{key}</div>
                <div className="text-2xl font-bold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary Characteristics */}
        <section className="mb-6">
          <h2 className="font-display text-2xl text-[#8b1538] mb-3">Secondary Characteristics</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {[
              ['A', draft.derived.attacks],
              ['W', draft.derived.wounds],
              ['SB', draft.derived.strengthBonus],
              ['TB', draft.derived.toughnessBonus],
              ['M', draft.derived.move],
              ['Mag', draft.derived.magic],
              ['IP', draft.derived.insanityPoints],
              ['FP', draft.derived.fate]
            ].map(([key, value]) => (
              <div key={key} className="card-gothic text-center p-3">
                <div className="text-sm font-semibold text-[#8b1538] mb-1">{key}</div>
                <div className="text-2xl font-bold">{value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skills and Talents */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-gothic p-4">
              <h3 className="font-display text-xl text-[#8b1538] mb-3">Skills</h3>
              <ul className="list-disc list-inside space-y-1">
                {race?.skills.required.map((skill: SkillChoice, index: number) => (
                  <li key={`race-${index}`} className="text-sm">{renderSkillName(skill)}</li>
                ))}
                {/* Temporarily disable career skills until SkillBlock type is properly defined */}
                {/* {career?.skillAdvances?.slice(0, 3).map((skill: any, index: number) => (
                  <li key={`career-${index}`} className="text-sm text-blue-600">
                    {renderSkillName(skill)} (Career)
                  </li>
                ))} */}
              </ul>
            </div>

            <div className="card-gothic p-4">
              <h3 className="font-display text-xl text-[#8b1538] mb-3">Talents</h3>
              <ul className="list-disc list-inside space-y-1">
                {race?.talents.required.map((talent: TalentChoice, index: number) => (
                  <li key={`race-${index}`} className="text-sm">{renderTalentName(talent)}</li>
                ))}
                {/* Temporarily disable career talents until TalentBlock type is properly defined */}
                {/* {career?.talentAdvances?.slice(0, 3).map((talent: any, index: number) => (
                  <li key={`career-${index}`} className="text-sm text-blue-600">
                    {renderTalentName(talent)} (Career)
                  </li>
                ))} */}
              </ul>
            </div>
          </div>
        </section>

        {/* Character Info */}
        <section className="mb-6">
          <div className="card-gothic p-4">
            <h3 className="font-display text-xl text-[#8b1538] mb-3">Character Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><strong>Move:</strong> {draft.derived.move}</div>
              <div>
  <strong>Wounds:</strong> {draft.derived.wounds || 'Not rolled'}
{lastGeneration?.rolls.wounds && (   // ✅ not rolled.wounds
  <span className="text-gray-500 ml-1">
    (d10: {lastGeneration.rolls.wounds.roll})
  </span>
)}
</div>
<div>
  <strong>Fate:</strong> {draft.derived.fate || 'Not rolled'}
  {lastGeneration?.rolls.fate && (
    <span className="text-gray-500 ml-1">
      (d10: {lastGeneration.rolls.fate.roll})
    </span>
  )}
</div>
              <div><strong>Magic:</strong> {draft.derived.magic}</div>
              <div><strong>Created:</strong> {new Date(draft.createdAt).toLocaleDateString()}</div>
              <div><strong>Updated:</strong> {new Date(draft.updatedAt).toLocaleDateString()}</div>
              <div><strong>XP Total:</strong> {draft.xpTotal}</div>
              <div><strong>XP Spent:</strong> {draft.xpSpent}</div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="no-print flex gap-3 justify-center">
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Print Sheet
          </button>
          <button 
            onClick={() => {
              console.log('Character Export:', JSON.stringify(draft, null, 2));
              navigator.clipboard?.writeText(JSON.stringify(draft, null, 2));
              alert('Character exported to console and clipboard!');
            }} 
            className="btn-primary"
          >
            📁 Export JSON
          </button>
          <button onClick={handleBackToBuilder} className="btn-primary">
            ← Back to Builder
          </button>
        </section>
      </div>
    );
  };

  if (showWizard) {
    return <CharacterWizard onComplete={handleWizardComplete} onCancel={handleWizardCancel} />;
  }

  if (showSheet) {
    return (
      <div>
        <div className="max-w-4xl mx-auto p-4 mb-4">
          <button onClick={handleBackToBuilder} className="btn-primary mb-4">
            ← Back to Builder
          </button>
        </div>
        <CharacterSheetInline />
      </div>
    );
  }

  return (
    <div>
      <div className="card-gothic">
        <h1 className="text-heading text-gothic">
          🎲 WFRP2e Character Builder ⚔️
        </h1>
        <p style={{ marginBottom: '20px', fontSize: '1.1rem' }}>
          Create your Warhammer Fantasy Roleplay 2nd Edition characters with proper race-based movement and fate points!
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <button className="btn-primary" onClick={handleTestRoll} style={{ marginRight: '10px' }}>
            Test Roll d10: {testRoll ? testRoll : '?'}
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#8b1538', marginBottom: '15px' }}>Quick Character Creation:</h3>
          
          <div style={{ marginBottom: '10px' }}>
            <button className="btn-primary" onClick={() => createQuickCharacter('human')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🗡️ Human (M4)
            </button>
            <button className="btn-primary" onClick={() => createQuickCharacter('dwarf')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              ⚒️ Dwarf (M3)
            </button>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <button className="btn-primary" onClick={() => createQuickCharacter('elf')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🏹 Elf (M5)
            </button>
            <button className="btn-primary" onClick={() => createQuickCharacter('halfling')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🍖 Halfling (M4)
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <button className="btn-primary" onClick={() => createQuickCharacter('voryn')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🌲 Voryn (M4)
            </button>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ color: '#8b1538', marginBottom: '10px' }}>With Magical Careers:</h4>
            <button className="btn-primary" onClick={() => createQuickCharacter('human', 'apprentice-wizard')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🔮 Human Wizard (Magic = 1)
            </button>
            <button className="btn-primary" onClick={() => createQuickCharacter('human', 'witch')} style={{ marginRight: '10px', marginBottom: '5px' }}>
              🌙 Human Witch (Magic = 1)
            </button>
          </div>
        </div>

        <hr style={{ margin: '20px 0', border: '1px solid #8b1538' }} />

        <button 
          onClick={() => setShowWizard(true)} 
          className="btn-primary" 
          style={{ fontSize: '1.2rem', padding: '15px 30px' }}
        >
          🎭 Start Character Creation Wizard
        </button>

        {/* Current Draft Preview */}
        {(draft.raceId || draft.careerId) && (
          <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #8b1538', borderRadius: '10px' }}>
            <h4 style={{ color: '#8b1538', marginBottom: '10px' }}>Current Draft in Context:</h4>
            <p><strong>Name:</strong> {draft.name}</p>
            <p><strong>Race:</strong> {draft.raceId} (Move: {draft.derived.move})</p>
            <p><strong>Fate:</strong> {draft.derived.fate || 'Not rolled'}</p>
            <p><strong>Wounds:</strong> {draft.derived.wounds || 'Not rolled'}</p>
            <p><strong>Career:</strong> {draft.careerId || 'None'}</p>
            <p><strong>Magic:</strong> {draft.derived.magic}</p>
            <button onClick={() => setShowSheet(true)} className="btn-primary" style={{ marginTop: '10px', marginRight: '10px' }}>
              👁️ View Sheet
            </button>
            <button onClick={() => setShowWizard(true)} className="btn-primary" style={{ marginTop: '10px' }}>
              ✏️ Continue in Wizard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;