import * as dotenv from "dotenv";
dotenv.config();

export const CORE_URI = process.env.CORE_URI!;
export const GETSTREAM_KEY = process.env.GETSTREAM_KEY!;
export const GETSTREAM_SECRET = process.env.GETSTREAM_SECRET!;