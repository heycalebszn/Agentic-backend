import jwt from "jsonwebtoken";
import Token from "../models/token.model.js";

export const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET, { expiresIn: "7d" });

  await Token.create({ userId, token: refreshToken });

  return { accessToken, refreshToken };
};