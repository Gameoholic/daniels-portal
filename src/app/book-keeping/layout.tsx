import "@/src/app/globals.css";
import { Sidebar } from "@/src/components/book-keeping/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {/* overflow-y-auto and h-screen prevent scrolling of left sidebar*/}
        {children}
      </main>
    </div>
  );
}
