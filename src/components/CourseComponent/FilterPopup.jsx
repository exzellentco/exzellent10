import React, { useState, useEffect } from 'react';

const FilterPopup = ({
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

            <div className="bg-white p-6 rounded-xl max-w-md">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-primary">Filters</h3>
                    <button onClick={onClose} className="text-text-secondary">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

{/* Language Search */}
                <div className="mb-6">
                    <label htmlFor="language-search-popup" className="block text-text-secondary font-medium mb-2">Search Languages</label>
                    <input type="text" id="language-search-popup" placeholder="Search languages..." value={languageSearchTerm}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => setLanguageSearchTerm(e.target.value)}/>
                </div>

{/* Language Filter (Multi-select) */}
                <div className="mb-6">
                    <label className="block text-text-secondary font-medium mb-2">Languages</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {filteredLanguages.length > 0 ? (
                        filteredLanguages.map((language) => (
                        <div key={language} className="flex items-center">
                            <input type="checkbox" id={`lang-popup-${language}`} value={language} checked={selectedLanguages.includes(language)}
                            onChange={() => handleLanguageChange(language)}
                            className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"/>
                            <label htmlFor={`lang-popup-${language}`} className="ml-3 text-text-secondary">{language}</label>
                        </div>
                        ))
                    ) : (
                        <p className="text-text-secondary">No languages found.</p>
                    )}
                    </div>
                </div>

                {/* Level Filter */}
                <div className="mb-4">
                    <label htmlFor="level-filter-popup" className="block text-text-secondary font-medium mb-2">Level</label>
                    <select id="level-filter-popup" value={selectedLevel} onChange={(e) => onLevelFilter(e.target.value)}
                     className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    </select>
                </div>

            </div>
        </div>
    );
};

export default FilterPopup;
