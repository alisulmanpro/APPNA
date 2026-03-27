import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "APPNA Meeting Portal",
  description: "Professional meeting management dashboard for APPNA organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="corporate" >
      <body className={`antialiased ${plusJakartaSans.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
