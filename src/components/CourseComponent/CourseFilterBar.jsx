import React from 'react';

const CourseFilterBar = ({onSearch, onLanguageFilter, onLevelFilter, languages = []}) => {
return (
  <div className="bg-white p-4 rounded-lg  mb-8 ">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
      <div className="col-span-1">
        <input type="text" placeholder="Search courses..." onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>
      <div className="col-span-1">
        <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onLanguageFilter(e.target.value)}>
          <option value="">All Languages</option>
          {languages.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
      </div>
      <div className="col-span-1">
        <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => onLevelFilter(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
    </div>
  </div>
);};

export default CourseFilterBar;
