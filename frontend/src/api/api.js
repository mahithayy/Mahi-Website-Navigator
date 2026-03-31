import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("http://localhost:5000/upload", formData);
  return res.data;
};

export const checkIframeAllowed = async (url) => {
  const res = await axios.get(`http://localhost:5000/check-frame?url=${encodeURIComponent(url)}`);
  // Return the full object so the frontend can check offline status and HTTP codes
  return res.data;
};