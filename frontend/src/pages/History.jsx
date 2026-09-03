import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./History.css";

function History() {
    const navigate = useNavigate();

    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [cropFilter, setCropFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Expanded card
    const [expandedId, setExpandedId] = useState(null);

    // --------------------------------------------------
    // FETCH HISTORY
    // --------------------------------------------------

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            navigate("/login");
            return;
        }

        fetch("https://cropguard-ai-v5zv.onrender.com/api/detections", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then((response) => {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    window.dispatchEvent(
                        new Event("authChange")
                    );

                    navigate("/login");
                    return null;
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch detections");
                }

                return response.json();
            })
            .then((data) => {
                if (data) {
                    setDetections(data);
                }

                setLoading(false);
            })
            .catch((error) => {
                console.error(
                    "Error fetching detections:",
                    error
                );

                setLoading(false);
            });
    }, [navigate]);

    // --------------------------------------------------
    // HEALTH CHECK
    // --------------------------------------------------

    const isHealthy = (detection) => {
        return (
            detection.status?.toLowerCase() === "healthy" ||
            detection.disease?.toLowerCase() === "healthy"
        );
    };

    // --------------------------------------------------
    // STATISTICS
    // --------------------------------------------------

    const totalAnalyses = detections.length;

    const healthyCount = detections.filter(
        (detection) => isHealthy(detection)
    ).length;

    const diseaseCount = detections.filter(
        (detection) => !isHealthy(detection)
    ).length;

    const averageConfidence =
        totalAnalyses > 0
            ? (
                  detections.reduce(
                      (total, detection) =>
                          total +
                          Number(
                              detection.confidence || 0
                          ),
                      0
                  ) / totalAnalyses
              ).toFixed(1)
            : "0.0";

    // --------------------------------------------------
    // UNIQUE CROPS
    // --------------------------------------------------

    const cropOptions = useMemo(() => {
        const crops = detections
            .map((detection) => detection.crop)
            .filter(Boolean);

        return [...new Set(crops)].sort((a, b) =>
            a.localeCompare(b)
        );
    }, [detections]);

    // --------------------------------------------------
    // DATE HELPERS
    // --------------------------------------------------

    const getDateObject = (date) => {
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return parsedDate;
    };

    const isToday = (date) => {
        const detectionDate = getDateObject(date);

        if (!detectionDate) {
            return false;
        }

        const today = new Date();

        return (
            detectionDate.getDate() === today.getDate() &&
            detectionDate.getMonth() === today.getMonth() &&
            detectionDate.getFullYear() === today.getFullYear()
        );
    };

    const isWithinDays = (date, days) => {
        const detectionDate = getDateObject(date);

        if (!detectionDate) {
            return false;
        }

        const now = new Date();

        const difference =
            now.getTime() -
            detectionDate.getTime();

        const millisecondsInDay =
            24 * 60 * 60 * 1000;

        return (
            difference >= 0 &&
            difference <=
                days * millisecondsInDay
        );
    };

    // --------------------------------------------------
    // FILTER + SEARCH + SORT
    // --------------------------------------------------

    const filteredDetections = useMemo(() => {
        let result = detections.filter(
            (detection) => {
                const healthy = isHealthy(detection);

                // Status filter
                const matchesStatus =
                    filter === "all" ||
                    (filter === "healthy" &&
                        healthy) ||
                    (filter === "disease" &&
                        !healthy);

                // Crop filter
                const matchesCrop =
                    cropFilter === "all" ||
                    detection.crop === cropFilter;

                // Search
                const searchText =
                    search.trim().toLowerCase();

                const searchableText = [
                    detection.crop,
                    detection.disease,
                    detection.treatment,
                    detection.status
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                const matchesSearch =
                    searchText === "" ||
                    searchableText.includes(searchText);

                // Date filter
                let matchesDate = true;

                if (dateFilter === "today") {
                    matchesDate = isToday(
                        detection.createdAt
                    );
                }

                if (dateFilter === "7days") {
                    matchesDate = isWithinDays(
                        detection.createdAt,
                        7
                    );
                }

                if (dateFilter === "30days") {
                    matchesDate = isWithinDays(
                        detection.createdAt,
                        30
                    );
                }

                return (
                    matchesStatus &&
                    matchesCrop &&
                    matchesSearch &&
                    matchesDate
                );
            }
        );

        // Sorting
        result.sort((a, b) => {
            if (sortBy === "newest") {
                return (
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
                );
            }

            if (sortBy === "oldest") {
                return (
                    new Date(a.createdAt) -
                    new Date(b.createdAt)
                );
            }

            if (sortBy === "highest") {
                return (
                    Number(b.confidence || 0) -
                    Number(a.confidence || 0)
                );
            }

            if (sortBy === "lowest") {
                return (
                    Number(a.confidence || 0) -
                    Number(b.confidence || 0)
                );
            }

            return 0;
        });

        return result;
    }, [
        detections,
        filter,
        search,
        cropFilter,
        dateFilter,
        sortBy
    ]);

    // --------------------------------------------------
    // DATE FORMAT
    // --------------------------------------------------

    const formatDate = (date) => {
        const parsedDate = getDateObject(date);

        if (!parsedDate) {
            return "Unknown date";
        }

        return parsedDate.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    const formatTime = (date) => {
        const parsedDate = getDateObject(date);

        if (!parsedDate) {
            return "";
        }

        return parsedDate.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    };

    // --------------------------------------------------
    // QUICK INFO
    // --------------------------------------------------

    const toggleDetails = (id) => {
        setExpandedId((currentId) =>
            currentId === id ? null : id
        );
    };

    // --------------------------------------------------
    // CLEAR FILTERS
    // --------------------------------------------------

    const clearFilters = () => {
        setFilter("all");
        setSearch("");
        setCropFilter("all");
        setDateFilter("all");
        setSortBy("newest");
        setExpandedId(null);
    };

    const hasActiveFilters =
        filter !== "all" ||
        search.trim() !== "" ||
        cropFilter !== "all" ||
        dateFilter !== "all" ||
        sortBy !== "newest";

    // --------------------------------------------------
    // DELETE DETECTION
    // --------------------------------------------------

    const handleDelete = async (id) => {
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

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.dispatchEvent(
                    new Event("authChange")
                );

                navigate("/login");
                return;
            }

            if (!response.ok) {
                throw new Error(
                    "Failed to delete detection"
                );
            }

            setDetections(
                (previousDetections) =>
                    previousDetections.filter(
                        (detection) =>
                            detection._id !== id
                    )
            );

            setExpandedId(null);
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

    // --------------------------------------------------
    // LOADING
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="history-page">
                <div className="history-loading">
                    <div className="loading-spinner"></div>

                    <h2>
                        Loading prediction history
                    </h2>

                    <p>
                        Fetching your latest AI analyses...
                    </p>
                </div>
            </div>
        );
    }

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div className="history-page">

            {/* HEADER */}
            <div className="history-header">

                <div>
                    <div className="history-eyebrow">
                        CROP HEALTH MONITOR
                    </div>

                    <h1>
                        Prediction History
                    </h1>

                    <p>
                        Review all your previous AI-powered
                        crop health analyses and disease
                        predictions.
                    </p>
                </div>

                <Link
                    to="/detect"
                    className="new-analysis-btn"
                >
                    <span>+</span>
                    New Analysis
                </Link>

            </div>

            {/* STATISTICS */}
            <div className="history-stats">

                <div className="history-stat-card">
                    <div className="stat-icon scan-icon">
                        ◫
                    </div>

                    <div>
                        <span>
                            Total Analyses
                        </span>

                        <strong>
                            {totalAnalyses}
                        </strong>

                        <small>
                            AI predictions
                        </small>
                    </div>
                </div>

                <div className="history-stat-card">
                    <div className="stat-icon healthy-icon">
                        ✓
                    </div>

                    <div>
                        <span>
                            Healthy
                        </span>

                        <strong>
                            {healthyCount}
                        </strong>

                        <small>
                            Healthy predictions
                        </small>
                    </div>
                </div>

                <div className="history-stat-card">
                    <div className="stat-icon disease-icon">
                        !
                    </div>

                    <div>
                        <span>
                            Disease Detected
                        </span>

                        <strong>
                            {diseaseCount}
                        </strong>

                        <small>
                            Require attention
                        </small>
                    </div>
                </div>

                <div className="history-stat-card">
                    <div className="stat-icon confidence-icon">
                        %
                    </div>

                    <div>
                        <span>
                            Avg. Confidence
                        </span>

                        <strong>
                            {averageConfidence}%
                        </strong>

                        <small>
                            AI prediction confidence
                        </small>
                    </div>
                </div>

            </div>

            {/* PREDICTIONS SECTION */}
            <section className="predictions-section">

                {/* TITLE + SEARCH */}
                <div className="predictions-header">

                    <div>
                        <h2>
                            All Predictions
                        </h2>

                        <p>
                            {filteredDetections.length}{" "}
                            prediction
                            {filteredDetections.length !== 1
                                ? "s"
                                : ""}{" "}
                            shown
                        </p>
                    </div>

                    <div className="history-search">

                        <span>⌕</span>

                        <input
                            type="text"
                            placeholder="Search crop, disease, treatment..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                        {search && (
                            <button
                                className="search-clear"
                                onClick={() =>
                                    setSearch("")
                                }
                                title="Clear search"
                            >
                                ×
                            </button>
                        )}

                    </div>

                </div>

                {/* STATUS FILTERS */}
                <div className="history-filters">

                    <button
                        className={
                            filter === "all"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("all")
                        }
                    >
                        All Predictions

                        <span>
                            {totalAnalyses}
                        </span>
                    </button>

                    <button
                        className={
                            filter === "healthy"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("healthy")
                        }
                    >
                        Healthy

                        <span>
                            {healthyCount}
                        </span>
                    </button>

                    <button
                        className={
                            filter === "disease"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setFilter("disease")
                        }
                    >
                        Disease Detected

                        <span>
                            {diseaseCount}
                        </span>
                    </button>

                </div>

                {/* ADVANCED FILTERS */}
                <div className="advanced-filters">

                    {/* CROP */}
                    <div className="filter-group">

                        <label>
                            CROP
                        </label>

                        <select
                            value={cropFilter}
                            onChange={(event) =>
                                setCropFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Crops
                            </option>

                            {cropOptions.map(
                                (crop) => (
                                    <option
                                        key={crop}
                                        value={crop}
                                    >
                                        {crop}
                                    </option>
                                )
                            )}
                        </select>

                    </div>

                    {/* DATE */}
                    <div className="filter-group">

                        <label>
                            DATE
                        </label>

                        <select
                            value={dateFilter}
                            onChange={(event) =>
                                setDateFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Time
                            </option>

                            <option value="today">
                                Today
                            </option>

                            <option value="7days">
                                Last 7 Days
                            </option>

                            <option value="30days">
                                Last 30 Days
                            </option>
                        </select>

                    </div>

                    {/* SORT */}
                    <div className="filter-group">

                        <label>
                            SORT BY
                        </label>

                        <select
                            value={sortBy}
                            onChange={(event) =>
                                setSortBy(
                                    event.target.value
                                )
                            }
                        >
                            <option value="newest">
                                Newest First
                            </option>

                            <option value="oldest">
                                Oldest First
                            </option>

                            <option value="highest">
                                Highest Confidence
                            </option>

                            <option value="lowest">
                                Lowest Confidence
                            </option>
                        </select>

                    </div>

                    {/* CLEAR */}
                    <button
                        className={
                            `clear-filters-btn ${
                                hasActiveFilters
                                    ? "visible"
                                    : ""
                            }`
                        }
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                    >
                        × Clear Filters
                    </button>

                </div>

                {/* PREDICTION LIST */}
                <div className="prediction-list">

                    {filteredDetections.length === 0 ? (

                        <div className="empty-history">

                            <div className="empty-icon">
                                ⌕
                            </div>

                            <h3>
                                No predictions found
                            </h3>

                            <p>
                                No history matches your
                                current search and filters.
                            </p>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="empty-clear-btn"
                                >
                                    Clear All Filters
                                </button>
                            )}

                        </div>

                    ) : (

                        filteredDetections.map(
                            (detection) => {

                                const healthy =
                                    isHealthy(
                                        detection
                                    );

                                const confidence =
                                    Number(
                                        detection.confidence ||
                                            0
                                    );

                                const isExpanded =
                                    expandedId ===
                                    detection._id;

                                return (
                                    <article
                                        className={
                                            `prediction-card ${
                                                isExpanded
                                                    ? "expanded"
                                                    : ""
                                            }`
                                        }
                                        key={
                                            detection._id
                                        }
                                    >

                                        {/* MAIN CARD */}
                                        <div className="prediction-main">

                                            {/* ICON */}
                                            <div
                                                className={
                                                    `crop-icon ${
                                                        healthy
                                                            ? "healthy-bg"
                                                            : "disease-bg"
                                                    }`
                                                }
                                            >
                                                🌱
                                            </div>

                                            {/* INFO */}
                                            <div className="prediction-info">

                                                <h3>
                                                    {detection.crop ||
                                                        "Unknown Crop"}
                                                </h3>

                                                <p>
                                                    {detection.disease ||
                                                        "Unknown prediction"}
                                                </p>

                                                <div className="prediction-date">

                                                    <span>
                                                        ANALYZED
                                                    </span>

                                                    {formatDate(
                                                        detection.createdAt
                                                    )}

                                                    <span className="date-dot">
                                                        •
                                                    </span>

                                                    {formatTime(
                                                        detection.createdAt
                                                    )}

                                                </div>

                                            </div>

                                            {/* CONFIDENCE */}
                                            <div className="prediction-confidence">

                                                <span>
                                                    CONFIDENCE
                                                </span>

                                                <strong>
                                                    {confidence.toFixed(
                                                        1
                                                    )}
                                                    %
                                                </strong>

                                                <div className="confidence-bar">
                                                    <div
                                                        style={{
                                                            width: `${Math.min(
                                                                Math.max(
                                                                    confidence,
                                                                    0
                                                                ),
                                                                100
                                                            )}%`
                                                        }}
                                                    ></div>
                                                </div>

                                            </div>

                                            {/* STATUS */}
                                            <div className="prediction-status">

                                                <span
                                                    className={
                                                        `status-badge ${
                                                            healthy
                                                                ? "status-healthy"
                                                                : "status-disease"
                                                        }`
                                                    }
                                                >
                                                    <span className="status-dot">
                                                        ●
                                                    </span>

                                                    {healthy
                                                        ? "Healthy"
                                                        : "Disease Detected"}
                                                </span>

                                            </div>

                                            {/* ACTIONS */}
                                            <div className="history-card-actions">

                                                <button
                                                    className="details-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/history-details/${detection._id}`
                                                        )
                                                    }
                                                >
                                                    View Details
                                                    <span>
                                                        →
                                                    </span>
                                                </button>

                                                <button
                                                    className="quick-info-btn"
                                                    onClick={() =>
                                                        toggleDetails(
                                                            detection._id
                                                        )
                                                    }
                                                >
                                                    Quick Info

                                                    <span>
                                                        {isExpanded
                                                            ? "↑"
                                                            : "↓"}
                                                    </span>
                                                </button>

                                                <button
                                                    className="delete-history-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            detection._id
                                                        )
                                                    }
                                                >
                                                    🗑 Delete
                                                </button>

                                            </div>

                                        </div>

                                        {/* QUICK INFO */}
                                        {isExpanded && (
                                            <div className="prediction-details">

                                                <div className="detail-divider"></div>

                                                <div className="detail-grid">

                                                    <div className="detail-box">
                                                        <span>
                                                            Crop
                                                        </span>

                                                        <strong>
                                                            {detection.crop ||
                                                                "Unknown"}
                                                        </strong>
                                                    </div>

                                                    <div className="detail-box">
                                                        <span>
                                                            Prediction
                                                        </span>

                                                        <strong>
                                                            {detection.disease ||
                                                                "Unknown"}
                                                        </strong>
                                                    </div>

                                                    <div className="detail-box">
                                                        <span>
                                                            Confidence
                                                        </span>

                                                        <strong>
                                                            {confidence.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </strong>
                                                    </div>

                                                    <div className="detail-box">
                                                        <span>
                                                            Status
                                                        </span>

                                                        <strong
                                                            className={
                                                                healthy
                                                                    ? "detail-healthy"
                                                                    : "detail-disease"
                                                            }
                                                        >
                                                            {healthy
                                                                ? "Healthy"
                                                                : "Disease Detected"}
                                                        </strong>
                                                    </div>

                                                </div>

                                                {detection.treatment && (
                                                    <div
                                                        className={
                                                            `treatment-box ${
                                                                healthy
                                                                    ? "healthy-treatment"
                                                                    : ""
                                                            }`
                                                        }
                                                    >

                                                        <div className="treatment-icon">
                                                            {healthy
                                                                ? "✓"
                                                                : "✦"}
                                                        </div>

                                                        <div>

                                                            <span>
                                                                {healthy
                                                                    ? "RECOMMENDED CARE"
                                                                    : "RECOMMENDED TREATMENT"}
                                                            </span>

                                                            <p>
                                                                {
                                                                    detection.treatment
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>
                                                )}

                                            </div>
                                        )}

                                    </article>
                                );
                            }
                        )
                    )}

                </div>

            </section>

        </div>
    );
}

export default History;