import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QUẢN TRỊ HỆ THỐNG",
  description: "IELTS VIỆT"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className} suppressHydrationWarning={true}>
        <ToastProvider>
          <div>
            {children}
          </div>
        </ToastProvider>
        <Toaster />
      </body>
    </html>
  );
}
