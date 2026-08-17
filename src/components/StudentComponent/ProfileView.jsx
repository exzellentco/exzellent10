import React from 'react';

const ProfileView = ({ studentData, formatDate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Name</label>
          <p className="text-lg font-semibold text-text-secondary">{studentData.name}</p>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Gender</label>
          <p className="text-lg font-semibold text-text-secondary">{studentData.gender}</p>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Phone</label>
          <p className="text-lg font-semibold text-text-secondary">{studentData.phone}</p>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-text-secondary">Date of Birth</label>
          <p className="text-lg font-semibold text-text-secondary">
            {formatDate(studentData.dateOfBirth)}
          </p>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Member Since</label>
          <p className="text-lg font-semibold text-text-secondary">
            {formatDate(studentData.createdAt)}
          </p>
        </div>
        <div>
          <label className="text-sm text-text-secondary">Subscription Status</label>
          <p className={`text-lg font-semibold ${studentData.paid ? "text-green-600" : "text-red-600"}`}>
            {studentData.paid ? "Premium Member" : "Free Member"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;