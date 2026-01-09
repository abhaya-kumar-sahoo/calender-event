import { useState, useEffect } from 'react';
import {
    Globe,
    CheckCircle,
    AlertCircle,
    Loader2,
    Copy,
    RefreshCw,
    Plus
} from 'lucide-react';

interface Domain {
    _id: string;
    domain: string;
    verificationToken: string;
    verified: boolean;
    sslStatus: 'none' | 'pending' | 'issued' | 'failed';
    sslError?: string;
    createdAt: string;
}

const CustomDomain = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [newDomain, setNewDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ...` // Validation uses Cookies
    });

    const handleFetch = async () => {
        try {
            const res = await fetch(`${API_BASE}/domains/list`, {
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
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/domains`, {
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
            const res = await fetch(`${API_BASE}/domains/${id}/verify`, {
                method: 'POST',
                headers: getHeaders(),
                credentials: 'include'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Verification failed');
            // Refresh
            handleFetch();
            alert('Domain verified! SSL provisioning started.');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setVerifyingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Globe className="w-8 h-8 text-blue-600" />
                        Custom Domains
                    </h1>
                    <p className="text-gray-500 mt-2">Connect your own domain to your appointment page.</p>
                </div>
                <button onClick={handleFetch} className="text-gray-600 hover:text-gray-900">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Add Domain Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold mb-4 text-gray-700">Add New Domain</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="e.g. meetings.mycompany.com"
                        className="flex-1 px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                    />
                    <button
                        onClick={handleAdd}
                        disabled={loading || !newDomain}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add Domain
                    </button>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {/* Domain List */}
            <div className="space-y-4">
                {domains.map(d => (
                    <div key={d._id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    {d.domain}
                                    {d.verified ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-yellow-500" />}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${d.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {d.verified ? 'Verified' : 'Verification Required'}
                                    </span>
                                    {d.verified && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${d.sslStatus === 'issued' ? 'bg-green-100 text-green-700' : d.sslStatus === 'failed' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                            SSL: {d.sslStatus.toUpperCase()}
                                        </span>
                                    )}
                                    {d.sslError && (
                                        <span className="text-xs text-red-600" title={d.sslError}>Error: {d.sslError.substring(0, 50)}...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Verification Steps */}
                        {!d.verified && (
                            <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-blue-600" />
                                    Setup Instructions
                                </h4>

                                {/* Step 1: A Record */}
                                <div className="mb-6 pb-6 border-b border-gray-200">
                                    <h5 className="text-sm font-bold text-gray-700 mb-2">Step 1: Point your domain</h5>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Log in to your DNS provider (e.g., GoDaddy, Namecheap) and add an <strong>A Record</strong> pointing to our server.
                                    </p>
                                    <div className="flex items-center gap-4 text-sm bg-white p-3 rounded border">
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Type:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">A</code>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Host:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">@</code> (or subdomain)
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Value:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">15.207.156.186</code>
                                            {/* Note: User should replace with their actual Public IP */}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        *Replace with the Public IP of your appointment server.
                                    </p>
                                </div>

                                {/* Step 2: TXT Record */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-700 mb-2">Step 2: Verify ownership</h5>
                                    <p className="text-sm text-gray-600 mb-3">Add this <strong>TXT Record</strong> to prove you own the domain.</p>
                                    <div className="flex items-center gap-4 text-sm bg-white p-3 rounded border">
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Type:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">TXT</code>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Host:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">_verify.{d.domain}</code>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-gray-500 mr-4">Value:</span>
                                            <code className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded break-all">{d.verificationToken}</code>
                                        </div>
                                        <button onClick={() => copyToClipboard(d.verificationToken)} className="text-blue-600 hover:text-blue-800" title="Copy Token">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="mt-6 flex justify-end items-center gap-4">
                                        <p className="text-xs text-gray-500">
                                            DNS changes may take up to 24 hours to propagate.
                                        </p>
                                        <button
                                            onClick={() => handleVerify(d._id)}
                                            disabled={verifyingId === d._id}
                                            className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-black disabled:opacity-50 flex items-center gap-2 font-medium"
                                        >
                                            {verifyingId === d._id && <Loader2 className="w-4 h-4 animate-spin" />}
                                            I've added the records, Verify Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {domains.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12">
                        No custom domains added yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomDomain;
