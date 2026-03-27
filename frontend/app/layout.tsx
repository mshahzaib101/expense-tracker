import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://expense-tracker-lyart-sigma.vercel.app"),
  title: {
    default: "Expense Tracker",
    template: "%s | Expense Tracker",
  },
  description: "Track and manage your daily expenses with interactive dashboards, category analytics, and CSV export.",
  openGraph: {
    title: "Expense Tracker",
    description: "Track and manage your daily expenses with interactive dashboards, category analytics, and CSV export.",
    url: "https://expense-tracker-lyart-sigma.vercel.app",
    siteName: "Expense Tracker",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full min-w-[360px] antialiased`}
    >
      <body className="min-h-full min-w-[360px] overflow-x-auto flex flex-col bg-background text-foreground">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
