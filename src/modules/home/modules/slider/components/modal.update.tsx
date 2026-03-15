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
import { Loader, PenLine, Plus } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "@/styles/hide-scroll.css";
import { SliderService } from "@/services/sliders";
import "@/styles/hide-scroll.css";

export function ModalUpdateSlider({ data }: { data: any }) {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(
    data?.image || null
  );
  const [description, setDescription] = useState<string>(
    data?.description || ""
  );
  const [order, setOrder] = useState<number>(data?.order_index || 0);
  const currentDate = new Date();
  const [eventTime, setEventTime] = useState<string>(
    data?.event_time || currentDate.toISOString().split("T")[0]
  );

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
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
    if (!mainPreview) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn hình ảnh.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      let imageUrl = data?.image || "";

      if (mainPreview !== data?.image) {
        const uploadMainImage: any = await UploadService.uploadToCloudinary([
          mainPreview,
        ]);
        imageUrl = uploadMainImage[0]?.url || "";
      }

      const body = {
        image: imageUrl,
        description: description,
        event_time: eventTime,
        order_index: order,
      };

      const res = await SliderService.updateSlider(data?._id, body);
      setIsLoading(false);

      toast({
        title: "Cập nhật thành công!",
        description: "Slider đã được cập nhật.",
      });

      window.location.href = "/?tab=slider";
    } catch (error) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Lỗi!",
        description: "Không thể cập nhật slider. Vui lòng thử lại.",
      });
    }
  };

  useEffect(() => {
    setMainPreview(data?.image || null);
    setDescription(data?.description || "");
    setEventTime(data?.event_time || "");
  }, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="justify-center items-center px-3 py-3 rounded-full flex text-sm font-medium text-white bg-orange-700"
        >
          <PenLine size={20} className="" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm hình ảnh mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Tải lên hình ảnh và nhấn{" "}
              <strong className="text-orange-700">Lưu</strong> để chèn hình ảnh
              mới vào slider.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-8 max-h-[70vh] overflow-y-auto scroll-bar-style">
          <div className="col-span-1">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Hình ảnh
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
            <div className="flex flex-col justify-start items-start gap-2 z-40">
              <Label htmlFor="description" className="text-[16px]">
                Mô tả
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả"
                  className="col-span-3 p-2 border rounded"
                ></textarea>
              </div>
            </div>{" "}
            {/* <div className="flex flex-col justify-start items-start gap-2 z-40">
              <Label htmlFor="description" className="text-[16px]">
                Thứ tự
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="order"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  placeholder="Thứ tự"
                  className="col-span-3 p-2 border rounded"
                ></textarea>
              </div>
            </div>{" "} */}
            <div className="relative flex flex-col justify-start items-start gap-2 mt-4">
              <Label htmlFor="event-time" className="text-[16px]">
                Thời gian sự kiện
              </Label>
              <div className="w-full grid items-center gap-4 z-50">
                <input
                  type="date"
                  id="event-time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  placeholder="Thời gian sự kiện"
                  className="col-span-3 p-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
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
            Lưu
            {isLoading && <Loader className="animate-spin" size={48} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
