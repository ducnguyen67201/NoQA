import { Providers } from "@/lib/providers";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoQa",
  description: "AI Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
