import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const ExamPreview = () => {
  const { examId } = useParams();
  const { api } = useAuth();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/exams/${examId}/questions`);
        setExam(res.data);
      } catch (err) {
        toast.error('Failed to load preview');
      }
    };
    load();
  }, [examId]);

  if (!exam) return <div className="p-6">Loading preview...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-3">Preview: {exam.title}</h2>
      <p className="text-sm text-gray-600 mb-4">{exam.subject} • Duration: {exam.duration} minutes</p>
      <div className="mb-4"><strong>Instructions:</strong> {exam.instructions}</div>
      <div className="space-y-4">
        {exam.questions.map((q, i) => (
          <div key={q._id || i} className="p-4 border rounded">
            <div className="font-semibold">Q{i+1}. {q.question}</div>
            <div className="mt-2">
              {q.type && (q.type === 'short_answer' || q.type === 'descriptive') ? (
                <div className="text-sm text-gray-600">Answer: (open response)</div>
              ) : (
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {q.options.map((opt, idx) => (
                    <li key={idx}>{opt.text}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamPreview;
