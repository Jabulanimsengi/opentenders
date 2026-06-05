"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import { Heart } from "lucide-react"

type SavedSearchCriteria = Record<string, string | string[]>

export function SaveSearchButton({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    // Only show if there are actual filters applied
    const hasFilters = searchParams.toString().length > 0;

    if (!hasFilters) return null;

    async function handleSave() {
        if (!isLoggedIn) {
            router.push("/login")
            return
        }

        setLoading(true)
        const criteria: SavedSearchCriteria = {}
        const arrayParams = new Set(['region', 'category', 'buyer', 'status'])
        searchParams.forEach((value, key) => {
            if (key !== 'page') { // Don't save page number
                criteria[key] = arrayParams.has(key) ? value.split(',') : value
            }
        })

        try {
            const res = await fetch("/api/saved-searches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, criteria }),
            })
            if (res.ok) {
                setOpen(false)
                setName("")
                // Maybe show toast success
            }
        } catch { }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2 gap-2">
                    <Heart className="w-4 h-4" />
                    Save Search
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Save Search</DialogTitle>
                    <DialogDescription>
                        Get notified when new tenders match these filters.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="e.g. IT in Gauteng"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave} disabled={loading || !name}>
                        {loading ? 'Saving...' : 'Save Alert'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
