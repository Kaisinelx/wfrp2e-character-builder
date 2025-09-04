import { useDraft } from '../state/CharacterDraftContext';
import { WFRP_RACES } from '../data/races';
import { BASIC_CAREERS } from '../data/basic_careers/';

export default function CharacterSheet() {
  const { draft: char } = useDraft();

  const race = WFRP_RACES.find(r => r.id === char.raceId);
  const career = BASIC_CAREERS.find(c => c.id === char.careerId);

  return (
    <div className="sheet mx-auto max-w-4xl p-6">
      {/* Header */}
      <header className="mb-6 pb-4 border-b-2 border-[#8b1538]">
        <h1 className="font-display text-4xl text-[#8b1538] mb-2">{char.name}</h1>
        <div className="flex gap-4 text-lg">
          <span><strong>Race:</strong> {race?.name || '—'}</span>
          <span><strong>Career:</strong> {career?.name || '—'}</span>
          {career?.isMagicalCareer && (
            <span className="text-purple-600"><strong>✨ Magical:</strong> Magic = {char.derived.magic}</span>
          )}
        </div>
      </header>

      {/* Main Characteristics */}
      <section className="mb-6">
        <h2 className="font-display text-2xl text-[#8b1538] mb-3">Main Characteristics</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {[
            ['WS', char.stats.weaponSkill],
            ['BS', char.stats.ballisticSkill],
            ['S', char.stats.strength],
            ['T', char.stats.toughness],
            ['Ag', char.stats.agility],
            ['Int', char.stats.intelligence],
            ['WP', char.stats.willPower],
            ['Fel', char.stats.fellowship]
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
            ['A', char.derived.attacks],
            ['W', char.derived.wounds],
            ['SB', char.derived.strengthBonus],
            ['TB', char.derived.toughnessBonus],
            ['M', char.derived.move],
            ['Mag', char.derived.magic],
            ['IP', char.derived.insanityPoints],
            ['FP', char.derived.fate]
          ].map(([key, value]) => (
            <div key={key} className="card-gothic text-center p-3">
              <div className="text-sm font-semibold text-[#8b1538] mb-1">{key}</div>
              <div className="text-2xl font-bold">{value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills & Talents */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills */}
          <div className="card-gothic p-4">
            <h3 className="font-display text-xl text-[#8b1538] mb-3">Skills</h3>
            <ul className="list-disc list-inside space-y-1">
              {/* Race required skills */}
              {(race?.skills?.required ?? []).map((skill) => (
                <li key={`race-skill-${skill.name}-${skill.spec ?? ''}`} className="text-sm">
                  {skill.name}{skill.spec ? ` (${skill.spec})` : ''}
                </li>
              ))}

              {/* Race choice groups: show "Choose N: A / B / C" */}
              {(race?.skills?.choices ?? []).map((group, i) => (
                <li key={`race-skill-choice-${i}`} className="text-sm text-green-700">
                  Choose {group.pick}:{' '}
                  {(group.options ?? [])
                    .map(opt => opt.spec ? `${opt.name} (${opt.spec})` : opt.name)
                    .join(' / ')}
                </li>
              ))}

              {/* Career skills - fix to access .required array */}
              {(career?.skillAdvances.required ?? []).slice(0, 6).map((skill) => (
                <li key={`career-skill-${skill.name}-${skill.spec ?? ''}`} className="text-sm text-blue-600">
                  {skill.name}{skill.spec ? ` (${skill.spec})` : ''} <span className="opacity-70">(Career)</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Talents */}
          <div className="card-gothic p-4">
            <h3 className="font-display text-xl text-[#8b1538] mb-3">Talents</h3>
            <ul className="list-disc list-inside space-y-1">
              {/* Race required talents */}
              {(race?.talents?.required ?? []).map((talent) => (
                <li key={`race-talent-${talent.name}-${talent.spec ?? ''}`} className="text-sm">
                  {talent.name}{talent.spec ? ` (${talent.spec})` : ''}
                </li>
              ))}

              {/* Race random talents: present as "Roll N from …" (or actually roll elsewhere) */}
              {race?.talents?.random && (
                <li className="text-sm text-green-700">
                  Roll {race.talents.random.count} from:{' '}
                  {(race.talents.random.options ?? [])
                    .map(opt => opt.spec ? `${opt.name} (${opt.spec})` : opt.name)
                    .join(' / ')}
                </li>
              )}


              {/* Career talents - fix to access .required array */}
              {(career?.talentAdvances.required ?? []).slice(0, 6).map((talent) => (
                <li key={`career-talent-${talent.name}-${talent.spec ?? ''}`} className="text-sm text-blue-600">
                  {talent.name}{talent.spec ? ` (${talent.spec})` : ''} <span className="opacity-70">(Career)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>


      {/* Character Info */}
      <section className="mb-6">
        <div className="card-gothic p-4">
          <h3 className="font-display text-xl text-[#8b1538] mb-3">Character Info</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Created:</strong> {new Date(char.createdAt).toLocaleDateString()}</div>
            <div><strong>Updated:</strong> {new Date(char.updatedAt).toLocaleDateString()}</div>
            <div><strong>XP Total:</strong> {char.xpTotal}</div>
            <div><strong>XP Spent:</strong> {char.xpSpent}</div>
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
            console.log('Character Export:', JSON.stringify(char, null, 2));
            navigator.clipboard?.writeText(JSON.stringify(char, null, 2));
            alert('Character exported to console and clipboard!');
          }}
          className="btn-primary"
        >
          📁 Export JSON
        </button>
        <button onClick={() => window.history.back()} className="btn-primary">
          ← Back to Builder
        </button>
      </section>
    </div>
  );
}