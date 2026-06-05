"use client"

import * as React from "react"
import { Check, PlusCircle, X } from "lucide-react"
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
    defaultSelectedValues?: string[]
}

export function TenderFilter({ title, options, paramName, defaultSelectedValues = [] }: FilterProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const paramValue = searchParams.get(paramName)
    const selectedValues = new Set(
        (paramValue !== null
            ? paramValue.split(",")
            : defaultSelectedValues
        ).filter(Boolean)
    )
    const [open, setOpen] = React.useState(false)
    const selectedOptions = options.filter((option) => selectedValues.has(option.value))

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

    const removeSelectedValue = (value: string) => {
        const newSelectedValues = new Set(selectedValues)
        newSelectedValues.delete(value)

        const params = new URLSearchParams(searchParams.toString())
        if (newSelectedValues.size > 0) {
            params.set(paramName, Array.from(newSelectedValues).join(","))
        } else {
            params.delete(paramName)
        }
        params.set("page", "1")
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
        <div className="flex min-w-[104px] max-w-full flex-col gap-1.5 sm:min-w-[132px] sm:gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            "h-8 rounded-full border px-3 text-xs font-medium transition-all duration-200 sm:h-9 sm:border-2 sm:px-4 sm:text-sm",
                            selectedValues.size > 0
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30 ring-2 ring-emerald-500/20 hover:bg-emerald-700 hover:border-emerald-700 hover:text-white"
                                : "bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-slate-900 hover:bg-slate-50",
                            "data-[state=open]:border-emerald-500 data-[state=open]:ring-2 data-[state=open]:ring-emerald-500/20"
                        )}
                    >
                        {selectedValues.size === 0 && (
                            <PlusCircle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                        )}
                        {title}
                        {selectedValues.size > 0 && (
                            <Badge className="ml-1.5 rounded-full border-0 bg-white/20 px-1.5 py-0 text-[10px] text-white sm:ml-2 sm:px-2 sm:text-xs">
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
                                            className={cn(
                                                "cursor-pointer",
                                                isSelected && "bg-emerald-50 text-emerald-900 data-[selected=true]:bg-emerald-50"
                                            )}
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
            {selectedOptions.length > 0 && (
                <div className="flex max-w-[260px] flex-wrap gap-1.5" aria-label={`Selected ${title.toLowerCase()} filters`}>
                    {selectedOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => removeSelectedValue(option.value)}
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 transition-colors hover:border-emerald-300 hover:bg-emerald-100"
                            aria-label={`Remove ${option.label} from ${title}`}
                        >
                            <span className="truncate">{option.label}</span>
                            <X className="h-3 w-3 shrink-0" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
