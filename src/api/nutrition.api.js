// axios.js
import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:8000/api",
});

export const uploadFoodImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post("/nutrition/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export async function getNutritionHistory() {
  const res = await axios.get("/nutrition/history");
  return res.data;
}
