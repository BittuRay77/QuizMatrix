import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const Drafts = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningDraft, setAssigningDraft] = useState(null);
  const [studentFilters, setStudentFilters] = useState({ college: '', branch: '', semester: '', section: '' });
  const [filterOptions, setFilterOptions] = useState({ colleges: [], branches: [], semesters: [], sections: [] });
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  const fetchDrafts = async () => {
    try {
      const res = await api.get('/exams/teacher/drafts');
      setDrafts(res.data.drafts || []);
    } catch (err) {
      toast.error('Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrafts(); }, []);

  const continueEdit = (id) => navigate(`/create-exam/${id}`);
  const preview = (id) => navigate(`/exam-preview/${id}`);

  const duplicate = async (id) => {
    try {
      const res = await api.post(`/exams/${id}/duplicate`);
      toast.success(res.data.message || 'Duplicated');
      fetchDrafts();
    } catch (err) { toast.error('Failed to duplicate'); }
  };

  const publish = async (id) => {
    const draft = drafts.find((item) => item._id === id);
    const assignedCount = Array.isArray(draft?.allowedStudents) ? draft.allowedStudents.length : 0;
    if (assignedCount === 0) {
      toast.error('Please assign at least one student before publishing');
      return;
    }

    try {
      const res = await api.post(`/exams/${id}/publish`);
      toast.success(res.data.message || 'Published');
      fetchDrafts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to publish'); }
  };

  const fetchStudentFilters = async (college = '', branch = '', semester = '') => {
    try {
      const res = await api.get('/exams/students/filters', {
        params: {
          college: college || undefined,
          branch: branch || undefined,
          semester: semester || undefined,
        },
      });
      
      setFilterOptions({
        colleges: res.data?.colleges || [],
        branches: res.data?.branches || [],
        semesters: res.data?.semesters || [],
        sections: res.data?.sections || [],
      });
    } catch (err) {
      toast.error('Failed to load filter options');
    }
  };

  const fetchStudents = async (filters) => {
    const hasRequiredFilters = Boolean(filters.college && filters.branch && filters.semester);
    if (!hasRequiredFilters) {
      setStudents([]);
      return;
    }

    setStudentsLoading(true);
    try {
      const res = await api.get('/exams/students', {
        params: {
          college: filters.college || undefined,
          branch: filters.branch || undefined,
          semester: filters.semester || undefined,
          section: filters.section || undefined,
          limit: 500,
        },
      });
      setStudents(res.data?.students || []);
    } catch (err) {
      toast.error('Failed to load students');
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const openAssign = async (draft) => {
    setAssigningDraft(draft);

    const initialCollege = Array.isArray(draft.allowedColleges) && draft.allowedColleges[0] ? draft.allowedColleges[0] : '';
    const initialBranch = Array.isArray(draft.allowedBranches) && draft.allowedBranches[0] ? draft.allowedBranches[0] : '';

    const nextFilters = {
      college: initialCollege,
      branch: initialBranch,
      semester: '',
      section: '',
    };

    setStudentFilters(nextFilters);
    setSelectedStudentIds([]);

    await fetchStudentFilters(nextFilters.college, nextFilters.branch, nextFilters.semester);
    await fetchStudents(nextFilters);
  };

  const closeAssign = () => {
    setAssigningDraft(null);
    setStudents([]);
    setSelectedStudentIds([]);
    setStudentFilters({ college: '', branch: '', semester: '', section: '' });
  };

  const handleFilterChange = async (field, value) => {
    const next = {
      ...studentFilters,
      [field]: value,
      ...(field === 'college' ? { branch: '', semester: '', section: '' } : {}),
      ...(field === 'branch' ? { semester: '', section: '' } : {}),
      ...(field === 'semester' ? { section: '' } : {}),
    };

    setStudentFilters(next);
    setSelectedStudentIds([]);

    if (field === 'college' || field === 'branch' || field === 'semester') {
      await fetchStudentFilters(next.college, next.branch, next.semester);
    }

    await fetchStudents(next);
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) => (
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    ));
  };

  const handleSelectAllStudents = () => {
    if (students.length === 0) return;
    setSelectedStudentIds(students.map((student) => student._id));
  };

  const handleClearAllStudents = () => {
    setSelectedStudentIds([]);
  };

  const assignStudents = async () => {
    if (!assigningDraft) return;

    if (!studentFilters.college || !studentFilters.branch || !studentFilters.semester || !studentFilters.section) {
      toast.error('Please select college, stream, semester and section');
      return;
    }

    if (selectedStudentIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }

    setAssignLoading(true);
    try {
      const res = await api.post(`/exams/${assigningDraft._id}/assign`, {
        college: studentFilters.college,
        branch: studentFilters.branch,
        semester: studentFilters.semester,
        section: studentFilters.section,
        studentIds: selectedStudentIds,
      });

      toast.success(res.data?.message || 'Students assigned successfully');
      await fetchDrafts();
      closeAssign();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign students');
    } finally {
      setAssignLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this draft? This cannot be undone.')) return;
    try {
      const res = await api.delete(`/exams/${id}`);
      toast.success(res.data.message || 'Deleted');
      fetchDrafts();
    } catch (err) { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="p-6">Loading drafts...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Draft Exams</h2>
      {drafts.length === 0 ? (
        <div className="text-gray-500">No drafts found.</div>
      ) : (
        <div className="space-y-3">
          {drafts.map(d => (
            <div key={d._id} className="bg-white dark:bg-[#0f172a] border p-4 rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.title}</div>
                <div className="text-xs text-gray-500">{d.subject} • {new Date(d.createdAt).toLocaleString()} • Updated {new Date(d.updatedAt).toLocaleString()}</div>
                <div className="text-xs text-gray-400">Questions: {(d.questions || []).length}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => continueEdit(d._id)} className="px-3 py-1 bg-blue-600 text-white rounded">Continue Editing</button>
                <button onClick={() => preview(d._id)} className="px-3 py-1 bg-gray-200 rounded">Preview</button>
                <button onClick={() => duplicate(d._id)} className="px-3 py-1 bg-green-600 text-white rounded">Duplicate</button>
                <button onClick={() => remove(d._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                <button onClick={() => openAssign(d)} className="px-3 py-1 bg-indigo-600 text-white rounded">Assign</button>
                <button onClick={() => publish(d._id)} className="px-3 py-1 bg-yellow-500 text-white rounded">Publish</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assigningDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-5 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Assign Students: {assigningDraft.title}</h3>
              <button onClick={closeAssign} className="rounded px-2 py-1 text-sm bg-gray-200 dark:bg-slate-700">Close</button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 mb-4">
              <div>
                <label className="mb-1 block text-sm font-medium">College</label>
                <select
                  value={studentFilters.college}
                  onChange={(e) => handleFilterChange('college', e.target.value)}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="">Select college</option>
                  {filterOptions.colleges.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Stream</label>
                <select
                  value={studentFilters.branch}
                  onChange={(e) => handleFilterChange('branch', e.target.value)}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="">Select stream</option>
                  {filterOptions.branches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Semester</label>
                <select
                  value={studentFilters.semester}
                  onChange={(e) => handleFilterChange('semester', e.target.value)}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="">Select semester</option>
                  {filterOptions.semesters.map((semester) => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Section</label>
                <select
                  value={studentFilters.section}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="w-full rounded border px-3 py-2 bg-white dark:bg-slate-800"
                >
                  <option value="">Select section</option>
                  {filterOptions.sections.map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Select multiple students (same college, stream, semester, section):
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={handleSelectAllStudents} className="rounded bg-emerald-600 px-3 py-1 text-xs text-white">Select All</button>
                <button type="button" onClick={handleClearAllStudents} className="rounded bg-gray-300 px-3 py-1 text-xs text-gray-800 dark:bg-slate-700 dark:text-gray-100">Clear All</button>
              </div>
            </div>

            <div className="max-h-72 overflow-auto rounded border p-2">
              {studentsLoading ? (
                <div className="p-3 text-sm text-gray-500">Loading students...</div>
              ) : !(studentFilters.college && studentFilters.branch && studentFilters.semester) ? (
                <div className="p-3 text-sm text-gray-500">Select college, stream and semester to load students.</div>
              ) : students.length === 0 ? (
                <div className="p-3 text-sm text-gray-500">No students found for selected filters.</div>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <label key={student._id} className="flex items-center justify-between rounded border px-3 py-2 cursor-pointer">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-xs text-gray-500">{student.email}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.includes(student._id)}
                        onChange={() => toggleStudentSelection(student._id)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-300">Selected: {selectedStudentIds.length}</div>
              <button
                onClick={assignStudents}
                disabled={assignLoading}
                className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {assignLoading ? 'Assigning...' : 'Assign Students'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Drafts;
