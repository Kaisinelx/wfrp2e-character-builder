import React, { useState } from 'react';
import { useBuilder } from '../stores/builder';

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

const CareerEntryGrantsStep: React.FC<Props> = ({ onNext, onPrev }) => {
  const draft = useBuilder(state => state.draft);
  const hasAppliedGrants = useBuilder(state => state.draft.hasAppliedFirstBasicGrants);
  const applyCareerEntryGrants = useBuilder(state => state.applyCareerEntryGrants);
  const setCareerEntryChoices = useBuilder(state => state.setCareerEntryChoices);
  
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  
  // This would fetch career data based on draft.careerId in your implementation
  const career = { 
    name: "Example Career",
    skillAdvances: {
      required: ["Common Knowledge (The Empire)", "Gossip"],
      groups: [
        { groupId: "skills1", options: ["Charm", "Haggle", "Perception"], count: 2 }
      ]
    },
    talentAdvances: {
      required: ["Luck"],
      groups: [
        { groupId: "talents1", options: ["Acute Hearing", "Sixth Sense", "Warrior Born"], count: 1 }
      ]
    }
  };
  
  // If grants already applied, show summary and allow to proceed
  if (hasAppliedGrants) {
    return (
      <div className="career-entry-grants">
        <h2>Career Entry Grants (Applied)</h2>
        <p>You have already applied career entry grants for {draft.name || 'this character'}.</p>
        <p>Career: {career.name}</p>
        <div className="applied-grants">
          <h3>Applied Skills:</h3>
          <ul>
            {draft.skills.map((skill, idx) => (
              <li key={idx}>{skill.name}{skill.spec ? ` (${skill.spec})` : ''}</li>
            ))}
          </ul>
          <h3>Applied Talents:</h3>
          <ul>
            {draft.talents.map((talent, idx) => (
              <li key={idx}>{talent.name}{talent.spec ? ` (${talent.spec})` : ''}</li>
            ))}
          </ul>
        </div>
        <div className="wizard-nav">
          <button onClick={onPrev}>Previous</button>
          <button onClick={onNext}>Next</button>
        </div>
      </div>
    );
  }
  
  // Handle option selection
  const toggleOption = (groupId: string, option: string) => {
    setPicks(current => {
      const currentPicks = current[groupId] || [];
      const group = [...career.skillAdvances.groups, ...career.talentAdvances.groups]
        .find(g => g.groupId === groupId);
      
      if (!group) return current;
      
      if (currentPicks.includes(option)) {
        return {
          ...current,
          [groupId]: currentPicks.filter(item => item !== option)
        };
      } else {
        // Enforce count limit
        if (currentPicks.length >= group.count) {
          return current; // Don't allow more than the limit
        }
        return {
          ...current,
          [groupId]: [...currentPicks, option]
        };
      }
    });
    setError(null);
  };
  
  // Check if all requirements are satisfied
  const isValid = () => {
    if (!career.skillAdvances.groups.length && !career.talentAdvances.groups.length) {
      return true;
    }
    
    // Check skill groups
    for (const group of career.skillAdvances.groups || []) {
      const selectedCount = (picks[group.groupId] || []).length;
      if (selectedCount !== group.count) return false;
    }
    
    // Check talent groups
    for (const group of career.talentAdvances.groups || []) {
      const selectedCount = (picks[group.groupId] || []).length;
      if (selectedCount !== group.count) return false;
    }
    
    return true;
  };
  
  // Transform picks to the format expected by the store
  const transformPicks = () => {
    const skillChoices: Record<string, Array<{name: string; spec?: string}>> = {};
    const talentChoices: Record<string, Array<{name: string; spec?: string}>> = {};
    
    // Process skill groups
    career.skillAdvances.groups.forEach(group => {
      if (picks[group.groupId]) {
        skillChoices[group.groupId] = picks[group.groupId].map(name => ({ name }));
      }
    });
    
    // Process talent groups
    career.talentAdvances.groups.forEach(group => {
      if (picks[group.groupId]) {
        talentChoices[group.groupId] = picks[group.groupId].map(name => ({ name }));
      }
    });
    
    return { skillChoices, talentChoices };
  };
  
  // Handle apply and continue
  const handleApply = () => {
    const { skillChoices, talentChoices } = transformPicks();
    
    // Save choices first
    setCareerEntryChoices({
      skillChoices,
      talentChoices
    });
    
    // Then apply grants
    const result = applyCareerEntryGrants();
    
    if (!result.ok) {
      setError(result.issues?.[0].message || "Failed to apply grants");
      return;
    }
    
    onNext();
  };
  
  return (
    <div className="career-entry-grants">
      <h2>Career Entry Grants</h2>
      <p>Character: {draft.name || 'Unnamed'}</p>
      <p>Career: {career.name}</p>
      
      {error && <div className="error">{error}</div>}
      
      <section className="required-section">
        <h3>Required Skills (Auto-Applied):</h3>
        <ul>
          {career.skillAdvances.required.map(skill => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
        
        <h3>Required Talents (Auto-Applied):</h3>
        <ul>
          {career.talentAdvances.required.map(talent => (
            <li key={talent}>{talent}</li>
          ))}
        </ul>
      </section>
      
      <section className="or-groups">
        {career.skillAdvances.groups.map(group => (
          <div key={group.groupId} className="or-group">
            <h3>Choose {group.count} Skill{group.count > 1 ? 's' : ''}:</h3>
            <div className="options">
              {group.options.map(option => {
                const isSelected = (picks[group.groupId] || []).includes(option);
                const currentCount = (picks[group.groupId] || []).length;
                const isDisabled = !isSelected && currentCount >= group.count;
                
                return (
                  <label key={option} className={`option ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleOption(group.groupId, option)}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
            <p className="selection-count">
              Selected: {(picks[group.groupId] || []).length} / {group.count}
            </p>
          </div>
        ))}
        
        {career.talentAdvances.groups.map(group => (
          <div key={group.groupId} className="or-group">
            <h3>Choose {group.count} Talent{group.count > 1 ? 's' : ''}:</h3>
            <div className="options">
              {group.options.map(option => {
                const isSelected = (picks[group.groupId] || []).includes(option);
                const currentCount = (picks[group.groupId] || []).length;
                const isDisabled = !isSelected && currentCount >= group.count;
                
                return (
                  <label key={option} className={`option ${isDisabled ? 'disabled' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => toggleOption(group.groupId, option)}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
            <p className="selection-count">
              Selected: {(picks[group.groupId] || []).length} / {group.count}
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