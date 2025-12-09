import cors from "cors";
// import Docxtemplater from "docxtemplater";
import { config } from "dotenv";
import express from "express";
// import fs from "fs";
// import PizZip from "pizzip";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoute";
import studentRoutes from "./routes/studentRoute";

config({ quiet: true });

const app = express();
app.use(express.json());

app.use(
	cors({
		credentials: true,
		methods: ["GET", "OPTIONS", "POST", "PUT"],
		origin: "http://localhost:8080",
	})
);

app.use((req, _, next) => {
	console.log(`${req.method} | ${req.path}`);
	next();
});

// app.get("/", (req, res) => {
// 	try {
// 		const content = fs.readFileSync(
// 			"./src/docs/letter_template.docx",
// 			"binary"
// 		);
// 		const zip = new PizZip(content);
// 		const doc = new Docxtemplater(zip);

// 		doc.setData({
// 			TITLE: "Mrs",
// 			DATE: "21st July, 2025",
// 			FIRSTNAME: "Abdallah",
// 			LASTNAME: "Ashong",
// 			LEVEL: "400",
// 			PROGRAM: "BSc. Information Technology",
// 			ORGANIZATION: "MTN Ghana",
// 			PHONE: "055 535 9339",
// 		});
// 		doc.render();
// 		const buffer = doc.getZip().generate({ type: "nodebuffer" });
// 		fs.writeFileSync("generated_letter.docx", buffer);

// 		res.json({ ok: true });
// 	} catch (error) {
// 		console.log("🚀 -----------------🚀");
// 		console.log("🚀 ~ error:", error);
// 		console.log("🚀 -----------------🚀");
// 	}
// });

app.use("/api", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
	console.log(`Listening to PORT ${PORT}`);
});
