import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Prohori Operations Hub",
  description: "Synthetic operations decision-support prototype.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only fixed top-3 left-3 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only"
        >
          Skip to Main Content
        </a>
        {children}
      </body>
    </html>
  );
}
