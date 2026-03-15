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
import { Loader, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import "@/styles/hide-scroll.css";
import { SliderService } from "@/services/sliders";
import Image from "next/image";
import { Label } from "@radix-ui/react-label";

export function ModalDeleteSlider({
  data,
  image,
}: {
  data: any;
  image: string;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [description, setDescription] = useState<string>(
    data.description || ""
  );

  const currentDate = new Date();
  const [eventTime, setEventTime] = useState<string>(
    data?.event_time || currentDate.toISOString().split("T")[0]
  );

  useEffect(() => {
    setMainPreview(data?.image || null);
    setDescription(data?.description || "");
    setEventTime(data?.event_time || "");
  }, [data]);

  const handleDelete = async () => {
    setIsLoading(true);

    await SliderService.deleteSlider(data._id);

    setIsLoading(false);

    window.location.href = "/?tab=slider";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-red-500 justify-center items-center px-3 py-3 rounded-full flex text-sm font-medium text-white"
        >
          <Trash2 size={20} color="white" />
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Xác nhận xóa hình ảnh</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Bạn chắn chắn muốn xóa hình ảnh này. Hãy nhấn{" "}
              <strong className="text-orange-700">Xóa</strong> để xóa hình ảnh
              đã chọn khỏi slider.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-8 max-h-[60vh] overflow-y-auto scroll-bar-style">
          <div className="col-span-1">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Hình ảnh
              </Label>
              {mainPreview ? (
                <Image
                  src={mainPreview}
                  alt="main-preview"
                  className="w-full h-96 object-cover rounded-md mt-2"
                  width={1000}
                  height={1000}
                />
              ) : (
                <div className="col-span-3 mt-2">
                  <div className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer">
                    <div className="flex flex-col items-center">
                      <span>Hình ảnh bị lỗi</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-start items-start gap-2 z-40">
              <Label htmlFor="description" className="text-[16px]">
                Mô tả
              </Label>
              <div className="w-full grid items-center gap-4">
                <textarea
                  id="description"
                  value={description}
                  disabled
                  placeholder="Mô tả"
                  className="col-span-3 p-2 border rounded"
                ></textarea>
              </div>
            </div>{" "}
            <div className="relative flex flex-col justify-start items-start gap-2 mt-4">
              <Label htmlFor="event-time" className="text-[16px]">
                Thời gian sự kiện
              </Label>
              <div className="w-full grid items-center gap-4 z-50">
                <input
                  type="date"
                  id="event-time"
                  value={eventTime}
                  disabled
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
            onClick={handleDelete}
            className="!px-10 !text-[16px] bg-red-500 hover:bg-red-600"
          >
            Xóa
            {isLoading && <Loader className="animate-spin" size={48} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
