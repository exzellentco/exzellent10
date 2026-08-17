import React from "react";
import logo from '../../assets/Exzellent_logo.png';

const Privacy = () => {
    return (
        <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-8 text-white">
        <div className="w-full max-w-3xl rounded-md border border-border bg-bg2 p-12">
            <div className="h-20 mb-10 flex items-center"><img src={logo} className="h-75 w-full object-contain" /></div>
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white tracking-tight">Privacy Policy</h1>

            <p className="mb-4">At Exzellent Language Institute ("Exzellent", "we", "us", or "our"), your privacy is a priority. This Privacy Policy outlines how we collect, use, store, disclose, and protect your personal data across our platforms including our website, mobile applications, communication channels (e.g., WhatsApp, Telegram), and learning management systems.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">1. Scope of This Policy</h2>
            <p className="font-semibold mb-2">This Privacy Policy applies to:</p>
            <ul className="list-disc list-inside mb-4">
            <li>All visitors and users of our website (https://www.exzellent.co).</li>
            <li>Registered students or learners on our platform.</li>
            <li>Communication via email, live chat, WhatsApp, Telegram, and phone.</li>
            <li>Payments processed through third-party gateways.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">2. Information We Collect</h2>
            
            <p className="font-semibold mb-2">2.1. Personal Information You Provide</p>
            <p className="mb-2">When you interact with our services, you may voluntarily provide the following:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Registration & Profile Information:</strong> Full name, username, email address, password, phone number, preferred languages.</li>
            <li><strong>Communication:</strong> Feedback, emails, support queries, chats via WhatsApp/Telegram.</li>
            <li><strong>Billing and Payment Data:</strong> Credit/debit card details (via Stripe, PayPal, etc.), billing addresses, and transaction metadata.</li>
            <li><strong>Uploaded Content:</strong> Assignments, audio responses, essays, forum posts.</li>
            <li><strong>Surveys & Forms:</strong> Data submitted through satisfaction surveys, event registrations, etc.</li>
            </ul>

            <p className="font-semibold mb-2">2.2. Information We Collect Automatically</p>
            <p className="mb-2">We automatically collect information to improve our services:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Usage Data:</strong> Device type, operating system, browser type, screen resolution, access times, referring URLs.</li>
            <li><strong>Activity Logs:</strong> Clicks, course progress, quiz attempts, session length, IP address.</li>
            <li><strong>Cookies & Similar Technologies:</strong> Cookies, web beacons, pixel tags for analytics, authentication, and marketing. See Section 7.</li>
            </ul>

            <p className="font-semibold mb-2">2.3. Information from Third Parties</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Social Logins:</strong> If you sign in with Google, Facebook, or LinkedIn, we collect your public profile and email address.</li>
            <li><strong>Payment Processors:</strong> Transaction confirmations and payment metadata.</li>
            <li><strong>Analytics Services:</strong> Google Analytics, Meta Pixel, etc. provide behavioural analytics and anonymized demographics.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">3. How We Use Your Data</h2>
            
            <p className="font-semibold mb-2">3.1. Service Delivery</p>
            <ul className="list-disc list-inside mb-4">
            <li>Authenticate users and manage account access</li>
            <li>Deliver course materials and progress tracking</li>
            <li>Assign certificates of completion</li>
            <li>Provide multilingual support and teacher interaction</li>
            </ul>

            <p className="font-semibold mb-2">3.2. Personalization & Analytics</p>
            <ul className="list-disc list-inside mb-4">
            <li>Recommend language courses based on preferences and history</li>
            <li>Analyse user behaviour for improving UI/UX</li>
            <li>Localize content (language selection, cultural adaptations)</li>
            </ul>

            <p className="font-semibold mb-2">3.3. Communication</p>
            <ul className="list-disc list-inside mb-4">
            <li>Send transactional emails: confirmations, reminders, support responses</li>
            <li>Share newsletters, promotional offers (opt-in)</li>
            <li>Conduct surveys and invite feedback</li>
            </ul>

            <p className="font-semibold mb-2">3.4. Security and Compliance</p>
            <ul className="list-disc list-inside mb-4">
            <li>Detect fraud and ensure system integrity</li>
            <li>Comply with legal obligations, regulatory inspections, tax audits</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">4. Legal Bases for Processing (for EU/UK users)</h2>
            <p className="mb-2">We process your data based on:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Contractual Necessity:</strong> Providing requested services</li>
            <li><strong>Consent:</strong> Marketing, non-essential cookies, and special category data</li>
            <li><strong>Legitimate Interest:</strong> User insights, fraud prevention, business improvement</li>
            <li><strong>Legal Obligation:</strong> Tax, accounting, and anti-money laundering laws</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">5. Sharing and Disclosure</h2>
            
            <p className="font-semibold mb-2">5.1. With Service Providers</p>
            <p className="mb-2">We may share data with trusted vendors, subject to strict contractual terms:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Cloud hosting (e.g., AWS, Google Cloud)</li>
            <li>Payment processors (e.g., Stripe, PayPal)</li>
            <li>CRM and email platforms (e.g., HubSpot, Mailchimp)</li>
            <li>Video hosting and analytics (e.g., Vimeo, YouTube)</li>
            </ul>

            <p className="font-semibold mb-2">5.2. Business Transfers</p>
            <p className="mb-4">If we undergo a merger, acquisition, or asset sale, your data may be transferred. You will be notified and given options to opt-out.</p>

            <p className="font-semibold mb-2">5.3. Legal Requests</p>
            <p className="mb-4">We may disclose data to law enforcement or regulators when legally required.</p>

            <p className="font-semibold mb-2">5.4. Third-Party Integrations</p>
            <p className="mb-4">Embedded tools (e.g., YouTube videos, WhatsApp links) may collect user data independently. Please review their privacy policies separately.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">6. Data Retention</h2>
            <p className="mb-4">We retain data as follows:</p>
            <div className="overflow-x-auto mb-4">
            <table className="w-full table-auto border border-slate-300 rounded-md text-sm">
                <thead className="bg-slate-100 text-text-secondary">
                <tr>
                    <th className="border px-4 py-2 text-left">Data Type</th>
                    <th className="border px-4 py-2 text-left">Retention Period</th>
                </tr>
                </thead>
                <tbody>
                <tr><td className="border px-4 py-2">Account info</td><td className="border px-4 py-2">While active + 2 years</td></tr>
                <tr><td className="border px-4 py-2">Financial records</td><td className="border px-4 py-2">7 years (as per EU tax laws)</td></tr>
                <tr><td className="border px-4 py-2">Course progress</td><td className="border px-4 py-2">While account is active</td></tr>
                <tr><td className="border px-4 py-2">Communication logs</td><td className="border px-4 py-2">3 years</td></tr>
                <tr><td className="border px-4 py-2">Analytics data</td><td className="border px-4 py-2">14–36 months (Google Analytics)</td></tr>
                </tbody>
            </table>
            </div>
            <p className="mb-4">You may request deletion at any time.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">7. Cookies and Tracking</h2>
            <p className="mb-2">We use:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Essential cookies:</strong> Login sessions, language preferences</li>
            <li><strong>Performance cookies:</strong> Google Analytics, Hotjar</li>
            <li><strong>Marketing cookies:</strong> Meta Pixel, Google Ads</li>
            </ul>
            <p className="mb-4">You may:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Adjust preferences in our cookie banner</li>
            <li>Disable cookies via browser settings</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">8. International Data Transfers</h2>
            <p className="mb-2">Your data may be transferred outside the EU. When this occurs, we ensure:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Standard Contractual Clauses (SCCs) or Binding Corporate Rules (BCRs)</li>
            <li>Adequacy decisions where applicable (e.g., Canada, Japan)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">9. Data Security</h2>
            <p className="mb-2">We implement:</p>
            <ul className="list-disc list-inside mb-4">
            <li>TLS encryption for all web and app traffic</li>
            <li>AES-256 encryption at rest</li>
            <li>Role-based access controls and MFA for admin dashboards</li>
            <li>Daily backups and 24/7 monitoring</li>
            <li>GDPR and ISO 27001-aligned processes</li>
            </ul>
            <p className="mb-4">In case of a breach, affected users will be notified within 72 hours as required by GDPR.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">10. Your Rights</h2>
            
            <p className="font-semibold mb-2">EU/UK Users (GDPR)</p>
            <p className="mb-2">You may:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Access, correct, or delete your data</li>
            <li>Withdraw consent at any time</li>
            <li>Object to or restrict processing</li>
            <li>Request data portability</li>
            <li>Lodge complaints with your local Data Protection Authority (e.g., Germany's BfDI)</li>
            </ul>

            <p className="font-semibold mb-2">California Residents (CCPA/CPRA)</p>
            <p className="mb-2">You have rights to:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Know what personal info we collect and why</li>
            <li>Access and delete your data</li>
            <li>Opt out of sale or sharing of personal info</li>
            <li>Non-discrimination for exercising your rights</li>
            </ul>

            <p className="font-semibold mb-2">How to Exercise Your Rights:</p>
            <p className="mb-4">Email: <a href="mailto:privacy@exzellent.co" className="text-primary hover:text-primary underline">privacy@exzellent.co</a> with your full name, email address, and request details.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">11. Children's Privacy</h2>
            <p className="mb-4">We do not knowingly collect personal data from children under 13 (or 16 in the EU). If you believe your child has provided us personal data, contact us for deletion.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">12. Third-Party Sites</h2>
            <p className="mb-4">Our site may link to third-party websites. We are not responsible for their privacy practices. Review their policies separately.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">13. Changes to This Policy</h2>
            <p className="mb-4">We may update this policy periodically. Material changes will be announced via email or on our homepage. Continued use constitutes acceptance.</p>

            <h1 className="text-3xl md:text-4xl font-bold mt-16 mb-8 text-center text-white tracking-tight">Cookie Policy of Exzellent Language Institute</h1>

            <p className="mb-4">This Cookie Policy explains how Exzellent Language Institute ("Exzellent", "we", "us", or "our") uses cookies and similar tracking technologies on our website <strong>https://www.exzellent.co</strong> and associated web and mobile applications.</p>
            
            <p className="mb-4">By continuing to browse or use our website, you agree to our use of cookies in accordance with this policy and your preferences.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">1. What Are Cookies?</h2>
            <p className="mb-4">Cookies are small text files stored on your browser or device when you visit a website. They allow websites to recognize your browser, remember preferences, and improve user experience.</p>
            
            <p className="mb-2">Cookies may be:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Session Cookies</strong> – deleted when you close your browser</li>
            <li><strong>Persistent Cookies</strong> – stored until a specified expiry date or manually deleted</li>
            <li><strong>First-party Cookies</strong> – set by the website you visit</li>
            <li><strong>Third-party Cookies</strong> – set by services embedded on the website (e.g., Google Analytics, YouTube)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">2. Why We Use Cookies</h2>
            <p className="mb-4">We use cookies and similar technologies for the following purposes:</p>
            <div className="overflow-x-auto mb-4">
            <table className="w-full table-auto border border-slate-300 rounded-md text-sm">
                <thead className="bg-slate-100 text-text-secondary">
                <tr>
                    <th className="border px-4 py-2 text-left">Purpose</th>
                    <th className="border px-4 py-2 text-left">Description</th>
                </tr>
                </thead>
                <tbody>
                <tr><td className="border px-4 py-2"><strong>Essential (Strictly Necessary)</strong></td><td className="border px-4 py-2">Required to operate the website (e.g., login sessions, language preferences). Cannot be disabled.</td></tr>
                <tr><td className="border px-4 py-2"><strong>Performance & Analytics</strong></td><td className="border px-4 py-2">Help us understand how visitors interact with the site (e.g., via Google Analytics or Hotjar).</td></tr>
                <tr><td className="border px-4 py-2"><strong>Functionality</strong></td><td className="border px-4 py-2">Remember user preferences such as language, region, and accessibility settings.</td></tr>
                <tr><td className="border px-4 py-2"><strong>Marketing & Personalization</strong></td><td className="border px-4 py-2">Deliver relevant ads or promotions via platforms like Facebook, Google Ads, or LinkedIn. Track campaign performance.</td></tr>
                <tr><td className="border px-4 py-2"><strong>Security</strong></td><td className="border px-4 py-2">Detect fraud, abuse, or unauthorized access attempts.</td></tr>
                </tbody>
            </table>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">3. Types of Cookies We Use</h2>
            <p className="mb-4">Here's a breakdown of the cookies commonly used:</p>

            <p className="font-semibold mb-2">A. Essential Cookies</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>cookieConsentStatus:</strong> Stores your cookie preferences</li>
            <li><strong>session_id:</strong> Maintains your logged-in state</li>
            </ul>

            <p className="font-semibold mb-2">B. Analytics Cookies</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>_ga / _gid / _gat (Google Analytics):</strong> Tracks unique visitors and behaviour patterns</li>
            <li><strong>_hjIncludedInSample (Hotjar):</strong> Measures UX metrics like clicks and scroll depth</li>
            </ul>

            <p className="font-semibold mb-2">C. Functionality Cookies</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>language_pref:</strong> Stores your selected language</li>
            <li><strong>dark_mode_toggle:</strong> Stores display mode preferences</li>
            </ul>

            <p className="font-semibold mb-2">D. Marketing & Third-Party Cookies</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>_fbp (Meta Pixel):</strong> Tracks users for Facebook ad targeting</li>
            <li><strong>IDE (Google DoubleClick):</strong> Tracks and delivers personalized ads</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">4. Third-Party Technologies</h2>
            <p className="mb-2">We embed content or use services from:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Google (Analytics, Ads, reCAPTCHA, YouTube)</strong></li>
            <li><strong>Meta (Facebook Pixel)</strong></li>
            <li><strong>LinkedIn Insights</strong></li>
            <li><strong>Hotjar</strong></li>
            <li><strong>WhatsApp Widgets</strong></li>
            </ul>
            <p className="mb-4">These providers may independently collect and process data. Please refer to their respective privacy policies.</p>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">5. Managing Your Cookie Preferences</h2>
            <p className="mb-2">You can manage or disable cookies using:</p>
            <ul className="list-disc list-inside mb-4">
            <li><strong>Our Cookie Consent Tool</strong> (shown on first visit and accessible anytime at the bottom of the page)</li>
            <li><strong>Browser Settings</strong> (Chrome, Firefox, Safari, Edge). Most browsers allow you to block or delete cookies</li>
            </ul>

            <p className="mb-2">For detailed guidance:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Google Chrome Help</li>
            <li>Mozilla Firefox</li>
            <li>Apple Safari</li>
            </ul>

            <p className="mb-2">You can also opt-out of interest-based advertising:</p>
            <ul className="list-disc list-inside mb-4">
            <li>Google Ads Settings</li>
            <li>Your Online Choices – EU</li>
            <li>NAI Consumer Opt-Out (US)</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-3 text-center text-white">6. Changes to This Policy</h2>
            <p className="mb-4">We may update this Cookie Policy in response to legal, technical, or business developments. The "Effective Date" at the top indicates the latest revision.</p>
            <p className="mb-4">Significant changes will be communicated through a notice on our site.</p>

            <p className="mt-10 text-center text-lg text-primary/80 font-semibold">Thank you for trusting Exzellent with your data privacy.</p>
        </div>
        </div>
    );
};

export default Privacy;