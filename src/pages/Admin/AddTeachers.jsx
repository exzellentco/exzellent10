import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, User, BookOpen, Clock, CheckCircle, GraduationCap, XCircle, 
  ChevronDown, Plus, Minus, Globe, FileText, Lock, Eye, EyeOff, Camera 
} from 'lucide-react';
import { uploadTeacherImage, createAdminTeacher } from '../../APIs/AdminAddTechers';
import DashboardShell from '../../components/DashboardShell';

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

const LANGUAGES_TAUGHT_OPTIONS = ["German", "Spanish"];

const YEARS_EXPERIENCE_OPTIONS = ["0-1", "1-3", "3-5", "5-8", "8-12", "12+"];

const ACADEMIC_DEGREES_OPTIONS = ["Bachelor's in Education (B.Ed.)", "Master's in Education (M.Ed.)", "Bachelor's in Linguistics", "Master's in Linguistics", 
  "Bachelor's in Applied Linguistics", "Master's in Applied Linguistics", "Bachelor's in Language Studies", "Master's in Language Studies", 
  "Bachelor's in Translation & Interpretation", "Master's in Translation & Interpretation", "PGCE", "Other"];

const TEACHING_CERTIFICATIONS_OPTIONS = ["DaF (Deutsch als Fremdsprache)", "DaZ (Deutsch als Zweitsprache)", "BAMF Zulassung", "Goethe-Institut Teacher Training", 
  "TELC Trainer Certification", "ÖSD Teacher Qualification", "ELE (Español como Lengua Extranjera)", "Instituto Cervantes Certification", "DELE Examiner Accreditation",
  "SIELE Examiner / Trainer Certification", "Other"];

const CEFR_LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const PROFICIENCY_CERTIFICATIONS_OPTIONS = ["Goethe-Zertifikat", "TELC", "TestDaF", "DSH","DELE", "SIELE", "Other"];

const EXAM_EXPERTISE_OPTIONS = ["Goethe Exams", "TELC Exams", "TestDaF", "DSH", "DELE", "SIELE"];

const TEACHING_METHODOLOGIES_OPTIONS = ["Communicative Language Teaching (CLT)", "Task-Based Language Teaching (TBLT)", 
  "Exam-Oriented Training", "CEFR-Aligned Instruction", "Immersive Learning", "Online / Remote Teaching", "AI-Assisted Language Learning", "Curriculum Design", "Other"];

const TEACHING_FORMAT_OPTIONS = ["1:1 Online", "Group Online", "In-Person", "Hybrid"];

const AVAILABILITY_OPTIONS = ["Immediately", "Within 1 Month", "Within 3 Months", "Within 6 Months", "Later than 6 Months"];

const ALL_COUNTRIES = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", 
  "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", 
  "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)", "Congo (Kinshasa)", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", 
  "Czechia", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", 
  "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", 
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", 
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", 
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", 
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", 
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", 
  "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", 
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", 
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", 
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", 
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", 
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];


