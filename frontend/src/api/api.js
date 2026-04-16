import axios from "axios";
import { API_BASE_URL } from "../config/runtime";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔥 REQUIRED for OAuth session
});

export default API;
