import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen" style={{ background: "#F0EDE9" }}>
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}
