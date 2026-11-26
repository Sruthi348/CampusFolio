import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Building2, Users, ArrowRight, BookOpen, Layers } from 'lucide-react';

export function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/public/departments')
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F9] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#142B4A] bg-[#E9EFF6] px-3 py-1 rounded-full border border-[#B9C9DD] mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Academic Divisions
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] tracking-tight">
            Institutional Academic Departments
          </h1>
          <p className="text-xs sm:text-sm text-[#526175] mt-2">
            Explore academic programs, graduating cohorts, and verified student portfolios by department.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-[#526175]">Loading academic departments...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="bg-[#FFFFFF] border border-[#DCE3EC] rounded-2xl p-6 shadow-[0_1px_3px_rgba(20,43,74,0.05)] hover:border-[#142B4A] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-2.5 py-1 bg-[#E9EFF6] text-[#142B4A] font-bold text-xs rounded-lg border border-[#B9C9DD] uppercase tracking-wider">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-[#526175] flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#142B4A]" />
                      {dept._count?.students || 0} Portfolios
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#0F172A]">
                    {dept.name}
                  </h2>

                  <p className="text-xs text-[#526175] mt-2 leading-relaxed">
                    {dept.description || 'Specialized university department delivering accredited computing and engineering education.'}
                  </p>

                  {/* Batches in this department */}
                  <div className="mt-5 pt-4 border-t border-[#DCE3EC]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#526175] mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#526175]" />
                      Active Batches & Cohorts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dept.batches?.map((b) => (
                        <Link
                          key={b.id}
                          to={`/search?departmentId=${dept.id}&batchId=${b.id}`}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#F4F6F9] text-[#243F64] border border-[#DCE3EC] hover:bg-[#142B4A] hover:text-white hover:border-[#142B4A] transition"
                        >
                          {b.name} (Grad. {b.graduationYear})
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#DCE3EC] flex items-center justify-between">
                  <Link
                    to={`/search?departmentId=${dept.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B4A] hover:underline"
                  >
                    View All {dept.code} Students <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
