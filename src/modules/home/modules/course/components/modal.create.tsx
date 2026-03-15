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
import { BlogService } from "@/services/blog";
import { UploadService } from "@/services/upload";
import { Edit, Loader, Plus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import BlogDescriptionEditor from "./quill";
import "@/styles/hide-scroll.css";
import { Input } from "@/components/ui/input";
import { CourseService } from "@/services/course";

export function ModalCreateCourse() {
  const { toast } = useToast();
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const teacherImageInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [teacherPreview, setTeacherPreview] = useState<string | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [inputScore, setInputScore] = useState<string>("");
  const [outputScore, setOutputScore] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [commission, setCommission] = useState<string[]>([]);
  const [newCommission, setNewCommission] = useState<string>("");
  const [editCommissionIndex, setEditCommissionIndex] = useState<number | null>(null);
  const [studyTime, setStudyTime] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [teacherName, setTeacherName] = useState<string>("");
  const [students, setStudents] = useState<number>(0);
  const [lessons, setLessons] = useState<number>(0);


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

  const handleAddCommission = () => {
    if (!newCommission.trim()) {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: "Vui lòng nhập nội dung cam kết",
      });
      return;
    }
    if (editCommissionIndex !== null) {
      const updatedCommissions = [...commission];
      updatedCommissions[editCommissionIndex] = newCommission;
      setCommission(updatedCommissions);
      setEditCommissionIndex(null);
    } else {
      setCommission([...commission, newCommission]);
    }
    setNewCommission("");
  };

  const handleEditCommission = (index: number) => {
    setNewCommission(commission[index]);
    setEditCommissionIndex(index);
  };

  const handleDeleteCommission = (index: number) => {
    setCommission(commission.filter((_, i) => i !== index));
    if (editCommissionIndex === index) {
      setEditCommissionIndex(null);
      setNewCommission("");
    }
  };

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setPreview: (value: string | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File quá lớn",
        description: "Vui lòng chọn file nhỏ hơn 5MB",
      });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Định dạng không hợp lệ",
        description: "Vui lòng chọn file hình ảnh",
      });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateImage = (ref: React.RefObject<HTMLInputElement>) => {
    ref.current?.click();
  };

  const validateForm = () => {
    if (!mainPreview) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn hình ảnh chính",
      });
      return false;
    }
    if (!teacherPreview) {
      toast({
        variant: "destructive",
        title: "Vui lòng chọn hình ảnh giáo viên",
      });
      return false;
    }
    if (!courseName) {
      toast({
        variant: "destructive",
        title: "Vui lòng nhập tên khóa học",
      });
      return false;
    }
    return true;
  };

  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const uploadResponse = await UploadService.uploadToCloudinary([file]);
      if (
        uploadResponse &&
        Array.isArray(uploadResponse) &&
        uploadResponse[0]
      ) {
        return uploadResponse[0]?.secure_url;
      } else {
        console.error("Upload failed or response is not as expected");
        return "";
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  }, []);

  const extractBase64Images = (htmlContent: string) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    const matches = [...htmlContent.matchAll(imgTagRegex)];
    return matches.map((match) => match[1]);
  };

  const replaceBase64WithCloudUrls = async (
    htmlContent: string,
    uploadFunc: (file: File) => Promise<string>
  ) => {
    const imgTagRegex =
      /<img[^>]+src=["'](data:image\/[^;]+;base64[^"']+)["'][^>]*>/g;
    let updatedContent = htmlContent;

    const matches = [...htmlContent.matchAll(imgTagRegex)];
    for (const match of matches) {
      const base64String = match[1];
      const file = base64ToFile(base64String);
      const uploadedUrl = await uploadFunc(file);
      updatedContent = updatedContent.replace(base64String, uploadedUrl);
    }

    return updatedContent;
  };

  const base64ToFile = (base64String: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], "image.png", { type: mime });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsLoading(true);


    const uploadMainImage: any = await UploadService.uploadToCloudinary([
      mainPreview,
    ]);

    const uploadMainTeacherImage: any = await UploadService.uploadToCloudinary([
      teacherPreview,
    ]);

    const body = {
      course_name: courseName,
      thumbnail: uploadMainImage[0]?.secure_url || "",
      input_score: inputScore,
      output_score: outputScore,
      commission: commission,
      study_time: studyTime,
      duration: duration,
      description: description,
      students: students,
      lessons: lessons,
      teacher_name: teacherName,
      teacher_avatar: uploadMainTeacherImage[0]?.secure_url || "",

    };
    await CourseService.createCourse(body);
    setIsLoading(false);

    window.location.href = "/?tab=course";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-orange-700"
        >
          <Plus size={16} className="mr-2" /> Thêm khóa học
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[1200px] max-h-[90vh]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            <span className="!text-[20px]">Thêm khóa học mới</span>
          </DialogTitle>
          <DialogDescription>
            <span className="!text-[16px]">
              Điền thông tin khóa học và nhấn{" "}
              <strong className="text-orange-700">Lưu</strong> để tạo khóa học
              mới.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="w-full grid grid-cols-3 gap-8">
          <div className="col-span-1 overflow-auto h-full max-h-[70vh] scroll-bar-style">
            <div className="mb-6">
              <Label htmlFor="thumbnail" className="text-right !text-[16px]">
                Hình khóa học
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

            <Label htmlFor="thumbnail" className="text-right !text-[16px]">
              Hình giáo viên
            </Label>
            <div className="mt-2 mb-5">
              {!teacherPreview && (
                <div
                  onClick={() => handleUpdateImage(teacherImageInputRef)}
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
                ref={teacherImageInputRef}
                onChange={(e) => handleImageChange(e, setTeacherPreview)}
                accept="image/*"
                className="hidden"
              />
              {teacherPreview && (
                <div className="mt-2">
                  <Image
                    src={teacherPreview}
                    alt="teacher-preview"
                    className="w-full h-96 object-cover rounded-md mt-2"
                    width={1000}
                    height={1000}
                  />
                  <div
                    onClick={() => handleUpdateImage(teacherImageInputRef)}
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
          <div className="flex flex-col justify-start items-start gap-2 col-span-2 overflow-auto h-full max-h-[70vh] scroll-bar-style pb-5">
            <Label htmlFor="course_name" className="text-[16px]">
              Tên khóa học
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="course_name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Tên khóa học"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>

            <Label htmlFor="description" className="text-[16px]">
              Mô tả khóa học
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả khóa học"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>

            <Label htmlFor="commission" className="text-[16px]">
              Cam kết khóa học
            </Label>
            <div className="w-full grid items-center gap-4 mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  id="commission"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                  placeholder="Nhập cam kết mới"
                  className="col-span-3 border border-gray-200 !rounded w-full px-2.5"
                />
                <Button
                  onClick={handleAddCommission}
                  className="bg-orange-700 hover:bg-orange-800"
                >
                  {editCommissionIndex !== null ? "Cập nhật" : "Thêm"}
                </Button>
              </div>
              {commission.length > 0 && (
                <div className="mt-2">
                  {commission.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 border-b"
                    >
                      <span>{item}</span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCommission(index)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCommission(index)}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Label htmlFor="input_score" className="text-[16px]">
              Đầu vào
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="input_score"
                value={inputScore}
                onChange={(e) => setInputScore(e.target.value)}
                placeholder="Đầu vào"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="output_score" className="text-[16px]">
              Đầu ra
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="output_score"
                value={outputScore}
                onChange={(e) => setOutputScore(e.target.value)}
                placeholder="Đầu ra"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="study_time" className="text-[16px]">
              Thời gian buổi học
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="study_time"
                value={studyTime}
                onChange={(e) => setStudyTime(e.target.value)}
                placeholder="Thời gian buổi học"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="duration" className="text-[16px]">
              Thời gian khóa học
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Thời gian khóa học"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="teacher_name" className="text-[16px]">
              Tên giáo viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <textarea
                id="teacher_name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Tên giáo viên"
                className="col-span-3 p-2 border rounded"
              ></textarea>
            </div>
            <Label htmlFor="students" className="text-[16px]">
              Số lượng học viên
            </Label>
            <div className="w-full grid items-center gap-4">
              <input
                id="students"
                type="number"
                value={students}
                onChange={(e) => setStudents(Number(e.target.value))}
                placeholder="Số lượng học viên"
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <Label htmlFor="lessons" className="text-[16px]">
              Số lượng buổi học
            </Label>
            <div className="w-full grid items-center gap-4">
              <input
                id="lessons"
                type="number"
                value={lessons}
                onChange={(e) => setLessons(Number(e.target.value))}
                placeholder="Số lượng buổi học"
                className="col-span-3 p-2 border rounded"
              />
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
    </Dialog >
  );
}
