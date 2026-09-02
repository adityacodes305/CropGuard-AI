import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

function Result() {
    const location = useLocation();
    const navigate = useNavigate();

    const detection = location.state;

    if (!detection) {
        return (
            <div className="result-page">
                <div className="result-empty">
                    <div className="result-empty-icon">
                        🌱
                    </div>

                    <h1>
                        No Prediction Found
                    </h1>

                    <p>
                        Please analyze an image first to
                        view the AI prediction result.
                    </p>

                    <button
                        className="result-primary-btn"
                        onClick={() => navigate("/detect")}
                    >
                        Go to Detection
                    </button>
                </div>
            </div>
        );
    }

    const confidence = Math.min(
        Math.max(Number(detection.confidence || 0), 0),
        100
    );

    const healthy =
        detection.status === "Healthy" ||
        detection.disease?.toLowerCase() === "healthy";

    const formattedDate = detection.createdAt
        ? new Date(detection.createdAt).toLocaleDateString(
              "en-GB",
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
              }
          )
        : new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
          });

    const formattedTime = detection.createdAt
        ? new Date(detection.createdAt).toLocaleTimeString(
              [],
              {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
              }
          )
        : new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit"
          });

    return (
        <div className="result-page">

            <div className="result-container">

                {/* =========================
                    HEADER
                ========================= */}

                <div className="result-header">

                    <div>

                        <div className="result-eyebrow">
                            CROP HEALTH MONITOR
                        </div>

                        <h1>
                            Analysis Result
                        </h1>

                        <p>
                            Detailed AI analysis of your
                            crop health prediction.
                        </p>

                    </div>

                    <button
                        className="back-history-btn"
                        onClick={() => navigate("/history")}
                    >
                        <span>←</span>
                        Back to History
                    </button>

                </div>


                {/* =========================
                    RESULT HERO
                ========================= */}

                <div
                    className={`result-hero ${
                        healthy
                            ? "result-hero-healthy"
                            : "result-hero-disease"
                    }`}
                >

                    <div className="result-hero-content">

                        <div
                            className={`result-status-icon ${
                                healthy
                                    ? "result-status-icon-healthy"
                                    : "result-status-icon-disease"
                            }`}
                        >
                            {healthy ? "✓" : "!"}
                        </div>

                        <div>

                            <span className="result-hero-label">
                                AI DIAGNOSIS
                            </span>

                            <h2>
                                {healthy
                                    ? "Your crop looks healthy"
                                    : "Potential disease detected"}
                            </h2>

                            <p>
                                {healthy
                                    ? "The AI model found no significant signs of disease in the analyzed image."
                                    : "The AI model detected characteristics associated with a possible crop disease."}
                            </p>

                        </div>

                    </div>

                    <div className="result-hero-confidence">

                        <span>
                            Confidence
                        </span>

                        <strong>
                            {confidence.toFixed(2)}%
                        </strong>

                    </div>

                </div>


                {/* =========================
                    MAIN RESULT GRID
                ========================= */}

                <div className="result-main-grid">

                    {/* IMAGE */}

                    <div className="result-image-card">

                        <div className="result-card-heading">

                            <div>

                                <span className="result-small-label">
                                    ANALYZED IMAGE
                                </span>

                                <h2>
                                    Crop Sample
                                </h2>

                            </div>

                            <span className="image-check">
                                ✓ Analyzed
                            </span>

                        </div>

                        <div className="result-image-wrapper">

                            {detection.image ? (
                                <img
                                    src={detection.image}
                                    alt="Analyzed crop"
                                    className="result-image"
                                />
                            ) : (
                                <div className="result-no-image">
                                    🌿
                                    <span>
                                        Image unavailable
                                    </span>
                                </div>
                            )}

                        </div>

                    </div>


                    {/* DIAGNOSIS */}

                    <div className="result-diagnosis-card">

                        <span className="result-small-label">
                            DETECTION
                        </span>

                        <h2>
                            {detection.crop ||
                                "Unknown Crop"}
                        </h2>

                        <div
                            className={`diagnosis-status ${
                                healthy
                                    ? "diagnosis-status-healthy"
                                    : "diagnosis-status-disease"
                            }`}
                        >
                            <span>
                                {healthy ? "✓" : "!"}
                            </span>

                            {healthy
                                ? "Healthy"
                                : "Disease Detected"}
                        </div>

                        <div className="diagnosis-divider"></div>

                        <span className="diagnosis-label">
                            PREDICTION
                        </span>

                        <h3>
                            {detection.disease ||
                                "Unknown prediction"}
                        </h3>

                        <p className="diagnosis-description">
                            {healthy
                                ? "No major disease indicators were detected in this crop sample."
                                : "The model identified patterns that may indicate the disease shown above."}
                        </p>

                    </div>

                </div>


                {/* =========================
                    CONFIDENCE + METADATA
                ========================= */}

                <div className="result-info-grid">

                    <div className="result-info-card">

                        <div className="info-card-icon">
                            🎯
                        </div>

                        <div>

                            <span className="result-small-label">
                                AI CONFIDENCE
                            </span>

                            <h3>
                                {confidence.toFixed(2)}%
                            </h3>

                            <div className="result-confidence-bar">

                                <div
                                    style={{
                                        width: `${confidence}%`
                                    }}
                                ></div>

                            </div>

                        </div>

                    </div>


                    <div className="result-info-card">

                        <div className="info-card-icon">
                            📅
                        </div>

                        <div>

                            <span className="result-small-label">
                                ANALYZED
                            </span>

                            <h3>
                                {formattedDate}
                            </h3>

                            <p>
                                {formattedTime}
                            </p>

                        </div>

                    </div>


                    <div className="result-info-card">

                        <div className="info-card-icon">
                            🌿
                        </div>

                        <div>

                            <span className="result-small-label">
                                CROP
                            </span>

                            <h3>
                                {detection.crop ||
                                    "Unknown"}
                            </h3>

                            <p>
                                Automatically identified
                            </p>

                        </div>

                    </div>

                </div>


                {/* =========================
                    CARE SECTION
                ========================= */}

                <div className="result-care-grid">

                    {/* TREATMENT */}

                    <div
                        className={`result-care-card ${
                            healthy
                                ? "result-treatment-healthy"
                                : "result-treatment-disease"
                        }`}
                    >

                        <div className="care-title">

                            <span className="care-icon">
                                {healthy ? "🌱" : "💊"}
                            </span>

                            <div>

                                <span className="care-label">
                                    RECOMMENDATION
                                </span>

                                <h2>
                                    {healthy
                                        ? "Recommended Care"
                                        : "Recommended Treatment"}
                                </h2>

                            </div>

                        </div>

                        <p>
                            {detection.treatment ||
                                (healthy
                                    ? "Continue regular watering, provide adequate sunlight, and monitor the plant for any changes."
                                    : "Remove affected leaves, maintain good air circulation, avoid excessive moisture, and follow appropriate disease treatment.")}
                        </p>

                    </div>


                    {/* PREVENTION */}

                    <div className="result-care-card result-prevention-card">

                        <div className="care-title">

                            <span className="care-icon">
                                🛡️
                            </span>

                            <div>

                                <span className="care-label">
                                    PREVENTION
                                </span>

                                <h2>
                                    Keep Your Crop Healthy
                                </h2>

                            </div>

                        </div>

                        <p>
                            Maintain good air circulation,
                            avoid excessive moisture, and
                            regularly inspect leaves for signs
                            of disease or pests.
                        </p>

                    </div>

                </div>


                {/* =========================
                    TOP PREDICTIONS
                ========================= */}

                <section className="top-predictions-section">

                    <div className="top-predictions-header">

                        <div>

                            <div className="result-eyebrow">
                                AI ANALYSIS
                            </div>

                            <h2>
                                Top Predictions
                            </h2>

                            <p>
                                Other possibilities considered
                                by the AI model.
                            </p>

                        </div>

                    </div>


                    <div className="top-predictions-list">

                        {detection.top_predictions &&
                        detection.top_predictions.length > 0 ? (

                            detection.top_predictions.map(
                                (prediction, index) => {

                                    const predictionHealthy =
                                        prediction.status ===
                                            "Healthy" ||
                                        prediction.disease
                                            ?.toLowerCase() ===
                                            "healthy";

                                    const predictionConfidence =
                                        Math.min(
                                            Math.max(
                                                Number(
                                                    prediction.confidence ||
                                                        0
                                                ),
                                                0
                                            ),
                                            100
                                        );

                                    return (
                                        <div
                                            className="top-prediction-item"
                                            key={index}
                                        >

                                            <div className="prediction-rank">
                                                #{index + 1}
                                            </div>

                                            <div className="top-prediction-info">

                                                <h3>
                                                    {prediction.crop ||
                                                        "Unknown Crop"}
                                                </h3>

                                                <p>
                                                    {prediction.disease ||
                                                        "Unknown prediction"}
                                                </p>

                                            </div>

                                            <span
                                                className={`top-prediction-status ${
                                                    predictionHealthy
                                                        ? "top-status-healthy"
                                                        : "top-status-disease"
                                                }`}
                                            >
                                                <span>
                                                    •
                                                </span>

                                                {predictionHealthy
                                                    ? "Healthy"
                                                    : "Disease Detected"}
                                            </span>

                                            <div className="top-prediction-confidence">

                                                <strong>
                                                    {predictionConfidence.toFixed(
                                                        2
                                                    )}
                                                    %
                                                </strong>

                                                <div className="prediction-mini-bar">

                                                    <div
                                                        style={{
                                                            width: `${predictionConfidence}%`
                                                        }}
                                                    ></div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )

                        ) : (

                            <div className="no-top-predictions">

                                <span>
                                    🔬
                                </span>

                                <p>
                                    No additional predictions
                                    available.
                                </p>

                            </div>

                        )}

                    </div>

                </section>


                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="result-actions">

                    <button
                        className="result-secondary-btn"
                        onClick={() => navigate("/history")}
                    >
                        ← View History
                    </button>

                    <button
                        className="result-primary-btn"
                        onClick={() => navigate("/detect")}
                    >
                        Analyze Another Image
                        <span>→</span>
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Result;