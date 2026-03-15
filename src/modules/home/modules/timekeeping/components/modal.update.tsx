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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UploadService } from "@/services/upload";
import { Loader, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "@/styles/hide-scroll.css";
import { TimekeepingService } from "@/services/timekeeping";

export function ModalUpdateTeacher({ data }: { data: any }) {
  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [loginCode, setLoginCode] = useState<string>("");

  const [isWorking, setIsWorking] = useState<boolean>(
    data?.work_status === "able"
  );
  const [isShow, setIsShow] = useState<boolean>(
    data?.show_status === "activate"
  );

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn file hình ảnh",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const validateForm = () => {
    if (!mainPreview || name === "") {
      toast({
        variant: "destructive",
        title: "Vui lòng điền đầy đủ thông tin",
      });
      return false;
    }

    const isValidLoginCode = /^\d{4}$/.test(loginCode);
    if (!isValidLoginCode) {
      toast({
        variant: "destructive",
        title: "Mã đăng nhập phải là 4 chữ số",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const uploadMainImage: any = await UploadService.uploadToCloudinary([
      mainPreview,
    ]);

    const body = {
      teacher_name: name,
      login_code: loginCode,
      teacher_avatar: uploadMainImage[0]?.url || "",
      work_status: isWorking ? "able" : "enable",
      show_status: isShow ? "activate" : "inactivate",
    };
    await TimekeepingService.updateTeacher(data?._id, body);
    setIsLoading(false);

    window.location.href = "/?tab=timekeeping";
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    await TimekeepingService.deleteTeacher(data?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=timekeeping";
  };

  const updateDOM = () => {
    if (data) {
      setName(data?.teacher_name);
      setLoginCode(data?.login_code);
      setMainPreview(data?.teacher_avatar);
      setIsWorking(data?.work_status === "able");
      setIsShow(data?.show_status === "activate");
    }
  };

  useEffect(() => {
    updateDOM();
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={updateDOM}>
        <Button variant="outline">Chi tiết</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[100vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa thông tin</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa thông tin giáo viên và nhấn{" "}
              <strong className="text-orange-700">Cập nhật</strong> để lưu thông
              tin.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Ảnh đại diện
              </Label>
              <div className="mt-2">
                {!mainPreview && (
                  <div
                    onClick={handleUpdateMainImage}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                  >
                    <div className="flex flex-col items-center">
                      <span>+ Tải hình lên</span>
                      <span className="text-xs text-gray-500">
                        hoặc kéo thả file vào đây
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {mainPreview && (
                  <div className="mt-2">
                    <Image
                      src={mainPreview}
                      alt="main-preview"
                      className="w-full h-96 object-cover rounded-md mt-2"
                      width={1000}
                      height={1000}
                    />
                    <div
                      onClick={handleUpdateMainImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-5 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">
                          Thay đổi hình ảnh
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-start items-start gap-2 col-span-2 overflow-auto h-full scroll-bar-style">
            <Label htmlFor="name" className="text-[16px]">
              Tên giáo viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên giáo viên"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="role" className="text-[16px] mt-2">
              Vai trò
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="role"
                value={data?.role}
                readOnly
                placeholder="Vai trò"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="loginCode" className="text-[16px] mt-2">
              Mã đăng nhập
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="loginCode"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="Mã đăng nhập"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="isShow" className="text-[16px] mt-2">
              Hiện tài khoản trên trang chính
            </Label>
            <input
              type="checkbox"
              id="isShow"
              className="switch ml-4"
              checked={isShow}
              onChange={(e) => setIsShow(e.target.checked)}
            />

            <Label htmlFor="neo-toggle" className="text-[16px] mt-2">
              Trạng thái hoạt động
            </Label>
            <div className="neo-toggle-container pl-4">
              <input
                className="neo-toggle-input"
                id="neo-toggle"
                type="checkbox"
                checked={isWorking}
                onChange={(e) => setIsWorking(e.target.checked)}
              />
              <label className="neo-toggle" htmlFor="neo-toggle">
                <div className="neo-track">
                  <div className="neo-background-layer"></div>
                  <div className="neo-grid-layer"></div>
                  <div className="neo-spectrum-analyzer">
                    <div className="neo-spectrum-bar"></div>
                    <div className="neo-spectrum-bar"></div>
                    <div className="neo-spectrum-bar"></div>
                    <div className="neo-spectrum-bar"></div>
                    <div className="neo-spectrum-bar"></div>
                  </div>
                  <div className="neo-track-highlight"></div>
                </div>

                <div className="neo-thumb">
                  <div className="neo-thumb-ring"></div>
                  <div className="neo-thumb-core">
                    <div className="neo-thumb-icon">
                      <div className="neo-thumb-wave"></div>
                      <div className="neo-thumb-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="neo-gesture-area"></div>

                <div className="neo-interaction-feedback">
                  <div className="neo-ripple"></div>
                  <div className="neo-progress-arc"></div>
                </div>

                <div className="neo-status">
                  <div className="neo-status-indicator">
                    <div className="neo-status-dot"></div>
                    <div className="neo-status-text"></div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter className="w-full !flex !flex-row !justify-between !items-center">
          <Button
            onClick={handleDelete}
            type="submit"
            className="!px-8 !text-[16px] bg-orange-700 hover:bg-orange-800"
          >
            <Trash2 />
            Xoá
            {isLoadingForDelete && (
              <Loader className="animate-spin" size={48} />
            )}
          </Button>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="!px-10 !text-[16px]"
              >
                Huỷ
              </Button>
            </DialogClose>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="!px-10 !text-[16px]"
            >
              Cập nhật
              {isLoading && <Loader className="animate-spin" size={48} />}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
