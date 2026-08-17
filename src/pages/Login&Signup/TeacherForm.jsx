import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, User, BookOpen, Clock, CheckCircle, GraduationCap, XCircle, ChevronDown, Plus, Minus, Globe, FileText, Lock, Eye, EyeOff} from "lucide-react";
import StaticGridBackground from "../../components/StaticGridBackground";
import { completeTeacherSignup } from "../../APIs/Signup/SignupApis";

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password,);
};

const LANGUAGES_TAUGHT_OPTIONS = ["German", "Spanish", "English", "Chinese", "Portuguese", "italian", "Arabic", "Hindi", "Bengali", "Russian", "Japanese", "Lahnda", "Polish", "Dutch", "Other"];

const YEARS_EXPERIENCE_OPTIONS = ["0-1", "1-3", "3-5", "5-8", "8-12", "12+"];

const ACADEMIC_DEGREES_OPTIONS = ["Bachelor’s in Education (B.Ed.)", "Master’s in Education (M.Ed.)", "Bachelor’s in Linguistics", "Master’s in Linguistics", "Bachelor’s in Applied Linguistics",
  "Master’s in Applied Linguistics", "Bachelor’s in Language Studies", "Master’s in Language Studies", "Bachelor’s in Translation & Interpretation", "Master’s in Translation & Interpretation",
  "PGCE", "Other",];

const TEACHING_CERTIFICATIONS_OPTIONS = ["DaF (Deutsch als Fremdsprache)", "DaZ (Deutsch als Zweitsprache)", "BAMF Zulassung", "Goethe-Institut Teacher Training", "TELC Trainer Certification",
  "ÖSD Teacher Qualification", "ELE (Español como Lengua Extranjera)", "Instituto Cervantes Certification", "DELE Examiner Accreditation", "SIELE Examiner / Trainer Certification", "Other",];

const CEFR_LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const PROFICIENCY_CERTIFICATIONS_OPTIONS = ["Goethe-Zertifikat", "TELC", "TestDaF", "DSH", "DELE", "SIELE", "Other",];

const EXAM_EXPERTISE_OPTIONS = ["Goethe Exams", "TELC Exams", "TestDaF", "DSH", "DELE", "SIELE",];

const TEACHING_METHODOLOGIES_OPTIONS = ["Communicative Language Teaching (CLT)", "Task-Based Language Teaching (TBLT)", "Exam-Oriented Training", "CEFR-Aligned Instruction", "Immersive Learning",
  "Online / Remote Teaching", "AI-Assisted Language Learning", "Curriculum Design", "Other",];

const TEACHING_FORMAT_OPTIONS = ["1:1 Online", "Group Online", "In-Person", "Hybrid",];

const AVAILABILITY_OPTIONS = ["Immediately", "Within 1 Month", "Within 3 Months", "Within 6 Months", "Later than 6 Months",];

const ALL_COUNTRIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", 
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", 
  "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", 
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", 
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", 
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];

const InputField = ({label, name, value, onChange, icon: Icon, type = "text", placeholder, required = false, disabled = false, showPassword, togglePassword,}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
      )}
      <input type={type === "password" && showPassword ? "text" : type} name={name} id={name} value={value} onChange={disabled ? undefined : onChange} required={required} placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-10 pr-12 py-2.5 bg-[#0d0d16] border border-white/[0.08] rounded-xl text-white placeholder-[#3a3a4a] text-sm outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10 transition-all duration-200
${disabled ? "opacity-40 cursor-not-allowed" : ""}`}/>
      {type === "password" && (
        <button type="button" onClick={togglePassword} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary">
          {showPassword ? (
            <EyeOff className="w-5 h-5 cursor-pointer" />
          ) : (
            <Eye className="w-5 h-5 cursor-pointer" />
          )}
        </button>
      )}
    </div>
  </div>
);

const SelectField = ({label, name, value, onChange, icon: Icon, options, placeholder, required = false,}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
      )}
      <select name={name} id={name} value={value} onChange={onChange} required={required}
                className="w-full px-10 py-2 border border-slate-300 rounded-md appearance-none cursor-pointer text-text-secondary focus:outline-primary">
        <option value="" disabled hidden>{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
    </div>
  </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <div className="flex flex-col h-full py-5 md:py-0">
    <div className="flex items-center justify-between bg-[#0d0d16] border border-white/[0.07] rounded-xl px-4 py-3 h-full">
      <label htmlFor={name} className="text-sm font-medium text-white/60 cursor-pointer pr-4">{label}</label>
      <button type="button" id={name} name={name} onClick={() => onChange({ target: { name, value: !checked } })} role="switch" aria-checked={checked}
        className={`relative inline-flex h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-all duration-500 ${checked ? "bg-secondary" : "bg-white/10"}`}>
        <span aria-hidden="true" className={`h-5 w-5 rounded-full bg-white transition-all duration-500 ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  </div>
);

