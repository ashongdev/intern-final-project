import cors from "cors";
import { config } from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoute";

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

app.use("/api", authRoutes);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
	console.log(`Listening to PORT ${PORT}`);
});
