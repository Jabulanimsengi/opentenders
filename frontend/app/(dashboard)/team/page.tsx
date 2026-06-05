"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/toast-provider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

type TeamMember = {
  id: string;
  invitedEmail: string;
  role: string;
  status: string;
  createdAt: string;
};

type TeamResponse = {
  organization: { id: string; name: string } | null;
  subscription: { plan: string; status: string } | null;
  members: TeamMember[];
  seatLimit: number;
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [team, setTeam] = useState<TeamResponse | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const token = (session as { accessToken?: string } | null)?.accessToken;

  const loadTeam = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to load team");
      setTeam(await response.json());
    } catch {
      toast("Failed to load team", "error");
    } finally {
      setLoading(false);
    }
  }, [toast, token]);

  async function inviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !email.trim()) return;
    setInviting(true);
    try {
      const response = await fetch(`${API_BASE}/team/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Invite failed");
      setEmail("");
      toast("Team member added or invited", "success");
      await loadTeam();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Failed to invite member",
        "error",
      );
    } finally {
      setInviting(false);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }
    if (status === "authenticated") {
      loadTeam();
    }
  }, [loadTeam, router, status]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const usedSeats =
    team?.members.filter((member) =>
      ["active", "invited"].includes(member.status),
    ).length || 0;
  const canInvite =
    team?.seatLimit === -1 || usedSeats < (team?.seatLimit || 1);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          <Users className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
          Team
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Add users according to your plan limits. Admins can monitor team
          access.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:mb-8 md:grid-cols-3 md:gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Plan</div>
            <div className="mt-1 text-2xl font-bold capitalize text-slate-900">
              {team?.subscription?.plan || "free"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Seats Used</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {usedSeats} /{" "}
              {team?.seatLimit === -1 ? "Custom" : team?.seatLimit || 1}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-sm text-slate-500">Team</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">
              {team?.organization?.name || "No team workspace yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={inviteMember}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colleague@example.com"
                disabled={!canInvite}
              />
            </div>
            <Button type="submit" disabled={!canInvite || inviting} className="w-full sm:w-auto">
              {inviting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Invite
            </Button>
          </form>
          {!canInvite && (
            <p className="mt-3 text-sm text-amber-700">
              Your current plan has reached its user limit.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(team?.members || []).map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.invitedEmail}</TableCell>
                  <TableCell className="capitalize">{member.role}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.status === "active" ? "default" : "secondary"
                      }
                    >
                      {member.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          <div className="space-y-3 sm:hidden">
            {(team?.members || []).map((member) => (
              <div key={member.id} className="rounded-lg border border-slate-200 p-3">
                <div className="break-words text-sm font-medium text-slate-900">
                  {member.invitedEmail}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="capitalize">{member.role}</span>
                  <Badge
                    variant={
                      member.status === "active" ? "default" : "secondary"
                    }
                  >
                    {member.status}
                  </Badge>
                  <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          {!team?.members.length && (
            <p className="py-6 text-center text-sm text-slate-500">
              No team members yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
