import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./HistoryDetails.css";

function HistoryDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [detection, setDetection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            navigate("/login");
            return;
        }

        const fetchDetection = async () => {
            try {
                const response = await fetch(
                    `https://cropguard-ai-v5zv.onrender.com/api/detections/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    window.dispatchEvent(new Event("authChange"));

                    navigate("/login");
                    return;
                }

                if (!response.ok) {
                    throw new Error("Detection not found");
                }

                const data = await response.json();

                setDetection(data);
                setLoading(false);
            } catch (error) {
                console.error(
                    "Error fetching detection:",
                    error
                );

                setError(true);
                setLoading(false);
            }
        };

        fetchDetection();
    }, [id, navigate]);

    // DELETE DETECTION
    const handleDelete = async () => {
        const token = localStorage.getItem("token");

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this detection?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(
                `https://cropguard-ai-v5zv.onrender.com/api/detections/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(new Event("authChange"));

                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to delete detection");
            }

            navigate("/history");

        } catch (error) {
            console.error(
                "Delete detection error:",
                error
            );

            alert(
                "Failed to delete detection. Please try again."
            );
        }
    };

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className="details-page">
                <div className="details-empty">
                    <div className="loading-spinner"></div>

                    <h1>Loading Prediction...</h1>

                    <p>
                        Fetching prediction details from the server.
                    </p>
                </div>
            </div>
        );
    }

    /* =========================
       ERROR
    ========================= */

    if (error || !detection) {
        return (
            <div className="details-page">
                <div className="details-empty">
                    <div className="empty-icon">
                        🔍
                    </div>

                    <h1>No Prediction Found</h1>

                    <p>
                        Please select a prediction from your history.
                    </p>

                    <button
                        onClick={() => navigate("/history")}
                    >
                        ← Back to History
                    </button>
                </div>
            </div>
        );
    }

    /* =========================
       HEALTH STATUS
    ========================= */

    const isHealthy =
        detection.status === "Healthy" ||
        detection.disease?.toLowerCase() === "healthy";

    /* =========================
       DATE
    ========================= */

    const formattedDate = detection.createdAt
        ? new Date(detection.createdAt).toLocaleString(
              "en-IN",
              {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
              }
          )
        : "Unknown";

    /* =========================
       CONFIDENCE
    ========================= */

    const confidence = Math.min(
        Math.max(Number(detection.confidence || 0), 0),
        100
    );

    return (
        <div className="details-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="details-header">

                <div>
                    <p className="details-label">
                        CROP HEALTH MONITOR
                    </p>

                    <h1>
                        Prediction Details
                    </h1>

                    <p>
                        Detailed AI analysis of your crop health
                        prediction.
                    </p>
                </div>

                <button
                    className="back-button"
                    onClick={() => navigate("/history")}
                >
                    ← Back to History
                </button>

            </div>

            {/* =========================
                MAIN SUMMARY
            ========================= */}

            <div className="details-main">

                {/* Crop Information */}

                <div className="details-card">

                    <div
                        className={`crop-icon ${
                            isHealthy
                                ? "healthy-bg"
                                : "disease-bg"
                        }`}
                    >
                        🌱
                    </div>

                    <div className="crop-info">

                        <p className="small-label">
                            CROP
                        </p>

                        <h2>
                            {detection.crop ||
                                "Unknown Crop"}
                        </h2>

                        <p className="disease-name">
                            {detection.disease ||
                                "Unknown Prediction"}
                        </p>

                        <span
                            className={
                                isHealthy
                                    ? "status healthy"
                                    : "status disease"
                            }
                        >
                            ●{" "}
                            {isHealthy
                                ? "Healthy"
                                : "Disease Detected"}
                        </span>

                    </div>

                </div>

                {/* Confidence */}

                <div className="confidence-card">

                    <div>
                        <p className="small-label">
                            AI CONFIDENCE
                        </p>

                        <h2>
                            {confidence.toFixed(1)}%
                        </h2>
                    </div>

                    <div className="confidence-bar">

                        <div
                            className="confidence-fill"
                            style={{
                                width: `${confidence}%`
                            }}
                        />

                    </div>

                    <p>
                        AI model confidence for this prediction
                    </p>

                </div>

            </div>

            {/* =========================
                ANALYZED IMAGE
            ========================= */}

            {detection.image && (
                <div className="prediction-image-card">

                    <div className="image-card-header">

                        <div>
                            <p className="small-label">
                                ANALYZED IMAGE
                            </p>

                            <h2>
                                Crop Image
                            </h2>
                        </div>

                    </div>

                    <img
                        src={detection.image}
                        alt={`${detection.crop || "Crop"} prediction`}
                        className="prediction-image"
                    />

                </div>
            )}

            {/* =========================
                INFORMATION
            ========================= */}

            <div className="info-grid">

                <div className="info-card">

                    <p className="small-label">
                        ANALYZED
                    </p>

                    <h3>
                        📅 {formattedDate}
                    </h3>

                </div>

                <div className="info-card">

                    <p className="small-label">
                        PREDICTION
                    </p>

                    <h3>
                        {detection.disease ||
                            "Unknown"}
                    </h3>

                </div>

                <div className="info-card">

                    <p className="small-label">
                        STATUS
                    </p>

                    <h3
                        className={
                            isHealthy
                                ? "detail-healthy"
                                : "detail-disease"
                        }
                    >
                        {isHealthy
                            ? "✓ Healthy"
                            : "⚠ Disease Detected"}
                    </h3>

                </div>

                <div className="info-card">

                    <p className="small-label">
                        CONFIDENCE
                    </p>

                    <h3>
                        🎯 {confidence.toFixed(1)}%
                    </h3>

                </div>

            </div>

            {/* =========================
                CARE SECTION
            ========================= */}

            <div className="care-section">

                <div className="care-card">

                    <h2>
                        💊 Recommended Treatment
                    </h2>

                    <p>
                        {detection.treatment ||
                            "Follow standard crop care practices and monitor the plant regularly."}
                    </p>

                </div>

                <div className="care-card">

                    <h2>
                        🛡️ Prevention
                    </h2>

                    <p>
                        Maintain good air circulation, avoid
                        excessive moisture, and regularly inspect
                        leaves for signs of disease or pests.
                    </p>

                </div>

            </div>

            {/* =========================
                TOP PREDICTIONS
            ========================= */}

            {detection.top_predictions &&
                detection.top_predictions.length > 0 && (

                    <div className="top-predictions">

                        <div className="section-heading">

                            <div>

                                <p className="details-label">
                                    AI ANALYSIS
                                </p>

                                <h2>
                                    Top Predictions
                                </h2>

                                <p>
                                    Other predictions considered
                                    by the AI model.
                                </p>

                            </div>

                        </div>

                        <div className="prediction-list">

                            {detection.top_predictions.map(
                                (prediction, index) => {

                                    const predictionHealthy =
                                        prediction.status ===
                                            "Healthy" ||
                                        prediction.disease?.toLowerCase() ===
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
                                            className="prediction-row"
                                            key={index}
                                        >

                                            {/* Number */}

                                            <div className="prediction-number">
                                                #{index + 1}
                                            </div>

                                            {/* Prediction */}

                                            <div className="prediction-name">

                                                <strong>
                                                    {prediction.crop ||
                                                        detection.crop ||
                                                        "Unknown Crop"}
                                                </strong>

                                                <span>
                                                    {prediction.disease ||
                                                        "Unknown Prediction"}
                                                </span>

                                            </div>

                                            {/* Status */}

                                            <div className="prediction-status">

                                                <span
                                                    className={
                                                        predictionHealthy
                                                            ? "status healthy"
                                                            : "status disease"
                                                    }
                                                >
                                                    ●{" "}
                                                    {predictionHealthy
                                                        ? "Healthy"
                                                        : "Disease Detected"}
                                                </span>

                                            </div>

                                            {/* Confidence */}

                                            <div className="prediction-confidence">

                                                <strong>
                                                    {predictionConfidence.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </strong>

                                                <div className="top-confidence-bar">

                                                    <div
                                                        className="top-confidence-fill"
                                                        style={{
                                                            width: `${predictionConfidence}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>
                )}

            {/* =========================
                ACTIONS
            ========================= */}

            <div className="details-actions">

                <button
                    className="secondary-button"
                    onClick={() => navigate("/history")}
                >
                    ← View History
                </button>

                <button
                    className="primary-button"
                    onClick={() => navigate("/detect")}
                >
                    + Analyze Another Image
                </button>

                <button
                    className="delete-button"
                    onClick={handleDelete}
                >
                    Delete Detection
                </button>

            </div>

        </div>
    );
}

export default HistoryDetails;