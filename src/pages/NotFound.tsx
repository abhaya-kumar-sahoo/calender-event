import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
    const currentDomain = window.location.hostname;
    const isCustomDomain = currentDomain !== 'localhost' && !currentDomain.includes('127.0.0.1');

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
            <div className="max-w-2xl mx-auto px-6 text-center">
                <div className="bg-white rounded-2xl shadow-xl p-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <AlertTriangle className="w-16 h-16 text-red-600" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>

                    {isCustomDomain ? (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Domain Not Verified
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Your domain is not authorized to access this application.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                                <h3 className="font-semibold text-blue-900 mb-3">To use this domain:</h3>
                                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                                    <li>Log in to your account on the main application</li>
                                    <li>Navigate to the "Custom Domains" section</li>
                                    <li>Add and verify this domain following the instructions</li>
                                    <li>Wait for DNS propagation (5-10 minutes)</li>
                                </ol>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                                Page Not Found
                            </h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                The page you're looking for doesn't exist or has been moved.
                            </p>
                        </>
                    )}


                </div>
            </div>
        </div>
    );
};

export default NotFound;
