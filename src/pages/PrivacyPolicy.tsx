import { Shield, Eye, Lock, FileText, Mail, ArrowLeft, CreditCard, Database, RefreshCcw, UserPlus, Info, Share2, MousePointer2, PieChart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans'>
      <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden'>
        {/* Header */}
        <div className='bg-blue-600 px-8 py-10 text-white text-center flex flex-col items-center'>
          <div className='w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm shadow-inner'>
            <Shield className='w-8 h-8 text-white' />
          </div>
          <h1 className='text-3xl sm:text-4xl font-bold mb-2'>
            Privacy Policy
          </h1>
          <p className='text-blue-100 italic font-medium'>Heritage Lane & Co.</p>
          <p className='text-blue-200 text-sm mt-1'>Last updated: January 2, 2026</p>
        </div>

        <div className='p-8 sm:p-12 space-y-12 text-gray-700 leading-relaxed font-sans'>
          {/* Introduction */}
          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Info className='w-6 h-6 text-blue-600' />
              Introduction
            </h2>
            <p className='text-lg'>
              Heritage Lane & Co is a retail business selling homewares and associated products. As part of our store and online operations, we collect information from individuals. We respect and protect the privacy of all personal information provided to us.
            </p>
          </section>

          <section className='bg-blue-50 p-6 rounded-2xl border border-blue-100'>
            <h2 className='text-xl font-bold text-blue-900 mb-2 flex items-center gap-2'>
              <RefreshCcw className='w-5 h-5' />
              Changes to our Privacy Policy
            </h2>
            <p className='text-sm text-blue-800'>
              We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal requirements. Any updates will be posted on our website. We encourage you to review this Policy regularly to stay informed about how we protect your personal information.
            </p>
          </section>

          {/* The Information We Collect */}
          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Database className='w-6 h-6 text-blue-600' />
              The Information We Collect
            </h2>
            <p className='mb-4'>Where reasonable and practicable, we collect information directly from you. Personal information collected includes (but is not limited to):</p>
            <div className='grid sm:grid-cols-2 gap-4 mb-6'>
              {['Name', 'Address', 'Contact details', 'Transaction Information'].map((item, i) => (
                <div key={i} className='bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 text-sm font-medium'>
                  {item}
                </div>
              ))}
            </div>
            <p className='font-semibold text-gray-900 mb-2'>Personal information is collected for the following purposes:</p>
            <ul className='space-y-2 mb-4'>
              {[
                'To provide you with appropriate products and/or services',
                'To consider applications or requests you submit',
                'To maintain accurate contact details',
                'To comply with legal obligations'
              ].map((item, i) => (
                <li key={i} className='flex gap-3 text-sm'>
                  <span className='w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0' />
                  {item}
                </li>
              ))}
            </ul>
            <p>We may also collect data via cookies and similar technologies to enhance your online experience.</p>
          </section>

          {/* Dealing with Heritage Lane & Co Online */}
          <section className='space-y-6'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2'>
              <MousePointer2 className='w-6 h-6 text-blue-600' />
              Dealing with Heritage Lane & Co Online
            </h2>

            <div className='grid gap-6'>
              <div className='p-6 bg-gray-50 rounded-2xl border border-gray-100'>
                <h3 className='font-bold text-gray-900 mb-2 flex items-center gap-2'>
                  <FileText className='w-5 h-5 text-blue-500' />
                  Data You Explicitly Provide
                </h3>
                <p className='text-sm italic'>When you place an order, create an account, or email us, we collect the information you submit. We also record your email address if you contact us via email.</p>
              </div>

              <div className='p-6 bg-red-50 rounded-2xl border border-red-100'>
                <h3 className='font-bold text-red-900 mb-2 flex items-center gap-2'>
                  <CreditCard className='w-5 h-5 text-red-500' />
                  Credit Card Handling
                </h3>
                <p className='text-red-800 font-semibold'>Credit card details provided for online purchases are destroyed immediately after your payment has been processed.</p>
              </div>

              <div className='p-6 bg-gray-50 rounded-2xl border border-gray-100'>
                <h3 className='font-bold text-gray-900 mb-2'>Website Log Data</h3>
                <p className='text-sm mb-2'>When you browse, read, or download information from our website, our systems log anonymised website activity.</p>
                <p className='text-xs text-gray-500'>These logs are not personally identifiable, and we do not attempt to link them to individuals unless required by law or for fraud prevention.</p>
              </div>

              <div className='p-6 bg-blue-50 rounded-2xl border border-blue-100'>
                <h3 className='font-bold text-blue-900 mb-2 flex items-center gap-2'>
                  <Lock className='w-5 h-5 text-blue-500' />
                  Account Security
                </h3>
                <ul className='text-sm space-y-1 text-blue-800'>
                  <li>• Your account is password protected.</li>
                  <li>• Do not share your password with anyone.</li>
                  <li>• Login sessions automatically expire after periods of inactivity.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How Information is Used */}
          <section>
            <h2 className='text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <Eye className='w-6 h-6 text-blue-600' />
              How the Information is Used
            </h2>
            <p className='mb-4'>We use and disclose personal information only for the purposes for which it was collected or for related business functions. We <strong>do not</strong> sell, rent, or trade personal information to third parties.</p>
            <div className='bg-green-50 p-6 rounded-2xl border border-green-100 mb-6'>
              <h3 className='font-bold text-green-900 mb-2'>Opt-Out</h3>
              <p className='text-sm text-green-800'>You may opt out of promotional communications at any time via the unsubscribe link or by contacting us directly.</p>
            </div>
          </section>

          {/* Subscriptions & Meta */}
          <section className='grid md:grid-cols-2 gap-8'>
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <UserPlus className='w-5 h-5 text-blue-600' />
                Data Collection
              </h2>
              <p className='text-sm text-gray-600'>By subscribing, creating an account, or signing in via Facebook, Google, or Apple, you agree to be contacted via email or SMS by Heritage Lane & Co.</p>
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <Share2 className='w-5 h-5 text-blue-600' />
                Meta Leads Campaigns
              </h2>
              <p className='text-sm text-gray-600'>As part of Meta (Facebook/Instagram) leads campaigns, we collect: First name and Email address for personalised updates. All collection complies with APPs.</p>
            </div>
          </section>

          {/* Contact Section */}
          <section className='bg-blue-600 rounded-4xl p-10 text-white text-center relative overflow-hidden'>
            <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16' />
            <h2 className='text-2xl font-bold mb-4 relative z-10'>Contact Us</h2>
            <p className='mb-6 relative z-10 opacity-90'>For questions about your privacy or how we handle information:</p>
            <div className='flex flex-col items-center gap-4 relative z-10'>
              <a href="mailto:customerservice@heritagelaneco.com.au" className='flex items-center gap-2 bg-white/20 px-6 py-3 rounded-xl hover:bg-white/30 transition-colors'>
                <Mail className='w-5 h-5' />
                customerservice@heritagelaneco.com.au
              </a>
              <span className='font-bold text-xl'>(03) 9825 9400</span>
              <p className='text-xs opacity-70 mt-2 italic'>Registered name: Australia China Investment Company Pty Ltd</p>
            </div>
          </section>

          {/* Cookies Section */}
          <section className='pt-12 border-t border-gray-100'>
            <h2 className='text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3'>
              <Database className='w-8 h-8 text-blue-600' />
              Cookies
            </h2>
            <p className='mb-4'>A cookie is a small file placed on your device that allows us to monitor usage and improve functionality. Cookies <strong>do not</strong> give us access to your device or personal information beyond what you share.</p>

            <div className='space-y-6 mt-8'>
              <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100'>
                <h3 className='font-bold text-gray-900 mb-4'>List of Cookies We Collect</h3>
                <div className='space-y-6'>
                  <div>
                    <h4 className='text-blue-600 font-bold text-sm uppercase tracking-wider mb-2'>Strictly Necessary</h4>
                    <p className='text-xs text-gray-500 mb-2'>Provider: Magento 2</p>
                    <p className='text-sm'>add_to_cart, guest-view, login_redirect, form_key, mage-cache-sessid, persistent_shopping_cart, store</p>
                  </div>
                  <div>
                    <h4 className='text-blue-600 font-bold text-sm uppercase tracking-wider mb-2'>Functionality</h4>
                    <p className='text-xs text-gray-500 mb-2'>Provider: Magento 2</p>
                    <p className='text-sm'>login_redirect, mage-messages, product_data_storage, recently_viewed_product</p>
                  </div>
                </div>
              </div>

              <div className='grid sm:grid-cols-2 gap-4'>
                <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100'>
                  <h3 className='font-bold text-gray-900 mb-2 flex items-center gap-2'>
                    <PieChart className='w-5 h-5 text-blue-500' />
                    Google Analytics
                  </h3>
                  <p className='text-xs leading-relaxed'>Features: Remarketing, Display Network Impression Reporting, Demographics & Interests Reporting, Performance Max Campaigns.</p>
                </div>
                <div className='bg-gray-50 p-6 rounded-2xl border border-gray-100'>
                  <h3 className='font-bold text-gray-900 mb-2 flex items-center gap-2'>
                    <Share2 className='w-5 h-5 text-blue-500' />
                    Meta & Pinterest
                  </h3>
                  <p className='text-xs leading-relaxed'>Tools: Facebook Insights, Instagram Insights, Pinterest Tag. Used to track behavior and optimize advertising performance.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="bg-gray-100 px-8 py-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
