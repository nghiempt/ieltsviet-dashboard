"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import "@/styles/hide-scroll.css";
import { HELPER } from "@/utils/helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DateSelection from "@/components/ui/date-picker";
import { TimekeepingService } from "@/services/timekeeping";
import * as XLSX from "xlsx";

interface TimekeepingItem {
  _id: string;
  account_id: string;
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
}

export function ModalStatisticDay({
  data,
  teacherDay,
  teacherMonth,
}: {
  data: any;
  teacherDay: any;
  teacherMonth: any;
}) {
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear().toString();
  const currentDateISO = currentDate.toISOString().split("T")[0];

  const [statisticData, setStatisticData] = useState<TimekeepingItem[] | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);
  const [selectedDate, setSelectedDate] = useState<string>(currentDateISO);
  const [isDay, setIsDay] = useState<boolean>(true);
  const [statsDay, setStatsDay] = useState<{
    totalItems: number;
    lateItems: number;
    enoughItems: number;
  }>({ totalItems: 0, lateItems: 0, enoughItems: 0 });
  const [statsMonth, setStatsMonth] = useState<{
    totalItems: number;
    lateItems: number;
    enoughItems: number;
  }>({ totalItems: 0, lateItems: 0, enoughItems: 0 });
  const [currentDay, setCurrentDay] = useState<string>("");

  const init = async () => {
    try {
      const res = await TimekeepingService.getStatisticById(data._id);

      if (Array.isArray(res) && res.length > 0) {
        setStatisticData(res);
      } else {
        setStatisticData([]);
      }
    } catch (error) {
      console.error("Error fetching blog data:", error);
      setStatisticData([]);
    }
  };

  useEffect(() => {
    if (data?._id) {
      init();
    }
  }, [data?._id]);

  useEffect(() => {}, [statisticData]);

  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const years = Array.from(
    { length: Number(currentYear) - 2000 + 1 },
    (_, index) => (2000 + index).toString()
  );

  const calculateTimekeepingStats = (timekeeping: TimekeepingItem[]) => {
    const ONE_HOUR_THIRTY_MINUTES = 90 * 60 * 1000;

    return timekeeping.reduce(
      (acc, item) => {
        const checkInTime = new Date(item.check_in).getTime();
        const checkOutTime = new Date(item.check_out).getTime();
        const duration = checkOutTime - checkInTime;

        if (duration < ONE_HOUR_THIRTY_MINUTES) {
          acc.lateItems += 1;
        } else {
          acc.enoughItems += 1;
        }
        acc.totalItems += 1;

        return acc;
      },
      { totalItems: 0, lateItems: 0, enoughItems: 0 }
    );
  };

  const exportToExcel = (data: TimekeepingItem[], isDaily: boolean) => {
    const headers = isDaily
      ? ["STT", "Giờ check in", "Giờ check out", "Trạng thái"]
      : ["STT", "Ngày", "Giờ check in", "Giờ check out", "Trạng thái"];

    const rows = data.map((item, index) => {
      return isDaily
        ? {
            STT: index + 1,
            "Giờ check in": HELPER.formatDate2(item.check_in),
            "Giờ check out": HELPER.formatDate2(item.check_out),
            "Trạng thái": HELPER.getTimekeepingStatus(
              item.check_in,
              item.check_out
            ),
          }
        : {
            STT: index + 1,
            Ngày: HELPER.formatCurrentDate(item.created_at),
            "Giờ check in": HELPER.formatDate2(item.check_in),
            "Giờ check out": HELPER.formatDate2(item.check_out),
            "Trạng thái": HELPER.getTimekeepingStatus(
              item.check_in,
              item.check_out
            ),
          };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      isDaily ? "Daily" : "Monthly"
    );

    const filename = isDaily
      ? `${teacherDay.teacher_name}_ngày_${selectedDate}.xlsx`
      : `${teacherDay.teacher_name}_tháng_${selectedMonth}_${selectedYear}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  const handleExportDayExcel = () => {
    if (statisticData) {
      const filteredDayData = statisticData.filter((item) => {
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];
        return itemDate === selectedDate;
      });
      exportToExcel(filteredDayData, true);
    }
  };

  const handleExportMonthExcel = () => {
    if (statisticData) {
      const filteredMonthData = statisticData.filter((item) => {
        const itemDate = new Date(item.created_at);
        return (
          itemDate.getMonth() + 1 === Number(selectedMonth) &&
          itemDate.getFullYear().toString() === selectedYear
        );
      });
      exportToExcel(filteredMonthData, false);
    }
  };

  useEffect(() => {
    setCurrentDay(HELPER.formatCurrentDate(selectedDate));

    if (statisticData) {
      const filteredDayData = statisticData.filter((item) => {
        const itemDate = new Date(item.created_at).toISOString().split("T")[0];
        return itemDate === selectedDate;
      });
      const dayStats = calculateTimekeepingStats(filteredDayData);
      setStatsDay(dayStats);

      const filteredMonthData = statisticData.filter((item) => {
        const itemDate = new Date(item.created_at);
        return (
          itemDate.getMonth() + 1 === Number(selectedMonth) &&
          itemDate.getFullYear().toString() === selectedYear
        );
      });
      const monthStats = calculateTimekeepingStats(filteredMonthData);
      setStatsMonth(monthStats);
    }
  }, [statisticData, selectedDate, selectedMonth, selectedYear]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const newDate = new Date(date);
    setSelectedMonth((newDate.getMonth() + 1).toString());
    setSelectedYear(newDate.getFullYear().toString());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="">
          Xem thống kê
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isDay ? (
              <span className="!text-[20px]">Thống kê làm việc theo ngày</span>
            ) : (
              <span className="!text-[20px]">Thống kê làm việc theo tháng</span>
            )}
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Thông tin tổng số ca làm việc theo ngày và tháng
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row gap-3">
          <Button
            variant="outline"
            className={`${isDay ? "bg-gray-100" : "bg-white"} border-gray-300`}
            onClick={() => setIsDay(true)}
          >
            Thống kê ngày
          </Button>
          <Button
            variant="outline"
            className={`${!isDay ? "bg-gray-100" : "bg-white"} border-gray-300`}
            onClick={() => setIsDay(false)}
          >
            Thống kê tháng
          </Button>
        </div>

        {isDay && (
          <div className="grid grid-cols-1 gap-8 max-h-[60vh] overflow-y-auto scroll-bar-style">
            <div className="flex flex-col justify-start items-start gap-4">
              <div className="flex flex-row justify-start items-center gap-5 w-full mt-2">
                <Image
                  src={teacherDay?.teacher_avatar}
                  alt=""
                  width={1000}
                  height={1000}
                  className="w-20 h-20 object-cover rounded-full"
                />
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="font-semibold text-xl">
                    {teacherDay?.teacher_name}
                  </div>
                  <div className="font-semibold text-md text-gray-500">
                    {teacherDay?.role}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 font-bold">Bộ lọc</div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="w-full mb-0">
                <div className="mb-2 font-bold">
                  Thông tin số ca làm việc trong ngày {currentDay}
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-2 text-left">
                        Tổng số ca làm việc
                      </th>
                      <th className="border border-gray-200 text-green-600 p-2 text-left">
                        Số ca làm việc đủ giờ
                      </th>
                      <th className="border border-gray-200 text-red-600 p-2 text-left">
                        Số ca làm việc thiếu giờ
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-2">
                        {statsDay.totalItems}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {statsDay.enoughItems}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {statsDay.lateItems}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full">
                <div className="mb-3 flex flex-row justify-between items-center w-full">
                  <div className="mb-0 font-bold">
                    Thông tin chi tiết trong ngày {currentDay}
                  </div>
                  <Button
                    onClick={handleExportDayExcel}
                    variant="outline"
                    className="mb-0 border border-orange-700 hover:bg-orange-700 hover:text-white"
                  >
                    Xuất Excel
                  </Button>
                </div>
                <div className="w-full mb-5">
                  {statisticData && statisticData.length > 0 ? (
                    (() => {
                      const filteredData = statisticData.filter((item) => {
                        const itemDate = new Date(item.created_at)
                          .toISOString()
                          .split("T")[0];
                        return itemDate === selectedDate;
                      });
                      return filteredData.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-200 p-2 text-left">
                                STT
                              </th>
                              <th className="border border-gray-200 text-green-600 p-2 text-left">
                                Giờ check in
                              </th>
                              <th className="border border-gray-200 text-red-600 p-2 text-left">
                                Giờ check out
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredData.map((item, index) => (
                              <tr key={item._id}>
                                <td className="border border-gray-200 p-2">
                                  {index + 1}
                                </td>
                                <td className="border border-gray-200 p-2">
                                  {HELPER.formatDate2(item.check_in)}
                                </td>
                                <td className="border border-gray-200 p-2">
                                  {HELPER.formatDate2(item.check_out)}
                                </td>
                                <td
                                  className={`border border-gray-200 p-2 ${
                                    HELPER.getTimekeepingStatus(
                                      item.check_in,
                                      item.check_out
                                    ) === "Đủ giờ"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {HELPER.getTimekeepingStatus(
                                    item.check_in,
                                    item.check_out
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="w-full flex justify-center items-center text-gray-500">
                          Giáo viên chưa có ca làm việc trong ngày
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full flex justify-center items-center text-gray-500">
                      Giáo viên chưa có ca làm việc trong ngày
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isDay && (
          <div className="w-full grid grid-cols-1 gap-8">
            <div className="flex flex-col justify-start items-start gap-4 overflow-y-auto max-h-[60vh] scroll-bar-style">
              <div className="flex flex-row justify-start items-center gap-5 w-full mt-2">
                <Image
                  src={teacherMonth?.teacher_avatar}
                  alt=""
                  width={1000}
                  height={1000}
                  className="w-20 h-20 object-cover rounded-full"
                />
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="font-semibold text-xl">
                    {teacherMonth?.teacher_name}
                  </div>
                  <div className="font-semibold text-md text-gray-500">
                    {teacherMonth?.role}
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-2 font-bold">Bộ lọc</div>
                <div className="flex flex-row justify-start items-center gap-3 w-full mt-2">
                  <div>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn tháng" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem
                            key={index}
                            value={(index + 1).toString()}
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={selectedYear}
                      onValueChange={setSelectedYear}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn năm" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="w-full mb-0">
                <div className="mb-2 font-bold">
                  Thông tin số ca làm việc trong tháng {selectedMonth} năm{" "}
                  {selectedYear}
                </div>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-200 p-2 text-left">
                        Tổng số ca làm việc
                      </th>
                      <th className="border border-gray-200 text-green-600 p-2 text-left">
                        Số ca làm việc đủ giờ
                      </th>
                      <th className="border border-gray-200 text-red-600 p-2 text-left">
                        Số ca làm việc thiếu thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-2">
                        {statsMonth.totalItems}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {statsMonth.enoughItems}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {statsMonth.lateItems}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="w-full">
                <div className="flex flex-row justify-between items-center w-full mb-3">
                  <div className="mb-0 font-bold">
                    Thông tin chi tiết trong tháng {selectedMonth} năm{" "}
                    {selectedYear}
                  </div>
                  <Button
                    onClick={handleExportMonthExcel}
                    variant="outline"
                    className="mb-0 border border-orange-700 hover:bg-orange-700 hover:text-white"
                  >
                    Xuất Excel
                  </Button>
                </div>
                <div className="w-full mb-5">
                  {statisticData && statisticData.length > 0 ? (
                    (() => {
                      const filteredMonthData = statisticData.filter((item) => {
                        const itemDate = new Date(item.created_at);
                        return (
                          itemDate.getMonth() + 1 === Number(selectedMonth) &&
                          itemDate.getFullYear().toString() === selectedYear
                        );
                      });
                      return filteredMonthData.length > 0 ? (
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border border-gray-200 p-2 text-left">
                                STT
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                Ngày
                              </th>
                              <th className="border border-gray-200 text-green-600 p-2 text-left">
                                Giờ check in
                              </th>
                              <th className="border border-gray-200 text-red-600 p-2 text-left">
                                Giờ check out
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMonthData.map((item, index) => (
                              <tr key={item._id}>
                                <td className="border border-gray-200 p-2">
                                  {index + 1}
                                </td>
                                <td className="border border-gray-200 p-2">
                                  {HELPER.formatCurrentDate(item.created_at)}
                                </td>
                                <td className="border border-gray-200 p-2">
                                  {HELPER.formatDate2(item.check_in)}
                                </td>
                                <td className="border border-gray-200 p-2">
                                  {HELPER.formatDate2(item.check_out)}
                                </td>
                                <td
                                  className={`border border-gray-200 p-2 ${
                                    HELPER.getTimekeepingStatus(
                                      item.check_in,
                                      item.check_out
                                    ) === "Đủ giờ"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {HELPER.getTimekeepingStatus(
                                    item.check_in,
                                    item.check_out
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="w-full flex justify-center items-center text-gray-500">
                          Giáo viên chưa có ca làm việc trong tháng
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-full flex justify-center items-center text-gray-500">
                      Giáo viên chưa có ca làm việc trong tháng
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="w-full !flex !flex-row !justify-between !items-center">
          <div className="w-full flex flex-row justify-between gap-2">
            <div></div>

            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Đóng
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
