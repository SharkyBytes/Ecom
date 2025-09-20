import React from 'react';
import PropTypes from 'prop-types';

const UserProfile = ({ user }) => {
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center text-gray-500">
          <p>User information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 w-full max-w-2xl mx-auto">
      {/* Header with Avatar and Name */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
        <div className="flex-shrink-0">
          <img
            src={user.avatar}
            alt={`${user.name}'s avatar`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=b282a4&color=ffffff&size=150`;
            }}
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-primary mb-2">{user.name}</h2>
          <p className="text-xs sm:text-sm text-gray-600">ID: {user.id}</p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 sm:space-y-4">
        <h3 className="text-base sm:text-lg font-semibold text-primary border-b border-primary pb-2">
          Contact Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-black break-all">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-black">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-5 h-5 mt-0.5">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="text-black leading-relaxed">{user.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      {user.interests && user.interests.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-primary border-b border-primary pb-2 mb-3">
            Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {user.interests.map((interest, index) => (
              <span
                key={index}
                className="inline-block bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary border-opacity-30"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

UserProfile.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string)
  })
};

UserProfile.defaultProps = {
  user: null
};

export default UserProfile;