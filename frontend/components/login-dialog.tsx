'use client';

import { useActionState, useState, useEffect } from 'react';
import { authenticate } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { FileText, Lock } from 'lucide-react';

export function LoginDialog() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering on client
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
            </button>
        );
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                    Sign In
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-0 border-0 bg-transparent shadow-none [&>button]:hidden">
                <DialogTitle className="sr-only">Sign In</DialogTitle>

                <Card className="w-full relative z-10 bg-white/95 backdrop-blur-xl shadow-2xl border-0">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl w-fit">
                            <FileText className="w-8 h-8 text-emerald-400" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Open Tenders</CardTitle>
                        <CardDescription className="text-base">
                            Sign in to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form action={dispatch} className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="you@example.com"
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                />
                            </div>
                            <Button
                                className="w-full h-11 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                                type="submit"
                                disabled={isPending}
                            >
                                <Lock className="w-4 h-4 mr-2" />
                                {isPending ? 'Signing in...' : 'Sign In'}
                            </Button>
                            {errorMessage && (
                                <div className="text-sm text-red-600 text-center bg-red-50 py-2 px-4 rounded-lg">
                                    {errorMessage}
                                </div>
                            )}
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 pt-2 border-t">
                        <p className="text-sm text-muted-foreground text-center">
                            Demo credentials: <code className="bg-gray-100 px-2 py-0.5 rounded">user@example.com</code> / <code className="bg-gray-100 px-2 py-0.5 rounded">password123</code>
                        </p>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
