import axios from "./axios";

export const get = (url) => axios.get(url).then(res => res.data);
export const post = (url, data) => axios.post(url, data).then(res => res.data);
export const put = (url, data) => axios.put(url, data).then(res => res.data);
export const del = (url) => axios.delete(url).then(res => res.data);
