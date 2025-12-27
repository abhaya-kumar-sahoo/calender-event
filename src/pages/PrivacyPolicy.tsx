import { Shield, Lock, Eye, FileText, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
        {/* Header */}
        <div className='bg-blue-600 px-8 py-10 text-white text-center'>
          <div className='mx-auto w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold mb-2'>
            Privacy Policy
          </h1>
          <p className='text-blue-100'>Last updated: December 27, 2025</p>
        </div>

        <div className='p-8 sm:p-12 space-y-10 text-gray-700 leading-relaxed font-sans'>
          <section>
            <p className='text-lg'>
              This Privacy Policy describes how <strong>Tesseract</strong>{' '}
              collects, uses, and protects your information when you use our
              website and services. By accessing or using our website, you agree
              to the collection and use of information in accordance with this
              policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <FileText className='w-6 h-6 text-blue-600' />
              1. Information We Collect
            </h2>
            <div className='grid md:grid-cols-2 gap-6'>
              <div className='bg-gray-50 p-6 rounded-xl border border-gray-100'>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Personal Information
                </h3>
                <p className='text-sm mb-2'>
                  We may collect personal information that you voluntarily
                  provide:
                </p>
                <ul className='list-disc list-inside space-y-1 text-sm text-gray-600 ml-1'>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Account or profile information</li>
                  <li>Information from forms/communications</li>
                </ul>
              </div>
              <div className='bg-gray-50 p-6 rounded-xl border border-gray-100'>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Usage & Technical Information
                </h3>
                <p className='text-sm mb-2'>
                  We automatically collect certain technical data:
                </p>
                <ul className='list-disc list-inside space-y-1 text-sm text-gray-600 ml-1'>
                  <li>IP address</li>
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>Pages visited and time spent</li>
                  <li>Referring URLs</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Eye className='w-6 h-6 text-blue-600' />
              2. How We Use Your Information
            </h2>
            <ul className='space-y-3'>
              {[
                'Provide and maintain our services',
                'Process requests and respond to inquiries',
                'Improve website functionality and performance',
                'Communicate important updates or service-related messages',
                'Detect, prevent, and address technical or security issues',
                'Comply with legal obligations',
              ].map((item, i) => (
                <li key={i} className='flex items-start gap-3'>
                  <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 flex-shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              3. Cookies & Tracking Technologies
            </h2>
            <p className='mb-4'>
              We may use cookies and similar technologies to:
            </p>
            <ul className='list-disc list-inside space-y-2 ml-4 mb-4'>
              <li>Maintain user sessions</li>
              <li>Analyze traffic and usage patterns</li>
              <li>Improve site functionality</li>
            </ul>
            <p className='text-sm text-gray-500 italic'>
              You can control or disable cookies through your browser settings.
              Disabling cookies may affect some features of the website.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              4. Data Sharing & Disclosure
            </h2>
            <p className='mb-4 font-medium '>
              We do not sell or rent your personal data.
            </p>
            <p className='mb-3'>
              We may share information only in the following cases:
            </p>
            <ul className='list-disc list-inside space-y-2 ml-4'>
              <li>
                With trusted service providers who assist in operating our
                website (hosting, analytics, etc.)
              </li>
              <li>When required by law or legal process</li>
              <li>
                To protect the rights, property, or safety of our users or
                services
              </li>
            </ul>
            <p className='mt-4 text-sm text-gray-600'>
              All third-party services are required to handle data securely and
              confidentially.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Lock className='w-6 h-6 text-blue-600' />
              5. Data Security
            </h2>
            <p className='mb-4'>
              We implement reasonable technical and organizational security
              measures to protect your information against:
            </p>
            <ul className='list-disc list-inside space-y-2 ml-4 mb-4'>
              <li>Unauthorized access</li>
              <li>Data loss or misuse</li>
              <li>Alteration or disclosure</li>
            </ul>
            <p className='text-sm text-gray-500 bg-yellow-50 p-4 rounded-lg border border-yellow-100'>
              However, no method of transmission over the internet is 100%
              secure.
            </p>
          </section>

          <section className='grid md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                6. Data Retention
              </h2>
              <p className='mb-2'>
                We retain personal data only for as long as necessary to:
              </p>
              <ul className='list-disc list-inside space-y-1 ml-2 text-sm text-gray-600'>
                <li>Fulfill the purposes outlined in this policy</li>
                <li>
                  Comply with legal, accounting, or reporting requirements
                </li>
              </ul>
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                7. Your Rights
              </h2>
              <p className='mb-2'>
                Depending on your jurisdiction, you may have the right to:
              </p>
              <ul className='list-disc list-inside space-y-1 ml-2 text-sm text-gray-600'>
                <li>Access your personal data</li>
                <li>Request correction or deletion</li>
                <li>Object to or restrict processing</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </div>
          </section>

          <div className='border-t border-gray-100 my-8' />

          <section className='grid sm:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-3'>
                8. Third-Party Links
              </h2>
              <p className='text-sm text-gray-600'>
                Our website may contain links to third-party websites. We are
                not responsible for the privacy practices or content of those
                sites.
              </p>
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-3'>
                9. Children’s Privacy
              </h2>
              <p className='text-sm text-gray-600'>
                Our services are not intended for children under the age of 13.
                We do not knowingly collect personal information from children.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated “Last updated” date.
            </p>
          </section>

          {/* Contact Section */}
          <section className='bg-blue-50 rounded-xl p-8 text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>
              11. Contact Us
            </h2>
            <p className='mb-6 text-gray-600'>
              If you have any questions or concerns about this Privacy Policy or
              your data, contact us at:
            </p>
            <a
              href='mailto:heritagelanefurniture@gmail.com'
              className='inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors'
            >
              <Mail className='w-5 h-5' />
              heritagelanefurniture@gmail.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
