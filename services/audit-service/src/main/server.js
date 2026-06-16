import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auditRoutes from "../presentation/routes/auditRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", auditRoutes);

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  console.log(`Audit Service rodando na porta ${PORT}`);
});