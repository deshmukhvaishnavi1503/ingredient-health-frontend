import React, { useRef, useState, useCallback, useEffect } from "react";
import WebcamCapture from "./components/WebcamCapture";
import ImageUploader from "./components/ImageUploader";
import ModeSelection from "./components/ModeSelection";
import ImagePreview from "./components/ImagePreview";
import AnalysisResult from "./components/AnalysisResult";
import HowItWorks from "./components/HowItWorks";
import { compressImage, detectDeviceCapabilities } from "./utils/imageUtils";

function App() {
  const webcamRef = useRef(null);

  const [imageSrc, setImageSrc] = useState(null);
  const [mode, setMode] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deviceCapabilities, setDeviceCapabilities] = useState(null);
  const [fullResults, setFullResults] = useState(null);

  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    status: "",
    progress: 0,
  });

  // Detect device capabilities
  useEffect(() => {
    const capabilities = detectDeviceCapabilities();
    setDeviceCapabilities(capabilities);
    console.log("📱 Device capabilities:", capabilities);
  }, []);

  // ✅ UPDATED: Hardcoded Render backend URL
  const getApiUrl = useCallback(() => {
    return "https://ingredient-health-backend.onrender.com";
  }, []);

  const startBackgroundProcessing = useCallback(
    async (imageData) => {
      setProcessingState({
        isProcessing: true,
        status: "🔄 Processing image...",
        progress: 30,
      });

      setErrorMessage(null);

      try {
        const API = getApiUrl();

        const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 60000);
        const response = await fetch(`${API}/api/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const result = await response.json();
        console.log("🔥 BACKEND RESULT:", result);

        const data = result.data || {};

        const formattedHealthScore = {
          score: data.healthScore || 0,
          breakdown: null,
        };

        let formattedAnalysis = [];

        if (Array.isArray(data.analysis)) {
          formattedAnalysis = data.analysis.map((item) => {
            if (typeof item === "string") {
              return {
                ingredient: item,
                status: "Neutral",
                reason: "Detected from product label",
                concerns: [],
              };
            }
            return item;
          });
        }

        setFullResults({
          healthScore: formattedHealthScore,
          category: data.category || "Unknown",
          allergens: data.allergens || [],
          processingTime: data.processingTime || "N/A",
          analysis: formattedAnalysis,
        });

        setProcessingState({
          isProcessing: false,
          status: "✅ Analysis complete!",
          progress: 100,
        });

      } catch (error) {
        console.error("🔴 Backend Error:", error);

        let errorMsg =
          "❌ Could not connect to backend. Is server running?";

        if (error.name === "AbortError") {
          errorMsg = "❌ Request timed out. Try a smaller image.";
        }

        setErrorMessage(errorMsg);

        setProcessingState({
          isProcessing: false,
          status: "",
          progress: 0,
        });
      }
    },
    [getApiUrl]
  );

  const captureImage = useCallback(async () => {
    const image = webcamRef.current?.getScreenshot();

    if (!image) {
      setErrorMessage("❌ Could not capture image.");
      return;
    }

    const compressed = await compressImage(image, 0.9, 2000);
    setImageSrc(compressed);
    startBackgroundProcessing(compressed);
  }, [startBackgroundProcessing]);

  const handleUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result, 0.9, 2000);
        setImageSrc(compressed);
        startBackgroundProcessing(compressed);
      };

      reader.readAsDataURL(file);
    },
    [startBackgroundProcessing]
  );

  const reset = useCallback(() => {
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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-lg space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">
          AI Ingredient Analyzer
        </h1>

        {!mode && <HowItWorks />}
        {!mode && <ModeSelection setMode={setMode} />}

        {mode === "camera" && !imageSrc && (
          <WebcamCapture
            webcamRef={webcamRef}
            onCapture={captureImage}
            onBack={reset}
          />
        )}

        {mode === "upload" && !imageSrc && (
          <ImageUploader handleUpload={handleUpload} onBack={reset} />
        )}

        {imageSrc && (
          <ImagePreview
            imageSrc={imageSrc}
            onReset={reset}
            processingState={processingState}
          />
        )}

        {errorMessage && (
          <div className="text-red-600 bg-red-100 p-3 rounded text-center">
            {errorMessage}
          </div>
        )}

        {fullResults && (
          <AnalysisResult
            analysis={fullResults.analysis}
            healthScore={fullResults.healthScore}
            category={fullResults.category}
            allergens={fullResults.allergens}
            processingTime={fullResults.processingTime}
          />
        )}
      </div>
    </div>
  );
}

export default App;