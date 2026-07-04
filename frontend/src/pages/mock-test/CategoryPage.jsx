import { Link, useNavigate, useParams } from "react-router-dom";
import questions from "../../data/questions.json";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();

  const topics = [
    ...new Set(
      questions
        .filter((q) => q.category.toLowerCase() === category)
        .map((q) => q.topic)
    ),
  ];

  const getTopicQuestions = (topic) => {
    return questions.filter(
      (q) => q.category.toLowerCase() === category && q.topic === topic
    );
  };

  const startTest = (topic) => {
    const topicQuestions = getTopicQuestions(topic);

    navigate(
      `/mock-test/${category}/${topic
        .toLowerCase()
        .replace(/\s+/g, "-")}/test`,
      { state: { questions: topicQuestions } }
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#161513]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white capitalize tracking-tight">
            {category.replace(/-/g, " ")} Topics
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Select a topic to start a practice session or a timed test.
          </p>
        </div>

        {/*
          Oracle-style compact list: no icons, no gradients, no glow, no
          numbered badges. Each topic is a dense row with a thin divider
          and a 3px red accent bar that appears on hover, same pattern as
          the category list page. Scales to any number of topics — it's
          just more rows, no grid breakpoints to maintain.
        */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 border-t border-b border-slate-200 dark:border-slate-700">
          {topics.map((topic) => {
            const questionCount = getTopicQuestions(topic).length;
            const topicSlug = topic.toLowerCase().replace(/\s+/g, "-");

            return (
              <div
                key={topic}
                className="group relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-4 pl-4 pr-3 -mx-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[#C74634] scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-150" />

                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
                    {topic}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {questionCount} Questions
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/mock-test/${category}/${topicSlug}`}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#C74634] dark:hover:text-[#e2725b] transition-colors duration-150"
                  >
                    Practice
                  </Link>

                  <span className="text-slate-300 dark:text-slate-600">|</span>

                  <button
                    onClick={() => startTest(topic)}
                    className="text-sm font-medium text-[#C74634] hover:underline underline-offset-4"
                  >
                    Start Test →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="border border-slate-200 dark:border-slate-700 p-10 text-center mt-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No Topics Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              This category doesn't contain any topics yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;