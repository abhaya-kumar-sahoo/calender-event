import { useState, useEffect } from 'react';
import {
    Globe,
    CheckCircle,
    AlertCircle,
    Loader2,
    Copy,
    RefreshCw,
    Plus,
    Trash2
} from 'lucide-react';
import { baseUrl } from '../utils';

interface Domain {
    _id: string;
    domain: string;
    verificationToken: string;
    verified: boolean;
    sslStatus: 'none' | 'pending' | 'issued' | 'failed';
    sslError?: string;
    createdAt: string;
}

const MAX_DOMAINS = 1;

const CustomDomain = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifyingId, setVerifyingId] = useState<string | null>(null);


    const getHeaders = () => ({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ...` // Validation uses Cookies
    });

    const handleFetch = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/domains/list`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setDomains(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        handleFetch();
        const interval = setInterval(handleFetch, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAdd = async () => {
        if (!newDomain) return;
        if (domains.length >= MAX_DOMAINS) {
            setError(`You've reached the limit of ${MAX_DOMAINS} domains.`);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${baseUrl}/api/domains`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ domain: newDomain }),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add domain');
            setNewDomain('');
            handleFetch();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: string) => {
        setVerifyingId(id);
        try {
            const res = await fetch(`${baseUrl}/api/domains/${id}/verify`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            // Refresh
            handleFetch();
            alert('Domain verified! SSL is active.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setVerifyingId(null);
        }
    };

    const handleDelete = async (id: string, domain: string) => {
        if (!confirm(`Are you sure you want to delete "${domain}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`${baseUrl}/api/domains/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete domain');

            // Refresh list
            handleFetch();
            alert('Domain deleted successfully');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const isLimitReached = domains.length >= MAX_DOMAINS;

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                                <Globe className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                                Custom Domains
                            </h1>
                        </div>
                        <p className="text-gray-500 text-lg max-w-lg">
                            Elevate your brand by connecting your professional domain to your booking page.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3">
                            <div className="flex -space-x-1">
                                {[...Array(MAX_DOMAINS)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full border-2 border-white ${i < domains.length ? 'bg-blue-600' : 'bg-gray-200'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                                {domains.length} / {MAX_DOMAINS} Used
                            </span>
                        </div>
                        <button
                            onClick={handleFetch}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Refresh list"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Add Domain Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-gray-200/70">
                    <div className="p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Add New Domain</h2>
                            {isLimitReached && (
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                    Limit Reached
                                </span>
                            )}
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="e.g. meetings.yourcompany.com"
                                className={`w-full pl-4 pr-32 py-4 bg-gray-50 border-2 rounded-xl text-gray-900 text-lg transition-all focus:ring-4 outline-none ${isLimitReached
                                    ? 'border-gray-100 cursor-not-allowed text-gray-400'
                                    : 'border-gray-100 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white'
                                    }`}
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                disabled={isLimitReached || loading}
                            />
                            <div className="absolute right-2 top-2 bottom-2">
                                <button
                                    onClick={handleAdd}
                                    disabled={loading || !newDomain || isLimitReached}
                                    className="h-full bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:scale-100 font-bold transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span>Connect</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isLimitReached ? (
                            <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 italic text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>You have reached the maximum of {MAX_DOMAINS} domains. Delete an existing domain to add a new one.</p>
                            </div>
                        ) : error ? (
                            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <p>{error}</p>
                            </div>
                        ) : (
                            <p className="mt-4 text-gray-400 text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Enter your domain or subdomain without http/https.
                            </p>
                        )}
                    </div>
                </div>

                {/* Domain List Section */}
                <div className="space-y-6">
                    {domains.length > 0 ? (
                        domains.map(d => (
                            <DomainCard
                                key={d._id}
                                domain={d}
                                onDelete={handleDelete}
                                onVerify={handleVerify}
                                onCopy={copyToClipboard}
                                verifyingId={verifyingId}
                            />
                        ))
                    ) : (
                        !loading && (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Globe className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-700">No Domains Found</h3>
                                <p className="text-gray-400 mt-2 max-w-sm mx-auto">
                                    Add your first custom domain to get started with professional scheduling.
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

// Sub-component for individual domain card to keep things clean
const DomainCard = ({ domain: d, onDelete, onVerify, onCopy, verifyingId }: any) => {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{d.domain}</h3>
                            {d.verified ? (
                                <div className="p-1 bg-emerald-100 rounded-full" title="Verified">
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                </div>
                            ) : (
                                <div className="p-1 bg-amber-100 rounded-full" title="Action Required">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <StatusBadge
                                variant={d.verified ? 'success' : 'warning'}
                                label={d.verified ? 'Verified' : 'Verification Required'}
                            />
                            {d.verified && (
                                <StatusBadge
                                    variant={d.sslStatus === 'issued' ? 'success' : d.sslStatus === 'failed' ? 'error' : 'info'}
                                    label={`SSL: ${d.sslStatus === 'issued' ? 'Active' : d.sslStatus.charAt(0).toUpperCase() + d.sslStatus.slice(1)}`}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onDelete(d._id, d.domain)}
                            className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                            title="Delete domain"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110" />
                        </button>
                    </div>
                </div>

                {d.sslError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-sm text-red-600 italic">
                            <span className="font-bold">SSL Error:</span> {d.sslError}
                        </p>
                    </div>
                )}

                {/* Setup Instructions for unverified domains */}
                {!d.verified && (
                    <div className="mt-8 bg-gray-50/80 rounded-2xl border border-gray-100 p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Plus className="w-5 h-5 text-white" />
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">Setup Instructions</h4>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Step 1 */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <h5 className="font-bold text-gray-700">Point your domain</h5>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Log in to your DNS provider (e.g. GoDaddy) and add an <span className="font-bold text-gray-700">A Record</span> pointing to our server.
                                </p>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium uppercase tracking-wider">Type</span>
                                        <code className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">A</code>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium uppercase tracking-wider">Host</span>
                                        <code className="text-gray-700 font-bold bg-gray-50 px-2 py-0.5 rounded">@ (or subdomain)</code>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium uppercase tracking-wider">Value</span>
                                        <code className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-right">15.207.156.186</code>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <h5 className="font-bold text-gray-700">Verify Ownership</h5>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    Add this <span className="font-bold text-gray-700">TXT Record</span> to authorize your domain.
                                </p>
                                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium uppercase tracking-wider">Type</span>
                                        <code className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">TXT</code>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400 font-medium uppercase tracking-wider">Host</span>
                                        <code className="text-gray-700 font-bold bg-gray-50 px-2 py-0.5 rounded break-all">_verify.{d.domain}</code>
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center justify-between text-xs mb-1">
                                            <span className="text-gray-400 font-medium uppercase tracking-wider">Value</span>
                                            <button
                                                onClick={() => onCopy(d.verificationToken)}
                                                className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                            >
                                                <Copy className="w-3 h-3" /> Copy
                                            </button>
                                        </div>
                                        <code className="block w-full text-xs font-mono text-emerald-600 bg-emerald-50 p-2 rounded break-all">
                                            {d.verificationToken}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-200/50">
                            <div className="flex items-start gap-3">
                                <RefreshCw className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs text-gray-500 font-medium italic">
                                        DNS changes can take up to 24 hours to propagate globally.
                                    </p>
                                    <p className="text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                                        SSL auto-activates on first visit
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onVerify(d._id)}
                                disabled={verifyingId === d._id}
                                className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-gray-200 hover:bg-black active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {verifyingId === d._id && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Verify Records</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatusBadge = ({ variant, label }: { variant: 'success' | 'warning' | 'error' | 'info', label: string }) => {
    const styles = {
        success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border-amber-100',
        error: 'bg-red-50 text-red-700 border-red-100',
        info: 'bg-blue-50 text-blue-700 border-blue-100'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
            {label}
        </span>
    );
};

export default CustomDomain;
