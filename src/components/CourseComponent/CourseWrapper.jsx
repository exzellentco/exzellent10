import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import CourseDetails from './CourseDetails';

const CourseWrapper = () => {
    const { courseNameAndLevel } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/courses");
            const courses = Array.isArray(response.data) ? response.data : [];
            const [courseName, courseLevel] = decodeURIComponent(
            courseNameAndLevel
            ).split("-");
            const foundCourse = courses.find(
            (c) => c.title === courseName && c.level === courseLevel
            );
            if (foundCourse) {
            setCourse(foundCourse);
            } else {
            setError('Course not found');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch course data');
        } finally {
            setLoading(false);
        }
        };
        fetchCourse();
    }, [courseNameAndLevel]);
    if (loading) {
        return(     
        <div className="min-h-screen bg-slate-50 bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex flex-col justify-center items-center text-center text-3xl">      
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"/>
            <p className="text-text-secondary">Loading Course...</p>
        </div>
    )}
    if (error) {
        return <div className="min-h-screen bg-slate-50 bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex justify-center items-center text-center text-red-500 text-3xl">Error: {error}</div>;
    }
    if (course) {
        return <CourseDetails course={course} onBack={() => navigate('/courses')} />;
    }
    return null; 
};
export default CourseWrapper;
