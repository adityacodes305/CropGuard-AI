const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dns = require("dns");
const nodemailer = require("nodemailer");

const Detection = require("./models/Detection");
const User = require("./models/User");

require("dotenv").config();

const app = express();


// ===============================
// DNS
// ===============================

dns.setServers(["8.8.8.8", "1.1.1.1"]);


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());


// ===============================
// ETHEREAL EMAIL
// ===============================

let transporter;

async function setupEmail() {
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    console.log("Ethereal email account ready");
}


// ===============================
// AUTHENTICATION MIDDLEWARE
// ===============================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    const token =
        authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({
                    message: "Invalid or expired token"
                });
            }

            req.user = user;

            next();
        }
    );
}


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.send(
        "CropGuard AI Backend is running"
    );

});


// ===============================
// TEST API
// ===============================

app.get("/api/test", (req, res) => {

    res.json({
        message: "CropGuard API is working"
    });

});


// ===============================
// REGISTER
// ===============================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate fields
        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }


        // Validate password
        if (password.length < 8) {

            return res.status(400).json({
                message:
                    "Password must be at least 8 characters"
            });

        }


        // Normalize email
        const normalizedEmail =
            email.toLowerCase().trim();


        // Check existing user
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Create user
        const user = new User({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword

        });


        const savedUser =
            await user.save();


        res.status(201).json({

            message:
                "Registration successful",

            user: {

                id: savedUser._id,

                name: savedUser.name,

                email: savedUser.email

            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({

            message:
                "Registration failed",

            error: error.message

        });

    }

});


// ===============================
// LOGIN
// ===============================

app.post("/api/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // Find user
        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // Create JWT
        const token =
            jwt.sign(

                {
                    id: user._id,
                    email: user.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );


        res.json({

            message:
                "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({

            message:
                "Login failed",

            error: error.message

        });

    }

});


// ===============================
// SAVE DETECTION
// ===============================

app.post(
    "/api/detections",
    authenticateToken,
    async (req, res) => {

        try {

            const detection =
                new Detection({

                    ...req.body,

                    userId: req.user.id

                });


            const savedDetection =
                await detection.save();


            res.status(201).json(
                savedDetection
            );

        } catch (error) {

            console.error(
                "Save detection error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to save detection",

                error: error.message

            });

        }

    }
);


// ===============================
// GET USER DETECTIONS
// ===============================

app.get(
    "/api/detections",
    authenticateToken,
    async (req, res) => {

        try {

            const detections =
                await Detection

                    .find({
                        userId: req.user.id
                    })

                    .sort({
                        createdAt: -1
                    });


            res.json(detections);

        } catch (error) {

            console.error(
                "Fetch detections error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch detections",

                error: error.message

            });

        }

    }
);


// ===============================
// GET SINGLE DETECTION
// ===============================

app.get(
    "/api/detections/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const detection =
                await Detection.findOne({

                    _id: req.params.id,

                    userId: req.user.id

                });


            if (!detection) {

                return res.status(404).json({

                    message:
                        "Detection not found"

                });

            }


            res.json(detection);

        } catch (error) {

            console.error(
                "Fetch detection error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to fetch detection",

                error: error.message

            });

        }

    }
);

// DELETE a detection
app.delete("/api/detections/:id", authenticateToken, async (req, res) => {
    try {
        const detection = await Detection.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!detection) {
            return res.status(404).json({
                message: "Detection not found"
            });
        }

        res.json({
            message: "Detection deleted successfully"
        });

    } catch (error) {
        console.error("Delete detection error:", error);

        res.status(500).json({
            message: "Failed to delete detection",
            error: error.message
        });
    }
});

// ===============================
// REQUEST PASSWORD RESET
// ===============================

