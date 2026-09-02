import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    useEffect(() => {
        const handleAuthChange = () => {
            const savedUser = localStorage.getItem("user");

            setUser(
                savedUser
                    ? JSON.parse(savedUser)
                    : null
            );
        };

        window.addEventListener(
            "authChange",
            handleAuthChange
        );

        return () => {
            window.removeEventListener(
                "authChange",
                handleAuthChange
            );
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");

        setUser(null);

        window.dispatchEvent(
            new Event("authChange")
        );

        navigate("/login");
    };

    return (
        <nav className="navbar">

            {/* Logo */}
            <Link to="/" className="navbar-logo">
                <span className="navbar-logo-icon">
                    🌱
                </span>

                <span>
                    CropGuard <strong>AI</strong>
                </span>
            </Link>

            {/* Navigation */}
            <div className="navbar-links">

                <Link to="/">
                    Home
                </Link>

                <Link to="/detect">
                    Detect
                </Link>

                <Link to="/dashboard">
                    Dashboard
                </Link>

                <Link to="/history">
                    History
                </Link>

            </div>

            {/* Right Side */}
            <div className="navbar-right">
                
                {user ? (
                    <>
                        <div className="navbar-user">

                            <div className="navbar-user-icon">
                                {user.name
                                    ? user.name
                                        .charAt(0)
                                        .toUpperCase()
                                    : "U"}
                            </div>

                            <span>
                                {user.name || "User"}
                            </span>

                        </div>

                        <button
                            className="navbar-logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                            to="/login"
                            className="navbar-login"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="navbar-register"
                        >
                            Get Started
                        </Link>
                    </>
                )}

            </div>

        </nav>
    );
}

export default Navbar;