import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import trainingRoutes from "../presentation/routes/trainingRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/certificates", express.static(path.resolve("certificates")));
app.use("/trainings", trainingRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Training Service rodando na porta ${process.env.PORT}`);
});