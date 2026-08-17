import logo from '../../assets/Exzellent_logo.png';

const TeacherTC = () => {
return (
<>
    <div className="min-h-screen flex items-center justify-center pt-28 pb-12">
        <div className="w-full max-w-4xl  py-5 px-10">
            <div className="h-20 flex items-center"><img src={logo} className="h-75 w-full object-contain" /></div>
            <h1 className="text-3xl md:text-4xl font-bold my-8 text-center text-black tracking-tight">Teacher Terms of Service and Privacy Policy</h1>

            <p className="mb-4">This document outlines the Terms of Service ("ToS") and the Privacy Policy ("Policy") governing the relationship between you (the "Teacher") and Exzellent (the "Platform") concerning your use of our service as an independent language instructor.</p>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10 mb-3 text-center text-black">1. Teacher Terms of Service</h2>
            <p>By submitting your profile and accepting enrollment, you agree to be bound by these Terms of Service.</p>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">1.1 Teacher Role and Responsibilities</h2>
            <ol className="list-disc list-inside mb-4 space-y-3">
                <li><strong>Independent Contractor Status:</strong> You acknowledge and agree that you are an independent contractor, and not an employee, partner, agent, or joint venture of the Platform. You are responsible for all applicable taxes and employment-related fees.</li>
                <li><strong>Teaching Standards:</strong> You agree to maintain professional standards, deliver high-quality instruction based on agreed-upon methodologies and curricula, and conduct all lessons in a respectful and engaging manner.</li>
                <li><strong>Accuracy of Information:</strong> You warrant that all information provided in your enrollment profile, including qualifications, certifications, experience, and native speaker status, is true, accurate, and verifiable. Misrepresentation is grounds for immediate termination.</li>
                <li><strong>Scheduling and Availability:</strong> You are responsible for managing your stated availability. Once a lesson is confirmed, you must adhere to the agreed-upon schedule. Any required cancellations or rescheduling must be handled through the Platform's designated system with appropriate notice.</li>
                <li><strong>Confidentiality:</strong> You agree not to disclose any non-public information about the Platform or its users (students), including personal data, lesson plans, or business operations, to any third party.</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">1.2 Content and Intellectual Property</h2>

            <ol className="list-disc list-inside mb-4 space-y-3">
                <li><strong>Teacher Content:</strong> You retain ownership of any instructional materials or content (e.g., worksheets, presentations) that you solely create. By providing such content on the Platform, you grant the Platform a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display this content solely for the purpose of operating, promoting, and improving the services.</li>
                <li><strong>Platform Content:</strong> All software, proprietary methodologies, logos, and curriculum frameworks owned by the Platform remain the exclusive property of the Platform. You may not reproduce, reverse engineer, or exploit any Platform Content for external commercial purposes.</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">1.3 Compensation and Payment</h2>
            <ol className="list-disc list-inside mb-4 space-y-3">
                <li><strong>Fees and Payment:</strong> Compensation will be processed according to the Platform’s stated fee structure and payment schedule, available in the Teacher Dashboard. The Platform reserves the right to deduct service fees, taxes, or other applicable charges before payment.</li>
                <li><strong>Disputes:</strong> Any disputes regarding payment must be raised within thirty (30) days of the relevant lesson date.</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">1.4 Suspension and Termination</h2>
            <ol className="list-disc list-inside mb-4 space-y-3">
                <li><strong>Termination by Teacher:</strong> You may terminate your relationship with the Platform at any time by providing [X] days' written notice, provided all outstanding lessons and obligations are fulfilled.</li>
                <li><strong>Termination by Platform:</strong> The Platform may suspend or terminate your profile immediately, without prior notice, if you breach any term of this ToS, receive consistent poor performance ratings, or engage in conduct harmful to the Platform, its students, or its reputation.</li>
            </ol>

            <h2 className="text-2xl md:text-3xl font-semibold mt-10 mb-3 text-center text-black">2. Teacher Privacy Policy</h2>
            <p>This Privacy Policy explains how Exzellent collects, uses, and shares information about you when you enroll as a teacher and use our services.</p>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">2.1 Information We Collect</h2>
            <p>We collect information necessary to verify your qualifications, manage your profile, and facilitate lessons:</p>
            <ol className="list-disc list-inside my-4 space-y-3">
                <li><strong>Identity and Contact Data:</strong> Name, email address, phone number, physical address, and country of residence.</li>
                <li><strong>Qualification Data:</strong> Academic degrees, teaching certifications, years of experience, languages taught, CEFR levels, and stated availability (Available from).</li>
                <li><strong>Financial Data:</strong> Payment details (e.g., bank account number or payment processor details) necessary for receiving compensation. We do not store full credit card information.</li>
                <li><strong>Performance Data:</strong> Student ratings, feedback, lesson history, teaching format preferences, and platform usage analytics.</li>
                <li><strong>Public Profile Data:</strong> Information you choose to make publicly visible to potential students (e.g., biography, profile photo, teaching specializations).</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">2.2 How We Use Your Data</h2>
            <p>We use the collected information for the following purposes:</p>
            <ol className="list-disc list-inside my-4 space-y-3">
                <li><strong>Verification and Vetting:</strong> To confirm the accuracy of your qualifications and eligibility to teach on the Platform.</li>
                <li><strong>Student Matching:</strong> To match you with suitable students based on language needs, CEFR levels, exam expertise, and your availability.</li>
                <li><strong>Service Provision:</strong> To process your payments, manage your schedule, and facilitate communication between you and your students.</li>
                <li><strong>Quality Assurance and Improvement:</strong> To monitor teaching quality through performance data and student feedback, helping to maintain high standards and provide targeted support or training.</li>
                <li><strong>Marketing and Promotion:</strong> To display your Public Profile Data to potential students via the Platform’s website and promotional materials.</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, legal processes, and governmental requests, including tax and reporting obligations related to independent contractors.</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">2.3 Sharing Your Data</h2>
            <p>We only share your data as described below:</p>
            <ol className="list-disc list-inside my-4 space-y-3">
                <li><strong>With Students:</strong> Your Public Profile Data, including your name, specialization, experience, and general availability, is shared with students and prospective students to facilitate bookings.</li>
                <li><strong>Service Providers:</strong> We share necessary data with third-party vendors who perform services on our behalf, such as payment processing (e.g., Stripe, PayPal), cloud hosting, and analytics providers. These providers are obligated to protect your data.</li>
                <li><strong>Legal Requirements:</strong> We may disclose your data if required by law or in response to a valid court order or subpoena.</li>
            </ol>

            <h2 className="text-lg md:text-xl font-semibold mt-10 mb-3 text-center text-black">2.4 Data Retention</h2>
            <p>We retain your personal data for as long as your profile remains active on the Platform and for a reasonable period thereafter to comply with our legal and regulatory obligations, resolve disputes, and enforce our agreements.</p>
            
        </div>
    </div>
</>    
);};

export default TeacherTC;