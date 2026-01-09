(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/components/ui/badge.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Badge",
    ()=>Badge,
    "badgeVariants",
    ()=>badgeVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
;
const badgeVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
            secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
            destructive: "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
            outline: "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
function Badge(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "5e40a1e1d60b0e75e80bd19c2f360b0ae0f0c5c6cd6fa4aa9f6ea52efc052339") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "5e40a1e1d60b0e75e80bd19c2f360b0ae0f0c5c6cd6fa4aa9f6ea52efc052339";
    }
    let className;
    let props;
    let t1;
    let variant;
    if ($[1] !== t0) {
        ({ className, variant, asChild: t1, ...props } = t0);
        $[1] = t0;
        $[2] = className;
        $[3] = props;
        $[4] = t1;
        $[5] = variant;
    } else {
        className = $[2];
        props = $[3];
        t1 = $[4];
        variant = $[5];
    }
    const asChild = t1 === undefined ? false : t1;
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "span";
    let t2;
    if ($[6] !== className || $[7] !== variant) {
        t2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(badgeVariants({
            variant
        }), className);
        $[6] = className;
        $[7] = variant;
        $[8] = t2;
    } else {
        t2 = $[8];
    }
    let t3;
    if ($[9] !== Comp || $[10] !== props || $[11] !== t2) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
            "data-slot": "badge",
            className: t2,
            ...props
        }, void 0, false, {
            fileName: "[project]/frontend/components/ui/badge.tsx",
            lineNumber: 64,
            columnNumber: 10
        }, this);
        $[9] = Comp;
        $[10] = props;
        $[11] = t2;
        $[12] = t3;
    } else {
        t3 = $[12];
    }
    return t3;
}
_c = Badge;
;
var _c;
__turbopack_context__.k.register(_c, "Badge");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/bookmark-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BookmarkButton",
    ()=>BookmarkButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/react.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bookmark.js [app-client] (ecmascript) <export default as Bookmark>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$toast$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/toast-provider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
