import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';
import axios from '../../utils/axios';

const CustomButton = ({ children, onClick, className }) => (
    <button 
        onClick={onClick} 
        className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center ${className}`}
    >
        {children}
    </button>
);

const CustomBadge = ({ children, className }) => (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${className}`}>{children}</span>
);

const JobDetail = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/careers/${jobId}`);
                setJob(response.data.data);
            } catch (err) {
                console.error('Error fetching job:', err);
                setError('Failed to load job details. The job may not exist or has been removed.');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const handleApplyClick = () => {
        navigate(`/careers/${jobId}/apply`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-slate-500"></div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="min-h-screen bg-white relative overflow-hidden">
                <main className="relative z-10 pt-16">
                    <div className="max-w-4xl mx-auto px-6 py-24 text-center">
                        <h1 className="text-3xl font-bold mb-4">Job Not Found</h1>
                        <p className="text-white mb-8">The job you're looking for doesn't exist.</p>
                        <CustomButton onClick={() => navigate('/careers')} className="border border-slate-300 hover:bg-slate-100 text-white">
                            <ArrowLeft className="w-4 h-4 mr-2 text-white" />Back to Careers
                        </CustomButton>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]">

            <main className="z-10 pt-28 max-w-5xl mx-auto px-6 pb-12">

                <p className="my-6 w-fit hover:text-primary text-white transition-all cursor-pointer text-lg" onClick={() => navigate('/careers')}>← Go back</p>
                
                <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8 mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    
                    <div className="flex-1">
                        <CustomBadge className="bg-gradient-to-l from-primary/50 to-bg2 text-white mb-4">{job.department}</CustomBadge>
                        
                        <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-white">{job.jobTitle}</h1>
                        
                        <div className="flex flex-wrap items-center gap-6 text-white mb-6">
                            <span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-secondary" />{job.department}</span>
                            <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-secondary" />{job.location}</span>
                            <span className="flex items-center gap-2"><Clock className="w-5 h-5 text-secondary" />{job.jobType}</span>
                            <span className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-secondary" />{job.salary}</span>
                        </div>
                
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 space-y-8">
                        
                        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                                <CheckCircle className="w-5 h-5 text-secondary" />Job <span className='text-secondary'>Description</span>
                            </h2>
                            <p className="text-white leading-relaxed text-justify">{job.jobDescription}</p>
                        </div>

                        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                                <CheckCircle className="w-5 h-5 text-secondary" />Key <span className='text-secondary'>Responsibilities</span>
                            </h2>
                            <ul className="space-y-4">
                                {job.keyResponsibilities.map((res, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-secondary rounded-full mt-2 shrink-0"/>
                                        <span className="text-white">{res}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">Requirements</h3>
                            <div className="space-y-3">
                                {job.requirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                                        <span className="text-white text-sm">{req}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">Ready <span className='text-primary'>to Apply?</span></h3>
                            <p className="text-white text-sm mb-6">Join our team and help shape the future of education. We're excited to hear from you!</p>
                            <CustomButton onClick={handleApplyClick} 
                                className="w-full bg-gradient-to-r from-blue-800 to-primary text-white hover:bg-primary/80 transition-all duration-700 cursor-pointer hover:scale-105">
                                Apply for this Position
                                <ArrowRight className="w-4 h-4 ml-2 text-white" />
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobDetail;