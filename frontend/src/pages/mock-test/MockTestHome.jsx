import { Link } from "react-router-dom";
import questions from "../../data/questions.json";

const MockTestHome = () => {
  const categories = [...new Set(questions.map((q) => q.category))];

  const categoryDetails = {
    "Aptitude": "Sharpen your quantitative and problem-solving skills.",
    "Logical Reasoning": "Test your logical and analytical thinking abilities.",
    "Verbal Ability":
      "Improve your vocabulary, grammar, and comprehension.",
    "Data Structures & Algorithms":
      "Assess your knowledge of coding concepts and data structures.",
    "General Knowledge":
      "Stay updated with current affairs and general awareness.",
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#161513]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b border-slate-200 dark:border-slate-700 pb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">
            Mock Test Series
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Choose a category to start practicing with exam-style questions.
          </p>
        </div>

        {/*
          Oracle-style compact list: no icons, no gradients, no cards
          floating in a grid. Each category is a dense row with a thin
          divider, a 3px red accent that only appears on hover/focus, and
          everything left-aligned in a single scannable column. This scales
          to any number of categories without ever needing new breakpoints
          — it's just more rows, same as Oracle's product/solution lists.
        */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 border-t border-b border-slate-200 dark:border-slate-700">
          {categories.map((category) => {
            const count = questions.filter(
              (q) => q.category === category
            ).length;

            return (
              <Link
                key={category}
                to={`/mock-test/${encodeURIComponent(
                  category.toLowerCase()
                )}`}
                className="group relative flex items-center justify-between gap-4 py-4 pl-4 pr-3 -mx-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors duration-150"
              >
                <span className="absolute left-0 top-0 h-full w-[3px] bg-[#C74634] scale-y-0 group-hover:scale-y-100 origin-center transition-transform duration-150" />

                <div className="min-w-0">
                  <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white group-hover:text-[#C74634] transition-colors duration-150">
                    {category}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {categoryDetails[category] || "Practice and improve your skills."}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {count} Questions
                  </span>
                  <span className="text-[#C74634] text-sm font-medium group-hover:translate-x-0.5 transition-transform duration-150">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MockTestHome;