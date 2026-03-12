import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BottomNav from "@/components/layout/bottom-nav";
import RightPanel from "@/components/layout/right-panel";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--cream)" }}>
            <Header />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 min-w-0 pb-16 md:pb-0">
                    {children}
                </main>
                <RightPanel />
            </div>
            <BottomNav />
        </div>
    );
}
