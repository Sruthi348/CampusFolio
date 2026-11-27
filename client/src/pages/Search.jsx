import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Search as SearchIcon,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Building2,
  Calendar,
  Layers,
  Award,
  FolderGit2
} from 'lucide-react';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filter options from meta
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [skillsList, setSkillsList] = useState([]);

  // Active filter state
  const query = searchParams.get('q') || '';
  const selectedDept = searchParams.get('departmentId') || '';
  const selectedBatch = searchParams.get('batchId') || '';
  const selectedSkill = searchParams.get('skill') || '';
  const selectedStatus = searchParams.get('status') || '';
  const selectedSort = searchParams.get('sort') || 'recent';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [inputQuery, setInputQuery] = useState(query);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    api.get('/public/meta')
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments || []);
          setBatches(res.data.batches || []);
          setSkillsList(res.data.skills || []);
        }
      })
      .catch((err) => console.error('Error fetching meta:', err));
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = {
          q: query,
          departmentId: selectedDept,
          batchId: selectedBatch,
          skill: selectedSkill,
          status: selectedStatus,
          sort: selectedSort,
          page: currentPage,
          limit: 12
        };

        const res = await api.get('/public/search', { params });
        if (res.data.success) {
          setStudents(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, selectedDept, selectedBatch, selectedSkill, selectedStatus, selectedSort, currentPage]);

  useEffect(() => {
    setInputQuery(query);
  }, [query]);

  const updateFilters = (newParams) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    if (!newParams.page) {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ q: inputQuery.trim() });
  };

  const handleResetFilters = () => {
    setInputQuery('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(query || selectedDept || selectedBatch || selectedSkill || selectedStatus);

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold text-[#142B4A] uppercase tracking-wider block mb-1.5">
                Institutional Directory
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
                Student Portfolios
              </h1>
              <p className="text-sm sm:text-base text-[#526175] mt-1">
                Discover verified students across departments, technology stacks, and graduating cohorts.
              </p>
            </div>

            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 bg-[#FFFFFF] border border-[#DCE3EC] rounded-lg text-sm font-bold text-[#0F172A] shadow-xs"
            >
              <SlidersHorizontal className="w-4.5 h-4.5 text-[#142B4A]" />
              Filters {hasActiveFilters && '(Active)'}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-[0_2px_8px_rgba(20,43,74,0.06)] rounded-xl bg-[#FFFFFF] border border-[#DCE3EC] p-2 focus-within:border-[#142B4A] transition">
            <SearchIcon className="w-5 h-5 text-[#526175] ml-3 shrink-0" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Search by student name, bio keywords, skills, or project titles..."
              className="w-full px-3.5 py-2.5 text-base text-[#0F172A] placeholder-[#526175]/60 focus:outline-hidden"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={() => {
                  setInputQuery('');
                  updateFilters({ q: '' });
                }}
                className="p-2 text-[#526175] hover:text-[#0F172A] mr-1"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#142B4A] text-white text-sm font-semibold hover:bg-[#243F64] transition shadow-xs shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Content Layout: Filters + Results */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Filters Sidebar */}
          <aside
            className={`w-full md:w-68 bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 shrink-0 shadow-[0_1px_3px_rgba(20,43,74,0.05)] ${
              mobileFilterOpen ? 'block' : 'hidden md:block'
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#DCE3EC]">
              <span className="font-bold text-sm uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#142B4A]" />
                Filter Talent
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#142B4A] hover:underline"
                >
                  Reset All
                </button>
              )}
            </div>

            <div className="space-y-4 pt-4 text-sm">
              
              {/* Department Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => updateFilters({ departmentId: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Batch / Cohort
                </label>
                <select
                  value={selectedBatch}
                  onChange={(e) => updateFilters({ batchId: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                >
                  <option value="">All Batches</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (Class of {b.graduationYear})
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter: Student or Alumni */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Enrollment Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: selectedStatus === 'ACTIVE' ? '' : 'ACTIVE' })}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg border text-center transition cursor-pointer ${
                      selectedStatus === 'ACTIVE'
                        ? 'bg-[#142B4A] text-white border-[#142B4A]'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC] hover:bg-[#E9EFF6]'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: selectedStatus === 'ALUMNI' ? '' : 'ALUMNI' })}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg border text-center transition cursor-pointer ${
                      selectedStatus === 'ALUMNI'
                        ? 'bg-[#142B4A] text-white border-[#142B4A]'
                        : 'bg-[#F4F6F9] text-[#526175] border-[#DCE3EC] hover:bg-[#E9EFF6]'
                    }`}
                  >
                    Alumni
                  </button>
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Skill Tag
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => updateFilters({ skill: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                >
                  <option value="">Any Technology</option>
                  {skillsList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#526175] mb-1.5">
                  Sort By
                </label>
                <select
                  value={selectedSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="w-full bg-[#F4F6F9] border border-[#DCE3EC] rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] focus:outline-hidden focus:border-[#142B4A]"
                >
                  <option value="recent">Recently Updated</option>
                  <option value="name">Full Name (A-Z)</option>
                  <option value="views">Most Viewed</option>
                  <option value="projects">Most Projects</option>
                </select>
              </div>

            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 w-full">
            
            {/* Results Header Count */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#DCE3EC]">
              <span className="text-sm font-semibold text-[#526175]">
                Showing <strong>{students.length}</strong> of <strong>{pagination.total}</strong> published portfolios
              </span>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#526175]">Filters active</span>
                  <button
                    onClick={handleResetFilters}
                    className="text-[#142B4A] font-bold hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-[#526175]">Loading student profiles...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-12 text-center shadow-[0_1px_3px_rgba(20,43,74,0.05)]">
                <GraduationCap className="w-12 h-12 text-[#B9C9DD] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#0F172A]">No students match your criteria</h3>
                <p className="text-sm text-[#526175] mt-1 max-w-sm mx-auto">
                  Try broadening your search query or removing some active filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 px-5 py-2.5 bg-[#142B4A] hover:bg-[#243F64] text-white text-sm font-semibold rounded-lg transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {students.map((st) => (
                  <div
                    key={st.id}
                    className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-xl p-5 hover:border-[#142B4A] transition-all hover:shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#142B4A] text-white flex items-center justify-center font-bold text-base overflow-hidden shrink-0 border border-[#B9C9DD]">
                            {st.photoUrl ? (
                              <img src={st.photoUrl} alt={st.fullName} className="w-full h-full object-cover" />
                            ) : (
                              st.fullName.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-[#0F172A] hover:text-[#142B4A] transition">
                              <Link to={`/student/${st.slug}`}>{st.fullName}</Link>
                            </h3>
                            <p className="text-xs text-[#526175] mt-0.5">
                              {st.department?.code} • {st.batch?.name}
                            </p>
                          </div>
                        </div>

                        {st.status === 'ALUMNI' || st.status === 'GRADUATED' ? (
                          <span className="text-xs font-semibold badge-pending px-2.5 py-0.5 rounded-full shrink-0">
                            Alumni
                          </span>
                        ) : (
                          <span className="text-xs font-semibold badge-approved px-2.5 py-0.5 rounded-full shrink-0">
                            Active
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-[#526175] mt-3 line-clamp-2 leading-relaxed">
                        {st.bio || 'Verified student portfolio showcasing academic milestones, certifications, and technical projects.'}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3.5">
                        {st.skills?.slice(0, 4).map((s) => (
                          <span
                            key={s.skill.name}
                            className="text-xs px-2.5 py-1 rounded bg-[#E9EFF6] text-[#243F64] border border-[#DCE3EC] font-medium"
                          >
                            {s.skill.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
                      <span className="text-[#526175] font-medium text-xs">
                        {st._count?.projects || 0} Projects • {st._count?.certifications || 0} Certs
                      </span>
                      <Link
                        to={`/student/${st.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-[#142B4A] hover:underline text-sm"
                      >
                        View Portfolio <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 pt-4 border-t border-[#DCE3EC] flex items-center justify-between text-sm">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  className="px-4 py-2 rounded-lg border border-[#DCE3EC] bg-[#FFFFFF] hover:bg-[#F4F6F9] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F172A] font-semibold flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-[#526175]">
                  Page <strong>{currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                </span>
                <button
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  className="px-4 py-2 rounded-lg border border-[#DCE3EC] bg-[#FFFFFF] hover:bg-[#F4F6F9] disabled:opacity-40 disabled:cursor-not-allowed text-[#0F172A] font-semibold flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
