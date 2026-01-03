import { Gavel, Mail, ArrowLeft, FileText, Shield, Info, CreditCard, Truck, RefreshCcw, Lock, Globe, Scale, AlertTriangle, UserCheck, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
    const sections = [
        {
            title: "Accuracy of Information",
            icon: <Info className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Heritage Lane & Co. takes all reasonable measures to provide accurate product descriptions, specifications, dimensions, colours, and pricing. However, occasional errors, variations, or omissions may occur. Information is provided on an “as-is” basis without warranties, except where not permitted under Australian law.</p>
            )
        },
        {
            title: "Eligibility & Account Information",
            icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-4">
                    <p>To make purchases, you must provide accurate personal information, including full name, contact details, billing address, and valid payment details.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="font-semibold mb-2">By placing an order, you confirm that:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>All provided information is true and correct</li>
                            <li>You are authorised to use the selected payment method</li>
                            <li>You are at least 18 years old</li>
                        </ul>
                    </div>
                    <p>If you register an account, you are responsible for maintaining confidentiality of login credentials. Heritage Lane & Co. may refuse service, cancel orders, or terminate accounts at their discretion.</p>
                </div>
            )
        },
        {
            title: "User Warranties",
            icon: <Shield className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-2">
                    <p className="font-semibold">You agree NOT to:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Provide false or incomplete details</li>
                        <li>Engage in fraudulent transactions</li>
                        <li>Post unlawful, defamatory, or harmful content</li>
                        <li>Interfere with site performance or security</li>
                        <li>Upload malicious code or disrupt system operations</li>
                        <li>Reproduce or commercially exploit site content without permission</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Personal Use Only",
            icon: <Lock className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>All content is for personal, non-commercial use. Republishing, distributing, modifying, or exploiting materials without written consent is prohibited.</p>
            )
        },
        {
            title: "Limitation of Liability",
            icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-3">
                    <p>Your use of the site is at your own risk. To the extent permitted by law, Heritage Lane & Co. is not liable for:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Business interruption</li>
                        <li>Delays, access issues, or corrupted data</li>
                        <li>Technical issues, viruses, or failures</li>
                        <li>Content inaccuracies</li>
                        <li>Loss of revenue, profits, data, or opportunities</li>
                    </ul>
                    <p>They are also not responsible for events outside reasonable control.</p>
                </div>
            )
        },
        {
            title: "Indemnity",
            icon: <Scale className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-2">
                    <p>You agree to indemnify Heritage Lane & Co. from claims, losses, damages, or legal costs arising from:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Breach of these Terms</li>
                        <li>Misuse of the website</li>
                        <li>Inaccurate information or misconduct</li>
                    </ul>
                </div>
            )
        },
        {
            title: "Product Availability & Colour Accuracy",
            icon: <RefreshCcw className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-2">
                    <p>Furniture is handcrafted from natural materials, resulting in variations in colour, grain, and texture. Product colours may appear differently on various screens.</p>
                    <p>Availability is not guaranteed; some items may be limited or restricted geographically.</p>
                </div>
            )
        },
        {
            title: "Pricing",
            icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Prices are in AUD and may change without notice.</p>
            )
        },
        {
            title: "Right to Decline Orders",
            icon: <Gavel className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-3">
                    <p>Orders may be cancelled or rejected before dispatch due to:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Pricing errors</li>
                        <li>Insufficient stock</li>
                        <li>Incorrect customer information</li>
                    </ul>
                    <p className="text-sm italic">Order confirmation emails acknowledge receipt but do not constitute acceptance. A binding contract forms only at dispatch.</p>
                </div>
            )
        },
        {
            title: "Order Cancellation by Customer",
            icon: <XCircle className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Once an order is submitted and confirmed, it cannot be cancelled. Special or custom-made orders are strictly final.</p>
            )
        },
        {
            title: "Passing of Title & Risk",
            icon: <Scale className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Ownership and risk transfer to the customer at dispatch.</p>
            )
        },
        {
            title: "Delivery",
            icon: <Truck className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-3">
                    <p className="font-semibold">Customers are responsible for:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Providing accurate delivery details</li>
                        <li>Ensuring access for delivery</li>
                        <li>Paying additional delivery fees</li>
                    </ul>
                    <p>Delivery dates are estimates only. Delays may lead to rescheduling or refunds at the company’s discretion.</p>
                </div>
            )
        },
        {
            title: "Payment",
            icon: <CreditCard className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Accepted payment methods are listed at checkout. All payments must be validated before processing.</p>
            )
        },
        {
            title: "Privacy",
            icon: <Shield className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>Personal information is collected and handled according to Australian privacy laws. Refer to the Privacy Policy for details.</p>
            )
        },
        {
            title: "Intellectual Property",
            icon: <FileText className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>All designs, images, text, logos, artwork, and content are owned by Heritage Lane & Co. and protected by copyright. Unauthorised use is prohibited.</p>
            )
        },
        {
            title: "General",
            icon: <Gavel className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>If any clause is unenforceable, the remainder remains valid. Terms are governed by Victorian law.</p>
            )
        },
        {
            title: "Overseas Access",
            icon: <Globe className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>The website may be accessed internationally, but products are primarily available within Australia. International users must comply with local laws.</p>
            )
        },
        {
            title: "Consumer Guarantees",
            icon: <Scale className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-4">
                    <p>Products include consumer guarantees under Australian Consumer Law. Customers may be entitled to repair, replacement, or refund for major failures.</p>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <p className="font-semibold text-red-900 mb-2">The warranty does not cover:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                            <li>Misuse, damage, or alteration</li>
                            <li>Repairs by unauthorised persons</li>
                            <li>Abnormal use or poor maintenance</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Force Majeure",
            icon: <AlertTriangle className="w-6 h-6 text-indigo-600" />,
            content: (
                <p>The company is not liable for delays caused by events beyond control, including natural disasters, outages, transport disruptions, or essential service failures.</p>
            )
        }
    ];

    const additionalSections = [
        {
            title: "Third-Party Integrations",
            icon: <Globe className="w-6 h-6 text-indigo-600" />,
            content: (
                <div className="space-y-3">
                    <p>Our services may integrate with third-party applications and services (such as Google Calendar or Payment Gateways) to enhance functionality.</p>
                    <p>By using these features, you acknowledge that:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>We are not responsible for the availability or accuracy of these external services.</li>
                        <li>Your use of third-party services is subject to their respective terms and privacy policies.</li>
                        <li>Specifically for Google Calendar, we access your data only to facilitate booking and scheduling functions as described in our Privacy Policy.</li>
                    </ul>
                </div>
            )
        }
    ];

    const allSections = [...sections, ...additionalSections];

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans'>
            <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
                {/* Header */}
                <div className='bg-indigo-600 px-8 py-10 text-white text-center flex flex-col items-center'>
                    <div className='w-16 h-16 bg-indigo-500/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner'>
                        <Gavel className='w-8 h-8 text-white' />
                    </div>
                    <h1 className='text-3xl sm:text-4xl font-bold mb-2'>
                        Terms & Conditions
                    </h1>
                    <p className='text-indigo-100 italic font-medium'>Heritage Lane & Co.</p>
                    <p className='text-indigo-200 text-sm mt-1'>Last updated: January 2, 2026</p>
                </div>

                <div className='p-8 sm:p-12 space-y-8'>
                    <p className='text-gray-600 text-lg leading-relaxed'>
                        Welcome to <strong>Heritage Lane & Co.</strong> These Terms & Conditions govern your use of our website and purchase of our products. By accessing our site, you agree to be bound by these terms.
                    </p>

                    <div className='grid gap-8'>
                        {allSections.map((section, index) => (
                            <section key={index} className='border-b border-gray-100 pb-8 last:border-0'>
                                <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-3'>
                                    <div className="bg-indigo-50 p-2 rounded-lg">
                                        {section.icon}
                                    </div>
                                    {section.title}
                                </h2>
                                <div className='text-gray-600 leading-relaxed pl-1'>
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>

                    <section className='bg-indigo-50 rounded-2xl p-8 text-center mt-12'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                            Questions?
                        </h2>
                        <p className='mb-6 text-gray-600'>
                            If you have any questions about these Terms, please contact us at:
                        </p>
                        <a
                            href='mailto:heritagelanefurniture@gmail.com'
                            className='inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors text-lg'
                        >
                            <Mail className='w-5 h-5' />
                            heritagelanefurniture@gmail.com
                        </a>
                    </section>
                </div>

                <div className="bg-gray-100 px-8 py-6 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
