import React, { useState } from 'react';
import { useDraft } from '../state/characterDraft';
import { getCareerById } from '../data/basic_careers';

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
  const draft = useDraft((s) => s.draft);
  const setCareerEntryChoices = useDraft((s) => s.setCareerEntryChoices);
  const applyCareerEntryGrants = useDraft((s) => s.applyCareerEntryGrants);
  
  const career = draft.careerId ? getCareerById(draft.careerId) : null;
  
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [errors, setErrors] = useState<UIValidationIssue[]>([]);

  if (!career) {
    return <div>No career selected</div>;
  }

  // Use standardized flag name
  const hasAppliedGrants =
  (draft as any).flags?.grantsAppliedAtCreation ??
  (draft as any).hasAppliedFirstBasicGrants ??
  false;

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
          (picks[g.groupId] ?? []).map(name => ({ name }))
        ])
      ),
      talentChoices: Object.fromEntries(
        (career.talentAdvances.groups ?? []).map(g => [
          g.groupId, 
          (picks[g.groupId] ?? []).map(name => ({ name }))
        ])
      )
    };
    
    setCareerEntryChoices(choices);
    const result = applyCareerEntryGrants();
    
    if (!result.ok) {
      // Handle optional groupId in validation issues
      const issues: UIValidationIssue[] = (result.issues ?? []) as UIValidationIssue[];
      setErrors(issues);
      return;
    }
    
    onNext();
  };

  return (
    <div className="career-entry-grants">
      <h2>Career Entry Grants: {career.name}</h2>
      
      {/* Show all validation errors */}
      {errors.length > 0 && (
        <div className="error">
          <ul className="error-list">
            {errors.map((issue, i) => (
              <li key={i} className="error-item">
                {issue.groupId ? <strong>{issue.groupId}: </strong> : null}
                {issue.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <section className="required-section">
        <h3>Required Skills (Auto-Applied):</h3>
        <ul>
          {career.skillAdvances.required.map(skill => (
            <li key={skill.name}>{skill.name}</li>
          ))}
        </ul>
        
        <h3>Required Talents (Auto-Applied):</h3>
        <ul>
          {career.talentAdvances.required.map(talent => (
            <li key={talent.name}>{talent.name}</li>
          ))}
        </ul>
      </section>
      
      <section className="or-groups">
        {/* Skill OR groups */}
        {career.skillAdvances.groups?.map(group => (
          <div key={group.groupId} className="or-group">
            <h3>Choose {group.requiredCount} Skill{group.requiredCount > 1 ? 's' : ''}:</h3>
            <div className="options">
              {group.options.map(option => {
                const isSelected = (picks[group.groupId] || []).includes(option.name);
                const currentCount = (picks[group.groupId] || []).length;
                const isDisabled = !isSelected && currentCount >= group.requiredCount;
                
                return (
                  <label key={option.name} className={`option ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleOption(group.groupId, option.name)}
                    />
                    {option.name}
                  </label>
                );
              })}
            </div>
            <p className="selection-count">
              Selected: {(picks[group.groupId] || []).length} / {group.requiredCount}
            </p>
          </div>
        ))}
        
        {/* Talent OR groups */}
        {career.talentAdvances.groups?.map(group => (
          <div key={group.groupId} className="or-group">
            <h3>Choose {group.requiredCount} Talent{group.requiredCount > 1 ? 's' : ''}:</h3>
            <div className="options">
              {group.options.map(option => {
                const isSelected = (picks[group.groupId] || []).includes(option.name);
                const currentCount = (picks[group.groupId] || []).length;
                const isDisabled = !isSelected && currentCount >= group.requiredCount;
                
                return (
                  <label key={option.name} className={`option ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleOption(group.groupId, option.name)}
                    />
                    {option.name}
                  </label>
                );
              })}
            </div>
            <p className="selection-count">
              Selected: {(picks[group.groupId] || []).length} / {group.requiredCount}
            </p>
          </div>
        ))}
      </section>
      
      <div className="wizard-nav">
        <button onClick={onPrev}>Previous</button>
        <button onClick={handleApply} disabled={!isValid()}>
          Apply & Continue
        </button>
      </div>
    </div>
  );
};

export default CareerEntryGrantsStep;