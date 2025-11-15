import axios from "axios";

const api = axios.create({
  baseURL: "https://saer.pk/api",
});

export const getPost = () => {
  return api.get("/branches/");
};

export default api;