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

const app = express();

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
// Request Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Debugging Middleware for Cookies
app.use((req, res, next) => {
    console.log("===== INCOMING REQUEST =====");
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Origin:", req.headers.origin);
    console.log("Host:", req.headers.host);
    console.log("X-Forwarded-Proto:", req.headers["x-forwarded-proto"]);
    console.log("X-Forwarded-For:", req.headers["x-forwarded-for"]);
    console.log("Cookies:", req.headers.cookie);
    console.log("================================");
    next();
});


const corsOptions = {
    origin: function (origin, callback) {
        console.log("[CORS] Incoming origin:", origin);

        const allowedOrigin = "https://appointment.equartistech.com";

        if (!origin) {
            console.log("[CORS] No origin — allowing (server-to-server)");
            return callback(null, true);
        }

        if (origin === allowedOrigin) {
            console.log("[CORS] Origin allowed");
            return callback(null, true);
        }

        console.error("[CORS] Origin BLOCKED:", origin);
        return callback(new Error("CORS origin denied"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("trust proxy", 1);

const isProduction =
    process.env.NODE_ENV === "production" || process.env.RENDER !== undefined;
console.log("Session Config - isProduction:", isProduction);

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
