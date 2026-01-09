"use client"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams, usePathname } from "next/navigation"

interface PaginationControlsProps {
    totalItems: number
    pageSize: number
}

export function PaginationControls({ totalItems, pageSize }: PaginationControlsProps) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const currentPage = Number(searchParams.get("page")) || 1
    const totalPages = Math.ceil(totalItems / pageSize)

    if (totalPages <= 1) return null

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    return (
        <Pagination>
            <PaginationContent>
                {currentPage > 1 && (
                    <PaginationItem>
                        <PaginationPrevious href={createPageURL(currentPage - 1)} />
                    </PaginationItem>
                )}

                {/* Simple logic: show current, prev, next. Expand for better UX later */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                    .map((page, i, arr) => {
                        const isGap = i > 0 && page - arr[i - 1] > 1;
                        return (
                            <div key={page} className="flex items-center">
                                {isGap && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                                <PaginationItem>
                                    <PaginationLink
                                        href={createPageURL(page)}
                                        isActive={currentPage === page}
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            </div>
                        )
                    })
                }

                {currentPage < totalPages && (
                    <PaginationItem>
                        <PaginationNext href={createPageURL(currentPage + 1)} />
                    </PaginationItem>
                )}
            </PaginationContent>
        </Pagination>
    )
}
