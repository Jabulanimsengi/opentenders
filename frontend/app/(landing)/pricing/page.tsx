import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { PLANS } from '@/lib/subscription';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing Plans - Open Tenders',
    description: 'Choose your Open Tenders subscription plan. From free tender browsing to full access with email alerts, saved searches, and tender exports. Plans starting at R109/month.',
    openGraph: {
        title: 'Open Tenders Pricing - Affordable Tender Monitoring',
        description: 'Subscribe to Open Tenders for full access to SA government tender opportunities.',
    },
};

export default function PricingPage() {
    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Browse tenders for free • Subscribe for full details & documents
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
                    {Object.values(PLANS).map((plan) => (
                        <div
                            key={plan.id}
                            className={`rounded-2xl border-2 p-6 ${plan.id === 'solo'
                                ? 'border-emerald-500 shadow-xl relative'
                                : 'border-gray-200 hover:border-gray-300'
                                } transition-colors`}
                        >
                            {plan.id === 'solo' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                                    Most Popular
                                </div>
                            )}
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-3xl font-bold">R{plan.price}</span>
                                <span className="text-gray-500">/month</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                {plan.teamSize === -1 ? 'Unlimited users' : plan.teamSize === 1 ? 'Single user' : `Up to ${plan.teamSize} users`}
                            </p>
                            <ul className="space-y-2 mb-6 text-sm">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-600">
                                        <Check className={`w-4 h-4 ${plan.id === 'free' ? 'text-gray-400' : 'text-green-500'}`} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href={plan.id === 'free' ? '/tenders' : plan.id === 'enterprise' ? 'mailto:hello@opentenders.co.za' : `/subscribe/${plan.id}`}
                                className={`block w-full py-2.5 text-center rounded-xl font-medium transition-colors ${plan.id === 'solo'
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {plan.id === 'free' ? 'Browse Free' : plan.id === 'enterprise' ? 'Contact Sales' : 'Subscribe'}
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Feature Comparison Table */}
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Feature Comparison</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Free</th>
                                    <th className="text-center py-4 px-4 font-semibold text-emerald-600">Solo</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Team</th>
                                    <th className="text-center py-4 px-4 font-semibold text-gray-900">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { feature: 'Browse tender listings', free: true, solo: true, team: true, enterprise: true },
                                    { feature: 'View full tender details', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Save tenders (bookmarks)', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Save searches', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Email alerts', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Export to CSV', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Download as PDF', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Tender watchlist', free: false, solo: true, team: true, enterprise: true },
                                    { feature: 'Team members', free: '1', solo: '1', team: '5', enterprise: 'Unlimited' },
                                    { feature: 'Priority support', free: false, solo: false, team: true, enterprise: true },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-gray-700">{row.feature}</td>
                                        {['free', 'solo', 'team', 'enterprise'].map((plan) => (
                                            <td key={plan} className="py-3 px-4 text-center">
                                                {typeof row[plan as keyof typeof row] === 'boolean' ? (
                                                    row[plan as keyof typeof row] ? (
                                                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : (
                                                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                                                    )
                                                ) : (
                                                    <span className="text-gray-700 font-medium">{row[plan as keyof typeof row]}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ or CTA */}
                <div className="max-w-2xl mx-auto text-center mt-20">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
                    <p className="text-gray-600 mb-6">
                        Contact us for custom pricing or to discuss your specific requirements.
                    </p>
                    <Link
                        href="mailto:hello@opentenders.co.za"
                        className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        Contact Sales
                    </Link>
                </div>
            </div>
        </div>
    );
}
