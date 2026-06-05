'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenSquare, Trash2, Loader2, StickyNote } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { format } from 'date-fns';

interface Note {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

interface TenderNotesProps {
    tenderId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export function TenderNotes({ tenderId }: TenderNotesProps) {
    const { data: session } = useSession();
    const { toast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (session) {
            fetchNotes();
        }
    }, [session, tenderId]);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/bookmarks/notes/${tenderId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        try {
            setSubmitting(true);
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/bookmarks/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tenderId, content: newNote }),
            });

            if (res.ok) {
                toast('Note added', 'success');
                setNewNote('');
                fetchNotes();
            } else {
                const error = await res.text();
                toast(error || 'Failed to add note', 'error');
            }
        } catch (error) {
            toast('Failed to add note', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateNote = async (noteId: string) => {
        try {
            setSubmitting(true);
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/bookmarks/notes/${noteId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: editContent }),
            });

            if (res.ok) {
                toast('Note updated', 'success');
                setEditingId(null);
                fetchNotes();
            }
        } catch (error) {
            toast('Failed to update note', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (noteId: string) => {
        if (!confirm('Delete this note?')) return;

        try {
            const token = (session as any)?.accessToken;
            const res = await fetch(`${API_BASE}/bookmarks/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.ok) {
                toast('Note deleted', 'success');
                fetchNotes();
            }
        } catch (error) {
            toast('Failed to delete note', 'error');
        }
    };

    if (!session) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-amber-500" />
                    My Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add note */}
                <div className="space-y-2">
                    <Textarea
                        placeholder="Add a private note about this tender..."
                        value={newNote}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                        rows={3}
                    />
                    <Button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || submitting}
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-600"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Add Note
                    </Button>
                </div>

                {/* Notes list */}
                {loading ? (
                    <div className="text-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </div>
                ) : notes.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No notes yet</p>
                ) : (
                    <div className="space-y-3">
                        {notes.map((note) => (
                            <div key={note.id} className="border rounded-lg p-3 bg-amber-50">
                                {editingId === note.id ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={editContent}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleUpdateNote(note.id)}
                                                disabled={submitting}
                                                size="sm"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={() => setEditingId(null)}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-500">
                                                {format(new Date(note.createdAt), 'dd MMM yyyy, HH:mm')}
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    onClick={() => {
                                                        setEditingId(note.id);
                                                        setEditContent(note.content);
                                                    }}
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <PenSquare className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
