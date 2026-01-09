import Link from 'next/link';
import Image from 'next/image';
import { TopNavbar } from '@/components/top-navbar';
import { auth } from '@/auth';

// Force dynamic rendering to ensure session is always fresh
export const dynamic = 'force-dynamic';

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    return (
        <div className="min-h-screen">
            {/* Landing Navbar - Using Unified Layout */}
            <TopNavbar user={session?.user} />

            {/* Main Content */}
            <main className="pt-0"> {/* Removed pt-16 because TopNavbar is sticky/fixed handling its own space mostly, but stickiness needs relative content. TopNavbar is sticky top-0. */}
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="mb-4">
                                <Image
                                    src="/logo.png"
                                    alt="Open Tenders"
                                    width={220}
                                    height={80}
                                    className="h-20 w-auto brightness-0 invert"
                                />
                            </div>
                            <p className="text-sm">Your gateway to South African government tender opportunities.</p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white">Features</a></li>
                                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                                <li><Link href="/tenders" className="hover:text-white">Browse Tenders</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">About Us</a></li>
                                <li><a href="#" className="hover:text-white">Contact</a></li>
                                <li><a href="#" className="hover:text-white">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
                        © {new Date().getFullYear()} Open Tenders. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
