import React from "react";

const AnalysisResult = ({
  analysis = [],
  groupedAnalysis = {},
  advice = "",
  healthScore,
  category,
  allergens = [],
  processingTime,
  totalIngredients,
}) => {

  const score = healthScore?.score || 0;

  /* ===============================
     SCORE COLORS
  ================================= */

  const getScoreColor = (score) => {

    if (score >= 80)
      return "text-green-600";

    if (score >= 60)
      return "text-yellow-600";

    return "text-red-600";
  };

  const getScoreBg = (score) => {

    if (score >= 80)
      return "bg-green-50 border-green-200";

    if (score >= 60)
      return "bg-yellow-50 border-yellow-200";

    return "bg-red-50 border-red-200";
  };

  const getRiskColor = (category) => {

    if (category === "Low")
      return "bg-green-500";

    if (category === "Medium")
      return "bg-yellow-500";

    return "bg-red-500";
  };

  return (

    <div className="space-y-6 px-2 max-w-full">

      {/* ===============================
          HEALTH SCORE
      ================================= */}

      {healthScore && (

        <div
          className={`${getScoreBg(
            score
          )} p-6 sm:p-8 rounded-2xl border-2 shadow-xl`}
        >

          <div className="text-center space-y-4">

            <div>

              <div
                className={`text-5xl sm:text-6xl font-black ${getScoreColor(
                  score
                )}`}
              >
                {score}
                <span className="text-2xl sm:text-3xl">
                  /100
                </span>
              </div>

              <div className="text-lg sm:text-xl text-gray-700 font-semibold mt-2">
                Health Score
              </div>

            </div>

            <div>

              <span
                className={`px-5 py-2 rounded-full text-white text-sm font-bold shadow-lg ${getRiskColor(
                  category
                )}`}
              >
                {category} Risk
              </span>

            </div>

            {processingTime && (

              <div className="text-sm text-gray-600 bg-white rounded-lg px-4 py-2 inline-block shadow-sm">
                ⚡ Analyzed in {processingTime}ms
              </div>

            )}

          </div>

        </div>

      )}

      {/* ===============================
          TOTAL INGREDIENTS
      ================================= */}

      <div className="bg-white border rounded-2xl p-5 shadow-lg">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-lg font-bold text-gray-800">
              📦 Total Ingredients
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              Ingredients detected from package
            </p>

          </div>

          <div className="text-4xl font-black text-blue-600">
            {totalIngredients}
          </div>

        </div>

      </div>

      {/* ===============================
          ALLERGEN ALERT
      ================================= */}

      {allergens.length > 0 && (

        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 shadow-lg">

          <h3 className="font-bold text-red-800 mb-4 text-lg flex items-center gap-2">

            ⚠️ Allergen Alert

            <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
              {allergens.length}
            </span>

          </h3>

          <div className="flex flex-wrap gap-2">

            {allergens.map((allergen, idx) => (

              <span
                key={idx}
                className="bg-white text-red-700 px-4 py-2 rounded-full text-sm font-semibold border border-red-200 shadow-sm"
              >
                {allergen}
              </span>

            ))}

          </div>

        </div>

      )}

      {/* ===============================
          GROUPED ANALYSIS
      ================================= */}

      <div className="grid md:grid-cols-2 gap-4">

        {/* HEALTHY */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 shadow-md">

          <h3 className="text-green-700 font-bold text-lg mb-4">
            ✅ Healthy
          </h3>

          {groupedAnalysis.healthy?.length ? (
            groupedAnalysis.healthy.map((item, idx) => (
              <div key={idx} className="bg-white border border-green-100 rounded-lg px-3 py-2 mb-2">
                {item}
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No healthy ingredients detected
            </p>
          )}

        </div>

        {/* MODERATE */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-md">

          <h3 className="text-yellow-700 font-bold text-lg mb-4">
            ⚠ Moderate
          </h3>

          {groupedAnalysis.moderate?.length ? (
            groupedAnalysis.moderate.map((item, idx) => (
              <div key={idx} className="bg-white border border-yellow-100 rounded-lg px-3 py-2 mb-2">
                {item}
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No moderate ingredients
            </p>
          )}

        </div>

        {/* HARMFUL */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-md">

          <h3 className="text-red-700 font-bold text-lg mb-4">
            ❌ Harmful
          </h3>

          {groupedAnalysis.harmful?.length ? (
            groupedAnalysis.harmful.map((item, idx) => (
              <div key={idx} className="bg-white border border-red-100 rounded-lg px-3 py-2 mb-2">
                {item}
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No harmful ingredients
            </p>
          )}

        </div>

        {/* ADDITIVES */}
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 shadow-md">

          <h3 className="text-purple-700 font-bold text-lg mb-4">
            🧪 Additives
          </h3>

          {groupedAnalysis.additives?.length ? (
            groupedAnalysis.additives.map((item, idx) => (
              <div key={idx} className="bg-white border border-purple-100 rounded-lg px-3 py-2 mb-2">
                {item}
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No additives detected
            </p>
          )}

        </div>

        {/* ===============================
            UNCLASSIFIED (ADDED)
        ================================= */}

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-md">

          <h3 className="text-gray-700 font-bold text-lg mb-4">
            ❓ Unclassified
          </h3>

          {groupedAnalysis.unclassified?.length ? (
            groupedAnalysis.unclassified.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2"
              >
                {item}
              </div>
            ))
          ) : (
            <p className="text-gray-600">
              No unclassified ingredients
            </p>
          )}

        </div>

      </div>

      {/* ===============================
          DETAILED ANALYSIS
      ================================= */}

      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-200 space-y-4">

        <h2 className="font-bold text-green-800 text-lg sm:text-xl flex items-center gap-3">

          🧠 Detailed Analysis

          <span className="text-sm font-normal text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {analysis?.length || 0} ingredients
          </span>

        </h2>

        <div className="grid gap-4">

          {Array.isArray(analysis) &&
            analysis.map((item, idx) => (

              <div
                key={idx}
                className="bg-white border-2 border-gray-100 rounded-xl p-5 shadow-md"
              >

                <div className="flex justify-between items-start gap-3 mb-3">

                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1">
                    {item.ingredient}
                  </h3>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm

                    ${
                      item.category === "Healthy"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : item.category === "Moderate"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        : item.category === "Harmful"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : "bg-purple-100 text-purple-800 border border-purple-200"
                    }
                  `}
                  >
                    {item.category}
                  </span>

                </div>

                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.reason}
                </p>

              </div>

            ))}

        </div>

      </div>

      {/* ===============================
          HEALTH ADVICE
      ================================= */}

      {advice && (

        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">

          <h3 className="text-blue-800 font-bold text-lg mb-4">
            💡 Health Advice
          </h3>

          <p className="text-gray-700 leading-relaxed">
            {advice}
          </p>

        </div>

      )}

      {/* ===============================
          FOOTER
      ================================= */}

      <div className="text-center bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-gray-200">

        <p className="text-sm text-gray-700">
          💡 <strong>Analysis complete!</strong>
          Make informed choices for better health.
        </p>

      </div>

    </div>
  );
};

export default AnalysisResult;