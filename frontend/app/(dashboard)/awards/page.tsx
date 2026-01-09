import { prisma } from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { PaginationControls } from '@/components/pagination-controls';
import { Trophy, ArrowUpDown, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortField = 'amount' | 'date';
type SortOrder = 'asc' | 'desc';

export default async function AwardsPage(props: { searchParams: Promise<{ page?: string; sort?: string; order?: string }> }) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const pageSize = 20;
    const sortField: SortField = (searchParams.sort as SortField) || 'amount';
    const sortOrder: SortOrder = (searchParams.order as SortOrder) || 'desc';

    const [awards, totalCount] = await Promise.all([
        (prisma as any).award.findMany({
            include: {
                tender: true
            },
            orderBy: {
                [sortField]: sortOrder
            },
            skip: (page - 1) * pageSize,
            take: pageSize
        }),
        (prisma as any).award.count()
    ]);

    const getSortUrl = (field: SortField) => {
        const newOrder = sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';
        return `/awards?sort=${field}&order=${newOrder}&page=1`;
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
        return sortOrder === 'desc'
            ? <ArrowDown className="w-4 h-4 ml-1 text-emerald-600" />
            : <ArrowUp className="w-4 h-4 ml-1 text-emerald-600" />;
    };

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Back Link */}
            <Link href="/dashboard" className="inline-flex items-center text-slate-600 hover:text-emerald-600 mb-6 text-sm font-medium transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <Trophy className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Awarded Tenders</h1>
                    </div>
                    <p className="text-slate-600">
                        Recently awarded government tenders. Showing {awards.length} of {totalCount} awards.
                        {sortField === 'amount' ? ' Sorted by value.' : ' Sorted by date.'}
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[400px]">Tender</TableHead>
                                <TableHead>Supplier</TableHead>
                                <TableHead>
                                    <Link
                                        href={getSortUrl('amount')}
                                        className={cn(
                                            "flex items-center hover:text-foreground transition-colors",
                                            sortField === 'amount' && "text-emerald-600 font-semibold"
                                        )}
                                    >
                                        Value
                                        <SortIcon field="amount" />
                                    </Link>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Link
                                        href={getSortUrl('date')}
                                        className={cn(
                                            "flex items-center justify-end hover:text-foreground transition-colors",
                                            sortField === 'date' && "text-emerald-600 font-semibold"
                                        )}
                                    >
                                        Award Date
                                        <SortIcon field="date" />
                                    </Link>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {awards.map((award: any) => (
                                <TableRow key={award.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium">
                                        <Link href={`/tenders/${award.tender.slug || award.tenderId}`} className="hover:underline text-emerald-600 hover:text-emerald-700 font-semibold block mb-1">
                                            {award.tender.title}
                                        </Link>
                                        <span className="text-xs text-slate-500">{award.tender.ocid}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-slate-700">{award.supplierName}</span>
                                    </TableCell>
                                    <TableCell>
                                        {award.amount ? (
                                            <Badge variant="outline" className="font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                                                {award.currency} {award.amount.toLocaleString()}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {award.date ? format(award.date, 'dd MMM yyyy') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {awards.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No awards found in the database yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="mt-6">
                <PaginationControls totalItems={totalCount} pageSize={pageSize} />
            </div>
        </div>
    );
}