const InputField = ({ label, name, value, onChange, icon: Icon, type = 'text', placeholder, required = false, disabled = false, showPassword, togglePassword }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />}
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        name={name}
        id={name}
        value={value}
        onChange={disabled ? undefined : onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className={`ex-input ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{ paddingLeft: 40, paddingRight: 44 }}
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, icon: Icon, options, placeholder, required = false }) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-text-secondary">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />}
      <select name={name} id={name} value={value} onChange={onChange} required={required}
        className="ex-input appearance-none cursor-pointer" style={{ paddingLeft: 40, paddingRight: 40 }}>
        <option value="" disabled hidden>{placeholder}</option>
        {options.map(option => (<option key={option} value={option}>{option}</option>))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
    </div>
  </div>
);

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <div className="flex flex-col h-full py-5 md:py-0">
    <div className="flex items-center justify-between p-3 rounded-xl h-full" style={{ border: "1px solid var(--ex-line)", background: "rgba(255,255,255,.03)" }}>
      <label htmlFor={name} className="text-sm font-medium cursor-pointer pr-4" style={{ color: "var(--ex-muted)" }}>{label}</label>
      <button type="button" id={name} name={name} onClick={() => onChange({ target: { name, value: !checked } })} role="switch" aria-checked={checked}
        className={`relative inline-flex h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-all duration-500
        ${checked ? 'bg-secondary' : 'bg-slate-600'}`}>
        <span aria-hidden="true" className={`h-5 w-5 rounded-full bg-white transition-all duration-500 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  </div>
);

const MultiSelectDropdown = ({ label, name, options, selectedValues = [], onChange, icon: Icon, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const safeSelected = Array.isArray(selectedValues) ? selectedValues : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (option) => {
    const newValues = safeSelected.includes(option)
      ? safeSelected.filter(v => v !== option)
      : [...safeSelected, option];
    onChange({ target: { name, value: newValues } });
  };

  const displayLabel = safeSelected.length === 0
    ? `Select ${label}`
    : safeSelected.length === 1
      ? safeSelected[0]
      : `${safeSelected.length} selected`;

  return (
    <div className="space-y-1" ref={dropdownRef}>
      <label className="block text-sm font-medium text-text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary" />}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="ex-input flex items-center justify-between cursor-pointer" style={{ paddingLeft: 40 }}
        >
          <span className="truncate" style={{ color: "var(--ex-text)" }}>{displayLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} style={{ color: "var(--pL)" }} />
        </button>

        {isOpen && (
          <div className="absolute mt-1 w-full rounded-xl max-h-60 overflow-y-auto z-50" style={{ background: "var(--ex-surface)", border: "1px solid var(--ex-line)" }}>
            <ul role="listbox">
              {options.map((option) => {
                const isSelected = safeSelected.includes(option);
                return (
                  <li
                    key={option}
                    onClick={() => handleToggle(option)}
                    className="p-3 text-sm cursor-pointer flex items-center justify-between transition-colors"
                    style={{ background: isSelected ? "rgba(var(--pRGB),.14)" : "transparent", color: isSelected ? "var(--pL)" : "var(--ex-muted)" }}
                  >
                    <span>{option}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {required && safeSelected.length === 0 && (
        <input type="text" className="hidden" required tabIndex="-1" value="" onChange={() => {}} />
      )}
    </div>
  );
};

const TaughtLanguageEntry = ({ index, entry, updateEntry, removeEntry }) => {
  const handleEntryChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    updateEntry(index, name, newValue);
  };

  return (
    <div className="ex-card space-y-4">
      <div className="flex justify-between items-center pb-2" style={{ borderBottom: "1px solid var(--ex-line)" }}>
        <h3 className="font-semibold" style={{ color: "var(--pL)" }}>Language Entry #{index + 1}</h3>
        <button type="button" onClick={() => removeEntry(index)} className="text-secondary hover:text-red-700">
          <Minus className="w-7 h-7" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Language" name="language" value={entry.language} onChange={handleEntryChange} icon={BookOpen} options={LANGUAGES_TAUGHT_OPTIONS} placeholder="Select Language" required />
        <SelectField label="CEFR Level" name="cefr_level" value={entry.cefr_level} onChange={handleEntryChange} icon={GraduationCap} options={CEFR_LEVEL_OPTIONS} placeholder="Select CEFR Level" />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-secondary">Native Speaker Status</label>
          <ToggleSwitch label="Native Speaker" name="isNative" checked={entry.isNative} onChange={handleEntryChange} />
        </div>
      </div>
      <MultiSelectDropdown label="Language Proficiency Certifications" name="certifications" selectedValues={entry.certifications || []} onChange={handleEntryChange} icon={CheckCircle} options={PROFICIENCY_CERTIFICATIONS_OPTIONS} />
    </div>
  );
};

const AddTeachers = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    countryOfResidence: '',
    yearsExperience: '',
    availableFrom: '',
    profileImage: '',
    academicDegrees: [],
    teachingCertifications: [],
    examExpertise: [],
    teachingMethodologies: [],
    teachingFormat: [],
    taughtLanguages: [{ language: '', cefr_level: '', certifications: [], isNative: false }],
    agreedToTerms: true,
    agreedToVerification: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const passwordsMatch = formData.password === formData.confirmPassword || !formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password') {
      if (value && !validatePassword(value)) {
        setPasswordError("Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&).");
      } else {
        setPasswordError('');
      }
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to backend
  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const response = await uploadTeacherImage(file);
      setUploading(false);
      return response.url || response.imageUrl || response.data?.url;
    } catch (error) {
      setUploading(false);
      setResponseMessage("Failed to upload image. Please try again.");
      console.error("Upload error:", error);
      return null;
    }
  };

  const addTaughtLanguage = () => {
    setFormData(prev => ({
      ...prev,
      taughtLanguages: [...prev.taughtLanguages, { language: '', cefr_level: '', certifications: [], isNative: false }]
    }));
  };

  const removeTaughtLanguage = (index) => {
    setFormData(prev => ({
      ...prev,
      taughtLanguages: prev.taughtLanguages.filter((_, i) => i !== index)
    }));
  };

  const updateTaughtLanguage = (index, name, value) => {
    setFormData(prev => ({
      ...prev,
      taughtLanguages: prev.taughtLanguages.map((entry, i) =>
        i === index ? { ...entry, [name]: value } : entry
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setResponseMessage('');
    setIsSuccess(false);

    // Basic validations
    if (!formData.email) {
      setResponseMessage("Email is required.");
      setIsSubmitting(false);
      return;
    }
    if (!formData.password) {
      setResponseMessage("Password is required.");
      setIsSubmitting(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setResponseMessage("Password must be 8+ characters with uppercase, lowercase, number, and special character (@$!%*?&).");
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setResponseMessage("Passwords do not match.");
      setIsSubmitting(false);
      return;
    }

    if (formData.taughtLanguages.length === 0) {
      setResponseMessage("Please add at least one language the teacher will teach.");
      setIsSubmitting(false);
      return;
    }
    if (formData.taughtLanguages.some(l => !l.language)) {
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
      let profileImageUrl = formData.profileImage;

      // Upload image if file is selected
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile);
        if (!profileImageUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      let yearsExperienceNum = 0;
      if (formData.yearsExperience) {
        const match = formData.yearsExperience.match(/^(\d+)-/);
        yearsExperienceNum = match ? parseInt(match[1], 10) : (formData.yearsExperience === "12+" ? 12 : 0);
      }

      const now = new Date();
      let availableFromDate = new Date();
      switch (formData.availableFrom) {
        case "Within 1 Month": availableFromDate.setMonth(now.getMonth() + 1); break;
        case "Within 3 Months": availableFromDate.setMonth(now.getMonth() + 3); break;
        case "Within 6 Months": availableFromDate.setMonth(now.getMonth() + 6); break;
        case "Later than 6 Months": availableFromDate.setMonth(now.getMonth() + 7); break;
        default: availableFromDate = now;
      }

      const submissionData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        countryOfResidence: formData.countryOfResidence,
        yearsExperience: yearsExperienceNum,
        availableFrom: availableFromDate.toISOString(),
        profileImage: profileImageUrl,
        academicDegrees: formData.academicDegrees,
        teachingCertifications: formData.teachingCertifications,
        examExpertise: formData.examExpertise,
        teachingMethodologies: formData.teachingMethodologies,
        teachingFormat: formData.teachingFormat,
        taughtLanguages: formData.taughtLanguages.map(lang => ({
          language: lang.language,
          cefr_level: lang.cefr_level || null,
          certifications: lang.certifications || [],
          isNative: lang.isNative
        })),
        agreedToTerms: true,
        agreedToVerification: true,
      };

      await createAdminTeacher(submissionData);

      setIsSuccess(true);
      setResponseMessage("Teacher account and profile created successfully. The teacher can log in immediately.");
    } catch (error) {
      setIsSuccess(false);
      setResponseMessage(error.message || "Failed to create teacher. Please check the data and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const MessageBlock = () => {
    if (!responseMessage) return null;
    const Icon = isSuccess ? CheckCircle : XCircle;
    const colorClass = isSuccess ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700';

    return (
      <div className={`mt-6 p-4 border rounded-xl flex items-start space-x-3 ${colorClass}`}>
        <Icon className="w-6 h-6 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium">{responseMessage}</p>
      </div>
    );
  };

  return (
    <DashboardShell
      role="admin"
      eyebrow="Admin · Teachers"
      title={<>Add a new <span className="ex-g">teacher</span></>}
      lead="Create a complete teacher profile (admin mode)."
    >
      <div className="ex-card" style={{ maxWidth: 920, margin: "0 auto" }}>
        {isSuccess ? (
          <div className="text-center" style={{ padding: 32 }}>
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--pL)" }} />
            <h2 style={{ fontFamily: "var(--ex-font)", fontWeight: 700, fontSize: "1.5rem" }}>Teacher created successfully!</h2>
            <p className="ex-lead" style={{ margin: "8px auto 24px" }}>{responseMessage}</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/teachers')} className="ex-btn ex-btn-primary">Back to teachers list</button>
              <button onClick={() => window.location.reload()} className="ex-btn ex-btn-ghost">Add another teacher</button>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="space-y-10">
                <section>
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4" style={{fontFamily:"var(--ex-font)",color:"var(--ex-text)",borderColor:"var(--ex-line)"}}>Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="First Name" name="firstName" placeholder="Enter first name" value={formData.firstName} onChange={handleChange} icon={User} required />
                    <InputField label="Last Name" name="lastName" placeholder="Enter last name" value={formData.lastName} onChange={handleChange} icon={User} required />
                    <InputField label="Email" name="email" placeholder="teacher@example.com" value={formData.email} onChange={handleChange} icon={Mail} required />

                    <InputField label="Password" name="password" placeholder="********" type="password" value={formData.password} onChange={handleChange} icon={Lock}
                      required showPassword={showPassword} togglePassword={() => setShowPassword(!showPassword)}/>

                    <InputField label="Confirm Password" name="confirmPassword" placeholder="********" type="password" value={formData.confirmPassword}
                      onChange={handleChange} icon={Lock} required showPassword={showConfirmPassword} togglePassword={() => setShowConfirmPassword(!showConfirmPassword)}/>

                    <div className="col-span-3 -mt-2">
                      {formData.confirmPassword && (
                        <p className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                      {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                    </div>

                    <SelectField label="Country of Residence" name="countryOfResidence" value={formData.countryOfResidence} onChange={handleChange} icon={Globe} options={ALL_COUNTRIES} placeholder="Select country" required />
                    <SelectField label="Years of Experience" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} icon={Clock} options={YEARS_EXPERIENCE_OPTIONS} placeholder="Select range" required />
                    <SelectField label="Available From" name="availableFrom" value={formData.availableFrom} onChange={handleChange} icon={Clock} options={AVAILABILITY_OPTIONS} placeholder="Select availability" required />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4" style={{fontFamily:"var(--ex-font)",color:"var(--ex-text)",borderColor:"var(--ex-line)"}}>Profile Image</h2>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-text-secondary">Upload Profile Image</label>
                      <div className="flex flex-col space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 cursor-pointer"
                        />

                        <div className="flex items-center">
                          <hr className="flex-1 border-slate-300" />
                          <span className="px-3 text-text-secondary text-sm">OR</span>
                          <hr className="flex-1 border-slate-300" />
                        </div>

                        <InputField
                          label=""
                          name="profileImage"
                          value={formData.profileImage}
                          onChange={handleChange}
                          placeholder="Profile Image URL"
                          icon={Camera}
                        />
                      </div>

                      {(imagePreview || formData.profileImage) && (
                        <div className="flex justify-center mt-4">
                          <img
                            src={imagePreview || formData.profileImage}
                            alt="Profile Preview"
                            className="w-32 h-32 rounded-full object-cover border-4 border-secondary"
                          />
                        </div>
                      )}

                      {uploading && (
                        <p className="text-sm text-primary text-center">Uploading image...</p>
                      )}
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4" style={{fontFamily:"var(--ex-font)",color:"var(--ex-text)",borderColor:"var(--ex-line)"}}>Language Expertise</h2>
                  <div className="space-y-6">
                    {formData.taughtLanguages.map((entry, index) => (
                      <TaughtLanguageEntry key={index} index={index} entry={entry} updateEntry={updateTaughtLanguage} removeEntry={removeTaughtLanguage} />
                    ))}
                  </div>
                  <button type="button" onClick={addTaughtLanguage} className="mt-4 flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/80 transition-all duration-500">
                    <Plus className="w-5 h-5 mr-1" /> Add Language
                  </button>
                </section>

                <section>
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4" style={{fontFamily:"var(--ex-font)",color:"var(--ex-text)",borderColor:"var(--ex-line)"}}>Qualifications</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelectDropdown label="Academic Degrees" name="academicDegrees" selectedValues={formData.academicDegrees} onChange={handleChange} icon={GraduationCap} options={ACADEMIC_DEGREES_OPTIONS} required />
                    <MultiSelectDropdown label="Teaching Certifications" name="teachingCertifications" selectedValues={formData.teachingCertifications} onChange={handleChange} icon={CheckCircle} options={TEACHING_CERTIFICATIONS_OPTIONS} required />
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-bold border-b pb-2 mb-4" style={{fontFamily:"var(--ex-font)",color:"var(--ex-text)",borderColor:"var(--ex-line)"}}>Specialization & Format</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MultiSelectDropdown label="Exam Preparation Expertise" name="examExpertise" selectedValues={formData.examExpertise} onChange={handleChange} icon={Clock} options={EXAM_EXPERTISE_OPTIONS} />
                    <MultiSelectDropdown label="Teaching Methodologies" name="teachingMethodologies" selectedValues={formData.teachingMethodologies} onChange={handleChange} icon={BookOpen} options={TEACHING_METHODOLOGIES_OPTIONS} />
                    <div className="md:col-span-2">
                      <MultiSelectDropdown label="Preferred Teaching Format" name="teachingFormat" selectedValues={formData.teachingFormat} onChange={handleChange} icon={User} options={TEACHING_FORMAT_OPTIONS} required />
                    </div>
                  </div>
                </section>

                <section className="mt-8 pt-4">
                  <h2 className="text-2xl font-bold text-primary border-b border-slate-400 pb-2 mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-2 text-secondary" /> Terms & Verification
                  </h2>
                  <div className="p-4 rounded-xl border border-primary space-y-4 bg-slate-50">
                    <div className="flex items-start">
                      <input
                        id="agreedToTerms"
                        name="agreedToTerms"
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-5 w-5 accent-secondary cursor-not-allowed"
                      />
                      <label htmlFor="agreedToTerms" className="ml-3 text-sm font-medium text-text-secondary">
                        Terms of Service and Privacy Policy accepted (admin action)
                      </label>
                    </div>
                    <div className="flex items-start">
                      <input
                        id="agreedToVerification"
                        name="agreedToVerification"
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-5 w-5 accent-secondary cursor-not-allowed"
                      />
                      <label htmlFor="agreedToVerification" className="ml-3 text-sm font-medium text-text-secondary">
                        Verification consent granted (admin action)
                      </label>
                    </div>
                  </div>
                </section>
              </div>

              <MessageBlock />

              <button
                type="submit"
                disabled={isSubmitting || uploading}
                className="ex-btn ex-btn-primary w-full"
                style={{ marginTop: 32 }}
              >
                {uploading ? 'Uploading image…' : isSubmitting ? 'Creating teacher…' : 'Create teacher account'}
              </button>
            </form>
          </>
        )}
      </div>
    </DashboardShell>
  );
};

export default AddTeachers;