app.post(
    "/api/forgot-password",
    async (req, res) => {

        try {

            const { email } = req.body;


            // Validate email
            if (!email) {

                return res.status(400).json({

                    message:
                        "Email is required"

                });

            }


            // Normalize email
            const normalizedEmail =
                email.toLowerCase().trim();


            // Find user
            const user =
                await User.findOne({

                    email: normalizedEmail

                });


            /*
             * Do not reveal whether an
             * account exists.
             */

            if (!user) {

                return res.json({

                    message:
                        "If an account exists with this email, a password reset link has been sent."

                });

            }


            // Generate secure random token
            const resetToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // Hash token before storing
            const hashedToken =
                crypto
                    .createHash("sha256")
                    .update(resetToken)
                    .digest("hex");


            // Save hashed token
            user.resetPasswordToken =
                hashedToken;


            // Token expires in 15 minutes
            user.resetPasswordExpires =
                new Date(
                    Date.now() +
                    15 * 60 * 1000
                );


            await user.save();


            // ===============================
            // RESET URL
            // ===============================

            const resetUrl =
                `http://localhost:5173/reset-password?token=${resetToken}`;


            // ===============================
            // EMAIL
            // ===============================

            const mailOptions = {

                from:
                    '"CropGuard AI" <no-reply@cropguard.local>',

                to:
                    user.email,

                subject:
                    "CropGuard AI - Password Reset",

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                        background: #f5faf7;
                    ">

                        <div style="
                            background: white;
                            padding: 35px;
                            border-radius: 16px;
                            border: 1px solid #dfeae3;
                        ">

                            <h1 style="
                                color: #183b28;
                                margin-bottom: 10px;
                            ">
                                CropGuard AI
                            </h1>


                            <p style="
                                color: #617268;
                                font-size: 15px;
                                line-height: 1.6;
                            ">
                                We received a request to reset
                                your CropGuard AI password.
                            </p>


                            <p style="
                                color: #617268;
                                font-size: 15px;
                                line-height: 1.6;
                            ">
                                Click the button below to create
                                a new password.
                            </p>


                            <div style="
                                text-align: center;
                                margin: 30px 0;
                            ">

                                <a
                                    href="${resetUrl}"
                                    style="
                                        display: inline-block;
                                        padding: 14px 28px;
                                        background: #217a43;
                                        color: white;
                                        text-decoration: none;
                                        border-radius: 8px;
                                        font-weight: bold;
                                    "
                                >
                                    Reset Password
                                </a>

                            </div>


                            <p style="
                                color: #7a8880;
                                font-size: 13px;
                                line-height: 1.5;
                            ">
                                This password reset link will
                                expire in 15 minutes.
                            </p>


                            <p style="
                                color: #7a8880;
                                font-size: 13px;
                                line-height: 1.5;
                            ">
                                If you did not request a password
                                reset, you can safely ignore this email.
                            </p>


                            <hr style="
                                border: none;
                                border-top: 1px solid #e5ece8;
                                margin: 25px 0;
                            ">


                            <p style="
                                color: #9aa59f;
                                font-size: 12px;
                            ">
                                CropGuard AI — Crop Health Monitoring
                            </p>

                        </div>

                    </div>

                `

            };


            // Send email
            const info =
                await transporter.sendMail(
                    mailOptions
                );


            // Ethereal preview URL
            const previewUrl =
                nodemailer.getTestMessageUrl(
                    info
                );


            console.log(
                "Password reset email preview:"
            );

            console.log(previewUrl);


            // IMPORTANT:
            // Do NOT return resetToken
            // to the frontend.

            res.json({

                message:
                    "If an account exists with this email, a password reset link has been sent."

            });

        } catch (error) {

            console.error(
                "Password reset request error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to send password reset email"

            });

        }

    }
);


// ===============================
// RESET PASSWORD
// ===============================

app.post(
    "/api/reset-password",
    async (req, res) => {

        try {

            const {
                token,
                newPassword
            } = req.body;


            // Validate fields
            if (!token || !newPassword) {

                return res.status(400).json({

                    message:
                        "Reset token and new password are required"

                });

            }


            // Validate password
            if (newPassword.length < 8) {

                return res.status(400).json({

                    message:
                        "Password must be at least 8 characters"

                });

            }


            // Hash received token
            const hashedToken =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");


            // Find user with valid token
            const user =
                await User.findOne({

                    resetPasswordToken:
                        hashedToken,

                    resetPasswordExpires: {
                        $gt: new Date()
                    }

                });


            // Invalid or expired token
            if (!user) {

                return res.status(400).json({

                    message:
                        "Invalid or expired reset token"

                });

            }


            // Hash new password
            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            // Update password
            user.password =
                hashedPassword;


            // Delete reset token
            // Makes token single-use
            user.resetPasswordToken =
                null;

            user.resetPasswordExpires =
                null;


            await user.save();


            res.json({

                message:
                    "Password reset successful"

            });

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            res.status(500).json({

                message:
                    "Failed to reset password"

            });

        }

    }
);


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });


// ===============================
// START SERVER
// ===============================

app.listen(5000, async () => {

    console.log(
        "Server running on http://localhost:5000"
    );

    try {

        await setupEmail();

    } catch (error) {

        console.error(
            "Ethereal setup failed:",
            error.message
        );

    }

});