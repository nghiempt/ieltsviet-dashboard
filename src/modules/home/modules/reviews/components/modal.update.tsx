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
import { ReviewService } from "@/services/review";
import { DATA } from "@/utils/data";

export function ModalUpdateReview({ data }: { data: any }) {
  const { toast } = useToast();

  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState<boolean>(false);

  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<string>("");
  const [overall, setOverall] = useState<string>("");
  const [school, setSchool] = useState<string>("");

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
        title: "Vui lòng chọn hình ảnh chính",
      });
      return false;
    }

    if (!name.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tiêu đề",
      });
      return false;
    }

    if (!comment.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập nội dung",
      });
      return false;
    }

    if (!overall.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên tác giả",
      });
      return false;
    }

    if (
      isNaN(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5 ||
      (Number(rating) * 10) % 1 !== 0
    ) {
      toast({
        variant: "destructive",
        title:
          "Vui lòng nhập đánh giá từ 1 đến 5, chỉ chấp nhận 1 chữ số thập phân.",
      });
      return false;
    }

    if (!school.trim()) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên tác giả",
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
      name: name,
      comment: comment,
      rating: rating,
      overall: overall,
      school: school,
      avatar: uploadMainImage[0]?.url || "",
    };
    await ReviewService.updateReview(data?._id, body);
    setIsLoading(false);

    window.location.href = "/?tab=reviews";
  };

  const handleDelete = async () => {
    setIsLoadingForDelete(true);
    await ReviewService.deleteReview(data?._id);
    setIsLoadingForDelete(false);
    window.location.href = "/?tab=reviews";
  };

  const updateDOM = () => {
    if (data) {
      setName(data?.name);
      setComment(data?.comment);
      setRating(data?.rating);
      setOverall(String(data?.overall));
      setSchool(data?.school);
      setMainPreview(data?.avatar);
    }
  };

  useEffect(() => {}, [data]);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={updateDOM}>
        <Button variant="outline">Chỉnh sửa</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Chỉnh sửa bài viết</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Chỉnh sửa thông tin bài viết và nhấn{" "}
              <strong className="text-orange-700">Cập nhật</strong> để lưu thông
              tin.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-1">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Hình chính
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
          <div className="flex flex-col justify-start items-start gap-2 col-span-2 overflow-auto h-screen max-h-[80vh] scroll-bar-style">
            <Label htmlFor="description" className="text-[16px]">
              Tên học viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="title"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên học viên"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="description" className="text-[16px] mt-2">
              Nội dung đánh giá
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nội dung đánh giá"
                className="col-span-3 p-2 border rounded h-32"
              ></textarea>
            </div>
            <Label htmlFor="description" className="text-[16px] mt-2">
              Đánh giá
            </Label>
            <div className="w-full grid items-center gap-4">
              <input
                id="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Đánh giá"
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <Label htmlFor="description" className="text-[16px] mt-2">
              Overall
            </Label>
            <div className="w-full grid items-center gap-4">
              <select
                id="overall"
                value={overall}
                onChange={(e) => setOverall(e.target.value)}
                className="col-span-3 p-2 border rounded"
              >
                <option value="" disabled>
                  Chọn điểm Overall IELTS
                </option>
                {DATA.IELTS_SCORES.map((item, index) => (
                  <option
                    key={index}
                    value={item.value}
                    selected={String(item.value) === overall}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <Label htmlFor="description" className="text-[16px] mt-2">
              Trường học
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Trường học"
                className="col-span-3 p-2 border rounded"
              ></textarea>
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
