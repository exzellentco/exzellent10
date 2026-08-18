import React, { useState, useEffect } from 'react';

const CourseSidebarFilter = ({
    onSearch,
    onLanguageFilter,
    onLevelFilter,
    languages = [],
    selectedLanguages = [],
    selectedLevel = '',
    }) => {
    const [languageSearchTerm] = useState('');
    const [filteredLanguages, setFilteredLanguages] = useState(languages);

    useEffect(() => {
        setFilteredLanguages(
        languages.filter((lang) =>
            lang.toLowerCase().includes(languageSearchTerm.toLowerCase())
        )
        );
    }, [languageSearchTerm, languages]);

    const handleLanguageChange = (language) => {
        const newSelectedLanguages = selectedLanguages.includes(language)
        ? selectedLanguages.filter((lang) => lang !== language)
        : [...selectedLanguages, language];
        onLanguageFilter(newSelectedLanguages);
    };

return (
<div className="bg-gradient-to-tr from-bg2 to-bg p-6 rounded-xl min-w-xs border-border/20 border">
    <h3 className="text-2xl font-semibold text-white text-center mb-4">Filters</h3>

{/* Course Search */}
    <div className="mb-6">
        <label htmlFor="course-search" className="block text-primary font-medium mb-3 text-lg">Search</label>
        <input type="text" id="course-search" placeholder="Search courses..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full px-4 py-2 border border-border bg-bg rounded-xl text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>

{/* Language Filter (Multi-select) */}
    <div className="mb-6">
        <label className="block text-primary font-medium mb-3 text-lg">Languages</label>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {filteredLanguages.length > 0 ? (filteredLanguages.map((language) => (

                <div key={language} className="flex items-center">

                    <input type="checkbox" id={`lang-${language}`} value={language} checked={selectedLanguages.includes(language)} onChange={() => handleLanguageChange(language)}
                        className="h-4 w-4 border-slate-300 rounded focus:ring-secondary accent-tertiary cursor-pointer" />

                    <label htmlFor={`lang-${language}`} className="pl-3 text-white cursor-pointer">{language}</label>
                </div>
                ))
            ) : (
                <p className="text-text-secondary">No languages found.</p>
            )}
        </div>
    </div>

{/* Level Filter */}
    <div className="mb-4">
        <label htmlFor="level-filter" className="block text-primary font-medium mb-2">Level</label>
        <select id="level-filter" value={selectedLevel} onChange={(e) => onLevelFilter(e.target.value)} 
            className="w-full px-4 py-2 border border-border bg-bg rounded-xl text-white focus:outline-none focus:ring-0 cursor-pointer">
        <option className="rounded-full hover:bg-primary/80" value="">All Levels</option>
        <option value="A1">A1</option>
        <option value="A2">A2</option>
        <option value="B1">B1</option>
        <option value="B2">B2</option>
        <option value="C1">C1</option>
        <option value="C2">C2</option>
        </select>
    </div>

</div>
);};

export default CourseSidebarFilter;
