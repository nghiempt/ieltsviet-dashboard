"use client";

import { Label } from "@/components/ui/label";
import { UploadService } from "@/services/upload";
import { Loader, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export interface BannerCard {
  badge: string;
  theme: "orange" | "blue";
  title: string;
  description: string;
  tags: string[];
  images: string[];
}

export function CardEditor({
  index,
  card,
  onChange,
  onRemove,
}: {
  index: number;
  card: BannerCard;
  onChange: (card: BannerCard) => void;
  onRemove: () => void;
}) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [tagDraft, setTagDraft] = useState<string>("");

  const patch = (value: Partial<BannerCard>) => onChange({ ...card, ...value });

  const handleAddImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const oversize = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversize) {
      alert("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const previews = await Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            })
        )
      );
      const uploaded: any = await UploadService.uploadToCloudinary(previews);
      const urls = Array.isArray(uploaded)
        ? uploaded.map((item: any) => item?.url).filter(Boolean)
        : [];
      patch({ images: [...card.images, ...urls] });
    } catch (error) {
      console.error("Error uploading banner images:", error);
      alert("Không thể tải hình lên. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    const tag = tagDraft.trim();
    if (!tag || card.tags.includes(tag)) {
      setTagDraft("");
      return;
    }
    patch({ tags: [...card.tags, tag] });
    setTagDraft("");
  };

  return (
    <div className="rounded-lg border border-gray-300 p-5">
      <div className="flex items-center justify-between">
        <h6 className="text-[16px] font-bold text-gray-800">
          Card {index + 1}
        </h6>
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center gap-1 text-sm text-red-600 hover:underline"
        >
          <Trash2 size={16} /> Xoá card
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label className="text-[16px]">Nhãn (badge)</Label>
          <input
            value={card.badge}
            onChange={(e) => patch({ badge: e.target.value })}
            placeholder="TIẾNG ANH"
            className="w-full rounded border p-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-[16px]">Màu hiển thị</Label>
          <select
            value={card.theme}
            onChange={(e) =>
              patch({ theme: e.target.value as BannerCard["theme"] })
            }
            className="w-full rounded border p-2 bg-white"
          >
            <option value="orange">Cam (tiếng Anh)</option>
            <option value="blue">Xanh (tiếng Hàn)</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-[16px]">Tiêu đề card</Label>
        <input
          value={card.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="IELTS & Giao Tiếp"
          className="w-full rounded border p-2"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-[16px]">Mô tả card</Label>
        <textarea
          value={card.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={4}
          className="w-full rounded border p-2"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-[16px]">Tags</Label>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
            >
              {tag}
              <button
                type="button"
                onClick={() =>
                  patch({ tags: card.tags.filter((item) => item !== tag) })
                }
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Nhập tag rồi nhấn Enter"
            className="flex-1 rounded border p-2"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="rounded-lg bg-gray-200 px-4 text-sm font-medium hover:bg-gray-300"
          >
            Thêm tag
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label className="text-[16px]">
          Hình ảnh slider ({card.images.length})
        </Label>
        <p className="text-xs text-gray-500">
          Các hình sẽ tự động chuyển đổi luân phiên mỗi 5 giây ở trang chủ.
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {card.images.map((image, imageIndex) => (
            <div key={`${image}-${imageIndex}`} className="group relative">
              <Image
                src={image}
                alt={`banner-${index}-${imageIndex}`}
                width={400}
                height={260}
                className="h-28 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  patch({
                    images: card.images.filter((_, i) => i !== imageIndex),
                  })
                }
                className="absolute right-1 top-1 hidden rounded-full bg-white p-1 text-red-600 shadow group-hover:block"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleAddImages}
          accept="image/*"
          multiple
          className="hidden"
        />
        <div
          onClick={() => !isUploading && imageInputRef.current?.click()}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-5 py-6 text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {isUploading ? (
            <>
              <Loader className="animate-spin" size={16} /> Đang tải lên...
            </>
          ) : (
            <>
              <Plus size={16} /> Thêm hình ảnh
            </>
          )}
        </div>
      </div>
    </div>
  );
}
