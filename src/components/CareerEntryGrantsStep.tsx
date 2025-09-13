import React, { useState } from 'react';
import { useBuilder } from '../stores/builder';
import { getCareerById } from '../data/Careers/basic_careers';

// Local type to handle optional groupId in validation issues
type UIValidationIssue = { code: string; message: string; groupId?: string };

type CareerChoices = {
  skillChoices: Record<string, Array<{name: string; spec?: string}>>;
  talentChoices: Record<string, Array<{name: string; spec?: string}>>;
};

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

const CareerEntryGrantsStep: React.FC<Props> = ({ onNext, onPrev }) => {
  const draft = useBuilder((s) => s.draft);
  const setCareerEntryChoices = useBuilder((s) => s.setCareerEntryChoices);
  const applyCareerEntryGrants = useBuilder((s) => s.applyCareerEntryGrants);
  
  const career = draft.careerId ? getCareerById(draft.careerId) : null;
  
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<UIValidationIssue[]>([]);

  if (!career) {
    return <div>No career selected</div>;
  }

  // Use standardized flag name
  const hasAppliedGrants = draft.flags?.grantsAppliedAtCreation ?? false;

  if (hasAppliedGrants) {
    return (
      <div className="career-entry-grants">
        <h2>Career Entry Grants (Applied)</h2>
        <p>You have already applied career entry grants for {draft.name || 'this character'}.</p>
        <p>Career: {career.name}</p>
        <div className="wizard-nav">
          <button onClick={onPrev}>Previous</button>
          <button onClick={onNext}>Next</button>
        </div>
      </div>
    );
  }

  // Handle option selection for OR groups
  const toggleOption = (groupId: string, option: string) => {
    setPicks(current => {
      const currentPicks = current[groupId] || [];
      const group = [...(career.skillAdvances.groups || []), ...(career.talentAdvances.groups || [])]
        .find(g => g.groupId === groupId);
      
      if (!group) return current;
      
      if (currentPicks.includes(option)) {
        return {
          ...current,
          [groupId]: currentPicks.filter(item => item !== option)
        };
      } else if (currentPicks.length < group.requiredCount) {
        return {
          ...current,
          [groupId]: [...currentPicks, option]
        };
      }
      return current;
    });
    setErrors([]);
  };

  // Check if all requirements are satisfied
  const isValid = () => {
    const allGroups = [...(career.skillAdvances.groups || []), ...(career.talentAdvances.groups || [])];
    
    for (const group of allGroups) {
      const selectedCount = (picks[group.groupId] || []).length;
      if (selectedCount !== group.requiredCount) return false;
    }
    
    return true;
  };

  const handleApply = () => {
    // Build CareerChoices using groupId keys
    const choices: CareerChoices = {
      skillChoices: Object.fromEntries(
        (career.skillAdvances.groups ?? []).map(g => [
          g.groupId, 
          (picks[g.groupId] || []).map(name => ({ name }))
        ])
      ),
      talentChoices: Object.fromEntries(
        (career.talentAdvances.groups ?? []).map(g => [
          g.groupId,
          (picks[g.groupId] || []).map(name => ({ name }))
        ])
      )
    };

    // Set choices first
    setCareerEntryChoices(choices);
    
    // Then apply grants
    const result = applyCareerEntryGrants();
    
    if (!result.ok) {
     setErrors(result.issues || []);
      return;
    }
    
    // Success - move to next step
    onNext();
  };

  return (
    <div className="career-entry-grants">
      <h2>Career Entry: {career.name}</h2>
      
      {/* Required Skills - always granted */}
      {career.skillAdvances.required.length > 0 && (
        <div className="mb-4">
          <h3>Required Skills (automatically granted):</h3>
          <ul>
            {career.skillAdvances.required.map((skill, i) => (
              <li key={i}>{skill.name}{skill.spec ? ` (${skill.spec})` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Required Talents - always granted */}
      {career.talentAdvances.required.length > 0 && (
        <div className="mb-4">
          <h3>Required Talents (automatically granted):</h3>
          <ul>
            {career.talentAdvances.required.map((talent, i) => (
              <li key={i}>{talent.name}{talent.spec ? ` (${talent.spec})` : ''}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skill Choice Groups */}
      {career.skillAdvances.groups?.map(group => (
        <div key={group.groupId} className="mb-4 p-4 border rounded">
          <h3>Choose {group.requiredCount} skill(s):</h3>
          <div className="grid grid-cols-2 gap-2">
            {group.options.map((option, i) => {
              const optionKey = `${option.name}${option.spec ? `-${option.spec}` : ''}`;
              const isSelected = (picks[group.groupId] || []).includes(optionKey);
              const canSelect = !isSelected && (picks[group.groupId] || []).length < group.requiredCount;
              
              return (
                <button
                  key={i}
                  onClick={() => toggleOption(group.groupId, optionKey)}
                  disabled={!isSelected && !canSelect}
                  className={`p-2 border rounded text-left ${
                    isSelected ? 'bg-green-200 border-green-500' :
                    canSelect ? 'bg-white border-gray-300 hover:bg-gray-50' :
                    'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {option.name}{option.spec ? ` (${option.spec})` : ''}
                  {isSelected && ' ✓'}
                </button>
              );
            })}
          </div>
          {errors.some(e => e.groupId === group.groupId) && (
            <div className="text-red-600 text-sm mt-2">
              {errors.find(e => e.groupId === group.groupId)?.message}
            </div>
          )}
        </div>
      ))}

      {/* Talent Choice Groups */}
      {career.talentAdvances.groups?.map(group => (
        <div key={group.groupId} className="mb-4 p-4 border rounded">
          <h3>Choose {group.requiredCount} talent(s):</h3>
          <div className="grid grid-cols-2 gap-2">
            {group.options.map((option, i) => {
              const optionKey = `${option.name}${option.spec ? `-${option.spec}` : ''}`;
              const isSelected = (picks[group.groupId] || []).includes(optionKey);
              const canSelect = !isSelected && (picks[group.groupId] || []).length < group.requiredCount;
              
              return (
                <button
                  key={i}
                  onClick={() => toggleOption(group.groupId, optionKey)}
                  disabled={!isSelected && !canSelect}
                  className={`p-2 border rounded text-left ${
                    isSelected ? 'bg-green-200 border-green-500' :
                    canSelect ? 'bg-white border-gray-300 hover:bg-gray-50' :
                    'bg-gray-100 border-gray-200 text-gray-400'
                  }`}
                >
                  {option.name}{option.spec ? ` (${option.spec})` : ''}
                  {isSelected && ' ✓'}
                </button>
              );
            })}
          </div>
          {errors.some(e => e.groupId === group.groupId) && (
            <div className="text-red-600 text-sm mt-2">
              {errors.find(e => e.groupId === group.groupId)?.message}
            </div>
          )}
        </div>
      ))}

      {/* General errors */}
      {errors.filter(e => !e.groupId).map((error, i) => (
        <div key={i} className="text-red-600 mb-2">{error.message}</div>
      ))}

      <div className="wizard-nav">
        <button onClick={onPrev}>Previous</button>
        <button 
          onClick={handleApply}
          disabled={!isValid()}
          className={!isValid() ? 'opacity-50 cursor-not-allowed' : ''}
        >
          Apply & Continue
        </button>
      </div>
    </div>
  );
};

export default CareerEntryGrantsStep;