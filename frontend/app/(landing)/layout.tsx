import Link from 'next/link';
import Image from 'next/image';
import { TopNavbar } from '@/components/top-navbar';
import { auth } from '@/auth';

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
            <footer className="bg-gray-900 py-8 text-gray-400 sm:py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
                        <div>
                            <div className="mb-3 sm:mb-4">
                                <Image
                                    src="/logo.png"
                                    alt="Open Tenders"
                                    width={220}
                                    height={80}
                                    className="h-12 w-auto object-contain brightness-0 invert sm:h-16"
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
                    <div className="mt-6 border-t border-gray-800 pt-6 text-center text-sm sm:mt-8 sm:pt-8">
                        © {new Date().getFullYear()} Open Tenders. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
