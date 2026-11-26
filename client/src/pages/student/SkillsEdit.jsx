import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../api/axios';
import {
  Sparkles,
  Plus,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tag
} from 'lucide-react';

export function SkillsEdit() {
  const { profileSummary, refreshProfile } = useOutletContext();
  const rawSkills = profileSummary?.profile?.skills;

  const [skillsList, setSkillsList] = useState([]);
  const [availableSharedSkills, setAvailableSharedSkills] = useState([]);

  // New tag inputs
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('TECHNICAL');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (rawSkills && Array.isArray(rawSkills)) {
      setSkillsList(rawSkills.map(s => ({
        name: s.skill?.name || '',
        category: s.skill?.category || 'TECHNICAL',
        proficiency: s.proficiency || 'Intermediate'
      })));
    }
  }, [profileSummary?.profile?.id, profileSummary?.profile?.updatedAt]);

  useEffect(() => {
    api.get('/public/meta')
      .then(res => {
        if (res.data.success) {
          setAvailableSharedSkills(res.data.skills || []);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillName.trim();
    if (!clean) return;

    if (skillsList.some(s => s.name.toLowerCase() === clean.toLowerCase())) {
      setMessage({ type: 'error', text: `Skill '${clean}' is already in your profile.` });
      return;
    }

    setSkillsList([
      ...skillsList,
      {
        name: clean,
        category: newSkillCategory,
        proficiency: newSkillProficiency
      }
    ]);
    setNewSkillName('');
    setMessage({ type: '', text: '' });
  };

  const handleQuickAdd = (sharedSkill) => {
    if (skillsList.some(s => s.name.toLowerCase() === sharedSkill.name.toLowerCase())) {
      return;
    }
    setSkillsList([
      ...skillsList,
      {
        name: sharedSkill.name,
        category: sharedSkill.category,
        proficiency: 'Intermediate'
      }
    ]);
  };

  const handleRemoveSkill = (name) => {
    setSkillsList(skillsList.filter(s => s.name.toLowerCase() !== name.toLowerCase()));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/students/me/skills', { skills: skillsList });
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Skills and interests synchronized successfully!' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update skills.'
      });
    } finally {
      setSaving(false);
    }
  };

  const technical = skillsList.filter(s => s.category === 'TECHNICAL');
  const soft = skillsList.filter(s => s.category === 'SOFT');
  const interests = skillsList.filter(s => s.category === 'INTEREST');

  return (
    <div className="max-w-4xl space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1">
            Competencies & Stack
          </span>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Skills & Interests
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-1">
            Select from the institutional catalog or add specialized technology tags.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Skills
        </button>
      </div>

      {message.text && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'badge-approved'
              : 'badge-rejected'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#A82222]" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add Skill Tag Card */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
        <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#142B4A]" />
          Add a Skill or Interest Tag
        </h3>

        <form onSubmit={handleAddSkill} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="sm:col-span-2">
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. React, Docker, Distributed Systems..."
              className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl px-3.5 py-2 text-xs text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:ring-1 focus:ring-[#142B4A]"
            />
          </div>

          <div>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl px-3 py-2 text-xs font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
            >
              <option value="TECHNICAL">Technical Skill</option>
              <option value="SOFT">Soft Skill</option>
              <option value="INTEREST">Interest</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              className="w-full h-full py-2 bg-[#142B4A] hover:bg-[#243F64] text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Tag
            </button>
          </div>
        </form>

        {/* Catalog quick picks */}
        <div className="mt-4 pt-4 border-t border-[#DCE3EC]">
          <span className="text-xs font-bold text-[#526175] uppercase tracking-wider block mb-2">
            Suggested Catalog Tags (Click to add)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {availableSharedSkills.slice(0, 15).map((s) => {
              const alreadyAdded = skillsList.some(item => item.name.toLowerCase() === s.name.toLowerCase());
              if (alreadyAdded) return null;

              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickAdd(s)}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F4F6F9] text-[#243F64] border border-[#DCE3EC] hover:bg-[#E9EFF6] hover:border-[#B9C9DD] transition cursor-pointer"
                >
                  + {s.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categorized Active Tags */}
      <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] space-y-5">
        
        {/* Technical */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#142B4A]"></span>
              Technical Skills ({technical.length})
            </h3>
            <span className="text-xs text-[#526175]">Displayed on public portfolio</span>
          </div>

          {technical.length === 0 ? (
            <p className="text-xs text-[#526175] italic">No technical skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {technical.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold bg-[#E9EFF6] text-[#243F64] border border-[#DCE3EC]"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-[#526175] hover:text-[#A82222] transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Soft Skills */}
        <div className="pt-4 border-t border-[#DCE3EC]">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#243F64]"></span>
              Soft Skills & Leadership ({soft.length})
            </h3>
          </div>

          {soft.length === 0 ? (
            <p className="text-xs text-[#526175] italic">No soft skills added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {soft.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-[#F4F6F9] text-[#0F172A] border border-[#DCE3EC]"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-[#526175] hover:text-[#A82222] transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="pt-4 border-t border-[#DCE3EC]">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B9C9DD]"></span>
              Interests & Focus Areas ({interests.length})
            </h3>
          </div>

          {interests.length === 0 ? (
            <p className="text-xs text-[#526175] italic">No interests added yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {interests.map((s) => (
                <span
                  key={s.name}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium bg-[#E9EFF6] text-[#142B4A] border border-[#B9C9DD]"
                >
                  <span>#{s.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.name)}
                    className="text-[#526175] hover:text-[#A82222] transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
