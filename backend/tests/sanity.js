// Simple sanity script to require key backend modules and ensure they load without syntax errors.
try {
  require('../models/Exam');
  require('../models/User');
  require('../routes/exams');
  require('../routes/results');
  console.log('sanity: backend modules loaded OK');
  process.exit(0);
} catch (err) {
  console.error('sanity: failed to load modules', err);
  process.exit(2);
}
