const BASE_URL = "https://api.farmcode.io.vn/v1";
// const BASE_URL = 'http://localhost:8000/api/v1';

export const API = {
  //SLIDER
  GET_ALL_SLIDER: `${BASE_URL}/ielts-viet/slider`,
  CREATE_SLIDER: `${BASE_URL}/ielts-viet/slider`,
  UPDATE_SLIDER: `${BASE_URL}/ielts-viet/slider`,
  DELETE_SLIDER: `${BASE_URL}/ielts-viet/slider`,
  //VIDEO
  GET_ALL_VIDEO: `${BASE_URL}/ielts-viet/videos`,
  CREATE_VIDEO: `${BASE_URL}/ielts-viet/video`,
  UPDATE_VIDEO: `${BASE_URL}/ielts-viet/video`,
  DELETE_VIDEO: `${BASE_URL}/ielts-viet/video`,
  //BLOG
  GET_ALL_BLOG: `${BASE_URL}/ielts-viet/blog`,
  CREATE_BLOG: `${BASE_URL}/ielts-viet/blog`,
  UPDATE_BLOG: `${BASE_URL}/ielts-viet/blog`,
  DELETE_BLOG: `${BASE_URL}/ielts-viet/blog`,
  GET_BLOG_BY_ID: `${BASE_URL}/ielts-viet/blog`,
  //COURSE
  GET_ALL_COURSE: `${BASE_URL}/ielts-viet/courses`,
  CREATE_COURSE: `${BASE_URL}/ielts-viet/course`,
  UPDATE_COURSE: `${BASE_URL}/ielts-viet/course`,
  DELETE_COURSE: `${BASE_URL}/ielts-viet/course`,
  //REVIEWS
  GET_ALL_REVIEW: `${BASE_URL}/ielts-viet/review`,
  CREATE_REVIEW: `${BASE_URL}/ielts-viet/review`,
  UPDATE_REVIEW: `${BASE_URL}/ielts-viet/review`,
  DELETE_REVIEW: `${BASE_URL}/ielts-viet/review`,
  GET_REVIEW_BY_ID: `${BASE_URL}/ielts-viet/review`,
  //TIMEKEEPING
  GET_ALL_TEACHER: `${BASE_URL}/ielts-viet/account/`,
  GET_STATISTIC_BY_ID: `${BASE_URL}/ielts-viet/timekeeping`,
  CREATE_TEACHER: `${BASE_URL}/ielts-viet/account/`,
  UPDATE_TEACHER: `${BASE_URL}/ielts-viet/account`,
  DELETE_TEACHER: `${BASE_URL}/ielts-viet/account`,
  GET_STATISTIC_BY_DAY: `${BASE_URL}/ielts-viet/account/search-day`,
  GET_STATISTIC_BY_MONTH: `${BASE_URL}/ielts-viet/account/search-month`,
};
