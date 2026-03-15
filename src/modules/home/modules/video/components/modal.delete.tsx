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
import { Loader, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import "@/styles/hide-scroll.css";
import { SliderService } from "@/services/sliders";
import Image from "next/image";
import { Label } from "@radix-ui/react-label";
import { VideoService } from "@/services/video";

export function ModalDeleteSlider({
  data,
}: {
  data: any;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);

  useEffect(() => {
    setMainPreview(data.video || null);
  }, [data.video]);

  const handleDelete = async () => {
    setIsLoading(true);

    await VideoService.deleteVideo(data._id);
    setIsLoading(false);

    window.location.href = "/?tab=video";
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
            <span className="!text-[20px]">Xác nhận xóa video</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Bạn chắn chắn muốn xóa video này. Hãy nhấn{" "}
              <strong className="text-orange-700">Xóa</strong> để xóa video
              đã chọn.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-8 max-h-[60vh] overflow-y-auto scroll-bar-style">
          <div className="col-span-1">
            <div className="mb-6">

              <div className="mt-2">
                <input
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                />
                {mainPreview && (
                  <div className="mt-2 relative">
                    <video
                      className="h-[370px] w-full rounded-lg object-contain object-center"
                      controls
                      autoPlay={false}
                      muted
                    >
                      <source src={mainPreview} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    {/* <div
                      onClick={handleUpdateMainImage}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-3 mt-5 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-500">
                          Thay đổi video
                        </span>
                      </div>
                    </div> */}
                  </div>
                )}
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
