'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PLANS } from '@/lib/subscription';
import { Check, CreditCard, Lock, ArrowLeft, Loader2 } from 'lucide-react';

type ValidPlanId = 'solo' | 'team';

export default function SubscribePage({ params }: { params: Promise<{ planId: string }> }) {
    const { planId } = use(params);
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validate plan ID
    const validPlanIds: ValidPlanId[] = ['solo', 'team'];
    if (!validPlanIds.includes(planId as ValidPlanId)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-red-600 mb-4">Invalid plan selected</p>
                        <Link href="/pricing">
                            <Button>View Plans</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const plan = PLANS[planId as ValidPlanId];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        // Mock payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsProcessing(false);
        setIsSuccess(true);

        // Redirect to dashboard after success
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
                <Card className="max-w-md w-full mx-4">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Activated!</h2>
                        <p className="text-gray-600 mb-4">
                            Welcome to {plan.name}! Your subscription is now active.
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to your dashboard...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 bg-gradient-to-br from-slate-50 to-white">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Pricing
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Plan Summary */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Subscribe to {plan.name}
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Get full access to all tender opportunities
                        </p>

                        <Card className="mb-6">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Plan Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <span className="text-gray-600">{plan.name} Plan</span>
                                    <span className="font-semibold">R{plan.price}/month</span>
                                </div>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Lock className="w-4 h-4" />
                            <span>Secure payment processing</span>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Details
                            </CardTitle>
                            <CardDescription>
                                Enter your card details to activate your subscription
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cardName">Name on Card</Label>
                                    <Input
                                        id="cardName"
                                        placeholder="John Doe"
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cardNumber">Card Number</Label>
                                    <Input
                                        id="cardNumber"
                                        placeholder="4242 4242 4242 4242"
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry Date</Label>
                                        <Input
                                            id="expiry"
                                            placeholder="MM/YY"
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input
                                            id="cvc"
                                            placeholder="123"
                                            required
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 mt-4"
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>Pay R{plan.price} / month</>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 text-center border-t pt-6">
                            <p className="text-xs text-gray-500">
                                By subscribing, you agree to our Terms of Service and Privacy Policy.
                            </p>
                            <p className="text-xs text-gray-400">
                                You can cancel your subscription at any time.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
