import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-page">

            {/* Hero Section */}
            <section className="home-hero">

                <div className="hero-content">

                    <div className="hero-badge">
                        🌱 AI-Powered Agriculture
                    </div>

                    <h1>
                        Protect Your Crops
                        <span> With AI</span>
                    </h1>

                    <p className="hero-description">
                        Detect crop diseases and pest infestations at an
                        early stage using Artificial Intelligence and
                        make smarter decisions for healthier crops.
                    </p>

                    <div className="hero-actions">

                        <Link
                            to="/detect"
                            className="hero-button"
                        >
                            Start Disease Detection →
                        </Link>

                    </div>

                </div>


                {/* Hero Visual */}
                <div className="hero-visual">

                    <div className="visual-card">

                        <div className="visual-icon">
                            🌿
                        </div>

                        <div className="visual-content">
                            <span>Crop Health</span>
                            <strong>AI Analysis</strong>
                        </div>

                        <div className="visual-status">
                            <span></span>
                            Active
                        </div>

                    </div>


                    <div className="visual-circle circle-one"></div>
                    <div className="visual-circle circle-two"></div>

                    <div className="plant-illustration">
                        🌱
                    </div>

                </div>

            </section>


            {/* Features */}
            <section className="home-features">

                <div className="section-heading">

                    <span>SMART AGRICULTURE</span>

                    <h2>
                        Everything You Need to Protect Your Crops
                    </h2>

                    <p>
                        CropGuard AI helps farmers identify crop problems
                        quickly and take informed action.
                    </p>

                </div>


                <div className="feature-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔍
                        </div>

                        <h3>AI Disease Detection</h3>

                        <p>
                            Upload a crop image and let AI analyze it
                            to identify possible diseases and infections.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            📊
                        </div>

                        <h3>Smart Analytics</h3>

                        <p>
                            Track your crop analysis history and understand
                            your crop health through useful insights.
                        </p>

                    </div>


                    <div className="feature-card">

                        <div className="feature-icon">
                            💡
                        </div>

                        <h3>Actionable Insights</h3>

                        <p>
                            Get treatment and prevention recommendations
                            based on detected crop conditions.
                        </p>

                    </div>

                </div>

            </section>


            {/* Bottom CTA */}
            <section className="home-cta">

                <div>

                    <span>READY TO GET STARTED?</span>

                    <h2>
                        Keep Your Crops Healthy With AI
                    </h2>

                    <p>
                        Analyze your crops and detect potential diseases
                        before they become a bigger problem.
                    </p>

                </div>

                <div className="cta-icon">
                    🌾
                </div>

            </section>

        </div>
    );
}

export default Home;