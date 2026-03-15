const formatVND = (money: string) => {
  const number = Number(money);
  if (isNaN(number)) {
    return "Invalid number";
  }
  return number.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

const formatDate2 = (isoDate: string) => {
  const date = new Date(isoDate);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")!.value;
  const month = parts.find((part) => part.type === "month")!.value;
  const year = parts.find((part) => part.type === "year")!.value;
  const hours = parts.find((part) => part.type === "hour")!.value;
  const minutes = parts.find((part) => part.type === "minute")!.value;
  const seconds = parts.find((part) => part.type === "second")!.value;

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

const formatCurrentDate = (isoDate: string) => {
  const date = new Date(isoDate);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")!.value;
  const month = parts.find((part) => part.type === "month")!.value;
  const year = parts.find((part) => part.type === "year")!.value;

  return `${day}/${month}/${year}`;
};

const getTimekeepingStatus = (checkIn: string, checkOut: string) => {
  const ONE_HOUR_THIRTY_MINUTES = 90 * 60 * 1000;

  const checkInTime = new Date(checkIn).getTime();
  const checkOutTime = new Date(checkOut).getTime();
  const duration = checkOutTime - checkInTime;

  return duration < ONE_HOUR_THIRTY_MINUTES ? "Thiếu giờ" : "Đủ giờ";
};

const convertSpacesToDash = (input: string) => {
  return input.trim().replace(/\s+/g, "-");
};

const sanitizeContent = (html: string) => {
  return html.replace(/<img[^>]*>/g, "");
};

export const HELPER = {
  formatVND,
  formatDate,
  formatDate2,
  formatCurrentDate,
  convertSpacesToDash,
  sanitizeContent,
  getTimekeepingStatus,
};
