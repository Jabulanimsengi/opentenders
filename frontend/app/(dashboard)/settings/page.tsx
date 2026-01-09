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

export default function SettingsPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Alert preferences
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [alertFrequency, setAlertFrequency] = useState('daily');
    const [closingReminders, setClosingReminders] = useState(true);
    const [reminderDays, setReminderDays] = useState('7');

    const handleSave = async () => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-3xl">
            {/* Back Link */}
            <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your account and preferences.</p>

            <div className="space-y-6">
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
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email Notifications</p>
                                <p className="text-sm text-muted-foreground">
                                    Get notified when tenders match saved searches
                                </p>
                            </div>
                            <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                        </div>

                        {emailAlerts && (
                            <div className="flex items-center justify-between pl-4 border-l-2 border-emerald-200">
                                <div>
                                    <p className="font-medium">Alert Frequency</p>
                                    <p className="text-sm text-muted-foreground">How often to send alerts</p>
                                </div>
                                <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                                    <SelectTrigger className="w-36">
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
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable Reminders</p>
                                <p className="text-sm text-muted-foreground">
                                    Get alerts before tenders close
                                </p>
                            </div>
                            <Switch checked={closingReminders} onCheckedChange={setClosingReminders} />
                        </div>

                        {closingReminders && (
                            <div className="flex items-center justify-between pl-4 border-l-2 border-emerald-200">
                                <div>
                                    <p className="font-medium">Days Before</p>
                                    <p className="text-sm text-muted-foreground">When to send reminder</p>
                                </div>
                                <Select value={reminderDays} onValueChange={setReminderDays}>
                                    <SelectTrigger className="w-36">
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
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600">
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
