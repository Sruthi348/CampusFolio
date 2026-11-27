import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Building,
  GraduationCap,
  Users,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  Phone
} from 'lucide-react';

export function AdminStaff() {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add staff modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [staffId, setStaffId] = useState('');
  const [designation, setDesignation] = useState('Class In-charge / Tutor');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [initialPassword, setInitialPassword] = useState('Staff@123');
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Edit staff modal
  const [editStaffItem, setEditStaffItem] = useState(null);
  const [editDesignation, setEditDesignation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editBatchId, setEditBatchId] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Assign students modal
  const [assignStaffItem, setAssignStaffItem] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [assignSaving, setAssignSaving] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');

  const fetchStaffAndDepts = async () => {
    setLoading(true);
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/admin/staff'),
        api.get('/admin/departments')
      ]);

      if (staffRes.data.success) {
        setStaffList(staffRes.data.staff);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.departments);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffAndDepts();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddSaving(true);
    setAddError('');
    setAddSuccess('');

    try {
      const res = await api.post('/admin/staff', {
        fullName: fullName.trim(),
        email: email.trim(),
        staffId: staffId.trim(),
        designation: designation.trim(),
        phone: phone ? phone.trim() : null,
        departmentId: departmentId || null,
        batchId: batchId || null,
        initialPassword: initialPassword || 'Staff@123'
      });

      if (res.data.success) {
        setAddSuccess(`Staff account authorized! Temporary password: ${res.data.initialPasswordProvided}`);
        setTimeout(() => {
          setAddModalOpen(false);
          setFullName('');
          setEmail('');
          setStaffId('');
          setPhone('');
          setDepartmentId('');
          setBatchId('');
          setAddSuccess('');
          fetchStaffAndDepts();
        }, 1500);
      }
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setAddSaving(false);
    }
  };

  const handleOpenEdit = (staff) => {
    setEditStaffItem(staff);
    setEditDesignation(staff.designation || '');
    setEditPhone(staff.phone || '');
    setEditDeptId(staff.departmentId || '');
    setEditBatchId(staff.batchId || '');
    setEditError('');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editStaffItem) return;

    setEditSaving(true);
    setEditError('');

    try {
      const res = await api.patch(`/admin/staff/${editStaffItem.id}`, {
        designation: editDesignation.trim(),
        phone: editPhone ? editPhone.trim() : null,
        departmentId: editDeptId || null,
        batchId: editBatchId || null
      });

      if (res.data.success) {
        setEditStaffItem(null);
        fetchStaffAndDepts();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update staff profile.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleOpenAssign = async (staff) => {
    setAssignStaffItem(staff);
    setAssignMessage('');
    try {
      const res = await api.get('/admin/students', { params: { limit: 100 } });
      if (res.data.success) {
        setAllStudents(res.data.students);
        const existingIds = staff.assignedStudents?.map(a => a.studentId || a.student?.id) || [];
        setSelectedStudentIds(existingIds);
      }
    } catch (err) {
      console.error('Failed to load students for assignment:', err);
    }
  };

  const handleSaveAssignments = async () => {
    if (!assignStaffItem) return;
    setAssignSaving(true);
    try {
      const res = await api.post(`/admin/staff/${assignStaffItem.id}/assign`, {
        studentIds: selectedStudentIds
      });
      if (res.data.success) {
        setAssignMessage(res.data.message);
        setTimeout(() => {
          setAssignStaffItem(null);
          fetchStaffAndDepts();
        }, 1000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign students.');
    } finally {
      setAssignSaving(false);
    }
  };

  const filteredStaff = staffList.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.staffId?.toLowerCase().includes(q) ||
      s.user?.email?.toLowerCase().includes(q) ||
      s.department?.name?.toLowerCase().includes(q)
    );
  });

  const selectedDeptObj = departments.find(d => d.id === departmentId);
  const editDeptObj = departments.find(d => d.id === editDeptId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#142B4A]" />
            Staff & Faculty Directory
          </h1>
          <p className="text-xs text-[#526175] mt-0.5">
            Authorize class in-charges, tutors, and evaluators responsible for student document verification.
          </p>
        </div>

        <button
          onClick={() => {
            setAddModalOpen(true);
            setAddError('');
            setAddSuccess('');
          }}
          className="px-4 py-2.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#243F64] shadow-xs inline-flex items-center gap-2 transition-colors self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Authorize New Staff Member
        </button>
      </div>

      {/* Search and Summary */}
      <div className="bg-white p-4 rounded-xl border border-[#DCE3EC] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#B9C9DD] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by faculty name, staff ID, email, or department..."
            className="w-full text-xs bg-[#F4F6F9] pl-9 pr-3 py-2 rounded-lg border border-[#DCE3EC] text-[#0F172A] focus:outline-hidden focus:border-[#142B4A] focus:bg-white transition-colors"
          />
        </div>

        <div className="text-xs font-semibold px-4 py-2 bg-[#F4F6F9] text-[#526175] rounded-lg border border-[#DCE3EC] flex items-center gap-2">
          <span>Total Authorized Staff: <strong className="text-[#0F172A]">{staffList.length}</strong></span>
        </div>
      </div>

      {/* Staff Roster Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#142B4A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#DCE3EC] p-12 text-center">
          <UserCheck className="w-12 h-12 text-[#B9C9DD] mx-auto mb-2" />
          <h3 className="font-semibold text-sm text-[#0F172A]">No Staff Accounts Found</h3>
          <p className="text-xs text-[#526175] mt-1 max-w-sm mx-auto">
            Authorize your first faculty class in-charge or tutor to begin verifying student records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-[#DCE3EC] shadow-xs p-5 flex flex-col justify-between hover:border-[#142B4A] transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-lg bg-[#E9EFF6] text-[#142B4A] font-bold text-sm flex items-center justify-center shrink-0 border border-[#B9C9DD]">
                      {staff.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-[#0F172A] truncate">{staff.fullName}</h3>
                      <p className="text-xs text-[#243F64] font-semibold truncate">{staff.designation}</p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#F4F6F9] text-[#526175] border border-[#DCE3EC]">
                    {staff.staffId}
                  </span>
                </div>

                <div className="text-xs text-[#526175] space-y-1.5 mb-4 bg-[#F4F6F9] p-3 rounded-lg border border-[#DCE3EC]">
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Email:</span>
                    <span className="font-mono text-xs text-[#0F172A] truncate max-w-[170px]">{staff.user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Department:</span>
                    <span className="font-medium text-[#0F172A]">{staff.department?.name || 'Unassigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#526175]">Assigned Batch:</span>
                    <span className="font-medium text-[#0F172A]">{staff.batch?.name || 'All / General'}</span>
                  </div>
                  {staff.phone && (
                    <div className="flex justify-between">
                      <span className="text-[#526175]">Contact:</span>
                      <span className="font-mono text-xs text-[#0F172A]">{staff.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                  <div className="p-2 rounded-lg bg-[#E9EFF6] border border-[#B9C9DD]">
                    <span className="font-bold text-sm text-[#142B4A] block">
                      {staff.assignedStudents?.length || 0}
                    </span>
                    <span className="text-xs text-[#526175]">Direct Students</span>
                  </div>

                  <div className="p-2 rounded-lg bg-[#EBF7EE] border border-[#86EFAC]">
                    <span className="font-bold text-sm text-[#166534] block">
                      {staff._count?.verificationRecords || 0}
                    </span>
                    <span className="text-xs text-[#526175]">Decisions Recorded</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#DCE3EC] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenAssign(staff)}
                  className="px-3 py-1.5 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-[#142B4A]" />
                  Assign Students
                </button>

                <button
                  onClick={() => handleOpenEdit(staff)}
                  className="px-3 py-1.5 rounded-lg border border-[#DCE3EC] text-xs font-semibold text-[#526175] hover:text-[#142B4A] hover:bg-[#E9EFF6] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-[#526175]" />
                  Edit Scope
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Authorize New Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <h3 className="font-bold text-base text-[#0F172A] flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#142B4A]" />
                Authorize New Staff Member
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addSuccess ? (
              <div className="p-4 rounded-xl bg-[#EBF7EE] border border-[#86EFAC] text-[#166534] text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#166534]" />
                <span>{addSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                {addError && (
                  <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{addError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Kumar"
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Institutional Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. staff.mca@college.edu"
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Staff ID / Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="e.g. STF-MCA-001"
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Designation / Role *
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="Class In-charge / Tutor"
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Department Assignment
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => {
                        setDepartmentId(e.target.value);
                        setBatchId('');
                      }}
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                    >
                      <option value="">Select Department...</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                      Batch Assignment
                    </label>
                    <select
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                      disabled={!selectedDeptObj?.batches?.length}
                      className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors disabled:opacity-50"
                    >
                      <option value="">All Batches in Dept</option>
                      {selectedDeptObj?.batches?.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">
                    Initial Password
                  </label>
                  <input
                    type="text"
                    value={initialPassword}
                    onChange={(e) => setInitialPassword(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  />
                  <span className="text-xs text-[#526175]">
                    The staff member will be required to change their password upon first log in.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-[#526175] font-semibold hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSaving}
                    className="px-4 py-2 rounded-lg bg-[#142B4A] text-white font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {addSaving ? 'Authorizing...' : 'Authorize Staff'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Staff Scope Modal */}
      {editStaffItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-4">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Edit Staff Permissions & Scope</h3>
                <p className="text-xs text-[#526175]">{editStaffItem.fullName} ({editStaffItem.staffId})</p>
              </div>
              <button
                onClick={() => setEditStaffItem(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              {editError && (
                <div className="p-3 rounded-lg bg-[#FDF0F0] border border-[#FCA5A5] text-[#A82222] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={editDesignation}
                  onChange={(e) => setEditDesignation(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={editDeptId}
                    onChange={(e) => {
                      setEditDeptId(e.target.value);
                      setEditBatchId('');
                    }}
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0F172A] uppercase tracking-wider mb-1">Batch</label>
                  <select
                    value={editBatchId}
                    onChange={(e) => setEditBatchId(e.target.value)}
                    disabled={!editDeptObj?.batches?.length}
                    className="w-full p-2.5 rounded-lg border border-[#DCE3EC] bg-[#F4F6F9] focus:outline-hidden focus:border-[#142B4A] focus:bg-white text-[#0F172A] transition-colors disabled:opacity-50"
                  >
                    <option value="">All Batches</option>
                    {editDeptObj?.batches?.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC]">
                <button
                  type="button"
                  onClick={() => setEditStaffItem(null)}
                  className="px-4 py-2 rounded-lg text-[#526175] font-semibold hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 rounded-lg bg-[#142B4A] text-white font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {editSaving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Students Modal */}
      {assignStaffItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3EC] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] mb-3">
              <div>
                <h3 className="font-bold text-base text-[#0F172A]">Direct Student Assignment</h3>
                <p className="text-xs text-[#526175]">Staff: {assignStaffItem.fullName}</p>
              </div>
              <button
                onClick={() => setAssignStaffItem(null)}
                className="p-1 rounded-lg text-[#526175] hover:text-[#0F172A] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {assignMessage && (
              <div className="p-3 mb-3 rounded-lg bg-[#EBF7EE] border border-[#86EFAC] text-[#166534] text-xs">
                {assignMessage}
              </div>
            )}

            <p className="text-xs text-[#526175] mb-2">
              Select specific students for whom this staff member is authorized to review and verify documents:
            </p>

            <div className="flex-1 overflow-y-auto space-y-1.5 border border-[#DCE3EC] rounded-xl p-2 bg-[#F4F6F9]">
              {allStudents.map((st) => {
                const isSelected = selectedStudentIds.includes(st.id);
                return (
                  <label
                    key={st.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white border border-[#DCE3EC] text-xs cursor-pointer hover:bg-[#E9EFF6] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, st.id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== st.id));
                        }
                      }}
                      className="rounded text-[#142B4A]"
                    />
                    <div className="min-w-0">
                      <span className="font-semibold text-[#0F172A] block">{st.fullName}</span>
                      <span className="text-xs text-[#526175] font-mono">
                        {st.rollNumber} • {st.department?.code} • {st.batch?.name}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DCE3EC] mt-3">
              <span className="text-xs text-[#526175]">
                Selected: <strong className="text-[#0F172A]">{selectedStudentIds.length}</strong> students
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAssignStaffItem(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#526175] hover:bg-[#E9EFF6] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveAssignments}
                  disabled={assignSaving}
                  className="px-4 py-1.5 rounded-lg bg-[#142B4A] text-white text-xs font-semibold hover:bg-[#243F64] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {assignSaving ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
