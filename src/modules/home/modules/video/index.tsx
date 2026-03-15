/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Loader, Trash2 } from "lucide-react";
import { IMAGES } from "@/utils/image";
import { SliderService } from "@/services/sliders";
import Image from "next/image";
import { ModalCreateSlider } from "./components/modal.create";
import { ModalDeleteSlider } from "./components/modal.delete";
import { VideoService } from "@/services/video";
import { ModalUpdateVideo } from "./components/modal.update";

export default function Video() {
  const COUNT = 12;

  const [data, setData] = useState([] as any);
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

  const render = (data: any) => {
    setData(data);
    setTotalPage(Math.ceil(data.length / COUNT));
    setCurrenPage(1);
    setCurrenData(data.slice(0, COUNT));
  };

  const init = async () => {
    try {
      const res = await VideoService.getAll();

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
      console.error("Error fetching blog data:", error);
      setData([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => { }, [totalPage, isLoading, currenData, currenPage, data]);

  return (
    <section className="p-4">
      <div className="">
        <div className="flex">
          <div className="flex items-start flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                VIDEO TRANG CHỦ ({data?.length})
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalCreateSlider />
          </div>
        </div>
        {isLoading && data.length > 0 ? (
          <div className="w-full flex justify-center items-center pt-60">
            <Loader className="animate-spin" size={48} />
          </div>
        ) : (
          <nav
            className="flex flex-col items-start justify-center mt-2 space-y-3"
            aria-label="Table navigation"
          >
            {currenData.length > 0 ? (
              <div className="flex flex-col items-center justify-center gap-5 mt-2 space-y-3">
                <div className="grid grid-cols-4 gap-5 px-0">
                  {currenData?.map((item: any, index: any) => {
                    return (
                      <div key={index} className="relative group w-full h-52">
                        <div className="absolute top-0 left-0 right-0 bottom-0 group-hover:bg-black rounded-md opacity-25 z-0 transform duration-200"></div>
                        <div className="cursor-pointer absolute top-[40%] left-[33%] hidden group-hover:flex z-10 transform duration-200">
                          <ModalDeleteSlider data={item} />
                        </div>
                        <div className="cursor-pointer absolute top-[40%] right-[33%] hidden group-hover:flex z-10 transform duration-200">
                          <ModalUpdateVideo data={item} />
                        </div>
                        <video
                          className="h-full w-[500px] rounded-lg object-contain object-center"
                          controls
                          autoPlay={false}
                          muted
                        >
                          <source src={item.video} type="video/mp4" />
                        </video>
                      </div>
                    );
                  })}
                </div>
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
              </div>
            ) : (
              <div className="mt-40">
                {/* <Image
                  src={IMAGES.EMPTY}
                  alt="empty"
                  width={100}
                  height={100}
                /> */}
              </div>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
