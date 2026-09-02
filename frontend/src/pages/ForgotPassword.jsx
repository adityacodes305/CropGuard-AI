import { useState } from "react";
import { Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [submitted, setSubmitted] = useState(false);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");


        if (!email) {

            setError(
                "Please enter your email address."
            );

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                "http://localhost:5000/api/forgot-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                setError(
                    data.message ||
                    "Something went wrong."
                );

                return;
            }


            setSuccess(
                "If an account exists with this email, a password reset link has been sent. Please check your inbox."
            );

            setSubmitted(true);


        } catch (error) {

            console.error(
                "Forgot password error:",
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

        <div className="forgot-page">

            <div className="forgot-card">


                <div className="forgot-icon">
                    🔐
                </div>


                <div className="forgot-header">

                    <p className="forgot-label">
                        ACCOUNT RECOVERY
                    </p>


                    <h1>
                        Forgot Password?
                    </h1>


                    <p className="forgot-subtitle">
                        Enter your registered email and
                        we'll send you a secure password
                        reset link.
                    </p>

                </div>


                {!submitted ? (

                    <form
                        className="forgot-form"
                        onSubmit={handleSubmit}
                    >

                        {error && (

                            <div className="forgot-error">
                                {error}
                            </div>

                        )}


                        <div className="forgot-input-group">

                            <label htmlFor="email">
                                Email Address
                            </label>


                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="forgot-button"
                            disabled={loading}
                        >

                            {loading
                                ? "Sending..."
                                : "Send Reset Link →"}

                        </button>

                    </form>

                ) : (

                    <div className="forgot-success-box">

                        <div className="email-success-icon">
                            ✉️
                        </div>


                        <h2>
                            Check Your Email
                        </h2>


                        <p>
                            We've sent a password reset
                            link to:
                        </p>


                        <strong>
                            {email}
                        </strong>


                        <p className="forgot-small-text">
                            The link will expire in
                            <strong> 15 minutes</strong>.
                        </p>

                    </div>

                )}


                <div className="forgot-footer">

                    <Link to="/login">
                        ← Back to Login
                    </Link>

                </div>


            </div>

        </div>

    );

}


export default ForgotPassword;