import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 md:p-8 pt-2 p-8 overflow-y-auto">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
