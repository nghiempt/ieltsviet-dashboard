import { API } from "@/utils/api";

const get = async () => {
  try {
    const response = await fetch(API.GET_BANNER, {
      method: "GET",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();
    return data.data;
  } catch (error: any) {
    console.error("========= Error Get Banner:", error);
    return false;
  }
};

const updateBanner = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(API.UPDATE_BANNER, {
      method: "PUT",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Update Banner:", error);
    return false;
  }
};

export const BannerService = {
  get,
  updateBanner,
};
