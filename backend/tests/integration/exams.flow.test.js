const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Exam = require('../../models/Exam');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany();
  }
});

describe('exams publish -> available -> join flow', () => {
  test('teacher can create and publish exam; student can view and join', async () => {
    // create teacher
    const teacher = await User.create({ name: 'T1', email: 't1@example.com', password: 'pass', role: 'teacher' });
    const student = await User.create({ name: 'S1', email: 's1@example.com', password: 'pass', role: 'student', college: 'X', branch: 'Y', section: 'A' });

    const teacherToken = jwt.sign({ id: teacher._id }, JWT_SECRET);
    const studentToken = jwt.sign({ id: student._id }, JWT_SECRET);

    const now = new Date();
    const later = new Date(now.getTime() + 1000 * 60 * 60);

    const createRes = await request(app)
      .post('/api/exams')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Flow Test',
        subject: 'Test',
        duration: 60,
        startTime: new Date(now.getTime() - 1000 * 60).toISOString(),
        endTime: later.toISOString(),
        questions: [{ question: 'Q1', type: 'single_correct', options: [{ text: 'a', isCorrect: true }, { text: 'b', isCorrect: false }] }],
        status: 'draft'
      });

    expect(createRes.status).toBe(201);
    const examId = createRes.body.exam._id;

    // publish
    const publishRes = await request(app)
      .post(`/api/exams/${examId}/publish`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send();

    expect(publishRes.status).toBe(200);

    // student available exams
    const availableRes = await request(app)
      .get('/api/exams/available')
      .set('Authorization', `Bearer ${studentToken}`)
      .send();

    expect(availableRes.status).toBe(200);
    expect(Array.isArray(availableRes.body)).toBe(true);
    expect(availableRes.body.some(e => e._id === examId)).toBe(true);

    // join via examKey
    const examKey = publishRes.body.exam.examKey;
    const joinRes = await request(app)
      .post('/api/exams/join')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ examKey });

    expect(joinRes.status).toBe(200);
    expect(joinRes.body.examId).toBe(examId);
  });
});
