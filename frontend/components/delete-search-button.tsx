'use client';

import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteSavedSearch } from '@/lib/saved-search-actions';
import { useState } from 'react';

export function DeleteSearchButton({ searchId }: { searchId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this saved search?')) return;

        setIsDeleting(true);
        await deleteSavedSearch(searchId);
        setIsDeleting(false);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
            <Trash2 className="w-4 h-4" />
        </Button>
    );
}
