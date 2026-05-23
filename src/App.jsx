import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

import WebcamCapture from "./components/WebcamCapture";
import ImageUploader from "./components/ImageUploader";
import ModeSelection from "./components/ModeSelection";
import ImagePreview from "./components/ImagePreview";
import AnalysisResult from "./components/AnalysisResult";
import HowItWorks from "./components/HowItWorks";

import {
  compressImage,
  detectDeviceCapabilities,
} from "./utils/imageUtils";

function App() {

  const webcamRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);

  const [mode, setMode] =
    useState(null);

  const [errorMessage,
    setErrorMessage] =
    useState(null);

  const [deviceCapabilities,
    setDeviceCapabilities] =
    useState(null);

  const [fullResults,
    setFullResults] =
    useState(null);

  const [processingState,
    setProcessingState] =
    useState({
      isProcessing: false,
      status: "",
      progress: 0,
    });

  /* ===============================
     DEVICE DETECTION
  ================================= */

  useEffect(() => {

    const capabilities =
      detectDeviceCapabilities();

    setDeviceCapabilities(capabilities);

    console.log(
      "📱 Device capabilities:",
      capabilities
    );

  }, []);

  /* ===============================
     API URL
  ================================= */

  const getApiUrl =
    useCallback(() => {

      return "https://ingredient-health-backend.onrender.com";


    }, []);

  /* ===============================
     BACKEND PROCESS
  ================================= */

  const startBackgroundProcessing =
    useCallback(async (imageData) => {

      setProcessingState({
        isProcessing: true,
        status:
          "🔄 Analyzing ingredients...",
        progress: 30,
      });

      setErrorMessage(null);

      try {

        const controller =
          new AbortController();

        const timeout =
          setTimeout(() => {
            controller.abort();
          }, 60000);

        const response =
          await fetch(
            `${getApiUrl()}/analyze`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                image: imageData,
              }),

              signal:
                controller.signal,
            }
          );

        clearTimeout(timeout);

        if (!response.ok) {

          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "🔥 FULL BACKEND RESPONSE:",
          result
        );

        if (!result.success) {

          throw new Error(
            "Backend returned failure"
          );
        }

        const data = result.data;

        console.log(
          "✅ FINAL DATA:",
          data
        );

        /* ===============================
           FIXED DATA MAPPING
        ================================= */

        setFullResults({

          /* HEALTH SCORE */
          healthScore: {
            score:
              data.healthScore || 0,
          },

          /* RISK CATEGORY */
          category:
            data.riskLevel || "Unknown",

          /* PROCESS TIME */
          processingTime:
            data.processingTime || 0,

          /* TOTAL INGREDIENTS */
          totalIngredients:
            data.totalIngredients || 0,

          /* DETAILED ANALYSIS */
          analysis:
            Array.isArray(data.analysis)
              ? data.analysis
              : [],

          /* GROUPED ANALYSIS */
          groupedAnalysis: {

            healthy:
              data.groupedAnalysis
                ?.healthy || [],

            moderate:
              data.groupedAnalysis
                ?.moderate || [],

            harmful:
              data.groupedAnalysis
                ?.harmful || [],

            additives:
              data.groupedAnalysis
                ?.additives || [],

            allergens:
              data.groupedAnalysis
                ?.allergens || [],
          },

          /* ALLERGENS */
          allergens:
            data.groupedAnalysis
              ?.allergens || [],

          /* HEALTH ADVICE */
          advice:
            data.advice ||
            data.groupedAnalysis?.advice ||
            "Consume processed foods in moderation.",

        });

        setProcessingState({
          isProcessing: false,
          status:
            "✅ Analysis complete",
          progress: 100,
        });

      } catch (error) {

        console.error(
          "🔴 Backend Error:",
          error
        );

        setErrorMessage(

          error.name === "AbortError"

            ? "❌ Request timed out. Try smaller image."

            : "❌ Could not connect to backend."

        );

        setProcessingState({
          isProcessing: false,
          status: "",
          progress: 0,
        });
      }

    }, [getApiUrl]);

  /* ===============================
     CAMERA CAPTURE
  ================================= */

  const captureImage =
    useCallback(async () => {

      const image =
        webcamRef.current?.getScreenshot();

      if (!image) {

        setErrorMessage(
          "❌ Could not capture image."
        );

        return;
      }

      const compressed =
        await compressImage(
          image,
          0.9,
          2000
        );

      setImageSrc(compressed);

      startBackgroundProcessing(
        compressed
      );

    }, [startBackgroundProcessing]);

  /* ===============================
     IMAGE UPLOAD
  ================================= */

  const handleUpload =
    useCallback((e) => {

      const file =
        e.target.files[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onloadend =
        async () => {

          const compressed =
            await compressImage(
              reader.result,
              0.9,
              2000
            );

          setImageSrc(compressed);

          startBackgroundProcessing(
            compressed
          );
        };

      reader.readAsDataURL(file);

    }, [startBackgroundProcessing]);

  /* ===============================
     RESET
  ================================= */

  const reset =
    useCallback(() => {

      setImageSrc(null);

      setMode(null);

      setFullResults(null);

      setErrorMessage(null);

      setProcessingState({
        isProcessing: false,
        status: "",
        progress: 0,
      });

    }, []);

  /* ===============================
     UI
  ================================= */

  return (

    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-5xl mx-auto bg-white rounded-2xl p-6 shadow-lg space-y-6">

        {/* HEADER */}

        <div className="text-center">

          <h1 className="text-4xl font-bold text-blue-700">

            AI Ingredient Analyzer

          </h1>

          <p className="text-gray-600 mt-2">

            Real-Time Ingredient Health Scoring Engine

          </p>

        </div>

        {/* HOW IT WORKS */}

        {!mode && (
          <HowItWorks />
        )}

        {/* MODE SELECT */}

        {!mode && (
          <ModeSelection
            setMode={setMode}
          />
        )}

        {/* CAMERA */}

        {mode === "camera" &&
          !imageSrc && (

          <WebcamCapture
            webcamRef={webcamRef}
            onCapture={captureImage}
            onBack={reset}
          />
        )}

        {/* IMAGE UPLOAD */}

        {mode === "upload" &&
          !imageSrc && (

          <ImageUploader
            handleUpload={handleUpload}
            onBack={reset}
          />
        )}

        {/* IMAGE PREVIEW */}

        {imageSrc && (

          <ImagePreview
            imageSrc={imageSrc}
            onReset={reset}
            processingState={
              processingState
            }
          />
        )}

        {/* ERROR */}

        {errorMessage && (

          <div className="text-red-600 bg-red-100 border border-red-200 p-4 rounded-xl text-center font-medium">

            {errorMessage}

          </div>
        )}

        {/* FINAL RESULTS */}

        {fullResults && (

          <AnalysisResult

            analysis={
              fullResults.analysis
            }

            groupedAnalysis={
              fullResults.groupedAnalysis
            }

            advice={
              fullResults.advice
            }

            healthScore={
              fullResults.healthScore
            }

            category={
              fullResults.category
            }

            allergens={
              fullResults.allergens
            }

            processingTime={
              fullResults.processingTime
            }

            totalIngredients={
              fullResults.totalIngredients
            }

          />
        )}

      </div>

    </div>
  );
}

export default App;