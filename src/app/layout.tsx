import "@/src/app/globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Sidebar } from "@/src/components/book-keeping/Sidebar";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Daniel's Portal",
  description: "...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        <ThemeProvider
          defaultTheme="light"
          attribute="class"
          enableSystem={false}
          value={{
            light: "light",
            dark: "dark",
            experimental: "experimental",
            ocean: "ocean",
            forest: "forest",
            purple: "purple",
          }}
        >
          <main className="">{children}</main>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
