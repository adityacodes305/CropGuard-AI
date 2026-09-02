import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Detect.css";

function Detect() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const changeInputRef = useRef(null);

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    function validateImage(selectedImage) {
        if (!selectedImage) {
            return false;
        }

        if (!selectedImage.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return false;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            return false;
        }

        setError("");
        return true;
    }

    function handleSelectedImage(selectedImage) {
        if (!selectedImage) {
            return;
        }

        if (!validateImage(selectedImage)) {
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setImage(selectedImage);
        setPreview(URL.createObjectURL(selectedImage));
        setError("");
    }

    function handleImageChange(event) {
        const selectedImage = event.target.files[0];

        handleSelectedImage(selectedImage);

        event.target.value = "";
    }

    function handleDragOver(event) {
        event.preventDefault();

        if (loading) {
            return;
        }

        setDragActive(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDragActive(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        setDragActive(false);

        if (loading) {
            return;
        }

        const droppedImage = event.dataTransfer.files[0];

        handleSelectedImage(droppedImage);
    }

    function removeImage() {
        if (loading) {
            return;
        }

        if (preview) {
            URL.revokeObjectURL(preview);
        }

        setImage(null);
        setPreview(null);
        setError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (changeInputRef.current) {
            changeInputRef.current.value = "";
        }
    }

    async function handleAnalyze() {
        if (loading) {
            return;
        }

        if (!image) {
            setError("Please upload a crop image first.");
            return;
        }

        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
            navigate("/login");
            return;
        }

        setLoading(true);
        setError("");

        try {
            /*
             * STEP 1
             * Send image to AI
             */
            const formData = new FormData();

            formData.append("file", image);

            const aiResponse = await fetch(
                "http://127.0.0.1:8000/predict",
                {
                    method: "POST",
                    body: formData
                }
            );

            let aiData;

            try {
                aiData = await aiResponse.json();
            } catch {
                throw new Error(
                    "AI server returned an invalid response."
                );
            }

            if (!aiResponse.ok) {
                throw new Error(
                    aiData.detail || "AI prediction failed."
                );
            }

            console.log("AI Result:", aiData);

            /*
             * STEP 2
             * Convert image to data URL
             */
            const imageData = await new Promise(
                (resolve, reject) => {
                    const reader = new FileReader();

                    reader.onload = () => resolve(reader.result);

                    reader.onerror = () =>
                        reject(
                            new Error(
                                "Failed to process the image."
                            )
                        );

                    reader.readAsDataURL(image);
                }
            );

            /*
             * STEP 3
             * Prepare detection data
             */
            const detection = {
                image: imageData,

                crop: aiData.crop,

                disease: aiData.disease,

                confidence: aiData.confidence,

                status: aiData.status,

                top_predictions:
                    aiData.top_predictions,

                treatment:
                    aiData.status === "Healthy"
                        ? "Continue regular watering, provide adequate sunlight, and monitor the plant for any changes."
                        : "Remove affected leaves, maintain good air circulation, avoid excessive moisture, and follow appropriate disease treatment."
            };

            /*
             * STEP 4
             * Save result in MongoDB
             */
            const response = await fetch(
                "http://localhost:5000/api/detections",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify(detection)
                }
            );

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Backend returned an invalid response."
                );
            }

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
                    data.error ||
                    data.message ||
                    "Failed to save detection."
                );
            }

            console.log("Saved Detection:", data);

            /*
             * STEP 5
             * Go to result page
             */
            navigate("/result", {
                state: data
            });

        } catch (error) {
            console.error("Analysis error:", error);

            if (
                error.message.includes("Failed to fetch")
            ) {
                setError(
                    "Unable to connect to the AI server. Make sure the AI server is running."
                );
            } else {
                setError(
                    error.message ||
                    "Something went wrong during analysis."
                );
            }

        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="detect-page">

            <div className="detect-container">

                {/* HEADER */}

                <div className="detect-header">

                    <span className="detect-badge">
                        🌱 CROP HEALTH MONITOR
                    </span>

                    <h1>
                        Detect Crop Disease
                    </h1>

                    <p>
                        Upload a clear image of a crop leaf
                        and let our AI analyze its health
                        and identify possible diseases.
                    </p>

                </div>


                {/* UPLOAD CARD */}

                <div className="upload-card">

                    <div className="upload-title">

                        <h2>
                            Upload Crop Image
                        </h2>

                        <p>
                            Supported formats: JPG, JPEG, PNG
                            · Maximum size: 5 MB
                        </p>

                    </div>


                    {!image ? (

                        <label
                            className={`drop-zone ${
                                dragActive
                                    ? "drag-active"
                                    : ""
                            } ${
                                loading
                                    ? "upload-disabled"
                                    : ""
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleImageChange}
                                disabled={loading}
                                hidden
                            />

                            <div className="upload-icon">
                                📷
                            </div>

                            <h3>
                                {dragActive
                                    ? "Drop your image here"
                                    : "Drag & Drop your image here"}
                            </h3>

                            <p>
                                or click to browse from your
                                computer
                            </p>

                            <span className="browse-button">
                                Choose Image
                            </span>

                        </label>

                    ) : (

                        <div className="preview-section">

                            <div className="preview-image-wrapper">

                                <img
                                    src={preview}
                                    alt="Crop preview"
                                    className="preview-image"
                                />

                                {!loading && (
                                    <button
                                        className="remove-image"
                                        onClick={removeImage}
                                        type="button"
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                )}

                                {loading && (
                                    <div className="image-analyzing-overlay">

                                        <div className="overlay-spinner"></div>

                                        <span>
                                            AI Analyzing...
                                        </span>

                                    </div>
                                )}

                            </div>


                            <div className="file-info">

                                <div className="file-details">

                                    <strong>
                                        {image.name}
                                    </strong>

                                    <span>
                                        {(
                                            image.size /
                                            (1024 * 1024)
                                        ).toFixed(2)}{" "}
                                        MB
                                    </span>

                                </div>


                                {!loading && (
                                    <label className="change-image">

                                        Change Image

                                        <input
                                            ref={changeInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={
                                                handleImageChange
                                            }
                                            hidden
                                        />

                                    </label>
                                )}

                            </div>

                        </div>

                    )}


                    {/* ERROR */}

                    {error && (

                        <div className="detect-error">

                            <span>
                                ⚠
                            </span>

                            <p>
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => setError("")}
                            >
                                ×
                            </button>

                        </div>

                    )}

                </div>


                {/* ANALYZE SECTION */}

                <div className="analyze-section">

                    <button
                        className="analyze-button"
                        onClick={handleAnalyze}
                        disabled={loading || !image}
                    >

                        {loading ? (

                            <>
                                <span className="spinner"></span>

                                Analyzing Image...
                            </>

                        ) : (

                            <>
                                🔍 Analyze Crop
                            </>

                        )}

                    </button>


                    {loading && (

                        <div className="analyzing-panel">

                            <div className="analysis-step active">
                                <span>✓</span>
                                Image uploaded
                            </div>

                            <div className="analysis-line"></div>

                            <div className="analysis-step active">
                                <span className="mini-spinner"></span>
                                AI analyzing crop
                            </div>

                            <div className="analysis-line"></div>

                            <div className="analysis-step">
                                <span>○</span>
                                Saving prediction
                            </div>

                        </div>

                    )}

                    {!loading && image && !error && (

                        <p className="analyzing-text">
                            Your image is ready for AI analysis.
                        </p>

                    )}

                </div>


                {/* INFO CARDS */}

                <div className="detect-info">

                    <div className="info-item">

                        <span>
                            🔬
                        </span>

                        <div>

                            <strong>
                                AI Analysis
                            </strong>

                            <p>
                                Advanced image analysis
                            </p>

                        </div>

                    </div>


                    <div className="info-item">

                        <span>
                            🌿
                        </span>

                        <div>

                            <strong>
                                Crop Detection
                            </strong>

                            <p>
                                Automatically identifies crops
                            </p>

                        </div>

                    </div>


                    <div className="info-item">

                        <span>
                            🛡️
                        </span>

                        <div>

                            <strong>
                                Health Check
                            </strong>

                            <p>
                                Detects possible diseases
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Detect;