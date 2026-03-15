"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { TimekeepingService } from "@/services/timekeeping";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

interface StatMonth {
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

interface StatDay {
  _id: string;
  teacher_name: string;
  teacher_avatar: string;
  role: string;
  latest_datetime_check_in: string;
  latest_datetime_check_out: string;
  timekeeping: Array<{
    _id: string;
    account_id: string;
    check_in: string;
    check_out: string;
    status: string;
    created_at: string;
  }>;
}

interface TimekeepingRecord {
  _id: string;
  account_id: string;
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
}

interface TeacherDetailedData {
  teacherId: string;
  teacherName: string;
  records: TimekeepingRecord[];
}

export const ModalExportTimekeeping = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getMonthName = (month: number): string => {
    const months = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return months[month - 1];
  };

  const createMonthlySummaryData = (teacherName: string, monthData: StatMonth[], month: number) => {
    const teacher = monthData.find(t => t.teacher_name === teacherName);

    if (!teacher) {
      return [{
        "Tháng": getMonthName(month),
        "Tên Giáo Viên": teacherName,
        "Vai Trò": "N/A",
        "Tổng Ca Làm": 0,
        "Ca Đủ Giờ": 0,
        "Ca Lỗi": 0,
        "Check In Gần Nhất": "N/A",
        "Check Out Gần Nhất": "N/A"
      }];
    }

    return [{
      "Tháng": getMonthName(month),
      "Tên Giáo Viên": teacher.teacher_name,
      "Vai Trò": teacher.role,
      "Tổng Ca Làm": teacher.timekeeping?.total_shift || 0,
      "Ca Đủ Giờ": teacher.timekeeping?.enough_shift || 0,
      "Ca Lỗi": teacher.timekeeping?.error_shift || 0,
      "Check In Gần Nhất": teacher.latest_datetime_check_in || "N/A",
      "Check Out Gần Nhất": teacher.latest_datetime_check_out || "N/A"
    }];
  };

  const createMonthlyDetailedData = (teacherData: TeacherDetailedData, month: number, year: number) => {
    // Filter records by month and year
    const monthRecords = teacherData.records.filter(record => {
      const recordDate = new Date(record.created_at);
      return recordDate.getMonth() + 1 === month && recordDate.getFullYear() === year;
    });

    if (monthRecords.length === 0) {
      return [{
        "STT": 1,
        "Ngày": "Không có dữ liệu",
        "Giờ Check In": "N/A",
        "Giờ Check Out": "N/A",
        "Thời Gian Làm Việc": "N/A",
        "Trạng Thái": "N/A"
      }];
    }

    return monthRecords.map((record, index) => {
      const checkInTime = record.check_in ? new Date(record.check_in) : null;
      const checkOutTime = record.check_out ? new Date(record.check_out) : null;

      let workDuration = "N/A";
      let status = "Chưa hoàn thành";

      if (checkInTime && checkOutTime) {
        const durationMs = checkOutTime.getTime() - checkInTime.getTime();
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        workDuration = `${hours}h ${minutes}m`;

        // Consider 1.5 hours (90 minutes) as minimum working time
        if (durationMs >= 90 * 60 * 1000) {
          status = "Đủ giờ";
        } else {
          status = "Thiếu giờ";
        }
      }

      return {
        "STT": index + 1,
        "Ngày": new Date(record.created_at).toLocaleDateString("vi-VN"),
        "Giờ Check In": checkInTime ? checkInTime.toLocaleTimeString("vi-VN") : "N/A",
        "Giờ Check Out": checkOutTime ? checkOutTime.toLocaleTimeString("vi-VN") : "N/A",
        "Thời Gian Làm Việc": workDuration,
        "Trạng Thái": status
      };
    });
  };

