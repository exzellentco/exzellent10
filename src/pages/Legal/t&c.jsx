import React from "react";
import logo from '../../assets/Exzellent_logo.png';
const TermsAndConditions = () => {
return (
<div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-8 text-white">
    <div className="w-full max-w-3xl rounded-md  border border-border bg-bg2 p-12">
        <div className="h-20 mb-15 flex items-center"><img src={logo} className="h-75 w-full object-contain" /></div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white tracking-tight">Exzellent Terms and Conditions</h1>

        <p className="mb-4">
            Welcome to Exzellent ("we", "us", or "our"). These Terms and Conditions ("Terms") govern your access to and use of our website (www.exzellent.co), mobile applications, services, content, and subscription offerings (collectively, the "Platform"). By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree with these Terms, please do not use our Platform.
        </p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">1. Definitions</h2>
        <p><strong>"User" / "Subscriber" / "You":</strong> Any individual who accesses or uses the Platform, whether registered or not.</p>
        <p><strong>"Content":</strong> All text, images, videos, course materials, interactive features, assignments, quizzes, and other educational resources provided on the Platform.</p>
        <p><strong>"Subscription":</strong> A paid or free plan granting access to certain features and content on the Platform.</p>
        <p><strong>"Account":</strong> Your personal registration with Exzellent, including login credentials.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">2. Eligibility and Account Registration</h2>
        <p>To use the Platform, you must be at least 13 years old and have the legal capacity to enter into a binding contract. If you are registering on behalf of a company or other legal entity, you represent and warrant that you have the authority to bind that entity.</p>
        <p>You agree to:</p>
        <ul className="list-disc list-inside mb-4">
            <li>Provide accurate, current, and complete information during the registration process.</li>
            <li>Maintain and promptly update your account information.</li>
            <li>Keep your login credentials secure and confidential.</li>
            <li>Be responsible for all activities that occur under your account.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">3. Subscriptions, Billing, and Payments</h2>
        <p>We offer multiple subscription plans, including but not limited to Basic and Premium access. Subscription fees and features are listed on our website and are subject to change.</p>
        <ul className="list-disc list-inside mb-4">
            <li>All prices are inclusive of applicable taxes unless stated otherwise.</li>
            <li>Payments are billed in advance on a recurring basis (monthly or annually) based on your selected plan.</li>
            <li>By subscribing, you authorize us to charge your payment method on a recurring basis until cancellation.</li>
            <li>Failure to pay may result in suspension or termination of your access.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">4. Cancellation and Refund Policy</h2>
        <ul className="list-disc list-inside mb-4">
            <li>You may cancel your subscription at any time through your account settings.</li>
            <li>First-time subscribers are eligible for a full refund if cancellation occurs within 7 days of initial payment.</li>
            <li>No refunds are provided for subsequent billing periods, partial months, or unused portions of services.</li>
            <li>Refunds will be processed via the original payment method and may take 5–10 business days.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">5. Platform Access and Content Usage</h2>
        <p>As a subscriber, you are granted a limited, non-exclusive, non-transferable license to access and use the Content for personal, non-commercial educational purposes.</p>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside mb-4">
            <li>Share your account or login details with others.</li>
            <li>Copy, modify, reproduce, distribute, or create derivative works based on our Content without permission.</li>
            <li>Circumvent or disable security features of the Platform.</li>
        </ul>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">6. User Conduct and Submissions</h2>
        <p>By using the Platform, you agree to:</p>
        <ul className="list-disc list-inside mb-4">
            <li>Respect other users and not engage in abusive, harassing, or unlawful behaviour.</li>
            <li>Not upload content that infringes on intellectual property rights, contains malware, or violates any law.</li>
            <li>Be solely responsible for any content you submit, post, or display on the Platform.</li>
        </ul>
        <p>We reserve the right to remove any content and suspend or terminate accounts that violate these Terms.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">7. Intellectual Property</h2>
        <p>All intellectual property rights in the Platform and its Content (excluding User Submissions) are owned by or licensed to Exzellent.</p>
        <p>You may not use our name, logos, or trademarks without prior written consent.</p>
        <p>By submitting content to the Platform, you grant us a non-exclusive, royalty-free, worldwide license to use, host, and display your content for educational and promotional purposes.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">8. Disclaimers and Limitation of Liability</h2>
        <p>The Platform is provided "as is" and "as available." We make no warranties or guarantees regarding:</p>
        <ul className="list-disc list-inside mb-4">
            <li>The accuracy, completeness, or reliability of any Content.</li>
            <li>The availability or uninterrupted operation of the Platform.</li>
            <li>The results you may obtain from using the Platform.</li>
        </ul>
        <p>To the maximum extent permitted by law, Exzellent shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability is limited to the amount paid by you in the past 12 months.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">9. Privacy Policy</h2>
        <p>We respect your privacy. Please review our <a href="#" className="text-primary underline">Privacy Policy</a> to understand how we collect, use, and protect your personal data.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">10. Third-Party Services and Links</h2>
        <p>The Platform may contain links to third-party websites and services. We are not responsible for the content or availability of third-party sites, or any loss or damage arising from your use of third-party services.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">11. Changes to Terms</h2>
        <p>We may update these Terms from time to time. When changes are made, we will post the revised Terms and notify subscribers of material changes. Continued use of the Platform constitutes acceptance of the updated Terms.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">12. Governing Law and Dispute Resolution</h2>
        <p>These Terms are governed by the laws of Berlin, Germany. Any disputes shall be resolved exclusively in the courts of Berlin.</p>

        <h2 className="text-xl md:text-2xl font-semibold mt-10 mb-3 text-center text-white">13. Contact Information</h2>
        <p>Email: <a href="mailto:legal@exzellent.co" className="text-primary underline">legal@exzellent.co</a></p>
        <p>Address: Siemens-Halske-Ring 2, 03046 Cottbus, Germany</p>

        <p className="mt-10 text-center text-lg text-primary/80 font-semibold">Thank you for choosing Exzellent as your learning partner.</p>
    </div>
</div>
);};

export default TermsAndConditions;