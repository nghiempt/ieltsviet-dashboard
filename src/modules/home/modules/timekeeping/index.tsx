/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { TimekeepingService } from "@/services/timekeeping";
import { HELPER } from "@/utils/helper";
import { ModalStatisticDay } from "./components/modal.day";
import { ModalCreateTeacher } from "./components/modal.create";
import { ModalUpdateTeacher } from "./components/modal.update";
import { ModalExportTimekeeping } from "./components/modal.export";

export interface Teacher {
  _id: string;
  teacher_name: string;
  teacher_avatar: string;
  role: string;
  login_code: string;
  latest_datetime_check_in: string;
  latest_datetime_check_out: string;
  latest_status: string;
  work_status: string;
  show_status: string;
}
export interface StatDay {
  _id: string;
  teacher_name: string;
  teacher_avatar: string;
  role: string;
  latest_datetime_check_in: string;
  latest_datetime_check_out: string;
  timekeeping: [
    {
      _id: string;
      account_id: string;
      check_in: string;
      check_out: string;
      status: string;
      created_at: string;
    }
  ];
}

export interface StatMonth {
  _id: string;
  teacher_name: string;
  teacher_avatar: string;
  role: string;
  latest_datetime_check_in: string;
  latest_datetime_check_out: string;
  timekeeping: {
    total_shift: number;
    enough_shift: number;
    error_shift: number;
  };
}

export default function Timekeeping() {
  const COUNT = 6;

  const [data, setData] = useState<Teacher[]>([] as any);
  const [dataStatDay, setDataStatDay] = useState<StatDay[]>([] as any);
  const [dataStatMonth, setDataStatMonth] = useState<StatMonth[]>([] as any);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currenPage, setCurrenPage] = useState<any>(1 as any);
  const [currenData, setCurrenData] = useState<any>([] as any);

  const selectPage = (pageSelected: any) => {
    setCurrenPage(pageSelected);
    const start = (pageSelected - 1) * COUNT;
    const end = pageSelected * COUNT;
    setCurrenData(data.slice(start, end));
  };

  const prevPage = () => {
    if (currenPage > 1) {
      selectPage(currenPage - 1);
    }
  };

  const nextPage = () => {
    if (currenPage < totalPage) {
      selectPage(currenPage + 1);
    }
  };

  const getStatDayById = (teacherId: string) => {
    return dataStatDay.find((stat) => stat._id === teacherId);
  };

  const getStatMonthById = (teacherId: string) => {
    return dataStatMonth.find((stat) => stat._id === teacherId);
  };

  const init = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;

      const res = await TimekeepingService.getAll();
      const statDay = await TimekeepingService.getStatisticByDay();
      const statMonth = await TimekeepingService.getStatisticByMonth(
        currentMonth
      );

      if (Array.isArray(res) && res.length > 0) {
        setData(res);
        setDataStatDay(statDay);
        setDataStatMonth(statMonth);
        setTotalPage(Math.ceil(res.length / COUNT));
        setCurrenPage(1);
        setCurrenData(res.slice(0, COUNT));
        setIsLoading(false);
      } else {
        setData([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
      setData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => { }, [totalPage, isLoading, currenData, currenPage]);

  return (
    <section className="p-4">
      <div className="relative overflow-hidden">
        <div className="flex">
          <div className="flex items-start flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                DANH SÁCH CHẤM CÔNG ({data?.length})
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalExportTimekeeping />
            <ModalCreateTeacher />
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table
            className={`w-full text-sm text-left text-gray-500 dark:text-gray-400`}
          >
            <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="w-64 px-4 py-3">
                  GIÁO VIÊN
                </th>
                <th scope="col" className="w-72 px-4 py-3">
                  TRẠNG THÁI LÀM VIỆC
                </th>
                <th scope="col" className="w-28 px-4 py-3">
                  GIỜ LÀM VIỆC
                </th>
                <th scope="col" className="w-28 px-4 py-3">
                  THÔNG TIN
                </th>
              </tr>
            </thead>
            <tbody>
              {currenData?.map((item: any, index: any) => {
                return (
                  <tr
                    key={index}
                    className={`${item?.deleted_at ? "hidden" : ""
                      } border-b border-l border-r dark:border-gray-600 ${item?.work_status === "able"
                        ? "!bg-white"
                        : "!bg-gray-300"
                      } hover:bg-gray-100 dark:hover:bg-gray-700`}
                  >
                    <td className="w-[85%] px-4 py-2 my-1 grid grid-cols-12 gap-3 items-center">
                      <Image
                        src={item?.teacher_avatar}
                        alt="img"
                        className="w-20 h-20 mr-3 object-cover rounded-md col-span-5"
                        width={100}
                        height={0}
                      />
                      <span className="col-span-7 text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                        {item?.teacher_name}
                      </span>
                    </td>

                    <td className="w-72 px-4 py-2">
                      <span className="text-[14px] line-clamp-2 bg-primary-100 text-gray-900 font-medium py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                        {item?.work_status === "able" ? (
                          <div className="flex items-center">
                            {item.latest_status === "checked-in" ? (
                              <>
                                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                <span>
                                  Đã check in lúc{" "}
                                  {HELPER.formatDate2(
                                    item.latest_datetime_check_out
                                  )}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                <span>
                                  Đã check out lúc{" "}
                                  {HELPER.formatDate2(
                                    item.latest_datetime_check_in
                                  )}
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <>
                              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                              <span>Dừng làm việc</span>
                            </>
                          </div>
                        )}
                      </span>
                    </td>
                    <td className="w-28 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white ">
                      <ModalStatisticDay
                        data={item}
                        teacherDay={getStatDayById(item._id)}
                        teacherMonth={getStatMonthById(item._id)}
                      />
                      {/* <div>
                        <ModalStatisticMonth
                          data={item}
                          teacher={getStatMonthById(item._id)}
                        />
                      </div> */}
                    </td>
                    <td className="w-28 text-[14px] px-4 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white ">
                      <ModalUpdateTeacher data={item} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {isLoading ? (
          <div className="w-full flex justify-center items-center pt-60">
            <Loader className="animate-spin" size={48} />
          </div>
        ) : currenData.length === 0 ? (
          <div className="col-span-2 text-center w-full flex justify-center items-center py-4">
            <p className="text-gray-500 text-lg">
              Không tìm thấy giáo viên nào.
            </p>
          </div>
        ) : (
          <nav
            className="flex flex-col items-start justify-center mt-4 p-4 space-y-3 md:flex-row md:items-center md:space-y-0"
            aria-label="Table navigation"
          >
            <ul className="inline-flex items-stretch -space-x-px">
              <li>
                <button
                  onClick={prevPage}
                  disabled={currenPage === 1}
                  className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
              {Array.from({ length: totalPage }, (_, i) => i + 1)?.map(
                (item: any, index: any) => {
                  return (
                    <li key={index} onClick={() => selectPage(item)}>
                      <a
                        href="#"
                        className={`${item === currenPage ? "bg-orange-100" : "bg-white"
                          } flex items-center justify-center px-3 py-2 text-sm leading-tight text-gray-500 border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white`}
                      >
                        {item}
                      </a>
                    </li>
                  );
                }
              )}
              <li>
                <button
                  onClick={nextPage}
                  disabled={currenPage === totalPage}
                  className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="w-5 h-5"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </section>
  );
}
