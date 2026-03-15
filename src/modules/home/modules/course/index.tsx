/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Loader } from "lucide-react";
import { BlogService } from "@/services/blog";
import { HELPER } from "@/utils/helper";
import { CourseService } from "@/services/course";
import { ModalCreateCourse } from "./components/modal.create";
import { ModalUpdateCourse } from "./components/modal.update";

export interface Blog {
  _id: string;
  title: string;
  thumbnail: string;
  content: string;
  facebook: string;
  twitter: string;
  instagram: string;
  author_id: string;
  author_name: string;
  created_at: string;
}

export default function Course() {
  const COUNT = 6;

  const [data, setData] = useState<Blog[]>([] as any);
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

  const init = async () => {
    try {
      const res = await CourseService.getAll();

      if (Array.isArray(res) && res.length > 0) {
        setData(res);
        setTotalPage(Math.ceil(res.length / COUNT));
        setCurrenPage(1);
        setCurrenData(res.slice(0, COUNT));
        setIsLoading(false);
      } else {
        setData([]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
      setData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {}, [totalPage, isLoading, currenData, currenPage]);

  return (
    <section className="p-4">
      <div className="relative overflow-hidden">
        <div className="flex">
          <div className="flex items-start flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                DANH SÁCH KHÓA HỌC ({data?.length})
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalCreateCourse />
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-md text-gray-700 uppercase bg-gray-50 border dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="w-64 px-4 py-3">
                  KHÓA HỌC
                </th>
                <th scope="col" className="w-80 px-4 py-3">
                  MÔ TẢ
                </th>
                <th scope="col" className="w-48 px-4 py-3">
                  GIÁO VIÊN
                </th>
                <th scope="col" className="w-40 px-4 py-3">
                  MỤC TIÊU
                </th>
                <th scope="col" className="w-32 px-4 py-3">
                  THỜI GIAN
                </th>
                <th scope="col" className="w-32 px-4 py-3">
                  CHI TIẾT
                </th>
              </tr>
            </thead>
            <tbody>
              {currenData?.map((item: any, index: any) => {
                return (
                  <tr
                    key={index}
                    className={`${
                      item?.deleted_at ? "hidden" : ""
                    } border-b border-l border-r dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 `}
                  >
                    <td className="w-64 px-4 py-2">
                      <div className="flex items-center gap-3">
                        <Image
                          src={item?.thumbnail}
                          alt="img"
                          className="w-16 h-16 object-cover rounded-md"
                          width={64}
                          height={64}
                        />
                        <span className="text-[14px] line-clamp-2 text-gray-900 font-medium">
                          {item?.course_name}
                        </span>
                      </div>
                    </td>
                    <td className="w-80 px-4 py-2">
                      <span className="text-[14px] line-clamp-2 text-gray-700">
                        {item?.description || "Chưa có mô tả"}
                      </span>
                    </td>
                    <td className="w-48 px-4 py-2 line-clamp-3">
                      <div className="text-[14px] text-gray-900 line-clamp-3">
                        <div className="font-medium">{item?.teacher_name}</div>
                        {item?.input_score && item?.output_score && (
                          <div className="text-xs text-gray-600 mt-1">
                            {item?.input_score} → {item?.output_score}
                          </div>
                        )}
                        {item?.duration && (
                          <div className="text-xs text-gray-600">
                            {item?.duration}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="w-40 px-4 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] text-gray-900 line-clamp-2">
                          {item?.input_score} <ArrowRight size={16} />{" "}
                          {item?.output_score}
                        </span>
                      </div>
                    </td>
                    <td className="w-32 px-4 py-2">
                      <span className="text-[14px] line-clamp-2 text-gray-900">
                        {item?.duration || "Chưa có"}
                      </span>
                    </td>
                    <td className="w-32 px-4 py-2">
                      <ModalUpdateCourse data={item} />
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
              Không tìm thấy bài viết nào.
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
                        className={`${
                          item === currenPage ? "bg-orange-100" : "bg-white"
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
