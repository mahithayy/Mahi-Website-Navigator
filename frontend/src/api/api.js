import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("https://mahi-website-navigator.onrender.com/upload", formData);
  return res.data;
};

export const checkIframeAllowed = async (url) => {
  const res = await axios.get(`https://mahi-website-navigator.onrender.com/check-frame?url=${encodeURIComponent(url)}`);
  // Return the full object so the frontend can check offline status and HTTP codes
  return res.data;
};