'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SignOutDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut({ callbackUrl: '/' });
    };

    const triggerButton = (
        <button className="relative flex items-center gap-2 px-4 h-16 text-sm font-medium transition-colors text-red-600 hover:text-red-700 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-red-500 after:transition-transform after:duration-200 after:scale-x-0 hover:after:scale-x-100 cursor-pointer">
            <LogOut className="w-4 h-4" />
            Sign Out
        </button>
    );

    if (!mounted) {
        return triggerButton;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out of your account?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col-reverse sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSignOut}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        {isLoading ? 'Signing out...' : 'Sign Out'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
