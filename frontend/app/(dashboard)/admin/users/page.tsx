'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Users, Loader2, Trash2, Crown, AlertTriangle, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/toast-provider';
import { PLANS } from '@/lib/subscription';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    subscription: {
        plan: string;
        status: string;
        startDate: string;
        endDate: string | null;
    } | null;
}

interface UsersResponse {
    users: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Dialog states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [planDialogOpen, setPlanDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newPlan, setNewPlan] = useState('');
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [updating, setUpdating] = useState(false);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

    // Check if user is admin
    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/');
            return;
        }
    }, [session, status, router]);

    // Fetch users
    const fetchUsers = async (page = 1, searchQuery = '') => {
        try {
            setLoading(true);
            const token = (session as any)?.accessToken;

            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
            });
            if (searchQuery) params.append('search', searchQuery);

            const res = await fetch(`${API_BASE}/admin/users?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.status === 403) {
                toast('Admin access required', 'error');
                router.push('/dashboard');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch users');

            const data: UsersResponse = await res.json();
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast('Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchUsers();
        }
    }, [session]);

    // Handle search
    const handleSearch = () => {
        fetchUsers(1, search);
    };

    // Update subscription
    const handleUpdatePlan = async () => {
        if (!selectedUser || !newPlan) return;

        setUpdating(true);
        try {
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/admin/users/${selectedUser.id}/subscription`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan: newPlan, status: 'active' }),
            });

            if (!res.ok) throw new Error('Failed to update plan');

            toast(`Updated ${selectedUser.email} to ${newPlan} plan`, 'success');
            setPlanDialogOpen(false);
            fetchUsers(pagination.page, search);
        } catch (error) {
            toast('Failed to update plan', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Delete user
    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        setUpdating(true);
        try {
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/admin/users/${selectedUser.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('Failed to delete user');

            toast(`Deleted user ${selectedUser.email}`, 'success');
            setDeleteDialogOpen(false);
            fetchUsers(pagination.page, search);
        } catch (error) {
            toast('Failed to delete user', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Update user role
    const handleUpdateRole = async () => {
        if (!selectedUser || !newRole) return;

        setUpdating(true);
        try {
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/admin/users/${selectedUser.id}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) throw new Error('Failed to update role');

            toast(`Updated ${selectedUser.email} role to ${newRole}`, 'success');
            setRoleDialogOpen(false);
            fetchUsers(pagination.page, search);
        } catch (error) {
            toast('Failed to update role', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const getPlanBadge = (plan: string) => {
        const colors: Record<string, string> = {
            free: 'bg-gray-100 text-gray-700',
            solo: 'bg-emerald-100 text-emerald-700',
            team: 'bg-blue-100 text-blue-700',
            enterprise: 'bg-purple-100 text-purple-700',
        };
        return colors[plan] || colors.free;
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900 sm:text-2xl">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                        User Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage users and their subscriptions
                    </p>
                </div>
                <Badge variant="outline" className="text-sm">
                    {pagination.total} total users
                </Badge>
            </div>

            {/* Search */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch} className="w-full sm:w-auto">Search</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="hidden overflow-x-auto md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Signed Up</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.name || 'No name'}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getPlanBadge(user.subscription?.plan || 'free')}>
                                                {user.subscription?.plan || 'free'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {user.subscription?.status || 'active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewPlan(user.subscription?.plan || 'free');
                                                        setPlanDialogOpen(true);
                                                    }}
                                                >
                                                    <Crown className="w-4 h-4 mr-1" />
                                                    Plan
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setRoleDialogOpen(true);
                                                    }}
                                                >
                                                    <Shield className="w-4 h-4 mr-1" />
                                                    Role
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    </div>
                    <div className="space-y-3 p-3 md:hidden">
                        {users.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">
                                No users found
                            </div>
                        ) : (
                            users.map((user) => (
                                <div key={user.id} className="rounded-lg border border-gray-200 p-3">
                                    <div className="break-words">
                                        <p className="font-medium text-gray-900">{user.name || 'No name'}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                        <Badge className={getPlanBadge(user.subscription?.plan || 'free')}>
                                            {user.subscription?.plan || 'free'}
                                        </Badge>
                                        <Badge variant="outline">
                                            {user.subscription?.status || 'active'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(user.createdAt), 'dd MMM yyyy')}
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewPlan(user.subscription?.plan || 'free');
                                                setPlanDialogOpen(true);
                                            }}
                                        >
                                            <Crown className="mr-1 h-4 w-4" />
                                            Plan
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setNewRole(user.role);
                                                setRoleDialogOpen(true);
                                            }}
                                        >
                                            <Shield className="mr-1 h-4 w-4" />
                                            Role
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchUsers(pagination.page - 1, search)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchUsers(pagination.page + 1, search)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Change Plan Dialog */}
            <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Subscription Plan</DialogTitle>
                        <DialogDescription>
                            Update the subscription plan for {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newPlan} onValueChange={setNewPlan}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(PLANS).map((plan) => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name} - R{plan.price}/month
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdatePlan} disabled={updating}>
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Plan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Delete User
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
                            All their data including bookmarks and saved searches will be permanently removed.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteUser}
                            disabled={updating}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Change Role Dialog */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change User Role</DialogTitle>
                        <DialogDescription>
                            Update the role for {selectedUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={setNewRole}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User (Standard)</SelectItem>
                                <SelectItem value="admin">Admin (Full Access)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateRole} disabled={updating}>
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Update Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
