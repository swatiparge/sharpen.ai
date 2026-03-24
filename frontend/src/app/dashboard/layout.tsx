import DashboardHeader from '@/components/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0B1221] flex flex-col transition-colors duration-300">
            <DashboardHeader />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
        </div>
    );
}