  const createDailyExcelData = (teacherName: string, dailyData: StatDay[]) => {
    const teacher = dailyData.find(t => t.teacher_name === teacherName);

    if (!teacher || !teacher.timekeeping) {
      return [{
        "Tên Giáo Viên": teacherName,
        "Ngày": "Không có dữ liệu",
        "Check In": "N/A",
        "Check Out": "N/A",
        "Trạng Thái": "N/A"
      }];
    }

    return teacher.timekeeping.map(record => ({
      "Tên Giáo Viên": teacher.teacher_name,
      "Ngày": new Date(record.created_at).toLocaleDateString("vi-VN"),
      "Check In": record.check_in || "N/A",
      "Check Out": record.check_out || "N/A",
      "Trạng Thái": record.status || "N/A"
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      toast.loading("Đang xuất dữ liệu...", { id: "export-loading" });

      const exportData = await TimekeepingService.exportAllStatistics();

      if (!exportData) {
        throw new Error("Không thể lấy dữ liệu xuất");
      }

      const zip = new JSZip();
      const currentYear = new Date().getFullYear();

      // Create main folder
      const mainFolder = zip.folder(`Thong_Ke_Cham_Cong_${currentYear}`);

      if (!mainFolder) {
        throw new Error("Không thể tạo thư mục chính");
      }

      // Get unique teacher names
      const teacherNames: string[] = Array.from(new Set(exportData.teachers.map((t: any) => t.teacher_name as string)));

      for (const teacherName of teacherNames) {
        // Create teacher folder
        const teacherFolder = mainFolder.folder(teacherName.replace(/[/\\?%*:|"<>]/g, "-"));

        if (!teacherFolder) continue;

        // Create monthly statistics workbook for this teacher
        const monthlyWorkbook = XLSX.utils.book_new();

        // Get teacher detailed data
        const teacherDetailedData = exportData.teacherDetailedData.find((t: any) => t.teacherName === teacherName);

        // Add monthly data for each month
        for (let month = 1; month <= 12; month++) {
          const monthData = exportData.monthlyStats.find((m: any) => m.month === month)?.data || [];

          // Create summary data
          const summaryData = createMonthlySummaryData(teacherName, monthData, month);
          const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(monthlyWorkbook, summaryWorksheet, `${getMonthName(month)}_Tong_Quan`);

          // Create detailed data if available
          if (teacherDetailedData) {
            const detailedData = createMonthlyDetailedData(teacherDetailedData, month, currentYear);
            const detailedWorksheet = XLSX.utils.json_to_sheet(detailedData);
            XLSX.utils.book_append_sheet(monthlyWorkbook, detailedWorksheet, `${getMonthName(month)}_Chi_Tiet`);
          }
        }

        // Save monthly statistics Excel file
        const monthlyExcelBuffer = XLSX.write(monthlyWorkbook, { bookType: 'xlsx', type: 'array' });
        teacherFolder.file(`${teacherName}_Thong_Ke_Thang_${currentYear}.xlsx`, monthlyExcelBuffer);

        // Create daily statistics Excel file
        const dailyWorkbook = XLSX.utils.book_new();
        const dailyExcelData = createDailyExcelData(teacherName, exportData.dailyStats);
        const dailyWorksheet = XLSX.utils.json_to_sheet(dailyExcelData);
        XLSX.utils.book_append_sheet(dailyWorkbook, dailyWorksheet, "Chấm Công Ngày Hôm Nay");

        // Save daily statistics Excel file
        const dailyExcelBuffer = XLSX.write(dailyWorkbook, { bookType: 'xlsx', type: 'array' });
        teacherFolder.file(`${teacherName}_Cham_Cong_Hang_Ngay_${currentYear}.xlsx`, dailyExcelBuffer);
      }

      // Generate and download ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(zipBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Thong_Ke_Cham_Cong_Toan_Bo_${currentYear}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Xuất dữ liệu thành công!", { id: "export-loading" });
      setIsOpen(false);

    } catch (error) {
      console.error("Export error:", error);
      toast.error("Có lỗi xảy ra khi xuất dữ liệu!", { id: "export-loading" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 px-3 py-2 flex flex-row items-center justify-center rounded-md"
        >
          <Download className="w-4 h-4 mr-2" />
          <span className="text-sm">Xuất Thống Kê</span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Xuất Thống Kê Chấm Công</DialogTitle>
          <DialogDescription>
            Xuất toàn bộ dữ liệu chấm công của tất cả giáo viên bao gồm thống kê tổng quan và chi tiết từng tháng thành file Excel được nén trong thư mục ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              • <strong>Thống kê tháng:</strong> Tổng quan 12 tháng + Chi tiết từng ngày trong tháng
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Dữ liệu hàng ngày:</strong> Tất cả bản ghi chấm công chi tiết trong hôm nay
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Tổ chức:</strong> Mỗi giáo viên có thư mục riêng với 2 file Excel
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Định dạng:</strong> Excel (.xlsx) với nhiều sheet cho từng tháng
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isExporting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang Xuất...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-0" />
                Xuất Dữ Liệu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 