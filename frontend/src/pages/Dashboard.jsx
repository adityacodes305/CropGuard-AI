import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // =========================
    // FETCH DETECTIONS
    // =========================

    async function fetchDetections(showRefresh = false) {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            navigate("/login");
            return;
        }

        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch(
                "https://cropguard-ai-v5zv.onrender.com/api/detections",
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
                throw new Error("Failed to fetch detections");
            }

            const data = await response.json();

            setDetections(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching detections:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchDetections();
    }, [navigate]);

    // =========================
    // BASIC STATISTICS
    // =========================

    const totalScans = detections.length;

    const healthyCrops = detections.filter(
        (item) =>
            item.status?.toLowerCase() === "healthy" ||
            item.disease?.toLowerCase() === "healthy"
    ).length;

    const diseasesDetected = totalScans - healthyCrops;

    const averageConfidence =
        totalScans > 0
            ? (
                  detections.reduce(
                      (sum, item) =>
                          sum + Number(item.confidence || 0),
                      0
                  ) / totalScans
              ).toFixed(1)
            : "0.0";

    const healthPercentage =
        totalScans > 0
            ? Math.round((healthyCrops / totalScans) * 100)
            : 0;

    const recentPredictions = detections.slice(0, 5);

    // =========================
    // CROP INSIGHTS
    // =========================

    const cropCounts = {};

    detections.forEach((item) => {
        const crop = item.crop || "Unknown Crop";

        cropCounts[crop] = (cropCounts[crop] || 0) + 1;
    });

    const cropInsights = Object.entries(cropCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const mostAnalyzedCrop =
        cropInsights.length > 0
            ? cropInsights[0][0]
            : "None";

    // =========================
    // DISEASE INSIGHTS
    // =========================

    const diseaseCounts = {};

    detections.forEach((item) => {
        const disease = item.disease || "Unknown";

        if (disease.toLowerCase() !== "healthy") {
            diseaseCounts[disease] =
                (diseaseCounts[disease] || 0) + 1;
        }
    });

    const diseaseInsights = Object.entries(diseaseCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const diseaseTotal = Object.values(diseaseCounts).reduce(
        (sum, count) => sum + count,
        0
    );

    const mostCommonDisease =
        diseaseInsights.length > 0
            ? diseaseInsights[0][0]
            : "None";

    // =========================
    // HELPERS
    // =========================

    const getStatus = (detection) => {
        if (
            detection.status?.toLowerCase() === "healthy" ||
            detection.disease?.toLowerCase() === "healthy"
        ) {
            return "Healthy";
        }

        return "Disease Detected";
    };

    const formatDate = (date) => {
        if (!date) {
            return "Unknown date";
        }

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    // =========================
    // UI
    // =========================

    return (
        <div className="dashboard-page">

            {/* HEADER */}

            <div className="dashboard-header">

                <div>
                    <p className="dashboard-label">
                        CROP HEALTH MONITOR
                    </p>

                    <h1>Dashboard</h1>

                    <p className="dashboard-subtitle">
                        Monitor your crop health and AI-powered
                        disease predictions.
                    </p>
                </div>

                <div className="dashboard-header-actions">

                    <button
                        className="refresh-button"
                        onClick={() => fetchDetections(true)}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "↻ Refreshing..."
                            : "↻ Refresh"}
                    </button>

                    <button
                        className="new-analysis-button"
                        onClick={() => navigate("/detect")}
                    >
                        + New Analysis
                    </button>

                </div>

            </div>

            {/* STATISTICS */}

            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon">
                        🔍
                    </div>

                    <div>
                        <p className="stat-label">
                            TOTAL SCANS
                        </p>

                        <h2>{totalScans}</h2>

                        <p className="stat-description">
                            Total crop analyses
                        </p>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        🌱
                    </div>

                    <div>
                        <p className="stat-label">
                            HEALTHY CROPS
                        </p>

                        <h2>{healthyCrops}</h2>

                        <p className="stat-description">
                            Healthy predictions
                        </p>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        ⚠️
                    </div>

                    <div>
                        <p className="stat-label">
                            DISEASES DETECTED
                        </p>

                        <h2>{diseasesDetected}</h2>

                        <p className="stat-description">
                            Require attention
                        </p>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        🎯
                    </div>

                    <div>
                        <p className="stat-label">
                            AVG. CONFIDENCE
                        </p>

                        <h2>{averageConfidence}%</h2>

                        <p className="stat-description">
                            AI prediction confidence
                        </p>
                    </div>

                </div>

            </div>

            {/* HEALTH + AI INSIGHTS */}

            <div className="analytics-grid">

                {/* HEALTH OVERVIEW */}

                <div className="health-overview-card">

                    <div className="analytics-card-header">

                        <div>
                            <p className="section-label">
                                HEALTH OVERVIEW
                            </p>

                            <h2>
                                Crop Health Status
                            </h2>
                        </div>

                        <span className="health-percentage">
                            {healthPercentage}%
                        </span>

                    </div>

                    <div className="health-progress">

                        <div
                            className="health-progress-fill"
                            style={{
                                width: `${healthPercentage}%`
                            }}
                        />

                    </div>

                    <div className="health-summary">

                        <div>
                            <span className="health-dot healthy-dot" />
                            <span>Healthy</span>
                            <strong>{healthyCrops}</strong>
                        </div>

                        <div>
                            <span className="health-dot disease-dot" />
                            <span>Disease</span>
                            <strong>{diseasesDetected}</strong>
                        </div>

                        <div>
                            <span className="health-dot scan-dot" />
                            <span>Total</span>
                            <strong>{totalScans}</strong>
                        </div>

                    </div>

                </div>

                {/* AI INSIGHTS */}

                <div className="insights-card">

                    <div className="analytics-card-header">

                        <div>
                            <p className="section-label">
                                AI INSIGHTS
                            </p>

                            <h2>
                                Analysis Summary
                            </h2>
                        </div>

                        <span className="insight-icon">
                            ✨
                        </span>

                    </div>

                    <div className="insight-items">

                        <div className="insight-item">

                            <span>🌾</span>

                            <div>
                                <small>
                                    MOST ANALYZED CROP
                                </small>

                                <strong>
                                    {mostAnalyzedCrop}
                                </strong>
                            </div>

                        </div>

                        <div className="insight-item">

                            <span>🦠</span>

                            <div>
                                <small>
                                    MOST COMMON DISEASE
                                </small>

                                <strong>
                                    {mostCommonDisease}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* CROP ANALYTICS */}

            {cropInsights.length > 0 && (
                <div className="crop-insights-section">

                    <div className="section-heading">

                        <div>
                            <p className="dashboard-label">
                                CROP ANALYTICS
                            </p>

                            <h2>
                                Crop Analysis Distribution
                            </h2>

                            <p>
                                Overview of the crops you have analyzed.
                            </p>
                        </div>

                    </div>

                    <div className="crop-insights-grid">

                        {cropInsights.map(([crop, count]) => {

                            const percentage =
                                totalScans > 0
                                    ? Math.round(
                                          (count / totalScans) * 100
                                      )
                                    : 0;

                            return (
                                <div
                                    className="crop-insight-card"
                                    key={crop}
                                >

                                    <div className="crop-insight-top">

                                        <div className="crop-icon">
                                            🌱
                                        </div>

                                        <div>
                                            <h3>{crop}</h3>

                                            <p>
                                                {count}{" "}
                                                {count === 1
                                                    ? "analysis"
                                                    : "analyses"}
                                            </p>
                                        </div>

                                        <strong>
                                            {percentage}%
                                        </strong>

                                    </div>

                                    <div className="crop-bar">

                                        <div
                                            className="crop-bar-fill"
                                            style={{
                                                width: `${percentage}%`
                                            }}
                                        />

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>
            )}

            {/* DISEASE ANALYTICS */}

            {diseaseInsights.length > 0 && (
                <div className="disease-insights-section">

                    <div className="section-heading">

                        <div>
                            <p className="dashboard-label">
                                DISEASE ANALYTICS
                            </p>

                            <h2>
                                Disease Distribution
                            </h2>

                            <p>
                                Overview of diseases detected in your
                                crop analyses.
                            </p>
                        </div>

                    </div>

                    <div className="disease-insights-grid">

                        {diseaseInsights.map(
                            ([disease, count]) => {

                                const percentage =
                                    diseaseTotal > 0
                                        ? Math.round(
                                              (count / diseaseTotal) * 100
                                          )
                                        : 0;

                                return (
                                    <div
                                        className="disease-insight-card"
                                        key={disease}
                                    >

                                        <div className="disease-insight-top">

                                            <div className="disease-icon">
                                                🦠
                                            </div>

                                            <div className="disease-info">

                                                <h3>
                                                    {disease}
                                                </h3>

                                                <p>
                                                    {count}{" "}
                                                    {count === 1
                                                        ? "detection"
                                                        : "detections"}
                                                </p>

                                            </div>

                                            <strong>
                                                {percentage}%
                                            </strong>

                                        </div>

                                        <div className="disease-bar">

                                            <div
                                                className="disease-bar-fill"
                                                style={{
                                                    width: `${percentage}%`
                                                }}
                                            />

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                </div>
            )}

            {/* QUICK ACTION */}

            <div className="quick-actions">

                <div>

                    <p className="section-label">
                        QUICK ACTION
                    </p>

                    <h2>
                        Analyze a new crop
                    </h2>

                    <p>
                        Upload a crop image and let the AI model
                        identify possible diseases and provide
                        recommendations.
                    </p>

                </div>

                <button
                    className="action-button"
                    onClick={() => navigate("/detect")}
                >
                    Analyze Image →
                </button>

            </div>

            {/* RECENT PREDICTIONS */}

            <div className="recent-section">

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            AI ANALYSIS
                        </p>

                        <h2>
                            Recent Predictions
                        </h2>

                        <p>
                            Your latest crop health analyses.
                        </p>

                    </div>

                    <button
                        className="view-all-button"
                        onClick={() => navigate("/history")}
                    >
                        View All →
                    </button>

                </div>

                {loading ? (

                    <div className="dashboard-empty">

                        <div className="loading-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading predictions...
                        </h3>

                        <p>
                            Fetching your latest crop analyses.
                        </p>

                    </div>

                ) : recentPredictions.length === 0 ? (

                    <div className="dashboard-empty">

                        <div className="empty-icon">
                            🌱
                        </div>

                        <h3>
                            No predictions yet
                        </h3>

                        <p>
                            Start your first crop analysis
                            to see results here.
                        </p>

                        <button
                            className="action-button"
                            onClick={() => navigate("/detect")}
                        >
                            Start Analysis →
                        </button>

                    </div>

                ) : (

                    <div className="prediction-list">

                        {recentPredictions.map(
                            (detection, index) => {

                                const status =
                                    getStatus(detection);

                                const isHealthy =
                                    status === "Healthy";

                                return (

                                    <div
                                        className="prediction-card"
                                        key={
                                            detection._id ||
                                            index
                                        }
                                    >

                                        <div className="prediction-left">

                                            <div className="prediction-icon">
                                                🌱
                                            </div>

                                            <div className="prediction-info">

                                                <div className="prediction-title">

                                                    <h3>
                                                        {detection.crop ||
                                                            "Unknown Crop"}
                                                    </h3>

                                                    <span>
                                                        {detection.disease ||
                                                            "Unknown Disease"}
                                                    </span>

                                                </div>

                                                <p className="prediction-date">
                                                    Analyzed on{" "}
                                                    {formatDate(
                                                        detection.createdAt
                                                    )}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="prediction-middle">

                                            <span
                                                className={
                                                    isHealthy
                                                        ? "status healthy"
                                                        : "status disease"
                                                }
                                            >
                                                ● {status}
                                            </span>

                                        </div>

                                        <div className="prediction-right">

                                            <div className="confidence-wrapper">

                                                <div className="confidence-header">

                                                    <span>
                                                        Confidence
                                                    </span>

                                                    <strong>
                                                        {detection.confidence}%
                                                    </strong>

                                                </div>

                                                <div className="mini-confidence-bar">

                                                    <div
                                                        className="mini-confidence-fill"
                                                        style={{
                                                            width: `${Math.min(
                                                                Number(
                                                                    detection.confidence ||
                                                                        0
                                                                ),
                                                                100
                                                            )}%`
                                                        }}
                                                    />

                                                </div>

                                            </div>

                                            <button
                                                className="details-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/history-details/${detection._id}`,
                                                        {
                                                            state: detection
                                                        }
                                                    )
                                                }
                                            >
                                                Details →
                                            </button>

                                        </div>

                                    </div>

                                );
                            }
                        )}

                    </div>

                )}

            </div>

            {/* BOTTOM INFORMATION */}

            <div className="dashboard-info-grid">

                <div className="info-card-dashboard">

                    <div className="info-card-icon">
                        🤖
                    </div>

                    <div>

                        <p className="info-card-label">
                            AI POWERED
                        </p>

                        <h3>
                            Intelligent Crop Analysis
                        </h3>

                        <p>
                            Our AI model analyzes crop images
                            and provides disease predictions
                            with confidence scores.
                        </p>

                    </div>

                </div>

                <div className="info-card-dashboard">

                    <div className="info-card-icon">
                        📊
                    </div>

                    <div>

                        <p className="info-card-label">
                            TRACK YOUR CROPS
                        </p>

                        <h3>
                            Complete Analysis History
                        </h3>

                        <p>
                            View previous predictions,
                            confidence scores, treatments,
                            and crop health information.
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;