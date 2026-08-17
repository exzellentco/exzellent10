import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import axios from '../utils/axios';
import Swal from 'sweetalert2';

const CareerApplication = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  const [cvFile, setCvFile] = useState(null);
  const [otherDocs, setOtherDocs] = useState([]); // max 2 files
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle CV upload (1 file, max 1MB)
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1 * 1024 * 1024) {
      Swal.fire({ icon: 'error', title: 'File too large', theme: 'dark', text: 'CV must be less than 1 MB' });
      return;
    }
    setCvFile(file);
  };

  // Handle other documents (max 2 files, 2MB each)
  const handleOtherDocsChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 2 * 1024 * 1024);

    if (validFiles.length !== files.length) {
      Swal.fire({ icon: 'warning', title: 'Some files skipped', theme: 'dark', text: 'Only files under 2 MB allowed' });
    }

    if (otherDocs.length + validFiles.length > 2) {
      Swal.fire({ icon: 'warning', title: 'Limit reached', theme: 'dark', text: 'Maximum 2 additional documents allowed' });
      return;
    }

    setOtherDocs([...otherDocs, ...validFiles]);
  };

  const removeOtherDoc = (index) => {
    setOtherDocs(otherDocs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.phone || !cvFile) {
      Swal.fire({
        icon: 'warning',
        theme: 'dark',
        title: 'Missing Information',
        text: 'Please fill all required fields and upload your CV.',
      });
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('coverLetter', formData.coverLetter || '');

      // Upload CV to Cloudinary via your backend
      form.append('cv', cvFile);

      // Upload other documents
      otherDocs.forEach((file) => {
        form.append('otherDocs', file);
      });

      const response = await axios.post(`/api/careers/${jobId}/apply`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          theme: 'dark',
          title: 'Application Submitted!',
          text: 'Thank you! We will review your application and get back to you soon.',
          confirmButtonText: 'Back to Jobs',
        }).then(() => navigate('/careers'));
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        theme: 'dark',
        title: 'Submission Failed',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-10 bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]">
      <div className="max-w-2xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-lg text-white hover:text-primary mb-8 transition-all duration-300">
          <ArrowLeft size={20} /> Back to Job Details
        </button>

        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-10 text-white">
          <h1 className="text-4xl font-bold text-center mb-2">Apply <span className='text-primary'>for this Position</span></h1>
          <p className="text-center  mb-10">Please fill out the form below. We will review your application shortly!</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block font-medium mb-2">Full Name <span className='text-red-600'>*</span></label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe"
                className="w-full border-2 border-border rounded-xl p-4 focus:border-primary focus:outline-none"/>
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium mb-2">Email Address <span className='text-red-600'>*</span></label>
              <input placeholder="you@example.com" type="email" name="email" value={formData.email} onChange={handleChange} required
                className="w-full border-2 border-border rounded-xl p-4 focus:border-primary focus:outline-none"/>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-medium mb-2">Phone Number <span className='text-red-600'>*</span></label>
              <input placeholder="+49 123 456 789" type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                className="w-full border-2 border-border rounded-xl p-4 focus:border-primary focus:outline-none"/>
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block font-medium mb-2">Cover Letter / Motivation</label>
              <textarea placeholder="Tell us why you are interested in this position!" name="coverLetter" value={formData.coverLetter} onChange={handleChange} rows={6}
                className="w-full border-2 border-border rounded-xl p-4 focus:border-primary focus:outline-none resize-y"/>
            </div>

            {/* CV Upload - 1 MB */}
            <div>
              <label className="block font-medium mb-2">Upload CV (PDF, DOC, DOCX) <span className='text-red-600'>*</span> - Max 1 MB</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <Upload className="mx-auto mb-3 " size={40} />
                <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="hidden" id="cv-upload"/>
                <label htmlFor="cv-upload" className="cursor-pointer text-primary hover:underline">{cvFile ? cvFile.name : "Click to upload CV"}</label>
                <p className="text-xs text-slate-500 mt-1">Max size: 1 MB</p>
              </div>
            </div>

            {/* Other Documents - Max 2 files, 2 MB each */}
            <div>
              <label className="block font-medium mb-2">Other Documents (Optional) - Max 2 files, 2 MB each</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
                <FileText className="mx-auto mb-3" size={40} />
                <input type="file" multiple accept=".pdf,.doc,.docx" onChange={handleOtherDocsChange} className="hidden" id="other-docs" />
                <label htmlFor="other-docs" className="cursor-pointer text-primary hover:underline">Click to upload additional documents</label>
                <p className="text-xs text-slate-500 mt-1">Max 2 files • Max 2 MB each</p>
              </div>

              {otherDocs.length > 0 && (
                <div className="mt-4 space-y-2">
                  {otherDocs.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-bg p-3 rounded-xl">
                      <span className="text-sm truncate">{file.name}</span>
                      <button type="button" onClick={() => removeOtherDoc(index)} className="text-red-600 hover:text-red-700">
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading || !cvFile}
             className="w-full bg-gradient-to-r from-blue-800 to-primary hover:scale-105 text-white font-semibold p-4 rounded-xl transition-all duration-300 disabled:opacity-70">
              {loading ? "Submitting Application..." : "Submit Application"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CareerApplication;