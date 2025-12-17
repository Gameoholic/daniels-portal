import "@/src/app/globals.css";
import { SidebarServer } from "@/src/components/home/SidebarServer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <SidebarServer />
      <main className="flex-1 p-6 overflow-y-auto h-screen">
        {/* overflow-y-auto and h-screen prevent scrolling of left sidebar*/}
        {children}
      </main>
    </div>
  );
}
