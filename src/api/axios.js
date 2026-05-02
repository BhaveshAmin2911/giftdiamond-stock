import axios from "axios";

const api = axios.create({
  baseURL: "https://giftdiamond.in/api",
});

/* Attach token automatically */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("daj-token");

  if (token) {
    config.headers.Authorization = token;
  }

  return config;
});

/* Auto logout if unauthorized */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;