import React from "react";
import logo from '../../assets/Exzellent_logo.png';

const DataPolicy = () => {
    return (
        <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-8">
            <div className="w-full max-w-3xl rounded-md  border border-border bg-bg2 text-white p-12">
                <div className="h-20 mb-10 flex items-center"><img src={logo} className="h-75 w-full object-contain" /></div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-white tracking-tight">Data Protection Policy of Exzellent GmbH</h1>
                <p className="mb-4">In accordance with the General Data Protection Regulation (GDPR)</p>

                <p className="mb-4">At Exzellent GmbH (hereinafter referred to as “Exzellent”), the collection and processing of personal data i.e., any information relating to an identified or identifiable natural person (“data subject”) is necessary to operate and improve our digital services, fulfil contractual obligations, communicate effectively with clients and users, and ensure compliance with applicable legal requirements. In alignment with the principles of transparency, accountability, and data minimization under the General Data Protection Regulation (GDPR), we are committed to safeguarding your data and upholding your privacy rights. Therefore, we provide the following information to explain how, why, and under what conditions personal data is processed by Exzellent.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">1. Name and Contact Details of the Controller and Its Legal Representative (Art. 13(1)(a) GDPR)</h2>
                <p>The controller responsible for data processing on this website is:</p>
                <p><strong>Exzellent GmbH</strong></p>
                <p><strong>Registered Address:</strong> Siemens Halke Ring 2, Cottbus</p>
                <p><strong>Ort:</strong> 03046</p>
                <p><strong>Country:</strong> Germany</p>
                <p><strong>Phone:</strong> +491551040831</p>
                <p><strong>Email:</strong> contact@exzellent.co</p>
                <p><strong>Website:</strong> <a href="https://www.exzellent.co" className="text-primary underline">https://www.exzellent.co</a></p>
                <p><strong>Represented by:</strong> [Managing Director / Legal Representative's Full Name]</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">2. Contact Details of the Data Protection Officer (Art. 13(1)(b) GDPR)</h2>
                <p>If you have any questions regarding data protection, you may contact our appointed Data Protection Officer:</p>
                <p><strong>Data Protection Officer</strong></p>
                <p><strong>Name:</strong></p>
                <p><strong>Email:</strong> <a href="mailto:dpo@exzellent.co" className="text-primary underline">dpo@exzellent.co</a></p>
                <p><strong>Address:</strong></p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">3. Purpose and Legal Basis for Data Processing (Art. 13(1)(c) GDPR)</h2>
                <p>We process personal data for the following purposes, in accordance with the legal bases specified in the GDPR:</p>
                <ul className="list-disc list-inside mb-4">
                    <li><strong>Customer and user communication:</strong> Responding to inquiries and messages submitted via contact forms or email (Art. 6(1)(b) GDPR).</li>
                    <li><strong>Performance of contracts:</strong> Processing data required to initiate or fulfil a contractual relationship with users, partners, or clients (Art. 6(1)(b) GDPR).</li>
                    <li><strong>Website operation and analytics:</strong> Monitoring performance, detecting technical issues, analysing usage patterns, and improving our services (Art. 6(1)(f) GDPR).</li>
                    <li><strong>Legal compliance:</strong> Storing data for tax, commercial, and accounting obligations (Art. 6(1)(c) GDPR).</li>
                    <li><strong>Marketing and newsletter communication:</strong> Subject to your explicit consent (Art. 6(1)(a) GDPR).</li>
                </ul>
                <p>If the processing of data is based on consent, you have the right to withdraw that consent at any time with future effect.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">4. Legitimate Interests Pursued (Art. 13(1)(d) GDPR)</h2>
                <p>We may process your data based on legitimate interests under Article 6(1)(f) GDPR, such as:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>Securing and maintaining IT and website functionality.</li>
                    <li>Preventing misuse and ensuring cyber security.</li>
                    <li>Enhancing user experience and site performance.</li>
                    <li>Marketing our products and services to existing customers.</li>
                </ul>
                <p>We always weigh our interests against your fundamental rights and freedoms before proceeding with such processing.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">5. Recipients of Personal Data (Art. 13(1)(e) GDPR)</h2>
                <p>Data is only disclosed to the extent necessary. Recipients may include:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>Internal staff responsible for processing inquiries or managing IT systems.</li>
                    <li>External service providers, including:
                        <ul className="list-disc list-inside ml-5 mt-1">
                            <li>Hosting providers</li>
                            <li>Email marketing platforms (e.g., Mailchimp)</li>
                            <li>Analytics services (e.g., Google Analytics, with anonymization)</li>
                            <li>Legal and accounting firms for compliance purposes</li>
                        </ul>
                    </li>
                </ul>
                <p>All third parties operate under strict data processing agreements per Article 28 GDPR.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">6. Transfers to Third Countries (Art. 13(1)(f) GDPR)</h2>
                <p>Transfers to countries outside the European Economic Area (EEA) may occur when:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>Data is hosted or processed using international providers (e.g., email, cloud storage).</li>
                    <li>Required for service performance (e.g., newsletter providers headquartered in the US).</li>
                </ul>
                <p>Transfers are only made:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>To countries with an adequacy decision from the European Commission (Art. 45 GDPR), or</li>
                    <li>Using Standard Contractual Clauses (SCCs) or other appropriate safeguards (Art. 46 GDPR).</li>
                </ul>
                <p>A copy of the appropriate safeguards may be requested via <a href="mailto:privacy@exzellent.co" className="text-primary underline">privacy@exzellent.co</a>.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">7. Storage Duration (Art. 13(2)(a) GDPR)</h2>
                <p>We retain personal data only as long as necessary for the purposes stated or as required by law:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>Contact form submissions: 3 years after the last communication.</li>
                    <li>Contractual data: 6 or 10 years (per tax and commercial laws).</li>
                    <li>Cookie and analytics data: 13 months from consent.</li>
                    <li>Consent-based data: Until withdrawn.</li>
                </ul>
                <p>Once the purpose expires, data is securely deleted or anonymized.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">8. Rights of the Data Subject (Art. 13(2)(b) GDPR)</h2>
                <p>You have the following rights under the GDPR:</p>
                <ul className="list-disc list-inside mb-4">
                    <li><strong>Right of access</strong> to your personal data (Art. 15)</li>
                    <li><strong>Right to rectification</strong> of inaccurate data (Art. 16)</li>
                    <li><strong>Right to erasure</strong> under certain circumstances (Art. 17)</li>
                    <li><strong>Right to restriction</strong> of processing (Art. 18)</li>
                    <li><strong>Right to data portability</strong> (Art. 20)</li>
                    <li><strong>Right to object</strong> to processing (Art. 21)</li>
                </ul>
                <p>To exercise your rights, contact: <a href="mailto:privacy@exzellent.co" className="text-primary underline">privacy@exzellent.co</a></p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">9. Right to Withdraw Consent (Art. 13(2)(c) GDPR)</h2>
                <p>You may withdraw your consent to data processing at any time. The withdrawal does not affect the lawfulness of processing based on consent before its withdrawal.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">10. Right to Lodge a Complaint (Art. 13(2)(d) GDPR)</h2>
                <p>You have the right to lodge a complaint with the relevant supervisory authority:</p>
                <p><strong>Berlin Commissioner for Data Protection and Freedom of Information</strong></p>
                <p>Alt-Moabit 59-61</p>
                <p>10555 Berlin, Germany</p>
                <p><strong>Website:</strong> <a href="https://www.datenschutz-berlin.de" className="text-primary underline">https://www.datenschutz-berlin.de</a></p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">11. Obligation to Provide Data (Art. 13(2)(e) GDPR)</h2>
                <p>Some data (e.g., contact information for communication or contract data) is necessary. If not provided, we may be unable to:</p>
                <ul className="list-disc list-inside mb-4">
                    <li>Fulfil your request</li>
                    <li>Enter into a contract</li>
                    <li>Deliver requested services</li>
                </ul>
                <p>Voluntary data is not mandatory and will not affect service delivery if omitted.</p>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">12. Automated Decision-Making and Profiling (Art. 13(2)(f) GDPR)</h2>
                <p>Exzellent does not engage in automated decision-making or profiling that has legal or similarly significant effects on individuals.</p>
            </div>
        </div>
    );
};

export default DataPolicy;