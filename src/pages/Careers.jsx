import React, { useState, useEffect } from 'react';
import JobList from '../components/CareerComponents/JobList';
import axios from "../utils/axios";

const Careers = ({ isCareersPageLoading, setCareersPageLoading }) => {
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
        try {
            setCareersPageLoading(true); 
            const response = await axios.get("/api/careers"); 
            const JobsData = Array.isArray(response.data.data) ? response.data.data : [];

            setJobs(JobsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setCareersPageLoading(false); // Set loading to false when fetching ends
        }
        };

        fetchJobs();
    }, [setCareersPageLoading]);

    if (isCareersPageLoading) return (
    
        <div className="min-h-screen bg-bg flex flex-col justify-center items-center text-center text-3xl">      
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"/>
            <p className="text-white">Loading Careers...</p>
        </div>
    
    );
    if (error) return <p className="min-h-screen bg-bg flex flex-col justify-center items-center text-center text-3xl text-red-500">Error: {error}</p>;

    return (
        <>
        <JobList jobs={jobs} />
        </>
    );
};

export default Careers;