const MultiSelectDropdown = ({label, name, options, selectedValues, onChange, icon: Icon, required = false,}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (option) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange({ target: { name, value: newValues } });
  };

  const displayLabel = useMemo(() => {
    if (selectedValues.length === 0) return `Select ${label}`;
    if (selectedValues.length === 1) return selectedValues[0];
    return `${selectedValues.length} selected`;
  }, [selectedValues]);

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />
        )}
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full px-10 py-2 border border-slate-300 bg-[#0d0d16] rounded-md  flex items-center justify-between cursor-pointer">
          <span className="truncate text-text-secondary">{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 text-primary transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}/>
        </button>
        {isOpen && (
          <div className="absolute mt-1 w-full rounded-md bg-white border border-slate-200 max-h-60 overflow-y-auto z-50">
            <ul role="listbox">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <li key={option} role="option" onClick={() => handleToggle(option)}
                    className={`p-3 text-sm cursor-pointer hover:bg-blue-100 flex items-center justify-between ${isSelected ? "bg-blue-200 text-primary" : "text-text-secondary"}`}>
                    <span>{option}</span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {required && selectedValues.length === 0 && (
        <input type="text" className="hidden" required tabIndex="-1" value="" onChange={() => {}} />
      )}
    </div>
  );
};

const TaughtLanguageEntry = ({ index, entry, updateEntry, removeEntry }) => {
  const handleEntryChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    updateEntry(index, name, newValue);
  };

  return (
    <div className="p-5 bg-[#13131a]/80 backdrop-blur-xl rounded-[16px] border border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-400">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Language Entry #{index + 1}</h3>
        <button type="button" onClick={() => removeEntry(index)}
         className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg p-1.5 cursor-pointer transition-colors">
          <Minus className="w-7 h-7" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Language" name="language" value={entry.language} onChange={handleEntryChange} icon={BookOpen} options={LANGUAGES_TAUGHT_OPTIONS} placeholder="Select Language" required/>
        <SelectField label="CEFR Level" name="cefr_level" value={entry.cefr_level} onChange={handleEntryChange} icon={GraduationCap} options={CEFR_LEVEL_OPTIONS} placeholder="Select CEFR Level"/>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">Native Speaker Status</label>
          <ToggleSwitch label="Native Speaker" name="isNative" checked={entry.isNative} onChange={handleEntryChange}/>
        </div>
      </div>
      <MultiSelectDropdown label="Language Proficiency Certifications" name="certifications" selectedValues={entry.certifications || []} onChange={handleEntryChange} icon={CheckCircle} options={PROFICIENCY_CERTIFICATIONS_OPTIONS}/>
    </div>
  );
};

const TeacherForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = location.state?.token;
  const initialEmail = location.state?.email || "";
  const mode = location.state?.mode; // 'admin' | 'signup'

  const [formData, setFormData] = useState({password: "", confirmPassword: "", firstName: "", lastName: "", countryOfResidence: "", yearsExperience: "", availableFrom: "", academicDegrees: [],
    teachingCertifications: [], examExpertise: [], teachingMethodologies: [], teachingFormat: [], taughtLanguages: [{ language: "", cefr_level: "", certifications: [], isNative: false },],
    agreedToTerms: false, agreedToVerification: false,});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password") {
      if (value && !validatePassword(value)) {
        setPasswordError(
          "Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&).",
        );
      } else {
        setPasswordError("");
      }
    }
  };

  const addTaughtLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      taughtLanguages: [
        ...prev.taughtLanguages,
        { language: "", cefr_level: "", certifications: [], isNative: false },
      ],
    }));
  };

  const removeTaughtLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      taughtLanguages: prev.taughtLanguages.filter((_, i) => i !== index),
    }));
  };

  const updateTaughtLanguage = (index, name, value) => {
    setFormData((prev) => ({
      ...prev,
      taughtLanguages: prev.taughtLanguages.map((entry, i) =>
        i === index ? { ...entry, [name]: value } : entry,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage("");
    setIsSuccess(false);

    // Password validation
    if (!formData.password) {
      setResponseMessage("Password is required.");
      setIsSubmitting(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setResponseMessage(
        "Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&).",
      );
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreedToTerms || !formData.agreedToVerification) {
      setResponseMessage(
        "You must agree to the terms and verification process.",
      );
      setIsSubmitting(false);
      return;
    }

    if (formData.taughtLanguages.some((l) => !l.language)) {
      setResponseMessage("Please select a language for each entry.");
      setIsSubmitting(false);
      return;
    }

    if (formData.teachingFormat.length === 0) {
      setResponseMessage("Please select at least one teaching format.");
      setIsSubmitting(false);
      return;
    }

    try {
      let yearsExperienceNum = 0;
      if (formData.yearsExperience) {
        const match = formData.yearsExperience.match(/^(\d+)-/);
        yearsExperienceNum = match ? parseInt(match[1], 10) : formData.yearsExperience === "12+" ? 12 : 0;
      }

      const now = new Date();
      let availableFromDate = new Date();
      switch (formData.availableFrom) {
        case "Within 1 Month":
          availableFromDate.setMonth(now.getMonth() + 1);
          break;
        case "Within 3 Months":
          availableFromDate.setMonth(now.getMonth() + 3);
          break;
        case "Within 6 Months":
          availableFromDate.setMonth(now.getMonth() + 6);
          break;
        case "Later than 6 Months":
          availableFromDate.setMonth(now.getMonth() + 7);
          break;
        default:
          availableFromDate = now;
      }

      const submissionData = {password: formData.password, firstName: formData.firstName.trim(), lastName: formData.lastName.trim(), countryOfResidence: formData.countryOfResidence,
        yearsExperience: yearsExperienceNum, availableFrom: availableFromDate.toISOString(), academicDegrees: formData.academicDegrees, teachingCertifications: formData.teachingCertifications,
        examExpertise: formData.examExpertise, teachingMethodologies: formData.teachingMethodologies, teachingFormat: formData.teachingFormat,
        taughtLanguages: formData.taughtLanguages.map((lang) => ({language: lang.language, cefr_level: lang.cefr_level || null, certifications: lang.certifications || [], isNative: lang.isNative,})),
        agreedToTerms: formData.agreedToTerms, agreedToVerification: formData.agreedToVerification,};

      await completeTeacherSignup( submissionData, mode === "signup" ? token : null,);

      setIsSuccess(true);
      setResponseMessage(
        "Teacher profile submitted successfully. Your account is pending admin approval.",
      );
    } catch (error) {
      setIsSuccess(false);
      setResponseMessage(
        error.message ||
          "Submission failed. Please check all fields and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const MessageBlock = () => {
    if (!responseMessage) return null;
    const Icon = isSuccess ? CheckCircle : XCircle;
    const colorClass = isSuccess ? "bg-green-100 border-green-400 text-green-700" : "bg-red-100 border-red-400 text-red-700";

    return (
      <div className={`mt-6 p-4 border rounded-xl flex items-start space-x-3 ${colorClass}`}>
        <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />{" "}
        <p className="text-sm font-medium">{responseMessage}</p>
      </div>
    );
  };

  if (mode !== "admin" && !token) {
    return (
      <div className="min-h-screen pt-28 pb-12 text-center">
        <StaticGridBackground />
        <div className="max-w-md mx-auto bg-secondary p-6 rounded-md">
          <XCircle className="w-12 h-12 text-white mx-auto mb-4" />
          <p className="text-white">Please verify your email first!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-28 pb-12 flex items-center justify-center px-4 sm:px-8 min-h-screen bg-bg">
      <StaticGridBackground />
      <div className="relative w-full max-w-4xl bg-bg rounded-xl p-8 sm:p-10">
        {isSuccess ? (
          <div className="text-center p-10 rounded-md">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-secondary">Profile Submitted!</h2>
            <p className="text-text-secondary mt-2 mb-6">{responseMessage}</p>
            <button onClick={() => navigate("/login")} className="bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary/80 transition-all duration-500">
              Go to Login
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center pb-2">
              <p className="text-4xl font-extrabold text-text-primary mb-2">Teacher <span className="text-primary">Profile</span></p>
              <p className="text-primary text-lg">Complete your teaching profile for approval.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-10 ">
                <div>
                  <h2 className="text-2xl font-bold text-text-primary border-b border-slate-400 pb-2 mb-4">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                    <InputField label="First Name" name="firstName" placeholder={"Enter your name"} value={formData.firstName} onChange={handleChange} icon={User} required />
                    <InputField label="Last Name" name="lastName" placeholder={"Enter your last Name"} value={formData.lastName} onChange={handleChange} icon={User} required />
                    <InputField label="Email" name="email" placeholder={ initialEmail ? initialEmail : "Enter an email"} value={formData.email} onChange={handleChange} icon={User} required disabled={Boolean(initialEmail)} />

{/* Enhanced Password Field */}
                    <InputField label="Password" name="password" placeholder={"*******"} type="password" value={formData.password} onChange={handleChange} icon={Lock} required showPassword={showPassword} togglePassword={() => setShowPassword(!showPassword)} />

{/* Confirm Password */}
                    <InputField label="Confirm Password" name="confirmPassword" placeholder={"*******"} type="password" value={formData.confirmPassword} onChange={handleChange} icon={Lock} required showPassword={showConfirmPassword} togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}/>

                    {passwordError && (
                      <div className="col-span-3 -mt-4"><p className="text-sm text-red-600">{passwordError}</p></div>
                    )}

                    <SelectField label="Country of Residence" name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} icon={Globe} options={ALL_COUNTRIES} placeholder="Select country" required/>
                    <SelectField label="Years of Experience" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} icon={Clock} options={YEARS_EXPERIENCE_OPTIONS} placeholder="Select range" required />
                    <SelectField label="Available From" name="availableFrom" value={formData.availableFrom} onChange={handleChange} icon={Clock} options={AVAILABILITY_OPTIONS} placeholder="Select availability" required/>
                  </div>
                </div>

                {/* Rest of your sections unchanged */}
                <div>
                  <h2 className="text-2xl font-bold text-text-primary border-b border-slate-400 pb-2 mb-4">Language Expertise</h2>
                  <div className="p-4 bg-[#0d0d16] rounded-[14px] border border-white/[0.07] space-y-4">
                    {formData.taughtLanguages.map((entry, index) => (
                      <TaughtLanguageEntry key={index} index={index} entry={entry} updateEntry={updateTaughtLanguage} removeEntry={removeTaughtLanguage}/>
                    ))}
                  </div>
                  <button type="button" onClick={addTaughtLanguage} className="mt-4 flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/80 transition-all duration-500 cursor-pointer">
                    <Plus className="w-5 h-5 mr-1" /> Add Language
                  </button>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-text-primary border-b border-slate-400 pb-2 mb-4">Qualifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelectDropdown label="Academic Degrees" name="academicDegrees" selectedValues={formData.academicDegrees} onChange={handleChange} icon={GraduationCap} options={ACADEMIC_DEGREES_OPTIONS} required/>
                    <MultiSelectDropdown label="Teaching Certifications" name="teachingCertifications" selectedValues={formData.teachingCertifications} onChange={handleChange} icon={CheckCircle} options={TEACHING_CERTIFICATIONS_OPTIONS} required/>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-text-primary border-b border-slate-400 pb-2 mb-4">Specialization & Format</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelectDropdown label="Exam Preparation Expertise" name="examExpertise" selectedValues={formData.examExpertise} onChange={handleChange} icon={Clock} options={EXAM_EXPERTISE_OPTIONS}/>
                    <MultiSelectDropdown label="Teaching Methodologies" name="teachingMethodologies" selectedValues={formData.teachingMethodologies} onChange={handleChange} icon={BookOpen} options={TEACHING_METHODOLOGIES_OPTIONS}/>
                    <div className="md:col-span-2">
                      <MultiSelectDropdown label="Preferred Teaching Format" name="teachingFormat" selectedValues={formData.teachingFormat} onChange={handleChange} icon={User} options={TEACHING_FORMAT_OPTIONS} required/>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4">
                  <h2 className="text-2xl font-bold text-text-primary border-b border-slate-400 pb-2 mb-4 flex items-center"><FileText className="w-6 h-6 mr-2 text-secondary" />
                  Terms and Conditions
                  </h2>
                  <div className="p-4 rounded-xl border border-primary space-y-4">
                    <div className="flex items-start">
                      <input id="agreedToTerms" name="agreedToTerms" type="checkbox" checked={formData.agreedToTerms} onChange={handleChange} required
                       className="h-5 w-5 accent-secondary cursor-pointer"/>
                      <label htmlFor="agreedToTerms" className="ml-3 text-sm font-medium text-text-secondary">
                        I agree to the{" "}
                        <Link to="/teacher-tc" target="_blank" className="text-text-primary hover:text-primary/80 underline font-semibold">Terms of Service and Privacy Policy.</Link>
                         <span className="text-red-500">*</span>
                      </label>
                    </div>
                    <div className="flex items-start">
                      <input id="agreedToVerification" name="agreedToVerification" type="checkbox" checked={formData.agreedToVerification} onChange={handleChange} required
                        className="h-5 w-5 accent-secondary cursor-pointer"/>
                      <label htmlFor="agreedToVerification" className="ml-3 text-sm font-medium text-text-secondary" >
                        I agree to share my documents and certifications upon request for verification.
                        <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <MessageBlock />

              <button type="submit" disabled={isSubmitting}
              className={`mt-8 w-full flex items-center justify-center cursor-pointer p-4 text-base font-medium rounded-md transition-all duration-500 text-white ${isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-primary hover:bg-primary/80"}`}>
                {isSubmitting ? "Processing..." : "Submit Profile"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherForm;
