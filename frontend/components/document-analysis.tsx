"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  FileSearch,
  Loader2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  AlertTriangle,
  UserCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TenderDocument = {
  title?: string;
  documentType?: string;
  format?: string;
  url?: string;
};

type Analysis = {
  summary: string;
  keyRequirements: string[];
  eligibility: string[];
  deadlines: string[];
  requiredDocuments: string[];
  risks: string[];
  nextSteps: string[];
};

type AnalysisResponse = {
  source: "url";
  fileName: string;
  documentUrl?: string;
  fileType?: string | null;
  fileSize?: number | null;
  analysisSource?: "downloaded_file" | "remote_url";
  downloadWarning?: string | null;
  model: string;
  analysis: Analysis;
};

interface DocumentAnalysisProps {
  tenderTitle: string;
  tenderDescription?: string | null;
  documents?: TenderDocument[];
}

export function DocumentAnalysis({
  tenderTitle,
  tenderDescription,
  documents = [],
}: DocumentAnalysisProps) {
  const { data: session } = useSession();
  const autoAnalyzeStarted = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState("0");
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState<"url" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  const normalizedAnalysis = useMemo(() => {
    if (!result) return null;

    return {
      ...result.analysis,
      keyRequirements: normalizeListItems(result.analysis.keyRequirements),
      eligibility: normalizeListItems(result.analysis.eligibility),
      deadlines: normalizeListItems(result.analysis.deadlines),
      requiredDocuments: normalizeListItems(result.analysis.requiredDocuments),
      risks: normalizeListItems(result.analysis.risks),
      nextSteps: normalizeListItems(result.analysis.nextSteps),
    };
  }, [result]);

  const documentOptions = useMemo(
    () => documents.filter((document) => document.url),
    [documents],
  );

  const selectedDocument = documentOptions[Number(selectedIndex)] || null;

  const requestDocumentAnalysis = useCallback(
    async (document: TenderDocument) => {
      if (!document.url) return;

      const response = await fetch("/api/documents/analyze-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentUrl: document.url,
          documentTitle:
            document.title || document.documentType || "Tender document",
          fileName:
            document.title || document.documentType || "tender-document.pdf",
          tenderTitle,
          tenderDescription,
          instructions,
        }),
      });

      return parseResponse(response);
    },
    [instructions, tenderDescription, tenderTitle],
  );

  const analyzeUrl = useCallback(
    async (document: TenderDocument) => {
      if (!document.url) return;

      setLoading("url");
      setError(null);
      setResult(null);

      const candidates = [
        document,
        ...documentOptions.filter(
          (candidate) => candidate.url && candidate.url !== document.url,
        ),
      ];
      const failures: string[] = [];

      try {
        for (const candidate of candidates) {
          try {
            const analysis = await requestDocumentAnalysis(candidate);
            if (!analysis) continue;

            const matchedIndex = documentOptions.findIndex(
              (option) => option.url === candidate.url,
            );
            if (matchedIndex >= 0) setSelectedIndex(String(matchedIndex));
            setResult(analysis);
            return;
          } catch (err) {
            failures.push(
              `${getDocumentLabel(candidate)}: ${getErrorMessage(err)}`,
            );
          }
        }

        const visibleFailures = failures.slice(0, 3).join(" ");
        const hiddenFailureCount = Math.max(failures.length - 3, 0);
        setError(
          failures.length > 1
            ? `Could not analyse any linked tender document. ${visibleFailures}${hiddenFailureCount ? ` ${hiddenFailureCount} more document link(s) also failed.` : ""}`
            : failures[0] || "Document analysis failed.",
        );
      } finally {
        setLoading(null);
      }
    },
    [documentOptions, requestDocumentAnalysis],
  );

  useEffect(() => {
    if (
      autoAnalyzeStarted.current ||
      !selectedDocument?.url ||
      loading ||
      result
    )
      return;
    if (!session?.user) return;

    autoAnalyzeStarted.current = true;
    analyzeUrl(selectedDocument);
  }, [analyzeUrl, selectedDocument, session, loading, result]);

  const handleAnalyzeUrl = async () => {
    if (!selectedDocument?.url) return;
    await analyzeUrl(selectedDocument);
  };

  if (documentOptions.length === 0) return null;

  return (
    <Card className="mb-6 border-emerald-100 bg-emerald-50/30">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            AI Document Report
          </CardTitle>
          {loading === "url" && (
            <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analysing tender document...
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="document-url">Tender document</Label>
            <select
              id="document-url"
              value={selectedIndex}
              onChange={(event) => setSelectedIndex(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            >
              {documentOptions.map((document, index) => (
                <option key={`${document.url}-${index}`} value={index}>
                  {document.title ||
                    document.documentType ||
                    `Document ${index + 1}`}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            onClick={handleAnalyzeUrl}
            disabled={loading !== null || !selectedDocument}
            className="self-end bg-emerald-600 hover:bg-emerald-700"
          >
            {loading === "url" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSearch className="w-4 h-4" />
            )}
            Analyse Link
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="analysis-instructions">Focus areas</Label>
          <Textarea
            id="analysis-instructions"
            value={instructions}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              setInstructions(event.target.value)
            }
            placeholder="Example: compliance requirements, pricing risks, mandatory attachments"
            rows={3}
            className="bg-white"
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result?.downloadWarning && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              The source site blocked the direct download, so the report used
              the remote document link as a fallback.
            </span>
          </div>
        )}

        {result && normalizedAnalysis && (
          <div className="mt-6 space-y-5 border-t pt-5">
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Document report
              </p>
              <h3 className="truncate text-base font-semibold text-slate-900">
                {result.fileName}
              </h3>
            </div>

            <section className="rounded-lg border bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <h4 className="text-sm font-semibold text-slate-900">
                  Executive Summary
                </h4>
              </div>
              <SummaryContent summary={normalizedAnalysis.summary} />
            </section>

            <div className="grid gap-4">
              <AnalysisCard
                title="Key Requirements"
                items={normalizedAnalysis.keyRequirements}
                icon={<CheckCircle2 className="h-4 w-4" />}
                toneClass="border-l-emerald-500"
                iconClass="bg-emerald-50 text-emerald-600"
              />
              <AnalysisCard
                title="Important Deadlines"
                items={normalizedAnalysis.deadlines}
                icon={<Clock className="h-4 w-4" />}
                toneClass="border-l-blue-500"
                iconClass="bg-blue-50 text-blue-600"
              />
              <AnalysisCard
                title="Required Documents"
                items={normalizedAnalysis.requiredDocuments}
                icon={<FileText className="h-4 w-4" />}
                toneClass="border-l-violet-500"
                iconClass="bg-violet-50 text-violet-600"
              />
              <AnalysisCard
                title="Key Risks and Caveats"
                items={normalizedAnalysis.risks}
                icon={<AlertTriangle className="h-4 w-4" />}
                toneClass="border-l-rose-500"
                iconClass="bg-rose-50 text-rose-600"
              />
              <AnalysisCard
                title="Eligibility and Compliance"
                items={normalizedAnalysis.eligibility}
                icon={<UserCheck className="h-4 w-4" />}
                toneClass="border-l-amber-500"
                iconClass="bg-amber-50 text-amber-600"
              />
              <AnalysisCard
                title="Recommended Next Steps"
                items={normalizedAnalysis.nextSteps}
                icon={<ArrowRight className="h-4 w-4" />}
                toneClass="border-l-teal-500"
                iconClass="bg-teal-50 text-teal-600"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function parseResponse(response: Response): Promise<AnalysisResponse> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      payload?.message || `Analysis failed with HTTP ${response.status}`,
    );
  }
  return payload;
}

function getDocumentLabel(document: TenderDocument) {
  return (
    document.title || document.documentType || document.url || "Tender document"
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Document analysis failed.";
}

type SummaryBlock = {
  type: "paragraph" | "bullet";
  text: string;
};

function SummaryContent({ summary }: { summary: string }) {
  const blocks = formatSummaryBlocks(summary);

  if (blocks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No summary was returned for this document.
      </p>
    );
  }

  if (blocks.every((block) => block.type === "bullet")) {
    return (
      <ul className="space-y-2">
        {blocks.map((block, index) => (
          <li
            key={`${block.text}-${index}`}
            className="flex gap-2 text-sm leading-relaxed text-slate-700"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span>{block.text}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <p
          key={`${block.text}-${index}`}
          className="text-sm leading-relaxed text-slate-700"
        >
          {block.text}
        </p>
      ))}
    </div>
  );
}

function formatSummaryBlocks(summary: string): SummaryBlock[] {
  const cleaned = normalizeText(summary);
  if (!cleaned) return [];

  const markedItems = splitMarkedItems(cleaned);
  if (markedItems.length > 1) {
    return markedItems.map((text) => ({ type: "bullet", text }));
  }

  const paragraphs = cleaned
    .split(/\n{2,}|\n(?=[A-Z0-9])/)
    .map((text) => normalizeText(text))
    .filter(Boolean);

  if (paragraphs.length > 1) {
    return paragraphs.map((text) => ({ type: "paragraph", text }));
  }

  const sentences =
    cleaned
      .match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)
      ?.map((text) => normalizeText(text))
      .filter(Boolean) || [];

  if (cleaned.length > 260 && sentences.length > 2) {
    const grouped: string[] = [];
    for (let index = 0; index < sentences.length; index += 2) {
      grouped.push(sentences.slice(index, index + 2).join(" "));
    }
    return grouped.map((text) => ({ type: "paragraph", text }));
  }

  return [{ type: "paragraph", text: cleaned }];
}

function normalizeListItems(items: string[]) {
  return items
    .flatMap((item) => {
      const cleaned = normalizeText(item);
      if (!cleaned) return [];

      const markedItems = splitMarkedItems(cleaned);
      if (markedItems.length > 1) return markedItems;

      const lineItems = cleaned
        .split(/\n+/)
        .map((line) => normalizeText(stripListMarker(line)))
        .filter(Boolean);

      return lineItems.length > 1 ? lineItems : [cleaned];
    })
    .filter(Boolean);
}

function splitMarkedItems(text: string) {
  const withLineBreaks = text
    .replace(/\r/g, "")
    .replace(/\s+(?=(?:[-*]|\u2022|\d{1,2}[.)])\s+)/g, "\n");

  const lines = withLineBreaks
    .split(/\n+/)
    .map((line) => normalizeText(stripListMarker(line)))
    .filter(Boolean);

  return lines.length > 1 ? lines : [];
}

function stripListMarker(text: string) {
  return text.replace(/^\s*(?:[-*]|\u2022|\d{1,2}[.)])\s+/, "");
}

function normalizeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();
}

interface AnalysisCardProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  toneClass: string;
  iconClass: string;
}

function AnalysisCard({
  title,
  items,
  icon,
  toneClass,
  iconClass,
}: AnalysisCardProps) {
  return (
    <section
      className={`rounded-lg border border-slate-200 border-l-4 bg-white p-4 shadow-xs ${toneClass}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${iconClass}`}
        >
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="relative pl-4 text-sm leading-relaxed text-slate-700 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-slate-300"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-muted-foreground">
          No specific details found in the document.
        </p>
      )}
    </section>
  );
}
