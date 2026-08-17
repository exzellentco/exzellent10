import React from "react";
import logo from '../../assets/Exzellent_logo.png';

const Impressum = () => {
    return (
        <div className="min-h-screen flex items-center justify-center pt-28 pb-12 px-8">
            <div className="w-full max-w-3xl rounded-md  border border-border bg-bg2 text-white p-12">
                <div className="h-20 mb-10 flex items-center"><img src={logo} className="h-75 w-full object-contain" /></div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-white tracking-tight">Impressum (Legal Disclosure)</h1>

                <h2 className="text-xl sm:text-2xl font-semibold mt-10 mb-3 text-white">Information pursuant to § 5 TMG, § 18 MStV, and Article 14 of the Digital Services Act (DSA)</h2>
                <h3 className="text-lg font-semibold mt-6 mb-2">Website Operator / Service Provider</h3>
                <p>Exzellent GmbH (haftungsbeschränkt)</p>
                <p><strong>Registered Address:</strong> Siemens Halke Ring 2, Cottbus</p>
                <p><strong>Ort:</strong> 03046</p>
                <p><strong>Country:</strong> Germany</p>
                <p><strong>Phone:</strong> +491551040831</p>
                <p><strong>Email:</strong> contact@exzellent.co</p>
                <p><strong>Website:</strong> <a href="https://www.exzellent.co" className="text-primary underline">https://www.exzellent.co</a></p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Represented by:</h3>
                <p>[Legal Representative]</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Contact Information</h3>
                <p><strong>Phone:</strong> +49 [Legal representation]</p>
                <p><strong>Email:</strong> contact@exzellent.co</p>
                <p><strong>Website:</strong> <a href="https://www.exzellent.co" className="text-primary underline">https://www.exzellent.co</a></p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Commercial Register Entry</h3>
                <p><strong>Registered at:</strong> District Court of Berlin (Charlottenburg)</p>
                <p><strong>Registration Number:</strong> HRB [………………….]</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">VAT Identification Number</h3>
                <p><strong>Pursuant to § 27a of the German VAT Act (UStG):</strong></p>
                <p><strong>VAT ID:</strong> DE [……………………….]</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Responsible for Content under § 18(2) MStV</h3>
                <p>[Full Name ………………………………..]</p>
                <p>Exzellent GmbH. UG (haftungsbeschränkt)</p>
                <p>Siemens Halke Ring 2, Cottbus, 03046, Germany.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Online Dispute Resolution / EU ODR Platform</h3>
                <p>The European Commission offers a platform for online dispute resolution (ODR): <a href="https://ec.europa.eu/consumers/odr" className="text-primary underline">https://ec.europa.eu/consumers/odr</a></p>
                <p>We are neither obliged nor willing to participate in a dispute resolution procedure before a consumer arbitration board.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Disclaimer of Liability</h3>
                <p>Despite careful content control, Exzellent GmbH. accepts no liability for the accuracy, completeness, or currency of the website’s content. As a service provider, we are responsible for our own content on these pages under general laws in accordance with § 7 Para. 1 TMG. However, according to §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity.</p>
                <p>Obligations to remove or block the use of information under general law remain unaffected. Liability is only possible from the time of knowledge of a concrete infringement. Upon becoming aware of such legal violations, we will immediately remove the content in question.</p>

                <h3 className="text-lg font-semibold mt-6 mb-2">Copyright</h3>
                <p>All content, images, graphics, and logos on this website created by Exzellent GmbH. are subject to German copyright law. Any reproduction, editing, distribution, or use outside the limits of copyright law requires the written permission of the respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not created by Exzellent GmbH, third-party copyrights are respected and labelled accordingly.</p>
            </div>
        </div>
    );
};

export default Impressum;