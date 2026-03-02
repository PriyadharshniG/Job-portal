import axios from "axios";

const config = { withCredentials: true };

export const getAllHandler = async (url) => {
    const res = await axios.get(url, config);
    return res.data;
};

export const getSingleHandler = async (url) => {
    const res = await axios.get(url, config);
    return res?.data?.result;
};

export const postHandler = async ({ url, body }) => {
    return await axios.post(url, body, config);
};

export const updateHandler = async ({ url, body }) => {
    const res = await axios.patch(url, body, config);
    return res?.data?.result;
};

export const updateHandlerPut = async ({ url, body }) => {
    return await axios.put(url, body, config);
};

export const deleteHandler = async (url) => {
    return await axios.delete(url, config);
};
