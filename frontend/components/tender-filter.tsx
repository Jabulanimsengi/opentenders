"use client"

import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

interface FilterProps {
    title: string
    options: {
        label: string
        value: string
        count?: number
    }[]
    paramName: string
}

export function TenderFilter({ title, options, paramName }: FilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const selectedValues = new Set(searchParams.get(paramName)?.split(",") || [])
    const [open, setOpen] = React.useState(false)

    const handleSelect = (value: string) => {
        const newSelectedValues = new Set(selectedValues)
        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value)
        } else {
            newSelectedValues.add(value)
        }

        const params = new URLSearchParams(searchParams.toString())
        if (newSelectedValues.size > 0) {
            params.set(paramName, Array.from(newSelectedValues).join(","))
        } else {
            params.delete(paramName)
        }
        params.set("page", "1") // Reset to page 1 on filter change

        setOpen(false) // Close popover after selection
        router.push(`${pathname}?${params.toString()}`)
    }

    const clearFilter = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete(paramName)
        params.set("page", "1")
        setOpen(false) // Close popover after clearing
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        "h-9 px-4 rounded-full border-2 font-medium transition-all duration-200",
                        selectedValues.size > 0
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/30 hover:bg-emerald-600 hover:border-emerald-600 hover:text-white"
                            : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-slate-900 hover:bg-slate-50",
                        "data-[state=open]:border-emerald-500 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20"
                    )}
                >
                    {selectedValues.size === 0 && <PlusCircle className="mr-2 h-4 w-4" />}
                    {title}
                    {selectedValues.size > 0 && (
                        <Badge className="ml-2 bg-white/20 text-white border-0 rounded-full px-2 py-0">
                            {selectedValues.size}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0 rounded-xl shadow-xl border-slate-200" align="start">
                <Command className="rounded-xl">
                    <CommandInput placeholder={`Search ${title.toLowerCase()}...`} className="h-10" />
                    <CommandList className="max-h-[250px]">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value)
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                        className="cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border-2 transition-colors",
                                                isSelected
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-slate-300"
                                            )}
                                        >
                                            <Check className={cn("h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                                        </div>
                                        <span className="flex-1">{option.label}</span>
                                        {option.count !== undefined && (
                                            <span className="ml-auto text-xs text-slate-400 font-medium">
                                                {option.count}
                                            </span>
                                        )}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={clearFilter}
                                        className="justify-center text-center text-red-500 hover:text-red-600 cursor-pointer"
                                    >
                                        Clear {title.toLowerCase()}
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
