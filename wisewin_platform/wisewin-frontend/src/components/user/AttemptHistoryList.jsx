import { useState } from "react";
export default function AttemptHistoryList({ attempts }) {
  const [openId, setOpenId] = useState(null);

  if (!attempts?.length) {
    return (
      <div className="rounded-2xl bg-[#f5f2ff] p-4 text-sm text-[#454652]">
        No attempts yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => {
        const isOpen = openId === attempt.attemptId;

        return (
          <div
            key={attempt.attemptId}
            className="rounded-xl bg-white shadow-sm overflow-hidden"
          >
           
            <div
              onClick={() =>
                setOpenId(isOpen ? null : attempt.attemptId)
              }
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#f3f1ff] transition-all"
            >
              <div>
                <p className="font-medium text-[#000666]">
                  Attempt {attempt.attemptNumber}
                </p>
                <p className="text-sm text-[#454652]">
                  Score: {attempt.score}/{attempt.totalQuestions}
                </p>
              </div>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  attempt.passed === true
                    ? "bg-green-100 text-green-700"
                    : attempt.passed === false
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {attempt.passed === true
                  ? "Passed"
                  : attempt.passed === false
                  ? "Failed"
                  : "In Progress"}
              </span>
            </div>

           
            {isOpen && (
              <div className="px-4 pb-4 border-t space-y-3">
                {attempt.answers?.map((ans, i) => (
                  <div key={i} className="pt-3">
                    
                    <p className="text-sm font-semibold text-[#000666]">
                      {ans.questionText}
                    </p>

                 
                    <p
                      className={`text-sm mt-1 font-medium ${
                        ans.isCorrect
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {ans.selectedOption}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}