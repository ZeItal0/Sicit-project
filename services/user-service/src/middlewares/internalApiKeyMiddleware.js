import dotenv from "dotenv";

dotenv.config();

export function internalApiKeyMiddleware(req, res, next) {
  const apiKey = req.headers["x-internal-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({
      message: "Acesso interno não autorizado"
    });
  }

  next();
}