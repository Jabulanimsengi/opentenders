'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Bell, Clock, Database, LogOut, Check, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

type SubscriptionState = {
    plan: string;
    status: string;
    endDate?: string | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
};

export default function SettingsPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
    const [billingLoading, setBillingLoading] = useState(false);
    const [billingError, setBillingError] = useState<string | null>(null);

    // Alert preferences
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [alertFrequency, setAlertFrequency] = useState('daily');
    const [closingReminders, setClosingReminders] = useState(true);
    const [reminderDays, setReminderDays] = useState('7');

    useEffect(() => {
        const token = (session as { accessToken?: string } | null)?.accessToken;
        if (!token) return;

        fetch(`${API_BASE}/subscriptions/me`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (data) setSubscription(data);
            })
            .catch(() => undefined);
    }, [session]);

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleManageBilling = async () => {
        const token = (session as { accessToken?: string } | null)?.accessToken;
        if (!token) return;

        setBillingLoading(true);
        setBillingError(null);

        try {
            const response = await fetch(`${API_BASE}/subscriptions/portal`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data?.url) {
                throw new Error(data?.message || 'Unable to open billing portal.');
            }
            window.location.href = data.url;
        } catch (err) {
            setBillingError(err instanceof Error ? err.message : 'Unable to open billing portal.');
        } finally {
            setBillingLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
            {/* Back Link */}
            <Link href="/dashboard" className="mb-5 inline-flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-emerald-600 sm:mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Settings</h1>
            <p className="mb-6 text-sm text-muted-foreground sm:mb-8 sm:text-base">Manage your account and preferences.</p>

            <div className="space-y-4 sm:space-y-6">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-emerald-500" />
                            <div>
                                <CardTitle>Profile</CardTitle>
                                <CardDescription>Your account information</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={session?.user?.email || ''} disabled className="bg-muted" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input value={session?.user?.name || 'User'} disabled className="bg-muted" />
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-emerald-500" />
                            <div>
                                <CardTitle>Subscription</CardTitle>
                                <CardDescription>Manage billing and cancellation</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div>
                                <p className="font-medium capitalize">
                                    {subscription?.plan || 'free'} plan
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                    Status: {subscription?.status || 'active'}
                                    {subscription?.endDate
                                        ? ` until ${new Date(subscription.endDate).toLocaleDateString()}`
                                        : ''}
                                </p>
                            </div>
                            {subscription?.plan && subscription.plan !== 'free' ? (
                                <Button
                                    variant="outline"
                                    onClick={handleManageBilling}
                                    disabled={billingLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {billingLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening...</>
                                    ) : (
                                        'Manage Billing'
                                    )}
                                </Button>
                            ) : (
                                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 sm:w-auto">
                                    <Link href="/pricing">Upgrade</Link>
                                </Button>
                            )}
                        </div>
                        {billingError && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {billingError}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Email Alerts */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-emerald-500" />
                            <div>
                                <CardTitle>Email Alerts</CardTitle>
                                <CardDescription>Configure tender notifications</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when tenders match saved searches
                                </p>
                            </div>
                            <Switch className="shrink-0" checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                        </div>

                        {emailAlerts && (
                            <div className="flex flex-col gap-3 border-l-2 border-emerald-200 pl-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">Alert Frequency</p>
                                    <p className="text-sm text-muted-foreground">How often to send alerts</p>
                                </div>
                                <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                                    <SelectTrigger className="w-full sm:w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="realtime">Real-time</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Closing Reminders */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-emerald-500" />
                            <div>
                                <CardTitle>Closing Reminders</CardTitle>
                                <CardDescription>Deadline notifications</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="font-medium">Enable Reminders</p>
                                <p className="text-sm text-muted-foreground">
                                    Get alerts before tenders close
                                </p>
                            </div>
                            <Switch className="shrink-0" checked={closingReminders} onCheckedChange={setClosingReminders} />
                        </div>

                        {closingReminders && (
                            <div className="flex flex-col gap-3 border-l-2 border-emerald-200 pl-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-medium">Days Before</p>
                                    <p className="text-sm text-muted-foreground">When to send reminder</p>
                                </div>
                                <Select value={reminderDays} onValueChange={setReminderDays}>
                                    <SelectTrigger className="w-full sm:w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 day</SelectItem>
                                        <SelectItem value="3">3 days</SelectItem>
                                        <SelectItem value="7">7 days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Actions */}
                <Card className="border-red-200">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5 text-red-500" />
                            <div>
                                <CardTitle className="text-red-600">Account</CardTitle>
                                <CardDescription>Sign out or manage account</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" asChild>
                            <Link href="/api/auth/signout">Sign Out</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end pt-2 sm:pt-4">
                    <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 sm:w-auto">
                        {saving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                        ) : saved ? (
                            <><Check className="w-4 h-4 mr-2" />Saved!</>
                        ) : (
                            'Save Preferences'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
