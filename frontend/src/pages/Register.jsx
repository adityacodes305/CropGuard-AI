import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            setLoading(true);

            const response = await fetch(
                "https://cropguard-ai-v5zv.onrender.com/api/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message || "Registration failed"
                );
                return;
            }

            setMessage(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            setError(
                "Unable to connect to the server. Make sure the backend is running."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            <div className="register-card">

                {/* Icon */}
                <div className="register-icon">
                    🌱
                </div>

                {/* Header */}
                <div className="register-header">

                    <p className="register-label">
                        CROP HEALTH MONITOR
                    </p>

                    <h1>
                        Create Account
                    </h1>

                    <p className="register-subtitle">
                        Create your account and start monitoring
                        your crop health with AI.
                    </p>

                </div>

                {/* Registration Form */}
                <form
                    className="register-form"
                    onSubmit={handleSubmit}
                >

                    {/* Name */}
                    <div className="register-input-group">

                        <label htmlFor="name">
                            Full Name
                        </label>

                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) =>
                                setName(e.target.value)
                            }
                            required
                        />

                    </div>

                    {/* Email */}
                    <div className="register-input-group">

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

                    {/* Password */}
                    <div className="register-input-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength={8}
                            required
                        />

                        <small>
                            Password must contain at least 8 characters.
                        </small>

                    </div>

                    {/* Error */}
                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {message && (
                        <div className="register-success">
                            {message}
                        </div>
                    )}

                    {/* Register Button */}
                    <button
                        className="register-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account →"}
                    </button>

                </form>

                {/* Login Link */}
                <div className="login-section">

                    <p>
                        Already have an account?

                        <button
                            type="button"
                            className="login-link"
                            onClick={() =>
                                navigate("/login")
                            }
                        >
                            Sign In
                        </button>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Register;