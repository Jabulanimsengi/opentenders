'use client';

import { useActionState, useState, useEffect, useTransition } from 'react';
import { authenticate, register } from '@/lib/actions';
import { signIn } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Lock, Mail, User, Eye, EyeOff } from 'lucide-react';

// Google Logo SVG Component
function GoogleLogo({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

type AuthMode = 'signin' | 'signup';

export function AuthDialog() {
    const [mode, setMode] = useState<AuthMode>('signin');
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isPendingGoogle, startGoogleTransition] = useTransition();
    const [showSignInPassword, setShowSignInPassword] = useState(false);
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);

    const [signInError, signInDispatch, isSigningIn] = useActionState(authenticate, undefined);
    const [signUpError, signUpDispatch, isSigningUp] = useActionState(register, undefined);

    useEffect(() => { setMounted(true); }, []);

    const handleGoogleSignIn = () => {
        startGoogleTransition(async () => {
            await signIn('google', { callbackUrl: '/dashboard' });
        });
    };

    if (!mounted) {
        return <button className="cursor-pointer text-gray-600 hover:text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all">Sign In</button>;
    }

    const errorMessage = mode === 'signin' ? signInError : signUpError;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="cursor-pointer text-gray-600 hover:text-emerald-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-50 transition-all">Sign In</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px] p-0 border-0 bg-transparent shadow-none">
                <DialogTitle className="sr-only">{mode === 'signin' ? 'Sign In' : 'Sign Up'}</DialogTitle>

                <Card className="w-full bg-white shadow-2xl border-0">
                    <CardHeader className="text-center pb-3 pt-5">
                        <div className="mx-auto mb-3">
                            <Image
                                src="/logo.png"
                                alt="Open Tenders"
                                width={280}
                                height={90}
                                className="h-20 w-auto"
                                priority
                            />
                        </div>
                        <CardDescription className="text-sm">
                            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
                        </CardDescription>
                    </CardHeader>

                    {/* Tab Toggle */}
                    <div className="flex mx-5 mb-3 bg-gray-100 rounded-lg p-0.5">
                        <button
                            type="button"
                            onClick={() => setMode('signin')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('signup')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    <CardContent className="pt-0 pb-4 px-5">
                        {/* Google OAuth Button */}
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-9 mb-2 gap-2 font-medium text-sm"
                            onClick={handleGoogleSignIn}
                            disabled={isPendingGoogle}
                        >
                            <GoogleLogo className="w-4 h-4" />
                            {isPendingGoogle ? 'Connecting...' : 'Continue with Google'}
                        </Button>

                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-muted-foreground text-[10px]">or</span>
                            </div>
                        </div>

                        {mode === 'signin' ? (
                            <form action={signInDispatch} className="grid gap-2">
                                <div>
                                    <Label htmlFor="email" className="text-xs font-medium mb-1 block">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            required
                                            className="h-8 pl-8 text-sm bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="password" className="text-xs font-medium mb-1 block">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showSignInPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            className="h-8 pl-8 pr-8 text-sm bg-gray-50 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignInPassword(!showSignInPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSignInPassword ? (
                                                <EyeOff className="w-3.5 h-3.5" />
                                            ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-8 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600"
                                    type="submit"
                                    disabled={isSigningIn}
                                >
                                    {isSigningIn ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>
                        ) : (
                            <form action={signUpDispatch} className="grid gap-2">
                                <div>
                                    <Label htmlFor="name" className="text-xs font-medium mb-1 block">Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            id="name"
                                            type="text"
                                            name="name"
                                            placeholder="John Doe"
                                            required
                                            className="h-8 pl-8 text-sm bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="signup-email" className="text-xs font-medium mb-1 block">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            name="email"
                                            placeholder="you@example.com"
                                            required
                                            className="h-8 pl-8 text-sm bg-gray-50 border-gray-200"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="signup-password" className="text-xs font-medium mb-1 block">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                        <Input
                                            id="signup-password"
                                            type={showSignUpPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Min. 6 characters"
                                            required
                                            minLength={6}
                                            className="h-8 pl-8 pr-8 text-sm bg-gray-50 border-gray-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showSignUpPassword ? (
                                                <EyeOff className="w-3.5 h-3.5" />
                                            ) : (
                                                <Eye className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-8 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600"
                                    type="submit"
                                    disabled={isSigningUp}
                                >
                                    {isSigningUp ? 'Creating...' : 'Create Account'}
                                </Button>
                            </form>
                        )}

                        {errorMessage && (
                            <div className="mt-2 text-xs text-red-600 text-center bg-red-50 py-1.5 px-2 rounded">
                                {errorMessage}
                            </div>
                        )}

                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            By continuing, you agree to our Terms & Privacy Policy.
                        </p>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
