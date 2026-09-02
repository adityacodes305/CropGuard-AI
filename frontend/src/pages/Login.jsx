import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            setLoading(true);

            const response = await fetch(
                "http://localhost:5000/api/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Invalid email or password."
                );
                return;
            }

            setSuccess(
                "Login successful! Redirecting..."
            );

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.dispatchEvent(
                new Event("authChange")
            );

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server. Make sure the backend is running."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                {/* ICON */}
                <div className="login-icon">
                    🌱
                </div>

                {/* HEADER */}
                <div className="login-header">

                    <p className="login-label">
                        CROP HEALTH MONITOR
                    </p>

                    <h1>
                        Welcome Back
                    </h1>

                    <p className="login-subtitle">
                        Sign in to continue monitoring your crop health.
                    </p>

                </div>

                {/* FORM */}
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >

                    {/* EMAIL */}
                    <div className="login-input-group">

                        <label htmlFor="email">
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* PASSWORD */}
                    <div className="login-input-group">

    <div className="password-label-row">

        <label htmlFor="password">
            Password
        </label>

        <button
            type="button"
            className="forgot-password-link"
            onClick={() => navigate("/forgot-password")}
        >
            Forgot Password?
        </button>

    </div>

    <input
        id="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />

</div>

                    {/* ERROR */}
                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    {/* SUCCESS */}
                    {success && (
                        <div className="login-success">
                            {success}
                        </div>
                    )}

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing In..."
                            : "Sign In →"}
                    </button>

                </form>

                {/* REGISTER */}
                <div className="register-section">

                    <p>
                        Don't have an account?

                        <button
                            type="button"
                            className="register-link"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create Account
                        </button>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;