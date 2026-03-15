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
import { Loader, Plus, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import "@/styles/hide-scroll.css";
import { VideoService } from "@/services/video";

export function ModalCreateSlider() {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File quá lớn",
          description: "Vui lòng chọn file nhỏ hơn 50MB.",
        });
        return;
      }

      if (!file.type.includes("mp4")) {
        toast({
          variant: "destructive",
          title: "Định dạng không hợp lệ",
          description: "Vui lòng chọn file video MP4.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setMainPreview(reader.result as string);
          setVideoFile(file);
        } else {
          toast({
            variant: "destructive",
            title: "Lỗi",
            description: "Không thể đọc file video.",
          });
        }
      };
      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: "Đã xảy ra lỗi khi đọc file.",
        });
      };
      reader.readAsDataURL(file);
    },
    [toast]
  );

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpdateMainImage = () => {
    mainImageInputRef.current?.click();
  };

  const handleRemoveVideo = () => {
    setMainPreview(null);
    setVideoFile(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!mainPreview || !videoFile) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn video.",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const uploadMainImage: any = await UploadService.uploadToCloudinaryVideo([
        mainPreview,
      ]);

      const body = {
        video: uploadMainImage[0]?.secure_url || "",
        isDisplay: false,
      };
      await VideoService.createVideo(body);
      toast({
        title: "Thành công",
        description: "Video đã được thêm thành công.",
      });
      window.location.href = "/?tab=video";
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi lưu video.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-orange-700"
        >
          <Plus size={16} className="mr-2" /> Thêm Video
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm Video mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Tải lên Video và nhấn{" "}
              <strong className="text-orange-700">Lưu</strong> để chèn Video mới
              vào Trang chủ.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-1 gap-8 max-h-[70vh] overflow-y-auto scroll-bar-style">
          <div className="col-span-1">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Video
              </Label>
              <div className="mt-2">
                {!mainPreview && (
                  <div
                    onClick={handleUpdateMainImage}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed ${isDragging
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300"
                      } bg-white px-5 py-16 text-sm font-medium text-gray-900 hover:bg-gray-50 hover:text-primary-700 cursor-pointer`}
                  >
                    <div className="flex flex-col items-center">
                      <span>+ Tải video lên</span>
                      <span className="text-xs text-gray-500">
                        hoặc kéo thả file MP4 vào đây
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={mainImageInputRef}
                  onChange={handleMainImageChange}
                  accept="video/mp4"
                  className="hidden"
                />
                {mainPreview && (
                  <div className="mt-2 relative">
                    <video
                      className="h-full w-full rounded-lg object-contain object-center"
                      controls
                      autoPlay={false}
                      muted
                      onError={() => {
                        toast({
                          variant: "destructive",
                          title: "Lỗi",
                          description: "Không thể tải video để xem trước.",
                        });
                      }}
                    >
                      <source src={mainPreview} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <button
                      onClick={handleRemoveVideo}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      title="Xóa video"
                    >
                      <X size={16} />
                    </button>
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
            onClick={handleSubmit}
            className="!px-10 !text-[16px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                Đang lưu <Loader className="ml-2 animate-spin" size={16} />
              </>
            ) : (
              "Lưu"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
