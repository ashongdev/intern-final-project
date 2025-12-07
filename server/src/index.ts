import cors from "cors";
import { config } from "dotenv";
import express from "express";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoute";
import studentRoutes from "./routes/studentRoute";

config({ quiet: true });

const app = express();
app.use(express.json());

app.use(
	cors({
		credentials: true,
		methods: ["GET", "OPTIONS", "POST"],
		origin: "http://localhost:8080",
	})
);

app.use((req, _, next) => {
	console.log(`${req.method} | ${req.path}`);
	next();
});

app.use("/api", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
	console.log(`Listening to PORT ${PORT}`);
});
