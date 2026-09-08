/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BannerService } from "@/services/banner";
import { UploadService } from "@/services/upload";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BannerCard, CardEditor } from "./components/card.editor";

interface BannerData {
  eyebrow: string;
  title: string;
  subtitle: string;
  primary_cta_label: string;
  primary_cta_url: string;
  video_cta_label: string;
  video_url: string;
  cards: BannerCard[];
}

const EMPTY_BANNER: BannerData = {
  eyebrow: "",
  title: "",
  subtitle: "",
  primary_cta_label: "",
  primary_cta_url: "",
  video_cta_label: "",
  video_url: "",
  cards: [],
};

const EMPTY_CARD: BannerCard = {
  badge: "",
  theme: "orange",
  title: "",
  description: "",
  tags: [],
  images: [],
};

export default function Banner() {
  const { toast } = useToast();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<BannerData>(EMPTY_BANNER);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);

  const init = async () => {
    try {
      const res = await BannerService.get();
      if (res) {
        setData({
          ...EMPTY_BANNER,
          ...res,
          cards: Array.isArray(res.cards) ? res.cards : [],
        });
      }
    } catch (error) {
      console.error("Error fetching banner data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const patch = (value: Partial<BannerData>) =>
    setData((prev) => ({ ...prev, ...value }));

  const handleVideoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ variant: "destructive", title: "Vui lòng chọn file video." });
      return;
    }

    setIsUploadingVideo(true);
    try {
      const uploaded: any = await UploadService.uploadToCloudinaryVideo([file]);
      const url = Array.isArray(uploaded) ? uploaded[0]?.url : "";
      if (!url) throw new Error("Upload failed");
      patch({ video_url: url });
      toast({ title: "Thành công", description: "Đã tải video lên." });
    } catch (error) {
      console.error("Error uploading banner video:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể tải video lên. Vui lòng thử lại.",
      });
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const validateForm = () => {
    if (!data.title.trim()) {
      toast({ variant: "destructive", title: "Vui lòng nhập tiêu đề chính." });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const res = await BannerService.updateBanner(data);
      if (!res) throw new Error("Update failed");
      toast({
        title: "Thành công",
        description: "Đã cập nhật banner trang chủ.",
      });
    } catch (error) {
      console.error("Error updating banner:", error);
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Không thể cập nhật banner. Vui lòng thử lại.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center pt-60">
        <Loader className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <section className="p-4">
      <div className="flex items-center">
        <div className="flex flex-1 items-start">
          <h5>
            <span className="text-[20px] font-bold text-gray-800">
              BANNER TRANG CHỦ
            </span>
          </h5>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="!px-10 !text-[16px]"
        >
          Lưu
          {isSaving && <Loader className="ml-2 animate-spin" size={16} />}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="rounded-lg border border-gray-300 p-5">
          <h6 className="text-[16px] font-bold text-gray-800">
            Phần tiêu đề
          </h6>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">Tiêu đề nhỏ (phía trên)</Label>
            <input
              value={data.eyebrow}
              onChange={(e) => patch({ eyebrow: e.target.value })}
              placeholder="Trung Tâm Ngoại Ngữ IELTS VIỆT"
              className="w-full rounded border p-2"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">Tiêu đề chính</Label>
            <textarea
              value={data.title}
              onChange={(e) => patch({ title: e.target.value })}
              rows={2}
              className="w-full rounded border p-2"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">Mô tả</Label>
            <textarea
              value={data.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
              rows={3}
              className="w-full rounded border p-2"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label className="text-[16px]">Nút chính - chữ hiển thị</Label>
              <input
                value={data.primary_cta_label}
                onChange={(e) => patch({ primary_cta_label: e.target.value })}
                placeholder="Khám phá ngay"
                className="w-full rounded border p-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-[16px]">Nút chính - đường dẫn</Label>
              <input
                value={data.primary_cta_url}
                onChange={(e) => patch({ primary_cta_url: e.target.value })}
                placeholder="https://..."
                className="w-full rounded border p-2"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-300 p-5">
          <h6 className="text-[16px] font-bold text-gray-800">
            Video giới thiệu
          </h6>
          <p className="mt-1 text-xs text-gray-500">
            Để trống video ở đây thì trang chủ sẽ dùng các video đang bật ở mục
            Video.
          </p>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">Chữ hiển thị của nút video</Label>
            <input
              value={data.video_cta_label}
              onChange={(e) => patch({ video_cta_label: e.target.value })}
              placeholder="Video giới thiệu"
              className="w-full rounded border p-2 lg:w-1/2"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">Video</Label>
            {data.video_url && (
              <div className="flex flex-col gap-2 lg:w-1/2">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  src={data.video_url}
                  controls
                  className="h-60 w-full rounded-md bg-black"
                />
                <button
                  type="button"
                  onClick={() => patch({ video_url: "" })}
                  className="flex items-center gap-1 text-sm text-red-600 hover:underline"
                >
                  <Trash2 size={16} /> Gỡ video
                </button>
              </div>
            )}
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoChange}
              accept="video/*"
              className="hidden"
            />
            <div
              onClick={() => !isUploadingVideo && videoInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-6 text-sm font-medium text-gray-900 hover:bg-gray-50 lg:w-1/2"
            >
              {isUploadingVideo ? (
                <>
                  <Loader className="animate-spin" size={16} /> Đang tải lên...
                </>
              ) : (
                <>
                  <Plus size={16} />{" "}
                  {data.video_url ? "Thay đổi video" : "Tải video lên"}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label className="text-[16px]">
              Hoặc dán trực tiếp đường dẫn video
            </Label>
            <input
              value={data.video_url}
              onChange={(e) => patch({ video_url: e.target.value })}
              placeholder="https://..."
              className="w-full rounded border p-2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <h6 className="flex-1 text-[16px] font-bold text-gray-800">
              Các card ({data.cards.length})
            </h6>
            <button
              type="button"
              onClick={() =>
                patch({ cards: [...data.cards, { ...EMPTY_CARD, tags: [], images: [] }] })
              }
              className="flex items-center justify-center rounded-lg bg-orange-700 px-4 py-2 text-sm font-medium text-white"
            >
              <Plus size={16} className="mr-2" /> Thêm card
            </button>
          </div>

          {data.cards.map((card, index) => (
            <CardEditor
              key={index}
              index={index}
              card={card}
              onChange={(next) =>
                patch({
                  cards: data.cards.map((item, i) => (i === index ? next : item)),
                })
              }
              onRemove={() =>
                patch({ cards: data.cards.filter((_, i) => i !== index) })
              }
            />
          ))}
        </div>

        <div className="flex justify-end pb-10">
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="!px-10 !text-[16px]"
          >
            Lưu
            {isSaving && <Loader className="ml-2 animate-spin" size={16} />}
          </Button>
        </div>
      </div>
    </section>
  );
}
