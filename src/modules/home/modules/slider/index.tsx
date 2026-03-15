/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Loader, Trash2 } from "lucide-react";
import { IMAGES } from "@/utils/image";
import { SliderService } from "@/services/sliders";
import Image from "next/image";
import { ModalCreateSlider } from "./components/modal.create";
import { ModalDeleteSlider } from "./components/modal.delete";
import { ModalUpdateSlider } from "./components/modal.update";

export default function Slider() {
  const [data, setData] = useState([] as any);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSortingUp, setIsSortingUp] = useState<boolean>(false);
  const [isSortingDown, setIsSortingDown] = useState<boolean>(false);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currenPage, setCurrenPage] = useState<any>(1 as any);
  const [currenData, setCurrenData] = useState<any>([] as any);

  const init = async () => {
    try {
      const res = await SliderService.getAll();
      if (Array.isArray(res) && res.length > 0) {
        const sorted = [...res].sort(
          (a, b) => (a.order_index || 0) - (b.order_index || 0)
        );
        setData(sorted);
        setCurrenPage(1);
        setCurrenData(sorted);
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

  useEffect(() => {}, [totalPage, isLoading, currenData, currenPage, data]);

  const handleSortByDate = async (direction: "asc" | "desc") => {
    console.log("Sorting by date:", direction);

    // if (!currenData || currenData.length === 0) return;
    const sorted = [...currenData].sort((a, b) => {
      const dateA = new Date(a.event_time).getTime();
      const dateB = new Date(b.event_time).getTime();
      return direction === "asc" ? dateA - dateB : dateB - dateA;
    });
    setIsSortingUp(direction === "asc");
    setIsSortingDown(direction === "desc");
    const updated = await Promise.all(
      sorted.map(async (item, idx) => {
        const newOrder = idx + 1;
        if (item.order_index !== newOrder) {
          try {
            const res = await SliderService.updateSlider(item._id, {
              image: item.image,
              description: item.description,
              event_time: item.event_time,
              order_index: newOrder,
            });
          } catch (e) {
            console.error(
              "Failed to update order_index for slider",
              item._id,
              e
            );
          }
        }
        return { ...item, order_index: newOrder };
      })
    );
    setCurrenData(updated);
    setData(updated);
    setIsSortingUp(false);
    setIsSortingDown(false);
  };

  return (
    <section className="p-4">
      <div className="">
        <div className="flex">
          <div className="flex items-start flex-1">
            <h5>
              <span className="text-gray-800 text-[20px] font-bold">
                SLIDER TRANG CHỦ ({data?.length})
              </span>
            </h5>
          </div>
          <div className="flex flex-col flex-shrink-0 space-y-3 md:flex-row md:items-center lg:justify-end md:space-y-0 md:space-x-3">
            <ModalCreateSlider dataLength={data?.length} />
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm flex items-center gap-2"
            onClick={() => handleSortByDate("asc")}
            type="button"
          >
            Sắp xếp ngày{" "}
            {isSortingUp ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              "cũ nhất"
            )}
          </button>
          <button
            className="ml-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm flex items-center gap-2"
            onClick={() => handleSortByDate("desc")}
            type="button"
          >
            Sắp xếp ngày{" "}
            {isSortingDown ? (
              <Loader className="animate-spin" size={16} />
            ) : (
              "mới nhất"
            )}
          </button>
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
                      <div key={index} className="relative group w-full h-full">
                        <div className="cursor-pointer absolute top-[40%] left-[33%] hidden group-hover:flex z-10 transform duration-200">
                          <ModalDeleteSlider data={item} image={item.image} />
                        </div>
                        <div className="cursor-pointer absolute top-[40%] right-[33%] hidden group-hover:flex z-10 transform duration-200">
                          <ModalUpdateSlider data={item} />
                        </div>
                        <div>
                          <div className="w-full h-52 relative overflow-hidden rounded-md">
                            <div className="absolute top-0 left-0 right-0 bottom-0 group-hover:bg-black rounded-md opacity-25 z-0 transform duration-200"></div>
                            <Image
                              src={item?.image}
                              alt=""
                              width={1000}
                              height={1000}
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                          <div className="mt-1">
                            {/* <p className="text-sm text-black">
                              {item?.order_index}
                            </p> */}
                            <p className="text-sm text-black">
                              {item?.description
                                ? item?.description
                                : "<<Không có mô tả>>"}
                            </p>
                            <p className="text-sm text-black">
                              {item?.event_time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
