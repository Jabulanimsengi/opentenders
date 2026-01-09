import { TopNavbar } from "@/components/top-navbar"
import { auth } from '@/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <div className="min-h-screen bg-gray-50/50">
            <TopNavbar user={session?.user} />
            <main className="w-full">
                {children}
            </main>
        </div>
    )
}
