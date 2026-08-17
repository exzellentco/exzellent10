import React from "react";

const EditProfileForm = ({ formData, setFormData, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm text-text-secondary mb-1">Name</label>
          <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-border text-white rounded-xl focus:ring-2 focus:ring-tertiary" required/>
        </div>
        <div>
          <label className="block text-sm text-text-secondary mb-1">Phone</label>
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-border text-white rounded-xl focus:ring-2 focus:ring-tertiary " required/>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="p-3 bg-gradient-to-r from-blue-800 to-primary text-white rounded-xl hover:opacity-80 transition-all duration-700 cursor-pointer hover:scale-105">Save Changes</button>
      </div>
    </form>
  );
};

export default EditProfileForm;
