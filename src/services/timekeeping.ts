import { API } from "@/utils/api";

const getAll = async () => {
  try {
    const response = await fetch(API.GET_ALL_TEACHER, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    return data.data;
  } catch (error: any) {
    console.error("========= Error Get All Sliders:", error);
    return false;
  }
};

const getStatisticById = async (id: string) => {
  try {
    const response = await fetch(`${API.GET_STATISTIC_BY_ID}/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    return data.data;
  } catch (error: any) {
    console.error("========= Error Get Statistic:", error);
    return false;
  }
};

const createTeacher = async (payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(API.CREATE_TEACHER, {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Create Slider:", error);
    return false;
  }
};

const updateTeacher = async (id: string, payload: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const response = await fetch(`${API.UPDATE_TEACHER}/${id}`, {
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
    console.error("========= Error Create Slider:", error);
    return false;
  }
};

const deleteTeacher = async (id: any) => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const response = await fetch(`${API.DELETE_TEACHER}/${id}`, {
      method: "DELETE",
      headers: myHeaders,
      redirect: "follow",
      body: JSON.stringify({}),
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    return true;
  } catch (error: any) {
    console.error("========= Error Delete Slider:", error);
    return false;
  }
};

const getStatisticByDay = async () => {
  try {
    const response = await fetch(API.GET_STATISTIC_BY_DAY, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    return data.data;
  } catch (error: any) {
    console.error("========= Error Get All Sliders:", error);
    return false;
  }
};

const getStatisticByMonth = async (month: number) => {
  try {
    const response = await fetch(`${API.GET_STATISTIC_BY_MONTH}/${month}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Failed - Status: ${response.status}`);
    }
    const data = await response.json();

    return data.data;
  } catch (error: any) {
    console.error("========= Error Get All Sliders:", error);
    return false;
  }
};

const exportAllStatistics = async () => {
  try {
    const allTeachers = await getAll();
    if (!allTeachers) {
      throw new Error("Failed to get teachers");
    }

    const monthlyStats = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = await getStatisticByMonth(month);
      monthlyStats.push({
        month,
        data: monthData || [],
      });
    }

    const dailyStats = await getStatisticByDay();

    const teacherDetailedData = [];
    for (const teacher of allTeachers) {
      const detailedRecords = await getStatisticById(teacher._id);
      teacherDetailedData.push({
        teacherId: teacher._id,
        teacherName: teacher.teacher_name,
        records: detailedRecords || [],
      });
    }

    return {
      teachers: allTeachers,
      monthlyStats,
      dailyStats: dailyStats || [],
      teacherDetailedData,
    };
  } catch (error: any) {
    console.error("========= Error Export All Statistics:", error);
    return false;
  }
};

export const TimekeepingService = {
  getAll,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getStatisticByDay,
  getStatisticByMonth,
  getStatisticById,
  exportAllStatistics,
};
