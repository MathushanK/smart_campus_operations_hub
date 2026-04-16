const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const browserHost =
  typeof window !== "undefined" && window.location.hostname
    ? window.location.hostname
    : "localhost";

const browserProtocol =
  typeof window !== "undefined" && window.location.protocol === "https:"
    ? "https:"
    : "http:";

const fallbackApiBaseUrl = `${browserProtocol}//${browserHost}:8080/api/v1`;

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || fallbackApiBaseUrl
);

export const OAUTH_LOGIN_URL = `${API_BASE_URL}/oauth2/authorization/google`;
export const LOGOUT_URL = `${API_BASE_URL}/logout`;
