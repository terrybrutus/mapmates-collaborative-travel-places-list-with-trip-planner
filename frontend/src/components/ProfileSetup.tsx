import React, { useState } from 'react';
import { useSaveUserProfile } from '../hooks/useQueries';

export default function ProfileSetup() {
  const [name, setName] = useState('');
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      try {
        await saveProfile.mutateAsync({ name: name.trim() });
      } catch (error) {
        console.error('Failed to save profile:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-600">Let's set up your profile to get started</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveProfile.isPending ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
