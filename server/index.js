require("dotenv").config({ path: "../.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const MongoStore = require("connect-mongo").default || require("connect-mongo");

require("./config/passport");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const domainRoutes = require("./routes/domains");
const caddyRoutes = require("./routes/caddy");

const Domain = require("./models/Domain");

const app = express();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Dynamic CORS - Allow verified custom domains
app.use(
    cors({
        origin: async function (origin, callback) {
            // Allow requests with no origin (like mobile apps, curl, Postman)
            if (!origin) {
                return callback(null, true);
            }

            // Always allow the main CLIENT_URL
            if (origin === process.env.CLIENT_URL) {
                return callback(null, true);
            }

            // Extract hostname from origin (e.g., https://example.com -> example.com)
            let hostname;
            try {
                hostname = new URL(origin).hostname;
            } catch (err) {
                return callback(new Error('Invalid origin'), false);
            }

            // Check if domain is verified in database
            try {
                const domain = await Domain.findOne({
                    domain: hostname,
                    verified: true
                });

                if (domain) {
                    console.log(`[CORS] Allowed verified domain: ${hostname}`);
                    return callback(null, true);
                }

                console.log(`[CORS] Blocked unverified domain: ${hostname}`);
                return callback(new Error('Domain not verified'), false);
            } catch (err) {
                console.error('[CORS] Database error:', err);
                return callback(err, false);
            }
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("trust proxy", 1);

// Request Logger Middleware
app.use((req, res, next) => {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Debugging Middleware for Cookies
app.use((req, res, next) => {
    // console.log(
    //     `[Debug] ${req.method} ${req.url} - Origin: ${req.headers.origin}`
    // );
    // console.log(`[Debug] Incoming Cookies:`, req.headers.cookie);
    next();
});



app.use(
    session({
        name: "sid",
        secret: process.env.SESSION_SECRET || "secret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URI,
            collectionName: "sessions", // Optional, defaults to "sessions"
        }),
        proxy: true, // Important for Render/Heroku (behind load balancer)
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" ? true : false, // REQUIRED (HTTPS)
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // REQUIRED (cross-site)
            maxAge: 24 * 60 * 60 * 1000,
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
app.use("/api/domains", domainRoutes);
app.use("/", caddyRoutes); // Validation endpoint for Caddy's 'ask' directive
app.get("/", (req, res) => {
    res.send("calender server running!");
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