function BookmarkButton({ tenderId, className, variant = 'default', isSubscriber = false }) {
    _s();
    const { data: session, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"])();
    const { toast } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$toast$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"])();
    const [isBookmarked, setIsBookmarked] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [checking, setChecking] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const API_BASE = ("TURBOPACK compile-time value", "http://localhost:5000/api") || 'http://localhost:5000/api';
    // Check if already bookmarked on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BookmarkButton.useEffect": ()=>{
            if (status === 'loading') return;
            if (!session) {
                setChecking(false);
                return;
            }
            const checkBookmark = {
                "BookmarkButton.useEffect.checkBookmark": async ()=>{
                    try {
                        const token = session?.accessToken;
                        if (!token) {
                            console.warn('No access token available - please sign out and sign back in');
                            setChecking(false);
                            return;
                        }
                        const res = await fetch(`${API_BASE}/bookmarks/check/${tenderId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            setIsBookmarked(data.isBookmarked);
                        }
                    } catch (error) {
                        // Silently handle fetch errors - bookmark status unknown
                        console.warn('Could not check bookmark status');
                    } finally{
                        setChecking(false);
                    }
                }
            }["BookmarkButton.useEffect.checkBookmark"];
            checkBookmark();
        }
    }["BookmarkButton.useEffect"], [
        tenderId,
        session,
        status,
        API_BASE
    ]);
    const toggleBookmark = async ()=>{
        if (!session) return;
        const token_0 = session?.accessToken;
        if (!token_0) {
            toast('Please sign in to save tenders', 'error');
            return;
        }
        setLoading(true);
        try {
            if (isBookmarked) {
                // Remove bookmark
                const res_0 = await fetch(`${API_BASE}/bookmarks/${tenderId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token_0}`
                    }
                });
                if (res_0.ok) {
                    setIsBookmarked(false);
                    toast('Tender removed from your watchlist', 'info');
                } else {
                    toast('Failed to remove tender', 'error');
                }
            } else {
                // Add bookmark
                const res_1 = await fetch(`${API_BASE}/bookmarks`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token_0}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tenderId
                    })
                });
                if (res_1.ok) {
                    setIsBookmarked(true);
                    toast('Tender saved to your watchlist!', 'success');
                } else {
                    toast('Failed to save tender', 'error');
                }
            }
        } catch (error_0) {
            console.error('Error toggling bookmark:', error_0);
            toast('Something went wrong', 'error');
        } finally{
            setLoading(false);
        }
    };
    // Show placeholder while session is loading
    if (status === 'loading') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: variant === 'icon' ? 'icon' : 'sm',
            disabled: true,
            className: className,
            children: variant === 'icon' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                className: "w-4 h-4"
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 119,
                columnNumber: 39
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                        className: "w-4 h-4"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/bookmark-button.tsx",
                        lineNumber: 120,
                        columnNumber: 25
                    }, this),
                    "Save"
                ]
            }, void 0, true)
        }, void 0, false, {
            fileName: "[project]/frontend/components/bookmark-button.tsx",
            lineNumber: 118,
            columnNumber: 12
        }, this);
    }
    // User not logged in or not a subscriber - show button with upgrade prompt
    if (!session || !isSubscriber) {
        const handleNotSubscriber = ()=>{
            if (!session) {
                toast('Sign in to save tenders to your watchlist', 'info');
            } else {
                toast('Upgrade to a paid plan to save tenders', 'info');
            }
        };
        if (variant === 'icon') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                variant: "outline",
                size: "icon",
                onClick: handleNotSubscriber,
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('transition-colors cursor-pointer opacity-60 hover:opacity-100', className),
                title: !session ? "Sign in to save" : "Upgrade to save",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/bookmark-button.tsx",
                    lineNumber: 137,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 136,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "sm",
            onClick: handleNotSubscriber,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('gap-2 transition-colors cursor-pointer opacity-60 hover:opacity-100', className),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/bookmark-button.tsx",
                    lineNumber: 141,
                    columnNumber: 17
                }, this),
                "Save"
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/bookmark-button.tsx",
            lineNumber: 140,
            columnNumber: 12
        }, this);
    }
    if (checking) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: variant === 'icon' ? 'icon' : 'sm',
            disabled: true,
            className: className,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                    className: "w-4 h-4 animate-spin"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/bookmark-button.tsx",
                    lineNumber: 147,
                    columnNumber: 17
                }, this),
                variant !== 'icon' && ' Loading...'
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/bookmark-button.tsx",
            lineNumber: 146,
            columnNumber: 12
        }, this);
    }
    if (variant === 'icon') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
            variant: "outline",
            size: "icon",
            onClick: toggleBookmark,
            disabled: loading,
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('transition-colors', isBookmarked && 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100', className),
            title: isBookmarked ? 'Remove from watchlist' : 'Add to watchlist',
            children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "w-4 h-4 animate-spin"
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 153,
                columnNumber: 28
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-4 h-4', isBookmarked && 'fill-current')
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 153,
                columnNumber: 75
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/bookmark-button.tsx",
            lineNumber: 152,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
        variant: "outline",
        size: "sm",
        onClick: toggleBookmark,
        disabled: loading,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('gap-2 transition-colors', isBookmarked && 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100', className),
        children: [
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                className: "w-4 h-4 animate-spin"
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 157,
                columnNumber: 24
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bookmark$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Bookmark$3e$__["Bookmark"], {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('w-4 h-4', isBookmarked && 'fill-current')
            }, void 0, false, {
                fileName: "[project]/frontend/components/bookmark-button.tsx",
                lineNumber: 157,
                columnNumber: 71
            }, this),
            isBookmarked ? 'Saved' : 'Save'
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/components/bookmark-button.tsx",
        lineNumber: 156,
        columnNumber: 10
    }, this);
}
_s(BookmarkButton, "o7omdslGD3kD35J4Yg+TvqjhT+o=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$react$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSession"],
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$toast$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useToast"]
    ];
});
_c = BookmarkButton;
var _c;
__turbopack_context__.k.register(_c, "BookmarkButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/components/typesense-search.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TypesenseSearch",
    ()=>TypesenseSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typesense$2d$instantsearch$2d$adapter$2f$lib$2f$TypesenseInstantsearchAdapter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/typesense-instantsearch-adapter/lib/TypesenseInstantsearchAdapter.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$components$2f$InstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch-core/dist/es/components/InstantSearch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$SearchBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch/dist/es/widgets/SearchBox.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Hits$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch/dist/es/widgets/Hits.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$RefinementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch/dist/es/widgets/RefinementList.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Stats$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch/dist/es/widgets/Stats.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Pagination$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch/dist/es/widgets/Pagination.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$components$2f$Configure$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch-core/dist/es/components/Configure.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$hooks$2f$useInstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-instantsearch-core/dist/es/hooks/useInstantSearch.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/date-fns/format.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isPast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/isPast.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$differenceInDays$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/date-fns/differenceInDays.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$bookmark$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/components/bookmark-button.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
;
;
// Typesense configuration
const typesenseAdapter = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$typesense$2d$instantsearch$2d$adapter$2f$lib$2f$TypesenseInstantsearchAdapter$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
    server: {
        apiKey: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TYPESENSE_API_KEY || 'tender-app-typesense-key',
        nodes: [
            {
                host: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TYPESENSE_HOST || 'localhost',
                port: parseInt(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TYPESENSE_PORT || '8108'),
                protocol: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || 'http'
            }
        ]
    },
    additionalSearchParameters: {
        query_by: 'title,description,buyerName',
        sort_by: 'publishedDate:desc'
    }
});
const searchClient = typesenseAdapter.searchClient;
// Tender Hit Component with Quick View
function TenderHit(t0) {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(124);
    if ($[0] !== "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a") {
        for(let $i = 0; $i < 124; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a";
    }
    const { hit, isSubscriber: t1 } = t0;
    const isSubscriber = t1 === undefined ? false : t1;
    const [isExpanded, setIsExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let T0;
    let T1;
    let T2;
    let closingDate;
    let daysLeft;
    let handleExpandClick;
    let isClosed;
    let isClosingSoon;
    let t10;
    let t11;
    let t12;
    let t13;
    let t14;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[1] !== hit.buyerName || $[2] !== hit.closingDate || $[3] !== hit.id || $[4] !== hit.publishedDate || $[5] !== hit.region || $[6] !== hit.slug || $[7] !== hit.title || $[8] !== isExpanded) {
        closingDate = hit.closingDate ? new Date(hit.closingDate) : null;
        const publishedDate = hit.publishedDate ? new Date(hit.publishedDate) : null;
        isClosed = closingDate ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$isPast$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPast"])(closingDate) : false;
        daysLeft = closingDate && !isClosed ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$differenceInDays$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["differenceInDays"])(closingDate, new Date()) : null;
        isClosingSoon = daysLeft !== null && daysLeft <= 7;
        const handleCardClick = _TenderHitHandleCardClick;
        let t15;
        if ($[30] !== isExpanded) {
            t15 = ({
                "TenderHit[handleExpandClick]": (e_0)=>{
                    e_0.preventDefault();
                    e_0.stopPropagation();
                    setIsExpanded(!isExpanded);
                }
            })["TenderHit[handleExpandClick]"];
            $[30] = isExpanded;
            $[31] = t15;
        } else {
            t15 = $[31];
        }
        handleExpandClick = t15;
        t14 = "mb-4";
        T2 = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
        t12 = `/tenders/${hit.slug || hit.id}`;
        t13 = handleCardClick;
        T1 = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"];
        const t16 = isClosed ? "border-l-slate-300 opacity-75" : isClosingSoon ? "border-l-amber-500" : "border-l-emerald-500";
        const t17 = isExpanded && "rounded-b-none";
        if ($[32] !== t16 || $[33] !== t17) {
            t11 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-l-4 transition-all hover:shadow-md cursor-pointer", t16, t17);
            $[32] = t16;
            $[33] = t17;
            $[34] = t11;
        } else {
            t11 = $[34];
        }
        T0 = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"];
        t10 = "p-4";
        t9 = "flex flex-col sm:flex-row justify-between gap-3";
        t5 = "flex-1 min-w-0";
        const t18 = isClosed ? "secondary" : "default";
        const t19 = !isClosed && "bg-emerald-500 hover:bg-emerald-600";
        let t20;
        if ($[35] !== t19) {
            t20 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-xs", t19);
            $[35] = t19;
            $[36] = t20;
        } else {
            t20 = $[36];
        }
        const t21 = isClosed ? "Closed" : "Active";
        let t22;
        if ($[37] !== t18 || $[38] !== t20 || $[39] !== t21) {
            t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                variant: t18,
                className: t20,
                children: t21
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 122,
                columnNumber: 13
            }, this);
            $[37] = t18;
            $[38] = t20;
            $[39] = t21;
            $[40] = t22;
        } else {
            t22 = $[40];
        }
        const t23 = isClosingSoon && !isClosed && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "outline",
            className: "text-amber-600 border-amber-300 text-xs",
            children: "Closes soon"
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 130,
            columnNumber: 47
        }, this);
        if ($[41] !== t22 || $[42] !== t23) {
            t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 mb-2",
                children: [
                    t22,
                    t23
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 132,
                columnNumber: 12
            }, this);
            $[41] = t22;
            $[42] = t23;
            $[43] = t6;
        } else {
            t6 = $[43];
        }
        if ($[44] !== hit.title) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "font-semibold text-slate-800 line-clamp-2 mb-2",
                children: hit.title
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 140,
                columnNumber: 12
            }, this);
            $[44] = hit.title;
            $[45] = t7;
        } else {
            t7 = $[45];
        }
        let t24;
        if ($[46] !== hit.buyerName) {
            t24 = hit.buyerName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                        className: "w-3.5 h-3.5"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 148,
                        columnNumber: 72
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "truncate max-w-[200px]",
                        children: hit.buyerName
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 148,
                        columnNumber: 109
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 148,
                columnNumber: 30
            }, this);
            $[46] = hit.buyerName;
            $[47] = t24;
        } else {
            t24 = $[47];
        }
        let t25;
        if ($[48] !== hit.region) {
            t25 = hit.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                        className: "w-3.5 h-3.5"
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 156,
                        columnNumber: 69
                    }, this),
                    hit.region
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 156,
                columnNumber: 27
            }, this);
            $[48] = hit.region;
            $[49] = t25;
        } else {
            t25 = $[49];
        }
        if ($[50] !== t24 || $[51] !== t25) {
            t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500",
                children: [
                    t24,
                    t25
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 163,
                columnNumber: 12
            }, this);
            $[50] = t24;
            $[51] = t25;
            $[52] = t8;
        } else {
            t8 = $[52];
        }
        t2 = "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100";
        t3 = publishedDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 171,
                    columnNumber: 69
                }, this),
                "Advertised: ",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(publishedDate, "dd MMM yyyy")
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 171,
            columnNumber: 27
        }, this);
        t4 = closingDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "flex items-center gap-1",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-3 h-3"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 172,
                    columnNumber: 67
                }, this),
                "Closes: ",
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$date$2d$fns$2f$format$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["format"])(closingDate, "dd MMM yyyy")
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 172,
            columnNumber: 25
        }, this);
        $[1] = hit.buyerName;
        $[2] = hit.closingDate;
        $[3] = hit.id;
        $[4] = hit.publishedDate;
        $[5] = hit.region;
        $[6] = hit.slug;
        $[7] = hit.title;
        $[8] = isExpanded;
        $[9] = T0;
        $[10] = T1;
        $[11] = T2;
        $[12] = closingDate;
        $[13] = daysLeft;
        $[14] = handleExpandClick;
        $[15] = isClosed;
        $[16] = isClosingSoon;
        $[17] = t10;
        $[18] = t11;
        $[19] = t12;
        $[20] = t13;
        $[21] = t14;
        $[22] = t2;
        $[23] = t3;
        $[24] = t4;
        $[25] = t5;
        $[26] = t6;
        $[27] = t7;
        $[28] = t8;
        $[29] = t9;
    } else {
        T0 = $[9];
        T1 = $[10];
        T2 = $[11];
        closingDate = $[12];
        daysLeft = $[13];
        handleExpandClick = $[14];
        isClosed = $[15];
        isClosingSoon = $[16];
        t10 = $[17];
        t11 = $[18];
        t12 = $[19];
        t13 = $[20];
        t14 = $[21];
        t2 = $[22];
        t3 = $[23];
        t4 = $[24];
        t5 = $[25];
        t6 = $[26];
        t7 = $[27];
        t8 = $[28];
        t9 = $[29];
    }
    let t15;
    if ($[53] !== t2 || $[54] !== t3 || $[55] !== t4) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: [
                t3,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 227,
            columnNumber: 11
        }, this);
        $[53] = t2;
        $[54] = t3;
        $[55] = t4;
        $[56] = t15;
    } else {
        t15 = $[56];
    }
    let t16;
    if ($[57] !== t15 || $[58] !== t5 || $[59] !== t6 || $[60] !== t7 || $[61] !== t8) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t5,
            children: [
                t6,
                t7,
                t8,
                t15
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 237,
            columnNumber: 11
        }, this);
        $[57] = t15;
        $[58] = t5;
        $[59] = t6;
        $[60] = t7;
        $[61] = t8;
        $[62] = t16;
    } else {
        t16 = $[62];
    }
    let t17;
    if ($[63] !== closingDate || $[64] !== daysLeft || $[65] !== isClosed || $[66] !== isClosingSoon) {
        t17 = closingDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex items-center gap-1 text-sm font-medium", isClosed ? "text-slate-400" : isClosingSoon ? "text-amber-600" : "text-slate-600"),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 249,
                    columnNumber: 176
                }, this),
                isClosed ? "Closed" : daysLeft === 0 ? "Today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 249,
            columnNumber: 26
        }, this);
        $[63] = closingDate;
        $[64] = daysLeft;
        $[65] = isClosed;
        $[66] = isClosingSoon;
        $[67] = t17;
    } else {
        t17 = $[67];
    }
    let t18;
    if ($[68] !== hit.id || $[69] !== isSubscriber) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            "data-bookmark-button": true,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$bookmark$2d$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BookmarkButton"], {
                tenderId: hit.id,
                variant: "icon",
                isSubscriber: isSubscriber
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 260,
                columnNumber: 44
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 260,
            columnNumber: 11
        }, this);
        $[68] = hit.id;
        $[69] = isSubscriber;
        $[70] = t18;
    } else {
        t18 = $[70];
    }
    let t19;
    if ($[71] !== t17 || $[72] !== t18) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                t17,
                t18
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 269,
            columnNumber: 11
        }, this);
        $[71] = t17;
        $[72] = t18;
        $[73] = t19;
    } else {
        t19 = $[73];
    }
    let t20;
    if ($[74] !== hit.category) {
        t20 = hit.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
            variant: "outline",
            className: "text-xs",
            children: hit.category
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 278,
            columnNumber: 27
        }, this);
        $[74] = hit.category;
        $[75] = t20;
    } else {
        t20 = $[75];
    }
    const t21 = isExpanded ? "bg-emerald-500 text-white rotate-45 shadow-lg" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:scale-110 hover:shadow-md";
    let t22;
    if ($[76] !== t21) {
        t22 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer", t21);
        $[76] = t21;
        $[77] = t22;
    } else {
        t22 = $[77];
    }
    let t23;
    if ($[78] === Symbol.for("react.memo_cache_sentinel")) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 295,
            columnNumber: 11
        }, this);
        $[78] = t23;
    } else {
        t23 = $[78];
    }
    let t24;
    if ($[79] !== handleExpandClick || $[80] !== t22) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            "data-expand-button": true,
            onClick: handleExpandClick,
            className: t22,
            children: t23
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 302,
            columnNumber: 11
        }, this);
        $[79] = handleExpandClick;
        $[80] = t22;
        $[81] = t24;
    } else {
        t24 = $[81];
    }
    const t25 = isExpanded ? "Close preview" : "Quick preview";
    let t26;
    if ($[82] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none",
            children: t25
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 312,
            columnNumber: 11
        }, this);
        $[82] = t25;
        $[83] = t26;
    } else {
        t26 = $[83];
    }
    let t27;
    if ($[84] !== t24 || $[85] !== t26) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "relative group",
            children: [
                t24,
                t26
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 320,
            columnNumber: 11
        }, this);
        $[84] = t24;
        $[85] = t26;
        $[86] = t27;
    } else {
        t27 = $[86];
    }
    let t28;
    if ($[87] !== t20 || $[88] !== t27) {
        t28 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center gap-2",
            children: [
                t20,
                t27
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 329,
            columnNumber: 11
        }, this);
        $[87] = t20;
        $[88] = t27;
        $[89] = t28;
    } else {
        t28 = $[89];
    }
    let t29;
    if ($[90] !== t19 || $[91] !== t28) {
        t29 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-end justify-between shrink-0 gap-2",
            children: [
                t19,
                t28
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 338,
            columnNumber: 11
        }, this);
        $[90] = t19;
        $[91] = t28;
        $[92] = t29;
    } else {
        t29 = $[92];
    }
    let t30;
    if ($[93] !== t16 || $[94] !== t29 || $[95] !== t9) {
        t30 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t9,
            children: [
                t16,
                t29
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 347,
            columnNumber: 11
        }, this);
        $[93] = t16;
        $[94] = t29;
        $[95] = t9;
        $[96] = t30;
    } else {
        t30 = $[96];
    }
    let t31;
    if ($[97] !== T0 || $[98] !== t10 || $[99] !== t30) {
        t31 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            className: t10,
            children: t30
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 357,
            columnNumber: 11
        }, this);
        $[97] = T0;
        $[98] = t10;
        $[99] = t30;
        $[100] = t31;
    } else {
        t31 = $[100];
    }
    let t32;
    if ($[101] !== T1 || $[102] !== t11 || $[103] !== t31) {
        t32 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T1, {
            className: t11,
            children: t31
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 367,
            columnNumber: 11
        }, this);
        $[101] = T1;
        $[102] = t11;
        $[103] = t31;
        $[104] = t32;
    } else {
        t32 = $[104];
    }
    let t33;
    if ($[105] !== T2 || $[106] !== t12 || $[107] !== t13 || $[108] !== t32) {
        t33 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T2, {
            href: t12,
            onClick: t13,
            children: t32
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 377,
            columnNumber: 11
        }, this);
        $[105] = T2;
        $[106] = t12;
        $[107] = t13;
        $[108] = t32;
        $[109] = t33;
    } else {
        t33 = $[109];
    }
    let t34;
    if ($[110] !== hit.buyerName || $[111] !== hit.category || $[112] !== hit.description || $[113] !== hit.id || $[114] !== hit.region || $[115] !== hit.slug || $[116] !== hit.tenderNumber || $[117] !== isExpanded || $[118] !== isSubscriber) {
        t34 = isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-slate-50 border border-t-0 border-slate-200 rounded-b-lg p-4 animate-in slide-in-from-top-2 duration-200",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-4",
                children: [
                    hit.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                className: "text-sm font-semibold text-slate-700 mb-1",
                                children: "Description"
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 202
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-600 whitespace-pre-wrap",
                                children: hit.description
                            }, void 0, false, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 276
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 388,
                        columnNumber: 197
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm",
                        children: [
                            hit.tenderNumber && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-slate-400 text-xs uppercase",
                                        children: "Tender No."
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 451
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-slate-700",
                                        children: hit.tenderNumber
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 519
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 446
                            }, this),
                            hit.category && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-slate-400 text-xs uppercase",
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 612
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-slate-700",
                                        children: hit.category
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 678
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 607
                            }, this),
                            hit.region && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-slate-400 text-xs uppercase",
                                        children: "Region"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 765
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-slate-700",
                                        children: hit.region
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 829
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 760
                            }, this),
                            hit.buyerName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-slate-400 text-xs uppercase",
                                        children: "Buyer"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 917
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-slate-700",
                                        children: hit.buyerName
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/components/typesense-search.tsx",
                                        lineNumber: 388,
                                        columnNumber: 980
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/components/typesense-search.tsx",
                                lineNumber: 388,
                                columnNumber: 912
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 388,
                        columnNumber: 362
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 pt-2 border-t border-slate-200",
                        children: isSubscriber ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/tenders/${hit.slug || hit.id}`,
                            className: "text-sm font-medium text-emerald-600 hover:text-emerald-700",
                            children: "View Full Details →"
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/typesense-search.tsx",
                            lineNumber: 388,
                            columnNumber: 1142
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                    className: "w-4 h-4 text-slate-400"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/typesense-search.tsx",
                                    lineNumber: 388,
                                    columnNumber: 1330
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-sm text-slate-500",
                                    children: "Full details require subscription"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/typesense-search.tsx",
                                    lineNumber: 388,
                                    columnNumber: 1373
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/pricing",
                                    className: "text-sm font-medium text-emerald-600 hover:text-emerald-700 ml-2",
                                    children: "Upgrade →"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/components/typesense-search.tsx",
                                    lineNumber: 388,
                                    columnNumber: 1454
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/components/typesense-search.tsx",
                            lineNumber: 388,
                            columnNumber: 1289
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 388,
                        columnNumber: 1054
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 388,
                columnNumber: 150
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 388,
            columnNumber: 25
        }, this);
        $[110] = hit.buyerName;
        $[111] = hit.category;
        $[112] = hit.description;
        $[113] = hit.id;
        $[114] = hit.region;
        $[115] = hit.slug;
        $[116] = hit.tenderNumber;
        $[117] = isExpanded;
        $[118] = isSubscriber;
        $[119] = t34;
    } else {
        t34 = $[119];
    }
    let t35;
    if ($[120] !== t14 || $[121] !== t33 || $[122] !== t34) {
        t35 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t14,
            children: [
                t33,
                t34
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 404,
            columnNumber: 11
        }, this);
        $[120] = t14;
        $[121] = t33;
        $[122] = t34;
        $[123] = t35;
    } else {
        t35 = $[123];
    }
    return t35;
}
_s(TenderHit, "FPNvbbHVlWWR4LKxxNntSxiIS38=");
_c = TenderHit;
// No Results Component
function _TenderHitHandleCardClick(e) {
    const target = e.target;
    if (target.closest("[data-bookmark-button]") || target.closest("[data-expand-button]")) {
        e.preventDefault();
    }
}
function NoResults() {
    _s1();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(3);
    if ($[0] !== "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a") {
        for(let $i = 0; $i < 3; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a";
    }
    const { indexUiState } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$hooks$2f$useInstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstantSearch"])();
    let t0;
    if ($[1] !== indexUiState.query) {
        t0 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-slate-500",
                children: [
                    'No tenders found for "',
                    indexUiState.query,
                    '".'
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 435,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 435,
            columnNumber: 10
        }, this);
        $[1] = indexUiState.query;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    return t0;
}
_s1(NoResults, "bCZ6hE6rJu3q1bmSPp94jFNAJxQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$hooks$2f$useInstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstantSearch"]
    ];
});
_c1 = NoResults;
// Empty Query Info
function EmptyQueryBoundary(t0) {
    _s2();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(6);
    if ($[0] !== "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a") {
        for(let $i = 0; $i < 6; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a";
    }
    const { children, fallback } = t0;
    const { indexUiState, results } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$hooks$2f$useInstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstantSearch"])();
    if (!indexUiState.query && (!results || results.nbHits === 0)) {
        let t1;
        if ($[1] !== fallback) {
            t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: fallback
            }, void 0, false);
            $[1] = fallback;
            $[2] = t1;
        } else {
            t1 = $[2];
        }
        return t1;
    }
    if (results && results.nbHits === 0) {
        let t1;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(NoResults, {}, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 475,
                columnNumber: 12
            }, this);
            $[3] = t1;
        } else {
            t1 = $[3];
        }
        return t1;
    }
    let t1;
    if ($[4] !== children) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: children
        }, void 0, false);
        $[4] = children;
        $[5] = t1;
    } else {
        t1 = $[5];
    }
    return t1;
}
_s2(EmptyQueryBoundary, "aZQhBr7bdMTElLkVjQxUwOpBtrQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$hooks$2f$useInstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstantSearch"]
    ];
});
_c2 = EmptyQueryBoundary;
function TypesenseSearch(t0) {
    _s3();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(24);
    if ($[0] !== "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a") {
        for(let $i = 0; $i < 24; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "ad3b8df994bf834d523eed98fc67df722d3892c53d3a0411a0c5ad4095058f8a";
    }
    const { isSubscriber: t1 } = t0;
    const isSubscriber = t1 === undefined ? false : t1;
    const [isClient, setIsClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    let t2;
    let t3;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "TypesenseSearch[useEffect()]": ()=>{
                setIsClient(true);
            }
        })["TypesenseSearch[useEffect()]"];
        t3 = [];
        $[1] = t2;
        $[2] = t3;
    } else {
        t2 = $[1];
        t3 = $[2];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(t2, t3);
    if (!isClient) {
        let t4;
        if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
            t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-12 bg-slate-200 rounded-lg mb-6"
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 527,
                columnNumber: 12
            }, this);
            $[3] = t4;
        } else {
            t4 = $[3];
        }
        let t5;
        if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "animate-pulse",
                children: [
                    t4,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4",
                        children: [
                            1,
                            2,
                            3
                        ].map(_TypesenseSearchAnonymous)
                    }, void 0, false, {
                        fileName: "[project]/frontend/components/typesense-search.tsx",
                        lineNumber: 534,
                        columnNumber: 47
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 534,
                columnNumber: 12
            }, this);
            $[4] = t5;
        } else {
            t5 = $[4];
        }
        return t5;
    }
    let t4;
    let t5;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = {
            preserveSharedStateOnUnmount: true
        };
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$components$2f$Configure$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Configure"], {
            hitsPerPage: 20
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 547,
            columnNumber: 10
        }, this);
        $[5] = t4;
        $[6] = t5;
    } else {
        t4 = $[5];
        t5 = $[6];
    }
    let t6;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$SearchBox$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SearchBox"], {
            placeholder: "Search tenders by title, buyer, or description...",
            classNames: {
                root: "w-full",
                form: "relative",
                input: "w-full h-12 px-4 pr-24 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-800",
                submit: "absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600",
                reset: "absolute right-12 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 hidden",
                submitIcon: "w-5 h-5",
                resetIcon: "w-4 h-4",
                loadingIcon: "w-4 h-4 animate-spin"
            },
            searchAsYouType: true
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 556,
            columnNumber: 10
        }, this);
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    let t7;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "text-sm font-medium text-slate-700 mb-2",
            children: "Region"
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 572,
            columnNumber: 10
        }, this);
        $[8] = t7;
    } else {
        t7 = $[8];
    }
    let t8;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 min-w-[200px]",
            children: [
                t7,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$RefinementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RefinementList"], {
                    attribute: "region",
                    limit: 5,
                    showMore: true,
                    showMoreLimit: 20,
                    classNames: {
                        root: "text-sm",
                        list: "space-y-1",
                        item: "flex items-center gap-2",
                        checkbox: "w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500",
                        label: "flex items-center gap-2 cursor-pointer",
                        labelText: "text-slate-600",
                        count: "text-xs text-slate-400 bg-slate-200 px-1.5 rounded",
                        showMore: "text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 cursor-pointer",
                        disabledShowMore: "text-slate-400 text-sm mt-2 cursor-not-allowed"
                    }
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 579,
                    columnNumber: 52
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 579,
            columnNumber: 10
        }, this);
        $[9] = t8;
    } else {
        t8 = $[9];
    }
    let t9;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "text-sm font-medium text-slate-700 mb-2",
            children: "Category"
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 596,
            columnNumber: 10
        }, this);
        $[10] = t9;
    } else {
        t9 = $[10];
    }
    let t10;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 min-w-[200px]",
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$RefinementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RefinementList"], {
                    attribute: "category",
                    limit: 5,
                    showMore: true,
                    showMoreLimit: 20,
                    classNames: {
                        root: "text-sm",
                        list: "space-y-1",
                        item: "flex items-center gap-2",
                        checkbox: "w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500",
                        label: "flex items-center gap-2 cursor-pointer",
                        labelText: "text-slate-600",
                        count: "text-xs text-slate-400 bg-slate-200 px-1.5 rounded",
                        showMore: "text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 cursor-pointer",
                        disabledShowMore: "text-slate-400 text-sm mt-2 cursor-not-allowed"
                    }
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 603,
                    columnNumber: 53
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 603,
            columnNumber: 11
        }, this);
        $[11] = t10;
    } else {
        t10 = $[11];
    }
    let t11;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
            className: "text-sm font-medium text-slate-700 mb-2",
            children: "Status"
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 620,
            columnNumber: 11
        }, this);
        $[12] = t11;
    } else {
        t11 = $[12];
    }
    let t12;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-wrap gap-4 p-4 bg-slate-50 rounded-xl",
            children: [
                t8,
                t10,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 min-w-[200px]",
                    children: [
                        t11,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$RefinementList$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["RefinementList"], {
                            attribute: "status",
                            classNames: {
                                root: "text-sm",
                                list: "space-y-1",
                                item: "flex items-center gap-2",
                                checkbox: "w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500",
                                label: "flex items-center gap-2 cursor-pointer",
                                labelText: "text-slate-600",
                                count: "text-xs text-slate-400 bg-slate-200 px-1.5 rounded"
                            }
                        }, void 0, false, {
                            fileName: "[project]/frontend/components/typesense-search.tsx",
                            lineNumber: 627,
                            columnNumber: 128
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 627,
                    columnNumber: 85
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 627,
            columnNumber: 11
        }, this);
        $[13] = t12;
    } else {
        t12 = $[13];
    }
    let t13;
    if ($[14] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Stats$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stats"], {
            classNames: {
                root: "text-sm text-slate-500"
            },
            translations: {
                rootElementText: _temp
            }
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 642,
            columnNumber: 11
        }, this);
        $[14] = t13;
    } else {
        t13 = $[14];
    }
    let t14;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-12 text-slate-500",
            children: "Start typing to search tenders..."
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 653,
            columnNumber: 11
        }, this);
        $[15] = t14;
    } else {
        t14 = $[15];
    }
    let t15;
    if ($[16] !== isSubscriber) {
        t15 = ({
            "TypesenseSearch[<Hits>.hitComponent]": (t16)=>{
                const { hit } = t16;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TenderHit, {
                    hit: hit,
                    isSubscriber: isSubscriber
                }, void 0, false, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 665,
                    columnNumber: 16
                }, this);
            }
        })["TypesenseSearch[<Hits>.hitComponent]"];
        $[16] = isSubscriber;
        $[17] = t15;
    } else {
        t15 = $[17];
    }
    let t16;
    if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = {
            list: "space-y-0"
        };
        $[18] = t16;
    } else {
        t16 = $[18];
    }
    let t17;
    if ($[19] !== t15) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyQueryBoundary, {
            fallback: t14,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Hits$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Hits"], {
                hitComponent: t15,
                classNames: t16
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 684,
                columnNumber: 46
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 684,
            columnNumber: 11
        }, this);
        $[19] = t15;
        $[20] = t17;
    } else {
        t17 = $[20];
    }
    let t18;
    if ($[21] === Symbol.for("react.memo_cache_sentinel")) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex justify-center mt-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2f$dist$2f$es$2f$widgets$2f$Pagination$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pagination"], {
                classNames: {
                    root: "flex flex-row items-center gap-1",
                    list: "flex flex-row items-center gap-1",
                    item: "px-3 py-2 rounded-lg text-sm",
                    link: "text-slate-600 hover:bg-slate-100 block",
                    selectedItem: "bg-emerald-500 text-white rounded-lg",
                    disabledItem: "text-slate-300",
                    firstPageItem: "hidden sm:block",
                    lastPageItem: "hidden sm:block"
                }
            }, void 0, false, {
                fileName: "[project]/frontend/components/typesense-search.tsx",
                lineNumber: 692,
                columnNumber: 53
            }, this)
        }, void 0, false, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 692,
            columnNumber: 11
        }, this);
        $[21] = t18;
    } else {
        t18 = $[21];
    }
    let t19;
    if ($[22] !== t17) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$instantsearch$2d$core$2f$dist$2f$es$2f$components$2f$InstantSearch$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["InstantSearch"], {
            searchClient: searchClient,
            indexName: "tenders",
            future: t4,
            children: [
                t5,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6",
                    children: [
                        t6,
                        t12,
                        t13,
                        t17,
                        t18
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/components/typesense-search.tsx",
                    lineNumber: 708,
                    columnNumber: 90
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/frontend/components/typesense-search.tsx",
            lineNumber: 708,
            columnNumber: 11
        }, this);
        $[22] = t17;
        $[23] = t19;
    } else {
        t19 = $[23];
    }
    return t19;
}
_s3(TypesenseSearch, "k460N28PNzD7zo1YW47Q9UigQis=");
_c3 = TypesenseSearch;
function _temp(t0) {
    const { nbHits, processingTimeMS } = t0;
    return `${nbHits.toLocaleString()} tenders found in ${processingTimeMS}ms`;
}
function _TypesenseSearchAnonymous(i) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-32 bg-slate-100 rounded-lg"
    }, i, false, {
        fileName: "[project]/frontend/components/typesense-search.tsx",
        lineNumber: 724,
        columnNumber: 10
    }, this);
}
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "TenderHit");
__turbopack_context__.k.register(_c1, "NoResults");
__turbopack_context__.k.register(_c2, "EmptyQueryBoundary");
__turbopack_context__.k.register(_c3, "TypesenseSearch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_components_1417a7cc._.js.map