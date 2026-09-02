import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Navbar from "./components/Navbar";

import Detect from "./pages/Detect";
import Result from "./pages/Result";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import HistoryDetails from "./pages/HistoryDetails";

import ProtectedRoute from "./ProtectedRoute";

function App() {
    return (
            <BrowserRouter>

                <Navbar />

                <Routes>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/detect"
                        element={
                            <ProtectedRoute>
                                <Detect />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/result"
                        element={
                            <ProtectedRoute>
                                <Result />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/history"
                        element={
                            <ProtectedRoute>
                                <History />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/history-details/:id"
                        element={
                            <ProtectedRoute>
                                <HistoryDetails />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </BrowserRouter>
    );
}

export default App;