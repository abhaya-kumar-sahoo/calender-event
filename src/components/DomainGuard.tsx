import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../utils';

interface DomainGuardProps {
    children: React.ReactNode;
}

const DomainGuard = ({ children }: DomainGuardProps) => {
    const navigate = useNavigate();
    const [isValidDomain, setIsValidDomain] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkDomain = async () => {
            try {
                // Get current hostname
                const currentDomain = window.location.hostname;

                // Skip check for localhost and development
                if (
                    currentDomain === 'localhost' ||
                    currentDomain === '127.0.0.1' ||
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
                // On error, allow access (fail open for development)
                setIsValidDomain(true);
            } finally {
                setIsLoading(false);
            }
        };

        checkDomain();
    }, []);

    useEffect(() => {
        if (isValidDomain === false) {
            // Redirect to 404 page
            navigate('/404', { replace: true });
        }
    }, [isValidDomain, navigate]);

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
        return null; // Will redirect to 404
    }

    return <>{children}</>;
};

export default DomainGuard;
