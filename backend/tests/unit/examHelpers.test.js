const { 
  normalizeText,
  isAudienceMatch,
  isPublishedExam,
  canStudentAccessExam,
  canTeacherManageExam,
  buildAudiencePayload,
  validateQuestions,
} = require('../../utils/examHelpers');
const mongoose = require('mongoose');

describe('examHelpers', () => {
  test('normalizeText lowercases and trims', () => {
    expect(normalizeText('  AbC ')).toBe('abc');
    expect(normalizeText(null)).toBe('');
  });

  test('isPublishedExam respects status and isActive', () => {
    expect(isPublishedExam({ status: 'published' })).toBe(true);
    expect(isPublishedExam({ status: 'draft', isActive: true })).toBe(false);
    expect(isPublishedExam({ isActive: true })).toBe(true);
    expect(isPublishedExam(null)).toBe(false);
  });

  test('canTeacherManageExam compares teacher id', () => {
    const exam = { teacher: new mongoose.Types.ObjectId() };
    expect(canTeacherManageExam(exam, exam.teacher)).toBe(true);
    expect(canTeacherManageExam(exam, new mongoose.Types.ObjectId())).toBe(false);
  });

  test('isAudienceMatch - student id allowed', () => {
    const studentId = new mongoose.Types.ObjectId();
    const exam = { allowedStudents: [studentId] };
    const student = { _id: studentId, college: 'X', branch: 'Y', section: 'A' };
    expect(isAudienceMatch(exam, student)).toBe(true);
  });

  test('isAudienceMatch - profile match when restrictions present', () => {
    const exam = { allowedColleges: ['My College'], allowedBranches: ['CS'], allowedSections: ['A'] };
    const student = { _id: new mongoose.Types.ObjectId(), college: 'My College', branch: 'CS', section: 'A' };
    expect(isAudienceMatch(exam, student)).toBe(true);

    const other = { _id: new mongoose.Types.ObjectId(), college: 'Other', branch: 'CS', section: 'A' };
    expect(isAudienceMatch(exam, other)).toBe(false);
  });

  test('canStudentAccessExam basic checks', () => {
    const now = new Date();
    const later = new Date(now.getTime() + 1000 * 60 * 60);
    const exam = { status: 'published', isActive: true, startTime: now.toISOString(), endTime: later.toISOString(), allowedColleges: [] };
    const student = { role: 'student', college: 'X', branch: 'Y', section: 'A' };
    expect(canStudentAccessExam(exam, student)).toBe(true);

    const badStudent = { role: 'student', college: null, branch: 'Y', section: 'A' };
    expect(canStudentAccessExam(exam, badStudent)).toBe(false);
  });

  test('buildAudiencePayload normalizes arrays and ids', () => {
    const payload = buildAudiencePayload({ allowedColleges: [' A ', null], allowedBranches: 'not-array', allowedStudents: [new mongoose.Types.ObjectId().toString(), 'invalid'] });
    expect(Array.isArray(payload.allowedColleges)).toBe(true);
    expect(payload.allowedBranches.length).toBe(0);
    expect(payload.allowedStudents.length).toBe(1);
  });

  test('validateQuestions rejects empty or invalid questions', () => {
    expect(validateQuestions([])).toBeTruthy();
    expect(validateQuestions([{ question: '  ' }])).toBeTruthy();
    const q = { question: 'Q', type: 'single_correct', options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: false }] };
    expect(validateQuestions([q])).toBeNull();
  });
});
