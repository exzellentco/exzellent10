import React, { useState, useEffect } from 'react';

const FilterPopup = ({
    onSearch,
    onLanguageFilter,
    onLevelFilter,
    languages = [],
    selectedLanguages = [],
    selectedLevel = '',
    onClose,
    }) => {
    const [languageSearchTerm, setLanguageSearchTerm] = useState('');
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

            <div className="bg-bg2 border border-border p-6 rounded-xl max-w-md w-full mx-4">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-primary">Filters</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

{/* Search (courses + languages) */}
                <div className="mb-6">
                    <label htmlFor="search-popup" className="block text-primary font-medium mb-2">Search</label>
                    <input type="text" id="search-popup" placeholder="Search courses or languages..." value={languageSearchTerm}
                    className="w-full px-4 py-3 border border-border bg-bg rounded-xl text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                    onChange={(e) => { setLanguageSearchTerm(e.target.value); onSearch?.(e.target.value); }}/>
                </div>

{/* Language Filter (Multi-select) */}
                <div className="mb-6">
                    <label className="block text-primary font-medium mb-2">Languages</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {filteredLanguages.length > 0 ? (
                        filteredLanguages.map((language) => (
                        <div key={language} className="flex items-center">
                            <input type="checkbox" id={`lang-popup-${language}`} value={language} checked={selectedLanguages.includes(language)}
                            onChange={() => handleLanguageChange(language)}
                            className="h-4 w-4 border-border rounded focus:ring-secondary accent-tertiary cursor-pointer"/>
                            <label htmlFor={`lang-popup-${language}`} className="ml-3 text-white cursor-pointer">{language}</label>
                        </div>
                        ))
                    ) : (
                        <p className="text-text-secondary">No languages found.</p>
                    )}
                    </div>
                </div>

                {/* Level Filter */}
                <div className="mb-4">
                    <label htmlFor="level-filter-popup" className="block text-primary font-medium mb-2">Level</label>
                    <select id="level-filter-popup" value={selectedLevel} onChange={(e) => onLevelFilter(e.target.value)}
                     className="w-full px-4 py-2 border border-border bg-bg rounded-xl text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                    <option value="">All Levels</option>
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                    </select>
                </div>

            </div>
        </div>
    );
};

export default FilterPopup;
