import { User, Mail, Phone } from "lucide-react";

const EditProfileForm = ({ formData, setFormData, onSubmit, teacherData }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 flex flex-col">

      <Info icon={<User />} label="Name" placeholder={teacherData.name} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>
      <Info icon={<Mail />} label="Email" placeholder={teacherData.email} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
      <Info icon={<Phone />} label="Password" placeholder={teacherData.password} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}/>
      

      <button type="submit" className="mx-auto bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/80 cursor-pointer transition-all duration-700">Save Changes</button>
    </form>
  );
};

const Info = ({ icon, label, value, placeholder, onChange, type = "text" }) => (
  <div className="flex items-center gap-3 border border-slate-200 p-3 rounded-md">
    <span className="text-secondary">{icon}</span>
    <div className="flex flex-col">
      <label className="text-sm">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={onChange} className="font-semibold outline-none"/>
    </div>
  </div>
);

export default EditProfileForm;