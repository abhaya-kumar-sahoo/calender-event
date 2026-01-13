import { useEffect, useState } from 'react';
import { baseUrl } from '../utils';
import NotFound from '../pages/NotFound';

interface DomainGuardProps {
    children: React.ReactNode;
}

const DomainGuard = ({ children }: DomainGuardProps) => {
    const [isValidDomain, setIsValidDomain] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkDomain = async () => {
            try {
                // Get current hostname
                const currentDomain = window.location.hostname;

                // Default domains that always have access (no verification needed)
                const defaultDomains = [
                    'appointment.equartistech.com',
                    'localhost',
                    '127.0.0.1'
                ];

                // Skip check for default domains and development
                if (
                    defaultDomains.includes(currentDomain) ||
                    currentDomain.includes('localhost:') ||
                    currentDomain.includes('127.0.0.1:')
                ) {
                    setIsValidDomain(true);
                    setIsLoading(false);
                    return;
                }

                // Check if domain is whitelisted
                const res = await fetch(`${baseUrl}/check-domain?domain=${currentDomain}`);

                if (res.ok) {
                    // Domain is verified and whitelisted
                    setIsValidDomain(true);
                } else {
                    // Domain not found or not verified
                    setIsValidDomain(false);
                }
            } catch (error) {
                console.error('Domain check failed:', error);
                // Fail-closed: Block access on API errors for security
                setIsValidDomain(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkDomain();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying domain...</p>
                </div>
            </div>
        );
    }

    if (isValidDomain === false) {
        return <NotFound />;
    }

    return <>{children}</>;
};

export default DomainGuard;
