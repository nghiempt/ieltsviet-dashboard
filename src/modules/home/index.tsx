"use client";

import { AppSidebar } from "./components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSearchParams } from "next/navigation";
import Slider from "./modules/slider";
import Blog from "./modules/blog";
import Review from "./modules/reviews";
import TimeKeeping from "./modules/timekeeping";
import Video from "./modules/video";
import Course from "./modules/course";

export default function HomeClient() {
  const param = useSearchParams();

  const renderTab = (tab: string) => {
    switch (tab) {
      case "slider":
        return <Slider />;
      case "video":
        return <Video />;
      case "course":
        return <Course />;
      case "blog":
        return <Blog />;
      case "reviews":
        return <Review />;
      case "timekeeping":
        return <TimeKeeping />;
      default:
        return <Slider />;
    }
  };

  const renderBreadcrumb = (tab: string) => {
    switch (tab) {
      case "slider":
        return "Slider";
      case "video":
        return "Video";
      case "course":
        return "Khóa Học";
      case "blog":
        return "Bài Viết";
      case "reviews":
        return "Đánh giá";
      case "timekeeping":
        return "Chấm công";
      default:
        return "Slider";
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    <span className="text-[16px]">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    <span className="text-[16px]">
                      {renderBreadcrumb(param.get("tab") || "slider")}
                    </span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="w-full h-[1.5px] bg-black opacity-10"></div>
        <div className="flex flex-1 flex-col">
          {renderTab(param.get("tab") || "slider")}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
